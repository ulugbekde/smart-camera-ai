
import React, { useState, useMemo } from 'react';
import { Student, ClassroomStats } from '../types';
import StudentDetailModal from './StudentDetailModal';
import { Link } from 'react-router-dom';

interface DashboardProps {
  students: Student[];
}

const Dashboard: React.FC<DashboardProps> = ({ students }) => {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const stats: ClassroomStats = useMemo(() => {
    if (students.length === 0) return { averageAttention: 0, presentCount: 0, totalStudents: 0, lessonQuality: 'Fair' };
    const avg = students.reduce((acc, s) => acc + (s.activePct + s.attentivePct), 0) / students.length;
    const present = students.filter(s => s.currentStatus !== 'not_present').length;
    let quality: ClassroomStats['lessonQuality'] = 'Fair';
    if (avg > 75) quality = 'Excellent';
    else if (avg > 50) quality = 'Good';
    else if (avg < 30) quality = 'Poor';
    
    return { averageAttention: Math.round(avg), presentCount: present, totalStudents: students.length, lessonQuality: quality };
  }, [students]);

  if (students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-[40px] border-2 border-dashed border-slate-300 p-12 text-center animate-in fade-in duration-500">
        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
          <svg className="w-12 h-12 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">O'quvchilar qo'shilmagan</h2>
        <p className="text-gray-600 font-medium max-w-md mb-8">
          Tizimdan foydalanish uchun avval o'quvchilarni ro'yxatga oling. Shundan so'ng ularning darsdagi faolligini kuzatishingiz mumkin.
        </p>
        <Link to="/enroll" className="px-8 py-3 bg-[#e86b3a] text-white font-bold rounded-full shadow-lg shadow-orange-500/30 hover:scale-105 transition-all">
          O'quvchi qo'shish
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Classroom Pulse Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <PulseCard 
          label="Dars Sifati" 
          value={stats.lessonQuality === 'Excellent' ? 'Ideal' : stats.lessonQuality === 'Good' ? 'Yaxshi' : 'Qoniqarsiz'} 
          colorClass={stats.lessonQuality === 'Excellent' ? 'text-teal-600' : stats.lessonQuality === 'Poor' ? 'text-rose-600' : 'text-orange-600'}
        />
        <PulseCard label="O'rtacha Diqqat" value={`${stats.averageAttention}%`} />
        <PulseCard label="Davomat" value={`${stats.presentCount} / ${stats.totalStudents}`} />
        <div className="bg-white p-6 rounded-[24px] border border-gray-200 shadow-sm flex items-center justify-center">
           <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden flex ring-1 ring-slate-200">
              <div className="bg-teal-500 h-full shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)]" style={{ width: `${stats.averageAttention}%` }}></div>
           </div>
        </div>
      </div>

      {/* Students Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {students.map((student) => {
          const isDanger = (student.activePct + student.attentivePct) < 25;
          const isAbsent = student.currentStatus === 'not_present';
          
          return (
            <button
              key={student.id}
              onClick={() => setSelectedStudent(student)}
              className={`relative p-5 rounded-2xl border-2 transition-all hover:shadow-xl hover:-translate-y-1 text-left flex flex-col justify-between h-40 ${
                isAbsent ? 'bg-slate-50 border-slate-200 grayscale opacity-80' : 
                isDanger ? 'bg-white border-rose-300 shadow-rose-50' : 'bg-white border-gray-100 shadow-sm'
              }`}
            >
              <div>
                <h4 className="font-black text-gray-900 text-sm truncate leading-tight mb-2">{student.fullName}</h4>
                <div className={`text-[11px] font-bold px-3 py-1 rounded-full inline-block border ${getStatusStyle(student.currentStatus)}`}>
                  {getStatusLabel(student.currentStatus)}
                </div>
              </div>

              <div className="mt-4">
                <div className="flex justify-between items-end mb-1.5">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-tighter">Faollik</span>
                  <span className={`text-sm font-mono font-black ${isDanger && !isAbsent ? 'text-rose-600' : 'text-teal-700'}`}>
                    {student.activePct + student.attentivePct}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden ring-1 ring-slate-200">
                  <div 
                    className={`h-full transition-all duration-1000 ${isDanger ? 'bg-rose-500' : 'bg-teal-500'}`} 
                    style={{ width: `${student.activePct + student.attentivePct}%` }}
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {selectedStudent && (
        <StudentDetailModal 
          student={selectedStudent} 
          onClose={() => setSelectedStudent(null)} 
        />
      )}
    </div>
  );
};

const PulseCard: React.FC<{ label: string, value: string, colorClass?: string }> = ({ label, value, colorClass = "text-gray-900" }) => (
  <div className="bg-white p-6 rounded-[24px] border border-gray-200 shadow-sm">
    <p className="text-xs font-black uppercase tracking-widest text-gray-500 mb-2">{label}</p>
    <h3 className={`text-2xl font-black ${colorClass}`}>{value}</h3>
  </div>
);

function getStatusLabel(status: string) {
  switch (status) {
    case 'active': return 'Faol';
    case 'attentive': return 'Diqqatli';
    case 'inactive': return 'Nofaol';
    case 'not_present': return 'Darsda emas';
    default: return 'Noma\'lum';
  }
}

function getStatusStyle(status: string) {
  switch (status) {
    case 'active': return 'bg-orange-50 text-orange-700 border-orange-100';
    case 'attentive': return 'bg-teal-50 text-teal-700 border-teal-100';
    case 'inactive': return 'bg-rose-50 text-rose-700 border-rose-100';
    case 'not_present': return 'bg-slate-100 text-slate-700 border-slate-200';
    default: return 'bg-slate-50 text-slate-500 border-slate-100';
  }
}

export default Dashboard;
