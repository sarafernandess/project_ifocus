import apiClient from './apiClient';

const chatService = {
  async createOrGetChat(otherUserId) {
    const { data } = await apiClient.post('/chat/create', { other_user_id: String(otherUserId) });
    return data;
  },

  listConversations: async (userId) => {
    const { data } = await apiClient.get(`/chat/user/${userId}`);
    return data;
  },

  getChatsList: async (userId) => chatService.listConversations(userId),

  getMessages: async (chatId, { limit = 20, before } = {}) => {
    const params = { limit };
    if (before) params.before = before;
    const { data } = await apiClient.get(`/chat/messages/${chatId}`, { params });
    return data;
  },

  sendMessage: async ({ chatId, receiverId, text, file }) => {
    const form = new FormData();
    form.append('receiver_id', String(receiverId));
    if (text) form.append('text', text);
    if (file) {
      form.append('file', {
        uri: file.uri,
        name: file.name || 'upload',
        type: file.type || 'application/octet-stream',
      });
    }
    const { data } = await apiClient.post(`/chat/send/${chatId}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
};

export default chatService;
