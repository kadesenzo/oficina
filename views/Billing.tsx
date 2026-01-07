
import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  MessageCircle, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ChevronRight, 
  Search,
  Users,
  Calendar,
  X,
  History
} from 'lucide-react';
import { ServiceOrder, PaymentStatus, Client } from '../types';

const Billing: React.FC = () => {
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);
  const [billingLevel, setBillingLevel] = useState<'mild' | 'formal' | 'final'>('mild');

  useEffect(() => {
    const savedOrders = JSON.parse(localStorage.getItem('kaenpro_orders') || '[]');
    const savedClients = JSON.parse(localStorage.getItem('kaenpro_clients') || '[]');
    
    // Check for late payments automatically on load
    const today = new Date();
    const checkedOrders = savedOrders.map((os: ServiceOrder) => {
      if (os.paymentStatus !== PaymentStatus.PAGO) {
        const osDate = new Date(os.createdAt);
        const diffTime = Math.abs(today.getTime() - osDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        // Mark as overdue if pending for more than 7 days (business logic)
        if (diffDays > 7 && os.paymentStatus === PaymentStatus.PENDENTE) {
          return { ...os, paymentStatus: PaymentStatus.ATRASADO };
        }
      }
      return os;
    });

    setOrders(checkedOrders);
    setClients(savedClients);
  }, []);

  const handleMarkAsPaid = (id: string) => {
    if (confirm("Confirmar recebimento deste pagamento?")) {
      const updated = orders.map(o => o.id === id ? { ...o, paymentStatus: PaymentStatus.PAGO, updatedAt: new Date().toISOString() } : o);
      setOrders(updated);
      localStorage.setItem('kaenpro_orders', JSON.stringify(updated));
      setSelectedOrder(null);
    }
  };

  const getDaysInArrears = (createdAt: string) => {
    const today = new Date();
    const osDate = new Date(createdAt);
    const diffTime = Math.abs(today.getTime() - osDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const overdueOrders = orders.filter(o => o.paymentStatus !== PaymentStatus.PAGO);
  
  const filtered = overdueOrders.filter(o => 
    o.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    o.osNumber.includes(searchTerm)
  );

  const totalInArrears = overdueOrders.reduce((acc, curr) => acc + curr.totalValue, 0);
  const debtorCount = new Set(overdueOrders.map(o => o.clientId)).size;

  const getBillingMessage = (os: ServiceOrder) => {
    const clientPhone = clients.find(c => c.id === os.clientId)?.phone || '';
    const dateStr = new Date(os.createdAt).toLocaleDateString('pt-BR');
    
    const baseMessages = {
      mild: `Olá, ${os.clientName}. Tudo bem?\n\nEstamos entrando em contato referente à Ordem de Serviço nº ${os.osNumber}, realizada em ${dateStr}, no valor de R$ ${os.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}.\n\nAté o momento, o pagamento ainda não foi identificado. Pedimos, por gentileza, que regularize o pagamento.\n\nAtenciosamente,\nKaenpro Motors`,
      formal: `AVISO DE COBRANÇA: ${os.clientName}.\n\nReferente à nota de serviço #${os.osNumber} (${dateStr}). O valor de R$ ${os.totalValue.toLocaleString('pt-BR')} consta como pendente em nosso sistema.\n\nSolicitamos o envio do comprovante ou a quitação do débito para evitar encargos contratuais.\n\nKaenpro Motors - Financeiro`,
      final: `URGENTE: ÚLTIMO AVISO DE DÉBITO.\n\nSr(a). ${os.clientName}, sua pendência referente ao serviço #${os.osNumber} está em atraso crítico. O não pagamento nas próximas 24h poderá resultar em restrições de crédito.\n\nRegularize agora.\nKaenpro Motors`
    };

    return baseMessages[billingLevel];
  };

  const sendWhatsApp = (os: ServiceOrder) => {
    const client = clients.find(c => c.id === os.clientId);
    if (!client) return;

    const message = getBillingMessage(os);
    const phone = client.phone.replace(/\D/g, '');
    
    // Register history
    const historyEntry = {
      date: new Date().toISOString(),
      user: 'Administrador (Rafael)',
      level: billingLevel
    };
    
    const updatedOrders = orders.map(o => o.id === os.id ? { 
      ...o, 
      billingHistory: [...(o.billingHistory || []), historyEntry] 
    } : o);
    
    setOrders(updatedOrders);
    localStorage.setItem('kaenpro_orders', JSON.stringify(updatedOrders));
    
    window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">Área de Cobrança</h1>
          <p className="text-zinc-500">Gestão de inadimplência e notificações financeiras.</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 flex items-center gap-2">
          <Calendar size={14} />
          <span>Controle Financeiro Interno</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-500/10 text-red-500 rounded-2xl">
              <DollarSign size={22} />
            </div>
            <div className="text-[10px] font-black uppercase text-red-500">A Receber</div>
          </div>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">Total em Aberto</p>
          <p className="text-2xl font-black text-white">R$ {totalInArrears.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-zinc-800 text-zinc-400 rounded-2xl">
              <Users size={22} />
            </div>
          </div>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">Clientes Devedores</p>
          <p className="text-2xl font-black text-white">{debtorCount}</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl">
              <Clock size={22} />
            </div>
          </div>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">Média de Atraso</p>
          <p className="text-2xl font-black text-white">
            {overdueOrders.length > 0 
              ? Math.ceil(overdueOrders.reduce((acc, curr) => acc + getDaysInArrears(curr.createdAt), 0) / overdueOrders.length)
              : 0} 
            <span className="text-sm font-normal text-zinc-600 ml-1">dias</span>
          </p>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 p-2 rounded-2xl flex items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3.5 text-zinc-500" size={20} />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filtrar por nome do cliente ou nota..." 
            className="w-full bg-transparent border-none py-3.5 pl-12 pr-4 focus:ring-0 text-white placeholder-zinc-500"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-zinc-900/30 border-2 border-dashed border-zinc-800 rounded-3xl p-16 text-center">
          <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-500">
            <CheckCircle2 size={32} />
          </div>
          <p className="text-zinc-500 font-bold">Nenhum débito pendente.</p>
          <p className="text-zinc-600 text-sm mt-1">Todos os pagamentos estão em dia ou não há serviços registrados.</p>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-zinc-950/50 text-zinc-500 text-[10px] uppercase tracking-widest font-black">
                  <th className="px-8 py-4">Cliente</th>
                  <th className="px-8 py-4">OS / Nota</th>
                  <th className="px-8 py-4">Valor</th>
                  <th className="px-8 py-4">Atraso</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {filtered.map(os => {
                  const daysLate = getDaysInArrears(os.createdAt);
                  return (
                    <tr key={os.id} className="hover:bg-zinc-800/30 transition-colors group">
                      <td className="px-8 py-5">
                        <p className="text-sm font-bold text-white">{os.clientName}</p>
                        <p className="text-[10px] text-zinc-500">{clients.find(c => c.id === os.clientId)?.phone}</p>
                      </td>
                      <td className="px-8 py-5">
                        <p className="text-xs font-mono text-zinc-300">#{os.osNumber}</p>
                        <p className="text-[10px] text-zinc-600">{new Date(os.createdAt).toLocaleDateString('pt-BR')}</p>
                      </td>
                      <td className="px-8 py-5">
                        <p className="text-sm font-black text-zinc-100">R$ {os.totalValue.toLocaleString('pt-BR')}</p>
                      </td>
                      <td className="px-8 py-5">
                        <p className={`text-xs font-bold ${daysLate > 30 ? 'text-red-500' : 'text-amber-500'}`}>
                          {daysLate} dias
                        </p>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border
                          ${os.paymentStatus === PaymentStatus.ATRASADO ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}
                        `}>
                          {os.paymentStatus}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center justify-end space-x-2">
                          <button 
                            onClick={() => setSelectedOrder(os)}
                            className="p-2 text-zinc-400 hover:text-[#25D366] bg-zinc-950 rounded-xl border border-zinc-800 transition-all"
                            title="Cobrar WhatsApp"
                          >
                            <MessageCircle size={18} />
                          </button>
                          <button 
                            onClick={() => handleMarkAsPaid(os.id)}
                            className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 rounded-xl hover:bg-emerald-500 hover:text-white transition-all"
                          >
                            Baixar Nota
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Billing Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-lg p-8 rounded-[2.5rem] shadow-2xl relative">
            <button onClick={() => setSelectedOrder(null)} className="absolute top-6 right-6 text-zinc-500 hover:text-white">
              <X size={24} />
            </button>
            
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-[#25D366]/10 text-[#25D366] rounded-2xl flex items-center justify-center">
                <MessageCircle size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold">Cobrar Cliente</h3>
                <p className="text-sm text-zinc-500">{selectedOrder.clientName} • OS #{selectedOrder.osNumber}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block mb-3">Nível da Notificação</label>
                <div className="grid grid-cols-3 gap-2">
                  <button 
                    onClick={() => setBillingLevel('mild')}
                    className={`py-3 px-2 rounded-xl text-[10px] font-black uppercase transition-all border ${billingLevel === 'mild' ? 'bg-zinc-100 text-zinc-900 border-white' : 'bg-zinc-950 text-zinc-500 border-zinc-800'}`}
                  >
                    Lembrete Leve
                  </button>
                  <button 
                    onClick={() => setBillingLevel('formal')}
                    className={`py-3 px-2 rounded-xl text-[10px] font-black uppercase transition-all border ${billingLevel === 'formal' ? 'bg-[#A32121] text-white border-[#A32121]' : 'bg-zinc-950 text-zinc-500 border-zinc-800'}`}
                  >
                    Cobrança Formal
                  </button>
                  <button 
                    onClick={() => setBillingLevel('final')}
                    className={`py-3 px-2 rounded-xl text-[10px] font-black uppercase transition-all border ${billingLevel === 'final' ? 'bg-red-600 text-white border-red-600 animate-pulse' : 'bg-zinc-950 text-zinc-500 border-zinc-800'}`}
                  >
                    Último Aviso
                  </button>
                </div>
              </div>

              <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-2xl">
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2">Prévia da Mensagem</p>
                <div className="text-sm text-zinc-400 whitespace-pre-line leading-relaxed italic">
                  "{getBillingMessage(selectedOrder)}"
                </div>
              </div>

              {selectedOrder.billingHistory && selectedOrder.billingHistory.length > 0 && (
                <div className="space-y-2">
                   <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2 flex items-center gap-2"><History size={12}/> Histórico de Envios</p>
                   {selectedOrder.billingHistory.map((h, i) => (
                     <div key={i} className="text-[9px] text-zinc-500 flex justify-between bg-zinc-800/20 p-2 rounded-lg">
                       <span>{new Date(h.date).toLocaleDateString('pt-BR')} às {new Date(h.date).toLocaleTimeString('pt-BR')}</span>
                       <span className="font-bold uppercase tracking-tighter text-[#25D366]">{h.level === 'mild' ? 'Leve' : h.level === 'formal' ? 'Formal' : 'Crítica'}</span>
                     </div>
                   ))}
                </div>
              )}

              <button 
                onClick={() => sendWhatsApp(selectedOrder)}
                className="w-full bg-[#25D366] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-[#1fb355] transition-all"
              >
                <MessageCircle size={20} />
                Enviar para o WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;
