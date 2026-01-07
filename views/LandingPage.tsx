
import React, { useState } from 'react';
import { 
  Wrench, 
  ShieldCheck, 
  Clock, 
  Award, 
  MapPin, 
  Phone, 
  MessageCircle,
  Menu,
  X,
  Lock,
  ArrowRight
} from 'lucide-react';

interface LandingPageProps {
  onLogin: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLogin }) => {
  const [showLogin, setShowLogin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const services = [
    { title: 'Revisão Completa', icon: ShieldCheck, desc: 'Checkup preventivo em mais de 50 itens do seu veículo.' },
    { title: 'Troca de Óleo', icon: Clock, desc: 'Óleos sintéticos e minerais das melhores marcas do mercado.' },
    { title: 'Diagnóstico por Scanner', icon: Wrench, desc: 'Identificação precisa de falhas eletrônicas com tecnologia de ponta.' },
    { title: 'Sistema de Freios', icon: Award, desc: 'Segurança total com revisão de pastilhas, discos e fluídos.' },
  ];

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white selection:bg-[#A32121]">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#0B0B0B]/80 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-[#A32121] rounded flex items-center justify-center">
              <Wrench size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold">Kaen<span className="text-[#A32121]">pro</span></span>
          </div>

          <div className="hidden md:flex items-center space-x-8 text-sm font-medium">
            <a href="#services" className="text-zinc-400 hover:text-white transition-colors">Serviços</a>
            <a href="#about" className="text-zinc-400 hover:text-white transition-colors">Diferenciais</a>
            <a href="#contact" className="text-zinc-400 hover:text-white transition-colors">Localização</a>
            <button 
              onClick={() => setShowLogin(true)}
              className="bg-zinc-900 border border-zinc-800 px-5 py-2.5 rounded-full hover:border-[#A32121] transition-all flex items-center space-x-2"
            >
              <Lock size={16} />
              <span>Acesso Sistema</span>
            </button>
          </div>

          <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#A32121]/10 rounded-full blur-[100px]"></div>
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-[#A32121] font-semibold tracking-widest uppercase text-sm mb-4 block">Mecânica Especializada</span>
            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6">
              O cuidado que seu carro <span className="text-zinc-500">merece.</span>
            </h1>
            <p className="text-lg text-zinc-400 mb-8 max-w-lg">
              Oferecemos serviços de alta performance para veículos nacionais e importados com tecnologia de diagnóstico avançada e equipe altamente qualificada.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <a 
                href="https://wa.me/5511999999999" 
                target="_blank" 
                className="bg-[#A32121] hover:bg-[#8B1A1A] px-8 py-4 rounded-xl font-bold flex items-center justify-center space-x-3 transition-transform active:scale-95"
              >
                <MessageCircle size={20} />
                <span>Agendar pelo WhatsApp</span>
              </a>
              <a 
                href="#services" 
                className="bg-zinc-900 border border-zinc-800 px-8 py-4 rounded-xl font-bold flex items-center justify-center hover:bg-zinc-800 transition-all"
              >
                Ver Serviços
              </a>
            </div>
          </div>
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1486006396113-c7b36766558b?q=80&w=1200&auto=format&fit=crop" 
              alt="Mecânico trabalhando" 
              className="rounded-3xl shadow-2xl border border-zinc-800"
            />
            <div className="absolute -bottom-6 -left-6 bg-[#0B0B0B] p-6 border border-zinc-800 rounded-2xl hidden lg:block">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <p className="text-sm font-bold">Peças Genuínas</p>
                  <p className="text-xs text-zinc-500">Garantia total de serviço</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section id="services" className="py-24 px-6 bg-zinc-950/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Nossos Serviços</h2>
            <p className="text-zinc-500 max-w-2xl mx-auto">Manutenção preventiva e corretiva para todas as marcas e modelos.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((s, idx) => (
              <div key={idx} className="p-8 bg-zinc-900 border border-zinc-800 rounded-2xl hover:border-[#A32121]/50 transition-all group">
                <div className="w-12 h-12 bg-[#A32121]/10 text-[#A32121] rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#A32121] group-hover:text-white transition-colors">
                  <s.icon size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">{s.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Us */}
      <section id="about" className="py-24 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1 grid grid-cols-2 gap-4">
            <div className="bg-[#A32121]/20 h-40 rounded-2xl flex items-center justify-center flex-col p-4 text-center">
              <span className="text-4xl font-black block mb-2 text-[#A32121]">15+</span>
              <span className="text-xs text-zinc-400 font-bold uppercase tracking-widest">Anos de Mercado</span>
            </div>
            <div className="bg-zinc-900 h-40 rounded-2xl mt-12 flex items-center justify-center flex-col p-4 text-center">
              <span className="text-4xl font-black block mb-2">5k+</span>
              <span className="text-xs text-zinc-400 font-bold uppercase tracking-widest">Carros Atendidos</span>
            </div>
            <div className="bg-zinc-900 h-40 rounded-2xl flex items-center justify-center flex-col p-4 text-center">
              <span className="text-4xl font-black block mb-2">99%</span>
              <span className="text-xs text-zinc-400 font-bold uppercase tracking-widest">Satisfação</span>
            </div>
            <div className="bg-[#A32121]/20 h-40 rounded-2xl mt-12 flex items-center justify-center flex-col p-4 text-center">
              <span className="text-4xl font-black block mb-2 text-[#A32121]">100%</span>
              <span className="text-xs text-zinc-400 font-bold uppercase tracking-widest">Garantia</span>
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-4xl font-bold mb-6">Por que escolher a <span className="text-[#A32121]">Kaenpro?</span></h2>
            <div className="space-y-6">
              {[
                { t: 'Transparência Total', d: 'Enviamos fotos e vídeos das peças trocadas diretamente no seu WhatsApp.' },
                { t: 'Preço Justo', d: 'Orçamentos detalhados sem taxas escondidas e com as melhores peças do mercado.' },
                { t: 'Equipe Certificada', d: 'Técnicos especialistas treinados pelas principais montadoras.' }
              ].map((item, i) => (
                <div key={i} className="flex space-x-4">
                  <div className="mt-1 flex-shrink-0 w-5 h-5 bg-[#A32121] rounded-full flex items-center justify-center">
                    <ArrowRight size={12} />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">{item.t}</h4>
                    <p className="text-zinc-500 text-sm">{item.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="py-20 px-6 border-t border-zinc-800 bg-zinc-950">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
          <div className="col-span-2">
             <div className="flex items-center space-x-2 mb-6">
              <div className="w-8 h-8 bg-[#A32121] rounded flex items-center justify-center">
                <Wrench size={18} className="text-white" />
              </div>
              <span className="text-xl font-bold">Kaen<span className="text-[#A32121]">pro</span></span>
            </div>
            <p className="text-zinc-500 mb-8 max-w-sm">
              Sua oficina de confiança para revisões premium e mecânica de precisão.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="p-3 bg-zinc-900 rounded-full hover:bg-[#A32121] transition-colors"><Phone size={18} /></a>
              <a href="#" className="p-3 bg-zinc-900 rounded-full hover:bg-[#A32121] transition-colors"><MapPin size={18} /></a>
              <a href="#" className="p-3 bg-zinc-900 rounded-full hover:bg-[#A32121] transition-colors"><MessageCircle size={18} /></a>
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-6">Contato</h4>
            <ul className="space-y-4 text-zinc-500 text-sm">
              <li>Rua dos Motores, 1234</li>
              <li>São Paulo - SP</li>
              <li>contato@kaenpro.com</li>
              <li>(11) 99999-9999</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6">Horários</h4>
            <ul className="space-y-4 text-zinc-500 text-sm">
              <li>Seg - Sex: 08h às 18h</li>
              <li>Sábado: 08h às 13h</li>
              <li>Domingo: Fechado</li>
            </ul>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <a 
        href="https://wa.me/5511999999999" 
        target="_blank"
        className="fixed bottom-8 right-8 w-16 h-16 bg-[#25D366] rounded-full flex items-center justify-center shadow-2xl z-50 animate-bounce hover:scale-110 transition-transform"
      >
        <MessageCircle size={32} />
      </a>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md p-8 rounded-3xl shadow-2xl relative">
            <button 
              onClick={() => setShowLogin(false)}
              className="absolute top-6 right-6 text-zinc-500 hover:text-white"
            >
              <X size={24} />
            </button>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-[#A32121] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Lock size={32} />
              </div>
              <h3 className="text-2xl font-bold">Acesso Restrito</h3>
              <p className="text-zinc-500">Faça login para gerenciar a oficina</p>
            </div>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onLogin(); }}>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1.5 pl-1">E-mail</label>
                <input 
                  type="email" 
                  defaultValue="admin@kaenpro.com"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#A32121]" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1.5 pl-1">Senha</label>
                <input 
                  type="password" 
                  defaultValue="123456"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#A32121]" 
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-[#A32121] py-4 rounded-xl font-bold hover:bg-[#8B1A1A] transition-colors mt-4"
              >
                Entrar no Painel
              </button>
              <p className="text-center text-xs text-zinc-500 mt-6">
                Kaenpro Dashboard - Todos os direitos reservados
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
