
import React, { useState } from 'react';
import { Lock, Wrench, Eye, EyeOff } from 'lucide-react';

interface LoginPageProps {
  onLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('Rafael');
  const [password, setPassword] = useState('enzo1234');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple validation for the requested credentials
    if (username === 'Rafael' && password === 'enzo1234') {
      onLogin();
    } else {
      setError('Credenciais inválidas. Use Rafael / enzo1234');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center p-6 selection:bg-[#A32121]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -right-24 w-96 h-96 bg-[#A32121]/5 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-1/4 -left-24 w-96 h-96 bg-[#A32121]/5 rounded-full blur-[100px]"></div>
      </div>

      <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-[#A32121] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-red-900/40">
            <Wrench size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Kaen<span className="text-[#A32121]">pro</span></h1>
          <p className="text-zinc-500 mt-2">Sistema Interno de Gestão</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] shadow-2xl relative">
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-xl font-bold">Acesso Restrito</h2>
              <p className="text-sm text-zinc-500">Insira suas credenciais para acessar o painel</p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-xs p-3 rounded-xl text-center font-bold">
                {error}
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Usuário</label>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-[#A32121]/50 focus:border-[#A32121] transition-all" 
                  placeholder="Seu usuário"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Senha</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-[#A32121]/50 focus:border-[#A32121] transition-all" 
                    placeholder="••••••••"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between px-1">
                <label className="flex items-center space-x-2 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 rounded border-zinc-800 bg-zinc-950 text-[#A32121] focus:ring-[#A32121]" defaultChecked />
                  <span className="text-xs text-zinc-500 group-hover:text-zinc-300 transition-colors">Lembrar acesso</span>
                </label>
                <a href="#" className="text-xs font-bold text-[#A32121] hover:underline">Esqueci minha senha</a>
              </div>

              <button 
                type="submit"
                className="w-full bg-[#A32121] py-4 rounded-2xl font-bold hover:bg-[#8B1A1A] transition-all transform active:scale-[0.98] shadow-lg shadow-red-900/20 flex items-center justify-center space-x-2 group"
              >
                <span>Acessar Sistema</span>
                <Lock size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-[10px] text-zinc-600 mt-12 uppercase tracking-[0.2em]">
          © 2024 Kaenpro Management Suite • V 2.1.0
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
