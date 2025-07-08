import { MOCK_CHATS_LIST, MOCK_CHAT_HISTORY } from '../data/mockData';
import { notifications } from './notificationService';

export const chatService = {
  getChatsList: async () => {
    // TODO: Substituir pela chamada de API real para /chats
    return Promise.resolve(MOCK_CHATS_LIST);
  },

  getChatHistory: async (chatId) => {
    // TODO: Substituir pela chamada de API real para /chats/{chatId}/messages
    return Promise.resolve(MOCK_CHAT_HISTORY[chatId] || []);
  },

  sendMessage: async (chatId, message) => {
    // TODO: Substituir pela chamada de API real para POST /chats/{chatId}/messages
    const newMessage = { ...message, id: Date.now().toString() };
    notifications.notifyNewMessage(newMessage);
    return Promise.resolve({ success: true, message: newMessage });
  }
};