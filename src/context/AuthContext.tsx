import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import api, { User, LoginResponse } from '../services/api';
import { useNotifications } from './NotificationContext';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => void;
  register: (name: string, surname: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  loginWithGoogle: () => {},
  register: async () => {},
  logout: () => {},
  updateUser: async () => {},
  deleteAccount: async () => {},
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { addNotification } = useNotifications();
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
    }
    setIsLoading(false);
  }, []);
  
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await api.auth.login(email, password);
      const userData = response.user;
      
      setUser(userData);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(userData));
      addNotification({
        type: 'success',
        message: 'Вхід успішний!'
      });
    } catch (error: any) {
      console.error('Login error:', error);
      addNotification({
        type: 'error',
        message: error.response?.data?.message || 'Помилка при вході. Перевірте ваші дані.'
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = () => {
    api.auth.loginWithGoogle();
  };
  
  const register = async (name: string, surname: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await api.auth.register(name, surname, email, password);
      if (response.user && response.token) {
        const userData = response.user;
        
        setUser(userData);
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(userData));
        addNotification({
          type: 'success',
          message: 'Реєстрація успішна! Ви увійшли в систему.'
        });
      } else {
        addNotification({
          type: 'success',
          message: response.message
        });
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      addNotification({
        type: 'error',
        message: error.response?.data?.message || 'Помилка при реєстрації. Спробуйте ще раз.'
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateUser = async (updates: Partial<User>) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      await api.users.updateProfile({
        name: updates.name || user.name,
        surname: updates.surname || user.surname,
        email: updates.email || user.email,
      });
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      addNotification({
        type: 'success',
        message: 'Профіль оновлено успішно!'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Помилка при оновленні профілю'
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAccount = async () => {
    if (!user) return;

    try {
      await api.users.requestDeletion();
      addNotification({
        type: 'info',
        message: 'Перевірте вашу пошту для підтвердження видалення профілю'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Помилка при створенні запиту на видалення'
      });
      throw error;
    }
  };
  
  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    addNotification({
      type: 'info',
      message: 'Ви вийшли з системи'
    });
  };
  
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginWithGoogle,
        register,
        logout,
        updateUser,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};