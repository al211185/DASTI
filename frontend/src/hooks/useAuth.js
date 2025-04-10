// src/hooks/useAuth.js
import axiosInstance from '../api/axiosInstance';

export const useAuth = () => {
  const login = async ({ email, password }) => {
    const response = await axiosInstance.post('/auth/login', { email, password });
    return response.data;
  };

  const register = async (userData) => {
    const response = await axiosInstance.post('/auth/register', userData);
    return response.data;
  };

  return { login, register };
};
