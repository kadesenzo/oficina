
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
  Cloud
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

  const today = new Date().toLocaleDateString('pt-BR');
  
  const dailyFinishedOrders = orders.filter(o => 
    new Date(o.updatedAt).toLocaleDateString('pt-BR') === today && 
    o.status === OSStatus.FINALIZADO
  );

  const dailyRevenue = dailyFinishedOrders.reduce((acc, curr) => acc + curr.totalValue, 0);
  const carsAttendedToday = dailyFinishedOrders.length;
  const criticalStock = parts.filter(p => p.stock <= p.minStock).length;
  const inProgressCount = orders.filter(o => o.status === OSStatus.EM_ANDAMENTO).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">Resumo Estratégico</h1>
            <Cloud size={16} className="text-[#A32121]" />
          </div>
          <p className="text-zinc-500 font-medium text-xs">Dados sincronizados em tempo real para <span className="text-white font-bold">{session?.username}</span></p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => navigate('/orders/new')}
            className="bg-[#A32121] px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center space-x-2 hover:bg-[#8B1A1A] transition-all shadow-xl shadow-red-900/20"
          >
            <PlusCircle size={18} />
            <span>Nova Nota</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2rem] group hover:border-emerald-500/50 transition-all shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl">
              <DollarSign size={22} />
            </div>
          </div>
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Receita de Hoje</p>
          <p className="text-3xl font-black text-white leading-none">R$ {dailyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2rem] group hover:border-blue-500/50 transition-all shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl">
              <Car size={22} />
            </div>
          </div>
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Entradas Hoje</p>
          <p className="text-3xl font-black text-white leading-none">{carsAttendedToday}</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2rem] group hover:border-amber-500/50 transition-all shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl">
              <Package size={22} />
            </div>
          </div>
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Alerta Estoque</p>
          <p className="text-3xl font-black text-white leading-none">{criticalStock}</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2rem] group hover:border-[#A32121]/50 transition-all shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-[#A32121]/10 text-[#A32121] rounded-2xl">
              <Clock size={22} />
            </div>
          </div>
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Em Execução</p>
          <p className="text-3xl font-black text-white leading-none">{inProgressCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] shadow-xl">
          <h3 className="font-black uppercase text-xs tracking-widest text-zinc-500 mb-8">Status do Estoque</h3>
          <div className="space-y-4">
            {parts.slice(0, 5).map((p, i) => (
              <div key={i} className="flex items-center justify-between p-5 bg-zinc-950 rounded-2xl border border-zinc-800">
                <div>
                  <p className="text-sm font-black text-white uppercase">{p.name}</p>
                  <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">{p.sku}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-black ${p.stock <= p.minStock ? 'text-amber-500' : 'text-zinc-400'}`}>
                    {p.stock} UN
                  </p>
                </div>
              </div>
            ))}
            {parts.length === 0 && <p className="text-xs text-zinc-700 text-center italic uppercase font-black tracking-widest">Estoque vazio no servidor.</p>}
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] shadow-xl">
          <h3 className="font-black uppercase text-xs tracking-widest text-zinc-500 mb-8">Últimas Notas Geradas</h3>
          <div className="space-y-4">
            {orders.slice(-5).reverse().map((o, i) => (
              <div key={i} className="flex items-center justify-between p-5 bg-zinc-950 rounded-2xl border border-zinc-800">
                <div>
                  <p className="text-sm font-black text-white uppercase">{o.clientName}</p>
                  <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">{o.vehiclePlate}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-emerald-500">R$ {o.totalValue.toLocaleString('pt-BR')}</p>
                  <span className="text-[8px] font-black uppercase tracking-widest text-zinc-700">{o.status}</span>
                </div>
              </div>
            ))}
            {orders.length === 0 && <p className="text-xs text-zinc-700 text-center italic uppercase font-black tracking-widest">Sem atividades registradas.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
