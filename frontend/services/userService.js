import api from './apiClient';
import { authService } from './authService';

export const userService = {
  getAllSubjects: async () => {
    await authService.waitForAuthReady();
    try {
      const res = await api.get('/courses');
      const subjects = res.data.flatMap(c => (c.disciplines || []).map(d => d.name));
      const uniqueSorted = [...new Set(subjects)].sort((a, b) => a.localeCompare(b));
      return uniqueSorted;
    } catch (error) {
      console.error("Erro ao buscar disciplinas:", error);
      throw error;
    }
  },

  // Perfil do usuário logado
  getUserProfile: async () => {
    await authService.waitForAuthReady();
    try {
      const response = await api.get('/user/me');
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar perfil:", error);
      throw error;
    }
  },

  // Atualiza disciplinas (helping_subjects)
  updateUserSubjects: async (subjects) => {
    await authService.waitForAuthReady();
    try {
      const response = await api.put('/user/me', { helping_subjects: subjects });
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Erro ao atualizar disciplinas:", error);
      throw error;
    }
  },

  updateProfile: async (updateData) => {
    await authService.waitForAuthReady();
    try {
      const response = await api.put('/user/me', updateData);
      return response.data;
    } catch (error) {
      console.error("Erro ao atualizar o perfil:", error);
      throw error;
    }
  },

  async findHelpersBySubject(subject) {
    await authService.waitForAuthReady();
    if (!subject) return [];
    try {
      const { data } = await api.get('/users/helpers', { params: { subject } });
      return (Array.isArray(data) ? data : []).map(u => {
        const name = u.name || 'Sem nome';
        const initial = (name?.trim?.()[0] || '?').toUpperCase();
        return {
          id: u.uid || u.id,
          uid: u.uid || u.id,
          name,
          email: u.email || null,
          avatarUrl: u.avatarUrl || null,
          avatar: u.avatar || initial,
          subjects: Array.isArray(u.helping_subjects) ? u.helping_subjects : [],
          helps: u.helps ?? null,
        };
      });
    } catch (error) {
      if (error?.response?.status === 404) {
        console.warn('Endpoint /users/helpers não encontrado. Aplicando fallback local.');
        try {
          const { data } = await api.get('/users', { params: { offers_help: true } });
          const list = (Array.isArray(data) ? data : []).filter(u =>
            Array.isArray(u.helping_subjects) && u.helping_subjects.includes(subject)
          );
          return list.map(u => {
            const name = u.name || 'Sem nome';
            const initial = (name?.trim?.()[0] || '?').toUpperCase();
            return {
              id: u.uid || u.id,
              uid: u.uid || u.id,
              name,
              email: u.email || null,
              avatarUrl: u.avatarUrl || null,
              avatar: u.avatar || initial,
              subjects: Array.isArray(u.helping_subjects) ? u.helping_subjects : [],
              helps: u.helps ?? null,
            };
          });
        } catch (e2) {
          console.error('Fallback findHelpersBySubject falhou:', e2);
          throw e2;
        }
      }
      console.error('Erro ao buscar ajudantes:', error);
      throw error;
    }
  },

  getPublicUsers: async (uids) => {
    await authService.waitForAuthReady();
    const list = (uids || []).map(String).filter(Boolean);
    if (!list.length) return {};
    try {
      const { data } = await api.get('/users/public', { params: { uids: list.join(',') } });
      const map = {};
      (Array.isArray(data) ? data : []).forEach(u => {
        if (u?.uid) map[u.uid] = { name: u.name || null, avatarUrl: u.avatarUrl || null };
      });
      return map;
    } catch (error) {
      console.error('Erro ao buscar perfis públicos:', error);
      return {};
    }
  },
};
