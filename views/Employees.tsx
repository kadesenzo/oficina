
import React, { useState, useEffect } from 'react';
import { UserCheck, Shield, Clock, Wrench, Search, Plus, MoreHorizontal, User } from 'lucide-react';

const Employees: React.FC = () => {
  const [staff, setStaff] = useState<any[]>([]);

  useEffect(() => {
    // In a real system, you'd load from DB. System starts virgin.
    setStaff([]);
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">Equipe Técnica</h1>
          <p className="text-zinc-500">Gestão de colaboradores e permissões de acesso.</p>
        </div>
        <button className="bg-[#A32121] px-6 py-3 rounded-xl font-bold flex items-center justify-center space-x-2 hover:bg-[#8B1A1A] transition-all">
          <Plus size={20} />
          <span>Cadastrar Colaborador</span>
        </button>
      </div>

      {staff.length === 0 ? (
        <div className="bg-zinc-900/30 border-2 border-dashed border-zinc-800 rounded-[2.5rem] p-16 text-center">
          <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-zinc-600">
            <UserCheck size={32} />
          </div>
          <p className="text-zinc-500 font-bold">Base de equipe vazia.</p>
          <p className="text-zinc-600 text-sm mt-1">Nenhum funcionário cadastrado além do administrador.</p>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-zinc-800 bg-zinc-950 flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-2.5 text-zinc-500" size={18} />
              <input type="text" placeholder="Pesquisar funcionário..." className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 pl-10 pr-4 text-sm" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-zinc-950/50 text-zinc-500 text-[10px] uppercase tracking-widest font-black">
                  <th className="px-8 py-4">Colaborador</th>
                  <th className="px-8 py-4">Cargo / Acesso</th>
                  <th className="px-8 py-4">Turno</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4">O.S. Realizadas</th>
                  <th className="px-8 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {staff.map((p) => (
                  <tr key={p.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-500">
                          <User size={20} />
                        </div>
                        <p className="text-sm font-bold text-white">{p.name}</p>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm">{p.role}</td>
                    <td className="px-8 py-5 text-xs text-zinc-500">{p.shift}</td>
                    <td className="px-8 py-5">
                      <span className="px-2 py-1 rounded-lg text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-500">Ativo</span>
                    </td>
                    <td className="px-8 py-5 font-bold">{p.services}</td>
                    <td className="px-8 py-5 text-right">
                      <button className="p-2 text-zinc-600 hover:text-white"><MoreHorizontal size={20} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
