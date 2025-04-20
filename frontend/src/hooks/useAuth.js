import { useContext } from 'react';
import axiosInstance from '../api/axiosInstance';
import { UserContext } from '../context/UserContext';

export const useAuth = () => {
  const { setUser } = useContext(UserContext);

  const login = async ({ email, password }) => {
    // 1) Inicia sesión; la cookie HttpOnly vendrá en la respuesta
    await axiosInstance.post('/auth/login', { email, password });

    // 2) Con la cookie ya en el navegador, pedimos el perfil
    const { data } = await axiosInstance.get('/auth/profile');

    // 3) Actualizamos el contexto
    setUser(data);
  };

  const logout = async () => {
    await axiosInstance.post('/auth/logout');
    setUser(null);
  };

  const register = async (userData) => {
    return axiosInstance.post('/auth/register', userData);
  };

  return { login, logout, register };
};
