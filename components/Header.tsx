
import React from 'react';
import { Bell, Search, LogOut, UserCircle, Menu } from 'lucide-react';

interface HeaderProps {
  onLogout: () => void;
  onToggleSidebar: () => void;
  role: string;
}

const Header: React.FC<HeaderProps> = ({ onLogout, onToggleSidebar, role }) => {
  return (
    <header className="h-16 border-b border-zinc-800 bg-[#0B0B0B] flex items-center justify-between px-4 md:px-8 z-30">
      <div className="flex items-center gap-4">
        {/* Botão Hamburger - Visível apenas no Mobile */}
        <button 
          onClick={onToggleSidebar}
          className="md:hidden p-2 text-zinc-400 hover:text-white transition-colors"
        >
          <Menu size={24} />
        </button>

        <div className="relative w-64 max-w-md hidden lg:block">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-zinc-500" />
          </span>
          <input
            type="text"
            placeholder="Placa ou cliente..."
            className="w-full bg-zinc-900 text-xs text-white rounded-full py-2 pl-10 pr-4 border border-zinc-800 focus:outline-none focus:ring-1 focus:ring-[#A32121]"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4 md:space-x-6">
        <button className="relative p-2 text-zinc-400 hover:text-white transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#A32121] rounded-full"></span>
        </button>

        <div className="flex items-center space-x-3 border-l border-zinc-800 pl-4 md:pl-6">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-white">Administrador</p>
            <p className="text-[10px] text-[#A32121] font-black uppercase tracking-wider leading-none mt-1">{role}</p>
          </div>
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-zinc-800 flex items-center justify-center text-[#A32121]">
            <UserCircle size={20} className="md:size-24" />
          </div>
          <button 
            onClick={onLogout}
            className="p-2 text-zinc-400 hover:text-[#A32121] transition-colors"
            title="Sair"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
