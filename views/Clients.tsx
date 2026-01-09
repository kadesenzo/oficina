
import React, { useState, useEffect } from 'react';
import { Users, Search, UserPlus, Phone, FileText, ChevronRight, X, User, MessageCircle, Copy, Trash2, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Client, Vehicle, ServiceOrder } from '../types';

interface ClientsProps {
  role: 'Dono' | 'Funcionário' | 'Recepção';
}

const Clients: React.FC<ClientsProps> = ({ role }) => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newClient, setNewClient] = useState({
    name: '',
    phone: '',
    document: '',
    observations: ''
  });
  const [newVehicle, setNewVehicle] = useState({
    plate: '',
    model: '',
    brand: '',
    year: '',
    km: ''
  });

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('kaenpro_clients') || '[]');
    setClients(saved);
  }, []);

  const handleSave = () => {
    if (!newClient.name || !newClient.phone || !newVehicle.plate) {
      alert("ERRO: Nome, Telefone e Placa do Veículo são obrigatórios.");
      return;
    }
    
    const clientId = Math.random().toString(36).substr(2, 9);
    
    const client: Client = {
      ...newClient,
      id: clientId,
      createdAt: new Date().toISOString()
    };

    const vehicle: Vehicle = {
      id: Math.random().toString(36).substr(2, 9),
      clientId: clientId,
      plate: newVehicle.plate.toUpperCase(),
      model: newVehicle.model,
      brand: newVehicle.brand,
      year: newVehicle.year,
      km: parseFloat(newVehicle.km) || 0
    };

    const updatedClients = [...clients, client];
    const savedVehicles = JSON.parse(localStorage.getItem('kaenpro_vehicles') || '[]');
    const updatedVehicles = [...savedVehicles, vehicle];

    setClients(updatedClients);
    localStorage.setItem('kaenpro_clients', JSON.stringify(updatedClients));
    localStorage.setItem('kaenpro_vehicles', JSON.stringify(updatedVehicles));
    
    setShowModal(false);
    setNewClient({ name: '', phone: '', document: '', observations: '' });
    setNewVehicle({ plate: '', model: '', brand: '', year: '', km: '' });
  };

  const handleDeleteClient = (clientId: string, clientName: string) => {
    if (role !== 'Dono') {
      alert("Acesso Negado: Apenas o Administrador/Dono pode excluir clientes.");
      return;
    }

    const confirmMessage = `⚠️ ATENÇÃO: Tem certeza que deseja excluir o cliente ${clientName}?\n\nTODAS as notas (Ordens de Serviço) e TODOS os veículos vinculados a este cliente serão apagados PERMANENTEMENTE.\n\nEsta ação não pode ser desfeita.`;
    
    if (confirm(confirmMessage)) {
      // 1. Filter Clients
      const updatedClients = clients.filter(c => c.id !== clientId);
      
      // 2. Filter Vehicles linked to this client
      const savedVehicles = JSON.parse(localStorage.getItem('kaenpro_vehicles') || '[]');
      const updatedVehicles = savedVehicles.filter((v: Vehicle) => v.clientId !== clientId);
      
      // 3. Filter Orders linked to this client
      const savedOrders = JSON.parse(localStorage.getItem('kaenpro_orders') || '[]');
      const updatedOrders = savedOrders.filter((o: ServiceOrder) => o.clientId !== clientId);

      // 4. Update LocalStorage
      localStorage.setItem('kaenpro_clients', JSON.stringify(updatedClients));
      localStorage.setItem('kaenpro_vehicles', JSON.stringify(updatedVehicles));
      localStorage.setItem('kaenpro_orders', JSON.stringify(updatedOrders));
      
      // 5. Update State
      setClients(updatedClients);
      alert(`Cliente ${clientName} e todos os seus dados vinculados foram removidos com sucesso.`);
    }
  };

  const copyPhone = (phone: string) => {
    navigator.clipboard.writeText(phone);
    alert("Número copiado!");
  };

  const filtered = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.document.includes(searchTerm) ||
    c.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">Clientes</h1>
          <p className="text-zinc-500">Base de dados centralizada de proprietários.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-[#A32121] px-6 py-3 rounded-xl font-bold flex items-center justify-center space-x-2 hover:bg-[#8B1A1A] transition-all shadow-lg shadow-red-900/20"
        >
          <UserPlus size={20} />
          <span>Novo Cliente + Veículo</span>
        </button>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 p-2 rounded-2xl flex items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3.5 text-zinc-500" size={20} />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por nome, CPF ou telefone..." 
            className="w-full bg-transparent border-none py-3.5 pl-12 pr-4 focus:ring-0 text-white placeholder-zinc-500"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-zinc-900/30 border-2 border-dashed border-zinc-800 rounded-3xl p-16 text-center">
          <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-zinc-600">
            <User size={32} />
          </div>
          <p className="text-zinc-500 font-bold">Nenhum cliente encontrado.</p>
          <p className="text-zinc-600 text-sm mt-1">Sua oficina ainda não possui registros com este filtro.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map(c => (
            <div key={c.id} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 hover:border-zinc-700 transition-all group relative overflow-hidden">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-500 group-hover:text-[#A32121] transition-colors">
                    <User size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white group-hover:text-zinc-100 truncate max-w-[180px]">{c.name}</h3>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest">{c.document || 'Sem CPF/CNPJ'}</p>
                  </div>
                </div>
                {role === 'Dono' && (
                  <button 
                    onClick={() => handleDeleteClient(c.id, c.name)}
                    className="p-2 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                    title="Excluir Cliente Permanentemente"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>

              <div className="bg-zinc-950/50 border border-zinc-800/50 rounded-2xl p-4 mb-6">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">WhatsApp / Telefone</span>
                  <div className="flex gap-2">
                    <button onClick={() => copyPhone(c.phone)} className="text-zinc-600 hover:text-white transition-colors" title="Copiar número"><Copy size={12} /></button>
                    <a href={`https://wa.me/55${c.phone.replace(/\D/g,'')}`} target="_blank" className="text-[#25D366] hover:scale-110 transition-transform"><MessageCircle size={14} /></a>
                  </div>
                </div>
                <div className="flex items-center space-x-3 text-lg font-black text-zinc-100">
                  <Phone size={18} className="text-[#A32121]" />
                  <span>{c.phone}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => navigate(`/clients/${c.id}`)}
                  className="flex-1 bg-zinc-800 text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#A32121] transition-all flex items-center justify-center gap-2"
                >
                  <FileText size={14} />
                  Ver Perfil
                </button>
                <button 
                  onClick={() => navigate(`/clients/${c.id}`)}
                  className="p-3 text-zinc-500 hover:text-white transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Cadastro */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto no-scrollbar">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-2xl p-8 rounded-3xl shadow-2xl relative my-8">
            <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-zinc-500 hover:text-white"><X /></button>
            <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
              <UserPlus className="text-[#A32121]" />
              Novo Cliente & Veículo
            </h2>
            
            <div className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-[#A32121] border-b border-zinc-800 pb-2 flex justify-between items-center">
                  <span>Informações do Cliente</span>
                  <span className="text-[10px] text-zinc-600">* campos obrigatórios</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="md:col-span-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Nome Completo *</label>
                    <input 
                      type="text" 
                      value={newClient.name}
                      onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-[#A32121]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">WhatsApp / Telefone *</label>
                    <input 
                      type="text" 
                      value={newClient.phone}
                      onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                      placeholder="(00) 00000-0000"
                      className="w-full bg-zinc-950 border border-[#A32121]/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-[#A32121] placeholder-zinc-700"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">CPF / CNPJ</label>
                    <input 
                      type="text" 
                      value={newClient.document}
                      onChange={(e) => setNewClient({...newClient, document: e.target.value})}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-[#A32121]"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 border-b border-zinc-800 pb-2">Veículo de Entrada</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Placa *</label>
                    <input 
                      type="text" 
                      value={newVehicle.plate}
                      onChange={(e) => setNewVehicle({...newVehicle, plate: e.target.value})}
                      placeholder="ABC-1234"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-[#A32121]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Modelo</label>
                    <input 
                      type="text" 
                      value={newVehicle.model}
                      onChange={(e) => setNewVehicle({...newVehicle, model: e.target.value})}
                      placeholder="Ex: Corolla"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-[#A32121]"
                    />
                  </div>
                </div>
              </div>

              <button 
                onClick={handleSave}
                className="w-full bg-[#A32121] py-5 rounded-2xl font-black uppercase text-sm tracking-widest hover:bg-[#8B1A1A] transition-all transform active:scale-[0.98] shadow-lg shadow-red-900/20"
              >
                Efetuar Cadastro
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;
