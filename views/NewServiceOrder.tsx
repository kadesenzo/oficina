
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
  CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Client, OSItem, OSStatus, Part, ServiceOrder, PaymentStatus } from '../types';

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
      vehicleKm: parseFloat(vehicleInfo.km) || 0,
      problem,
      items,
      laborValue: labor,
      discount: discount,
      totalValue: calculateTotal(),
      status: OSStatus.FINALIZADO,
      paymentStatus: paymentStatus,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const existing = JSON.parse(localStorage.getItem('kaenpro_orders') || '[]');
    localStorage.setItem('kaenpro_orders', JSON.stringify([...existing, newOs]));

    // Update stock if applicable
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
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3.5 focus:ring-1 focus:ring-[#A32121] outline-none transition-all text-white"
                  onChange={(e) => setSelectedClient(clients.find(c => c.id === e.target.value) || null)}
                >
                  <option value="">Selecione um cliente...</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {clients.length === 0 && <p className="text-[10px] text-zinc-600 mt-2">Nenhum cliente cadastrado. Vá em "Clientes" primeiro.</p>}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Placa</label>
                  <input 
                    type="text" 
                    value={vehicleInfo.plate}
                    onChange={(e) => setVehicleInfo({...vehicleInfo, plate: e.target.value})}
                    placeholder="ABC-1234" 
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 focus:ring-1 focus:ring-[#A32121] outline-none text-white" 
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Modelo</label>
                  <input 
                    type="text" 
                    value={vehicleInfo.model}
                    onChange={(e) => setVehicleInfo({...vehicleInfo, model: e.target.value})}
                    placeholder="Ex: Corolla" 
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 focus:ring-1 focus:ring-[#A32121] outline-none text-white" 
                  />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">KM</label>
                  <input 
                    type="number" 
                    value={vehicleInfo.km}
                    onChange={(e) => setVehicleInfo({...vehicleInfo, km: e.target.value})}
                    placeholder="000000" 
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 focus:ring-1 focus:ring-[#A32121] outline-none text-white" 
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] space-y-4 shadow-xl">
             <h3 className="text-lg font-bold text-white">Relato do Problema / Serviço</h3>
             <textarea 
               value={problem}
               onChange={(e) => setProblem(e.target.value)}
               rows={3}
               placeholder="Descreva o serviço solicitado..."
               className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-4 focus:ring-1 focus:ring-[#A32121] text-sm outline-none text-white"
             />
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold flex items-center gap-2 text-white"><FileText size={20} className="text-[#A32121]" /> Peças e Serviços</h3>
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
                    placeholder="Descrição..."
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
                      <span className="text-[8px] text-zinc-600 font-bold uppercase mb-1">R$ Unit</span>
                      <input 
                        type="number" 
                        value={item.unitPrice}
                        onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="w-20 bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-center text-xs text-white" 
                      />
                    </div>
                    <button onClick={() => removeItem(item.id)} className="text-zinc-700 hover:text-red-500 transition-colors mt-4 sm:mt-0"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
              {items.length === 0 && <p className="text-center text-zinc-600 text-xs py-8 italic">Nenhum item adicionado.</p>}
            </div>
          </div>
        </div>

        <div className="space-y-6 no-print">
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] space-y-6 shadow-xl">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2"><CreditCard size={14} /> Pagamento</h3>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => setPaymentStatus(PaymentStatus.PAGO)}
                className={`p-4 rounded-2xl flex items-center justify-between border transition-all ${paymentStatus === PaymentStatus.PAGO ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' : 'bg-zinc-950 border-zinc-800 text-zinc-500'}`}
              >
                <span className="text-xs font-bold uppercase tracking-widest">Já Pago</span>
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
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-6">Valores</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="opacity-70 font-medium">Serviços/Peças</span>
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
                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Total</span>
                <span className="text-4xl font-black">R$ {calculateTotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          <button 
            onClick={handleFinalize}
            className="w-full bg-zinc-900 border border-zinc-800 p-6 rounded-[2.5rem] font-black uppercase text-sm tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-[#A32121] hover:border-[#A32121] transition-all group text-white"
          >
            <Save size={20} className="text-[#A32121] group-hover:text-white transition-colors" />
            <span>Gerar Nota</span>
          </button>
        </div>
      </div>

      {/* Simple Functional Note Modal */}
      {showInvoice && osData && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl min-h-[90vh] my-auto rounded-xl p-10 text-black shadow-2xl relative">
            <button onClick={() => setShowInvoice(false)} className="absolute top-6 right-6 p-2 text-zinc-400 hover:text-black no-print">
              <X size={24} />
            </button>
            
            <div id="simple-note-view">
              {/* Header */}
              <div className="text-center border-b pb-6 mb-8">
                <h1 className="text-2xl font-black uppercase tracking-tight">Kaenpro Motors</h1>
                <p className="text-sm font-bold">Telefone: (11) 99999-9999</p>
                <p className="text-[10px] uppercase text-zinc-500">Mecânica de Precisão e Performance</p>
              </div>

              {/* Note Metadata */}
              <div className="flex justify-between items-start mb-8 text-sm">
                <div>
                  <p><strong>Nota / OS:</strong> #{osData.osNumber}</p>
                  <p><strong>Data:</strong> {new Date(osData.createdAt).toLocaleDateString('pt-BR')}</p>
                </div>
                <div className="text-right">
                   <p className="bg-black text-white px-2 py-1 rounded text-[10px] font-black uppercase">{osData.paymentStatus}</p>
                </div>
              </div>

              {/* Client & Vehicle */}
              <div className="grid grid-cols-2 gap-4 mb-8 text-sm border p-4 rounded-lg bg-zinc-50">
                <div>
                  <h3 className="font-black border-b mb-2 text-xs uppercase tracking-widest text-zinc-400">Dados do Cliente</h3>
                  <p><strong>Nome:</strong> {osData.clientName}</p>
                  <p><strong>Tel:</strong> {selectedClient?.phone || 'N/A'}</p>
                </div>
                <div>
                  <h3 className="font-black border-b mb-2 text-xs uppercase tracking-widest text-zinc-400">Dados do Veículo</h3>
                  <p><strong>Modelo:</strong> {osData.vehicleModel}</p>
                  <p><strong>Placa:</strong> {osData.vehiclePlate}</p>
                  <p><strong>KM:</strong> {osData.vehicleKm.toLocaleString('pt-BR')} KM</p>
                </div>
              </div>

              {/* Items Table */}
              <div className="mb-8">
                <h3 className="font-black text-xs uppercase tracking-widest text-zinc-400 mb-4">Serviços e Peças</h3>
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b font-black uppercase text-[10px]">
                      <th className="py-2">Descrição</th>
                      <th className="py-2 text-center">Qtd</th>
                      <th className="py-2 text-right">Unitário</th>
                      <th className="py-2 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {osData.items.map((item, i) => (
                      <tr key={i} className="border-b">
                        <td className="py-3">{item.description}</td>
                        <td className="py-3 text-center">{item.quantity}</td>
                        <td className="py-3 text-right">R$ {item.unitPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        <td className="py-3 text-right">R$ {(item.quantity * item.unitPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary */}
              <div className="flex justify-end pt-4 border-t-2">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Mão de Obra:</span>
                    <span className="font-bold">R$ {osData.laborValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  {osData.discount > 0 && (
                    <div className="flex justify-between text-xs text-red-600">
                      <span>Desconto:</span>
                      <span className="font-bold">- R$ {osData.discount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-black border-t-2 pt-2">
                    <span>TOTAL:</span>
                    <span>R$ {osData.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              {/* Footer signatures */}
              <div className="mt-20 flex justify-between gap-10">
                <div className="flex-1 text-center">
                  <div className="border-t border-black mb-1"></div>
                  <p className="text-[10px] uppercase font-bold">Assinatura do Cliente</p>
                </div>
                <div className="flex-1 text-center">
                  <div className="border-t border-black mb-1"></div>
                  <p className="text-[10px] uppercase font-bold">Responsável Técnico</p>
                </div>
              </div>
            </div>

            <div className="mt-12 flex gap-4 no-print">
              <button 
                onClick={() => window.print()} 
                className="flex-1 bg-black text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3"
              >
                <Printer size={20} />
                Imprimir Nota
              </button>
              <button 
                onClick={() => setShowInvoice(false)}
                className="flex-1 bg-zinc-100 text-zinc-900 py-4 rounded-xl font-black text-sm uppercase tracking-widest"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewServiceOrder;
