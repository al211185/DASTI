// src/api/axiosInstance.js
import axios from 'axios';
const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true,   // envía siempre la cookie
});
export default axiosInstance;
