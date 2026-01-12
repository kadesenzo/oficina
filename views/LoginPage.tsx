
import React, { useState } from 'react';
import { Lock, Wrench, Eye, EyeOff, RefreshCw, Cloud } from 'lucide-react';

interface LoginPageProps {
  onLogin: (username: string, role: 'Dono' | 'Funcionário' | 'Recepção') => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('Rafael');
  const [password, setPassword] = useState('enzo1234');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setError('');

    await new Promise(r => setTimeout(r, 1200));

    if (username === 'Rafael' && password === 'enzo1234') {
      onLogin(username, 'Dono');
    } else if (username === 'Mecanico' && password === '1234') {
      onLogin(username, 'Funcionário');
    } else {
      setError('Credenciais inválidas.');
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-6 selection:bg-[#E11D48]">
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-[#E11D48] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-red-900/30 glow-red transform rotate-3">
            <Wrench size={40} className="text-white -rotate-3" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">KAEN<span className="text-[#E11D48]">PRO</span></h1>
          <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.4em] mt-2">Elite Garage Management</p>
        </div>

        <div className="bg-[#0c0c0e] border border-zinc-900 p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
          {isLoggingIn && (
            <div className="absolute inset-0 bg-[#0c0c0e]/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center gap-4">
              <RefreshCw size={32} className="text-[#E11D48] animate-spin" />
              <p className="text-[10px] font-black text-white uppercase tracking-widest">Sincronizando Banco de Dados...</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Usuário</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#050505] border border-zinc-800 rounded-xl px-5 py-4 text-white focus:border-[#E11D48] transition-all font-semibold" 
                placeholder="Login"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Senha</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#050505] border border-zinc-800 rounded-xl px-5 py-4 text-white focus:border-[#E11D48] transition-all font-semibold" 
                  placeholder="••••••••"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-[#E11D48] py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-[#c4153c] transition-all shadow-xl shadow-red-900/20 flex items-center justify-center space-x-3 active:scale-95"
            >
              <span>Acessar Sistema</span>
            </button>
          </form>
        </div>
        
        <p className="mt-10 text-center text-[9px] text-zinc-700 font-bold uppercase tracking-[0.3em]">
          © 2024 KAENPRO MOTORS • V 3.1 CLOUD
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
