
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
  CheckCircle2
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

    if (items.length === 0 && labor === 0) {
      alert("Adicione pelo menos um item ou valor de mão de obra.");
      return;
    }

    const newOs: ServiceOrder = {
      id: Math.random().toString(36).substr(2, 9),
      osNumber: (Math.floor(Math.random() * 90000) + 10000).toString(),
      clientId: selectedClient.id,
      clientName: selectedClient.name,
      vehicleId: 'new',
      vehiclePlate: vehicleInfo.plate.toUpperCase(),
      vehicleModel: vehicleInfo.model,
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

    // Stock deduction
    const updatedParts = [...parts];
    items.forEach(item => {
      if (item.type === 'PART') {
        const partIdx = updatedParts.findIndex(p => p.name.toLowerCase() === item.description.toLowerCase());
        if (partIdx !== -1) {
          updatedParts[partIdx].stock -= item.quantity;
        }
      }
    });
    localStorage.setItem('kaenpro_parts', JSON.stringify(updatedParts));

    setOsData(newOs);
    setShowInvoice(true);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 animate-in slide-in-from-bottom duration-500">
      <div className="flex items-center justify-between no-print">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors">
          <ChevronLeft size={20} />
          <span className="font-bold">Voltar</span>
        </button>
        <h1 className="text-2xl font-black text-white">Criar Nova Nota de Serviço</h1>
        <div className="w-20"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 no-print">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] space-y-6 shadow-xl">
            <h3 className="text-lg font-bold flex items-center gap-2"><PlusCircle className="text-[#A32121]" /> Identificação</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Cliente</label>
                <select 
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3.5 focus:ring-1 focus:ring-[#A32121] outline-none transition-all"
                  onChange={(e) => setSelectedClient(clients.find(c => c.id === e.target.value) || null)}
                >
                  <option value="">Selecione um cliente...</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {clients.length === 0 && <p className="text-[10px] text-zinc-600 mt-2">Nenhum cliente cadastrado. Vá em "Clientes" primeiro.</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Placa</label>
                  <input 
                    type="text" 
                    value={vehicleInfo.plate}
                    onChange={(e) => setVehicleInfo({...vehicleInfo, plate: e.target.value})}
                    placeholder="ABC-1234" 
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 focus:ring-1 focus:ring-[#A32121] outline-none" 
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Modelo / Marca</label>
                  <input 
                    type="text" 
                    value={vehicleInfo.model}
                    onChange={(e) => setVehicleInfo({...vehicleInfo, model: e.target.value})}
                    placeholder="Ex: Corolla - Toyota" 
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 focus:ring-1 focus:ring-[#A32121] outline-none" 
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] space-y-4 shadow-xl">
             <h3 className="text-lg font-bold">Relato do Problema</h3>
             <textarea 
               value={problem}
               onChange={(e) => setProblem(e.target.value)}
               rows={3}
               placeholder="Descreva o problema relatado ou serviço solicitado..."
               className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-4 focus:ring-1 focus:ring-[#A32121] text-sm outline-none"
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
                    className="flex-1 bg-transparent border-b border-zinc-800 py-1 text-sm focus:border-[#A32121] outline-none" 
                  />
                  <div className="flex gap-3 items-center">
                    <div className="flex flex-col">
                      <span className="text-[8px] text-zinc-600 font-bold uppercase mb-1">Qtd</span>
                      <input 
                        type="number" 
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                        className="w-12 bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-center text-xs" 
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[8px] text-zinc-600 font-bold uppercase mb-1">Preço R$</span>
                      <input 
                        type="number" 
                        value={item.unitPrice}
                        onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="w-20 bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-center text-xs" 
                      />
                    </div>
                    <button onClick={() => removeItem(item.id)} className="text-zinc-700 hover:text-red-500 transition-colors mt-4 sm:mt-0"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
              {items.length === 0 && <p className="text-center text-zinc-600 text-xs py-8 italic">Nenhuma peça ou serviço específico adicionado.</p>}
            </div>
          </div>
        </div>

        <div className="space-y-6 no-print">
          {/* Section: Payment Status */}
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] space-y-6 shadow-xl">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2"><CreditCard size={14} /> Pagamento</h3>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => setPaymentStatus(PaymentStatus.PAGO)}
                className={`p-4 rounded-2xl flex items-center justify-between border transition-all ${paymentStatus === PaymentStatus.PAGO ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' : 'bg-zinc-950 border-zinc-800 text-zinc-500'}`}
              >
                <span className="text-xs font-bold uppercase tracking-widest">Já foi pago</span>
                <CheckCircle2 size={18} className={paymentStatus === PaymentStatus.PAGO ? 'opacity-100' : 'opacity-0'} />
              </button>
              <button 
                onClick={() => setPaymentStatus(PaymentStatus.PENDENTE)}
                className={`p-4 rounded-2xl flex items-center justify-between border transition-all ${paymentStatus === PaymentStatus.PENDENTE ? 'bg-amber-500/10 border-amber-500 text-amber-500' : 'bg-zinc-950 border-zinc-800 text-zinc-500'}`}
              >
                <span className="text-xs font-bold uppercase tracking-widest">A pagar / Pendente</span>
                <Clock size={18} className={paymentStatus === PaymentStatus.PENDENTE ? 'opacity-100' : 'opacity-0'} />
              </button>
            </div>
          </div>

          <div className="bg-[#A32121] p-8 rounded-[2.5rem] text-white shadow-2xl shadow-red-900/20">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-6">Fechamento da Nota</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="opacity-70 font-medium">Itens</span>
                <span className="font-bold">R$ {items.reduce((acc, curr) => acc + (curr.quantity * curr.unitPrice), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="opacity-70 font-medium">Mão de Obra</span>
                <input 
                  type="number" 
                  value={labor}
                  onChange={(e) => setLabor(parseFloat(e.target.value) || 0)}
                  className="bg-white/10 border-none rounded-lg px-2 py-1 w-24 text-right font-bold outline-none" 
                />
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="opacity-70 font-medium">Desconto</span>
                <input 
                  type="number" 
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  className="bg-white/10 border-none rounded-lg px-2 py-1 w-24 text-right font-bold outline-none" 
                />
              </div>
              <div className="pt-6 border-t border-white/20 mt-6 flex flex-col gap-1">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Total Líquido</span>
                <span className="text-4xl font-black">R$ {calculateTotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          <button 
            onClick={handleFinalize}
            className="w-full bg-zinc-900 border border-zinc-800 p-6 rounded-[2.5rem] font-black uppercase text-sm tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-[#A32121] hover:border-[#A32121] transition-all group"
          >
            <Save size={20} className="text-[#A32121] group-hover:text-white transition-colors" />
            <span>Gerar Nota de Serviço</span>
          </button>
        </div>
      </div>

      {/* Professional Note Modal */}
      {showInvoice && osData && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 p-4 overflow-y-auto no-scrollbar">
          <div className="bg-white w-full max-w-2xl min-h-[90vh] my-auto rounded-3xl p-10 text-zinc-900 shadow-2xl relative">
            <button onClick={() => setShowInvoice(false)} className="absolute top-6 right-6 p-2 text-zinc-300 hover:text-zinc-900 no-print transition-colors">
              <X size={28} />
            </button>
            
            <div id="print-area" className="bg-white p-2">
              <div className="flex justify-between items-center mb-10 border-b-2 border-zinc-100 pb-8">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                    <Wrench size={32} />
                  </div>
                  <div>
                    <h1 className="text-3xl font-black tracking-tighter text-zinc-900">KAENPRO <span className="text-red-600">MOTORS</span></h1>
                    <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest mt-0.5">Mecânica de Precisão e Performance</p>
                    <p className="text-[9px] text-zinc-400 font-bold">Contato: (11) 99999-9999 • São Paulo - SP</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="bg-zinc-100 px-4 py-2 rounded-xl mb-1">
                    <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Nota Fiscal de Serviço</p>
                    <p className="text-xl font-black text-zinc-900">Nº {osData.osNumber}</p>
                  </div>
                  <p className="text-xs font-bold text-zinc-500 uppercase">{new Date(osData.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-10 mb-10">
                <div className="space-y-1 bg-zinc-50 p-5 rounded-2xl border border-zinc-100">
                  <h5 className="text-[9px] font-black uppercase text-zinc-400 tracking-widest mb-2">Dados do Cliente</h5>
                  <p className="font-black text-sm text-zinc-900">{osData.clientName}</p>
                  <p className="text-xs font-medium text-zinc-600">WhatsApp: {selectedClient?.phone}</p>
                  <p className="text-xs font-medium text-zinc-600">Doc: {selectedClient?.document || 'N/A'}</p>
                </div>
                <div className="space-y-1 bg-zinc-50 p-5 rounded-2xl border border-zinc-100">
                  <h5 className="text-[9px] font-black uppercase text-zinc-400 tracking-widest mb-2">Dados do Veículo</h5>
                  <p className="font-black text-sm text-red-600 uppercase tracking-tight">{osData.vehiclePlate}</p>
                  <p className="text-xs font-black text-zinc-900 uppercase">{osData.vehicleModel}</p>
                  <p className="text-[10px] font-bold text-zinc-400">Problema: {osData.problem || 'Revisão Geral'}</p>
                </div>
              </div>

              <div className="mb-10 min-h-[200px]">
                <h5 className="text-[9px] font-black uppercase text-zinc-400 tracking-widest mb-4 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
                  Detalhamento dos Serviços e Peças
                </h5>
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b-2 border-zinc-100 text-zinc-400 uppercase font-black tracking-widest text-[8px]">
                      <th className="py-3 px-2">Descrição Detalhada</th>
                      <th className="py-3 px-2 text-center w-20">Quantidade</th>
                      <th className="py-3 px-2 text-right w-24">V. Unitário</th>
                      <th className="py-3 px-2 text-right w-24">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50">
                    {osData.items.map((item, i) => (
                      <tr key={i} className="text-zinc-700">
                        <td className="py-4 px-2 font-bold">{item.description}</td>
                        <td className="py-4 px-2 text-center font-black text-zinc-400">{item.quantity}</td>
                        <td className="py-4 px-2 text-right">R$ {item.unitPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        <td className="py-4 px-2 text-right font-black">R$ {(item.quantity * item.unitPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                    {osData.laborValue > 0 && (
                      <tr className="bg-zinc-50/50">
                        <td className="py-4 px-2 font-black text-zinc-900">Mão de Obra / Serviço Técnico</td>
                        <td className="py-4 px-2 text-center font-black text-zinc-400">01</td>
                        <td className="py-4 px-2 text-right">R$ {osData.laborValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        <td className="py-4 px-2 text-right font-black">R$ {osData.laborValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-end pt-8 border-t-2 border-zinc-100">
                <div className="flex flex-col gap-4">
                  <div className="bg-zinc-900 text-white px-4 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest inline-block">
                    PAGAMENTO: {osData.paymentStatus.toUpperCase()}
                  </div>
                  <div className="text-[9px] text-zinc-400 font-bold max-w-xs leading-relaxed italic">
                    * Esta nota não tem valor fiscal. Garantia de 90 dias nos serviços prestados. Peças seguem garantia do fabricante.
                  </div>
                </div>
                <div className="flex flex-col items-end gap-3">
                  {osData.discount > 0 && (
                    <div className="flex justify-between w-48 text-xs border-b border-zinc-50 pb-2">
                      <span className="text-zinc-400 font-bold uppercase text-[9px]">Desconto</span>
                      <span className="font-black text-red-500">- R$ {osData.discount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  <div className="flex justify-between w-64 items-center bg-zinc-900 p-4 rounded-2xl text-white">
                    <span className="text-zinc-400 font-black uppercase tracking-[0.2em] text-[9px]">Total da Nota</span>
                    <span className="text-3xl font-black">R$ {osData.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              <div className="mt-20 flex justify-between items-center text-[9px] text-zinc-400 uppercase tracking-widest font-black px-4">
                <div className="flex flex-col items-center">
                  <div className="w-56 h-px bg-zinc-200 mb-2"></div>
                  Assinatura do Cliente
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-56 h-px bg-zinc-200 mb-2"></div>
                  Responsável Técnico
                </div>
              </div>
            </div>

            <div className="mt-12 flex flex-col sm:flex-row gap-4 no-print">
              <button 
                onClick={() => window.print()} 
                className="flex-1 bg-zinc-900 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl"
              >
                <Printer size={20} />
                Imprimir Documento
              </button>
              <button 
                onClick={() => {
                   const message = `Prezado(a) ${osData.clientName}, sua nota de serviço #${osData.osNumber} da Kaenpro Motors está pronta. Valor Total: R$ ${osData.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}. Verifique os detalhes em anexo.`;
                   window.open(`https://wa.me/55${selectedClient?.phone.replace(/\D/g,'')}?text=${encodeURIComponent(message)}`, '_blank');
                }}
                className="flex-1 bg-green-500 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-green-600 transition-all shadow-xl shadow-green-900/10"
              >
                <FileText size={20} />
                Enviar WhatsApp
              </button>
              <button 
                className="sm:w-16 h-16 bg-zinc-100 text-zinc-900 rounded-2xl flex items-center justify-center hover:bg-zinc-200 transition-all shadow-lg"
                title="Tirar Print (Orientação)"
              >
                <Camera size={24} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewServiceOrder;
