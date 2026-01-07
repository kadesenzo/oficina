
import React, { useState, useEffect } from 'react';
import { Car, Search, Trash2, User, Info, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Vehicle, Client } from '../types';

const Vehicles: React.FC = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const savedVehicles = JSON.parse(localStorage.getItem('kaenpro_vehicles') || '[]');
    const savedClients = JSON.parse(localStorage.getItem('kaenpro_clients') || '[]');
    setVehicles(savedVehicles);
    setClients(savedClients);
  }, []);

  const handleDelete = (id: string) => {
    if (confirm("Deseja realmente excluir este veículo?")) {
      const updated = vehicles.filter(v => v.id !== id);
      setVehicles(updated);
      localStorage.setItem('kaenpro_vehicles', JSON.stringify(updated));
    }
  };

  const getOwnerName = (clientId: string) => {
    return clients.find(c => c.id === clientId)?.name || 'Desconhecido';
  };

  const filtered = vehicles.filter(v => 
    v.plate.toLowerCase().includes(searchTerm.toLowerCase()) || 
    v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getOwnerName(v.clientId).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">Frota de Veículos</h1>
          <p className="text-zinc-500">Visualização de todos os veículos cadastrados no sistema.</p>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 p-2 rounded-2xl flex items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3.5 text-zinc-500" size={20} />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por placa, modelo ou proprietário..." 
            className="w-full bg-transparent border-none py-3.5 pl-12 pr-4 focus:ring-0 text-white placeholder-zinc-500"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-zinc-900/30 border-2 border-dashed border-zinc-800 rounded-3xl p-16 text-center">
          <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-zinc-600">
            <Car size={32} />
          </div>
          <p className="text-zinc-500 font-bold">Nenhum veículo encontrado.</p>
          <p className="text-zinc-600 text-sm mt-1">Cadastre um cliente para adicionar seu primeiro veículo.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(v => (
            <div key={v.id} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 hover:border-[#A32121]/50 transition-all group overflow-hidden relative">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-800">
                  <span className="text-sm font-black text-white uppercase tracking-widest">{v.plate}</span>
                </div>
                <div className="p-2 bg-zinc-800 rounded-xl text-zinc-400">
                  <Car size={18} />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-black text-white">{v.model}</h3>
                  <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">{v.brand} {v.year ? `• ${v.year}` : ''}</p>
                </div>

                <div className="pt-4 border-t border-zinc-800/50 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <User size={14} className="text-[#A32121]" />
                    <span className="font-bold">Proprietário:</span>
                    <span className="text-zinc-300">{getOwnerName(v.clientId)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <Info size={14} className="text-[#A32121]" />
                    <span className="font-bold">Quilometragem:</span>
                    <span className="text-zinc-300">{v.km.toLocaleString('pt-BR')} KM</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                 <button 
                  onClick={() => handleDelete(v.id)}
                  className="p-3 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                >
                  <Trash2 size={18} />
                </button>
                <button 
                  onClick={() => navigate(`/vehicles/${v.id}`)}
                  className="flex-1 bg-zinc-800 text-white font-bold text-xs py-3 rounded-xl hover:bg-[#A32121] transition-all flex items-center justify-center gap-2"
                >
                  Ver Histórico
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Vehicles;
