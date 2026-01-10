
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Car, 
  PlusSquare, 
  FileText, 
  Package, 
  UserCheck,
  Settings,
  Wrench,
  ChevronRight,
  DollarSign,
  Smartphone,
  X
} from 'lucide-react';

interface SidebarProps {
  role: 'Dono' | 'Funcionário' | 'Recepção';
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ role, isOpen, onClose }) => {
  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', roles: ['Dono', 'Funcionário', 'Recepção'] },
    { name: 'Terminal Mecânico', icon: Smartphone, path: '/terminal', roles: ['Dono', 'Funcionário'] },
    { name: 'Criar Nota', icon: PlusSquare, path: '/orders/new', roles: ['Dono', 'Recepção', 'Funcionário'] },
    { name: 'Notas Geradas', icon: FileText, path: '/orders', roles: ['Dono', 'Recepção', 'Funcionário'] },
    { name: 'Cobranças', icon: DollarSign, path: '/billing', roles: ['Dono', 'Recepção'] },
    { name: 'Clientes', icon: Users, path: '/clients', roles: ['Dono', 'Recepção'] },
    { name: 'Veículos', icon: Car, path: '/vehicles', roles: ['Dono', 'Recepção', 'Funcionário'] },
    { name: 'Estoque', icon: Package, path: '/inventory', roles: ['Dono', 'Recepção'] },
    { name: 'Equipe', icon: UserCheck, path: '/employees', roles: ['Dono'] },
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(role));

  const sidebarClasses = `
    fixed inset-y-0 left-0 z-[50] w-72 bg-[#0B0B0B] border-r border-zinc-800 transition-all duration-300 transform
    md:relative md:translate-x-0
    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
  `;

  return (
    <aside className={sidebarClasses}>
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-[#A32121] rounded-lg flex items-center justify-center">
            <Wrench className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Kaen<span className="text-[#A32121]">pro</span></span>
        </div>
        
        {/* Botão de Fechar - Apenas Mobile */}
        <button 
          onClick={onClose}
          className="md:hidden p-2 text-zinc-500 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      <nav className="flex-1 mt-6 px-4 space-y-2 overflow-y-auto no-scrollbar">
        {filteredItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) => `
              flex items-center justify-between p-3.5 rounded-xl transition-all duration-200
              ${isActive 
                ? 'bg-[#A32121] text-white shadow-lg shadow-red-900/20' 
                : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'}
            `}
          >
            <div className="flex items-center space-x-3">
              <item.icon size={20} />
              <span className="font-bold text-xs uppercase tracking-widest">{item.name}</span>
            </div>
            <ChevronRight size={14} className="opacity-50" />
          </NavLink>
        ))}
      </nav>

      <div className="p-4 mt-auto border-t border-zinc-800">
        <div className="flex items-center space-x-3 p-3 rounded-xl hover:bg-zinc-900 transition-colors cursor-pointer text-zinc-400">
          <Settings size={18} />
          <span className="text-xs font-bold uppercase tracking-widest">Configurações</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
