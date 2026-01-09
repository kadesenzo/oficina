
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
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Client, Vehicle, OSItem, OSStatus, Part, ServiceOrder, PaymentStatus } from '../types';

const NewServiceOrder: React.FC = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [allVehicles, setAllVehicles] = useState<Vehicle[]>([]);
  const [inventory, setInventory] = useState<Part[]>([]);
  
  // Selection State
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientVehicles, setClientVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  
  // OS Data State
  const [currentKm, setCurrentKm] = useState('');
  const [problem, setProblem] = useState('');
  const [items, setItems] = useState<OSItem[]>([]);
  const [labor, setLabor] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(PaymentStatus.PENDENTE);
  
  // UI State
  const [showInvoice, setShowInvoice] = useState(false);
  const [osData, setOsData] = useState<ServiceOrder | null>(null);

  useEffect(() => {
    setClients(JSON.parse(localStorage.getItem('kaenpro_clients') || '[]'));
    setAllVehicles(JSON.parse(localStorage.getItem('kaenpro_vehicles') || '[]'));
    setInventory(JSON.parse(localStorage.getItem('kaenpro_parts') || '[]'));
  }, []);

  // Handle Client Selection
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

  // Handle Vehicle Selection
  const handleVehicleChange = (vehicleId: string) => {
    const vehicle = clientVehicles.find(v => v.id === vehicleId) || null;
    setSelectedVehicle(vehicle);
    if (vehicle) {
      setCurrentKm(vehicle.km.toString());
    } else {
      setCurrentKm('');
    }
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

  const handlePartSelect = (itemId: string, partId: string) => {
    const part = inventory.find(p => p.id === partId);
    if (part) {
      setItems(items.map(item => item.id === itemId ? {
        ...item,
        description: part.name,
        unitPrice: part.salePrice
      } : item));
    }
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
      alert("ERRO: Selecione um Cliente e um Veículo primeiro.");
      return;
    }

    if (!currentKm) {
      alert("ERRO: Informe o KM atual do veículo para esta nota.");
      return;
    }

    if (!problem.trim()) {
      alert("ERRO: Descreva o serviço realizado.");
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

    // Save OS
    const existing = JSON.parse(localStorage.getItem('kaenpro_orders') || '[]');
    localStorage.setItem('kaenpro_orders', JSON.stringify([...existing, newOs]));

    // Update Vehicle KM
    const updatedVehicles = allVehicles.map(v => 
      v.id === selectedVehicle.id ? { ...v, km: parseFloat(currentKm) } : v
    );
    localStorage.setItem('kaenpro_vehicles', JSON.stringify(updatedVehicles));

    // Stock deduction
    const updatedInventory = [...inventory];
    items.forEach(item => {
      if (item.type === 'PART') {
        const invPart = updatedInventory.find(p => p.name.toLowerCase() === item.description.toLowerCase());
        if (invPart) invPart.stock -= item.quantity;
      }
    });
    localStorage.setItem('kaenpro_parts', JSON.stringify(updatedInventory));

    setOsData(newOs);
    setShowInvoice(true);
  };

  const shareWhatsApp = () => {
    if (!osData) return;
    const msg = `*KAEN MECÂNICA - NOTA #${osData.osNumber}*\n` +
                `*Cliente:* ${osData.clientName}\n` +
                `*Veículo:* ${osData.vehiclePlate}\n` +
                `*KM:* ${osData.vehicleKm} km\n` +
                `*Total: R$ ${osData.totalValue.toLocaleString('pt-BR')}*`;
    window.open(`https://wa.me/55${selectedClient?.phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 animate-in slide-in-from-bottom duration-500">
      <div className="flex items-center justify-between no-print">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors">
          <ChevronLeft size={20} />
          <span className="font-bold uppercase text-[10px] tracking-widest">Voltar para Notas</span>
        </button>
        <div className="text-right">
          <h1 className="text-2xl font-black text-white leading-none uppercase tracking-tighter">Gerar Nova Nota</h1>
          <p className="text-[10px] font-black text-[#A32121] uppercase tracking-[0.2em] mt-1">Kaen Mecânica</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 no-print">
        <div className="lg:col-span-2 space-y-6">
          
          {/* STEP 1: CLIENT & VEHICLE SELECTION */}
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] space-y-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <User size={100} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">1. Selecionar Cliente</label>
                <div className="relative">
                  <select 
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-white focus:border-[#A32121] outline-none transition-all appearance-none"
                    onChange={(e) => handleClientChange(e.target.value)}
                    value={selectedClient?.id || ''}
                  >
                    <option value="">Buscar cliente...</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <User className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-700" size={18} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">2. Selecionar Veículo</label>
                <div className="relative">
                  <select 
                    disabled={!selectedClient}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-white focus:border-[#A32121] outline-none transition-all appearance-none disabled:opacity-50"
                    onChange={(e) => handleVehicleChange(e.target.value)}
                    value={selectedVehicle?.id || ''}
                  >
                    <option value="">{selectedClient ? 'Escolher veículo...' : 'Selecione o cliente primeiro'}</option>
                    {clientVehicles.map(v => <option key={v.id} value={v.id}>{v.plate} - {v.model}</option>)}
                  </select>
                  <Car className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-700" size={18} />
                </div>
              </div>
            </div>

            {selectedVehicle && (
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-zinc-800 animate-in slide-in-from-top duration-300">
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
                    placeholder="Informar KM"
                  />
                </div>
              </div>
            )}
          </div>

          {/* STEP 2: SERVICE DESCRIPTION */}
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] space-y-4 shadow-xl">
             <div className="flex items-center gap-3 mb-2">
               <Wrench className="text-[#A32121]" size={20} />
               <h3 className="text-lg font-bold">Relato do Serviço Realizado</h3>
             </div>
             <textarea 
               value={problem}
               onChange={(e) => setProblem(e.target.value)}
               rows={4}
               placeholder="Descreva aqui detalhadamente o que foi feito no veículo..."
               className="w-full bg-zinc-950 border border-zinc-800 rounded-3xl p-6 text-sm font-medium leading-relaxed focus:border-[#A32121] outline-none text-white transition-all"
             />
          </div>

          {/* STEP 3: ITEMS & BILLING */}
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold flex items-center gap-2"><Package size={20} className="text-[#A32121]" /> Peças e Serviços</h3>
              <div className="flex gap-2">
                <button onClick={() => addItem('SERVICE')} className="text-[10px] font-black uppercase text-zinc-400 bg-zinc-800 px-4 py-2.5 rounded-xl hover:text-white transition-all">+ Serviço Manual</button>
                <button onClick={() => addItem('PART')} className="text-[10px] font-black uppercase text-[#A32121] bg-[#A32121]/10 px-4 py-2.5 rounded-xl hover:bg-[#A32121] hover:text-white transition-all">+ Adicionar Peça</button>
              </div>
            </div>

            <div className="space-y-3">
              {items.map(item => (
                <div key={item.id} className="flex gap-3 p-4 bg-zinc-950 border border-zinc-800 rounded-3xl items-center animate-in zoom-in duration-200">
                  {item.type === 'PART' ? (
                    <select 
                      className="flex-1 bg-transparent border-b border-zinc-800 text-sm text-white outline-none focus:border-[#A32121]"
                      onChange={(e) => handlePartSelect(item.id, e.target.value)}
                      value=""
                    >
                      <option value="">{item.description || "Selecionar peça do estoque..."}</option>
                      {inventory.map(p => <option key={p.id} value={p.id}>{p.name} (Saldo: {p.stock})</option>)}
                    </select>
                  ) : (
                    <input 
                      type="text" 
                      placeholder="Nome do serviço..."
                      value={item.description}
                      onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                      className="flex-1 bg-transparent border-b border-zinc-800 text-sm text-white outline-none focus:border-[#A32121]" 
                    />
                  )}
                  
                  <div className="flex items-center gap-3">
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
                      placeholder="V. Unit"
                    />
                    <button onClick={() => removeItem(item.id)} className="text-zinc-700 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                  </div>
                </div>
              ))}
              {items.length === 0 && (
                <div className="py-12 text-center text-zinc-600 space-y-2 border-2 border-dashed border-zinc-800 rounded-[2rem]">
                  <Package className="mx-auto opacity-10" size={40} />
                  <p className="text-xs font-bold uppercase tracking-widest">Nenhuma peça ou serviço listado</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SIDEBAR: TOTALS & PAYMENT */}
        <div className="space-y-6 no-print">
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] space-y-6 shadow-xl">
            <h3 className="text-[10px] font-black uppercase text-zinc-500 flex items-center gap-2"><CreditCard size={14} /> Recebimento</h3>
            <div className="grid grid-cols-1 gap-3">
              <button 
                onClick={() => setPaymentStatus(PaymentStatus.PAGO)}
                className={`p-5 rounded-2xl flex items-center justify-between border transition-all ${paymentStatus === PaymentStatus.PAGO ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' : 'bg-zinc-950 border-zinc-800 text-zinc-600'}`}
              >
                <span className="text-[10px] font-black uppercase tracking-widest">Já Recebido</span>
                <CheckCircle2 size={18} />
              </button>
              <button 
                onClick={() => setPaymentStatus(PaymentStatus.PENDENTE)}
                className={`p-5 rounded-2xl flex items-center justify-between border transition-all ${paymentStatus === PaymentStatus.PENDENTE ? 'bg-amber-500/10 border-amber-500 text-amber-500' : 'bg-zinc-950 border-zinc-800 text-zinc-600'}`}
              >
                <span className="text-[10px] font-black uppercase tracking-widest">Pendente</span>
                <Clock size={18} />
              </button>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] text-white shadow-2xl space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Valores Finais</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="text-zinc-500">Subtotal</span>
                <span>R$ {items.reduce((acc, curr) => acc + (curr.quantity * curr.unitPrice), 0).toLocaleString('pt-BR')}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="text-zinc-500">Mão de Obra</span>
                <input 
                  type="number" 
                  value={labor}
                  onChange={(e) => setLabor(parseFloat(e.target.value) || 0)}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 w-24 text-right outline-none focus:border-[#A32121]" 
                />
              </div>
              <div className="flex justify-between items-center text-sm font-bold text-red-500">
                <span className="text-zinc-500">Desconto</span>
                <input 
                  type="number" 
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 w-24 text-right outline-none focus:border-red-500" 
                />
              </div>
              <div className="pt-6 border-t border-zinc-800 mt-6 flex flex-col gap-1">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#A32121]">Valor Total Líquido</span>
                <span className="text-5xl font-black tracking-tighter">R$ {calculateTotal().toLocaleString('pt-BR')}</span>
              </div>
            </div>
          </div>

          <button 
            onClick={handleFinalize}
            disabled={!selectedClient || !selectedVehicle}
            className="w-full bg-[#A32121] py-6 rounded-[2.5rem] font-black uppercase text-xs tracking-[0.3em] text-white flex items-center justify-center gap-3 hover:bg-[#8B1A1A] transition-all disabled:opacity-50 disabled:grayscale"
          >
            <Save size={20} />
            Gerar Nota Pronta
          </button>
        </div>
      </div>

      {/* FINAL INVOICE MODAL (A4 PRINT READY) */}
      {showInvoice && osData && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 p-0 sm:p-4 overflow-y-auto no-scrollbar">
          <div className="bg-white w-full max-w-[210mm] min-h-screen sm:min-h-0 sm:rounded-[2rem] p-0 text-zinc-900 shadow-2xl relative overflow-hidden flex flex-col">
            
            {/* NO PRINT ACTIONS */}
            <div className="no-print bg-zinc-100 p-4 flex justify-between items-center border-b border-zinc-200 sticky top-0 z-[210]">
              <div className="flex gap-2">
                <button onClick={() => window.print()} className="bg-zinc-900 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-black transition-all">
                  <Printer size={16} /> Imprimir / PDF
                </button>
                <button onClick={shareWhatsApp} className="bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase flex items-center gap-2">
                  <Share2 size={16} /> WhatsApp
                </button>
              </div>
              <button onClick={() => setShowInvoice(false)} className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors"><X size={32} /></button>
            </div>

            <div id="print-area" className="p-[10mm] sm:p-[15mm] text-zinc-900 flex flex-col flex-1 bg-white">
              {/* FIXED HEADER */}
              <div className="flex justify-between items-start mb-8 pb-6 border-b-2 border-zinc-100 print-block">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center text-white print:border print:border-black">
                    <Wrench size={32} />
                  </div>
                  <div>
                    <h1 className="text-2xl font-black tracking-tighter">KAEN <span className="text-zinc-900">MECÂNICA</span></h1>
                    <p className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.2em] mt-0.5">Rua Joaquim Marques Alves, 765</p>
                    <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-[0.1em] mt-1 italic">Qualidade em cada detalhe.</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="bg-zinc-100 px-6 py-3 rounded-2xl mb-2">
                    <p className="text-[9px] font-black uppercase text-zinc-400 tracking-widest">OS Nº</p>
                    <p className="text-2xl font-black">{osData.osNumber}</p>
                  </div>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                    {new Date(osData.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>

              {/* CLIENT & VEHICLE - AUTO FILLED */}
              <div className="grid grid-cols-2 gap-6 mb-8 print-block">
                <div className="bg-zinc-50 p-5 rounded-3xl border border-zinc-100">
                  <h5 className="text-[9px] font-black uppercase text-zinc-400 tracking-widest mb-2">Dados do Cliente</h5>
                  <p className="font-black text-base leading-none">{osData.clientName}</p>
                  <p className="text-[10px] font-bold text-zinc-500 mt-2 uppercase">WhatsApp: {selectedClient?.phone}</p>
                  <p className="text-[9px] font-medium text-zinc-400 mt-0.5 uppercase tracking-tighter">{selectedClient?.document || 'NÃO INFORMADO'}</p>
                </div>
                <div className="bg-zinc-50 p-5 rounded-3xl border border-zinc-100">
                  <h5 className="text-[9px] font-black uppercase text-zinc-400 tracking-widest mb-2">Dados do Veículo</h5>
                  <div className="flex justify-between items-end">
                    <div>
                        <p className="font-black text-xl uppercase tracking-tighter text-[#000] leading-none mb-1">{osData.vehiclePlate}</p>
                        <p className="text-xs font-black text-zinc-700 uppercase">{osData.vehicleModel}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">KM Atual</p>
                        <p className="text-base font-black text-zinc-900 leading-none">{osData.vehicleKm} km</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* SERVICE DESCRIPTION - MANUAL FIELD */}
              <div className="mb-8 p-6 bg-zinc-50/50 rounded-3xl border border-zinc-100 border-dashed print-block">
                <h5 className="text-[9px] font-black uppercase text-zinc-400 tracking-widest mb-2">Detalhamento dos Serviços Prestados</h5>
                <p className="text-sm text-zinc-800 leading-relaxed font-medium">
                  {osData.problem}
                </p>
              </div>

              {/* ITEMS TABLE */}
              <div className="flex-1">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="border-b-2 border-zinc-100">
                    <tr className="text-zinc-400 uppercase font-black text-[9px] tracking-[0.2em]">
                      <th className="py-4 px-1">Descrição Técnica (Peça / Mão de Obra)</th>
                      <th className="py-4 px-1 text-center w-12">Qtd</th>
                      <th className="py-4 px-1 text-right w-24">V. Unitário</th>
                      <th className="py-4 px-1 text-right w-24">Subtotal</th>
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
                      <tr className="bg-zinc-50/30 print:text-[10px]">
                        <td className="py-3 px-1 font-black text-zinc-900">Mão de Obra Técnica Especializada</td>
                        <td className="py-3 px-1 text-center font-black text-zinc-400">01</td>
                        <td className="py-3 px-1 text-right text-zinc-500">R$ {osData.laborValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        <td className="py-3 px-1 text-right font-black text-zinc-900">R$ {osData.laborValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* FOOTER & TOTALS */}
              <div className="mt-8 pt-8 border-t-2 border-zinc-100 print-block">
                <div className="flex justify-between items-end">
                  <div className="flex flex-col gap-8">
                    <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest inline-block border ${osData.paymentStatus === PaymentStatus.PAGO ? 'text-emerald-600 border-emerald-100' : 'text-amber-600 border-amber-100'}`}>
                      STATUS: {osData.paymentStatus.toUpperCase()}
                    </div>
                    <div className="space-y-4">
                        <div className="flex flex-col items-center">
                          <div className="w-64 h-px bg-zinc-200 mb-2"></div>
                          <p className="text-[9px] text-zinc-400 font-black uppercase tracking-widest">Assinatura de Retirada</p>
                        </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-3 min-w-[300px]">
                    {osData.discount > 0 && (
                      <div className="flex justify-between w-full text-[10px] text-zinc-400 font-bold px-2 uppercase tracking-widest">
                        <span>Desconto Aplicado</span>
                        <span className="text-red-500">- R$ {osData.discount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                    )}
                    <div className="w-full bg-zinc-100 print:bg-white print:border-4 print:border-zinc-100 p-6 rounded-[2rem] text-right">
                        <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1 leading-none">Total Geral da Nota</p>
                        <p className="text-4xl font-black tracking-tighter text-zinc-900 leading-none">R$ {osData.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                    <p className="text-[8px] text-zinc-400 font-bold text-right italic uppercase tracking-widest leading-relaxed">
                      * Garantia de 90 dias conforme CDC. Peças novas garantidas pelo fabricante.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-16 text-center pt-6 border-t border-zinc-50 print-block">
                  <p className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.5em]">Kaen Mecânica • Confiança em cada km</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewServiceOrder;
