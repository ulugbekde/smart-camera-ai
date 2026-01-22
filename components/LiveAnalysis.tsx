
import React, { useRef, useState, useEffect } from 'react';
import { analyzeClassroom } from '../services/geminiService';
import { Student, StudentTone, BoundingBox } from '../types';
import { Link } from 'react-router-dom';

interface LiveAnalysisProps {
  allStudents: Student[];
  onUpdate: (updatedStudents: Student[]) => void;
}

interface DetectedFace {
  fullName: string;
  box: BoundingBox;
  tone: StudentTone;
}

const LiveAnalysis: React.FC<LiveAnalysisProps> = ({ allStudents, onUpdate }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLive, setIsLive] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [detectedFaces, setDetectedFaces] = useState<DetectedFace[]>([]);
  const [log, setLog] = useState<{msg: string, time: string, type?: 'match' | 'info' | 'error'}[]>([]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      console.error("Camera access denied:", err);
      setErrorStatus("Kamera ruxsati rad etildi.");
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (videoRef.current?.srcObject) (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
    };
  }, []);

  const handleUpdateKey = async () => {
    const aistudio = (window as any).aistudio;
    if (aistudio && typeof aistudio.openSelectKey === 'function') {
      await aistudio.openSelectKey();
      setErrorStatus(null);
      setLog(prev => [{ msg: "API kaliti yangilandi. Qayta urinib ko'ring.", time: new Date().toLocaleTimeString(), type: 'info' }, ...prev].slice(0, 15));
    }
  };

  const runAnalysis = async () => {
    if (!videoRef.current || !canvasRef.current || allStudents.length === 0 || analyzing) return;

    setAnalyzing(true);
    setErrorStatus(null);
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setAnalyzing(false);
      return;
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const base64Image = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];

    try {
      const result = await analyzeClassroom(base64Image, allStudents);

      if (!result || !result.results) throw new Error("API javobi xato.");

      const faces: DetectedFace[] = result.results
        .filter(r => r.box)
        .map(r => ({
          fullName: r.fullName,
          box: r.box!,
          tone: r.tone as StudentTone
        }));
      
      setDetectedFaces(faces);

      const updated = allStudents.map(student => {
        const found = result.results.find(r => 
          r.fullName.toLowerCase().trim() === student.fullName.toLowerCase().trim() ||
          r.fullName.toLowerCase().includes(student.fullName.toLowerCase())
        );
        
        const newTone: StudentTone = found ? (found.tone as StudentTone) : 'not_present';
        const newStep = {
          index: student.timeline.length + 1,
          tone: newTone,
          label: found ? found.explanation : "O'quvchi ko'rinmadi",
          timestamp: new Date().toLocaleTimeString(),
          confidence: found?.confidence || 0
        };

        const newTimeline = [...student.timeline, newStep].slice(-20);
        const total = newTimeline.length || 1;
        const getPct = (tone: StudentTone) => Math.round((newTimeline.filter(t => t.tone === tone).length / total) * 100);

        return {
          ...student,
          currentStatus: newTone,
          timeline: newTimeline,
          activePct: getPct('active'),
          attentivePct: getPct('attentive'),
          inactivePct: getPct('inactive'),
          notPresentPct: getPct('not_present'),
          lastSeen: found ? new Date().toLocaleTimeString() : student.lastSeen
        };
      });

      onUpdate(updated);
      
      setLog(prev => [
        {
          msg: `Tahlil yakunlandi: ${result.results.length} ta yuz topildi.`, 
          time: new Date().toLocaleTimeString(),
          type: 'match'
        }, 
        ...prev
      ].slice(0, 15));
    } catch (err: any) {
      console.error("Analysis loop error:", err);
      let errorMsg = "Tizimda xatolik yuz berdi.";
      
      if (err.message?.includes("API Key must be set") || err.message?.includes("401")) {
        errorMsg = "API kaliti noto'g'ri yoki ruxsat etilmagan (401).";
        setIsLive(false); // Avtomatik to'xtatamiz
      }
      
      setErrorStatus(errorMsg);
      setLog(prev => [{ msg: errorMsg, time: new Date().toLocaleTimeString(), type: 'error' }, ...prev].slice(0, 15));
    } finally {
      // Bu qat'iy ravishda loadingni tugatadi
      setAnalyzing(false);
    }
  };

  useEffect(() => {
    let interval: number;
    if (isLive && allStudents.length > 0) {
      interval = window.setInterval(runAnalysis, 12000); 
    }
    return () => {
      clearInterval(interval);
      setDetectedFaces([]);
      setAnalyzing(false);
    };
  }, [isLive, allStudents]);

  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in duration-700">
      <div className="flex-1 space-y-6">
        <div className="relative rounded-[40px] overflow-hidden border-8 border-white shadow-2xl bg-[#0a0f14] aspect-video group">
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
          <canvas ref={canvasRef} className="hidden" />
          
          {isLive && (
            <div className="absolute inset-0 pointer-events-none">
              {detectedFaces.map((face, idx) => (
                <div 
                  key={idx}
                  className={`absolute border-2 transition-all duration-700 ${getBoxColor(face.tone)}`}
                  style={{
                    top: `${face.box.ymin / 10}%`,
                    left: `${face.box.xmin / 10}%`,
                    width: `${(face.box.xmax - face.box.xmin) / 10}%`,
                    height: `${(face.box.ymax - face.box.ymin) / 10}%`
                  }}
                >
                  <div className={`absolute -top-7 left-0 px-2 py-0.5 whitespace-nowrap text-[9px] font-black uppercase rounded ${getLabelBg(face.tone)} text-white flex items-center gap-1.5`}>
                     {face.fullName}
                  </div>
                </div>
              ))}
              <div className={`absolute left-0 right-0 h-[1px] bg-teal-400/40 shadow-[0_0_15px_#2dd4bf] opacity-80 ${analyzing ? 'animate-[bounce_4s_infinite]' : 'top-1/2 -translate-y-1/2 opacity-10'}`}></div>
            </div>
          )}

          {analyzing && (
            <div className="absolute inset-0 bg-teal-950/20 backdrop-blur-[2px] flex items-center justify-center">
              <div className="bg-[#11212d]/90 text-white px-8 py-5 rounded-[32px] shadow-2xl flex items-center gap-4 animate-in zoom-in-95 border border-white/10">
                <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                <div className="flex flex-col">
                  <span className="font-black text-[11px] uppercase tracking-widest leading-none">AI Tahlil qilmoqda</span>
                  <span className="text-[9px] text-slate-400 font-bold uppercase mt-1 tracking-tight">Kutib turing...</span>
                </div>
              </div>
            </div>
          )}

          {errorStatus && (
            <div className="absolute inset-0 flex items-center justify-center p-8 bg-rose-950/40 backdrop-blur-sm">
               <div className="bg-white p-8 rounded-[40px] shadow-2xl max-w-sm text-center border-t-4 border-rose-500">
                  <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  </div>
                  <h4 className="text-xl font-black text-gray-900 mb-2">Xatolik Yuz Berdi</h4>
                  <p className="text-gray-500 text-sm font-medium mb-8 leading-relaxed">{errorStatus}</p>
                  
                  <div className="flex flex-col gap-3">
                    <button onClick={runAnalysis} className="w-full py-4 bg-[#11212d] text-white rounded-full font-black text-sm hover:bg-slate-800 transition-all">Qayta Urinish</button>
                    {errorStatus.includes("API") && (
                      <button onClick={handleUpdateKey} className="w-full py-4 bg-orange-500 text-white rounded-full font-black text-sm hover:bg-orange-600 transition-all">API Kalitni Yangilash</button>
                    )}
                  </div>
               </div>
            </div>
          )}

          {!isLive && !errorStatus && (
            <div className="absolute inset-0 bg-[#0a0f14]/90 backdrop-blur-xl flex items-center justify-center p-8 text-center">
              {allStudents.length > 0 ? (
                <div className="max-w-md animate-in slide-in-from-bottom-8 duration-700">
                  <div className="w-20 h-20 bg-teal-500/10 border border-teal-500/30 rounded-3xl flex items-center justify-center mx-auto mb-8">
                    <svg className="w-10 h-10 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  </div>
                  <h3 className="text-4xl font-black text-white mb-4 tracking-tight">AI Monitoring</h3>
                  <p className="text-slate-400 font-medium mb-10 text-lg">Hozirda {allStudents.length} ta o'quvchi bazada mavjud. Monitoring boshlanishiga tayyor.</p>
                  <button 
                    onClick={() => setIsLive(true)}
                    className="group bg-white text-[#0a0f14] px-12 py-5 rounded-full font-black text-lg shadow-2xl hover:bg-teal-400 transition-all active:scale-95"
                  >
                    START LIVE ENGINE
                  </button>
                </div>
              ) : (
                <div className="bg-white p-14 rounded-[48px] max-w-sm border border-slate-100 shadow-2xl">
                  <h3 className="text-3xl font-black text-gray-900 mb-4">Ma'lumotlar Yo'q</h3>
                  <p className="text-gray-500 font-medium mb-10 leading-relaxed">Analizni boshlash uchun avval o'quvchilarni yuz rasmlari bilan ro'yxatdan o'tkazing.</p>
                  <Link to="/enroll" className="inline-block px-10 py-5 bg-[#11212d] text-white rounded-full font-black shadow-xl hover:scale-105 transition-all">
                    O'quvchi Qo'shish
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-6">
           <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm flex items-center gap-6 group hover:border-teal-200 transition-all">
              <div className="w-14 h-14 bg-teal-50 rounded-[22px] flex items-center justify-center text-teal-600 transition-transform group-hover:scale-110">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Dars Davomati</p>
                <p className="text-3xl font-black text-gray-900">
                  {allStudents.filter(s => s.currentStatus !== 'not_present').length} <span className="text-slate-200 text-lg">/ {allStudents.length}</span>
                </p>
              </div>
           </div>
           <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm flex items-center gap-6 group hover:border-orange-200 transition-all">
              <div className="w-14 h-14 bg-orange-50 rounded-[22px] flex items-center justify-center text-orange-600 transition-transform group-hover:scale-110">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">System State</p>
                <p className={`text-3xl font-black ${isLive ? 'text-orange-500' : 'text-slate-200'}`}>
                  {isLive ? 'ACTIVE' : 'IDLE'}
                </p>
              </div>
           </div>
        </div>
      </div>

      <div className="w-full lg:w-[400px] space-y-6">
        <div className="bg-[#0a0f14] text-white p-10 rounded-[48px] h-[650px] flex flex-col shadow-2xl border border-white/5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-10 relative z-10">
            <h3 className="text-2xl font-black flex items-center gap-4">
              <div className={`w-3 h-3 rounded-full shadow-[0_0_15px] ${isLive ? 'bg-orange-500 shadow-orange-500 animate-pulse' : 'bg-slate-600 shadow-slate-600'}`}></div>
              Intelligence Log
            </h3>
            {isLive && (
               <button onClick={() => setIsLive(false)} className="text-[10px] font-black uppercase text-rose-400/60 hover:text-rose-400 transition-all tracking-widest bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                 Off
               </button>
            )}
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto pr-3 custom-scrollbar relative z-10">
            {log.length === 0 && <p className="text-slate-600 font-bold italic text-center py-24 text-[10px] uppercase tracking-[0.2em]">Awaiting Live Feed...</p>}
            
            {log.map((entry, i) => (
              <div key={i} className={`p-5 rounded-[24px] border transition-all animate-in slide-in-from-right-8 duration-500 ${
                entry.type === 'match' ? 'bg-teal-500/5 border-teal-500/20 shadow-[0_4px_12px_rgba(20,184,166,0.05)]' : 
                entry.type === 'error' ? 'bg-rose-500/5 border-rose-500/20' :
                'bg-white/5 border-white/5'
              }`}>
                <div className="flex justify-between items-center mb-3">
                  <span className={`text-[9px] font-black font-mono tracking-widest px-2 py-0.5 rounded bg-black/40 ${entry.type === 'match' ? 'text-teal-400' : entry.type === 'error' ? 'text-rose-400' : 'text-slate-500'}`}>{entry.time}</span>
                </div>
                <p className={`text-xs font-bold leading-relaxed font-mono ${entry.type === 'error' ? 'text-rose-400' : 'text-slate-200'}`}>{entry.msg}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-10 pt-8 border-t border-white/5 relative z-10">
            <div className="flex justify-between text-[11px] font-black uppercase tracking-widest mb-4 text-slate-500">
               <span>AI Engine Load</span>
               <span className="text-teal-400">{analyzing ? '85%' : '2%'}</span>
            </div>
            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
               <div className={`bg-gradient-to-r from-teal-500 to-emerald-500 h-full transition-all duration-1000 ${analyzing ? 'w-[85%]' : 'w-[2%]'}`}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function getBoxColor(tone: StudentTone): string {
  switch (tone) {
    case 'active': return 'border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.4)]';
    case 'attentive': return 'border-teal-500 shadow-[0_0_15px_rgba(20,184,166,0.4)]';
    case 'inactive': return 'border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.4)]';
    default: return 'border-slate-500/50';
  }
}

function getLabelBg(tone: StudentTone): string {
  switch (tone) {
    case 'active': return 'bg-orange-500';
    case 'attentive': return 'bg-teal-500';
    case 'inactive': return 'bg-rose-500';
    default: return 'bg-slate-600';
  }
}

export default LiveAnalysis;
