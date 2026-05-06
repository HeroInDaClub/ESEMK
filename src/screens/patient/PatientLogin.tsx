import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { useAppContext } from '../../AppContext';

export default function PatientLogin() {
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
      await signIn('patient', loginStr, password);
      navigate('/patient/home');
    } catch {
      setError('Неверный логин или пароль');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Вход для пациента</CardTitle>
        </CardHeader>
        <CardContent>
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
            <Button type="submit" className="w-full mt-2" disabled={isSubmitting}>
              {isSubmitting ? 'Входим...' : 'Войти'}
            </Button>
            <div className="text-center mt-4">
              <Link to="/patient/register" className="text-blue-600 text-sm hover:underline">
                Зарегистрироваться
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
