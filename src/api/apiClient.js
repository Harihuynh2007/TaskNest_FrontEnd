// src/api/apiClient.js
import axios from 'axios';

const API = axios.create({
  baseURL: `${process.env.REACT_APP_API_URL}/api`,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
  },
});
console.log("🧪 API URL:", process.env.REACT_APP_API_URL);


API.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  console.log('📦 Gửi token:', token);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
