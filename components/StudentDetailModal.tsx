
import React from 'react';
import { Student, StudentTone } from '../types';

interface StudentDetailModalProps {
  student: Student;
  onClose: () => void;
}

const StudentDetailModal: React.FC<StudentDetailModalProps> = ({ student, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[40px] shadow-2xl p-10 animate-in zoom-in-95 duration-300">
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 p-3 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors text-gray-900 shadow-sm"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="mb-10">
          <h2 className="text-4xl font-black text-gray-900 mb-3 tracking-tight">{student.fullName}</h2>
          <div className="flex items-center gap-3 text-gray-600 font-bold uppercase text-xs tracking-widest">
             <span className="bg-slate-100 px-3 py-1 rounded-full border border-slate-200">{student.className} sinfi</span>
             <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
             <span>Dars faollik tahlili</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
          <DetailCard label="Faol" value={`${student.activePct}%`} color="text-orange-600" bgColor="bg-orange-50" borderColor="border-orange-100" />
          <DetailCard label="Diqqatli" value={`${student.attentivePct}%`} color="text-teal-600" bgColor="bg-teal-50" borderColor="border-teal-100" />
          <DetailCard label="Nofaol" value={`${student.inactivePct}%`} color="text-rose-600" bgColor="bg-rose-50" borderColor="border-rose-100" />
          <DetailCard label="Darsda emas" value={`${student.notPresentPct}%`} color="text-slate-600" bgColor="bg-slate-50" borderColor="border-slate-200" />
          <DetailCard label="Oxirgi tahlil" value={student.lastSeen} color="text-indigo-600" bgColor="bg-indigo-50" borderColor="border-indigo-100" />
        </div>

        <div className="bg-slate-50 border-2 border-slate-100 rounded-[32px] p-8 mb-10 shadow-inner">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <h3 className="text-xl font-black text-gray-900">Vaqt Chizig'i</h3>
            <div className="flex flex-wrap gap-5 text-xs font-black uppercase tracking-widest">
               <LegendItem color="bg-orange-500" label="Faol" />
               <LegendItem color="bg-teal-500" label="Diqqatli" />
               <LegendItem color="bg-rose-500" label="Nofaol" />
               <LegendItem color="bg-slate-300" label="Emas" />
            </div>
          </div>

          <div className="grid grid-cols-5 sm:grid-cols-10 gap-3">
            {student.timeline.map((step) => (
              <div 
                key={step.index}
                title={`${step.label} (${step.timestamp})`}
                className={`h-24 rounded-2xl flex flex-col items-center justify-center font-mono font-black border-2 transition-all shadow-sm ${getToneStyles(step.tone)}`}
              >
                <span className="text-[10px] opacity-70 mb-1">{step.index}</span>
                <span className="text-lg">{getShortTone(step.tone)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ContextCard label="Dars" value={student.lessonName || 'Noma\'lum'} />
          <ContextCard label="O'qituvchi" value={student.teacherName || 'Noma\'lum'} />
          <ContextCard label="Identifikator" value={`ID: ${student.id.toUpperCase()}`} />
        </div>
      </div>
    </div>
  );
};

const DetailCard: React.FC<{ label: string, value: string, color: string, bgColor: string, borderColor: string }> = ({ label, value, color, bgColor, borderColor }) => (
  <div className={`p-5 rounded-3xl border-2 ${borderColor} ${bgColor} flex flex-col items-center text-center shadow-sm`}>
    <p className="text-[10px] uppercase font-black tracking-widest text-gray-500 mb-2">{label}</p>
    <p className={`text-2xl font-black ${color}`}>{value}</p>
  </div>
);

const LegendItem: React.FC<{ color: string, label: string }> = ({ color, label }) => (
  <div className="flex items-center gap-2">
    <span className={`w-3 h-3 rounded-full ${color}`}></span>
    <span className="text-gray-700">{label}</span>
  </div>
);

const ContextCard: React.FC<{ label: string, value: string }> = ({ label, value }) => (
  <div className="p-6 rounded-3xl border-2 border-gray-100 bg-white shadow-sm">
    <p className="text-[10px] uppercase font-black tracking-widest text-gray-500 mb-2">{label}</p>
    <p className="font-black text-gray-900 text-lg leading-tight">{value}</p>
  </div>
);

function getShortTone(tone: StudentTone): string {
  switch (tone) {
    case 'active': return 'F';
    case 'attentive': return 'D';
    case 'inactive': return 'N';
    case 'not_present': return 'X';
    default: return '?';
  }
}

function getToneStyles(tone: StudentTone): string {
  switch (tone) {
    case 'active': return 'bg-orange-100 border-orange-200 text-orange-700 shadow-orange-100';
    case 'attentive': return 'bg-teal-100 border-teal-200 text-teal-700 shadow-teal-100';
    case 'inactive': return 'bg-rose-100 border-rose-200 text-rose-700 shadow-rose-100';
    case 'not_present': return 'bg-slate-200 border-slate-300 text-slate-700 shadow-slate-100';
    default: return 'bg-slate-50 border-slate-100 text-slate-400';
  }
}

export default StudentDetailModal;
