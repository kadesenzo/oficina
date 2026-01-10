
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  FileText, 
  Printer, 
  Share2,
  Trash2,
  Eye,
  X,
  Wrench,
  Package,
  ClipboardList,
  AlertTriangle,
  Image as ImageIcon,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ServiceOrder, PaymentStatus } from '../types';
import html2canvas from 'html2canvas';

interface ServiceOrdersProps {
  role?: 'Dono' | 'Funcionário' | 'Recepção';
}

const ServiceOrders: React.FC<ServiceOrdersProps> = ({ role = 'Dono' }) => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOS, setSelectedOS] = useState<ServiceOrder | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  useEffect(() => {
    setOrders(JSON.parse(localStorage.getItem('kaenpro_orders') || '[]'));
  }, []);

  const handleDelete = (id: string, osNumber: string) => {
    if (role !== 'Dono') {
      alert("Acesso Negado: Apenas o Administrador pode apagar notas.");
      return;
    }

    if (confirm(`⚠️ ATENÇÃO: Tem certeza que deseja apagar a nota #${osNumber}?\n\nEsta ação não pode ser desfeita.`)) {
      const updated = orders.filter(o => o.id !== id);
      setOrders(updated);
      localStorage.setItem('kaenpro_orders', JSON.stringify(updated));
      if (selectedOS?.id === id) {
        setSelectedOS(null);
      }
    }
  };

  const shareWhatsApp = (os: ServiceOrder) => {
    let message = `*KAEN MECÂNICA - NOTA #${os.osNumber}*\n*Veículo:* ${os.vehiclePlate}\n*Total: R$ ${os.totalValue.toLocaleString('pt-BR')}*`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const saveAsImage = async () => {
    if (!selectedOS) return;
    const element = document.getElementById('print-area-viewer');
    if (!element) return;

    setIsGeneratingImage(true);
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
        windowWidth: 800 // Fix width for consistent image rendering
      });
      
      const link = document.createElement('a');
      link.download = `OS-${selectedOS.osNumber}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error("Erro ao gerar imagem:", err);
      alert("Erro ao gerar imagem da nota.");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const filtered = orders.filter(o => 
    o.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    o.vehiclePlate.includes(searchTerm) || 
    o.osNumber.includes(searchTerm)
  ).reverse();

  const isLongNote = selectedOS && selectedOS.items.length > 8;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 no-print">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-3xl font-black text-white">Notas Geradas</h1>
          <p className="text-zinc-500">Histórico digital de ordens de serviço.</p>
        </div>
        <button 
          onClick={() => navigate('/orders/new')}
          className="bg-[#A32121] px-6 py-3 rounded-xl font-bold flex items-center justify-center space-x-2 shadow-lg shadow-red-900/20"
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
            placeholder="Pesquisar por nome, placa ou número..." 
            className="w-full bg-transparent border-none py-3.5 pl-12 pr-4 focus:ring-0 text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 no-print">
        {filtered.map(os => (
          <div key={os.id} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 hover:border-[#A32121]/40 transition-all text-white flex flex-col">
            <div className="flex justify-between mb-4">
              <span className="text-[10px] font-black text-[#A32121] tracking-widest uppercase">#{os.osNumber}</span>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${os.paymentStatus === PaymentStatus.PAGO ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>{os.paymentStatus}</span>
                {role === 'Dono' && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(os.id, os.osNumber);
                    }}
                    className="p-1.5 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                    title="Apagar Nota"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
            <h3 className="text-lg font-black truncate">{os.clientName}</h3>
            <p className="text-xs font-black text-zinc-500 mb-6 uppercase tracking-tight">{os.vehiclePlate} • {os.vehicleModel}</p>
            <div className="flex items-center justify-between pt-4 border-t border-zinc-800 mt-auto">
              <span className="text-sm font-black">R$ {os.totalValue.toLocaleString('pt-BR')}</span>
              <button onClick={() => setSelectedOS(os)} className="px-4 py-2 bg-zinc-800 text-white text-[10px] font-black uppercase rounded-xl hover:bg-[#A32121] transition-all">Ver Nota</button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full py-20 text-center bg-zinc-900/30 border-2 border-dashed border-zinc-800 rounded-[2.5rem]">
            <FileText size={48} className="mx-auto text-zinc-800 mb-4 opacity-20" />
            <p className="text-zinc-600 font-bold uppercase tracking-widest text-xs italic">Nenhuma nota encontrada</p>
          </div>
        )}
      </div>

      {selectedOS && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 p-0 md:p-4 overflow-y-auto no-scrollbar">
          <div className={`bg-white w-full max-w-[210mm] min-h-screen md:min-h-0 md:rounded-[2rem] p-0 text-zinc-900 shadow-2xl relative flex flex-col ${isLongNote ? 'print-compact' : ''}`}>
            
            <div className="no-print bg-zinc-100 p-4 flex flex-wrap gap-2 justify-between items-center border-b border-zinc-200 sticky top-0 z-[210]">
              <div className="flex flex-wrap gap-2">
                <button onClick={() => window.print()} className="bg-zinc-900 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase flex items-center gap-2">
                  <Printer size={16} /> Imprimir A4
                </button>
                <button 
                  onClick={saveAsImage} 
                  disabled={isGeneratingImage}
                  className="bg-zinc-800 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 disabled:opacity-50"
                >
                  {isGeneratingImage ? <Loader2 size={16} className="animate-spin" /> : <ImageIcon size={16} />}
                  Salvar Imagem
                </button>
                <button onClick={() => shareWhatsApp(selectedOS)} className="bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase flex items-center gap-2">
                  <Share2 size={16} /> WhatsApp
                </button>
                {role === 'Dono' && (
                  <button 
                    onClick={() => handleDelete(selectedOS.id, selectedOS.osNumber)}
                    className="bg-red-100 text-red-600 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-red-600 hover:text-white transition-all"
                  >
                    <Trash2 size={16} /> Apagar Nota
                  </button>
                )}
              </div>
              <button onClick={() => setSelectedOS(null)} className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors"><X size={32} /></button>
            </div>

            <div id="print-area-viewer" className="p-[10mm] sm:p-[15mm] text-zinc-900 flex flex-col flex-1 bg-white">
              <div className="flex justify-between items-start mb-8 pb-4 border-b-2 border-zinc-100 print-header">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center text-white">
                    <Wrench size={24} />
                  </div>
                  <div>
                    <h1 className="text-2xl font-black tracking-tighter uppercase">KAEN <span className="text-zinc-500">MECÂNICA</span></h1>
                    <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-[0.2em]">Rua Joaquim Marques Alves, 765</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black uppercase text-zinc-400 tracking-widest">OS Nº</p>
                  <p className="text-xl font-black">{selectedOS.osNumber}</p>
                  <p className="text-[10px] font-bold text-zinc-500">{new Date(selectedOS.createdAt).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8 print-info-cards">
                <div className="bg-zinc-50 p-5 rounded-3xl border border-zinc-100">
                  <h5 className="text-[9px] font-black uppercase text-zinc-400 tracking-widest mb-1">Proprietário</h5>
                  <p className="font-black text-base">{selectedOS.clientName}</p>
                </div>
                <div className="bg-zinc-50 p-5 rounded-3xl border border-zinc-100">
                  <h5 className="text-[9px] font-black uppercase text-zinc-400 tracking-widest mb-1">Veículo / KM</h5>
                  <p className="font-black text-sm uppercase">{selectedOS.vehiclePlate} • {selectedOS.vehicleModel}</p>
                  <p className="text-base font-black text-zinc-900">{selectedOS.vehicleKm} km</p>
                </div>
              </div>

              <div className="flex-1">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="border-b-2 border-zinc-100">
                    <tr className="text-zinc-400 uppercase font-black text-[9px] tracking-widest">
                      <th className="py-3 px-1">Descrição</th>
                      <th className="py-3 px-1 text-center w-12">Qtd</th>
                      <th className="py-3 px-1 text-right w-24">V. Unit</th>
                      <th className="py-3 px-1 text-right w-24">V. Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50">
                    {selectedOS.items.map((item, i) => (
                      <tr key={i} className="print:text-[10px]">
                        <td className="py-3 px-1 font-bold">{item.description}</td>
                        <td className="py-3 px-1 text-center text-zinc-500">{item.quantity}</td>
                        <td className="py-3 px-1 text-right text-zinc-500">R$ {item.unitPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        <td className="py-3 px-1 text-right font-black">R$ {(item.quantity * item.unitPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                    {selectedOS.laborValue > 0 && (
                      <tr className="bg-zinc-50/50">
                        <td className="py-3 px-1 font-bold">Mão de Obra Técnica</td>
                        <td className="py-3 px-1 text-center font-black">01</td>
                        <td className="py-3 px-1 text-right">R$ {selectedOS.laborValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        <td className="py-3 px-1 text-right font-black">R$ {selectedOS.laborValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-8 pt-8 border-t-2 border-zinc-100 print-block">
                <div className="flex justify-between items-end">
                  <div className="text-[9px] text-zinc-400 font-bold uppercase">
                    <div className="mt-8 border-t border-zinc-200 pt-1 w-48 text-center">Assinatura Técnica</div>
                  </div>
                  <div className="w-full max-w-[240px]">
                    <div className="bg-zinc-100 print:border-4 print:border-zinc-50 p-4 rounded-[2rem] text-right">
                      <p className="text-[8px] font-black uppercase text-zinc-400 mb-1">Total da Nota</p>
                      <p className="text-2xl font-black text-zinc-900 leading-none">R$ {selectedOS.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-12 text-center text-[9px] font-black text-zinc-300 uppercase tracking-[0.5em]">
                Kaen Mecânica • Confiança em cada km
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceOrders;
