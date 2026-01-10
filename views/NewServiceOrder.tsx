
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
  User
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Client, Vehicle, OSItem, OSStatus, Part, ServiceOrder, PaymentStatus } from '../types';

const NewServiceOrder: React.FC = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [allVehicles, setAllVehicles] = useState<Vehicle[]>([]);
  
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

  useEffect(() => {
    setClients(JSON.parse(localStorage.getItem('kaenpro_clients') || '[]'));
    setAllVehicles(JSON.parse(localStorage.getItem('kaenpro_vehicles') || '[]'));
  }, []);

  const handleClientChange = (clientId: string) => {
    const client = clients.find(c => c.id === clientId) || null;
    setSelectedClient(client);
    setSelectedVehicle(null);
    setCurrentKm('');
    
    if (client) {
      const vehicles = allVehicles.filter(v => v.clientId === client.id);
      setClientVehicles(vehicles);
    } else {
      setClientVehicles([]);
    }
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

  const handleFinalize = () => {
    if (!selectedClient || !selectedVehicle) {
      alert("Selecione um Cliente e um Veículo.");
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

    const existing = JSON.parse(localStorage.getItem('kaenpro_orders') || '[]');
    localStorage.setItem('kaenpro_orders', JSON.stringify([...existing, newOs]));

    const updatedVehicles = allVehicles.map(v => 
      v.id === selectedVehicle.id ? { ...v, km: parseFloat(currentKm) || v.km } : v
    );
    localStorage.setItem('kaenpro_vehicles', JSON.stringify(updatedVehicles));

    setOsData(newOs);
    setShowInvoice(true);
  };

  const shareWhatsApp = () => {
    if (!osData) return;
    const msg = `*KAEN MECÂNICA - NOTA #${osData.osNumber}*\n*Veículo:* ${osData.vehiclePlate}\n*KM:* ${osData.vehicleKm} km\n*Total: R$ ${osData.totalValue.toLocaleString('pt-BR')}*`;
    window.open(`https://wa.me/55${selectedClient?.phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const isLongNote = items.length > 8;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 animate-in slide-in-from-bottom duration-500">
      <div className="flex items-center justify-between no-print">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors">
          <ChevronLeft size={20} />
          <span className="font-bold uppercase text-[10px] tracking-widest">Voltar</span>
        </button>
        <div className="text-right">
          <h1 className="text-2xl font-black text-white leading-none uppercase tracking-tighter">Gerar Nova Nota</h1>
          <p className="text-[10px] font-black text-[#A32121] uppercase tracking-[0.2em] mt-1">Kaen Mecânica</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 no-print">
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] space-y-6 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">1. Cliente</label>
                <select 
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-white focus:border-[#A32121] outline-none"
                  onChange={(e) => handleClientChange(e.target.value)}
                  value={selectedClient?.id || ''}
                >
                  <option value="">Buscar cliente...</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">2. Veículo</label>
                <select 
                  disabled={!selectedClient}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-white focus:border-[#A32121] outline-none disabled:opacity-50"
                  onChange={(e) => handleVehicleChange(e.target.value)}
                  value={selectedVehicle?.id || ''}
                >
                  <option value="">{selectedClient ? 'Escolher veículo...' : 'Selecione o cliente primeiro'}</option>
                  {clientVehicles.map(v => <option key={v.id} value={v.id}>{v.plate} - {v.model}</option>)}
                </select>
              </div>
            </div>

            {selectedVehicle && (
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-zinc-800 animate-in slide-in-from-top">
                <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800">
                  <p className="text-[8px] font-black text-zinc-600 uppercase mb-1">Placa</p>
                  <p className="text-sm font-black text-white uppercase">{selectedVehicle.plate}</p>
                </div>
                <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800">
                  <p className="text-[8px] font-black text-zinc-600 uppercase mb-1">Modelo</p>
                  <p className="text-sm font-black text-white truncate uppercase">{selectedVehicle.model}</p>
                </div>
                <div className="bg-zinc-950 p-4 rounded-2xl border border-[#A32121]/30">
                  <p className="text-[8px] font-black text-[#A32121] uppercase mb-1">KM Atual *</p>
                  <input 
                    type="number"
                    value={currentKm}
                    onChange={(e) => setCurrentKm(e.target.value)}
                    className="bg-transparent text-sm font-black text-white outline-none w-full"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] space-y-4 shadow-xl">
             <div className="flex items-center gap-3 mb-2">
               <Wrench className="text-[#A32121]" size={20} />
               <h3 className="text-lg font-bold">Relato do Serviço Realizado</h3>
             </div>
             <textarea 
               value={problem}
               onChange={(e) => setProblem(e.target.value)}
               rows={4}
               placeholder="Descreva aqui o que foi feito..."
               className="w-full bg-zinc-950 border border-zinc-800 rounded-3xl p-6 text-sm text-white focus:border-[#A32121] outline-none"
             />
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold flex items-center gap-2"><Package size={20} className="text-[#A32121]" /> Peças e Serviços</h3>
              <div className="flex gap-2">
                <button onClick={() => addItem('SERVICE')} className="text-[10px] font-black uppercase text-zinc-400 bg-zinc-800 px-4 py-2.5 rounded-xl hover:text-white transition-all">+ Serviço</button>
                <button onClick={() => addItem('PART')} className="text-[10px] font-black uppercase text-[#A32121] bg-[#A32121]/10 px-4 py-2.5 rounded-xl hover:bg-[#A32121] hover:text-white transition-all">+ Peça Manual</button>
              </div>
            </div>

            <div className="space-y-3">
              {items.map(item => (
                <div key={item.id} className="flex gap-3 p-4 bg-zinc-950 border border-zinc-800 rounded-3xl items-center animate-in zoom-in duration-200">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${item.type === 'PART' ? 'bg-[#A32121]/10 text-[#A32121]' : 'bg-zinc-800 text-zinc-500'}`}>
                    {item.type === 'PART' ? <Package size={14} /> : <Wrench size={14} />}
                  </div>
                  <input 
                    type="text" 
                    placeholder={item.type === 'PART' ? "Nome da Peça..." : "Nome do Serviço..."}
                    value={item.description}
                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                    className="flex-1 bg-transparent border-b border-zinc-800 text-sm text-white outline-none focus:border-[#A32121]" 
                  />
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                      className="w-12 bg-zinc-900 border border-zinc-800 rounded-xl px-2 py-2 text-xs text-white text-center font-bold" 
                    />
                    <input 
                      type="number" 
                      value={item.unitPrice}
                      onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                      className="w-24 bg-zinc-900 border border-zinc-800 rounded-xl px-2 py-2 text-xs text-white text-center font-bold" 
                    />
                    <button onClick={() => removeItem(item.id)} className="text-zinc-700 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                  </div>
                </div>
              ))}
              {items.length === 0 && <p className="text-center text-zinc-600 text-xs py-10 uppercase tracking-widest border-2 border-dashed border-zinc-800 rounded-3xl">Clique em + para adicionar itens</p>}
            </div>
          </div>
        </div>

        <div className="space-y-6 no-print">
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] space-y-6 shadow-xl text-white">
            <h3 className="text-[10px] font-black uppercase text-zinc-500">Status</h3>
            <div className="flex flex-col gap-3">
              <button onClick={() => setPaymentStatus(PaymentStatus.PAGO)} className={`p-4 rounded-2xl border transition-all ${paymentStatus === PaymentStatus.PAGO ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' : 'bg-zinc-950 border-zinc-800 text-zinc-600'}`}>Pago</button>
              <button onClick={() => setPaymentStatus(PaymentStatus.PENDENTE)} className={`p-4 rounded-2xl border transition-all ${paymentStatus === PaymentStatus.PENDENTE ? 'bg-amber-500/10 border-amber-500 text-amber-500' : 'bg-zinc-950 border-zinc-800 text-zinc-600'}`}>Pendente</button>
            </div>
          </div>
          <div className="bg-[#A32121] p-8 rounded-[2.5rem] text-white shadow-2xl space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="opacity-60 uppercase text-[10px]">Mão de Obra R$</span>
                <input type="number" value={labor} onChange={(e) => setLabor(parseFloat(e.target.value) || 0)} className="bg-white/10 w-24 text-right rounded-lg px-2 py-1 outline-none" />
              </div>
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="opacity-60 uppercase text-[10px]">Desconto R$</span>
                <input type="number" value={discount} onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)} className="bg-white/10 w-24 text-right rounded-lg px-2 py-1 outline-none" />
              </div>
              <div className="pt-6 border-t border-white/20 mt-6"><span className="text-4xl font-black">R$ {calculateTotal().toLocaleString('pt-BR')}</span></div>
            </div>
          </div>
          <button onClick={handleFinalize} className="w-full bg-zinc-900 border border-zinc-800 py-6 rounded-[2.5rem] font-black uppercase text-xs tracking-[0.3em] text-white hover:bg-[#A32121] transition-all">Gerar Nota</button>
        </div>
      </div>

      {showInvoice && osData && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 p-0 sm:p-4 overflow-y-auto no-scrollbar">
          <div className={`bg-white w-full max-w-[210mm] min-h-screen sm:min-h-0 sm:rounded-[2rem] p-0 text-zinc-900 shadow-2xl relative flex flex-col ${isLongNote ? 'print-compact' : ''}`}>
            
            <div className="no-print bg-zinc-100 p-4 flex justify-between items-center border-b border-zinc-200 sticky top-0 z-[210]">
              <div className="flex gap-2">
                <button onClick={() => window.print()} className="bg-zinc-900 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase flex items-center gap-2">
                  <Printer size={16} /> Imprimir A4
                </button>
                <button onClick={shareWhatsApp} className="bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase flex items-center gap-2">
                  <Share2 size={16} /> WhatsApp
                </button>
              </div>
              <button onClick={() => setShowInvoice(false)} className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors"><X size={32} /></button>
            </div>

            <div id="print-area" className="p-[10mm] sm:p-[15mm] text-zinc-900 flex flex-col flex-1 bg-white">
              <div className="flex justify-between items-start mb-8 pb-6 border-b-2 border-zinc-100 print-header">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center text-white">
                    <Wrench size={32} />
                  </div>
                  <div>
                    <h1 className="text-2xl font-black tracking-tighter uppercase">KAEN <span className="text-zinc-500">MECÂNICA</span></h1>
                    <p className="text-[9px] text-zinc-400 font-black uppercase tracking-[0.2em]">Rua Joaquim Marques Alves, 765</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">OS Nº</p>
                  <p className="text-2xl font-black">{osData.osNumber}</p>
                  <p className="text-[10px] font-bold text-zinc-500">{new Date(osData.createdAt).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-8 print-info-cards">
                <div className="bg-zinc-50 p-5 rounded-3xl border border-zinc-100">
                  <h5 className="text-[9px] font-black uppercase text-zinc-400 tracking-widest mb-1">Proprietário</h5>
                  <p className="font-black text-base">{osData.clientName}</p>
                  <p className="text-[10px] font-bold text-zinc-500 mt-1">{selectedClient?.phone}</p>
                </div>
                <div className="bg-zinc-50 p-5 rounded-3xl border border-zinc-100">
                  <h5 className="text-[9px] font-black uppercase text-zinc-400 tracking-widest mb-1">Veículo</h5>
                  <div className="flex justify-between items-center">
                    <div>
                        <p className="font-black text-lg uppercase tracking-tighter leading-none mb-1">{osData.vehiclePlate}</p>
                        <p className="text-xs font-black text-zinc-700 uppercase">{osData.vehicleModel}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">KM Atual</p>
                        <p className="text-base font-black text-zinc-900">{osData.vehicleKm} km</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="border-b-2 border-zinc-100">
                    <tr className="text-zinc-400 uppercase font-black text-[9px] tracking-widest">
                      <th className="py-3 px-1">Descrição</th>
                      <th className="py-3 px-1 text-center w-12">Qtd</th>
                      <th className="py-3 px-1 text-right w-24">Unitário</th>
                      <th className="py-3 px-1 text-right w-24">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50">
                    {osData.items.map((item, i) => (
                      <tr key={i} className="print:text-[10px]">
                        <td className="py-3 px-1 font-bold text-zinc-800">{item.description}</td>
                        <td className="py-3 px-1 text-center font-black text-zinc-400">{item.quantity}</td>
                        <td className="py-3 px-1 text-right text-zinc-500">R$ {item.unitPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        <td className="py-3 px-1 text-right font-black text-zinc-900">R$ {(item.quantity * item.unitPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                    {osData.laborValue > 0 && (
                      <tr className="bg-zinc-50/30">
                        <td className="py-3 px-1 font-black text-zinc-900">Mão de Obra Especializada</td>
                        <td className="py-3 px-1 text-center font-black text-zinc-400">01</td>
                        <td className="py-3 px-1 text-right text-zinc-500">R$ {osData.laborValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        <td className="py-3 px-1 text-right font-black text-zinc-900">R$ {osData.laborValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-8 pt-8 border-t-2 border-zinc-100 print-block">
                <div className="flex justify-between items-end">
                  <div className="flex flex-col gap-6">
                    <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest inline-block border ${osData.paymentStatus === PaymentStatus.PAGO ? 'text-emerald-600 border-emerald-100' : 'text-amber-600 border-amber-100'}`}>
                      PAGAMENTO: {osData.paymentStatus.toUpperCase()}
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="w-56 h-px bg-zinc-200 mb-2"></div>
                        <p className="text-[9px] text-zinc-400 font-black uppercase tracking-widest">Assinatura do Responsável</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2 min-w-[280px]">
                    <div className="w-full bg-zinc-100 p-4 rounded-[2rem] text-right">
                        <p className="text-[8px] font-black uppercase text-zinc-400 tracking-widest mb-1">Total da Nota</p>
                        <p className="text-2xl font-black text-zinc-900 leading-none">R$ {osData.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-12 text-center text-[9px] font-black text-zinc-300 uppercase tracking-[0.5em]">
                  Kaen Mecânica • Confiança em cada km
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewServiceOrder;
