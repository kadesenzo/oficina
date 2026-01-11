
import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Trash2, 
  Wrench, 
  Package, 
  ChevronLeft,
  Printer,
  X,
  PlusCircle,
  FileText,
  Clock,
  CheckCircle2,
  Car,
  User,
  Search,
  ChevronRight,
  ImageIcon,
  Loader2,
  Download
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Client, Vehicle, OSItem, OSStatus, ServiceOrder, PaymentStatus, UserSession } from '../types';
import html2canvas from 'html2canvas';

interface NewServiceOrderProps {
  session?: UserSession;
  syncData?: (key: string, data: any) => Promise<void>;
}

const NewServiceOrder: React.FC<NewServiceOrderProps> = ({ session, syncData }) => {
  const navigate = useNavigate();
  const invoiceRef = useRef<HTMLDivElement>(null);
  
  // Data States
  const [clients, setClients] = useState<Client[]>([]);
  const [allVehicles, setAllVehicles] = useState<Vehicle[]>([]);
  
  // Selection States
  const [clientSearch, setClientSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientVehicles, setClientVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  
  // OS Details States
  const [currentKm, setCurrentKm] = useState('');
  const [problem, setProblem] = useState('');
  const [items, setItems] = useState<OSItem[]>([]);
  const [labor, setLabor] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(PaymentStatus.PENDENTE);
  
  // UI States
  const [showInvoice, setShowInvoice] = useState(false);
  const [osData, setOsData] = useState<ServiceOrder | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  useEffect(() => {
    if (session) {
      // Busca centralizada no escopo do usuário
      const userClients = JSON.parse(localStorage.getItem(`kaenpro_${session.username}_clients`) || '[]');
      const userVehicles = JSON.parse(localStorage.getItem(`kaenpro_${session.username}_vehicles`) || '[]');
      setClients(userClients);
      setAllVehicles(userVehicles);
    }
  }, [session]);

  const handleSelectClient = (client: Client) => {
    setSelectedClient(client);
    setClientSearch('');
    setSelectedVehicle(null);
    // Filtragem precisa de veículos do cliente
    const vehicles = allVehicles.filter(v => v.clientId === client.id);
    setClientVehicles(vehicles);
  };

  const handleVehicleChange = (vehicleId: string) => {
    const vehicle = clientVehicles.find(v => v.id === vehicleId) || null;
    setSelectedVehicle(vehicle);
    if (vehicle) setCurrentKm(vehicle.km.toString());
  };

  const addItem = (type: 'PART' | 'SERVICE') => {
    const newItem: OSItem = {
      id: Math.random().toString(36).substr(2, 9),
      description: '',
      quantity: 1,
      unitPrice: 0,
      type
    };
    setItems([...items, newItem]);
  };

  const updateItem = (id: string, field: keyof OSItem, value: any) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const calculateTotal = () => {
    const itemsTotal = items.reduce((acc, curr) => {
      const q = Number(curr.quantity) || 0;
      const p = Number(curr.unitPrice) || 0;
      return acc + (q * p);
    }, 0);
    const lab = Number(labor) || 0;
    const disc = Number(discount) || 0;
    return Math.max(0, itemsTotal + lab - disc);
  };

  const handleFinalize = async () => {
    if (!selectedClient || !selectedVehicle || !session || !syncData) {
      alert("⚠️ ERRO CRÍTICO: Selecione o Cliente e o Veículo antes de gerar a nota.");
      return;
    }

    const newOs: ServiceOrder = {
      id: Math.random().toString(36).substr(2, 9),
      osNumber: `KP-${Date.now().toString().slice(-6)}`,
      clientId: selectedClient.id,
      clientName: selectedClient.name,
      vehicleId: selectedVehicle.id,
      vehiclePlate: selectedVehicle.plate,
      vehicleModel: selectedVehicle.model,
      vehicleKm: currentKm,
      problem,
      items,
      laborValue: labor,
      discount,
      totalValue: calculateTotal(),
      status: OSStatus.FINALIZADO,
      paymentStatus: paymentStatus,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const existing = JSON.parse(localStorage.getItem(`kaenpro_${session.username}_orders`) || '[]');
    const updatedOrders = [...existing, newOs];
    
    // Sincronização obrigatória
    await syncData('orders', updatedOrders);

    // Atualiza KM do veículo globalmente
    const updatedVehicles = allVehicles.map(v => 
      v.id === selectedVehicle.id ? { ...v, km: parseFloat(currentKm) || v.km } : v
    );
    await syncData('vehicles', updatedVehicles);

    setOsData(newOs);
    setShowInvoice(true);
  };

  const downloadAsImage = async () => {
    if (!invoiceRef.current) return;
    setIsGeneratingImage(true);
    try {
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false
      });
      const link = document.createElement('a');
      link.download = `Nota_${osData?.osNumber}_${osData?.clientName.replace(/\s+/g, '_')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error("Erro ao gerar imagem:", err);
      alert("Erro ao gerar imagem da nota.");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const filteredClients = clientSearch.length > 0 
    ? clients.filter(c => 
        c.name.toLowerCase().includes(clientSearch.toLowerCase()) || 
        c.phone.includes(clientSearch) ||
        (c.document && c.document.includes(clientSearch))
      )
    : [];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-32 animate-in slide-in-from-bottom duration-500">
      <div className="flex items-center justify-between no-print px-4 md:px-0 mt-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors">
          <ChevronLeft size={20} />
          <span className="font-black uppercase text-[10px] tracking-widest">Painel Anterior</span>
        </button>
        <div className="text-right">
          <h1 className="text-2xl font-black text-white italic uppercase tracking-tighter">Gerar <span className="text-[#E11D48]">Nota Fiscal</span></h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 no-print px-4 md:px-0">
        <div className="lg:col-span-2 space-y-6">
          
          {/* SELETOR DE CLIENTE (CORRIGIDO) */}
          <div className="bg-[#0F0F0F] border border-[#1F1F1F] p-8 rounded-[2.5rem] shadow-2xl space-y-6 relative overflow-visible">
            {!selectedClient ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Buscar Proprietário</label>
                  <span className="text-[8px] font-black text-[#E11D48] uppercase tracking-widest">Base Sincronizada</span>
                </div>
                <div className="relative">
                   <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-700" size={20} />
                   <input 
                    type="text" 
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    placeholder="NOME, TELEFONE OU CPF..."
                    className="w-full bg-[#050505] border-2 border-[#1F1F1F] rounded-[2rem] pl-16 pr-6 py-6 text-white font-black outline-none focus:border-[#E11D48] transition-all uppercase placeholder-zinc-800"
                   />
                </div>
                
                {filteredClients.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-4 bg-[#0F0F0F] border border-[#1F1F1F] rounded-[2.5rem] overflow-hidden z-[100] shadow-2xl max-h-[300px] overflow-y-auto no-scrollbar">
                    {filteredClients.map(c => (
                      <button 
                        key={c.id} 
                        onClick={() => handleSelectClient(c)}
                        className="w-full p-6 flex items-center justify-between hover:bg-[#E11D48] border-b border-[#1F1F1F] text-left group transition-all"
                      >
                        <div>
                          <p className="font-black text-white uppercase group-hover:text-white">{c.name}</p>
                          <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest group-hover:text-white/70">{c.phone}</p>
                        </div>
                        <ChevronRight size={18} className="text-[#E11D48] group-hover:text-white" />
                      </button>
                    ))}
                  </div>
                )}
                
                {clientSearch.length > 1 && filteredClients.length === 0 && (
                  <div className="p-10 text-center bg-zinc-950/50 rounded-[2rem] border-2 border-dashed border-zinc-800 animate-in fade-in">
                    <p className="text-zinc-600 font-black text-[10px] uppercase tracking-widest italic">Nenhum cliente encontrado com "{clientSearch}"</p>
                    <button onClick={() => navigate('/clients')} className="mt-4 text-[#E11D48] text-[10px] font-black uppercase tracking-[0.2em] hover:underline">Cadastrar Novo no Sistema</button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex items-center justify-between p-6 bg-[#050505] border border-zinc-800 rounded-[2rem]">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#E11D48]/10 text-[#E11D48] rounded-xl flex items-center justify-center border border-[#E11D48]/20">
                      <User size={24} />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Cliente Carregado</p>
                      <h3 className="text-lg font-black text-white uppercase italic tracking-tighter">{selectedClient.name}</h3>
                    </div>
                  </div>
                  <button onClick={() => setSelectedClient(null)} className="p-3 bg-zinc-900 rounded-xl text-zinc-500 hover:text-white active:scale-90 transition-all">
                    <X size={20}/>
                  </button>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Selecione o Veículo Correspondente</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {clientVehicles.map(v => (
                      <button 
                        key={v.id}
                        onClick={() => handleVehicleChange(v.id)}
                        className={`p-6 rounded-[2rem] border-2 text-left transition-all active:scale-95 ${selectedVehicle?.id === v.id ? 'bg-[#E11D48]/10 border-[#E11D48] shadow-xl active-glow' : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}
                      >
                        <Car size={20} className={`mb-3 ${selectedVehicle?.id === v.id ? 'text-[#E11D48]' : 'text-zinc-800'}`} />
                        <p className={`font-black uppercase tracking-[0.2em] text-sm ${selectedVehicle?.id === v.id ? 'text-white' : 'text-zinc-400'}`}>{v.plate}</p>
                        <p className="text-[9px] font-black uppercase opacity-60 tracking-widest">{v.model}</p>
                      </button>
                    ))}
                    <button 
                      onClick={() => navigate(`/clients/${selectedClient.id}`)}
                      className="p-6 rounded-[2rem] border-2 border-dashed border-zinc-800 text-zinc-700 hover:text-white hover:border-zinc-600 transition-all flex flex-col items-center justify-center gap-2 group"
                    >
                      <PlusCircle size={24} className="group-hover:text-[#E11D48] transition-colors" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Vincular Nova Máquina</span>
                    </button>
                  </div>
                </div>

                {selectedVehicle && (
                  <div className="pt-6 border-t border-zinc-900 animate-in slide-in-from-top duration-300">
                    <label className="text-[10px] font-black text-[#E11D48] uppercase tracking-[0.2em] mb-4 block ml-1 italic">Quilometragem no Ato da Nota</label>
                    <input 
                      type="number" 
                      inputMode="numeric"
                      value={currentKm}
                      onChange={(e) => setCurrentKm(e.target.value)}
                      className="w-full bg-[#050505] border-2 border-[#1F1F1F] rounded-2xl px-6 py-6 text-3xl font-black text-white focus:border-[#E11D48] outline-none shadow-inner"
                      placeholder="000.000"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ITENS E SERVIÇOS */}
          {selectedVehicle && (
            <div className="space-y-6 animate-in slide-in-from-bottom duration-500">
              <div className="bg-[#0F0F0F] border border-[#1F1F1F] p-8 rounded-[2.5rem] shadow-xl space-y-6">
                 <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] flex items-center gap-2 italic">
                  <Wrench size={16} className="text-[#E11D48]" /> Parecer Técnico Geral
                 </h3>
                 <textarea 
                   value={problem}
                   onChange={(e) => setProblem(e.target.value)}
                   rows={3}
                   placeholder="DETALHE AQUI OS SERVIÇOS EXECUTADOS..."
                   className="w-full bg-[#050505] border-2 border-[#1F1F1F] rounded-[2rem] p-6 text-sm text-white focus:border-[#E11D48] outline-none font-bold placeholder-zinc-800"
                 />
              </div>

              <div className="bg-[#0F0F0F] border border-[#1F1F1F] p-8 rounded-[2.5rem] shadow-xl space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] flex items-center gap-2 italic">
                    <Package size={16} className="text-[#E11D48]" /> Detalhamento de Itens
                  </h3>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => addItem('PART')}
                      className="bg-zinc-800 text-white px-4 py-2 rounded-xl hover:bg-[#E11D48] transition-all flex items-center gap-2"
                    >
                      <Plus size={16} /> <span className="text-[8px] font-black uppercase tracking-widest">Add Peça</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {items.map(item => (
                    <div key={item.id} className="flex flex-col sm:flex-row gap-4 p-5 bg-[#050505] border border-zinc-900 rounded-[2rem] items-center animate-in zoom-in duration-300">
                      <div className="w-full sm:flex-1">
                        <input 
                          type="text" 
                          placeholder="DESCRIÇÃO DA PEÇA..."
                          value={item.description}
                          onChange={(e) => updateItem(item.id, 'description', e.target.value.toUpperCase())}
                          className="w-full bg-transparent border-b border-zinc-900 py-2 text-sm text-white font-bold outline-none focus:border-[#E11D48] uppercase" 
                        />
                      </div>
                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className="flex flex-col gap-1 items-center">
                          <span className="text-[8px] font-black text-zinc-800 uppercase">Qtd</span>
                          <input 
                            type="number" 
                            inputMode="numeric"
                            value={item.quantity}
                            onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
                            className="w-16 bg-zinc-900 border border-zinc-800 rounded-xl py-3 text-center text-xs font-black" 
                          />
                        </div>
                        <div className="flex flex-col gap-1 items-center">
                          <span className="text-[8px] font-black text-zinc-800 uppercase">Preço Un.</span>
                          <input 
                            type="number" 
                            inputMode="decimal"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(item.id, 'unitPrice', e.target.value)}
                            className="w-24 bg-zinc-900 border border-zinc-800 rounded-xl py-3 text-center text-xs font-black" 
                          />
                        </div>
                        <button onClick={() => removeItem(item.id)} className="p-3 text-zinc-800 hover:text-red-500 transition-colors"><Trash2 size={20} /></button>
                      </div>
                    </div>
                  ))}
                  {items.length === 0 && (
                    <div className="py-16 text-center bg-zinc-950/30 border-2 border-dashed border-zinc-900 rounded-[2.5rem]">
                       <p className="text-[10px] font-black text-zinc-800 uppercase tracking-[0.4em] italic">Catálogo de itens vazio para esta nota</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* PAINEL DE VALORES */}
        <div className="space-y-6">
          <div className="bg-[#0F0F0F] border border-[#1F1F1F] p-8 rounded-[2.5rem] shadow-2xl space-y-8 sticky top-6">
            <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] text-center italic">Checkout Pro</h3>
            
            <div className="space-y-6">
               <div>
                  <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest block mb-3 ml-2 italic">Mão de Obra Técnica</label>
                  <div className="relative">
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-800 font-black italic">R$</span>
                      <input 
                        type="number" 
                        inputMode="decimal"
                        value={labor || ''} 
                        onChange={(e) => setLabor(e.target.value)} 
                        className="w-full bg-[#050505] border-2 border-zinc-900 rounded-2xl pl-16 pr-6 py-5 text-white font-black text-2xl outline-none focus:border-[#E11D48]" 
                        placeholder="0,00"
                      />
                  </div>
               </div>

               <div>
                  <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest block mb-3 ml-2 italic">Desconto Aplicado</label>
                  <div className="relative">
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-800 font-black italic">R$</span>
                      <input 
                        type="number" 
                        inputMode="decimal"
                        value={discount || ''} 
                        onChange={(e) => setDiscount(e.target.value)} 
                        className="w-full bg-[#050505] border-2 border-zinc-900 rounded-2xl pl-16 pr-6 py-5 text-white font-black text-2xl outline-none focus:border-emerald-500" 
                        placeholder="0,00"
                      />
                  </div>
               </div>

               <div className="p-8 bg-[#E11D48] rounded-[2.5rem] shadow-2xl shadow-red-900/10 active-glow relative overflow-hidden group">
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                  <p className="text-[9px] font-black text-white/50 uppercase tracking-widest mb-1">Total Consolidado</p>
                  <p className="text-4xl font-black text-white leading-none tracking-tighter italic">R$ {calculateTotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
               </div>

               <div className="space-y-4">
                  <div className="flex justify-between items-center mb-2 px-2">
                    <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Status Financeiro</label>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                     <button 
                      onClick={() => setPaymentStatus(PaymentStatus.PAGO)}
                      className={`py-5 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] border-2 transition-all active:scale-95
                      ${paymentStatus === PaymentStatus.PAGO ? 'bg-emerald-500 text-white border-emerald-500 shadow-xl' : 'bg-[#050505] text-zinc-700 border-[#1F1F1F]'}`}
                     >
                       Quitado
                     </button>
                     <button 
                      onClick={() => setPaymentStatus(PaymentStatus.PENDENTE)}
                      className={`py-5 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] border-2 transition-all active:scale-95
                      ${paymentStatus === PaymentStatus.PENDENTE ? 'bg-amber-500 text-white border-amber-500 shadow-xl' : 'bg-[#050505] text-zinc-700 border-[#1F1F1F]'}`}
                     >
                       Pendente
                     </button>
                  </div>
               </div>

               <button 
                onClick={handleFinalize}
                className="w-full bg-white text-black py-7 rounded-[2.5rem] font-black uppercase text-[10px] tracking-[0.3em] shadow-2xl shadow-white/5 hover:bg-[#E11D48] hover:text-white transition-all active:scale-95 mt-4 italic"
               >
                 Processar Nota Elite
               </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DA NOTA FISCAL */}
      {showInvoice && osData && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/98 p-0 sm:p-4 overflow-y-auto no-scrollbar">
          <div className="bg-white w-full max-w-[210mm] min-h-screen sm:min-h-0 sm:rounded-[2rem] p-0 text-zinc-900 shadow-2xl relative flex flex-col">
             
             {/* TOOLBAR DA NOTA */}
             <div className="no-print bg-zinc-50 p-6 flex flex-wrap gap-4 justify-between items-center border-b border-zinc-200 sticky top-0 z-[210]">
               <div className="flex flex-wrap gap-3">
                 <button 
                  onClick={downloadAsImage} 
                  disabled={isGeneratingImage}
                  className="bg-[#E11D48] text-white px-6 py-4 rounded-2xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-black transition-all shadow-lg active:scale-95 disabled:opacity-50"
                 >
                   {isGeneratingImage ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
                   {isGeneratingImage ? "Processando..." : "Baixar como Imagem"}
                 </button>
                 <button onClick={() => window.print()} className="bg-zinc-900 text-white px-6 py-4 rounded-2xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-black transition-all shadow-lg active:scale-95">
                   <Printer size={18} /> Imprimir A4
                 </button>
               </div>
               <button onClick={() => setShowInvoice(false)} className="w-12 h-12 flex items-center justify-center bg-zinc-200 rounded-2xl text-zinc-600 hover:text-black transition-all">
                <X size={28} />
               </button>
             </div>

             {/* CORPO DA NOTA (REF INVOICE) */}
             <div ref={invoiceRef} className="p-10 md:p-16 text-zinc-900 flex flex-col flex-1 bg-white">
                <div className="flex justify-between items-start mb-12 pb-10 border-b-4 border-zinc-900">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-black rounded-[2rem] flex items-center justify-center text-white shadow-xl">
                      <Wrench size={40} />
                    </div>
                    <div>
                      <h1 className="text-4xl font-black tracking-tighter uppercase italic leading-none">KAEN <span className="text-[#E11D48]">PRO</span></h1>
                      <p className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.4em] mt-2">Elite Mechanical Management</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1 italic">COMPROVANTE Nº</p>
                    <p className="text-4xl font-black text-black leading-none">{osData.osNumber}</p>
                    <p className="text-[10px] font-black text-zinc-500 mt-2 uppercase tracking-widest">Data: {new Date(osData.createdAt).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-10 mb-12">
                   <div className="bg-zinc-50 p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm">
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 italic">Proprietário / Titular</p>
                      <p className="text-2xl font-black uppercase italic leading-none mb-2">{osData.clientName}</p>
                      <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{selectedClient?.phone}</p>
                      {selectedClient?.document && <p className="text-[10px] font-bold text-zinc-400 mt-1">Doc: {selectedClient.document}</p>}
                   </div>
                   <div className="bg-zinc-50 p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm">
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 italic">Máquina / Quilometragem</p>
                      <p className="text-xl font-black uppercase italic leading-none mb-2">{osData.vehiclePlate} • {osData.vehicleModel}</p>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-[#E11D48] rounded-full animate-pulse"></div>
                        <p className="text-lg font-black text-[#E11D48] uppercase tracking-tighter">{osData.vehicleKm} KM</p>
                      </div>
                   </div>
                </div>

                <div className="flex-1 space-y-10">
                  <div className="bg-zinc-50 p-8 rounded-[2.5rem] border border-zinc-100">
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4 italic">Resumo Técnico dos Serviços:</p>
                    <p className="text-sm font-medium text-zinc-700 leading-relaxed uppercase italic">
                      {osData.problem || "MANUTENÇÃO TÉCNICA CORRETIVA/PREVENTIVA CONFORME ITENS ABAIXO."}
                    </p>
                  </div>

                  <table className="w-full text-left text-sm border-collapse">
                    <thead className="border-b-2 border-zinc-900">
                      <tr className="text-zinc-400 uppercase font-black text-[10px] tracking-[0.3em]">
                        <th className="py-5">Item / Descrição Técnica</th>
                        <th className="py-5 text-center w-24">Qtd</th>
                        <th className="py-5 text-right w-36">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {osData.items.map((item, i) => (
                        <tr key={i} className="group">
                          <td className="py-6 font-black text-zinc-900 uppercase italic text-xs">{item.description}</td>
                          <td className="py-6 text-center font-black text-zinc-400">{item.quantity}</td>
                          <td className="py-6 text-right font-black text-zinc-900 text-sm">R$ {(Number(item.quantity) * Number(item.unitPrice)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        </tr>
                      ))}
                      {Number(osData.laborValue) > 0 && (
                        <tr className="bg-zinc-50/50">
                          <td className="py-6 font-black text-zinc-900 uppercase italic text-xs">MÃO DE OBRA TÉCNICA DE ALTA PERFORMANCE</td>
                          <td className="py-6 text-center font-black text-zinc-400">01</td>
                          <td className="py-6 text-right font-black text-zinc-900 text-sm">R$ {Number(osData.laborValue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="mt-12 pt-12 border-t-4 border-zinc-900">
                   <div className="flex justify-between items-end">
                      <div className="space-y-8">
                        <div className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] inline-block border-2 ${osData.paymentStatus === PaymentStatus.PAGO ? 'text-emerald-600 border-emerald-100 bg-emerald-50' : 'text-amber-600 border-amber-100 bg-amber-50'}`}>
                          {osData.paymentStatus.toUpperCase()}
                        </div>
                        <div className="flex flex-col items-start gap-1">
                          <div className="w-72 h-[3px] bg-zinc-900 mb-2"></div>
                          <p className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.5em] italic">Assinatura do Consultor</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.4em] mb-2 italic">Valor Total Consolidado</p>
                        <p className="text-6xl font-black text-black leading-none tracking-tighter italic">R$ {osData.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      </div>
                   </div>
                </div>

                <div className="mt-20 text-center text-[10px] font-black text-zinc-300 uppercase tracking-[0.8em] italic">
                  CONFIANÇA EM CADA QUILÔMETRO • KAEN PRO
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewServiceOrder;
