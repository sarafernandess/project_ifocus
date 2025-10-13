import {
  createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';
import apiClient from './apiClient';
import { auth } from './firebaseConfig';

const INSTITUTIONAL_EMAIL_REGEX = /.+@.+\.edu\.br$/;

let _authReadyPromise;
function waitForAuthReady() {
  if (_authReadyPromise) return _authReadyPromise;
  _authReadyPromise = new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, () => {
      unsub();
      resolve(auth.currentUser || null);
    });
  });
  return _authReadyPromise;
}

async function getIdToken({ forceRefresh = false } = {}) {
  const user = auth.currentUser;
  if (!user) return null;
  try {
    return await user.getIdToken(forceRefresh);
  } catch {
    return null;
  }
}

function getCurrentUser() {
  return auth.currentUser || null;
}

function onAuthChanged(cb) {
  return onAuthStateChanged(auth, cb);
}

export const authService = {
  waitForAuthReady,
  getIdToken,
  getCurrentUser,
  onAuthChanged,

  async register(name, email, password) {
    if (!INSTITUTIONAL_EMAIL_REGEX.test(email)) {
      return { success: false, error: 'Por favor, use um e-mail institucional válido (final .edu.br)' };
    }
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(user, { displayName: name });

      await waitForAuthReady();
      const token = await user.getIdToken(true);
      await apiClient.post('/user/create', { name }, { headers: { Authorization: `Bearer ${token}` } });

      return { success: true, user };
    } catch (error) {
      console.error('Erro no registro:', error);
      return { success: false, error: error?.message || 'Falha no registro' };
    }
  },

  async login(email, password) {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      await waitForAuthReady();
      await cred.user.getIdToken(false);
      return { success: true, user: cred.user };
    } catch (error) {
      console.error('Erro no login:', error);
      return { success: false, error: error?.message || 'Falha no login' };
    }
  },

  async logout() {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      console.error('Erro no logout:', error);
      return { success: false, error: error?.message || 'Falha ao sair' };
    }
  },
};
