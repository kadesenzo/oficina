
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
  Car,
  User,
  Search,
  ChevronRight,
  ImageIcon,
  Loader2,
  Download,
  DollarSign
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
  
  // Data State
  const [clients, setClients] = useState<Client[]>([]);
  const [allVehicles, setAllVehicles] = useState<Vehicle[]>([]);
  
  // Selection State
  const [clientSearch, setClientSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientVehicles, setClientVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  
  // OS Details
  const [currentKm, setCurrentKm] = useState('');
  const [problem, setProblem] = useState('');
  const [items, setItems] = useState<OSItem[]>([]);
  const [labor, setLabor] = useState<string>('0');
  const [discount, setDiscount] = useState<string>('0');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(PaymentStatus.PENDENTE);
  
  // UI Flow
  const [showInvoice, setShowInvoice] = useState(false);
  const [osData, setOsData] = useState<ServiceOrder | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  useEffect(() => {
    if (session) {
      const userClients = JSON.parse(localStorage.getItem(`kaenpro_${session.username}_clients`) || '[]');
      const userVehicles = JSON.parse(localStorage.getItem(`kaenpro_${session.username}_vehicles`) || '[]');
      setClients(userClients);
      setAllVehicles(userVehicles);
    }
  }, [session]);

  // Busca robusta de clientes
  const filteredClients = clientSearch.trim().length > 0 
    ? clients.filter(c => 
        c.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(clientSearch.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")) || 
        c.phone.includes(clientSearch) ||
        (c.document && c.document.includes(clientSearch))
      )
    : [];

  const handleSelectClient = (client: Client) => {
    setSelectedClient(client);
    setClientSearch('');
    setSelectedVehicle(null);
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

  // Cálculo matemático blindado (Impede R$ 0,00 errado)
  const calculateTotal = () => {
    const itemsTotal = items.reduce((acc, curr) => {
      const q = parseFloat(curr.quantity.toString()) || 0;
      const p = parseFloat(curr.unitPrice.toString()) || 0;
      return acc + (q * p);
    }, 0);
    const lab = parseFloat(labor) || 0;
    const disc = parseFloat(discount) || 0;
    const result = itemsTotal + lab - disc;
    return result > 0 ? result : 0;
  };

  const handleFinalize = async () => {
    if (!selectedClient || !selectedVehicle || !session || !syncData) {
      alert("⚠️ ERRO: Você precisa selecionar um Cliente e um Veículo.");
      return;
    }

    const total = calculateTotal();

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
      totalValue: total,
      status: OSStatus.FINALIZADO,
      paymentStatus: paymentStatus,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const existing = JSON.parse(localStorage.getItem(`kaenpro_${session.username}_orders`) || '[]');
    const updatedOrders = [...existing, newOs];
    
    // Sincronização e persistência
    await syncData('orders', updatedOrders);

    // Atualizar KM do veículo
    if (currentKm) {
      const updatedVehicles = allVehicles.map(v => 
        v.id === selectedVehicle.id ? { ...v, km: parseFloat(currentKm) || v.km } : v
      );
      await syncData('vehicles', updatedVehicles);
    }

    setOsData(newOs);
    setShowInvoice(true);
  };

  const generateImage = async () => {
    if (!invoiceRef.current) return;
    setIsGeneratingImage(true);
    try {
      // Pequeno delay para garantir renderização total do DOM
      await new Promise(r => setTimeout(r, 300));
      
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 3, // Ultra Qualidade
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: 800 // Força largura padrão para mobile não cortar
      });
      
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `NOTA_${osData?.osNumber}_${osData?.clientName.split(' ')[0]}.png`;
      link.click();
    } catch (error) {
      console.error("Erro ao gerar imagem:", error);
      alert("Erro ao processar imagem da nota.");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const resetForm = () => {
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
    <div className="max-w-5xl mx-auto space-y-6 pb-32 px-4 md:px-0 animate-in fade-in duration-500">
      
      {/* HEADER FIXO NO TOPO */}
      <div className="flex items-center justify-between no-print pt-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors">
          <ChevronLeft size={20} />
          <span className="font-black uppercase text-[10px] tracking-widest">Painel</span>
        </button>
        <h1 className="text-xl font-black text-white italic uppercase tracking-tighter">Gerar <span className="text-[#E11D48]">Nota</span></h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 no-print">
        
        {/* COLUNA PRINCIPAL: DADOS E SERVIÇOS */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 1. BUSCA DE CLIENTE */}
          <div className="bg-[#0F0F0F] border border-[#1F1F1F] p-6 rounded-[2rem] shadow-2xl relative">
            {!selectedClient ? (
              <div className="space-y-4">
                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">1. Buscar Cliente</label>
                <div className="relative">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-700" size={20} />
                  <input 
                    type="text" 
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    placeholder="Nome, Telefone ou Placa..."
                    className="w-full bg-[#050505] border-2 border-[#1F1F1F] rounded-[2rem] pl-16 pr-6 py-5 text-white font-bold outline-none focus:border-[#E11D48] transition-all uppercase"
                  />
                </div>
                
                {filteredClients.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-3 bg-[#0F0F0F] border border-[#1F1F1F] rounded-[1.5rem] overflow-hidden z-[100] shadow-2xl max-h-[250px] overflow-y-auto no-scrollbar">
                    {filteredClients.map(c => (
                      <button 
                        key={c.id} 
                        onClick={() => handleSelectClient(c)}
                        className="w-full p-5 flex items-center justify-between hover:bg-zinc-900 border-b border-[#1F1F1F] text-left group"
                      >
                        <div>
                          <p className="font-black text-white uppercase group-active:text-[#E11D48]">{c.name}</p>
                          <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">{c.phone}</p>
                        </div>
                        <ChevronRight size={18} className="text-[#E11D48]" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-[#050505] border border-zinc-800 rounded-2xl">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#E11D48]/10 text-[#E11D48] rounded-xl flex items-center justify-center">
                      <User size={24} />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Cliente Selecionado</p>
                      <h3 className="font-black text-white uppercase italic">{selectedClient.name}</h3>
                    </div>
                  </div>
                  <button onClick={() => setSelectedClient(null)} className="p-2 text-zinc-700 hover:text-white"><X size={20}/></button>
                </div>

                {/* 2. SELEÇÃO DE VEÍCULO */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">2. Escolher Veículo</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {clientVehicles.map(v => (
                      <button 
                        key={v.id}
                        onClick={() => handleVehicleChange(v.id)}
                        className={`p-5 rounded-2xl border-2 text-left transition-all ${selectedVehicle?.id === v.id ? 'bg-[#E11D48]/10 border-[#E11D48]' : 'bg-zinc-950 border-zinc-900 text-zinc-500'}`}
                      >
                        <Car size={18} className={`mb-2 ${selectedVehicle?.id === v.id ? 'text-[#E11D48]' : 'text-zinc-800'}`} />
                        <p className={`font-black uppercase tracking-widest text-sm ${selectedVehicle?.id === v.id ? 'text-white' : ''}`}>{v.plate}</p>
                        <p className="text-[9px] font-black uppercase opacity-60">{v.model}</p>
                      </button>
                    ))}
                    <button 
                      onClick={() => navigate('/clients')}
                      className="p-5 rounded-2xl border-2 border-dashed border-zinc-800 text-zinc-700 flex flex-col items-center justify-center gap-1"
                    >
                      <PlusCircle size={18} />
                      <span className="text-[9px] font-black uppercase">Novo Veículo</span>
                    </button>
                  </div>
                </div>

                {selectedVehicle && (
                  <div className="pt-4 border-t border-zinc-900">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-3 block">Quilometragem de Entrada</label>
                    <input 
                      type="number" 
                      inputMode="numeric"
                      value={currentKm}
                      onChange={(e) => setCurrentKm(e.target.value)}
                      className="w-full bg-[#050505] border-2 border-[#1F1F1F] rounded-2xl px-6 py-4 text-2xl font-black text-white focus:border-[#E11D48] outline-none"
                      placeholder="KM ATUAL"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 3. LANÇAMENTO DE SERVIÇOS E PEÇAS */}
          {selectedVehicle && (
            <div className="space-y-6 animate-in slide-in-from-bottom duration-300">
              <div className="bg-[#0F0F0F] border border-[#1F1F1F] p-6 rounded-[2rem] shadow-xl space-y-4">
                 <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest flex items-center gap-2">
                  <Wrench size={16} className="text-[#E11D48]" /> Relatório do Mecânico
                 </h3>
                 <textarea 
                   value={problem}
                   onChange={(e) => setProblem(e.target.value)}
                   rows={3}
                   placeholder="Descreva aqui o que foi feito..."
                   className="w-full bg-[#050505] border-2 border-[#1F1F1F] rounded-2xl p-5 text-sm text-white focus:border-[#E11D48] outline-none font-bold"
                 />
              </div>

              <div className="bg-[#0F0F0F] border border-[#1F1F1F] p-6 rounded-[2rem] shadow-xl space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest flex items-center gap-2">
                    <Package size={16} className="text-[#E11D48]" /> Itens Aplicados
                  </h3>
                  <button 
                    onClick={() => addItem('PART')}
                    className="bg-[#E11D48] text-white px-4 py-2 rounded-xl hover:scale-105 active:scale-95 transition-all text-[9px] font-black uppercase"
                  >
                    + Add Peça
                  </button>
                </div>

                <div className="space-y-4">
                  {items.map(item => (
                    <div key={item.id} className="flex flex-col sm:flex-row gap-3 p-4 bg-[#050505] border border-zinc-900 rounded-2xl relative group">
                      <div className="flex-1">
                        <input 
                          type="text" 
                          placeholder="Descrição da Peça..."
                          value={item.description}
                          onChange={(e) => updateItem(item.id, 'description', e.target.value.toUpperCase())}
                          className="w-full bg-transparent border-b border-zinc-800 py-1 text-sm text-white font-bold outline-none focus:border-[#E11D48] uppercase" 
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-16">
                           <input 
                            type="number" 
                            inputMode="numeric"
                            value={item.quantity}
                            onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 text-center text-xs font-black text-white" 
                          />
                        </div>
                        <div className="w-24">
                          <input 
                            type="number" 
                            inputMode="decimal"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(item.id, 'unitPrice', e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 text-center text-xs font-black text-white" 
                          />
                        </div>
                        <button onClick={() => removeItem(item.id)} className="p-2 text-zinc-800 hover:text-red-500"><Trash2 size={18} /></button>
                      </div>
                    </div>
                  ))}
                  {items.length === 0 && (
                    <div className="py-10 text-center bg-zinc-950/30 rounded-2xl border border-dashed border-zinc-900">
                       <p className="text-[9px] font-black text-zinc-800 uppercase tracking-widest italic">Nenhuma peça adicionada ainda</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SIDEBAR FINANCEIRA (TOTALIZADOR) */}
        <div className="space-y-6">
          <div className="bg-[#0F0F0F] border border-[#1F1F1F] p-8 rounded-[2.5rem] shadow-2xl space-y-6 sticky top-6">
            <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest text-center italic mb-2">Resumo da Nota</h3>
            
            <div className="space-y-5">
               <div>
                  <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest block mb-2 ml-1">Mão de Obra Técnica (R$)</label>
                  <input 
                    type="number" 
                    inputMode="decimal"
                    value={labor} 
                    onChange={(e) => setLabor(e.target.value)} 
                    className="w-full bg-[#050505] border-2 border-zinc-900 rounded-2xl px-6 py-4 text-white font-black text-xl outline-none focus:border-[#E11D48]" 
                    placeholder="0.00"
                  />
               </div>

               <div>
                  <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest block mb-2 ml-1">Descontos (R$)</label>
                  <input 
                    type="number" 
                    inputMode="decimal"
                    value={discount} 
                    onChange={(e) => setDiscount(e.target.value)} 
                    className="w-full bg-[#050505] border-2 border-zinc-900 rounded-2xl px-6 py-4 text-white font-black text-xl outline-none focus:border-emerald-500" 
                    placeholder="0.00"
                  />
               </div>

               <div className="p-6 bg-[#E11D48] rounded-[2rem] shadow-xl shadow-red-900/10 active-glow relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><DollarSign size={48} /></div>
                  <p className="text-[9px] font-black text-white/60 uppercase tracking-widest mb-1">Total a Receber</p>
                  <p className="text-4xl font-black text-white leading-none tracking-tighter italic">R$ {calculateTotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
               </div>

               <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setPaymentStatus(PaymentStatus.PAGO)}
                    className={`py-4 rounded-xl text-[9px] font-black uppercase tracking-widest border-2 transition-all
                    ${paymentStatus === PaymentStatus.PAGO ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-zinc-950 border-zinc-900 text-zinc-700'}`}
                  >
                    Pago
                  </button>
                  <button 
                    onClick={() => setPaymentStatus(PaymentStatus.PENDENTE)}
                    className={`py-4 rounded-xl text-[9px] font-black uppercase tracking-widest border-2 transition-all
                    ${paymentStatus === PaymentStatus.PENDENTE ? 'bg-amber-500 border-amber-500 text-white' : 'bg-zinc-950 border-zinc-900 text-zinc-700'}`}
                  >
                    Pendente
                  </button>
               </div>

               <button 
                onClick={handleFinalize}
                disabled={!selectedVehicle}
                className="w-full bg-white text-black py-6 rounded-[2rem] font-black uppercase text-[10px] tracking-[0.2em] shadow-xl hover:bg-[#E11D48] hover:text-white transition-all active:scale-95 disabled:opacity-20 disabled:cursor-not-allowed"
               >
                 Finalizar e Gerar Nota
               </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DA NOTA FISCAL (RENDERIZAÇÃO DE IMPRESSÃO) */}
      {showInvoice && osData && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/98 p-0 sm:p-4 overflow-y-auto no-scrollbar">
          <div className="bg-white w-full max-w-[210mm] min-h-screen sm:min-h-0 sm:rounded-[2rem] p-0 text-zinc-900 shadow-2xl relative flex flex-col">
             
             {/* BARRA DE FERRAMENTAS DO MODAL */}
             <div className="no-print bg-zinc-50 p-4 flex flex-wrap gap-3 justify-between items-center border-b border-zinc-200 sticky top-0 z-[210]">
               <div className="flex flex-wrap gap-2">
                 <button 
                  onClick={generateImage} 
                  disabled={isGeneratingImage}
                  className="bg-[#E11D48] text-white px-5 py-3 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-black transition-all shadow-lg active:scale-95 disabled:opacity-50"
                 >
                   {isGeneratingImage ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
                   {isGeneratingImage ? "Processando..." : "Salvar como Imagem"}
                 </button>
                 <button 
                  onClick={handlePrint} 
                  className="bg-zinc-900 text-white px-5 py-3 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-black transition-all shadow-lg active:scale-95"
                 >
                   <Printer size={16} /> Imprimir A4
                 </button>
                 <button 
                  onClick={resetForm} 
                  className="bg-zinc-200 text-zinc-600 px-5 py-3 rounded-xl text-[10px] font-black uppercase hover:text-black transition-all"
                 >
                   Nova Nota
                 </button>
               </div>
               <button onClick={() => setShowInvoice(false)} className="p-2 text-zinc-400 hover:text-zinc-900"><X size={28} /></button>
             </div>

             {/* CONTEÚDO DA NOTA FISCAL (Capturado pelo html2canvas) */}
             <div ref={invoiceRef} className="p-10 md:p-16 text-zinc-900 flex flex-col flex-1 bg-white">
                <div className="flex justify-between items-start mb-12 pb-10 border-b-2 border-zinc-900">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center text-white shadow-xl">
                      <Wrench size={32} />
                    </div>
                    <div>
                      <h1 className="text-3xl font-black tracking-tighter uppercase italic leading-none">KAEN <span className="text-[#E11D48]">PRO</span></h1>
                      <p className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.3em] mt-2">Elite Garage Management</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">OS Nº</p>
                    <p className="text-4xl font-black leading-none">{osData.osNumber}</p>
                    <p className="text-[10px] font-bold text-zinc-500 mt-2 uppercase">Data: {new Date(osData.createdAt).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-10 mb-12">
                   <div className="bg-zinc-50 p-6 rounded-3xl border border-zinc-100">
                      <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-2">Proprietário / Titular</p>
                      <p className="text-xl font-black uppercase italic leading-none mb-2">{osData.clientName}</p>
                      <p className="text-xs font-bold text-zinc-500 uppercase">{selectedClient?.phone}</p>
                      {selectedClient?.document && <p className="text-[9px] font-bold text-zinc-400 mt-1">Doc: {selectedClient.document}</p>}
                   </div>
                   <div className="bg-zinc-50 p-6 rounded-3xl border border-zinc-100">
                      <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-2">Máquina / Quilometragem</p>
                      <p className="text-lg font-black uppercase leading-none mb-2 italic">{osData.vehiclePlate} • {osData.vehicleModel}</p>
                      <p className="text-base font-black text-[#E11D48] tracking-tighter">{osData.vehicleKm} KM RODADOS</p>
                   </div>
                </div>

                <div className="flex-1 space-y-10">
                  <div className="bg-zinc-50 p-6 rounded-3xl border border-zinc-100">
                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-3 italic">Relato de Serviço Realizado:</p>
                    <p className="text-sm font-medium text-zinc-700 leading-relaxed uppercase italic">
                      {osData.problem || "MANUTENÇÃO TÉCNICA CORRETIVA E PREVENTIVA EXECUTADA COM SUCESSO."}
                    </p>
                  </div>

                  <table className="w-full text-left text-sm border-collapse">
                    <thead className="border-b-2 border-zinc-900">
                      <tr className="text-zinc-400 uppercase font-black text-[9px] tracking-widest">
                        <th className="py-4">Item / Peça / Serviço</th>
                        <th className="py-4 text-center w-24">Qtd</th>
                        <th className="py-4 text-right w-36">Valor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {osData.items.map((item, i) => (
                        <tr key={i}>
                          <td className="py-5 font-black text-zinc-900 uppercase italic text-xs">{item.description}</td>
                          <td className="py-5 text-center font-black text-zinc-400">{item.quantity}</td>
                          <td className="py-5 text-right font-black text-zinc-900">R$ {(Number(item.quantity) * Number(item.unitPrice)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        </tr>
                      ))}
                      {Number(osData.laborValue) > 0 && (
                        <tr className="bg-zinc-50/50">
                          <td className="py-5 font-black text-zinc-900 uppercase italic text-xs">MÃO DE OBRA TÉCNICA ESPECIALIZADA</td>
                          <td className="py-5 text-center font-black text-zinc-400">01</td>
                          <td className="py-5 text-right font-black text-zinc-900">R$ {Number(osData.laborValue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="mt-12 pt-10 border-t-2 border-zinc-900">
                   <div className="flex justify-between items-end">
                      <div className="space-y-6">
                        <div className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest inline-block border ${osData.paymentStatus === PaymentStatus.PAGO ? 'text-emerald-600 border-emerald-100 bg-emerald-50' : 'text-amber-600 border-amber-100 bg-amber-50'}`}>
                          Status: {osData.paymentStatus.toUpperCase()}
                        </div>
                        <div className="flex flex-col items-start gap-1">
                          <div className="w-64 h-[2px] bg-zinc-900 mb-2"></div>
                          <p className="text-[9px] text-zinc-400 font-black uppercase tracking-widest italic">Responsável Técnico</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1 italic">Valor Total Consolidado</p>
                        <p className="text-5xl font-black text-black leading-none tracking-tighter italic">R$ {osData.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      </div>
                   </div>
                </div>

                <div className="mt-16 text-center text-[9px] font-black text-zinc-300 uppercase tracking-[0.5em] italic">
                  CONFIANÇA EM CADA KM • KAEN PRO
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewServiceOrder;
