import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, User as UserIcon, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAppContext } from '../../AppContext';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const { currentUser, appointments, users } = useAppContext();
  
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [statusFilter, setStatusFilter] = useState<'all' | 'waiting' | 'completed' | 'no_show'>('all');

  if (!currentUser) return null;

  const dayAppointments = appointments
    .filter(a => a.doctorId === currentUser.id && a.date === selectedDate)
    .sort((a, b) => a.time.localeCompare(b.time));

  const filteredAppointments = statusFilter === 'all' 
    ? dayAppointments 
    : dayAppointments.filter(a => a.status === statusFilter);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'waiting': return <span className="flex items-center gap-1 text-yellow-600 bg-yellow-50 px-2 py-1 rounded-md text-xs font-medium border border-yellow-200"><Clock size={12}/> Ожидает</span>;
      case 'accepted': return <span className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-1 rounded-md text-xs font-medium border border-blue-200"><AlertCircle size={12}/> На приеме</span>;
      case 'completed': return <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-md text-xs font-medium border border-green-200"><CheckCircle2 size={12}/> Принят</span>;
      case 'no_show': return <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-md text-xs font-medium border border-red-200"><XCircle size={12}/> Не пришел</span>;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Сегодняшний прием</h1>
          <p className="text-gray-500 text-sm mt-1">Управление очередью пациентов</p>
        </div>
        <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg border border-gray-200">
          <Calendar size={18} className="text-gray-500 ml-2" />
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-transparent border-none focus:ring-0 text-sm font-medium text-gray-700 py-1.5 px-2"
          />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {[
          { id: 'all', label: 'Все' },
          { id: 'waiting', label: 'Ожидают' },
          { id: 'completed', label: 'Приняты' },
          { id: 'no_show', label: 'Не пришли' }
        ].map(filter => (
          <button
            key={filter.id}
            onClick={() => setStatusFilter(filter.id as any)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              statusFilter === filter.id 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredAppointments.map(appt => {
          const patient = users.find(u => u.id === appt.patientId);
          const isWaiting = appt.status === 'waiting' || appt.status === 'accepted';

          return (
            <Card 
              key={appt.id} 
              className={`overflow-hidden transition-all ${isWaiting ? 'border-l-4 border-l-blue-500 hover:shadow-md cursor-pointer' : 'opacity-75'}`}
              onClick={() => isWaiting && navigate(`/doctor/appointment/${appt.id}`)}
            >
              <CardContent className="p-0 flex flex-col sm:flex-row">
                <div className="bg-gray-50 p-4 sm:w-32 flex sm:flex-col items-center sm:justify-center gap-3 border-b sm:border-b-0 sm:border-r border-gray-100">
                  <div className="text-2xl font-bold text-gray-900 tracking-tight">{appt.time}</div>
                  <div className="hidden sm:block">{getStatusBadge(appt.status)}</div>
                </div>
                <div className="p-4 flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1 sm:hidden">
                      {getStatusBadge(appt.status)}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <UserIcon size={18} className="text-gray-400" />
                      {patient?.lastName} {patient?.firstName} {patient?.patronymic}
                    </h3>
                    {appt.reason && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                        <span className="font-medium text-gray-500">Причина:</span> {appt.reason}
                      </p>
                    )}
                  </div>
                  {isWaiting && (
                    <Button 
                      className="w-full sm:w-auto shrink-0 bg-blue-600 hover:bg-blue-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/doctor/appointment/${appt.id}`);
                      }}
                    >
                      Начать прием
                    </Button>
                  )}
                  {!isWaiting && (
                    <Button 
                      variant="outline"
                      className="w-full sm:w-auto shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/doctor/visit/${appt.id}`);
                      }}
                    >
                      Детали
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
        {filteredAppointments.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500 font-medium text-lg">На выбранную дату записей нет</p>
          </div>
        )}
      </div>
    </div>
  );
}
