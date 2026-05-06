import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useAppContext } from './AppContext';

// Screens
import RoleSelection from './screens/RoleSelection';
import PatientLogin from './screens/patient/PatientLogin';
import PatientRegister from './screens/patient/PatientRegister';
import PatientLayout from './screens/patient/PatientLayout';
import PatientHome from './screens/patient/PatientHome';
import PatientSearch from './screens/patient/PatientSearch';
import DoctorDetails from './screens/patient/DoctorDetails';
import BookingForm from './screens/patient/BookingForm';
import PatientProfile from './screens/patient/PatientProfile';
import PatientHealth from './screens/patient/PatientHealth';
import VisitDetails from './screens/patient/VisitDetails';

import DoctorLogin from './screens/doctor/DoctorLogin';
import DoctorLayout from './screens/doctor/DoctorLayout';
import DoctorDashboard from './screens/doctor/DoctorDashboard';
import ActiveAppointment from './screens/doctor/ActiveAppointment';
import PatientHistory from './screens/doctor/PatientHistory';
import PastVisitDetails from './screens/doctor/PastVisitDetails';
import AdminLogin from './screens/admin/AdminLogin';
import AdminDashboard from './screens/admin/AdminDashboard';
import type { Role } from './mockData';

function AuthGate({ role, children }: { role: Role; children: React.ReactElement }) {
  const { currentUser, isLoading } = useAppContext();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Загрузка...</div>;
  }

  if (!currentUser || currentUser.role !== role) {
    const loginPath = role === 'patient' ? '/patient/login' : role === 'doctor' ? '/doctor/login' : '/admin/login';
    return <Navigate to={loginPath} replace />;
  }

  return children;
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RoleSelection />} />
          
          {/* Patient Routes */}
          <Route path="/patient/login" element={<PatientLogin />} />
          <Route path="/patient/register" element={<PatientRegister />} />
          <Route path="/patient" element={<AuthGate role="patient"><PatientLayout /></AuthGate>}>
            <Route index element={<Navigate to="/patient/home" replace />} />
            <Route path="home" element={<PatientHome />} />
            <Route path="search" element={<PatientSearch />} />
            <Route path="doctor/:id" element={<DoctorDetails />} />
            <Route path="book/:id" element={<BookingForm />} />
            <Route path="profile" element={<PatientProfile />} />
            <Route path="health" element={<PatientHealth />} />
            <Route path="visit/:id" element={<VisitDetails />} />
          </Route>

          {/* Doctor Routes */}
          <Route path="/doctor/login" element={<DoctorLogin />} />
          <Route path="/doctor" element={<AuthGate role="doctor"><DoctorLayout /></AuthGate>}>
            <Route index element={<Navigate to="/doctor/dashboard" replace />} />
            <Route path="dashboard" element={<DoctorDashboard />} />
            <Route path="appointment/:id" element={<ActiveAppointment />} />
            <Route path="patient/:id/history" element={<PatientHistory />} />
            <Route path="visit/:id" element={<PastVisitDetails />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AuthGate role="admin"><AdminDashboard /></AuthGate>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
