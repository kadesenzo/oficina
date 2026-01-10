
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Wrench, 
  Package, 
  Save, 
  ChevronLeft,
  Printer,
  X,
  PlusCircle,
  FileText,
  CreditCard,
  Clock,
  CheckCircle2,
  Share2,
  Car,
  User,
  Search,
  ChevronRight,
  ImageIcon,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Client, Vehicle, OSItem, OSStatus, Part, ServiceOrder, PaymentStatus, UserSession } from '../types';
import html2canvas from 'html2canvas';

interface NewServiceOrderProps {
  session?: UserSession;
  syncData?: (key: string, data: any) => Promise<void>;
}

const NewServiceOrder: React.FC<NewServiceOrderProps> = ({ session, syncData }) => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [allVehicles, setAllVehicles] = useState<Vehicle[]>([]);
  
  const [clientSearch, setClientSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientVehicles, setClientVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  
  const [currentKm, setCurrentKm] = useState('');
  const [problem, setProblem] = useState('');
  const [items, setItems] = useState<OSItem[]>([]);
  const [labor, setLabor] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(PaymentStatus.PENDENTE);
  
  const [showInvoice, setShowInvoice] = useState(false);
  const [osData, setOsData] = useState<ServiceOrder | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  useEffect(() => {
    if (session) {
      // GARANTIA: Puxar do banco de dados DO USUÁRIO
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
    const itemsTotal = items.reduce((acc, curr) => acc + (curr.quantity * curr.unitPrice), 0);
    return Math.max(0, itemsTotal + labor - discount);
  };

  const handleFinalize = async () => {
    if (!selectedClient || !selectedVehicle || !session || !syncData) {
      alert("⚠️ ERRO: Selecione um Cliente e um Veículo para continuar.");
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

    // Salvar no banco de dados sincronizado
    const existing = JSON.parse(localStorage.getItem(`kaenpro_${session.username}_orders`) || '[]');
    const updatedOrders = [...existing, newOs];
    await syncData('orders', updatedOrders);

    // Atualizar KM do veículo
    const updatedVehicles = allVehicles.map(v => 
      v.id === selectedVehicle.id ? { ...v, km: parseFloat(currentKm) || v.km } : v
    );
    await syncData('vehicles', updatedVehicles);

    setOsData(newOs);
    setShowInvoice(true);
  };

  const filteredClients = clientSearch.length > 0 
    ? clients.filter(c => c.name.toLowerCase().includes(clientSearch.toLowerCase()) || c.phone.includes(clientSearch))
    : [];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-32 animate-in slide-in-from-bottom duration-500">
      <div className="flex items-center justify-between no-print px-4 md:px-0">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors">
          <ChevronLeft size={20} />
          <span className="font-black uppercase text-[10px] tracking-widest">Voltar</span>
        </button>
        <div className="text-right">
          <h1 className="text-2xl font-black text-white italic uppercase tracking-tighter">Gerar Nota <span className="text-[#E11D48]">Elite</span></h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 no-print px-4 md:px-0">
        <div className="lg:col-span-2 space-y-6">
          
          {/* BUSCA DE CLIENTE - FIX CRÍTICO */}
          <div className="bg-[#0F0F0F] border border-[#1F1F1F] p-8 rounded-[2.5rem] shadow-2xl space-y-6 relative overflow-visible">
            {!selectedClient ? (
              <div className="space-y-4">
                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Buscar Cliente Cadastrado</label>
                <div className="relative">
                   <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-700" size={20} />
                   <input 
                    type="text" 
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    placeholder="Nome ou Telefone do Cliente..."
                    className="w-full bg-[#050505] border-2 border-[#1F1F1F] rounded-[2rem] pl-16 pr-6 py-6 text-white font-bold outline-none focus:border-[#E11D48] transition-all"
                   />
                </div>
                
                {filteredClients.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-4 bg-[#0F0F0F] border border-[#1F1F1F] rounded-[2rem] overflow-hidden z-[100] shadow-2xl max-h-[300px] overflow-y-auto no-scrollbar border-t-0">
                    {filteredClients.map(c => (
                      <button 
                        key={c.id} 
                        onClick={() => handleSelectClient(c)}
                        className="w-full p-6 flex items-center justify-between hover:bg-zinc-900 border-b border-[#1F1F1F] text-left active:bg-[#E11D48] group"
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
                
                {clientSearch.length > 2 && filteredClients.length === 0 && (
                  <div className="p-10 text-center bg-zinc-950/50 rounded-[2rem] border-2 border-dashed border-zinc-800">
                    <p className="text-zinc-600 font-bold text-xs uppercase italic">Nenhum cliente encontrado com este nome.</p>
                    <button onClick={() => navigate('/clients')} className="mt-4 text-[#E11D48] text-[10px] font-black uppercase tracking-widest hover:underline">Cadastrar Novo Cliente</button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex items-center justify-between p-6 bg-[#050505] border border-zinc-800 rounded-[2rem]">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#E11D48]/10 text-[#E11D48] rounded-xl flex items-center justify-center">
                      <User size={24} />
                    </div>
                    <div>
                      <p className="text-xs font-black text-zinc-600 uppercase tracking-widest">Cliente Selecionado</p>
                      <h3 className="text-lg font-black text-white uppercase italic">{selectedClient.name}</h3>
                    </div>
                  </div>
                  <button onClick={() => setSelectedClient(null)} className="p-2 text-zinc-700 hover:text-white"><X size={20}/></button>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Escolher Veículo do Cliente</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {clientVehicles.map(v => (
                      <button 
                        key={v.id}
                        onClick={() => handleVehicleChange(v.id)}
                        className={`p-6 rounded-[2rem] border-2 text-left transition-all ${selectedVehicle?.id === v.id ? 'bg-[#E11D48]/10 border-[#E11D48] shadow-xl' : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}
                      >
                        <Car size={20} className={`mb-3 ${selectedVehicle?.id === v.id ? 'text-[#E11D48]' : 'text-zinc-800'}`} />
                        <p className={`font-black uppercase tracking-widest ${selectedVehicle?.id === v.id ? 'text-white' : 'text-zinc-400'}`}>{v.plate}</p>
                        <p className="text-[9px] font-black uppercase opacity-60">{v.model}</p>
                      </button>
                    ))}
                    <button 
                      onClick={() => navigate(`/clients/${selectedClient.id}`)}
                      className="p-6 rounded-[2rem] border-2 border-dashed border-zinc-800 text-zinc-700 hover:text-white hover:border-zinc-600 transition-all flex flex-col items-center justify-center gap-2"
                    >
                      <PlusCircle size={20} />
                      <span className="text-[9px] font-black uppercase tracking-widest">Adicionar Veículo</span>
                    </button>
                  </div>
                </div>

                {selectedVehicle && (
                  <div className="pt-6 border-t border-zinc-800 animate-in slide-in-from-top duration-300">
                    <label className="text-[10px] font-black text-[#E11D48] uppercase tracking-[0.2em] mb-4 block ml-1">Quilometragem na Entrada</label>
                    <input 
                      type="number" 
                      value={currentKm}
                      onChange={(e) => setCurrentKm(e.target.value)}
                      className="w-full bg-[#050505] border-2 border-[#1F1F1F] rounded-2xl px-6 py-5 text-2xl font-black text-white focus:border-[#E11D48] outline-none"
                      placeholder="000.000"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* SERVIÇO E ITENS */}
          {selectedVehicle && (
            <div className="space-y-6 animate-in slide-in-from-bottom duration-500">
              <div className="bg-[#0F0F0F] border border-[#1F1F1F] p-8 rounded-[2.5rem] shadow-xl">
                 <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-6 flex items-center gap-2 italic">
                  <Wrench size={16} className="text-[#E11D48]" /> Relato Técnico
                 </h3>
                 <textarea 
                   value={problem}
                   onChange={(e) => setProblem(e.target.value)}
                   rows={4}
                   placeholder="O QUE FOI REALIZADO NESTE VEÍCULO?"
                   className="w-full bg-[#050505] border-2 border-[#1F1F1F] rounded-[2rem] p-6 text-sm text-white focus:border-[#E11D48] outline-none font-bold"
                 />
              </div>

              <div className="bg-[#0F0F0F] border border-[#1F1F1F] p-8 rounded-[2.5rem] shadow-xl space-y-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] flex items-center gap-2 italic">
                    <Package size={16} className="text-[#E11D48]" /> Peças Aplicadas
                  </h3>
                  <button 
                    onClick={() => addItem('PART')}
                    className="bg-[#E11D48] text-white p-3 rounded-xl hover:scale-105 active:scale-90 transition-all shadow-lg"
                  >
                    <Plus size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  {items.map(item => (
                    <div key={item.id} className="flex flex-col sm:flex-row gap-4 p-5 bg-[#050505] border border-zinc-800 rounded-[2rem] items-center group relative animate-in zoom-in">
                      <div className="w-full sm:flex-1">
                        <input 
                          type="text" 
                          placeholder="Descrição da Peça..."
                          value={item.description}
                          onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                          className="w-full bg-transparent border-b border-zinc-800 py-2 text-sm text-white font-bold outline-none focus:border-[#E11D48]" 
                        />
                      </div>
                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className="flex flex-col gap-1 items-center">
                          <span className="text-[8px] font-black text-zinc-700 uppercase">Qtd</span>
                          <input 
                            type="number" 
                            value={item.quantity}
                            onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                            className="w-16 bg-zinc-900 border border-zinc-800 rounded-xl py-2 text-center text-xs font-black" 
                          />
                        </div>
                        <div className="flex flex-col gap-1 items-center">
                          <span className="text-[8px] font-black text-zinc-700 uppercase">Preço Un.</span>
                          <input 
                            type="number" 
                            value={item.unitPrice}
                            onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                            className="w-24 bg-zinc-900 border border-zinc-800 rounded-xl py-2 text-center text-xs font-black" 
                          />
                        </div>
                        <button onClick={() => removeItem(item.id)} className="p-2 text-zinc-700 hover:text-red-500 mt-4"><Trash2 size={20} /></button>
                      </div>
                    </div>
                  ))}
                  {items.length === 0 && (
                    <div className="py-12 text-center bg-zinc-950/30 border-2 border-dashed border-zinc-800 rounded-[2.5rem]">
                       <p className="text-[10px] font-black text-zinc-700 uppercase tracking-widest italic">Nenhuma peça adicionada</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SIDEBAR DE VALORES */}
        <div className="space-y-6">
          <div className="bg-[#0F0F0F] border border-[#1F1F1F] p-8 rounded-[2.5rem] shadow-2xl space-y-8 sticky top-6">
            <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-2 block ml-1 text-center">Resumo Financeiro</h3>
            
            <div className="space-y-6">
               <div>
                  <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest block mb-3 ml-2">Valor Mão de Obra</label>
                  <div className="relative">
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-700 font-black italic">R$</span>
                      <input 
                        type="number" 
                        value={labor || ''} 
                        onChange={(e) => setLabor(parseFloat(e.target.value) || 0)} 
                        className="w-full bg-[#050505] border border-zinc-800 rounded-2xl pl-14 pr-6 py-4 text-white font-black text-xl outline-none focus:border-[#E11D48]" 
                        placeholder="0,00"
                      />
                  </div>
               </div>

               <div>
                  <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest block mb-3 ml-2">Desconto Eventual</label>
                  <div className="relative">
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-700 font-black italic">R$</span>
                      <input 
                        type="number" 
                        value={discount || ''} 
                        onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)} 
                        className="w-full bg-[#050505] border border-zinc-800 rounded-2xl pl-14 pr-6 py-4 text-white font-black text-xl outline-none focus:border-emerald-500" 
                        placeholder="0,00"
                      />
                  </div>
               </div>

               <div className="p-8 bg-[#E11D48] rounded-[2.5rem] shadow-xl shadow-red-900/10 active-glow">
                  <p className="text-[9px] font-black text-white/50 uppercase tracking-widest mb-1">Total da Nota</p>
                  <p className="text-4xl font-black text-white leading-none">R$ {calculateTotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
               </div>

               <div className="space-y-4">
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest text-center block">Situação do Pagamento</label>
                  <div className="grid grid-cols-2 gap-3">
                     <button 
                      onClick={() => setPaymentStatus(PaymentStatus.PAGO)}
                      className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all
                      ${paymentStatus === PaymentStatus.PAGO ? 'bg-emerald-500 text-white border-emerald-500 glow-emerald shadow-lg' : 'bg-[#050505] text-zinc-700 border-[#1F1F1F]'}`}
                     >
                       Recebido
                     </button>
                     <button 
                      onClick={() => setPaymentStatus(PaymentStatus.PENDENTE)}
                      className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all
                      ${paymentStatus === PaymentStatus.PENDENTE ? 'bg-amber-500 text-white border-amber-500 glow-amber shadow-lg' : 'bg-[#050505] text-zinc-700 border-[#1F1F1F]'}`}
                     >
                       A Pagar
                     </button>
                  </div>
               </div>

               <button 
                onClick={handleFinalize}
                className="w-full bg-white text-black py-6 rounded-[2.5rem] font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-white/5 hover:bg-[#E11D48] hover:text-white transition-all active:scale-95"
               >
                 Finalizar e Gerar Nota
               </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DE NOTA FISCAL (Mantido igual, mas agora com dados scoped) */}
      {showInvoice && osData && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/98 p-0 sm:p-4 overflow-y-auto no-scrollbar">
          <div className="bg-white w-full max-w-[210mm] min-h-screen sm:min-h-0 sm:rounded-[2rem] p-0 text-zinc-900 shadow-2xl relative flex flex-col">
             {/* Toolbar e Area de Print */}
             <div className="no-print bg-zinc-100 p-6 flex flex-wrap gap-3 justify-between items-center border-b border-zinc-200 sticky top-0 z-[210]">
               <div className="flex flex-wrap gap-2">
                 <button onClick={() => window.print()} className="bg-zinc-900 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase flex items-center gap-2">
                   <Printer size={18} /> Imprimir A4
                 </button>
                 <button onClick={() => setShowInvoice(false)} className="bg-zinc-200 text-zinc-700 px-6 py-3 rounded-2xl text-[10px] font-black uppercase flex items-center gap-2">
                   Novo Serviço
                 </button>
               </div>
               <button onClick={() => setShowInvoice(false)} className="p-3 text-zinc-400 hover:text-zinc-900"><X size={32} /></button>
             </div>

             <div className="p-10 md:p-20 text-zinc-900 flex flex-col flex-1 bg-white">
                <div className="flex justify-between items-start mb-10 pb-8 border-b-2 border-zinc-100">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center text-white">
                      <Wrench size={36} />
                    </div>
                    <div>
                      <h1 className="text-3xl font-black tracking-tighter uppercase">KAEN <span className="text-zinc-500">MECÂNICA</span></h1>
                      <p className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.2em]">SISTEMA DE GESTÃO ELITE</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">OS Nº</p>
                    <p className="text-3xl font-black">{osData.osNumber}</p>
                    <p className="text-xs font-bold text-zinc-500">{new Date(osData.createdAt).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 mb-10">
                   <div className="bg-zinc-50 p-6 rounded-[2rem] border border-zinc-100">
                      <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Proprietário</p>
                      <p className="text-xl font-black">{osData.clientName}</p>
                      <p className="text-xs font-bold text-zinc-500 mt-1">{selectedClient?.phone}</p>
                   </div>
                   <div className="bg-zinc-50 p-6 rounded-[2rem] border border-zinc-100">
                      <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Veículo / KM</p>
                      <p className="text-lg font-black uppercase">{osData.vehiclePlate} • {osData.vehicleModel}</p>
                      <p className="text-base font-black text-[#E11D48]">{osData.vehicleKm} KM</p>
                   </div>
                </div>

                <div className="flex-1">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead className="border-b-2 border-zinc-100">
                      <tr className="text-zinc-400 uppercase font-black text-[10px] tracking-widest">
                        <th className="py-4">Descrição do Item/Serviço</th>
                        <th className="py-4 text-center w-20">Qtd</th>
                        <th className="py-4 text-right w-32">V. Unitário</th>
                        <th className="py-4 text-right w-32">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {osData.items.map((item, i) => (
                        <tr key={i}>
                          <td className="py-5 font-bold text-zinc-800">{item.description}</td>
                          <td className="py-5 text-center font-black text-zinc-400">{item.quantity}</td>
                          <td className="py-5 text-right text-zinc-500">R$ {item.unitPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                          <td className="py-5 text-right font-black text-zinc-900">R$ {(item.quantity * item.unitPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        </tr>
                      ))}
                      {osData.laborValue > 0 && (
                        <tr className="bg-zinc-50/50">
                          <td className="py-5 font-black text-zinc-900">MÃO DE OBRA TÉCNICA ESPECIALIZADA</td>
                          <td className="py-5 text-center font-black text-zinc-400">01</td>
                          <td className="py-5 text-right text-zinc-500">R$ {osData.laborValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                          <td className="py-5 text-right font-black text-zinc-900">R$ {osData.laborValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="mt-10 pt-10 border-t-2 border-zinc-100">
                   <div className="flex justify-between items-end">
                      <div className="space-y-6">
                        <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest inline-block border ${osData.paymentStatus === PaymentStatus.PAGO ? 'text-emerald-600 border-emerald-100 bg-emerald-50' : 'text-amber-600 border-amber-100 bg-amber-50'}`}>
                          SITUAÇÃO: {osData.paymentStatus.toUpperCase()}
                        </div>
                        <div className="flex flex-col items-start gap-1">
                          <div className="w-64 h-px bg-zinc-200 mb-2"></div>
                          <p className="text-[9px] text-zinc-400 font-black uppercase tracking-widest">Responsável Técnico</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Total Geral da Nota</p>
                        <p className="text-5xl font-black text-zinc-900 leading-none">R$ {osData.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      </div>
                   </div>
                </div>

                <div className="mt-16 text-center text-[10px] font-black text-zinc-300 uppercase tracking-[0.5em]">
                  KAEN MECÂNICA • CONFIANÇA EM CADA KM
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewServiceOrder;
