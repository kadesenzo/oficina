
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Plus, 
  Trash2, 
  Wrench, 
  Package, 
  ChevronLeft,
  X,
  PlusCircle,
  Car,
  User,
  Search,
  ChevronRight,
  Loader2,
  Download,
  DollarSign,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Client, Vehicle, OSItem, OSStatus, ServiceOrder, PaymentStatus, UserSession } from '../types';
import { GoogleGenAI } from "@google/genai";
import html2canvas from 'html2canvas';

const NewServiceOrder: React.FC<{ session?: UserSession; syncData?: (key: string, data: any) => Promise<void> }> = ({ session, syncData }) => {
  const navigate = useNavigate();
  const invoiceRef = useRef<HTMLDivElement>(null);
  
  const [clients, setClients] = useState<Client[]>([]);
  const [allVehicles, setAllVehicles] = useState<Vehicle[]>([]);
  const [clientSearch, setClientSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientVehicles, setClientVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  
  const [currentKm, setCurrentKm] = useState('');
  const [problem, setProblem] = useState('');
  const [items, setItems] = useState<OSItem[]>([]);
  const [labor, setLabor] = useState<string>('0');
  const [discount, setDiscount] = useState<string>('0');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(PaymentStatus.PENDENTE);
  
  const [showInvoice, setShowInvoice] = useState(false);
  const [osData, setOsData] = useState<ServiceOrder | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    if (session) {
      const userClients = JSON.parse(localStorage.getItem(`kaenpro_${session.username}_clients`) || '[]');
      const userVehicles = JSON.parse(localStorage.getItem(`kaenpro_${session.username}_vehicles`) || '[]');
      setClients(userClients);
      setAllVehicles(userVehicles);
    }
  }, [session]);

  const filteredClients = useMemo(() => {
    const term = clientSearch.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (!term) return [];
    return clients.filter(c => {
      const name = c.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return name.includes(term) || c.phone.includes(term);
    });
  }, [clientSearch, clients]);

  const handleAiSuggest = async () => {
    if (!problem || !selectedVehicle) {
      alert("Descreva o sintoma primeiro.");
      return;
    }

    if (!process.env.API_KEY) {
      alert("IA Indisponível.");
      return;
    }

    setIsAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analise o problema: "${problem}" no ${selectedVehicle.model}. Sugira peças e mão de obra em JSON: {"items": [{"desc": "nome", "price": 0}], "labor": 0}`,
      });
      
      const data = JSON.parse(response.text.replace(/```json|```/g, "").trim());
      const newItems: OSItem[] = data.items.map((i: any) => ({
        id: Math.random().toString(36).substr(2, 9),
        description: i.desc.toUpperCase(),
        quantity: 1,
        unitPrice: i.price,
        type: 'PART'
      }));

      setItems([...items, ...newItems]);
      setLabor(data.labor.toString());
    } catch (err) {
      alert("Erro na IA.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSelectClient = (client: Client) => {
    setSelectedClient(client);
    setClientSearch('');
    setClientVehicles(allVehicles.filter(v => v.clientId === client.id));
  };

  const addItem = () => {
    setItems([...items, { id: Math.random().toString(36).substr(2, 9), description: '', quantity: 1, unitPrice: 0, type: 'PART' }]);
  };

  const updateItem = (id: string, field: keyof OSItem, value: any) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const totalValue = useMemo(() => {
    const itemsSum = items.reduce((acc, curr) => acc + (curr.quantity * curr.unitPrice), 0);
    return itemsSum + (parseFloat(labor) || 0) - (parseFloat(discount) || 0);
  }, [items, labor, discount]);

  const handleFinalize = async () => {
    if (!selectedClient || !selectedVehicle || !session || !syncData) return;
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
      totalValue,
      status: OSStatus.FINALIZADO,
      paymentStatus,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const existing = JSON.parse(localStorage.getItem(`kaenpro_${session.username}_orders`) || '[]');
    await syncData('orders', [...existing, newOs]);
    setOsData(newOs);
    setShowInvoice(true);
  };

  const downloadAsImage = async () => {
    if (!invoiceRef.current) return;
    setIsGeneratingImage(true);
    const canvas = await html2canvas(invoiceRef.current, { scale: 3, backgroundColor: '#ffffff' });
    const link = document.createElement('a');
    link.download = `Nota_${osData?.osNumber}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    setIsGeneratingImage(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 animate-in fade-in duration-500">
      <div className="flex items-center justify-between px-4 md:px-0">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-zinc-600 hover:text-white transition-colors">
          <ChevronLeft size={18} />
          <span className="font-bold uppercase text-[10px] tracking-widest">Painel Anterior</span>
        </button>
        <h1 className="text-xl font-black text-white italic uppercase tracking-tighter">EMITIR <span className="text-[#E11D48]">NOTA FISCAL</span></h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4 md:px-0">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#0c0c0e] border border-zinc-900 p-8 rounded-3xl shadow-xl">
            {!selectedClient ? (
              <div className="space-y-4">
                <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest ml-1">1. Selecionar Proprietário</label>
                <div className="relative">
                   <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-700" size={18} />
                   <input 
                    type="text" value={clientSearch} onChange={(e) => setClientSearch(e.target.value)}
                    placeholder="Nome ou WhatsApp..."
                    className="w-full bg-[#050505] border border-zinc-800 rounded-2xl pl-14 pr-6 py-5 text-white font-bold outline-none focus:border-[#E11D48] transition-all"
                   />
                </div>
                {filteredClients.map(c => (
                  <button key={c.id} onClick={() => handleSelectClient(c)} className="w-full p-5 flex justify-between bg-zinc-900/30 rounded-2xl border border-zinc-800/50 hover:bg-[#E11D48] group transition-all">
                    <span className="font-bold text-zinc-400 group-hover:text-white uppercase text-xs">{c.name}</span>
                    <ChevronRight size={16} className="text-zinc-700 group-hover:text-white" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-[#050505] border border-zinc-800 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#E11D48]/10 text-[#E11D48] rounded-xl flex items-center justify-center"><User size={20} /></div>
                    <h3 className="text-sm font-bold text-white uppercase italic">{selectedClient.name}</h3>
                  </div>
                  <button onClick={() => setSelectedClient(null)} className="p-2 text-zinc-600 hover:text-white"><X size={18}/></button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {clientVehicles.map(v => (
                    <button key={v.id} onClick={() => setSelectedVehicle(v)} className={`p-5 rounded-2xl border transition-all text-left ${selectedVehicle?.id === v.id ? 'bg-[#E11D48]/10 border-[#E11D48]' : 'bg-zinc-900/30 border-zinc-800'}`}>
                      <p className="font-black text-white text-sm uppercase">{v.plate}</p>
                      <p className="text-[9px] text-zinc-600 font-bold uppercase">{v.model}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {selectedVehicle && (
            <div className="bg-[#0c0c0e] border border-zinc-900 p-8 rounded-3xl shadow-xl space-y-6">
              <div className="flex items-center justify-between">
                 <h3 className="text-[10px] font-bold text-zinc-500 uppercase flex items-center gap-2 italic">
                  <Wrench size={14} className="text-[#E11D48]" /> Serviços & Peças
                 </h3>
                 <button 
                  onClick={handleAiSuggest} 
                  className="bg-zinc-900 border border-zinc-800 text-[#E11D48] px-4 py-2 rounded-xl flex items-center gap-2 text-[9px] font-bold uppercase"
                 >
                   <Sparkles size={12}/> Sugerir com IA
                 </button>
              </div>
              <textarea 
                value={problem} onChange={(e) => setProblem(e.target.value)} rows={3}
                placeholder="Descrição dos serviços realizados..."
                className="w-full bg-[#050505] border border-zinc-800 rounded-2xl p-5 text-xs text-white focus:border-[#E11D48] outline-none font-medium"
              />
              
              <div className="space-y-3">
                {items.map(item => (
                  <div key={item.id} className="flex gap-3 p-3 bg-zinc-900/40 border border-zinc-800 rounded-xl items-center">
                    <input type="text" placeholder="Item/Peça" value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value.toUpperCase())} className="flex-1 bg-transparent border-none text-[10px] text-white font-bold outline-none uppercase" />
                    <input type="number" value={item.quantity} onChange={(e) => updateItem(item.id, 'quantity', e.target.value)} className="w-10 bg-zinc-950 rounded-lg py-1.5 text-center text-[10px] font-bold" />
                    <input type="number" value={item.unitPrice} onChange={(e) => updateItem(item.id, 'unitPrice', e.target.value)} className="w-16 bg-zinc-950 rounded-lg py-1.5 text-center text-[10px] font-bold" />
                    <button onClick={() => setItems(items.filter(i => i.id !== item.id))} className="text-zinc-800 hover:text-red-500"><Trash2 size={14}/></button>
                  </div>
                ))}
                <button onClick={addItem} className="text-[9px] font-bold text-zinc-500 uppercase flex items-center gap-2 hover:text-white transition-colors ml-2"><Plus size={12}/> Adicionar novo item manualmente</button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-[#0c0c0e] border border-zinc-900 p-8 rounded-3xl shadow-xl space-y-6 h-fit sticky top-6">
           <div className="p-6 bg-[#E11D48] rounded-2xl shadow-xl relative overflow-hidden glow-red">
              <p className="text-[9px] font-bold text-white/60 uppercase tracking-widest mb-1 italic">Subtotal da OS</p>
              <p className="text-3xl font-black text-white italic">R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              <DollarSign className="absolute top-1/2 -right-4 -translate-y-1/2 text-white/10" size={80} />
           </div>
           <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[9px] font-bold text-zinc-600 uppercase ml-2 italic">Valor de Mão de Obra (R$)</label>
                <input type="number" value={labor} onChange={(e) => setLabor(e.target.value)} className="w-full bg-[#050505] border border-zinc-800 rounded-xl px-5 py-4 text-white font-bold text-lg outline-none" />
              </div>
              <button onClick={handleFinalize} disabled={!selectedVehicle} className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-[#E11D48] hover:text-white transition-all disabled:opacity-20">Finalizar e Gerar Nota</button>
           </div>
        </div>
      </div>

      {showInvoice && osData && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 overflow-y-auto p-4 md:p-10 no-scrollbar">
          <div className="bg-white w-full max-w-[210mm] rounded-3xl text-zinc-900 shadow-2xl relative">
             <div className="no-print bg-zinc-100 p-5 flex justify-between border-b rounded-t-3xl">
               <button onClick={downloadAsImage} className="bg-[#E11D48] text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 active:scale-95 transition-all">
                 {isGeneratingImage ? <Loader2 className="animate-spin" size={14}/> : <Download size={14}/>} Salvar Nota como Imagem
               </button>
               <button onClick={() => setShowInvoice(false)} className="text-zinc-400 hover:text-black"><X size={24}/></button>
             </div>
             
             <div ref={invoiceRef} className="p-16 bg-white min-h-[297mm]">
                <div className="flex justify-between border-b-2 border-zinc-100 pb-10 mb-10">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-black rounded-xl flex items-center justify-center text-white"><Wrench size={28}/></div>
                    <div>
                      <h1 className="text-2xl font-black tracking-tighter italic uppercase leading-none">KAEN <span className="text-zinc-400">PRO</span></h1>
                      <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Centro de Manutenção Automotiva</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-bold text-zinc-300 uppercase italic">ORDEM DE SERVIÇO</p>
                    <p className="text-2xl font-black">#{osData.osNumber}</p>
                    <p className="text-[10px] font-bold text-zinc-400">{new Date(osData.createdAt).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 mb-12">
                   <div className="bg-zinc-50/50 p-6 rounded-2xl border border-zinc-100">
                      <p className="text-[9px] font-bold text-zinc-400 uppercase italic mb-1">Proprietário</p>
                      <p className="text-lg font-black uppercase italic text-zinc-800">{osData.clientName}</p>
                   </div>
                   <div className="bg-zinc-50/50 p-6 rounded-2xl border border-zinc-100">
                      <p className="text-[9px] font-bold text-zinc-400 uppercase italic mb-1">Identificação Veicular</p>
                      <p className="text-lg font-black uppercase italic text-zinc-800">{osData.vehiclePlate} • {osData.vehicleModel}</p>
                      <p className="text-xs font-bold text-zinc-400 mt-1">{osData.vehicleKm} KM RODADOS</p>
                   </div>
                </div>

                <div className="mb-12">
                  <p className="text-[9px] font-bold text-zinc-300 uppercase italic mb-4 border-b border-zinc-100 pb-2">Discriminação Técnica</p>
                  <p className="text-sm text-zinc-600 font-medium leading-relaxed italic">"{osData.problem || 'Serviços de manutenção preventiva e corretiva realizados conforme padrões técnicos.'}"</p>
                </div>

                <table className="w-full text-left mb-16">
                  <thead className="border-b-2 border-zinc-100">
                    <tr className="text-[9px] font-bold uppercase text-zinc-400">
                      <th className="py-4">Descrição do Item</th>
                      <th className="py-4 text-center">Qtd</th>
                      <th className="py-4 text-right italic">Valor Parcial</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50">
                    {osData.items.map((i,idx)=>(
                      <tr key={idx}>
                        <td className="py-5 font-bold uppercase italic text-[11px] text-zinc-700">{i.description}</td>
                        <td className="py-5 text-center font-bold text-zinc-400">{i.quantity}</td>
                        <td className="py-5 text-right font-black italic text-zinc-800">R$ {(i.quantity*i.unitPrice).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                      </tr>
                    ))}
                    {osData.laborValue > 0 && (
                      <tr className="bg-zinc-50/30">
                        <td className="py-5 font-black uppercase italic text-[11px] text-zinc-900">MÃO DE OBRA ESPECIALIZADA</td>
                        <td className="py-5 text-center font-bold text-zinc-400">01</td>
                        <td className="py-5 text-right font-black italic text-zinc-900">R$ {osData.laborValue.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                      </tr>
                    )}
                  </tbody>
                </table>

                <div className="flex justify-between items-end border-t-2 border-zinc-100 pt-10">
                  <div className="text-[9px] font-bold text-zinc-300 uppercase tracking-[0.2em] italic">
                    KAENPRO MOTORS • QUALIDADE EM PRIMEIRO LUGAR
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-zinc-400 italic uppercase mb-1">VALOR TOTAL DO INVESTIMENTO</p>
                    <p className="text-5xl font-black italic text-zinc-900">R$ {osData.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewServiceOrder;
