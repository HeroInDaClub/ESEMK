import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Building2, MapPin, Search, SlidersHorizontal, Star, Stethoscope, X } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { useAppContext } from '../../AppContext';
import { handleImageError, imageSrc } from '../../lib/imageFallback';

const QUICK_QUERIES = ['Терапевт', 'Кардиолог', 'Невролог', 'Педиатр', 'Эндокринолог', 'Реабилитолог'];

export default function PatientSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { users, doctors, organizations } = useAppContext();

  const initialQuery = searchParams.get('q') || '';
  const rawCat = searchParams.get('cat');
  const initialCat = rawCat === 'org' ? 'org' : 'doctor';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [searchCategory, setSearchCategory] = useState<'doctor' | 'org'>(initialCat);
  const [sortBy, setSortBy] = useState<'rating' | 'alphabet'>('rating');

  const doctorCards = useMemo(() => {
    return doctors
      .map(doc => {
        const user = users.find(u => u.id === doc.userId);
        const orgs = doc.organizations.map(orgId => organizations.find(o => o.id === orgId)).filter(Boolean);
        return user ? { ...doc, user, orgs, mainOrg: orgs[0] } : null;
      })
      .filter(Boolean);
  }, [doctors, users, organizations]);

  const filteredDoctors = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let result = [...doctorCards];

    if (q) {
      result = result.filter(doc => {
        if (!doc) return false;
        const fullName = `${doc.user.lastName} ${doc.user.firstName} ${doc.user.patronymic || ''}`.toLowerCase();
        const specialty = doc.specialty.toLowerCase();
        const orgText = doc.orgs.map(org => `${org?.name} ${org?.address}`).join(' ').toLowerCase();
        return fullName.includes(q) || specialty.includes(q) || orgText.includes(q);
      });
    }

    if (sortBy === 'rating') {
      result.sort((a, b) => (b?.rating || 0) - (a?.rating || 0));
    } else {
      result.sort((a, b) => (a?.user.lastName || '').localeCompare(b?.user.lastName || ''));
    }

    return result;
  }, [doctorCards, searchQuery, sortBy]);

  const filteredOrgs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let result = [...organizations];

    if (q) {
      result = result.filter(org => `${org.name} ${org.address}`.toLowerCase().includes(q));
    }

    if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [organizations, searchQuery, sortBy]);

  const switchCategory = (category: 'doctor' | 'org') => {
    setSearchCategory(category);
    setSearchParams({ q: searchQuery, cat: category });
  };

  const updateQuery = (query: string) => {
    setSearchQuery(query);
    setSearchParams({ q: query, cat: searchCategory }, { replace: true });
  };

  const showClinicDoctors = (clinicName: string) => {
    setSearchCategory('doctor');
    setSearchQuery(clinicName);
    setSearchParams({ q: clinicName, cat: 'doctor' });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ q: searchQuery.trim(), cat: searchCategory });
  };

  const clearSearch = () => updateQuery('');

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="sticky top-0 bg-white z-10 border-b border-gray-100">
        <div className="p-4 max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Поиск</h1>
              <p className="text-sm text-gray-500">Ищите вручную или выбирайте из готовых карточек</p>
            </div>
            <div className="flex bg-gray-100 p-1 rounded-xl w-full md:w-auto">
              {[
                { id: 'doctor', label: 'Врачи', icon: Stethoscope },
                { id: 'org', label: 'Клиники', icon: Building2 },
              ].map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => switchCategory(item.id as 'doctor' | 'org')}
                  className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${searchCategory === item.id ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  <item.icon size={16} />
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <Input
                className="pl-10 pr-10 h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white"
                placeholder={searchCategory === 'doctor' ? 'Фамилия, имя, направление или клиника...' : 'Название или адрес клиники...'}
                value={searchQuery}
                onChange={e => updateQuery(e.target.value)}
              />
              {searchQuery && (
                <button type="button" onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
                  <X size={18} />
                </button>
              )}
            </div>
            <div className="relative">
              <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <select
                className="h-11 rounded-xl bg-gray-50 border border-gray-200 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={sortBy}
                onChange={e => setSortBy(e.target.value as 'rating' | 'alphabet')}
              >
                <option value="rating">Рейтинг</option>
                <option value="alphabet">Алфавит</option>
              </select>
            </div>
          </form>
        </div>
      </header>

      <main className="p-4 max-w-5xl mx-auto space-y-6">
        {searchCategory === 'doctor' && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-900">Быстрые направления</h2>
              <span className="text-xs text-gray-500">Нажмите или введите запрос вручную</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {QUICK_QUERIES.map(query => (
                <button
                  key={query}
                  type="button"
                  onClick={() => updateQuery(query)}
                  className={`px-4 py-2 rounded-full text-sm whitespace-nowrap border transition-colors ${searchQuery === query ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300'}`}
                >
                  {query}
                </button>
              ))}
            </div>
          </section>
        )}

        {searchCategory === 'org' ? (
          <section className="grid gap-4 md:grid-cols-2">
            {filteredOrgs.map(org => (
              <Card key={org.id} className="overflow-hidden border-gray-100 shadow-sm">
                <div className="flex min-h-36">
                  <img src={imageSrc(org.photo, 'clinic')} alt={org.name} className="w-32 sm:w-40 object-cover shrink-0" referrerPolicy="no-referrer" onError={handleImageError('clinic')} />
                  <div className="p-4 flex flex-col justify-between min-w-0 flex-1">
                    <div>
                      <h3 className="font-bold text-gray-900 leading-tight">{org.name}</h3>
                      <div className="flex items-center gap-1 text-yellow-500 text-sm mt-1">
                        <Star size={14} fill="currentColor" />
                        <span className="font-medium text-gray-700">{org.rating}</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-2 line-clamp-2">{org.address}</p>
                    </div>
                    <Button size="sm" className="w-full mt-3" onClick={() => showClinicDoctors(org.name)}>
                      Врачи клиники
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
            {filteredOrgs.length === 0 && (
              <div className="md:col-span-2 text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                <p className="font-semibold text-gray-900">Клиники не найдены</p>
                <p className="text-sm text-gray-500 mt-1">Попробуйте изменить запрос или очистить поиск.</p>
              </div>
            )}
          </section>
        ) : (
          <section className="grid gap-4 md:grid-cols-2">
            {filteredDoctors.map(doc => doc && (
              <Card key={doc.userId} className="overflow-hidden border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <img src={imageSrc(doc.photo, 'doctor')} alt={doc.user.lastName} className="w-20 h-20 rounded-2xl object-cover shrink-0" referrerPolicy="no-referrer" onError={handleImageError('doctor')} />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 truncate">{doc.user.lastName} {doc.user.firstName} {doc.user.patronymic}</h3>
                      <p className="text-blue-600 text-sm font-medium">{doc.specialty}</p>
                      <div className="flex items-center gap-1 text-yellow-500 text-sm mt-1">
                        <Star size={14} fill="currentColor" />
                        <span className="font-medium text-gray-700">{doc.rating}</span>
                      </div>
                      <div className="flex items-start gap-1.5 text-gray-500 text-xs mt-2">
                        <MapPin size={14} className="shrink-0 mt-0.5" />
                        <span className="truncate">{doc.orgs.map(org => org?.name).filter(Boolean).join(', ')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <Button variant="outline" onClick={() => navigate(`/patient/doctor/${doc.userId}`)}>Профиль</Button>
                    <Button onClick={() => navigate(`/patient/book/${doc.userId}`)}>Записаться</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredDoctors.length === 0 && (
              <div className="md:col-span-2 text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                <p className="font-semibold text-gray-900">Врачи не найдены</p>
                <p className="text-sm text-gray-500 mt-1">Можно искать по фамилии, направлению или клинике.</p>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
