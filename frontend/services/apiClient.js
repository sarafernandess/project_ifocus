import axios from 'axios';
import { auth } from './firebaseConfig';

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 20000,
});

// Anexa Authorization: Bearer <idToken>
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    try {
      const token = await user.getIdToken(false);
      config.headers.Authorization = `Bearer ${token}`;
    } catch {
      // segue sem token; o back pode responder 401
    }
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config || {};
    if (error.response?.status === 401 && !original.__isRetry) {
      original.__isRetry = true;
      const user = auth.currentUser;
      if (user) {
        try {
          const freshToken = await user.getIdToken(true); // força refresh
          original.headers = original.headers || {};
          original.headers.Authorization = `Bearer ${freshToken}`;
          return api(original);
        } catch {
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
