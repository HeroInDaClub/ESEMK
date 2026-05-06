import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { LogOut, Stethoscope } from 'lucide-react';
import { useAppContext } from '../../AppContext';

export default function DoctorLayout() {
  const { currentUser, logout } = useAppContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-blue-600 font-bold text-lg">
            <Stethoscope size={24} />
            <span>Рабочее место врача</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700 hidden sm:inline-block">
              {currentUser?.lastName} {currentUser?.firstName[0]}. {currentUser?.patronymic?.[0]}.
            </span>
            <button 
              onClick={handleLogout}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
              title="Выйти"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto p-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
