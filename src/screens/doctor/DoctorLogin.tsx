import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { useAppContext } from '../../AppContext';

export default function DoctorLogin() {
  const navigate = useNavigate();
  const { signIn } = useAppContext();
  const [loginStr, setLoginStr] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await signIn('doctor', loginStr, password);
      navigate('/doctor/dashboard');
    } catch {
      setError('Неверный логин или пароль');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md border-blue-200 shadow-md">
        <CardHeader className="text-center bg-blue-50 rounded-t-xl border-b border-blue-100">
          <CardTitle className="text-2xl text-blue-900">Вход для врача</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Логин</label>
              <Input 
                value={loginStr} 
                onChange={e => setLoginStr(e.target.value)} 
                placeholder="Введите логин" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
              <Input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                placeholder="Введите пароль" 
                required 
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full mt-2 bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
              {isSubmitting ? 'Входим...' : 'Войти в систему'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
