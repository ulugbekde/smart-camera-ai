
import React, { useState } from 'react';
import { Student } from '../types';

interface EnrollmentProps {
  onAdd: (student: Student) => void;
}

const Enrollment: React.FC<EnrollmentProps> = ({ onAdd }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    className: '',
    lessonName: '',
    teacherName: '',
    notes: ''
  });
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [status, setStatus] = useState<{ type: 'info' | 'success' | 'error', message: string } | null>(null);

  // Fix: Helper to convert File to base64 string
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Fix: Explicitly cast Array.from result to File[] to ensure the type system knows these are Blobs
    const selectedFiles = Array.from(e.target.files || []) as File[];
    if (selectedFiles.length === 0) return;

    setFiles(prev => [...prev, ...selectedFiles].slice(0, 5)); // Maksimal 5 ta rasm

    selectedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => [...prev, reader.result as string].slice(0, 5));
      };
      // Fix: Now 'file' is correctly typed as File (which extends Blob)
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || files.length === 0) {
      setStatus({ type: 'error', message: "Ism va kamida 1 ta rasm majburiy!" });
      return;
    }

    setStatus({ type: 'info', message: "Profil va vizual ma'lumotlar bazasi yangilanmoqda..." });

    try {
      // Barcha rasmlarni base64 ga o'tkazamiz
      const base64Promises = files.map(file => fileToBase64(file));
      const base64Results = await Promise.all(base64Promises);
      const referenceImages = base64Results.map(res => res.split(',')[1]);

      const newStudent: Student = {
        id: Math.random().toString(36).substr(2, 9),
        fullName: formData.fullName,
        className: formData.className || 'Noma\'lum',
        lessonName: formData.lessonName || 'Noma\'lum',
        teacherName: formData.teacherName || 'Noma\'lum',
        activePct: 0,
        attentivePct: 0,
        inactivePct: 0,
        notPresentPct: 0,
        unknownPct: 100,
        currentStatus: 'unknown',
        lastSeen: 'Noma\'lum',
        timeline: [],
        notes: formData.notes,
        referenceImages: referenceImages
      };

      onAdd(newStudent);
      setStatus({ type: 'success', message: "O'quvchi muvaffaqiyatli qo'shildi! AI endi uni taniy oladi." });
      setFormData({ fullName: '', className: '', lessonName: '', teacherName: '', notes: '' });
      setFiles([]);
      setPreviews([]);
    } catch (err) {
      setStatus({ type: 'error', message: "Rasmlarni qayta ishlashda xatolik yuz berdi." });
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="mb-10 text-center">
        <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">O'quvchini Ro'yxatdan O'tkazish</h2>
        <p className="text-gray-600 font-medium max-w-xl mx-auto text-lg">
          AI aniqroq tanishi uchun turli xil burchaklardan olingan 1-5 ta sifatli rasm yuklang.
        </p>
      </div>

      <div className="bg-white rounded-[40px] border-2 border-gray-100 shadow-2xl p-10 md:p-14">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormField 
              label="To'liq Ism *" 
              value={formData.fullName} 
              onChange={v => setFormData({...formData, fullName: v})} 
              required 
              placeholder="Fayzullayev Jasur"
            />
            <FormField 
              label="Sinf" 
              value={formData.className} 
              onChange={v => setFormData({...formData, className: v})} 
              placeholder="11-B"
            />
          </div>

          <div className="flex flex-col gap-4">
            <label className="text-sm uppercase font-black tracking-widest text-gray-700 ml-1">Identifikatsiya rasmlari (Maksimal 5 ta) *</label>
            
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-4">
              {previews.map((src, i) => (
                <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-orange-200 group">
                  <img src={src} alt="preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <button type="button" onClick={() => {
                      setFiles(files.filter((_, idx) => idx !== i));
                      setPreviews(previews.filter((_, idx) => idx !== i));
                    }} className="text-white bg-rose-500 p-2 rounded-full">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                </div>
              ))}
              {previews.length < 5 && (
                <label className="aspect-square border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors">
                  <input type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
                  <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  <span className="text-[10px] font-bold text-gray-400 mt-1">Rasm qo'shish</span>
                </label>
              )}
            </div>

            <div className="p-6 border-2 border-dashed border-gray-200 rounded-3xl bg-slate-50 text-center">
               <p className="text-sm font-medium text-gray-500">
                 {files.length === 0 ? "Hali rasmlar tanlanmagan. Bir nechta rasm aniqlikni 99% gacha oshiradi." : `${files.length} ta rasm tayyor.`}
               </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 pt-6">
            <button 
              type="submit" 
              className="w-full sm:w-auto px-12 py-5 bg-[#11212d] text-white text-lg font-black rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all"
            >
              Ma'lumotlarni Saqlash
            </button>
          </div>

          {status && (
            <div className={`p-6 rounded-3xl font-black text-center text-base animate-in zoom-in-95 duration-300 ${
              status.type === 'error' ? 'bg-rose-50 text-rose-600 border-2 border-rose-100' : 'bg-teal-50 text-teal-600 border-2 border-teal-100'
            }`}>
              {status.message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

const FormField: React.FC<{ label: string; value: string; onChange: (v: string) => void; required?: boolean; placeholder?: string }> = ({ label, value, onChange, required, placeholder }) => (
  <div className="flex flex-col gap-3">
    <label className="text-sm uppercase font-black tracking-widest text-gray-700 ml-1">{label}</label>
    <input 
      type="text" 
      required={required}
      placeholder={placeholder}
      className="w-full p-5 rounded-2xl border-2 border-gray-200 bg-white text-gray-900 font-black text-lg focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all placeholder-gray-400"
      value={value}
      onChange={e => onChange(e.target.value)}
    />
  </div>
);

export default Enrollment;
