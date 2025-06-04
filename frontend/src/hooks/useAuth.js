import {
  useContext
} from 'react';
import axiosInstance from '../api/axiosInstance';
import {
  UserContext
} from '../context/UserContext';

export const useAuth = () => {
  const {
    setUser
  } = useContext(UserContext);

  const login = async ({
    email,
    password
  }) => {
    // 1) Inicia sesión y recibe el token en la respuesta
    const res = await axiosInstance.post('/auth/login', {
      email,
      password
    });

    // 2) Guarda el token para futuras peticiones
    const {
      token
    } = res.data;
    if (token) {
      localStorage.setItem('authToken', token);
      axiosInstance.defaults.headers['x-auth-token'] = token;
    }

    // 3) Obtiene el perfil utilizando el token
    const {
      data
    } = await axiosInstance.get('/auth/profile');

    // 4) Actualiza el contexto
    setUser(data);
  };

  const logout = async () => {
    await axiosInstance.post('/auth/logout');
    localStorage.removeItem('authToken');
    delete axiosInstance.defaults.headers['x-auth-token'];
    setUser(null);
  };

  const register = async (userData) => {
    return axiosInstance.post('/auth/register', userData);
  };

  return {
    login,
    logout,
    register
  };
};