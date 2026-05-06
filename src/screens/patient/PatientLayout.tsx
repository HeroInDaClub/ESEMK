import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { HeartPulse, Home, Search, User as UserIcon } from 'lucide-react';

export default function PatientLayout() {
  const location = useLocation();

  const navItems = [
    { path: '/patient/home', icon: Home, label: 'Главная' },
    { path: '/patient/search', icon: Search, label: 'Поиск' },
    { path: '/patient/health', icon: HeartPulse, label: 'Здоровье' },
    { path: '/patient/profile', icon: UserIcon, label: 'Профиль' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-gray-200 h-screen sticky top-0 bg-white p-4">
        <div className="text-2xl font-bold text-blue-600 mb-8 px-4 mt-4">MedConnect</div>
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            const Icon = item.icon;
            return (
              <Link 
                key={item.path} 
                to={item.path}
                className={`flex items-center gap-3 py-3 px-4 rounded-xl transition-colors ${isActive ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen relative pb-16 md:pb-0 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>
      
      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="max-w-md mx-auto flex justify-around">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            const Icon = item.icon;
            return (
              <Link 
                key={item.path} 
                to={item.path}
                className={`flex flex-col items-center py-3 px-4 ${isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
              >
                <Icon size={24} />
                <span className="text-[10px] mt-1 font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
