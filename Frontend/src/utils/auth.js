// Authentication utility functions
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_UR;

// Configure axios defaults
axios.defaults.withCredentials = true;

// Add request interceptor to include token
axios.interceptors.request.use(
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

// Add response interceptor to handle token expiration
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  // Login user
  login: async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/students/login`, {
        email: email.toLowerCase().trim(),
        password
      });
      
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        return response.data;
      }
      throw new Error('Login failed');
    } catch (error) {
      throw error;
    }
  },

  // Register user
  register: async (name, email, password, course) => {
    try {
      const response = await axios.post(`${API_URL}/students/register`, {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password,
        course
      });
      
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        return response.data;
      }
      throw new Error('Registration failed');
    } catch (error) {
      throw error;
    }
  },

  // Logout user
  logout: async () => {
    try {
      await axios.post(`${API_URL}/students/logout`);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      window.location.href = '/';
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const response = await axios.get(`${API_URL}/students/user`);
      if (response.data.success) {
        return response.data.user;
      }
      throw new Error('Failed to fetch user');
    } catch (error) {
      throw error;
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Get token
  getToken: () => {
    return localStorage.getItem('token');
  }
};

export default authService;
