
import React from 'react';
import { Bell, LogOut, UserCircle, Menu, RefreshCw } from 'lucide-react';
import { SyncStatus } from '../types.ts';

interface HeaderProps {
  onLogout: () => void;
  onToggleSidebar: () => void;
  role: string;
  username: string;
  syncStatus: SyncStatus;
}

const Header: React.FC<HeaderProps> = ({ onLogout, onToggleSidebar, role, username, syncStatus }) => {
  return (
    <header className="h-16 border-b border-[#1F1F1F] bg-[#0A0A0A] flex items-center justify-between px-4 md:px-8 z-30 shadow-lg">
      <div className="flex items-center gap-4">
        <button 
          onClick={onToggleSidebar}
          className="md:hidden p-2 text-zinc-500 hover:text-white transition-colors"
        >
          <Menu size={24} />
        </button>

        <div className="hidden lg:flex items-center gap-3 px-4 py-1.5 bg-[#050505] border border-[#1F1F1F] rounded-full">
          {syncStatus === SyncStatus.SYNCING ? (
            <RefreshCw size={14} className="text-[#E11D48] animate-spin" />
          ) : (
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          )}
          <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
            {syncStatus === SyncStatus.SYNCING ? 'Sincronizando Cloud...' : 'Servidor Ativo'}
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-4 md:space-x-6">
        <button className="relative p-2 text-zinc-500 hover:text-white transition-colors hidden sm:block">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#E11D48] rounded-full ring-2 ring-[#0A0A0A]"></span>
        </button>

        <div className="flex items-center space-x-3 border-l border-[#1F1F1F] pl-4 md:pl-6">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-black text-white uppercase leading-none italic">{username}</p>
            <p className="text-[8px] text-zinc-600 font-black uppercase tracking-wider mt-1">{role}</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-[#1F1F1F] flex items-center justify-center text-zinc-500">
            <UserCircle size={24} />
          </div>
          <button 
            onClick={onLogout}
            className="p-2 text-zinc-600 hover:text-[#E11D48] transition-all"
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
