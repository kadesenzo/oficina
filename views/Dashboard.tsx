
import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Car, 
  Package, 
  TrendingUp, 
  PlusCircle, 
  Sparkles,
  ChevronRight,
  FileText,
  Loader2,
  Calendar
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ServiceOrder, Part, OSStatus, UserSession } from '../types.ts';
import { GoogleGenAI } from "@google/genai";

const Dashboard: React.FC<{ session?: UserSession }> = ({ session }) => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [aiInsight, setAiInsight] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    if (session) {
      const savedOrders = JSON.parse(localStorage.getItem(`kaenpro_${session.username}_orders`) || '[]');
      const savedParts = JSON.parse(localStorage.getItem(`kaenpro_${session.username}_parts`) || '[]');
      setOrders(savedOrders);
      setParts(savedParts);
      fetchAiInsights(savedOrders, savedParts);
    }
  }, [session]);

  const fetchAiInsights = async (currentOrders: ServiceOrder[], currentParts: Part[]) => {
    if (!process.env.API_KEY) {
      setAiInsight('Dica: Monitore seu estoque de peças de alta rotatividade para não perder vendas hoje.');
      return;
    }
    
    setIsAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Analise os dados desta oficina mecânica: ${currentOrders.length} ordens de serviço e ${currentParts.length} itens no estoque. Forneça um insight estratégico de 2 frases para o dono da oficina aumentar o lucro hoje.`;
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      setAiInsight(response.text || 'Otimize seu fluxo de caixa finalizando as OS pendentes.');
    } catch (err) {
      setAiInsight('Planejamento estratégico: Avalie o estoque de peças de giro rápido para não perder vendas hoje.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const dailyFinished = orders.filter(o => new Date(o.updatedAt).toDateString() === new Date().toDateString() && o.status === OSStatus.FINALIZADO);
  const dailyRevenue = dailyFinished.reduce((acc, curr) => acc + curr.totalValue, 0);
  const criticalStock = parts.filter(p => p.stock <= p.minStock).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">Performance <span className="text-[#E11D48]">Center</span></h1>
          <p className="text-zinc-500 font-bold text-[10px] uppercase tracking-[0.2em] flex items-center gap-2">
            <Calendar size={12} className="text-[#E11D48]" /> Dashboard Ativo • {session?.username}
          </p>
        </div>
        <button 
          onClick={() => navigate('/orders/new')} 
          className="bg-[#E11D48] text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center gap-3 shadow-xl glow-red hover:scale-105 transition-all"
        >
          <PlusCircle size={18} /> Nova Ordem de Serviço
        </button>
      </div>

      <div className="bg-[#0F0F0F] border border-[#1F1F1F] p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 text-zinc-900 opacity-20 group-hover:scale-110 transition-transform"><Sparkles size={80}/></div>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-[#E11D48]/20 text-[#E11D48] rounded-xl"><Sparkles size={18}/></div>
          <h3 className="text-[10px] font-black text-[#E11D48] uppercase tracking-[0.3em] italic">Kaenpro Smart Insight</h3>
        </div>
        {isAiLoading ? (
          <div className="flex items-center gap-4 text-zinc-600 italic"><Loader2 className="animate-spin" size={18}/> <span className="text-sm font-medium">IA processando...</span></div>
        ) : (
          <p className="text-xl font-black text-white italic leading-tight max-w-2xl">{aiInsight || 'Analisando dados da oficina...'}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#0F0F0F] border border-[#1F1F1F] p-8 rounded-[2.5rem] shadow-xl group">
          <p className="text-zinc-600 text-[9px] font-black uppercase mb-1 tracking-widest">Receita Hoje</p>
          <p className="text-3xl font-black text-white italic">R$ {dailyRevenue.toLocaleString('pt-BR')}</p>
          <div className="mt-4 h-1 bg-zinc-900 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 w-[60%]"></div></div>
        </div>
        
        <div className="bg-[#0F0F0F] border border-[#1F1F1F] p-8 rounded-[2.5rem] shadow-xl">
          <p className="text-zinc-600 text-[9px] font-black uppercase mb-1 tracking-widest">Entregues</p>
          <p className="text-3xl font-black text-white italic">{dailyFinished.length}</p>
        </div>

        <div className="bg-[#0F0F0F] border border-[#1F1F1F] p-8 rounded-[2.5rem] shadow-xl">
          <p className="text-zinc-600 text-[9px] font-black uppercase mb-1 tracking-widest">Pátio</p>
          <p className="text-3xl font-black text-white italic">{orders.filter(o => o.status === OSStatus.EM_ANDAMENTO).length}</p>
        </div>

        <div className="bg-[#0F0F0F] border border-[#1F1F1F] p-8 rounded-[2.5rem] shadow-xl">
          <p className="text-zinc-600 text-[9px] font-black uppercase mb-1 tracking-widest">Estoque Crítico</p>
          <p className={`text-3xl font-black italic ${criticalStock > 0 ? 'text-[#E11D48]' : 'text-white'}`}>{criticalStock}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
