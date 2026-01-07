
import React, { useState, useEffect } from 'react';
import { Package, Search, Plus, AlertCircle, Trash2, X, MoreVertical, Edit } from 'lucide-react';
import { Part } from '../types';

const Inventory: React.FC = () => {
  const [parts, setParts] = useState<Part[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newPart, setNewPart] = useState({
    name: '',
    sku: '',
    stock: 0,
    minStock: 0,
    salePrice: 0,
    costPrice: 0
  });

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('kaenpro_parts') || '[]');
    setParts(saved);
  }, []);

  const handleSave = () => {
    if (!newPart.name) return;
    const part: Part = {
      ...newPart,
      id: Math.random().toString(36).substr(2, 9)
    };
    const updated = [...parts, part];
    setParts(updated);
    localStorage.setItem('kaenpro_parts', JSON.stringify(updated));
    setShowModal(false);
    setNewPart({ name: '', sku: '', stock: 0, minStock: 0, salePrice: 0, costPrice: 0 });
  };

  const handleDelete = (id: string) => {
    if (confirm("Excluir item do estoque?")) {
      const updated = parts.filter(p => p.id !== id);
      setParts(updated);
      localStorage.setItem('kaenpro_parts', JSON.stringify(updated));
    }
  };

  const filtered = parts.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.includes(searchTerm));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">Controle de Estoque</h1>
          <p className="text-zinc-500">Gestão real de peças e lubrificantes.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-[#A32121] px-6 py-3 rounded-xl font-bold flex items-center justify-center space-x-2 hover:bg-[#8B1A1A] transition-all shadow-lg shadow-red-900/20"
        >
          <Plus size={20} />
          <span>Cadastrar Peça</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800">
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-2">Total de Itens</p>
          <p className="text-3xl font-black text-white">{parts.length}</p>
        </div>
        <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800">
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-2">Alertas de Reposição</p>
          <p className="text-3xl font-black text-amber-500">{parts.filter(p => p.stock <= p.minStock).length}</p>
        </div>
        <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800">
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-2">Valor em Estoque</p>
          <p className="text-3xl font-black text-emerald-500">R$ {parts.reduce((acc, curr) => acc + (curr.stock * curr.salePrice), 0).toLocaleString('pt-BR')}</p>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-zinc-800 bg-zinc-950">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-2.5 text-zinc-500" size={18} />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Pesquisar por SKU ou Nome..." 
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 pl-10 pr-4 text-sm outline-none focus:border-[#A32121]" 
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-950/50 text-zinc-500 text-[10px] uppercase tracking-widest font-black">
                <th className="px-8 py-4">Peça / Produto</th>
                <th className="px-8 py-4">SKU</th>
                <th className="px-8 py-4">Quantidade</th>
                <th className="px-8 py-4">Venda Unit.</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="px-8 py-5">
                    <p className="text-sm font-bold text-white">{p.name}</p>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-xs font-mono text-zinc-500">{p.sku}</p>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-black ${p.stock <= p.minStock ? 'text-amber-500' : 'text-zinc-300'}`}>{p.stock}</span>
                      <span className="text-[10px] text-zinc-600 font-bold uppercase">Mín. {p.minStock}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-sm font-black text-emerald-500">R$ {p.salePrice.toLocaleString('pt-BR')}</p>
                  </td>
                  <td className="px-8 py-5">
                    {p.stock <= p.minStock ? (
                      <span className="px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">Reposição</span>
                    ) : (
                      <span className="px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">OK</span>
                    )}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button onClick={() => handleDelete(p.id)} className="p-2 text-zinc-700 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-16 text-center text-zinc-600 font-bold italic">Nenhum item em estoque.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Cadastro Peça */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-lg p-8 rounded-[2.5rem] shadow-2xl relative">
            <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-zinc-500 hover:text-white"><X /></button>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Package size={24} className="text-[#A32121]" /> Cadastrar Produto</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Nome da Peça / Fluido</label>
                  <input 
                    type="text" 
                    value={newPart.name}
                    onChange={(e) => setNewPart({...newPart, name: e.target.value})}
                    placeholder="Ex: Óleo Selènia 5W30"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-[#A32121]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">SKU / Cód.</label>
                  <input 
                    type="text" 
                    value={newPart.sku}
                    onChange={(e) => setNewPart({...newPart, sku: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-[#A32121]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Preço Venda</label>
                  <input 
                    type="number" 
                    value={newPart.salePrice}
                    onChange={(e) => setNewPart({...newPart, salePrice: parseFloat(e.target.value) || 0})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-[#A32121]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Estoque Atual</label>
                  <input 
                    type="number" 
                    value={newPart.stock}
                    onChange={(e) => setNewPart({...newPart, stock: parseFloat(e.target.value) || 0})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-[#A32121]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Estoque Mínimo</label>
                  <input 
                    type="number" 
                    value={newPart.minStock}
                    onChange={(e) => setNewPart({...newPart, minStock: parseFloat(e.target.value) || 0})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-[#A32121]"
                  />
                </div>
              </div>
              <button 
                onClick={handleSave}
                className="w-full bg-[#A32121] py-4 rounded-2xl font-bold hover:bg-[#8B1A1A] transition-all transform active:scale-[0.98] mt-4"
              >
                Salvar no Estoque
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
