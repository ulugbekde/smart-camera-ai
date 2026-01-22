
export type StudentTone = 'active' | 'attentive' | 'inactive' | 'not_present' | 'unknown';

export interface TimelineStep {
  index: number;
  tone: StudentTone;
  label: string;
  confidence?: number;
  timestamp: string;
}

export interface Student {
  id: string;
  fullName: string;
  activePct: number;
  attentivePct: number;
  inactivePct: number;
  notPresentPct: number;
  unknownPct?: number;
  className: string;
  currentStatus: StudentTone;
  lastSeen: string;
  timeline: TimelineStep[];
  lessonName?: string;
  teacherName?: string;
  notes?: string;
  referenceImages: string[]; // Tanish uchun bir nechta asosiy rasmlar (base64 massivi)
}

export interface ClassroomStats {
  averageAttention: number;
  presentCount: number;
  totalStudents: number;
  lessonQuality: 'Excellent' | 'Good' | 'Fair' | 'Poor';
}

export interface BoundingBox {
  ymin: number;
  xmin: number;
  ymax: number;
  xmax: number;
}

export interface MultiStudentAnalysis {
  results: {
    fullName: string;
    tone: StudentTone;
    explanation: string;
    confidence: number;
    box?: BoundingBox; // Yuz koordinatalari (0-1000 oralig'ida)
  }[];
}
