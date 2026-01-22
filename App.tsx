
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Enrollment from './components/Enrollment';
import LiveAnalysis from './components/LiveAnalysis';
import { Student } from './types';

const App: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [hasKey, setHasKey] = useState<boolean | null>(null);

  useEffect(() => {
    checkApiKey();
  }, []);

  const checkApiKey = async () => {
    const aistudio = (window as any).aistudio;
    if (aistudio && typeof aistudio.hasSelectedApiKey === 'function') {
      const selected = await aistudio.hasSelectedApiKey();
      setHasKey(selected);
    } else {
      setHasKey(true); // Dev mode yoki boshqa muhit
    }
  };

  const handleOpenKeyPicker = async () => {
    const aistudio = (window as any).aistudio;
    if (aistudio && typeof aistudio.openSelectKey === 'function') {
      await aistudio.openSelectKey();
      // Ko'rsatmalarga ko'ra, openSelectKey'dan so'ng darhol davom etamiz
      setHasKey(true);
    }
  };

  const updateStudents = (updated: Student[]) => {
    setStudents(updated);
  };

  const addStudent = (newS: Student) => {
    setStudents(prev => [...prev, newS]);
  };

  if (hasKey === false) {
    return (
      <div className="min-h-screen bg-[#0a0f14] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md bg-white rounded-[48px] p-12 shadow-2xl border border-slate-100">
          <div className="w-24 h-24 bg-orange-50 text-orange-600 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-inner">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">API Kalit Zarur</h2>
          <p className="text-gray-500 font-medium mb-10 leading-relaxed">
            Gemini 3 modelidan foydalanish uchun to'lov qilingan loyiha API kalitini tanlang. Busiz darsni tahlil qilib bo'lmaydi.
          </p>
          <button 
            onClick={handleOpenKeyPicker}
            className="w-full py-6 bg-[#11212d] text-white rounded-full font-black text-lg hover:bg-orange-600 transition-all shadow-xl active:scale-95"
          >
            KALITNI TANLASH
          </button>
          <p className="mt-6">
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-xs font-bold text-slate-400 underline hover:text-slate-600">Billing va hujjatlar</a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <HashRouter>
      <div className="min-h-screen relative overflow-hidden bg-[#f8fafc]">
        {/* Background elements */}
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none opacity-20">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-200 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-200 rounded-full blur-[120px]"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
          <header className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-[#11212d] flex items-center justify-center text-white shadow-xl">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-black text-[#11212d]">Smart AI Camera</h1>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Analytics Dashboard</p>
              </div>
            </div>

            <nav className="flex items-center p-1 bg-white rounded-full border border-slate-200 shadow-sm">
              <Link to="/" className="px-5 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all hover:bg-slate-50">Dashboard</Link>
              <Link to="/enroll" className="px-5 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all hover:bg-slate-50">Ro'yxatga olish</Link>
              <Link to="/live" className="px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-wider bg-[#11212d] text-white shadow-lg hover:bg-orange-600 transition-all">Monitoring</Link>
            </nav>
          </header>

          <main>
            <Routes>
              <Route path="/" element={<Dashboard students={students} />} />
              <Route path="/enroll" element={<Enrollment onAdd={addStudent} />} />
              <Route path="/live" element={<LiveAnalysis allStudents={students} onUpdate={updateStudents} />} />
            </Routes>
          </main>
        </div>
      </div>
    </HashRouter>
  );
};

export default App;
