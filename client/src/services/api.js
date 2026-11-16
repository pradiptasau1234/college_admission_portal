import axios from 'axios';

const API = axios.create({
  baseURL: '/api'
});

// Attach JWT token from localStorage on every outgoing request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('iem_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Intercept 401 Unauthorized to auto-logout if token expired
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        localStorage.removeItem('iem_token');
        localStorage.removeItem('iem_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default API;
