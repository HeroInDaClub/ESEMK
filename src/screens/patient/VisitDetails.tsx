import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Calendar, User as UserIcon, MapPin, FileText, Stethoscope, Pill, MessageSquare } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { useAppContext } from '../../AppContext';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function VisitDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { appointments, users, doctors, organizations } = useAppContext();

  const visit = appointments.find(a => a.id === id);
  
  if (!visit) return <div className="p-4">Визит не найден</div>;

  const docUser = users.find(u => u.id === visit.doctorId);
  const docProfile = doctors.find(d => d.userId === visit.doctorId);
  const org = organizations.find(o => o.id === visit.orgId);

  return (
    <div className="min-h-screen bg-white pb-20">
      <header className="bg-white px-4 py-4 flex items-center gap-3 border-b border-gray-200 sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft size={24} className="text-gray-900" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Детали приема</h1>
      </header>

      <div className="p-4 space-y-4 max-w-3xl mx-auto">
        {/* Meta Info */}
        <Card className="border-none shadow-sm overflow-hidden">
          <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Calendar size={20} className="opacity-80" />
              <span className="font-medium">{format(parseISO(visit.date), 'd MMMM yyyy', { locale: ru })}</span>
            </div>
            <div className="bg-white/20 px-3 py-1 rounded-lg font-bold backdrop-blur-sm">
              {visit.time}
            </div>
          </div>
          <CardContent className="p-0 divide-y divide-gray-100">
            <div className="p-4 flex items-center gap-3 bg-white">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                <UserIcon size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium tracking-wider mb-0.5">Врач</p>
                <p className="font-semibold text-gray-900">{docUser?.lastName} {docUser?.firstName} {docUser?.patronymic}</p>
                <p className="text-sm text-blue-600 font-medium">{docProfile?.specialty}</p>
              </div>
            </div>
            
            <div className="p-4 flex items-center gap-3 bg-white">
              <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                <MapPin size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium tracking-wider mb-0.5">Место приема</p>
                <p className="font-semibold text-gray-900">{org?.name}</p>
                <p className="text-sm text-gray-500">Кабинет {visit.room}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Medical Details */}
        <div className="space-y-4 mt-6">
          <h2 className="text-lg font-bold text-gray-900 px-1">Медицинское заключение</h2>
          
          <Card className="border-gray-100 shadow-sm">
            <CardContent className="p-5 space-y-6">
              {visit.reason && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <FileText size={16} className="text-gray-400" />
                    Причина обращения
                  </h3>
                  <p className="text-gray-700 text-sm leading-relaxed">{visit.reason}</p>
                </div>
              )}
              
              {visit.diagnosis && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Stethoscope size={16} className="text-red-500" />
                    Диагноз
                  </h3>
                  <p className="text-gray-900 font-medium bg-red-50 p-3 rounded-lg border border-red-100">{visit.diagnosis}</p>
                </div>
              )}

              {visit.treatmentPlan && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Pill size={16} className="text-blue-500" />
                    Назначения / План лечения
                  </h3>
                  <div className="text-gray-700 text-sm leading-relaxed bg-blue-50 p-4 rounded-xl border border-blue-100 whitespace-pre-wrap">
                    {visit.treatmentPlan}
                  </div>
                </div>
              )}

              {visit.comments && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <MessageSquare size={16} className="text-yellow-500" />
                    Рекомендации врача
                  </h3>
                  <p className="text-gray-700 text-sm leading-relaxed italic bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                    "{visit.comments}"
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
