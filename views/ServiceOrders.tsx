
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
  Wrench
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ServiceOrder, OSStatus } from '../types';

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
          <p className="text-zinc-500">Arquivo digital de todas as ordens de serviço executadas.</p>
        </div>
        <button 
          onClick={() => navigate('/orders/new')}
          className="bg-[#A32121] px-6 py-3 rounded-xl font-bold flex items-center justify-center space-x-2 hover:bg-[#8B1A1A] transition-all shadow-lg shadow-red-900/20"
        >
          <Plus size={20} />
          <span>Criar Nova Nota</span>
        </button>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 p-2 rounded-2xl flex items-center no-print">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3.5 text-zinc-500" size={20} />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por cliente, placa ou número da nota..." 
            className="w-full bg-transparent border-none py-3.5 pl-12 pr-4 focus:ring-0 text-white placeholder-zinc-500"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-zinc-900/30 border-2 border-dashed border-zinc-800 rounded-3xl p-16 text-center no-print">
          <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-zinc-600">
            <ClipboardList size={32} />
          </div>
          <p className="text-zinc-500 font-bold">Histórico de notas está vazio.</p>
          <p className="text-zinc-600 text-sm mt-1">Nenhuma nota foi gerada até o momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 no-print">
          {filtered.map(os => (
            <div key={os.id} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 hover:border-[#A32121]/40 transition-all group shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className="bg-zinc-950 px-3 py-1 rounded-lg border border-zinc-800">
                  <span className="text-[10px] font-black text-[#A32121] uppercase tracking-widest">Nota #{os.osNumber}</span>
                </div>
                <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  {os.status}
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
                  <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1">Data Emissão</p>
                  <p className="text-xs font-bold text-zinc-400">{new Date(os.createdAt).toLocaleDateString('pt-BR')}</p>
                </div>
                <div className="p-3 bg-zinc-950 rounded-2xl border border-zinc-800">
                  <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1">Valor Total</p>
                  <p className="text-xs font-black text-emerald-500">R$ {os.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                <button 
                  onClick={() => handleDelete(os.id)}
                  className="p-2 text-zinc-800 hover:text-red-500 transition-colors"
                  title="Excluir Permanentemente"
                >
                  <Trash2 size={18} />
                </button>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setSelectedOS(os)}
                    className="px-4 py-2 bg-[#A32121] text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-[#8B1A1A] transition-all flex items-center gap-2"
                  >
                    <Eye size={14} />
                    Ver Nota
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Professional Note Viewer Modal */}
      {selectedOS && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 p-4 overflow-y-auto no-scrollbar no-print">
          <div className="bg-white w-full max-w-2xl min-h-[90vh] my-auto rounded-3xl p-10 text-zinc-900 shadow-2xl relative">
            <button onClick={() => setSelectedOS(null)} className="absolute top-6 right-6 p-2 text-zinc-300 hover:text-zinc-900 transition-colors">
              <X size={28} />
            </button>
            
            <div id="print-area-viewer" className="bg-white p-2">
              <div className="flex justify-between items-center mb-10 border-b-2 border-zinc-100 pb-8">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                    <Wrench size={32} />
                  </div>
                  <div>
                    <h1 className="text-3xl font-black tracking-tighter text-zinc-900">KAENPRO <span className="text-red-600">MOTORS</span></h1>
                    <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest mt-0.5">Mecânica de Precisão e Performance</p>
                    <p className="text-[9px] text-zinc-400 font-bold">Contato: (11) 99999-9999 • São Paulo - SP</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="bg-zinc-100 px-4 py-2 rounded-xl mb-1">
                    <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Nota Fiscal de Serviço</p>
                    <p className="text-xl font-black text-zinc-900">Nº {selectedOS.osNumber}</p>
                  </div>
                  <p className="text-xs font-bold text-zinc-500 uppercase">{new Date(selectedOS.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-10 mb-10">
                <div className="space-y-1 bg-zinc-50 p-5 rounded-2xl border border-zinc-100">
                  <h5 className="text-[9px] font-black uppercase text-zinc-400 tracking-widest mb-2">Dados do Cliente</h5>
                  <p className="font-black text-sm text-zinc-900">{selectedOS.clientName}</p>
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-tighter">Histórico Permanente</p>
                </div>
                <div className="space-y-1 bg-zinc-50 p-5 rounded-2xl border border-zinc-100">
                  <h5 className="text-[9px] font-black uppercase text-zinc-400 tracking-widest mb-2">Dados do Veículo</h5>
                  <p className="font-black text-sm text-red-600 uppercase tracking-tight">{selectedOS.vehiclePlate}</p>
                  <p className="text-xs font-black text-zinc-900 uppercase">{selectedOS.vehicleModel}</p>
                </div>
              </div>

              <div className="mb-10 min-h-[200px]">
                <h5 className="text-[9px] font-black uppercase text-zinc-400 tracking-widest mb-4 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
                  Detalhamento dos Serviços e Peças
                </h5>
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b-2 border-zinc-100 text-zinc-400 uppercase font-black tracking-widest text-[8px]">
                      <th className="py-3 px-2">Descrição Detalhada</th>
                      <th className="py-3 px-2 text-center w-20">Quantidade</th>
                      <th className="py-3 px-2 text-right w-24">V. Unitário</th>
                      <th className="py-3 px-2 text-right w-24">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50">
                    {selectedOS.items.map((item, i) => (
                      <tr key={i} className="text-zinc-700">
                        <td className="py-4 px-2 font-bold">{item.description}</td>
                        <td className="py-4 px-2 text-center font-black text-zinc-400">{item.quantity}</td>
                        <td className="py-4 px-2 text-right">R$ {item.unitPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        <td className="py-4 px-2 text-right font-black">R$ {(item.quantity * item.unitPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                    {selectedOS.laborValue > 0 && (
                      <tr className="bg-zinc-50/50">
                        <td className="py-4 px-2 font-black text-zinc-900">Mão de Obra / Serviço Técnico</td>
                        <td className="py-4 px-2 text-center font-black text-zinc-400">01</td>
                        <td className="py-4 px-2 text-right">R$ {selectedOS.laborValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        <td className="py-4 px-2 text-right font-black">R$ {selectedOS.laborValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-end pt-8 border-t-2 border-zinc-100">
                <div className="flex flex-col gap-4">
                  <div className="bg-zinc-900 text-white px-4 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest inline-block">
                    CONDIÇÕES DE GARANTIA: 90 DIAS
                  </div>
                  <div className="text-[9px] text-zinc-400 font-bold max-w-xs leading-relaxed italic">
                    * Reimpressão de nota histórica.
                  </div>
                </div>
                <div className="flex flex-col items-end gap-3">
                  {selectedOS.discount > 0 && (
                    <div className="flex justify-between w-48 text-xs border-b border-zinc-50 pb-2">
                      <span className="text-zinc-400 font-bold uppercase text-[9px]">Desconto</span>
                      <span className="font-black text-red-500">- R$ {selectedOS.discount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  <div className="flex justify-between w-64 items-center bg-zinc-900 p-4 rounded-2xl text-white">
                    <span className="text-zinc-400 font-black uppercase tracking-[0.2em] text-[9px]">Total da Nota</span>
                    <span className="text-3xl font-black">R$ {selectedOS.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              <div className="mt-20 flex justify-between items-center text-[9px] text-zinc-400 uppercase tracking-widest font-black px-4">
                <div className="flex flex-col items-center">
                  <div className="w-56 h-px bg-zinc-200 mb-2"></div>
                  Assinatura do Cliente
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-56 h-px bg-zinc-200 mb-2"></div>
                  Responsável Técnico
                </div>
              </div>
            </div>

            <div className="mt-12 flex gap-4 no-print">
              <button 
                onClick={() => window.print()} 
                className="flex-1 bg-zinc-900 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl"
              >
                <Printer size={20} />
                Reimprimir
              </button>
              <button 
                onClick={() => setSelectedOS(null)}
                className="flex-1 bg-zinc-100 text-zinc-900 py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-zinc-200 transition-all shadow-lg"
              >
                Fechar Visualização
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceOrders;
