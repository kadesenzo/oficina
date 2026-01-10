
import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Car, 
  Package, 
  TrendingUp, 
  PlusCircle, 
  AlertCircle,
  Clock,
  ArrowUpRight,
  Cloud,
  CheckCircle2,
  ChevronRight,
  Target,
  FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ServiceOrder, Part, OSStatus, UserSession } from '../types';

interface DashboardProps {
  session?: UserSession;
}

const Dashboard: React.FC<DashboardProps> = ({ session }) => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [parts, setParts] = useState<Part[]>([]);

  useEffect(() => {
    if (session) {
      const savedOrders = JSON.parse(localStorage.getItem(`kaenpro_${session.username}_orders`) || '[]');
      const savedParts = JSON.parse(localStorage.getItem(`kaenpro_${session.username}_parts`) || '[]');
      setOrders(savedOrders);
      setParts(savedParts);
    }
  }, [session]);

  const todayStr = new Date().toISOString().split('T')[0];
  
  const dailyFinishedOrders = orders.filter(o => {
    const orderDate = new Date(o.updatedAt).toISOString().split('T')[0];
    return orderDate === todayStr && o.status === OSStatus.FINALIZADO;
  });

  const dailyRevenue = dailyFinishedOrders.reduce((acc, curr) => acc + curr.totalValue, 0);
  const carsAttendedToday = dailyFinishedOrders.length;
  const criticalStock = parts.filter(p => p.stock <= p.minStock).length;
  const inProgressCount = orders.filter(o => o.status === OSStatus.EM_ANDAMENTO).length;

  // Meta diária simulada (R$ 2.000,00)
  const dailyTarget = 2000;
  const targetPercent = Math.min(100, (dailyRevenue / dailyTarget) * 100);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl md:text-4xl font-black text-white italic uppercase tracking-tighter">
              Performance <span className="text-[#E11D48]">Center</span>
            </h1>
            <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Live Sync</span>
            </div>
          </div>
          <p className="text-zinc-500 font-bold text-[10px] uppercase tracking-[0.2em]">
            Bem-vindo, <span className="text-white">{session?.username}</span> • Oficina em operação plena
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => navigate('/orders/new')}
            className="bg-[#E11D48] px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-[#BE123C] transition-all shadow-xl shadow-red-900/10 active:scale-95 glow-red"
          >
            <PlusCircle size={18} />
            Nova OS
          </button>
          <button 
            onClick={() => navigate('/terminal')}
            className="bg-zinc-900 border border-[#1F1F1F] px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all active:scale-95"
          >
            <Clock size={18} />
            Terminal
          </button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Revenue Card */}
        <div className="bg-[#0F0F0F] border border-[#1F1F1F] p-8 rounded-[2.5rem] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <DollarSign size={80} />
          </div>
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl">
              <TrendingUp size={22} />
            </div>
            <div className="text-right">
              <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Meta do Dia</p>
              <p className="text-[10px] font-black text-emerald-500 uppercase">R$ {dailyTarget.toLocaleString()}</p>
            </div>
          </div>
          <p className="text-zinc-600 text-[9px] font-black uppercase tracking-widest mb-1">Receita Gerada Hoje</p>
          <p className="text-3xl font-black text-white mb-4">R$ {dailyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          
          {/* Target Progress Bar */}
          <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 transition-all duration-1000" 
              style={{ width: `${targetPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Cars Card */}
        <div className="bg-[#0F0F0F] border border-[#1F1F1F] p-8 rounded-[2.5rem] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Car size={80} />
          </div>
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl w-fit mb-6">
            <Car size={22} />
          </div>
          <p className="text-zinc-600 text-[9px] font-black uppercase tracking-widest mb-1">Veículos Entregues</p>
          <p className="text-3xl font-black text-white">0{carsAttendedToday}</p>
          <p className="text-[9px] font-bold text-zinc-500 mt-2 uppercase">Ciclo de trabalho concluído</p>
        </div>

        {/* In Progress Card */}
        <div className="bg-[#0F0F0F] border border-[#1F1F1F] p-8 rounded-[2.5rem] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Clock size={80} />
          </div>
          <div className="p-3 bg-[#E11D48]/10 text-[#E11D48] rounded-2xl w-fit mb-6">
            <Target size={22} />
          </div>
          <p className="text-zinc-600 text-[9px] font-black uppercase tracking-widest mb-1">Serviços no Pátio</p>
          <p className="text-3xl font-black text-white">{inProgressCount}</p>
          <p className="text-[9px] font-bold text-zinc-500 mt-2 uppercase">Notas em execução técnica</p>
        </div>

        {/* Inventory Alert Card */}
        <div className="bg-[#0F0F0F] border border-[#1F1F1F] p-8 rounded-[2.5rem] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Package size={80} />
          </div>
          <div className={`p-3 rounded-2xl w-fit mb-6 ${criticalStock > 0 ? 'bg-amber-500/10 text-amber-500' : 'bg-zinc-800 text-zinc-500'}`}>
            <Package size={22} />
          </div>
          <p className="text-zinc-600 text-[9px] font-black uppercase tracking-widest mb-1">Alerta de Reposição</p>
          <p className={`text-3xl font-black ${criticalStock > 0 ? 'text-amber-500' : 'text-white'}`}>{criticalStock}</p>
          <p className="text-[9px] font-bold text-zinc-500 mt-2 uppercase">SKUs abaixo do estoque mínimo</p>
        </div>
      </div>

      {/* Lists Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders List */}
        <div className="bg-[#0F0F0F] border border-[#1F1F1F] p-8 rounded-[3rem] shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-black uppercase text-[10px] tracking-[0.2em] text-zinc-500 flex items-center gap-2">
              <FileText size={14} className="text-[#E11D48]" /> Histórico de Hoje
            </h3>
            <button 
              onClick={() => navigate('/orders')}
              className="text-[9px] font-black text-zinc-600 uppercase hover:text-white transition-colors flex items-center gap-2"
            >
              Ver Tudo <ChevronRight size={12} />
            </button>
          </div>
          
          <div className="space-y-3">
            {dailyFinishedOrders.slice(-5).reverse().map((o, i) => (
              <div key={i} className="flex items-center justify-between p-5 bg-[#050505] rounded-3xl border border-[#1F1F1F] group hover:border-[#E11D48]/30 transition-all cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center text-zinc-600 group-hover:text-[#E11D48] transition-colors">
                    <Car size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-white uppercase tracking-tight">{o.clientName}</p>
                    <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">{o.vehiclePlate} • {o.vehicleModel}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-emerald-500">R$ {o.totalValue.toLocaleString('pt-BR')}</p>
                  <p className="text-[8px] font-black uppercase tracking-widest text-zinc-800">Finalizada</p>
                </div>
              </div>
            ))}
            {dailyFinishedOrders.length === 0 && (
              <div className="py-20 text-center">
                <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-4 text-zinc-700">
                  <Clock size={24} />
                </div>
                <p className="text-[10px] text-zinc-700 font-black uppercase tracking-widest italic">Aguardando fechamento de notas hoje.</p>
              </div>
            )}
          </div>
        </div>

        {/* Critical Parts List */}
        <div className="bg-[#0F0F0F] border border-[#1F1F1F] p-8 rounded-[3rem] shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-black uppercase text-[10px] tracking-[0.2em] text-zinc-500 flex items-center gap-2">
              <AlertCircle size={14} className="text-amber-500" /> Reposição Urgente
            </h3>
            <button 
              onClick={() => navigate('/inventory')}
              className="text-[9px] font-black text-zinc-600 uppercase hover:text-white transition-colors flex items-center gap-2"
            >
              Ver Estoque <ChevronRight size={12} />
            </button>
          </div>

          <div className="space-y-3">
            {parts.filter(p => p.stock <= p.minStock).slice(0, 5).map((p, i) => (
              <div key={i} className="flex items-center justify-between p-5 bg-[#050505] rounded-3xl border border-[#1F1F1F] hover:border-amber-500/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center text-amber-500">
                    <Package size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-white uppercase italic">{p.name}</p>
                    <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">{p.sku}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-amber-500">{p.stock} UN</p>
                  <p className="text-[8px] font-black text-zinc-800 uppercase">Mín: {p.minStock}</p>
                </div>
              </div>
            ))}
            {parts.filter(p => p.stock <= p.minStock).length === 0 && (
              <div className="py-20 text-center">
                <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-500/20">
                  <CheckCircle2 size={24} className="text-emerald-500" />
                </div>
                <p className="text-[10px] text-zinc-700 font-black uppercase tracking-widest italic">Estoque totalmente abastecido.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
