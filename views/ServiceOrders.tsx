
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  Printer, 
  Share2,
  Trash2,
  ChevronRight,
  ClipboardList,
  Eye,
  X,
  Wrench,
  Package,
  Download,
  ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ServiceOrder, OSStatus, PaymentStatus } from '../types';

const ServiceOrders: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOS, setSelectedOS] = useState<ServiceOrder | null>(null);

  useEffect(() => {
    setOrders(JSON.parse(localStorage.getItem('kaenpro_orders') || '[]'));
  }, []);

  const handleDelete = (id: string) => {
    if (confirm("Deseja realmente excluir esta nota permanentemente?")) {
      const updated = orders.filter(o => o.id !== id);
      setOrders(updated);
      localStorage.setItem('kaenpro_orders', JSON.stringify(updated));
    }
  };

  const shareWhatsApp = (os: ServiceOrder) => {
    let message = `*KAENPRO MOTORS - NOTA #${os.osNumber}*\n`;
    message += `-----------------------------\n`;
    message += `*Cliente:* ${os.clientName}\n`;
    message += `*Veículo:* ${os.vehicleModel} (${os.vehiclePlate})\n`;
    message += `*TOTAL: R$ ${os.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}*\n`;
    message += `-----------------------------\n`;
    message += `Verifique sua nota completa em nosso sistema.`;
    
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const filtered = orders.filter(o => 
    o.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    o.vehiclePlate.includes(searchTerm) || 
    o.osNumber.includes(searchTerm)
  ).reverse();

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-3xl font-black text-white">Notas Geradas</h1>
          <p className="text-zinc-500">Histórico digital de ordens de serviço.</p>
        </div>
        <button 
          onClick={() => navigate('/orders/new')}
          className="bg-[#A32121] px-6 py-3 rounded-xl font-bold flex items-center justify-center space-x-2 hover:bg-[#8B1A1A] transition-all shadow-lg shadow-red-900/20"
        >
          <Plus size={20} />
          <span>Nova Nota</span>
        </button>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 p-2 rounded-2xl flex items-center no-print">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3.5 text-zinc-500" size={20} />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar cliente, placa ou número..." 
            className="w-full bg-transparent border-none py-3.5 pl-12 pr-4 focus:ring-0 text-white placeholder-zinc-500"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-zinc-900/30 border-2 border-dashed border-zinc-800 rounded-3xl p-16 text-center no-print text-white">
          <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-zinc-600">
            <ClipboardList size={32} />
          </div>
          <p className="text-zinc-500 font-bold">Nenhuma nota encontrada.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 no-print">
          {filtered.map(os => (
            <div key={os.id} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 hover:border-[#A32121]/40 transition-all group shadow-sm text-white">
              <div className="flex items-start justify-between mb-4">
                <div className="bg-zinc-950 px-3 py-1 rounded-lg border border-zinc-800">
                  <span className="text-[10px] font-black text-[#A32121] uppercase tracking-widest">#{os.osNumber}</span>
                </div>
                <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${os.paymentStatus === PaymentStatus.PAGO ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                  {os.paymentStatus}
                </span>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-black text-white mb-0.5 truncate">{os.clientName}</h3>
                <p className="text-xs font-black text-zinc-500 uppercase tracking-tighter">
                  {os.vehiclePlate} • <span className="text-zinc-600">{os.vehicleModel}</span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 my-6">
                <div className="p-3 bg-zinc-950 rounded-2xl border border-zinc-800">
                  <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1">Data</p>
                  <p className="text-xs font-bold text-zinc-400">{new Date(os.createdAt).toLocaleDateString('pt-BR')}</p>
                </div>
                <div className="p-3 bg-zinc-950 rounded-2xl border border-zinc-800">
                  <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1">Total</p>
                  <p className="text-xs font-black text-white">R$ {os.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                <button 
                  onClick={() => handleDelete(os.id)}
                  className="p-2 text-zinc-800 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setSelectedOS(os)}
                    className="px-4 py-2 bg-[#A32121] text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-[#8B1A1A] transition-all flex items-center gap-2"
                  >
                    <Eye size={14} /> Ver Nota
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL DE VISUALIZAÇÃO DE NOTA DIGITAL */}
      {selectedOS && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 p-4 overflow-y-auto no-scrollbar no-print">
          <div className="bg-white w-full max-w-2xl min-h-[90vh] my-auto rounded-[2rem] p-0 text-zinc-900 shadow-2xl relative overflow-hidden">
            
            {/* Action Bar (No Print) */}
            <div className="no-print bg-zinc-100 p-4 flex justify-between items-center border-b border-zinc-200">
                <div className="flex gap-2">
                    <button onClick={() => window.print()} className="bg-zinc-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-black transition-all">
                        <Printer size={16} /> Imprimir / PDF
                    </button>
                    <button onClick={() => shareWhatsApp(selectedOS)} className="bg-emerald-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-emerald-600 transition-all">
                        <Share2 size={16} /> WhatsApp
                    </button>
                </div>
                <button onClick={() => setSelectedOS(null)} className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors">
                    <X size={24} />
                </button>
            </div>

            <div id="print-area-viewer" className="p-10">
              {/* Header */}
              <div className="flex justify-between items-start mb-10 pb-8 border-b-2 border-zinc-100">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-[#A32121] rounded-2xl flex items-center justify-center text-white shadow-xl">
                    <Wrench size={32} />
                  </div>
                  <div>
                    <h1 className="text-3xl font-black tracking-tighter text-zinc-900">KAENPRO <span className="text-[#A32121]">MOTORS</span></h1>
                    <p className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.3em] mt-0.5">Mecânica de Precisão</p>
                    <div className="mt-2 text-[9px] text-zinc-500 font-bold space-y-0.5 uppercase">
                        <p>Rua dos Motores, 1234 - São Paulo</p>
                        <p>Contato: (11) 99999-9999</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="bg-zinc-100 px-6 py-3 rounded-2xl mb-2">
                    <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Nº DA NOTA</p>
                    <p className="text-2xl font-black text-zinc-900">{selectedOS.osNumber}</p>
                  </div>
                  <p className="text-xs font-black text-zinc-500 uppercase tracking-widest">
                    {new Date(selectedOS.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>

              {/* Info Cards */}
              <div className="grid grid-cols-2 gap-8 mb-10">
                <div className="bg-zinc-50 p-6 rounded-3xl border border-zinc-100">
                  <h5 className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-3 border-b border-zinc-200 pb-2">Proprietário</h5>
                  <p className="font-black text-lg text-zinc-900">{selectedOS.clientName}</p>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-tighter mt-1">Histórico Permanente</p>
                </div>
                <div className="bg-zinc-50 p-6 rounded-3xl border border-zinc-100">
                  <h5 className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-3 border-b border-zinc-200 pb-2">Veículo</h5>
                  <p className="font-black text-lg text-[#A32121] uppercase tracking-tighter">{selectedOS.vehiclePlate}</p>
                  <p className="text-sm font-black text-zinc-900 uppercase">{selectedOS.vehicleModel}</p>
                </div>
              </div>

              {/* Problem */}
              <div className="mb-10 p-6 bg-zinc-50/50 rounded-3xl border border-zinc-100 border-dashed">
                <h5 className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-2">Detalhamento dos Serviços</h5>
                <p className="text-sm text-zinc-700 leading-relaxed font-medium">
                  {selectedOS.problem || "Serviços técnicos realizados conforme ordem de entrada."}
                </p>
              </div>

              {/* Table */}
              <div className="mb-10">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b-2 border-zinc-100 text-zinc-400 uppercase font-black tracking-widest text-[10px]">
                      <th className="py-4 px-2">Descrição Técnica</th>
                      <th className="py-4 px-2 text-center">Qtd</th>
                      <th className="py-4 px-2 text-right">V. Unitário</th>
                      <th className="py-4 px-2 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50">
                    {selectedOS.items.map((item, i) => (
                      <tr key={i} className="text-zinc-700">
                        <td className="py-5 px-2 font-bold flex items-center gap-2">
                            {item.type === 'PART' ? <Package size={14} className="text-zinc-300" /> : <Wrench size={14} className="text-zinc-300" />}
                            {item.description}
                        </td>
                        <td className="py-5 px-2 text-center font-black text-zinc-400">{item.quantity}</td>
                        <td className="py-5 px-2 text-right text-zinc-500">R$ {item.unitPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        <td className="py-5 px-2 text-right font-black text-zinc-900">R$ {(item.quantity * item.unitPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                    {selectedOS.laborValue > 0 && (
                      <tr className="bg-zinc-50/50">
                        <td className="py-5 px-2 font-black text-zinc-900">Mão de Obra Especializada</td>
                        <td className="py-5 px-2 text-center font-black text-zinc-400">01</td>
                        <td className="py-5 px-2 text-right text-zinc-500">R$ {selectedOS.laborValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        <td className="py-5 px-2 text-right font-black text-zinc-900">R$ {selectedOS.laborValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="flex justify-between items-end pt-10 border-t-2 border-zinc-100">
                <div className="flex flex-col gap-6">
                  <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest inline-block border ${selectedOS.paymentStatus === PaymentStatus.PAGO ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                    STATUS: {selectedOS.paymentStatus.toUpperCase()}
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-56 h-px bg-zinc-200 mb-2"></div>
                    <p className="text-[9px] text-zinc-400 font-black uppercase tracking-widest">Responsável Técnico</p>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-3 min-w-[280px]">
                  {selectedOS.discount > 0 && (
                    <div className="flex justify-between w-full text-xs border-b border-zinc-50 pb-2 px-2">
                      <span className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest">Desconto</span>
                      <span className="font-black text-[#A32121]">- R$ {selectedOS.discount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  <div className="w-full bg-zinc-900 p-6 rounded-[1.5rem] text-white shadow-2xl">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-zinc-500 font-black uppercase tracking-[0.2em] text-[10px]">Total Final</span>
                    </div>
                    <span className="text-4xl font-black block tracking-tighter">R$ {selectedOS.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceOrders;
