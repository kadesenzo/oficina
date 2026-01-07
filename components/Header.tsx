
import React from 'react';
import { Bell, Search, LogOut, UserCircle } from 'lucide-react';

interface HeaderProps {
  onLogout: () => void;
  role: string;
}

const Header: React.FC<HeaderProps> = ({ onLogout, role }) => {
  return (
    <header className="h-16 border-b border-zinc-800 bg-[#0B0B0B] flex items-center justify-between px-8 z-10">
      <div className="relative w-96 max-w-md hidden sm:block">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="h-5 w-5 text-zinc-500" />
        </span>
        <input
          type="text"
          placeholder="Pesquisar por placa ou cliente..."
          className="w-full bg-zinc-900 text-sm text-white rounded-full py-2 pl-10 pr-4 border border-zinc-800 focus:outline-none focus:ring-1 focus:ring-[#A32121]"
        />
      </div>

      <div className="flex items-center space-x-6">
        <button className="relative p-2 text-zinc-400 hover:text-white transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#A32121] rounded-full"></span>
        </button>

        <div className="flex items-center space-x-3 border-l border-zinc-800 pl-6">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-white">Administrador</p>
            <p className="text-xs text-[#A32121] font-bold uppercase tracking-wider">{role}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-[#A32121]">
            <UserCircle size={24} />
          </div>
          <button 
            onClick={onLogout}
            className="p-2 text-zinc-400 hover:text-[#A32121] transition-colors"
            title="Sair"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
