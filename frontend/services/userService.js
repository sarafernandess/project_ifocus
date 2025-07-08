import { MOCK_ALL_SUBJECTS, MOCK_HELPERS, MOCK_USER } from '../data/mockData';
import { notifications } from './notificationService';

export const userService = {
  getUserProfile: async () => {
    // TODO: Substituir pela chamada de API real para /users/me
    return Promise.resolve(MOCK_USER);
  },
  
  updateUsername: async (newName) => {
    // TODO: Substituir pela chamada de API real para PATCH /users/me
    notifications.notifyUsernameChange();
    return Promise.resolve({ success: true, user: { ...MOCK_USER, name: newName } });
  },
  
  updatePassword: async (newPassword) => {
    // TODO: Substituir pela chamada de API real para POST /users/change-password
    notifications.notifyPasswordChange();
    return Promise.resolve({ success: true });
  },

  updateProfilePhoto: async (photoUri) => {
    // TODO: Substituir pela chamada de API real para POST /users/avatar
    notifications.notifyProfilePhotoChange();
    return Promise.resolve({ success: true });
  },

  getAllSubjects: async () => {
    // TODO: Substituir pela chamada de API real para /subjects
    return Promise.resolve(MOCK_ALL_SUBJECTS);
  },

  updateUserSubjects: async (subjects) => {
    // TODO: Substituir pela chamada de API real para PUT /users/me/subjects
    MOCK_USER.subjects = subjects;
    return Promise.resolve({ success: true });
  },

  findHelpersBySubject: async (subject) => {
    // TODO: Substituir pela chamada de API real para /helpers?subject=...
    return Promise.resolve(MOCK_HELPERS[subject] || []);
  }
};