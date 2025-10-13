
const showNotification = (title, body) => {
  console.log(`[NOTIFICAÇÃO] ${title}: ${body}`);
};

export const notifications = {
  notifyLoginSuccess: () => {
    showNotification('Login Realizado', 'Bem-vindo de volta ao iFocus!');
  },
  notifyPasswordChange: () => {
    showNotification('Sucesso', 'Sua senha foi alterada com sucesso.');
  },
  notifyUsernameChange: () => {
    showNotification('Sucesso', 'Seu nome foi atualizado.');
  },
  notifyProfilePhotoChange: () => {
    showNotification('Sucesso', 'Sua foto de perfil foi alterada.');
  },
  notifyNewMessage: (message) => {
    showNotification('Nova Mensagem', `Você recebeu uma nova mensagem.`);
  },
};