import { createContext, useState, useEffect } from 'react';
import API from '../services/api';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/auth/user/')
      .then(res => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = (email, password) =>
    API.post('/auth/login/', { email, password }).then(res => {
      // ví dụ backend trả token & user
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
    });

  const logout = () =>
    API.post('/auth/logout/').then(() => {
      localStorage.removeItem('token');
      setUser(null);
    });

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
