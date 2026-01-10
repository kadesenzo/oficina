
import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  Car, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Search, 
  ArrowRight,
  ClipboardList,
  AlertTriangle,
  X,
  Share2,
  Check,
  Fuel,
  HelpCircle,
  FileText,
  DollarSign,
  Smartphone
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Client, Vehicle, OSItem, ServiceOrder, OSStatus, PaymentStatus, VehicleChecklist } from '../types';

const MechanicTerminal: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'SERVICE' | 'CHECKLIST'>('SERVICE');
  const [showInstructions, setShowInstructions] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  
  // Search State
  const [search, setSearch] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  
  // Form State (Service)
  const [serviceDescription, setServiceDescription] = useState('');
  const [items, setItems] = useState<OSItem[]>([]);
  const [labor, setLabor] = useState(0);
  const [currentKm, setCurrentKm] = useState('');

  // Checklist State
  const [checklist, setChecklist] = useState({
    fuelLevel: '1/2',
    damages: [] as string[],
    items: {
      'Faróis': true,
      'Lanternas': true,
      'Pneus': true,
      'Estepe': true,
      'Vidros': true,
      'Retrovisores': true,
      'Limpador': true,
      'Painel': true,
      'Interior': true,
      'Vazamentos': false
    } as Record<string, boolean>,
    observations: ''
  });

  const [showChecklistResult, setShowChecklistResult] = useState<VehicleChecklist | null>(null);

  useEffect(() => {
    setVehicles(JSON.parse(localStorage.getItem('kaenpro_vehicles') || '[]'));
    setClients(JSON.parse(localStorage.getItem('kaenpro_clients') || '[]'));
  }, []);

  const filteredVehicles = search.length > 1 ? vehicles.filter(v => 
    v.plate.toLowerCase().includes(search.toLowerCase()) ||
    v.model.toLowerCase().includes(search.toLowerCase())
  ) : [];

  const handleSelectVehicle = (v: Vehicle) => {
    setSelectedVehicle(v);
    setCurrentKm(v.km.toString());
    setSearch('');
  };

  const toggleDamage = (area: string) => {
    setChecklist(prev => ({
      ...prev,
      damages: prev.damages.includes(area) 
        ? prev.damages.filter(a => a !== area) 
        : [...prev.damages, area]
    }));
  };

  const toggleCheckItem = (item: string) => {
    setChecklist(prev => ({
      ...prev,
      items: { ...prev.items, [item]: !prev.items[item] }
    }));
  };

  const handleFinalizeService = () => {
    if (!selectedVehicle || !serviceDescription) {
      alert("ERRO: Selecione um veículo e descreva o serviço.");
      return;
    }
    const owner = clients.find(c => c.id === selectedVehicle.clientId);
    const newOs: ServiceOrder = {
      id: Math.random().toString(36).substr(2, 9),
      osNumber: `TEC-${Date.now().toString().slice(-6)}`,
      clientId: selectedVehicle.clientId,
      clientName: owner?.name || 'Cliente Genérico',
      vehicleId: selectedVehicle.id,
      vehiclePlate: selectedVehicle.plate,
      vehicleModel: selectedVehicle.model,
      vehicleKm: currentKm,
      problem: serviceDescription,
      items,
      laborValue: labor,
      discount: 0,
      totalValue: (items.reduce((acc, curr) => acc + (curr.quantity * curr.unitPrice), 0)) + labor,
      status: OSStatus.FINALIZADO,
      paymentStatus: PaymentStatus.PENDENTE,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const savedOrders = JSON.parse(localStorage.getItem('kaenpro_orders') || '[]');
    localStorage.setItem('kaenpro_orders', JSON.stringify([...savedOrders, newOs]));
    alert("SERVIÇO REGISTRADO! O administrador poderá gerar a nota agora.");
    navigate('/orders');
  };

  const handleFinalizeChecklist = () => {
    if (!selectedVehicle) return;
    const owner = clients.find(c => c.id === selectedVehicle.clientId);
    const newChecklist: VehicleChecklist = {
      id: Math.random().toString(36).substr(2, 9),
      vehicleId: selectedVehicle.id,
      plate: selectedVehicle.plate,
      clientName: owner?.name || 'Cliente',
      clientPhone: owner?.phone || '',
      km: currentKm,
      fuelLevel: checklist.fuelLevel,
      damages: checklist.damages,
      items: checklist.items,
      observations: checklist.observations,
      createdAt: new Date().toISOString()
    };
    const savedChecklists = JSON.parse(localStorage.getItem('kaenpro_checklists') || '[]');
    localStorage.setItem('kaenpro_checklists', JSON.stringify([...savedChecklists, newChecklist]));
    setShowChecklistResult(newChecklist);
  };

  const shareChecklist = () => {
    if (!showChecklistResult) return;
    const text = `*CHECKLIST DE ENTRADA - KAENPRO*\n\n🚗 *Veículo:* ${showChecklistResult.plate}\n👤 *Cliente:* ${showChecklistResult.clientName}\n📍 *KM:* ${showChecklistResult.km}\n⛽ *Combustível:* ${showChecklistResult.fuelLevel}\n\n⚠️ *Avarias:* ${showChecklistResult.damages.length > 0 ? showChecklistResult.damages.join(', ') : 'Nenhuma'}\n\n📝 *Obs:* ${showChecklistResult.observations || 'Nenhuma'}`;
    window.open(`https://wa.me/55${showChecklistResult.clientPhone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const DamageArea = ({ id, label, className }: { id: string, label: string, className: string }) => (
    <button 
      onClick={() => toggleDamage(id)}
      className={`absolute ${className} rounded-lg border-2 text-[8px] font-black uppercase flex items-center justify-center p-1 transition-all
      ${checklist.damages.includes(id) 
        ? 'bg-red-500 border-red-400 text-white shadow-lg shadow-red-500/50 scale-110 z-10' 
        : 'bg-zinc-800 border-zinc-700 text-zinc-500 opacity-60 hover:opacity-100'}`}
    >
      {label}
    </button>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 animate-in fade-in duration-500">
      {/* Header com Instruções */}
      <div className="flex items-center justify-between px-2">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tighter italic">Terminal Operacional</h1>
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Painel do Mecânico</p>
        </div>
        <button 
          onClick={() => setShowInstructions(true)}
          className="p-3 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-2xl hover:text-[#A32121] transition-all"
        >
          <HelpCircle size={24} />
        </button>
      </div>

      {/* Tab Selector Refinado */}
      <div className="bg-zinc-900 p-2 rounded-[2rem] border border-zinc-800 flex gap-2 shadow-2xl">
        <button 
          onClick={() => setActiveTab('SERVICE')}
          className={`flex-1 py-5 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest transition-all flex flex-col items-center justify-center gap-2
          ${activeTab === 'SERVICE' ? 'bg-[#A32121] text-white shadow-xl shadow-red-900/20' : 'text-zinc-600 hover:text-white'}`}
        >
          <Wrench size={22} />
          <span>Lançar Serviço</span>
        </button>
        <button 
          onClick={() => setActiveTab('CHECKLIST')}
          className={`flex-1 py-5 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest transition-all flex flex-col items-center justify-center gap-2
          ${activeTab === 'CHECKLIST' ? 'bg-[#A32121] text-white shadow-xl shadow-red-900/20' : 'text-zinc-600 hover:text-white'}`}
        >
          <ClipboardList size={22} />
          <span>Checklist Entrada</span>
        </button>
      </div>

      {/* Descrição da Aba Ativa */}
      <div className="px-4 py-2 bg-zinc-900/30 border-l-4 border-[#A32121] rounded-r-xl">
        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider leading-relaxed">
          {activeTab === 'SERVICE' 
            ? "REGISTRO TÉCNICO: Informe o que foi feito e peças usadas. Estes dados preenchem a nota do cliente automaticamente." 
            : "CHECKLIST: Registre o estado do veículo na entrada. Use para proteção jurídica da oficina."}
        </p>
      </div>

      {!selectedVehicle ? (
        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] shadow-xl space-y-6">
          <div className="flex items-center gap-4 mb-2">
            <Search className="text-[#A32121]" size={24} />
            <h2 className="text-xl font-bold uppercase tracking-tighter">Identificar Carro</h2>
          </div>
          <div className="relative">
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="DIGITE A PLACA OU MODELO..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-3xl px-8 py-6 text-lg text-white font-black placeholder-zinc-800 focus:border-[#A32121] outline-none transition-all uppercase tracking-widest"
            />
            {filteredVehicles.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-3 bg-zinc-900 border border-zinc-800 rounded-[2rem] overflow-hidden z-50 shadow-2xl">
                {filteredVehicles.map(v => (
                  <button key={v.id} onClick={() => handleSelectVehicle(v)} className="w-full p-6 flex items-center justify-between hover:bg-zinc-800 border-b border-zinc-800 last:border-none active:bg-[#A32121]">
                    <div className="text-left">
                      <p className="font-black text-white uppercase text-lg">{v.plate}</p>
                      <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">{v.model}</p>
                    </div>
                    <ArrowRight size={20} className="text-[#A32121]" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
           {/* Car Context Mini */}
           <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-[2rem] flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-zinc-950 rounded-2xl flex items-center justify-center border border-[#A32121]/50 text-[#A32121]">
                <Car size={28} />
              </div>
              <div>
                <h2 className="text-lg font-black text-white leading-none uppercase">{selectedVehicle.model}</h2>
                <p className="text-[10px] font-black text-[#A32121] mt-1 tracking-widest uppercase">{selectedVehicle.plate}</p>
              </div>
            </div>
            <button onClick={() => setSelectedVehicle(null)} className="px-4 py-2 bg-zinc-800 rounded-xl text-[10px] font-black uppercase text-zinc-400 border border-zinc-700 active:scale-95 transition-transform">Trocar</button>
          </div>

          {activeTab === 'SERVICE' ? (
            <div className="space-y-6">
               <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] shadow-xl space-y-6">
                <div>
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-3 block ml-2">Relato Técnico do Serviço</label>
                  <textarea 
                    value={serviceDescription}
                    onChange={(e) => setServiceDescription(e.target.value)}
                    placeholder="O QUE FOI FEITO NO CARRO? SEJA DETALHISTA..."
                    rows={5}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-[2rem] p-6 text-sm text-white focus:border-[#A32121] outline-none placeholder-zinc-800 font-medium"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-3 block ml-2">Mão de Obra (R$)</label>
                    <input type="number" value={labor || ''} onChange={(e) => setLabor(parseFloat(e.target.value) || 0)} placeholder="0.00" className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-5 text-white font-black text-lg focus:border-[#A32121] outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-3 block ml-2">KM de Saída</label>
                    <input type="number" value={currentKm} onChange={(e) => setCurrentKm(e.target.value)} placeholder="000.000" className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-5 text-white font-black text-lg focus:border-[#A32121] outline-none" />
                  </div>
                </div>
                
                <button 
                  onClick={handleFinalizeService} 
                  className="w-full bg-[#A32121] py-6 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl shadow-red-900/30 active:scale-95 transition-transform"
                >
                  <CheckCircle2 size={24} /> Registrar Serviço
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Visual Damage Map */}
              <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] shadow-xl">
                <h3 className="text-lg font-black mb-10 flex items-center gap-3">
                  <AlertTriangle size={20} className="text-amber-500" /> 
                  Mapear Avarias Visuais
                </h3>
                
                <div className="relative w-full aspect-[4/3] bg-zinc-950 rounded-[2.5rem] border border-zinc-800 overflow-hidden mb-8 shadow-inner">
                  <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none scale-150">
                    <Car size={300} />
                  </div>
                  
                  {/* Damage Hotspots */}
                  <DamageArea id="para-choque-front" label="P.Choque Diant" className="top-[40%] left-[4%]" />
                  <DamageArea id="capo" label="Capô" className="top-[40%] left-[25%]" />
                  <DamageArea id="teto" label="Teto" className="top-[40%] left-[50%]" />
                  <DamageArea id="mala" label="Porta Malas" className="top-[40%] right-[25%]" />
                  <DamageArea id="para-choque-tras" label="P.Choque Tras" className="top-[40%] right-[4%]" />
                  
                  <DamageArea id="porta-fr-esq" label="Diant Esq" className="top-[70%] left-[30%]" />
                  <DamageArea id="porta-tr-esq" label="Tras Esq" className="top-[70%] left-[60%]" />
                  <DamageArea id="porta-fr-dir" label="Diant Dir" className="top-[10%] left-[30%]" />
                  <DamageArea id="porta-tr-dir" label="Tras Dir" className="top-[10%] left-[60%]" />
                </div>
                
                <p className="text-[10px] text-zinc-600 font-bold uppercase text-center tracking-widest italic">Toque nas áreas do veículo para marcar riscos ou amassados</p>
              </div>

              {/* Items Verification */}
              <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] shadow-xl">
                 <h3 className="text-lg font-black mb-6 flex items-center gap-3"><CheckCircle2 size={20} className="text-[#A32121]" /> Conferência de Itens</h3>
                 <div className="grid grid-cols-2 gap-3">
                    {Object.entries(checklist.items).map(([name, status]) => (
                      <button 
                        key={name}
                        onClick={() => toggleCheckItem(name)}
                        className={`p-5 rounded-2xl border-2 flex items-center justify-between transition-all active:scale-95
                        ${status ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500' : 'bg-red-500/10 border-red-500/50 text-red-500'}`}
                      >
                        <span className="text-[10px] font-black uppercase tracking-widest">{name}</span>
                        {status ? <Check size={18} /> : <X size={18} />}
                      </button>
                    ))}
                 </div>
              </div>

              {/* Fuel & Obs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem]">
                  <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2"><Fuel size={14} /> Nível Combustível</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {['Res', '1/4', '1/2', 'Cheio'].map(lvl => (
                      <button 
                        key={lvl}
                        onClick={() => setChecklist(p => ({...p, fuelLevel: lvl}))}
                        className={`py-4 rounded-xl text-[10px] font-black border-2 transition-all active:scale-90 ${checklist.fuelLevel === lvl ? 'bg-white text-black border-white shadow-lg' : 'bg-zinc-950 text-zinc-700 border-zinc-800'}`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem]">
                  <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">Obs. Adicionais</h3>
                  <textarea 
                    value={checklist.observations}
                    onChange={(e) => setChecklist(p => ({...p, observations: e.target.value}))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-xs text-white focus:border-[#A32121] outline-none"
                    placeholder="Ex: Veículo sujo, objetos de valor no console..."
                    rows={3}
                  />
                </div>
              </div>

              <button 
                onClick={handleFinalizeChecklist}
                className="w-full bg-[#A32121] py-6 rounded-[2.5rem] font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 shadow-2xl shadow-red-900/30 active:scale-95 transition-transform"
              >
                Gerar Comprovante de Entrada
              </button>
            </div>
          )}
        </div>
      )}

      {/* Checklist Result Overlay */}
      {showChecklistResult && (
        <div className="fixed inset-0 z-[300] bg-black/95 flex items-center justify-center p-4">
          <div className="bg-white text-zinc-900 w-full max-w-lg p-10 rounded-[3rem] shadow-2xl relative animate-in zoom-in">
            <button onClick={() => setShowChecklistResult(null)} className="absolute top-8 right-8 text-zinc-400 hover:text-zinc-900"><X size={32} /></button>
            
            <div className="text-center mb-8 border-b border-zinc-100 pb-6">
              <div className="w-16 h-16 bg-black rounded-3xl flex items-center justify-center text-white mx-auto mb-4">
                <CheckCircle2 size={32} />
              </div>
              <h2 className="text-2xl font-black uppercase tracking-tighter">Entrada Registrada</h2>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Protocolo de Recebimento de Veículo</p>
            </div>

            <div className="space-y-4 mb-10">
              <div className="flex justify-between border-b border-zinc-50 py-3">
                <span className="text-[10px] font-black uppercase text-zinc-400">Veículo</span>
                <span className="font-black uppercase">{showChecklistResult.plate}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-50 py-3">
                <span className="text-[10px] font-black uppercase text-zinc-400">Cliente</span>
                <span className="font-black uppercase">{showChecklistResult.clientName}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-50 py-3">
                <span className="text-[10px] font-black uppercase text-zinc-400">Estado Visual</span>
                <span className={`font-black uppercase ${showChecklistResult.damages.length > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                   {showChecklistResult.damages.length > 0 ? `${showChecklistResult.damages.length} Avarias` : 'Sem Avarias'}
                </span>
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={shareChecklist}
                className="flex-1 bg-[#25D366] py-5 rounded-3xl font-black uppercase text-[10px] tracking-widest text-white flex items-center justify-center gap-2 shadow-lg shadow-green-900/20"
              >
                <Share2 size={16} /> WhatsApp
              </button>
              <button 
                onClick={() => setShowChecklistResult(null)}
                className="flex-1 bg-zinc-100 py-5 rounded-3xl font-black uppercase text-[10px] tracking-widest text-zinc-600 border border-zinc-200"
              >
                Finalizar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Instructions Modal */}
      {showInstructions && (
        <div className="fixed inset-0 z-[400] bg-black/90 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-lg p-10 rounded-[3rem] shadow-2xl relative animate-in zoom-in">
            <button onClick={() => setShowInstructions(false)} className="absolute top-8 right-8 text-zinc-500 hover:text-white"><X size={28} /></button>
            
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 bg-[#A32121] rounded-2xl flex items-center justify-center text-white">
                <HelpCircle size={24} />
              </div>
              <h2 className="text-xl font-black uppercase tracking-tighter">Guia do Mecânico</h2>
            </div>

            <div className="space-y-8">
              <div className="flex gap-5">
                <div className="p-3 bg-zinc-800 rounded-xl h-fit text-[#A32121]"><Wrench size={24} /></div>
                <div>
                  <h4 className="font-black text-sm uppercase mb-1">1. Lançar Serviço</h4>
                  <p className="text-xs text-zinc-500 leading-relaxed">Use para registrar o que foi feito no carro e peças usadas. Estes dados criam a nota do cliente automaticamente para o administrador.</p>
                </div>
              </div>

              <div className="flex gap-5">
                <div className="p-3 bg-zinc-800 rounded-xl h-fit text-[#A32121]"><ClipboardList size={24} /></div>
                <div>
                  <h4 className="font-black text-sm uppercase mb-1">2. Checklist de Entrada</h4>
                  <p className="text-xs text-zinc-500 leading-relaxed">Use logo que o carro chegar. Registre avarias visuais e itens obrigatórios. Isso protege você de reclamações injustas sobre riscos ou batidas.</p>
                </div>
              </div>

              <div className="flex gap-5">
                <div className="p-3 bg-zinc-800 rounded-xl h-fit text-[#A32121]"><Smartphone size={24} /></div>
                <div>
                  <h4 className="font-black text-sm uppercase mb-1">Uso Mobile</h4>
                  <p className="text-xs text-zinc-500 leading-relaxed">O sistema foi feito para ser usado no celular. Registre tudo na hora ao lado do veículo para não esquecer detalhes importantes.</p>
                </div>
              </div>

              <button 
                onClick={() => setShowInstructions(false)}
                className="w-full bg-[#A32121] py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest mt-4"
              >
                Entendi, vamos trabalhar!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MechanicTerminal;
