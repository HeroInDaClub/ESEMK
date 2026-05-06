import type { Appointment, DoctorProfile, MedicalRecord, Organization, Role, User } from '../mockData';

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
const API_BASE_URL = rawBaseUrl.replace(/\/$/, '');

export const TOKEN_STORAGE_KEY = 'medconnect.accessToken';

export interface BootstrapResponse {
  users: User[];
  organizations: Organization[];
  doctors: DoctorProfile[];
  medicalRecords: MedicalRecord[];
  appointments: Appointment[];
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface PatientRegisterPayload {
  firstName: string;
  lastName: string;
  patronymic?: string;
  login: string;
  password: string;
  email?: string;
  phone?: string;
}

export interface AppointmentCreatePayload {
  doctorId: string;
  orgId: string;
  date: string;
  time: string;
  reason?: string;
}

export type AppointmentUpdatePayload = Partial<
  Pick<Appointment, 'status' | 'reason' | 'diagnosis' | 'treatmentPlan' | 'comments'>
>;

export type UserUpdatePayload = Partial<Pick<User, 'firstName' | 'lastName' | 'patronymic' | 'email' | 'phone'>>;
export type MedicalRecordUpdatePayload = Partial<
  Pick<
    MedicalRecord,
    | 'chronicDiseases'
    | 'allergies'
    | 'importantNotes'
    | 'bloodType'
    | 'bloodPressure'
    | 'heightCm'
    | 'weightKg'
    | 'immunizations'
    | 'lifestyle'
    | 'restrictions'
    | 'riskFactors'
    | 'emergencyContact'
  >
>;

export interface OrganizationCreatePayload {
  name: string;
  address: string;
  photo?: string;
  rating: number;
}

export interface DoctorCreatePayload {
  firstName: string;
  lastName: string;
  patronymic?: string;
  login: string;
  password: string;
  email?: string;
  phone?: string;
  specialty: string;
  education: string;
  rating: number;
  photo?: string;
  organizationIds: string[];
}

class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

function apiUrl(path: string) {
  return `${API_BASE_URL}${path}`;
}

async function request<T>(path: string, options: RequestInit = {}, token?: string | null): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(apiUrl(path), { ...options, headers });
  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const errorBody = await response.json();
      message = errorBody.detail || message;
    } catch {
      // Keep the fallback message when the API returns a non-JSON error.
    }
    throw new ApiError(response.status, message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  bootstrap: () => request<BootstrapResponse>('/api/bootstrap'),
  login: (role: Role, login: string, password: string) =>
    request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ role, login, password }),
    }),
  me: (token: string) => request<User>('/api/auth/me', {}, token),
  registerPatient: (payload: PatientRegisterPayload) =>
    request<User>('/api/users/patients', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateMe: (payload: UserUpdatePayload, token: string) =>
    request<User>(
      '/api/users/me',
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
      },
      token,
    ),
  updateMedicalRecord: (patientId: string, payload: MedicalRecordUpdatePayload, token: string) =>
    request<MedicalRecord>(
      `/api/users/patients/${patientId}/medical-record`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
      },
      token,
    ),
  createOrganization: (payload: OrganizationCreatePayload, token: string) =>
    request<Organization>(
      '/api/admin/organizations',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      token,
    ),
  deleteOrganization: (id: string, token: string) =>
    request<void>(
      `/api/admin/organizations/${id}`,
      {
        method: 'DELETE',
      },
      token,
    ),
  createDoctor: (payload: DoctorCreatePayload, token: string) =>
    request<DoctorProfile>(
      '/api/admin/doctors',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      token,
    ),
  deleteDoctor: (id: string, token: string) =>
    request<void>(
      `/api/admin/doctors/${id}`,
      {
        method: 'DELETE',
      },
      token,
    ),
  createAppointment: (payload: AppointmentCreatePayload, token: string) =>
    request<Appointment>(
      '/api/appointments/',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      token,
    ),
  updateAppointment: (id: string, payload: AppointmentUpdatePayload, token: string) =>
    request<Appointment>(
      `/api/appointments/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
      },
      token,
    ),
};
