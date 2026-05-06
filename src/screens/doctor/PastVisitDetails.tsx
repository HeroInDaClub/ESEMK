import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Calendar, User, FileText, Stethoscope, Pill, MessageSquare } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { useAppContext } from '../../AppContext';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function PastVisitDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { appointments, users, doctors } = useAppContext();

  const visit = appointments.find(a => a.id === id);
  
  if (!visit) return <div className="p-4">Визит не найден</div>;

  const patient = users.find(u => u.id === visit.patientId);
  const docUser = users.find(u => u.id === visit.doctorId);
  const docProfile = doctors.find(d => d.userId === visit.doctorId);

  return (
    <div className="space-y-6 pb-20 max-w-3xl mx-auto">
      <header className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft size={24} className="text-gray-900" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Детали приема</h1>
          <p className="text-sm text-gray-600 font-medium">
            {format(parseISO(visit.date), 'd MMMM yyyy', { locale: ru })}, {visit.time}
          </p>
        </div>
      </header>

      <Card className="border-blue-100 shadow-sm overflow-hidden">
        <div className="bg-blue-50 p-4 border-b border-blue-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold shadow-sm">
            {patient?.lastName[0]}{patient?.firstName[0]}
          </div>
          <div>
            <p className="text-xs text-blue-800 uppercase font-bold tracking-wider mb-0.5">Пациент</p>
            <h2 className="text-lg font-bold text-gray-900 leading-tight">
              {patient?.lastName} {patient?.firstName} {patient?.patronymic}
            </h2>
          </div>
        </div>
        <CardContent className="p-4 bg-white flex items-center gap-3 border-b border-gray-100">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
            <User size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-0.5">Врач</p>
            <p className="font-semibold text-gray-900">{docUser?.lastName} {docUser?.firstName[0]}. {docUser?.patronymic?.[0]}.</p>
            <p className="text-sm text-blue-600 font-medium">{docProfile?.specialty}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-gray-200">
        <CardContent className="p-6 space-y-6">
          {visit.reason && (
            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                <FileText size={18} className="text-blue-600" />
                Жалобы
              </h3>
              <p className="text-gray-700 text-sm leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-200">{visit.reason}</p>
            </div>
          )}
          
          {visit.diagnosis && (
            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Stethoscope size={18} className="text-red-500" />
                Диагноз
              </h3>
              <p className="text-gray-900 font-medium bg-red-50 p-4 rounded-xl border border-red-100">{visit.diagnosis}</p>
            </div>
          )}

          {visit.treatmentPlan && (
            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Pill size={18} className="text-green-600" />
                План лечения / Назначения
              </h3>
              <div className="text-gray-700 text-sm leading-relaxed bg-green-50 p-4 rounded-xl border border-green-100 whitespace-pre-wrap">
                {visit.treatmentPlan}
              </div>
            </div>
          )}

          {visit.comments && (
            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                <MessageSquare size={18} className="text-yellow-600" />
                Рекомендации
              </h3>
              <p className="text-gray-700 text-sm leading-relaxed italic bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                "{visit.comments}"
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
