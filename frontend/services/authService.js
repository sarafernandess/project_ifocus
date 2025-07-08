import { MOCK_USER } from '../data/mockData';
import { notifications } from './notificationService';

let isLoggedIn = false;

export const authService = {
  login: async (email, password) => {
    // TODO: Substituir pela chamada de API real para /login
    console.log(`Tentando login com ${email}`);
    if (email && password) {
      isLoggedIn = true;
      notifications.notifyLoginSuccess();
      return Promise.resolve({ success: true, user: MOCK_USER });
    }
    return Promise.resolve({ success: false, error: 'Credenciais inválidas.' });
  },

  register: async (name, email, password) => {
    // TODO: Substituir pela chamada de API real para /register
    console.log(`Registrando ${name}`);
    if (name && email && password) {
        isLoggedIn = true;
        return Promise.resolve({ success: true, user: MOCK_USER });
    }
    return Promise.resolve({ success: false, error: 'Dados de registro inválidos.' });
  },

  logout: async () => {
    // TODO: Substituir pela chamada de API real para /logout
    isLoggedIn = false;
    return Promise.resolve({ success: true });
  },

  checkAuthStatus: async () => {
    return Promise.resolve({ isAuthenticated: isLoggedIn });
  },
};