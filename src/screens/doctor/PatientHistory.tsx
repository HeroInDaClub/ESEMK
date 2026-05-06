import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Calendar, FileText } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { useAppContext } from '../../AppContext';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function PatientHistory() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { users, appointments, doctors } = useAppContext();

  const patient = users.find(u => u.id === id);
  
  if (!patient) return <div className="p-4">Пациент не найден</div>;

  const pastVisits = appointments
    .filter(a => a.patientId === id && a.status === 'completed')
    .sort((a, b) => new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime());

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft size={24} className="text-gray-900" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">История посещений</h1>
          <p className="text-sm text-gray-600 font-medium">
            {patient.lastName} {patient.firstName} {patient.patronymic}
          </p>
        </div>
      </header>

      <div className="space-y-4">
        {pastVisits.map(visit => {
          const docUser = users.find(u => u.id === visit.doctorId);
          const docProfile = doctors.find(d => d.userId === visit.doctorId);

          return (
            <Card 
              key={visit.id} 
              className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer border-gray-200"
              onClick={() => navigate(`/doctor/visit/${visit.id}`)}
            >
              <CardContent className="p-0">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                  <div className="flex items-center gap-2 text-gray-900 font-bold">
                    <Calendar size={16} className="text-blue-600" />
                    {format(parseISO(visit.date), 'd MMMM yyyy', { locale: ru })}
                  </div>
                  <div className="text-sm font-medium text-gray-500 bg-white px-2 py-1 rounded-md border border-gray-200">
                    {visit.time}
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                      <FileText size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 mb-1">Диагноз</p>
                      <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded-lg border border-gray-100">{visit.diagnosis || 'Не указан'}</p>
                    </div>
                  </div>
                  <div className="pl-11">
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">Врач</p>
                    <p className="text-sm font-medium text-gray-900">{docUser?.lastName} {docUser?.firstName[0]}. {docUser?.patronymic?.[0]}. <span className="text-blue-600 font-normal">({docProfile?.specialty})</span></p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {pastVisits.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500 font-medium text-lg">История посещений пуста</p>
          </div>
        )}
      </div>
    </div>
  );
}
