
import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Car, 
  Package, 
  TrendingUp, 
  PlusCircle, 
  AlertCircle,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ServiceOrder, Part, OSStatus } from '../types';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [parts, setParts] = useState<Part[]>([]);

  useEffect(() => {
    const savedOrders = JSON.parse(localStorage.getItem('kaenpro_orders') || '[]');
    const savedParts = JSON.parse(localStorage.getItem('kaenpro_parts') || '[]');
    setOrders(savedOrders);
    setParts(savedParts);
  }, []);

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
          <h1 className="text-3xl font-black text-white">Resumo do Dia</h1>
          <p className="text-zinc-500">Relatório automático baseado em dados reais.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => navigate('/orders/new')}
            className="bg-[#A32121] px-6 py-2.5 rounded-xl font-bold flex items-center justify-center space-x-2 hover:bg-[#8B1A1A] transition-all shadow-lg shadow-red-900/20"
          >
            <PlusCircle size={18} />
            <span>Nova Nota</span>
          </button>
        </div>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl group hover:border-emerald-500/50 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl">
              <DollarSign size={22} />
            </div>
            <div className="text-[10px] font-black uppercase text-emerald-500">Hoje</div>
          </div>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">Faturamento Real</p>
          <p className="text-2xl font-black text-white">R$ {dailyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl group hover:border-blue-500/50 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl">
              <Car size={22} />
            </div>
          </div>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">Carros Atendidos</p>
          <p className="text-2xl font-black text-white">{carsAttendedToday}</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl group hover:border-amber-500/50 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl">
              <Package size={22} />
            </div>
            {criticalStock > 0 && (
              <div className="text-[10px] font-black uppercase text-amber-500 animate-pulse">Alerta</div>
            )}
          </div>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">Alertas de Estoque</p>
          <p className="text-2xl font-black text-white">{criticalStock} <span className="text-sm font-normal text-zinc-600">itens baixos</span></p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl group hover:border-[#A32121]/50 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-[#A32121]/10 text-[#A32121] rounded-2xl">
              <Clock size={22} />
            </div>
          </div>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">Serviços em Aberto</p>
          <p className="text-2xl font-black text-white">{inProgressCount}</p>
        </div>
      </div>

      {/* Empty State or Activity */}
      {orders.length === 0 ? (
        <div className="bg-zinc-900/50 border-2 border-dashed border-zinc-800 rounded-[2.5rem] p-12 text-center">
          <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-zinc-600">
            <Car size={32} />
          </div>
          <h2 className="text-xl font-bold text-zinc-400">Nenhuma atividade registrada</h2>
          <p className="text-zinc-600 mt-2 max-w-sm mx-auto">Cadastre clientes, veículos e crie sua primeira Nota de Serviço para começar.</p>
          <button 
            onClick={() => navigate('/orders/new')}
            className="mt-6 text-[#A32121] font-bold hover:underline flex items-center justify-center gap-2 mx-auto"
          >
            Começar agora <ArrowUpRight size={18} />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl">
            <h3 className="font-bold text-lg mb-6">Controle de Estoque (Principais)</h3>
            <div className="space-y-4">
              {parts.slice(0, 5).map((p, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-zinc-950 rounded-2xl border border-zinc-800">
                  <div>
                    <p className="text-sm font-bold text-white">{p.name}</p>
                    <p className="text-[10px] text-zinc-600">{p.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-black ${p.stock <= p.minStock ? 'text-amber-500' : 'text-zinc-400'}`}>
                      {p.stock} un.
                    </p>
                    <p className="text-[9px] text-zinc-600 uppercase font-bold">Mínimo: {p.minStock}</p>
                  </div>
                </div>
              ))}
              {parts.length === 0 && <p className="text-sm text-zinc-600 text-center italic">Nenhum produto cadastrado no estoque.</p>}
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl">
            <h3 className="font-bold text-lg mb-6">Últimas Notas Geradas</h3>
            <div className="space-y-4">
              {orders.slice(-5).reverse().map((o, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-zinc-950 rounded-2xl border border-zinc-800">
                  <div>
                    <p className="text-sm font-bold text-white">{o.clientName}</p>
                    <p className="text-[10px] text-zinc-600">{o.vehiclePlate} • {o.vehicleModel}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-emerald-500">R$ {o.totalValue.toLocaleString('pt-BR')}</p>
                    <span className={`text-[9px] font-black uppercase tracking-widest ${o.status === OSStatus.FINALIZADO ? 'text-emerald-500' : 'text-amber-500'}`}>
                      {o.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
