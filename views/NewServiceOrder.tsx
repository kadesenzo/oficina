
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Plus, 
  Trash2, 
  Wrench, 
  Package, 
  ChevronLeft,
  Printer,
  X,
  PlusCircle,
  Car,
  User,
  Search,
  ChevronRight,
  Loader2,
  Download,
  DollarSign,
  CheckCircle2,
  AlertTriangle
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
  
  // Data Store
  const [clients, setClients] = useState<Client[]>([]);
  const [allVehicles, setAllVehicles] = useState<Vehicle[]>([]);
  
  // Selection Logic
  const [clientSearch, setClientSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientVehicles, setClientVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  
  // OS Core Data
  const [currentKm, setCurrentKm] = useState('');
  const [problem, setProblem] = useState('');
  const [items, setItems] = useState<OSItem[]>([]);
  const [labor, setLabor] = useState<string>('0');
  const [discount, setDiscount] = useState<string>('0');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(PaymentStatus.PENDENTE);
  
  // UI Control
  const [showInvoice, setShowInvoice] = useState(false);
  const [osData, setOsData] = useState<ServiceOrder | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  // Carregar dados vinculados à sessão do usuário
  useEffect(() => {
    if (session) {
      const userClients = JSON.parse(localStorage.getItem(`kaenpro_${session.username}_clients`) || '[]');
      const userVehicles = JSON.parse(localStorage.getItem(`kaenpro_${session.username}_vehicles`) || '[]');
      setClients(userClients);
      setAllVehicles(userVehicles);
    }
  }, [session]);

  // Busca robusta: Ignora acentos e maiúsculas
  const filteredClients = useMemo(() => {
    const term = clientSearch.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (!term) return [];
    
    return clients.filter(c => {
      const name = c.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const phone = c.phone.replace(/\D/g, "");
      return name.includes(term) || phone.includes(term);
    });
  }, [clientSearch, clients]);

  const handleSelectClient = (client: Client) => {
    setSelectedClient(client);
    setClientSearch('');
    setSelectedVehicle(null);
    const vehicles = allVehicles.filter(v => v.clientId === client.id);
    setClientVehicles(vehicles);
  };

  const addItem = () => {
    const newItem: OSItem = {
      id: Math.random().toString(36).substr(2, 9),
      description: '',
      quantity: 1,
      unitPrice: 0,
      type: 'PART'
    };
    setItems([...items, newItem]);
  };

  const updateItem = (id: string, field: keyof OSItem, value: any) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  // CÁLCULO BLINDADO: Garante que o total nunca falhe ou fique em R$ 0,00 erroneamente
  const totalValue = useMemo(() => {
    const itemsSum = items.reduce((acc, curr) => {
      const q = parseFloat(String(curr.quantity)) || 0;
      const p = parseFloat(String(curr.unitPrice)) || 0;
      return acc + (q * p);
    }, 0);
    const lab = parseFloat(labor) || 0;
    const disc = parseFloat(discount) || 0;
    const final = itemsSum + lab - disc;
    return final > 0 ? final : 0;
  }, [items, labor, discount]);

  const handleFinalize = async () => {
    if (!selectedClient || !selectedVehicle || !session || !syncData) {
      alert("⚠️ ERRO: Selecione Cliente e Veículo para gerar a nota.");
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
      laborValue: parseFloat(labor) || 0,
      discount: parseFloat(discount) || 0,
      totalValue: totalValue,
      status: OSStatus.FINALIZADO,
      paymentStatus: paymentStatus,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const existing = JSON.parse(localStorage.getItem(`kaenpro_${session.username}_orders`) || '[]');
    const updatedOrders = [...existing, newOs];
    
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
    
    // Pequeno delay para garantir que o DOM mobile se estabilize
    await new Promise(r => setTimeout(r, 300));

    try {
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 3, // Ultra definição para WhatsApp
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
        windowWidth: 800 // Força largura estável para mobile
      });
      
      const link = document.createElement('a');
      link.download = `Nota_${osData?.osNumber}_${osData?.clientName.split(' ')[0]}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
    } catch (err) {
      console.error("Erro ao gerar imagem:", err);
      alert("Falha ao gerar imagem da nota.");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleReset = () => {
    setSelectedClient(null);
    setSelectedVehicle(null);
    setItems([]);
    setLabor('0');
    setDiscount('0');
    setProblem('');
    setShowInvoice(false);
    setOsData(null);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-32 animate-in fade-in duration-500">
      
      {/* HEADER DINÂMICO */}
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
          
          {/* PASSO 1: CLIENTE */}
          <div className="bg-[#0F0F0F] border border-[#1F1F1F] p-6 md:p-8 rounded-[2.5rem] shadow-2xl relative overflow-visible">
            {!selectedClient ? (
              <div className="space-y-4">
                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1 italic">1. Localizar Proprietário</label>
                <div className="relative">
                   <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-700" size={20} />
                   <input 
                    type="text" 
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    placeholder="NOME OU CELULAR..."
                    className="w-full bg-[#050505] border-2 border-[#1F1F1F] rounded-[2rem] pl-16 pr-6 py-6 text-white font-black outline-none focus:border-[#E11D48] transition-all uppercase placeholder-zinc-800"
                   />
                </div>
                
                {filteredClients.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-3 bg-[#0F0F0F] border border-[#1F1F1F] rounded-[2rem] overflow-hidden z-[100] shadow-2xl max-h-[300px] overflow-y-auto no-scrollbar">
                    {filteredClients.map(c => (
                      <button 
                        key={c.id} 
                        onClick={() => handleSelectClient(c)}
                        className="w-full p-6 flex items-center justify-between hover:bg-zinc-900 border-b border-[#1F1F1F] text-left group active:bg-[#E11D48] transition-colors"
                      >
                        <div>
                          <p className="font-black text-white uppercase group-active:text-white">{c.name}</p>
                          <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest group-active:text-white/70">{c.phone}</p>
                        </div>
                        <ChevronRight size={18} className="text-[#E11D48] group-active:text-white" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6 animate-in slide-in-from-top duration-300">
                <div className="flex items-center justify-between p-5 bg-[#050505] border border-zinc-800 rounded-[2rem]">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#E11D48]/10 text-[#E11D48] rounded-xl flex items-center justify-center border border-[#E11D48]/20">
                      <User size={24} />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Cliente Selecionado</p>
                      <h3 className="text-lg font-black text-white uppercase italic tracking-tighter">{selectedClient.name}</h3>
                    </div>
                  </div>
                  <button onClick={() => setSelectedClient(null)} className="p-3 bg-zinc-900 rounded-xl text-zinc-500 hover:text-white active:scale-90 transition-all shadow-lg">
                    <X size={20}/>
                  </button>
                </div>

                {/* PASSO 2: VEÍCULO */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1 italic">2. Selecionar Máquina</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {clientVehicles.map(v => (
                      <button 
                        key={v.id}
                        onClick={() => setSelectedVehicle(v)}
                        className={`p-6 rounded-[2rem] border-2 text-left transition-all active:scale-95 ${selectedVehicle?.id === v.id ? 'bg-[#E11D48]/10 border-[#E11D48] shadow-xl active-glow' : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}
                      >
                        <Car size={22} className={`mb-3 ${selectedVehicle?.id === v.id ? 'text-[#E11D48]' : 'text-zinc-800'}`} />
                        <p className={`font-black uppercase tracking-[0.2em] text-sm ${selectedVehicle?.id === v.id ? 'text-white' : 'text-zinc-400'}`}>{v.plate}</p>
                        <p className="text-[9px] font-black uppercase opacity-60 tracking-widest">{v.model}</p>
                      </button>
                    ))}
                    <button 
                      onClick={() => navigate('/clients')}
                      className="p-6 rounded-[2rem] border-2 border-dashed border-zinc-800 text-zinc-700 hover:text-white hover:border-zinc-600 transition-all flex flex-col items-center justify-center gap-2 group active:scale-95"
                    >
                      <PlusCircle size={24} className="group-hover:text-[#E11D48] transition-colors" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Cadastrar Novo</span>
                    </button>
                  </div>
                </div>

                {selectedVehicle && (
                  <div className="pt-6 border-t border-zinc-900 animate-in slide-in-from-top duration-300">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-4 block ml-1 italic">Quilometragem no Ato</label>
                    <input 
                      type="number" 
                      inputMode="numeric"
                      value={currentKm}
                      onChange={(e) => setCurrentKm(e.target.value)}
                      className="w-full bg-[#050505] border-2 border-[#1F1F1F] rounded-2xl px-6 py-6 text-3xl font-black text-white focus:border-[#E11D48] outline-none shadow-inner placeholder-zinc-900"
                      placeholder="000000"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* PASSO 3: SERVIÇOS */}
          {selectedVehicle && (
            <div className="space-y-6 animate-in slide-in-from-bottom duration-500">
              <div className="bg-[#0F0F0F] border border-[#1F1F1F] p-8 rounded-[2.5rem] shadow-xl space-y-6">
                 <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] flex items-center gap-2 italic">
                  <Wrench size={16} className="text-[#E11D48]" /> Relatório Técnico Geral
                 </h3>
                 <textarea 
                   value={problem}
                   onChange={(e) => setProblem(e.target.value)}
                   rows={4}
                   placeholder="DETALHE O QUE FOI EXECUTADO..."
                   className="w-full bg-[#050505] border-2 border-[#1F1F1F] rounded-[2rem] p-6 text-sm text-white focus:border-[#E11D48] outline-none font-bold placeholder-zinc-800"
                 />
              </div>

              <div className="bg-[#0F0F0F] border border-[#1F1F1F] p-8 rounded-[2.5rem] shadow-xl space-y-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] flex items-center gap-2 italic">
                    <Package size={16} className="text-[#E11D48]" /> Listagem de Itens e Peças
                  </h3>
                  <button 
                    onClick={addItem}
                    className="bg-zinc-800 text-white px-5 py-3 rounded-xl hover:bg-[#E11D48] transition-all flex items-center gap-2 shadow-lg active:scale-95"
                  >
                    <Plus size={16} /> <span className="text-[9px] font-black uppercase tracking-widest">Add Item</span>
                  </button>
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
                          className="w-full bg-transparent border-b border-zinc-900 py-2 text-sm text-white font-bold outline-none focus:border-[#E11D48] uppercase placeholder-zinc-900" 
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
                            className="w-16 bg-zinc-900 border border-zinc-800 rounded-xl py-3 text-center text-xs font-black text-white" 
                          />
                        </div>
                        <div className="flex flex-col gap-1 items-center">
                          <span className="text-[8px] font-black text-zinc-800 uppercase">Preço</span>
                          <input 
                            type="number" 
                            inputMode="decimal"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(item.id, 'unitPrice', e.target.value)}
                            className="w-24 bg-zinc-900 border border-zinc-800 rounded-xl py-3 text-center text-xs font-black text-white" 
                          />
                        </div>
                        <button onClick={() => removeItem(item.id)} className="p-3 text-zinc-800 hover:text-red-500 transition-colors active:scale-90"><Trash2 size={20} /></button>
                      </div>
                    </div>
                  ))}
                  {items.length === 0 && (
                    <div className="py-16 text-center bg-zinc-950/30 border-2 border-dashed border-zinc-900 rounded-[2.5rem]">
                       <p className="text-[10px] font-black text-zinc-800 uppercase tracking-[0.4em] italic">Nenhum item lançado</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* PAINEL FINANCEIRO */}
        <div className="space-y-6">
          <div className="bg-[#0F0F0F] border border-[#1F1F1F] p-8 rounded-[2.5rem] shadow-2xl space-y-8 sticky top-6">
            <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] text-center italic">Checkout Elite</h3>
            
            <div className="space-y-6">
               <div>
                  <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest block mb-3 ml-2 italic">Mão de Obra (R$)</label>
                  <div className="relative">
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-800 font-black italic">R$</span>
                      <input 
                        type="number" 
                        inputMode="decimal"
                        value={labor} 
                        onChange={(e) => setLabor(e.target.value)} 
                        className="w-full bg-[#050505] border-2 border-zinc-900 rounded-2xl pl-16 pr-6 py-5 text-white font-black text-2xl outline-none focus:border-[#E11D48] shadow-inner" 
                        placeholder="0,00"
                      />
                  </div>
               </div>

               <div>
                  <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest block mb-3 ml-2 italic">Desconto Aplicado (R$)</label>
                  <div className="relative">
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-800 font-black italic">R$</span>
                      <input 
                        type="number" 
                        inputMode="decimal"
                        value={discount} 
                        onChange={(e) => setDiscount(e.target.value)} 
                        className="w-full bg-[#050505] border-2 border-zinc-900 rounded-2xl pl-16 pr-6 py-5 text-white font-black text-2xl outline-none focus:border-emerald-500 shadow-inner" 
                        placeholder="0,00"
                      />
                  </div>
               </div>

               <div className="p-8 bg-[#E11D48] rounded-[2.5rem] shadow-2xl shadow-red-900/10 active-glow relative overflow-hidden group">
                  <p className="text-[9px] font-black text-white/50 uppercase tracking-widest mb-1">Total Consolidado</p>
                  <p className="text-4xl font-black text-white leading-none tracking-tighter italic">R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  <DollarSign className="absolute top-1/2 -right-4 -translate-y-1/2 text-white/10" size={100} />
               </div>

               <div className="space-y-4">
                  <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest text-center block italic">Status Financeiro</label>
                  <div className="grid grid-cols-2 gap-3">
                     <button 
                      onClick={() => setPaymentStatus(PaymentStatus.PAGO)}
                      className={`py-5 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] border-2 transition-all active:scale-95
                      ${paymentStatus === PaymentStatus.PAGO ? 'bg-emerald-500 text-white border-emerald-500 shadow-xl glow-emerald' : 'bg-[#050505] text-zinc-700 border-[#1F1F1F]'}`}
                     >
                       Recebido
                     </button>
                     <button 
                      onClick={() => setPaymentStatus(PaymentStatus.PENDENTE)}
                      className={`py-5 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] border-2 transition-all active:scale-95
                      ${paymentStatus === PaymentStatus.PENDENTE ? 'bg-amber-500 text-white border-amber-500 shadow-xl glow-amber' : 'bg-[#050505] text-zinc-700 border-[#1F1F1F]'}`}
                     >
                       Em Aberto
                     </button>
                  </div>
               </div>

               <button 
                onClick={handleFinalize}
                disabled={!selectedVehicle}
                className="w-full bg-white text-black py-7 rounded-[2.5rem] font-black uppercase text-[10px] tracking-[0.3em] shadow-2xl shadow-white/5 hover:bg-[#E11D48] hover:text-white transition-all active:scale-95 mt-4 italic disabled:opacity-20"
               >
                 Processar Nota Cloud
               </button>
            </div>
          </div>
        </div>
      </div>

      {/* VISUALIZAÇÃO DA NOTA (MODAL) */}
      {showInvoice && osData && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/98 p-0 sm:p-4 overflow-y-auto no-scrollbar">
          <div className="bg-white w-full max-w-[210mm] min-h-screen sm:min-h-0 sm:rounded-[2rem] p-0 text-zinc-900 shadow-2xl relative flex flex-col">
             
             {/* BARRA DE FERRAMENTAS NOTA */}
             <div className="no-print bg-zinc-50 p-6 flex flex-wrap gap-4 justify-between items-center border-b border-zinc-200 sticky top-0 z-[210]">
               <div className="flex flex-wrap gap-3">
                 <button 
                  onClick={downloadAsImage} 
                  disabled={isGeneratingImage}
                  className="bg-[#E11D48] text-white px-6 py-4 rounded-2xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-black transition-all shadow-lg active:scale-95 disabled:opacity-50"
                 >
                   {isGeneratingImage ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
                   {isGeneratingImage ? "Sincronizando..." : "Salvar como Imagem"}
                 </button>
                 <button onClick={() => window.print()} className="bg-zinc-900 text-white px-6 py-4 rounded-2xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-black transition-all shadow-lg active:scale-95">
                   <Printer size={18} /> Imprimir A4
                 </button>
                 <button onClick={handleReset} className="bg-zinc-200 text-zinc-600 px-6 py-4 rounded-2xl text-[10px] font-black uppercase hover:text-black transition-all active:scale-95">
                   Nova Nota
                 </button>
               </div>
               <button onClick={() => setShowInvoice(false)} className="w-12 h-12 flex items-center justify-center bg-zinc-200 rounded-2xl text-zinc-600 hover:text-black transition-all active:scale-90">
                <X size={28} />
               </button>
             </div>

             {/* CORPO DA NOTA (HTML2CANVAS) */}
             <div ref={invoiceRef} className="p-10 md:p-16 text-zinc-900 flex flex-col flex-1 bg-white">
                <div className="flex justify-between items-start mb-12 pb-10 border-b-4 border-zinc-900">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-black rounded-[2rem] flex items-center justify-center text-white shadow-xl">
                      <Wrench size={40} />
                    </div>
                    <div>
                      <h1 className="text-4xl font-black tracking-tighter uppercase italic leading-none">KAEN <span className="text-[#E11D48]">PRO</span></h1>
                      <p className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.4em] mt-2 italic">Mechanical Management Engine</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1 italic">NÚMERO DA NOTA</p>
                    <p className="text-4xl font-black text-black leading-none tracking-tighter">{osData.osNumber}</p>
                    <p className="text-[10px] font-black text-zinc-500 mt-2 uppercase tracking-widest italic">Data: {new Date(osData.createdAt).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-10 mb-12">
                   <div className="bg-zinc-50 p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm">
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 italic">Titular / Proprietário</p>
                      <p className="text-2xl font-black uppercase italic leading-none mb-2">{osData.clientName}</p>
                      <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{selectedClient?.phone}</p>
                      {selectedClient?.document && <p className="text-[10px] font-bold text-zinc-400 mt-1 uppercase">Doc: {selectedClient.document}</p>}
                   </div>
                   <div className="bg-zinc-50 p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm">
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 italic">Máquina / KM</p>
                      <p className="text-xl font-black uppercase italic leading-none mb-2">{osData.vehiclePlate} • {osData.vehicleModel}</p>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-[#E11D48] rounded-full animate-pulse"></div>
                        <p className="text-lg font-black text-[#E11D48] uppercase tracking-tighter italic">{osData.vehicleKm} KM RODADOS</p>
                      </div>
                   </div>
                </div>

                <div className="flex-1 space-y-10">
                  <div className="bg-zinc-50 p-8 rounded-[2.5rem] border border-zinc-100">
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4 italic">Observações Técnicas do Serviço:</p>
                    <p className="text-sm font-medium text-zinc-700 leading-relaxed uppercase italic">
                      {osData.problem || "MANUTENÇÃO TÉCNICA CORRETIVA EXECUTADA COM SUCESSO."}
                    </p>
                  </div>

                  <table className="w-full text-left text-sm border-collapse">
                    <thead className="border-b-2 border-zinc-900">
                      <tr className="text-zinc-400 uppercase font-black text-[10px] tracking-[0.3em]">
                        <th className="py-5">Descrição do Item / Peça</th>
                        <th className="py-5 text-center w-24">Qtd</th>
                        <th className="py-5 text-right w-36 italic">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {osData.items.map((item, i) => (
                        <tr key={i}>
                          <td className="py-6 font-black text-zinc-900 uppercase italic text-xs">{item.description}</td>
                          <td className="py-6 text-center font-black text-zinc-400">{item.quantity}</td>
                          <td className="py-6 text-right font-black text-zinc-900 text-sm italic">R$ {(parseFloat(String(item.quantity)) * parseFloat(String(item.unitPrice))).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        </tr>
                      ))}
                      {osData.laborValue > 0 && (
                        <tr className="bg-zinc-50/50">
                          <td className="py-6 font-black text-zinc-900 uppercase italic text-xs">MÃO DE OBRA TÉCNICA DE ALTA PERFORMANCE</td>
                          <td className="py-6 text-center font-black text-zinc-400">01</td>
                          <td className="py-6 text-right font-black text-zinc-900 text-sm italic">R$ {osData.laborValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
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
                          <p className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.5em] italic">Assinatura Responsável Técnico</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.4em] mb-2 italic">Total Líquido Devido</p>
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
