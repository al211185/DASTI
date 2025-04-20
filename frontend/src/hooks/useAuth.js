// src/hooks/useAuth.js
import { useContext } from 'react';
import axiosInstance from '../api/axiosInstance';
import { UserContext } from '../context/UserContext';

export const useAuth = () => {
  const { saveToken, setUser } = useContext(UserContext);

  const login = async ({ email, password }) => {
    // 1) Logueamos
    const { data } = await axiosInstance.post('/auth/login', { email, password });
    // data = { token: 'xxx', ... }

    // 2) Guardamos token en localStorage y en el estado del contexto
    saveToken(data.token);

    // 3) Con el token ya inyectado en axiosInstance, pedimos el perfil
    const profileResp = await axiosInstance.get('/auth/profile');
    // 4) Actualizamos el contexto para que user deje de ser null
    setUser(profileResp.data);

    return data;
  };

  const register = async (userData) => {
    const { data } = await axiosInstance.post('/auth/register', userData);
    // si tu register también devuelve token, podrías hacer lo mismo aquí
    return data;
  };

  return { login, register };
};
