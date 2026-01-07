
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Eye, 
  X, 
  Printer,
  ClipboardList
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ServiceOrder } from '../types';

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
                <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${os.paymentStatus === 'Pago' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
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
                  <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1">Valor Total</p>
                  <p className="text-xs font-black text-emerald-500">R$ {os.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                <button 
                  onClick={() => handleDelete(os.id)}
                  className="p-2 text-zinc-800 hover:text-red-500 transition-colors"
                  title="Excluir"
                >
                  <Trash2 size={18} />
                </button>
                <button 
                  onClick={() => setSelectedOS(os)}
                  className="px-4 py-2 bg-[#A32121] text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-[#8B1A1A] transition-all flex items-center gap-2"
                >
                  <Eye size={14} />
                  Ver Nota
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Simplified Functional Note Viewer Modal */}
      {selectedOS && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 p-4 overflow-y-auto no-print">
          <div className="bg-white w-full max-w-2xl min-h-[90vh] my-auto rounded-xl p-10 text-black shadow-2xl relative">
            <button onClick={() => setSelectedOS(null)} className="absolute top-6 right-6 p-2 text-zinc-400 hover:text-black">
              <X size={24} />
            </button>
            
            <div id="simple-note-view-stored">
              {/* Header */}
              <div className="text-center border-b pb-6 mb-8">
                <h1 className="text-2xl font-black uppercase tracking-tight">Kaenpro Motors</h1>
                <p className="text-sm font-bold">Telefone: (11) 99999-9999</p>
                <p className="text-[10px] uppercase text-zinc-500">Mecânica de Precisão e Performance</p>
              </div>

              {/* Note Metadata */}
              <div className="flex justify-between items-start mb-8 text-sm">
                <div>
                  <p><strong>Nota / OS:</strong> #{selectedOS.osNumber}</p>
                  <p><strong>Data Emissão:</strong> {new Date(selectedOS.createdAt).toLocaleDateString('pt-BR')}</p>
                </div>
                <div className="text-right">
                   <p className="bg-black text-white px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest">{selectedOS.paymentStatus}</p>
                </div>
              </div>

              {/* Client & Vehicle */}
              <div className="grid grid-cols-2 gap-4 mb-8 text-sm border p-4 rounded-lg bg-zinc-50">
                <div>
                  <h3 className="font-black border-b mb-2 text-xs uppercase tracking-widest text-zinc-400">Dados do Cliente</h3>
                  <p><strong>Nome:</strong> {selectedOS.clientName}</p>
                </div>
                <div>
                  <h3 className="font-black border-b mb-2 text-xs uppercase tracking-widest text-zinc-400">Dados do Veículo</h3>
                  <p><strong>Modelo:</strong> {selectedOS.vehicleModel}</p>
                  <p><strong>Placa:</strong> {selectedOS.vehiclePlate}</p>
                  <p><strong>KM:</strong> {selectedOS.vehicleKm ? selectedOS.vehicleKm.toLocaleString('pt-BR') : 'N/A'} KM</p>
                </div>
              </div>

              {/* Items Table */}
              <div className="mb-8">
                <h3 className="font-black text-xs uppercase tracking-widest text-zinc-400 mb-4">Serviços e Peças</h3>
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b font-black uppercase text-[10px]">
                      <th className="py-2">Descrição</th>
                      <th className="py-2 text-center">Qtd</th>
                      <th className="py-2 text-right">Unitário</th>
                      <th className="py-2 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOS.items.map((item, i) => (
                      <tr key={i} className="border-b">
                        <td className="py-3">{item.description}</td>
                        <td className="py-3 text-center">{item.quantity}</td>
                        <td className="py-3 text-right">R$ {item.unitPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        <td className="py-3 text-right">R$ {(item.quantity * item.unitPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary */}
              <div className="flex justify-end pt-4 border-t-2">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Mão de Obra / Serviço:</span>
                    <span className="font-bold">R$ {selectedOS.laborValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  {selectedOS.discount > 0 && (
                    <div className="flex justify-between text-xs text-red-600">
                      <span>Desconto:</span>
                      <span className="font-bold">- R$ {selectedOS.discount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-black border-t-2 pt-2">
                    <span>TOTAL:</span>
                    <span>R$ {selectedOS.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              <div className="mt-20 flex justify-between gap-10">
                <div className="flex-1 text-center">
                  <div className="border-t border-black mb-1"></div>
                  <p className="text-[10px] uppercase font-bold">Assinatura do Cliente</p>
                </div>
                <div className="flex-1 text-center">
                  <div className="border-t border-black mb-1"></div>
                  <p className="text-[10px] uppercase font-bold">Responsável Técnico</p>
                </div>
              </div>
            </div>

            <div className="mt-12 flex gap-4 no-print">
              <button 
                onClick={() => window.print()} 
                className="flex-1 bg-black text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3"
              >
                <Printer size={20} />
                Reimprimir
              </button>
              <button 
                onClick={() => setSelectedOS(null)}
                className="flex-1 bg-zinc-100 text-zinc-900 py-4 rounded-xl font-black text-sm uppercase tracking-widest"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceOrders;
