import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { ViewState, QuizAnswers, Lesson, GuideStep } from "./types";
import { SOS_TIPS, HEALING_TIPS, VISUAL_GUIDE_STEPS, LESSONS } from "./constants";
import { generatePersonalizedPlan, generateSOSAudio } from "./services/geminiService";

// --- Error Boundary ---
interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-center min-h-screen flex flex-col items-center justify-center bg-red-50 text-red-800">
          <h1 className="text-2xl font-bold mb-4">Ops! Algo deu errado.</h1>
          <p className="mb-4">Por favor, recarregue a página.</p>
          <pre className="text-xs bg-white p-4 rounded border border-red-200 text-left overflow-auto max-w-full">
            {this.state.error?.toString()}
          </pre>
          <button 
            onClick={() => window.location.reload()}
            className="mt-6 bg-red-500 text-white px-6 py-3 rounded-xl font-bold"
          >
            Recarregar Aplicativo
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// --- Components ---

const Icons = {
  Home: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
  ),
  SOS: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
  ),
  Guide: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
  ),
  Healing: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.28 3.6-1.28 5.09 0 1.49 1.28 1.49 3.36 0 4.63-1.49 1.28-3.6 1.28-5.09 0-1.49-1.28-1.49-3.36 0-4.63z"/><path d="M24 12v-2"/><path d="M12 14c1.49-1.28 3.6-1.28 5.09 0 1.49 1.28 1.49 3.36 0 4.63-1.49 1.28-3.6 1.28-5.09 0-1.49-1.28-1.49-3.36 0-4.63z"/><path d="M17 12v-2"/><path d="M5 14c1.49-1.28 3.6-1.28 5.09 0 1.49 1.28 1.49 3.36 0 4.63-1.49 1.28-3.6 1.28-5.09 0-1.49-1.28-1.49-3.36 0-4.63z"/><path d="M10 12V2"/><path d="M7 2a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/></svg>
  ),
  Lessons: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z"/><path d="M9 21h6"/></svg>
  ),
  Plan: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="m9 14 2 2 4-4"/></svg>
  ),
  Play: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
  ),
  Volume2: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
  ),
  Clock: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
  )
};

// --- Views ---

const HomeView = ({ onNavigate }: { onNavigate: (view: ViewState) => void }) => (
  <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center space-y-8">
    <div className="animate-breathe bg-rose-200 p-8 rounded-full">
      <Icons.Healing />
    </div>
    <h1 className="text-3xl font-bold text-rose-800">Amama</h1>
    <p className="text-lg text-rose-700">Apoio, carinho e informação para sua jornada de amamentação.</p>
    
    <div className="grid grid-cols-2 gap-4 w-full mt-4">
      <button 
        onClick={() => onNavigate('SOS')}
        className="bg-red-400 text-white p-4 rounded-xl shadow-lg hover:bg-red-500 transition flex flex-col items-center justify-center gap-2"
      >
        <Icons.SOS />
        <span className="font-bold">SOS Dor</span>
      </button>
      <button 
        onClick={() => onNavigate('TIMER')}
        className="bg-rose-400 text-white p-4 rounded-xl shadow-lg hover:bg-rose-500 transition flex flex-col items-center justify-center gap-2"
      >
        <Icons.Clock />
        <span className="font-bold">Cronômetro</span>
      </button>
    </div>
    
    <button 
      onClick={() => onNavigate('PLAN')}
      className="w-full bg-white border-2 border-rose-200 text-rose-600 p-4 rounded-xl shadow-sm hover:bg-rose-50 transition flex items-center justify-center gap-2 font-bold"
    >
      <Icons.Plan />
      Meu Plano Personalizado
    </button>
  </div>
);

const SOSView = () => {
  const [loadingAudio, setLoadingAudio] = useState(false);

  const handlePlayAudio = async () => {
    setLoadingAudio(true);
    const audioData = await generateSOSAudio();
    setLoadingAudio(false);
    
    if (audioData) {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const audioBuffer = await audioContext.decodeAudioData(audioData);
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start(0);
    }
  };

  return (
    <div className="p-6 space-y-6 pb-24">
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center space-y-4">
        <h2 className="text-2xl font-bold text-red-700 flex items-center justify-center gap-2">
          <Icons.SOS /> SOS Imediato
        </h2>
        <p className="text-red-600">Respire fundo. Não tome decisões difíceis com dor.</p>
        <button 
          onClick={handlePlayAudio}
          disabled={loadingAudio}
          className="w-full bg-white border border-red-200 text-red-600 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-50 transition"
        >
          {loadingAudio ? (
            <span className="animate-pulse">Gerando áudio...</span>
          ) : (
            <>
              <Icons.Volume2 /> Ouvir mensagem de calma
            </>
          )}
        </button>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-rose-800 text-xl">Dicas Rápidas</h3>
        {SOS_TIPS.map((tip, idx) => (
          <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-red-400">
            <h4 className="font-bold text-rose-700 mb-1">{tip.title}</h4>
            <p className="text-gray-600 text-sm">{tip.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const GuideView = () => (
  <div className="p-6 pb-24 space-y-6">
    <h2 className="text-2xl font-bold text-rose-800 mb-4">Guia Visual da Pega</h2>
    <div className="space-y-6">
      {VISUAL_GUIDE_STEPS.map((step, idx) => (
        <div key={idx} className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {step.imageUrl && (
            <img src={step.imageUrl} alt={step.title} className="w-full h-48 object-cover" />
          )}
          <div className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-rose-100 text-rose-600 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">
                {idx + 1}
              </span>
              <h3 className="font-bold text-gray-800">{step.title}</h3>
            </div>
            <p className="text-gray-600 text-sm">{step.description}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const HealingView = () => (
  <div className="p-6 pb-24 space-y-6">
    <h2 className="text-2xl font-bold text-rose-800 mb-4">Cuidados & Cura</h2>
    <div className="grid gap-4">
      {HEALING_TIPS.map((tip, idx) => (
        <div key={idx} className="bg-rose-50 p-5 rounded-2xl border border-rose-100">
          <h3 className="font-bold text-rose-700 mb-2">{tip.title}</h3>
          <p className="text-gray-700 text-sm leading-relaxed">{tip.content}</p>
        </div>
      ))}
    </div>
  </div>
);

const LessonsView = () => (
  <div className="p-6 pb-24 space-y-6">
    <h2 className="text-2xl font-bold text-rose-800 mb-4">Miniaulas</h2>
    <div className="space-y-4">
      {LESSONS.map((lesson) => (
        <div key={lesson.id} className="bg-white p-5 rounded-xl shadow-sm border border-rose-50 hover:shadow-md transition">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-gray-800 text-lg">{lesson.title}</h3>
            <span className="text-xs font-semibold bg-rose-100 text-rose-600 px-2 py-1 rounded-full">
              {lesson.duration}
            </span>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">{lesson.content}</p>
        </div>
      ))}
    </div>
  </div>
);

const PlanView = ({ answers, setAnswers, plan, setPlan }: { 
  answers: QuizAnswers, 
  setAnswers: (a: QuizAnswers) => void,
  plan: string | null,
  setPlan: (p: string) => void
}) => {
  const [step, setStep] = useState(plan ? 'RESULT' : 'QUIZ');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    const result = await generatePersonalizedPlan(answers);
    setPlan(result);
    setLoading(false);
    setStep('RESULT');
  };

  if (step === 'RESULT' && plan) {
    return (
      <div className="p-6 pb-24 space-y-6">
        <h2 className="text-2xl font-bold text-rose-800">Seu Plano de Apoio</h2>
        <div className="bg-white p-6 rounded-2xl shadow-sm prose prose-rose max-w-none">
          <div className="whitespace-pre-wrap text-gray-700 font-medium">
            {plan}
          </div>
        </div>
        <button 
          onClick={() => setStep('QUIZ')}
          className="w-full text-rose-500 font-semibold py-3"
        >
          Refazer avaliação
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 pb-24 space-y-6">
      <h2 className="text-2xl font-bold text-rose-800">Avaliação Rápida</h2>
      <p className="text-gray-600">Responda para receber uma orientação personalizada da nossa IA especialista.</p>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Nível de Dor (0 a 10)</label>
          <input 
            type="range" min="0" max="10" 
            value={answers.painLevel}
            onChange={(e) => setAnswers({...answers, painLevel: parseInt(e.target.value)})}
            className="w-full accent-rose-500"
          />
          <div className="text-center font-bold text-rose-600">{answers.painLevel}</div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Tipo de Dor</label>
          <select 
            value={answers.painType}
            onChange={(e) => setAnswers({...answers, painType: e.target.value})}
            className="w-full p-3 rounded-lg border border-rose-200 bg-white"
          >
            <option value="Ardência">Ardência / Queimação</option>
            <option value="Pontada">Pontada / Agulhada</option>
            <option value="Dor no bico">Dor só no bico</option>
            <option value="Dor na mama toda">Dor na mama toda</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Estado do Mamilo</label>
          <select 
            value={answers.nippleCondition}
            onChange={(e) => setAnswers({...answers, nippleCondition: e.target.value})}
            className="w-full p-3 rounded-lg border border-rose-200 bg-white"
          >
            <option value="Normal">Aparentemente normal</option>
            <option value="Vermelho">Vermelho / Irritado</option>
            <option value="Rachado">Rachado / Com fissura</option>
            <option value="Sangrando">Sangrando</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Como você se sente?</label>
          <select 
            value={answers.emotion}
            onChange={(e) => setAnswers({...answers, emotion: e.target.value})}
            className="w-full p-3 rounded-lg border border-rose-200 bg-white"
          >
            <option value="Cansada">Apenas cansada</option>
            <option value="Ansiosa">Ansiosa / Preocupada</option>
            <option value="Triste">Triste / Desanimada</option>
            <option value="Com medo">Com medo da próxima mamada</option>
          </select>
        </div>

        <button 
          onClick={handleGenerate}
          disabled={loading}
          className="w-full bg-rose-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-rose-600 transition disabled:opacity-50 mt-4"
        >
          {loading ? "Analisando..." : "Gerar Meu Plano"}
        </button>
      </div>
    </div>
  );
};

const TimerView = ({ 
  timeL, 
  timeR, 
  activeSide, 
  onToggle, 
  onReset 
}: { 
  timeL: number, 
  timeR: number, 
  activeSide: 'left' | 'right' | null, 
  onToggle: (side: 'left' | 'right') => void,
  onReset: () => void
}) => {
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="p-6 pb-24 flex flex-col items-center justify-center min-h-[70vh] space-y-8">
      <h2 className="text-2xl font-bold text-rose-800 flex items-center gap-2">
        <Icons.Clock /> Cronômetro de Mamada
      </h2>

      <div className="flex gap-4 w-full justify-center">
        {/* Mama Esquerda */}
        <button
          onClick={() => onToggle('left')}
          className={`relative w-40 h-40 rounded-full flex flex-col items-center justify-center shadow-xl transition-all duration-300 ${
            activeSide === 'left' 
              ? 'bg-rose-500 text-white scale-110 ring-4 ring-rose-200' 
              : 'bg-white text-rose-800 border-2 border-rose-100 hover:border-rose-300'
          }`}
        >
          <span className="text-sm font-bold uppercase tracking-wider mb-1">Esquerda</span>
          <span className="text-3xl font-mono font-bold">{formatTime(timeL)}</span>
          {activeSide === 'left' && (
             <span className="absolute -bottom-2 bg-white text-rose-500 text-xs px-2 py-1 rounded-full animate-pulse font-bold">
               MAMANDO
             </span>
          )}
        </button>

        {/* Mama Direita */}
        <button
          onClick={() => onToggle('right')}
          className={`relative w-40 h-40 rounded-full flex flex-col items-center justify-center shadow-xl transition-all duration-300 ${
            activeSide === 'right' 
              ? 'bg-rose-500 text-white scale-110 ring-4 ring-rose-200' 
              : 'bg-white text-rose-800 border-2 border-rose-100 hover:border-rose-300'
          }`}
        >
          <span className="text-sm font-bold uppercase tracking-wider mb-1">Direita</span>
          <span className="text-3xl font-mono font-bold">{formatTime(timeR)}</span>
          {activeSide === 'right' && (
             <span className="absolute -bottom-2 bg-white text-rose-500 text-xs px-2 py-1 rounded-full animate-pulse font-bold">
               MAMANDO
             </span>
          )}
        </button>
      </div>

      <div className="bg-rose-50 px-6 py-4 rounded-xl text-center w-full max-w-sm">
        <p className="text-rose-800 font-bold mb-1">Tempo Total</p>
        <p className="text-4xl font-mono text-rose-600">{formatTime(timeL + timeR)}</p>
      </div>

      <div className="flex gap-4">
        {activeSide && (
          <button 
            onClick={() => onToggle(activeSide)} 
            className="bg-gray-100 text-gray-600 px-6 py-3 rounded-full font-bold hover:bg-gray-200"
          >
            Pausar
          </button>
        )}
        <button 
          onClick={onReset}
          className="text-red-400 font-bold px-6 py-3 rounded-full hover:bg-red-50 transition"
        >
          Reiniciar
        </button>
      </div>
    </div>
  );
};

// --- Main App & Navigation ---

const BottomNav = ({ currentView, onViewChange }: { currentView: ViewState, onViewChange: (v: ViewState) => void }) => {
  const navItems: { id: ViewState, label: string, icon: React.FC }[] = [
    { id: 'HOME', label: 'Home', icon: Icons.Home },
    { id: 'SOS', label: 'SOS', icon: Icons.SOS },
    { id: 'GUIDE', label: 'Guia', icon: Icons.Guide },
    { id: 'HEALING', label: 'Cuidados', icon: Icons.Healing },
    { id: 'LESSONS', label: 'Lições', icon: Icons.Lessons },
    { id: 'PLAN', label: 'Plano', icon: Icons.Plan },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-rose-100 pb-safe safe-area-inset-bottom z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <div className="flex justify-between items-center px-2 py-2 max-w-lg mx-auto overflow-x-auto">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`flex flex-col items-center justify-center min-w-[60px] p-2 transition-colors duration-200 ${
                isActive ? 'text-rose-600' : 'text-gray-400 hover:text-rose-400'
              }`}
            >
              <div className={`mb-1 ${isActive ? 'scale-110' : ''} transition-transform`}>
                <Icon />
              </div>
              <span className="text-[10px] font-bold tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

const App = () => {
  const [view, setView] = useState<ViewState>('HOME');
  
  // Quiz State
  const [answers, setAnswers] = useState<QuizAnswers>({
    painLevel: 5,
    painType: 'Ardência',
    nippleCondition: 'Normal',
    emotion: 'Cansada'
  });
  const [plan, setPlan] = useState<string | null>(null);

  // Timer State (Lifted up to persist across views)
  const [timerLeft, setTimerLeft] = useState(0);
  const [timerRight, setTimerRight] = useState(0);
  const [activeSide, setActiveSide] = useState<'left' | 'right' | null>(null);

  useEffect(() => {
    let interval: any;
    if (activeSide) {
      interval = setInterval(() => {
        if (activeSide === 'left') {
          setTimerLeft(t => t + 1);
        } else {
          setTimerRight(t => t + 1);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeSide]);

  const handleToggleTimer = (side: 'left' | 'right') => {
    if (activeSide === side) {
      setActiveSide(null); // Pause
    } else {
      setActiveSide(side); // Switch or Start
    }
  };

  const handleResetTimer = () => {
    setActiveSide(null);
    setTimerLeft(0);
    setTimerRight(0);
  };

  const renderView = () => {
    switch (view) {
      case 'HOME': return <HomeView onNavigate={setView} />;
      case 'SOS': return <SOSView />;
      case 'GUIDE': return <GuideView />;
      case 'HEALING': return <HealingView />;
      case 'LESSONS': return <LessonsView />;
      case 'PLAN': return <PlanView answers={answers} setAnswers={setAnswers} plan={plan} setPlan={setPlan} />;
      case 'TIMER': return (
        <TimerView 
          timeL={timerLeft} 
          timeR={timerRight} 
          activeSide={activeSide} 
          onToggle={handleToggleTimer}
          onReset={handleResetTimer}
        />
      );
      default: return <HomeView onNavigate={setView} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF1F2] text-gray-800 font-sans">
      <header className="fixed top-0 w-full bg-[#FFF1F2]/90 backdrop-blur-sm z-40 p-4 flex justify-between items-center border-b border-rose-100 lg:hidden px-6">
        <h1 className="font-bold text-rose-800 text-lg">Amama</h1>
        {activeSide && (
          <button onClick={() => setView('TIMER')} className="text-xs bg-rose-500 text-white px-2 py-1 rounded-full animate-pulse">
            Cronômetro Ativo
          </button>
        )}
      </header>
      
      <main className="pt-16 pb-20 max-w-lg mx-auto min-h-screen">
        {renderView()}
      </main>

      <BottomNav currentView={view} onViewChange={setView} />
    </div>
  );
};

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);