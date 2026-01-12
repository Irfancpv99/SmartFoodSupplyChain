import axios from 'axios';
import config from '../config';

// Create axios instance
const api = axios.create({
  baseURL: config.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (username, password) => 
    api.post('/auth/login', { username, password }),
  
  register: (userData) => 
    api.post('/auth/register', userData),
  
  getCurrentUser: () => 
    api.get('/auth/me'),
};

// Documents API
export const documentsAPI = {
  create: (formData) => 
    api.post('/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  getAll: () => 
    api.get('/documents'),
  
  getById: (id) => 
    api.get(`/documents/${id}`),
};

// Menus API
export const menusAPI = {
  create: (menuData) => 
    api.post('/menus', menuData),
  
  getAll: () => 
    api.get('/menus'),
  
  getById: (id) => 
    api.get(`/menus/${id}`),
  
  publish: (id) => 
    api.post(`/menus/${id}/publish`),
};

// Verification API (public)
export const verifyAPI = {
  verifyMenu: (id) => 
    api.get(`/verify/menu/${id}`),
  
  verifyHash: (hash) => 
    api.get(`/verify/hash/${hash}`),
};

// Schools API
export const schoolsAPI = {
  getAll: () => 
    api.get('/schools'),
  
  getById: (id) => 
    api.get(`/schools/${id}`),
};

// Vendors API
export const vendorsAPI = {
  getAll: () => 
    api.get('/vendors'),
  
  getById: (id) => 
    api.get(`/vendors/${id}`),
};

export default api;
