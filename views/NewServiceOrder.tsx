
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Search, 
  Wrench, 
  Package, 
  Save, 
  ChevronLeft,
  Printer,
  X,
  PlusCircle,
  FileText,
  Camera,
  CreditCard,
  Clock,
  CheckCircle2,
  Download,
  Share2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Client, Vehicle, OSItem, OSStatus, Part, ServiceOrder, PaymentStatus } from '../types';

const NewServiceOrder: React.FC = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [vehicleInfo, setVehicleInfo] = useState({ plate: '', model: '', year: '', km: '' });
  const [problem, setProblem] = useState('');
  const [items, setItems] = useState<OSItem[]>([]);
  const [labor, setLabor] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(PaymentStatus.PENDENTE);
  const [showInvoice, setShowInvoice] = useState(false);
  const [osData, setOsData] = useState<ServiceOrder | null>(null);

  useEffect(() => {
    setClients(JSON.parse(localStorage.getItem('kaenpro_clients') || '[]'));
    setParts(JSON.parse(localStorage.getItem('kaenpro_parts') || '[]'));
  }, []);

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

  const handleFinalize = () => {
    if (!selectedClient || !vehicleInfo.plate) {
      alert("Por favor, selecione um cliente e informe o veículo (Placa).");
      return;
    }

    if (!vehicleInfo.km) {
      alert("Por favor, informe a quilometragem (KM) do veículo.");
      return;
    }

    if (items.length === 0 && labor === 0) {
      alert("Adicione pelo menos um item ou valor de mão de obra.");
      return;
    }

    const newOs: ServiceOrder = {
      id: Math.random().toString(36).substr(2, 9),
      osNumber: `KP-${Date.now().toString().slice(-6)}`,
      clientId: selectedClient.id,
      clientName: selectedClient.name,
      vehicleId: 'new',
      vehiclePlate: vehicleInfo.plate.toUpperCase(),
      vehicleModel: vehicleInfo.model,
      vehicleKm: vehicleInfo.km, // Adicionado campo de KM
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

    const existing = JSON.parse(localStorage.getItem('kaenpro_orders') || '[]');
    localStorage.setItem('kaenpro_orders', JSON.stringify([...existing, newOs]));

    // Atualiza KM no veículo persistido se houver placa correspondente
    const savedVehicles = JSON.parse(localStorage.getItem('kaenpro_vehicles') || '[]');
    const vehicleIdx = savedVehicles.findIndex((v: any) => v.plate === vehicleInfo.plate.toUpperCase());
    if (vehicleIdx !== -1) {
      savedVehicles[vehicleIdx].km = parseFloat(vehicleInfo.km);
      localStorage.setItem('kaenpro_vehicles', JSON.stringify(savedVehicles));
    }

    setOsData(newOs);
    setShowInvoice(true);
  };

  const shareWhatsApp = () => {
    if (!osData) return;
    
    let message = `*KAEN MECÂNICA - NOTA #${osData.osNumber}*\n`;
    message += `-----------------------------\n`;
    message += `*Cliente:* ${osData.clientName}\n`;
    message += `*Veículo:* ${osData.vehicleModel} (${osData.vehiclePlate})\n`;
    message += `*KM:* ${osData.vehicleKm} km\n`;
    message += `*Data:* ${new Date(osData.createdAt).toLocaleDateString('pt-BR')}\n`;
    message += `-----------------------------\n`;
    message += `*ITENS / SERVIÇOS:*\n`;
    
    osData.items.forEach(item => {
      message += `- ${item.description}: R$ ${(item.quantity * item.unitPrice).toLocaleString('pt-BR')}\n`;
    });
    
    if (osData.laborValue > 0) {
      message += `- Mão de Obra: R$ ${osData.laborValue.toLocaleString('pt-BR')}\n`;
    }
    
    if (osData.discount > 0) {
      message += `- Desconto: - R$ ${osData.discount.toLocaleString('pt-BR')}\n`;
    }
    
    message += `-----------------------------\n`;
    message += `*TOTAL FINAL: R$ ${osData.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}*\n`;
    message += `*Status:* ${osData.paymentStatus.toUpperCase()}\n`;
    message += `-----------------------------\n`;
    message += `Kaen Mecânica - Agradecemos a preferência!`;

    const phone = selectedClient?.phone.replace(/\D/g, '') || '';
    window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 animate-in slide-in-from-bottom duration-500">
      <div className="flex items-center justify-between no-print">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors">
          <ChevronLeft size={20} />
          <span className="font-bold">Voltar</span>
        </button>
        <h1 className="text-2xl font-black text-white">Nova Nota de Serviço</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 no-print">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] space-y-6 shadow-xl">
            <h3 className="text-lg font-bold flex items-center gap-2"><PlusCircle className="text-[#A32121]" /> Identificação</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Cliente</label>
                  <select 
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3.5 focus:ring-1 focus:ring-[#A32121] outline-none transition-all text-white"
                    onChange={(e) => setSelectedClient(clients.find(c => c.id === e.target.value) || null)}
                    value={selectedClient?.id || ''}
                  >
                    <option value="">Selecione um cliente...</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Placa do Veículo</label>
                  <input 
                    type="text" 
                    value={vehicleInfo.plate}
                    onChange={(e) => setVehicleInfo({...vehicleInfo, plate: e.target.value.toUpperCase()})}
                    placeholder="ABC-1234" 
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 focus:ring-1 focus:ring-[#A32121] outline-none text-white font-bold" 
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Modelo / Marca</label>
                  <input 
                    type="text" 
                    value={vehicleInfo.model}
                    onChange={(e) => setVehicleInfo({...vehicleInfo, model: e.target.value})}
                    placeholder="Ex: Corolla XEI" 
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 focus:ring-1 focus:ring-[#A32121] outline-none text-white" 
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#A32121] uppercase tracking-widest ml-1">KM Atual *</label>
                  <input 
                    type="number" 
                    value={vehicleInfo.km}
                    onChange={(e) => setVehicleInfo({...vehicleInfo, km: e.target.value})}
                    placeholder="Ex: 123456" 
                    className="w-full bg-zinc-950 border border-[#A32121]/50 border-2 rounded-xl px-4 py-3 focus:ring-1 focus:ring-[#A32121] outline-none text-white font-black" 
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] space-y-4 shadow-xl">
             <h3 className="text-lg font-bold">Resumo do Serviço</h3>
             <textarea 
               value={problem}
               onChange={(e) => setProblem(e.target.value)}
               rows={3}
               placeholder="O que está sendo feito no veículo?"
               className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-4 focus:ring-1 focus:ring-[#A32121] text-sm outline-none text-white"
             />
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold flex items-center gap-2"><FileText size={20} className="text-[#A32121]" /> Peças e Serviços</h3>
              <div className="flex gap-2">
                <button onClick={() => addItem('SERVICE')} className="text-[10px] font-black uppercase text-zinc-400 bg-zinc-800 px-4 py-2 rounded-lg hover:text-white transition-all">+ Serviço</button>
                <button onClick={() => addItem('PART')} className="text-[10px] font-black uppercase text-[#A32121] bg-[#A32121]/10 px-4 py-2 rounded-lg hover:bg-[#A32121] hover:text-white transition-all">+ Peça</button>
              </div>
            </div>

            <div className="space-y-3">
              {items.map(item => (
                <div key={item.id} className="flex flex-col sm:flex-row gap-3 p-3 bg-zinc-950 border border-zinc-800 rounded-2xl items-center group">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${item.type === 'PART' ? 'bg-[#A32121]/10 text-[#A32121]' : 'bg-zinc-800 text-zinc-500'}`}>
                    {item.type === 'PART' ? <Package size={14} /> : <Wrench size={14} />}
                  </div>
                  <input 
                    type="text" 
                    placeholder="Descrição do item..."
                    value={item.description}
                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                    className="flex-1 bg-transparent border-b border-zinc-800 py-1 text-sm focus:border-[#A32121] outline-none text-white" 
                  />
                  <div className="flex gap-3 items-center">
                    <div className="flex flex-col">
                      <span className="text-[8px] text-zinc-600 font-bold uppercase mb-1">Qtd</span>
                      <input 
                        type="number" 
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                        className="w-12 bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-center text-xs text-white" 
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[8px] text-zinc-600 font-bold uppercase mb-1">Preço R$</span>
                      <input 
                        type="number" 
                        value={item.unitPrice}
                        onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="w-24 bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-center text-xs text-white" 
                      />
                    </div>
                    <button onClick={() => removeItem(item.id)} className="text-zinc-700 hover:text-red-500 transition-colors mt-4 sm:mt-0"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
              {items.length === 0 && <p className="text-center text-zinc-600 text-xs py-8 italic">Adicione peças ou serviços acima.</p>}
            </div>
          </div>
        </div>

        <div className="space-y-6 no-print">
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] space-y-6 shadow-xl text-white">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2"><CreditCard size={14} /> Pagamento</h3>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => setPaymentStatus(PaymentStatus.PAGO)}
                className={`p-4 rounded-2xl flex items-center justify-between border transition-all ${paymentStatus === PaymentStatus.PAGO ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' : 'bg-zinc-950 border-zinc-800 text-zinc-500'}`}
              >
                <span className="text-xs font-bold uppercase tracking-widest">Pago</span>
                <CheckCircle2 size={18} className={paymentStatus === PaymentStatus.PAGO ? 'opacity-100' : 'opacity-0'} />
              </button>
              <button 
                onClick={() => setPaymentStatus(PaymentStatus.PENDENTE)}
                className={`p-4 rounded-2xl flex items-center justify-between border transition-all ${paymentStatus === PaymentStatus.PENDENTE ? 'bg-amber-500/10 border-amber-500 text-amber-500' : 'bg-zinc-950 border-zinc-800 text-zinc-500'}`}
              >
                <span className="text-xs font-bold uppercase tracking-widest">Pendente</span>
                <Clock size={18} className={paymentStatus === PaymentStatus.PENDENTE ? 'opacity-100' : 'opacity-0'} />
              </button>
            </div>
          </div>

          <div className="bg-[#A32121] p-8 rounded-[2.5rem] text-white shadow-2xl shadow-red-900/20">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-6">Valores Finais</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="opacity-70 font-medium">Subtotal Itens</span>
                <span className="font-bold">R$ {items.reduce((acc, curr) => acc + (curr.quantity * curr.unitPrice), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="opacity-70 font-medium">Mão de Obra</span>
                <input 
                  type="number" 
                  value={labor}
                  onChange={(e) => setLabor(parseFloat(e.target.value) || 0)}
                  className="bg-white/10 border-none rounded-lg px-2 py-1 w-24 text-right font-bold outline-none text-white" 
                />
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="opacity-70 font-medium">Desconto</span>
                <input 
                  type="number" 
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  className="bg-white/10 border-none rounded-lg px-2 py-1 w-24 text-right font-bold outline-none text-white" 
                />
              </div>
              <div className="pt-6 border-t border-white/20 mt-6 flex flex-col gap-1">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Valor Total</span>
                <span className="text-4xl font-black">R$ {calculateTotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          <button 
            onClick={handleFinalize}
            className="w-full bg-zinc-900 border border-zinc-800 p-6 rounded-[2.5rem] font-black uppercase text-sm tracking-[0.2em] text-white flex items-center justify-center gap-3 hover:bg-[#A32121] transition-all group shadow-xl"
          >
            <Save size={20} className="text-[#A32121] group-hover:text-white transition-colors" />
            <span>Finalizar Nota</span>
          </button>
        </div>
      </div>

      {/* MODAL DA NOTA DIGITAL PROFISSIONAL */}
      {showInvoice && osData && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 p-4 overflow-y-auto no-scrollbar">
          <div className="bg-white w-full max-w-[210mm] min-h-[297mm] my-auto rounded-none md:rounded-[2rem] p-0 text-zinc-900 shadow-2xl relative overflow-hidden">
            
            {/* Action Bar (No Print) */}
            <div className="no-print bg-zinc-100 p-4 flex justify-between items-center border-b border-zinc-200 sticky top-0 z-[210]">
                <div className="flex gap-2">
                    <button onClick={() => window.print()} className="bg-zinc-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-black transition-all">
                        <Printer size={16} /> Imprimir / PDF
                    </button>
                    <button onClick={shareWhatsApp} className="bg-emerald-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-emerald-600 transition-all">
                        <Share2 size={16} /> WhatsApp
                    </button>
                </div>
                <button onClick={() => setShowInvoice(false)} className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors">
                    <X size={24} />
                </button>
            </div>

            <div id="print-area" className="p-[15mm] text-zinc-900">
              {/* Header */}
              <div className="flex justify-between items-start mb-10 pb-8 border-b-2 border-zinc-100">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-[#000] rounded-2xl flex items-center justify-center text-white">
                    <Wrench size={32} />
                  </div>
                  <div>
                    <h1 className="text-3xl font-black tracking-tighter text-zinc-900">KAEN <span className="text-[#000]">MECÂNICA</span></h1>
                    <p className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.3em] mt-0.5">Mecânica de Precisão</p>
                    <div className="mt-2 text-[9px] text-zinc-600 font-bold space-y-0.5 uppercase">
                        <p>Rua Joaquim Marques Alves, 765</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="bg-zinc-100 px-6 py-3 rounded-2xl mb-2">
                    <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Nº DA NOTA</p>
                    <p className="text-2xl font-black text-zinc-900">{osData.osNumber}</p>
                  </div>
                  <p className="text-xs font-black text-zinc-500 uppercase tracking-widest">
                    {new Date(osData.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>

              {/* Info Cards */}
              <div className="grid grid-cols-2 gap-8 mb-10">
                <div className="bg-zinc-50 p-6 rounded-3xl border border-zinc-100">
                  <h5 className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-3 border-b border-zinc-200 pb-2">Proprietário</h5>
                  <p className="font-black text-lg text-zinc-900">{osData.clientName}</p>
                  <p className="text-xs font-bold text-zinc-500 mt-1">{selectedClient?.phone}</p>
                  <p className="text-[10px] font-medium text-zinc-400 mt-0.5">CPF: {selectedClient?.document || 'NÃO INFORMADO'}</p>
                </div>
                <div className="bg-zinc-50 p-6 rounded-3xl border border-zinc-100">
                  <h5 className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-3 border-b border-zinc-200 pb-2">Veículo</h5>
                  <div className="flex justify-between items-start">
                    <div>
                        <p className="font-black text-lg text-zinc-900 uppercase tracking-tighter">{osData.vehiclePlate}</p>
                        <p className="text-sm font-black text-zinc-900 uppercase">{osData.vehicleModel}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">KM Registrado</p>
                        <p className="text-lg font-black text-zinc-900">{osData.vehicleKm ? `${parseFloat(osData.vehicleKm).toLocaleString('pt-BR')} km` : '---'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Problem/Service Description */}
              <div className="mb-10 p-6 bg-zinc-50/50 rounded-3xl border border-zinc-100 border-dashed">
                <h5 className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-2">Relato / Diagnóstico</h5>
                <p className="text-sm text-zinc-700 leading-relaxed font-medium">
                  {osData.problem || "Serviços de manutenção preventiva/corretiva realizados conforme inspeção."}
                </p>
              </div>

              {/* Table */}
              <div className="mb-10">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b-2 border-zinc-200 text-zinc-400 uppercase font-black tracking-widest text-[10px]">
                      <th className="py-4 px-2">Descrição Técnica</th>
                      <th className="py-4 px-2 text-center">Qtd</th>
                      <th className="py-4 px-2 text-right">V. Unitário</th>
                      <th className="py-4 px-2 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {osData.items.map((item, i) => (
                      <tr key={i} className="text-zinc-700">
                        <td className="py-4 px-2 font-bold flex items-center gap-2">
                            {item.type === 'PART' ? <Package size={14} className="text-zinc-300" /> : <Wrench size={14} className="text-zinc-300" />}
                            {item.description}
                        </td>
                        <td className="py-4 px-2 text-center font-black text-zinc-400">{item.quantity}</td>
                        <td className="py-4 px-2 text-right text-zinc-500">R$ {item.unitPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        <td className="py-4 px-2 text-right font-black text-zinc-900">R$ {(item.quantity * item.unitPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                    {osData.laborValue > 0 && (
                      <tr className="bg-zinc-50/30">
                        <td className="py-4 px-2 font-black text-zinc-900">Mão de Obra Especializada</td>
                        <td className="py-4 px-2 text-center font-black text-zinc-400">01</td>
                        <td className="py-4 px-2 text-right text-zinc-500">R$ {osData.laborValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        <td className="py-4 px-2 text-right font-black text-zinc-900">R$ {osData.laborValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="flex justify-between items-end pt-10 border-t-2 border-zinc-100 mt-auto">
                <div className="flex flex-col gap-6">
                  <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest inline-block border ${osData.paymentStatus === PaymentStatus.PAGO ? 'bg-zinc-50 text-emerald-600 border-emerald-100' : 'bg-zinc-50 text-amber-600 border-amber-100'}`}>
                    PAGAMENTO: {osData.paymentStatus.toUpperCase()}
                  </div>
                  <div className="space-y-4">
                      <div className="flex flex-col items-center">
                        <div className="w-56 h-px bg-zinc-200 mb-2"></div>
                        <p className="text-[9px] text-zinc-400 font-black uppercase tracking-widest">Assinatura do Proprietário</p>
                      </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-3 min-w-[280px]">
                  {osData.discount > 0 && (
                    <div className="flex justify-between w-full text-xs border-b border-zinc-50 pb-2 px-2">
                      <span className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest">Desconto Aplicado</span>
                      <span className="font-black text-zinc-900">- R$ {osData.discount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  <div className="w-full bg-zinc-100 p-6 rounded-[1.5rem] border border-zinc-200">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-zinc-500 font-black uppercase tracking-[0.2em] text-[10px]">Total Líquido</span>
                    </div>
                    <span className="text-4xl font-black block tracking-tighter text-zinc-900">R$ {osData.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <p className="text-[9px] text-zinc-400 font-bold text-right italic max-w-xs mt-2 uppercase tracking-widest">
                    * Garantia de 90 dias nos serviços prestados.
                  </p>
                </div>
              </div>

              <div className="mt-16 text-center border-t border-zinc-100 pt-4">
                  <p className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.5em]">Kaen Mecânica • Qualidade e Confiança</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewServiceOrder;
