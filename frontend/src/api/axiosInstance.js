import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true, // Asegúrate de enviar las cookies.
});

// Elimina o comenta el interceptor que añade el token desde localStorage.
// axiosInstance.interceptors.request.use(
//   (config) => {
//     // Ya que el token se gestiona vía cookies, no es necesario agregarlo en el header
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

export default axiosInstance;
