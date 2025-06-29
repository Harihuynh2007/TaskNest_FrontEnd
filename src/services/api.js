import axios from "axios";  

const API = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
    withCredentials: true, // nếu bạn dùng cookie-based auth
    headers: {
        'Content-Type': 'application/json',
    },
})

// interceptor để auto gắn token (nếu dùng JWT)
API.interceptors.request.use(
  config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
},
  error => Promise.reject(error)
);

API.interceptors.response.use(
  response => response,
  error => {
    if(error.response?.status === 401){
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;