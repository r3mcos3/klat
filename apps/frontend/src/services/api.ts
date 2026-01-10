import axios from 'axios';
import { supabase } from '@/config/supabase';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Auth token cache
let cachedToken: string | null = null;
let tokenExpiry: number = 0;

// Request interceptor - Attach JWT token to all requests with caching
api.interceptors.request.use(
  async (config) => {
    try {
      const now = Date.now();

      // Use cached token if valid (5-min buffer before expiry)
      if (cachedToken && tokenExpiry > now + 5 * 60 * 1000) {
        config.headers.Authorization = `Bearer ${cachedToken}`;
        return config;
      }

      // Fetch fresh token
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.access_token) {
        cachedToken = session.access_token;
        tokenExpiry = now + 55 * 60 * 1000; // Tokens expire in 60min, cache for 55min
        config.headers.Authorization = `Bearer ${cachedToken}`;
      }

      return config;
    } catch (error) {
      console.error('Failed to attach auth token:', error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle 401 errors and clear cache
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      console.error('API Error:', error.response.data);

      // If 401 Unauthorized, clear token cache and logout user
      if (error.response.status === 401) {
        cachedToken = null;
        tokenExpiry = 0;

        try {
          await supabase.auth.signOut();
          window.location.href = '/login';
        } catch (logoutError) {
          console.error('Failed to logout:', logoutError);
        }
      }
    } else if (error.request) {
      console.error('Network Error:', error.message);
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
