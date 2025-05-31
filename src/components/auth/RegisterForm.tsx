import React, { useState } from 'react';
import { Mail, Lock, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface RegisterFormProps {
  onSuccess: () => void;
}

interface RegisterError {
  name?: string;
  surname?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess }) => {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<RegisterError>({});
  const [isLoading, setIsLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  
  const { register } = useAuth();

  const validatePassword = (pass: string): boolean => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(pass);
    const hasLowerCase = /[a-z]/.test(pass);
    const hasNumbers = /\d/.test(pass);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(pass);
    
    return pass.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
  };

  const validateForm = (): boolean => {
    const newErrors: RegisterError = {};
    
    if (!name.trim()) {
      newErrors.name = 'Ім\'я є обов\'язковим';
    }
    
    if (!surname.trim()) {
      newErrors.surname = 'Прізвище є обов\'язковим';
    }
    
    if (!email) {
      newErrors.email = 'Email є обов\'язковим';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Введіть дійсну електронну адресу';
    }
    
    if (!password) {
      newErrors.password = 'Пароль є обов\'язковим';
    } else if (!validatePassword(password)) {
      newErrors.password = 'Пароль повинен містити мінімум 8 символів, великі та малі літери, цифри та спеціальні символи';
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Підтвердження пароля є обов\'язковим';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Паролі не співпадають';
    }

    if (!acceptTerms) {
      newErrors.general = 'Ви повинні прийняти умови користування';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setErrors({});
    
    try {
      await register(name, surname, email, password);
      onSuccess();
    } catch (err) {
      const error = err as Error;
      setErrors({
        general: error.message || 'Помилка при реєстрації. Спробуйте ще раз.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.general && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div>
              <p className="text-sm text-red-700">{errors.general}</p>
            </div>
          </div>
        </div>
      )}
      
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Ім'я
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <User size={18} className="text-gray-400" />
          </div>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="given-name"
            required
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors({ ...errors, name: undefined });
            }}
            className={`block w-full pl-10 pr-3 py-2 border ${
              errors.name ? 'border-red-300' : 'border-gray-300'
            } rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 sm:text-sm`}
            placeholder="Юлія"
          />
        </div>
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
        )}
      </div>

      <div>
        <label htmlFor="surname" className="block text-sm font-medium text-gray-700">
          Прізвище
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <User size={18} className="text-gray-400" />
          </div>
          <input
            id="surname"
            name="surname"
            type="text"
            autoComplete="family-name"
            required
            value={surname}
            onChange={(e) => {
              setSurname(e.target.value);
              if (errors.surname) setErrors({ ...errors, surname: undefined });
            }}
            className={`block w-full pl-10 pr-3 py-2 border ${
              errors.surname ? 'border-red-300' : 'border-gray-300'
            } rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 sm:text-sm`}
            placeholder="Соломчак"
          />
        </div>
        {errors.surname && (
          <p className="mt-1 text-sm text-red-600">{errors.surname}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Електронна пошта
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail size={18} className="text-gray-400" />
          </div>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors({ ...errors, email: undefined });
            }}
            className={`block w-full pl-10 pr-3 py-2 border ${
              errors.email ? 'border-red-300' : 'border-gray-300'
            } rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 sm:text-sm`}
            placeholder="you@example.com"
          />
        </div>
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Пароль
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock size={18} className="text-gray-400" />
          </div>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors({ ...errors, password: undefined });
            }}
            className={`block w-full pl-10 pr-3 py-2 border ${
              errors.password ? 'border-red-300' : 'border-gray-300'
            } rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 sm:text-sm`}
            placeholder="••••••••"
          />
        </div>
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
          Підтвердження пароля
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock size={18} className="text-gray-400" />
          </div>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
            }}
            className={`block w-full pl-10 pr-3 py-2 border ${
              errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
            } rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 sm:text-sm`}
            placeholder="••••••••"
          />
        </div>
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
        )}
      </div>

      <div className="flex items-center">
        <input
          id="terms"
          name="terms"
          type="checkbox"
          required
          checked={acceptTerms}
          onChange={(e) => setAcceptTerms(e.target.checked)}
          className={`h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded ${
            errors.general && !acceptTerms ? 'border-red-300' : ''
          }`}
        />
        <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
          Я погоджуюся з <a href="#" className="text-purple-600 hover:text-purple-500">Умовами обслуговування</a> і <a href="#" className="text-purple-600 hover:text-purple-500">Політикою конфіденційності</a>
        </label>
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Створення облікового запису...' : 'Створити обліковий запис'}
        </button>
      </div>
    </form>
  );
};

export default RegisterForm;