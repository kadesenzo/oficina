
import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './views/LandingPage';
import LoginPage from './views/LoginPage';
import Dashboard from './views/Dashboard';
import ServiceOrders from './views/ServiceOrders';
import NewServiceOrder from './views/NewServiceOrder';
import Inventory from './views/Inventory';
import Clients from './views/Clients';
import ClientDetails from './views/ClientDetails';
import Vehicles from './views/Vehicles';
import VehicleDetails from './views/VehicleDetails';
import Employees from './views/Employees';
import Billing from './views/Billing';
import MechanicTerminal from './views/MechanicTerminal';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'Dono' | 'Funcionário' | 'Recepção'>('Dono');

  const PrivateLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
      <div className="flex h-screen bg-[#0B0B0B] overflow-hidden">
        {/* Sidebar com controle de estado mobile */}
        <Sidebar 
          role={userRole} 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
        />
        
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <Header 
            role={userRole} 
            onLogout={() => setIsAuthenticated(false)} 
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          />
          
          <main className="flex-1 overflow-y-auto p-4 md:p-8 no-scrollbar bg-zinc-950">
            {children}
          </main>

          {/* Overlay para fechar o menu ao clicar fora no mobile */}
          {isSidebarOpen && (
            <div 
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[40] md:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage onLogin={() => {}} />} />
        
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage onLogin={() => setIsAuthenticated(true)} />} 
        />
        
        <Route 
          path="/dashboard" 
          element={isAuthenticated ? <PrivateLayout><Dashboard /></PrivateLayout> : <Navigate to="/login" />} 
        />
        <Route 
          path="/orders" 
          element={isAuthenticated ? <PrivateLayout><ServiceOrders role={userRole} /></PrivateLayout> : <Navigate to="/login" />} 
        />
        <Route 
          path="/orders/new" 
          element={isAuthenticated ? <PrivateLayout><NewServiceOrder /></PrivateLayout> : <Navigate to="/login" />} 
        />
        <Route 
          path="/billing" 
          element={isAuthenticated ? <PrivateLayout><Billing /></PrivateLayout> : <Navigate to="/login" />} 
        />
        <Route 
          path="/inventory" 
          element={isAuthenticated ? <PrivateLayout><Inventory /></PrivateLayout> : <Navigate to="/login" />} 
        />
        <Route 
          path="/clients" 
          element={isAuthenticated ? <PrivateLayout><Clients role={userRole} /></PrivateLayout> : <Navigate to="/login" />} 
        />
        <Route 
          path="/clients/:id" 
          element={isAuthenticated ? <PrivateLayout><ClientDetails role={userRole} /></PrivateLayout> : <Navigate to="/login" />} 
        />
        <Route 
          path="/vehicles" 
          element={isAuthenticated ? <PrivateLayout><Vehicles /></PrivateLayout> : <Navigate to="/login" />} 
        />
        <Route 
          path="/vehicles/:id" 
          element={isAuthenticated ? <PrivateLayout><VehicleDetails /></PrivateLayout> : <Navigate to="/login" />} 
        />
        <Route 
          path="/employees" 
          element={isAuthenticated ? <PrivateLayout><Employees /></PrivateLayout> : <Navigate to="/login" />} 
        />
        <Route 
          path="/terminal" 
          element={isAuthenticated ? <PrivateLayout><MechanicTerminal /></PrivateLayout> : <Navigate to="/login" />} 
        />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
