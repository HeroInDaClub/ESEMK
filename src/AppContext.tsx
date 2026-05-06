import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Appointment, DoctorProfile, MedicalRecord, Organization, Role, User } from './mockData';
import { api, TOKEN_STORAGE_KEY } from './lib/api';
import type {
  AppointmentCreatePayload,
  AppointmentUpdatePayload,
  DoctorCreatePayload,
  MedicalRecordUpdatePayload,
  OrganizationCreatePayload,
  PatientRegisterPayload,
  UserUpdatePayload,
} from './lib/api';

interface AppContextType {
  currentUser: User | null;
  isLoading: boolean;
  error: string | null;
  signIn: (role: Role, login: string, password: string) => Promise<void>;
  logout: () => void;
  refreshData: () => Promise<void>;
  appointments: Appointment[];
  updateAppointment: (id: string, data: AppointmentUpdatePayload) => Promise<Appointment>;
  addAppointment: (data: AppointmentCreatePayload) => Promise<Appointment>;
  users: User[];
  medicalRecords: MedicalRecord[];
  updateMedicalRecord: (patientId: string, data: MedicalRecordUpdatePayload) => Promise<MedicalRecord>;
  organizations: Organization[];
  createOrganization: (data: OrganizationCreatePayload) => Promise<Organization>;
  deleteOrganization: (id: string) => Promise<void>;
  doctors: DoctorProfile[];
  createDoctor: (data: DoctorCreatePayload) => Promise<DoctorProfile>;
  deleteDoctor: (id: string) => Promise<void>;
  registerUser: (user: PatientRegisterPayload) => Promise<User>;
  updateCurrentUser: (data: UserUpdatePayload) => Promise<User>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(() => localStorage.getItem(TOKEN_STORAGE_KEY));
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const applyBootstrap = useCallback((data: Awaited<ReturnType<typeof api.bootstrap>>) => {
    setUsers(data.users);
    setOrganizations(data.organizations);
    setDoctors(data.doctors);
    setMedicalRecords(data.medicalRecords);
    setAppointments(data.appointments);
  }, []);

  const refreshData = useCallback(async () => {
    const data = await api.bootstrap();
    applyBootstrap(data);
  }, [applyBootstrap]);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await api.bootstrap();
        if (!isMounted) return;
        applyBootstrap(data);

        const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
        if (storedToken) {
          try {
            const user = await api.me(storedToken);
            if (!isMounted) return;
            setAccessToken(storedToken);
            setCurrentUser(user);
          } catch {
            localStorage.removeItem(TOKEN_STORAGE_KEY);
            if (!isMounted) return;
            setAccessToken(null);
            setCurrentUser(null);
          }
        }
      } catch (loadError) {
        if (!isMounted) return;
        setError(loadError instanceof Error ? loadError.message : 'Не удалось загрузить данные');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void load();
    return () => {
      isMounted = false;
    };
  }, [applyBootstrap]);

  const requireToken = useCallback(() => {
    if (!accessToken) {
      throw new Error('Нужно войти в систему');
    }
    return accessToken;
  }, [accessToken]);

  const signIn = useCallback(
    async (role: Role, login: string, password: string) => {
      const response = await api.login(role, login.trim(), password);
      localStorage.setItem(TOKEN_STORAGE_KEY, response.accessToken);
      setAccessToken(response.accessToken);
      setCurrentUser(response.user);
      await refreshData();
    },
    [refreshData],
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setAccessToken(null);
    setCurrentUser(null);
  }, []);

  const registerUser = useCallback(
    async (user: PatientRegisterPayload) => {
      const createdUser = await api.registerPatient(user);
      await refreshData();
      return createdUser;
    },
    [refreshData],
  );

  const updateCurrentUser = useCallback(
    async (data: UserUpdatePayload) => {
      const updatedUser = await api.updateMe(data, requireToken());
      setCurrentUser(updatedUser);
      setUsers(prev => prev.map(user => (user.id === updatedUser.id ? updatedUser : user)));
      return updatedUser;
    },
    [requireToken],
  );

  const addAppointment = useCallback(
    async (data: AppointmentCreatePayload) => {
      const appointment = await api.createAppointment(data, requireToken());
      setAppointments(prev => [appointment, ...prev]);
      return appointment;
    },
    [requireToken],
  );

  const updateAppointment = useCallback(
    async (id: string, data: AppointmentUpdatePayload) => {
      const appointment = await api.updateAppointment(id, data, requireToken());
      setAppointments(prev => prev.map(item => (item.id === appointment.id ? appointment : item)));
      return appointment;
    },
    [requireToken],
  );

  const updateMedicalRecord = useCallback(
    async (patientId: string, data: MedicalRecordUpdatePayload) => {
      const record = await api.updateMedicalRecord(patientId, data, requireToken());
      setMedicalRecords(prev => {
        const exists = prev.some(item => item.patientId === record.patientId);
        if (!exists) return [...prev, record];
        return prev.map(item => (item.patientId === record.patientId ? record : item));
      });
      return record;
    },
    [requireToken],
  );

  const createOrganization = useCallback(
    async (data: OrganizationCreatePayload) => {
      const organization = await api.createOrganization(data, requireToken());
      setOrganizations(prev => [organization, ...prev]);
      return organization;
    },
    [requireToken],
  );

  const deleteOrganization = useCallback(
    async (id: string) => {
      await api.deleteOrganization(id, requireToken());
      await refreshData();
    },
    [refreshData, requireToken],
  );

  const createDoctor = useCallback(
    async (data: DoctorCreatePayload) => {
      const doctor = await api.createDoctor(data, requireToken());
      await refreshData();
      return doctor;
    },
    [refreshData, requireToken],
  );

  const deleteDoctor = useCallback(
    async (id: string) => {
      await api.deleteDoctor(id, requireToken());
      await refreshData();
    },
    [refreshData, requireToken],
  );

  const value = useMemo<AppContextType>(
    () => ({
      currentUser,
      isLoading,
      error,
      signIn,
      logout,
      refreshData,
      appointments,
      updateAppointment,
      addAppointment,
      users,
      medicalRecords,
      updateMedicalRecord,
      organizations,
      createOrganization,
      deleteOrganization,
      doctors,
      createDoctor,
      deleteDoctor,
      registerUser,
      updateCurrentUser,
    }),
    [
      currentUser,
      isLoading,
      error,
      signIn,
      logout,
      refreshData,
      appointments,
      updateAppointment,
      addAppointment,
      users,
      medicalRecords,
      updateMedicalRecord,
      organizations,
      createOrganization,
      deleteOrganization,
      doctors,
      createDoctor,
      deleteDoctor,
      registerUser,
      updateCurrentUser,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};
