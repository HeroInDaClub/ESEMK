export type Role = 'patient' | 'doctor' | 'admin';

export interface User {
  id: string;
  role: Role;
  login: string;
  firstName: string;
  lastName: string;
  patronymic?: string | null;
  email?: string | null;
  phone?: string | null;
}

export interface Organization {
  id: string;
  name: string;
  address: string;
  photo: string;
  rating: number;
}

export interface DoctorProfile {
  userId: string;
  specialty: string;
  education: string;
  rating: number;
  photo: string;
  organizations: string[];
}

export interface MedicalRecord {
  patientId: string;
  chronicDiseases?: string | null;
  allergies?: string | null;
  importantNotes?: string | null;
  bloodType?: string | null;
  bloodPressure?: string | null;
  heightCm?: number | null;
  weightKg?: number | null;
  immunizations?: string | null;
  lifestyle?: string | null;
  restrictions?: string | null;
  riskFactors?: string | null;
  emergencyContact?: string | null;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  orgId: string;
  date: string;
  time: string;
  status: 'waiting' | 'accepted' | 'no_show' | 'completed' | 'cancelled';
  reason?: string | null;
  room: string;
  diagnosis?: string | null;
  treatmentPlan?: string | null;
  comments?: string | null;
}
