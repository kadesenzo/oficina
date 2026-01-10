
import React from 'react';
import { Bell, Search, LogOut, UserCircle, Menu, CloudCheck, CloudDownload, RefreshCw } from 'lucide-react';
import { SyncStatus } from '../types';

interface HeaderProps {
  onLogout: () => void;
  onToggleSidebar: () => void;
  role: string;
  username: string;
  syncStatus: SyncStatus;
}

const Header: React.FC<HeaderProps> = ({ onLogout, onToggleSidebar, role, username, syncStatus }) => {
  return (
    <header className="h-16 border-b border-zinc-800 bg-[#0B0B0B] flex items-center justify-between px-4 md:px-8 z-30">
      <div className="flex items-center gap-4">
        <button 
          onClick={onToggleSidebar}
          className="md:hidden p-2 text-zinc-400 hover:text-white transition-colors"
        >
          <Menu size={24} />
        </button>

        <div className="hidden lg:flex items-center gap-3 px-4 py-1.5 bg-zinc-900/50 border border-zinc-800 rounded-full">
          {syncStatus === SyncStatus.SYNCING ? (
            <RefreshCw size={14} className="text-[#A32121] animate-spin" />
          ) : (
            <CloudCheck size={14} className="text-emerald-500" />
          )}
          <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
            {syncStatus === SyncStatus.SYNCING ? 'Sincronizando Nuvem...' : 'Dados Protegidos na Nuvem'}
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-4 md:space-x-6">
        <button className="relative p-2 text-zinc-400 hover:text-white transition-colors hidden sm:block">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#A32121] rounded-full"></span>
        </button>

        <div className="flex items-center space-x-3 border-l border-zinc-800 pl-4 md:pl-6">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-black text-white uppercase">{username}</p>
            <p className="text-[9px] text-[#A32121] font-black uppercase tracking-wider leading-none mt-1">{role}</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[#A32121] shadow-inner">
            <UserCircle size={24} />
          </div>
          <button 
            onClick={onLogout}
            className="p-2 text-zinc-600 hover:text-[#A32121] transition-all active:scale-90"
            title="Sair do Sistema"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
