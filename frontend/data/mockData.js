export const MOCK_USER = {
    id: '1',
    name: 'João Silva',
    email: 'joao@aluno.ifsp.edu.br',
    avatar: 'JS',
    subjects: ['Lógica de Programação e Algoritmos', 'Matemática para Computação'],
  };
  
  export const MOCK_ALL_SUBJECTS = [
    'Lógica de Programação e Algoritmos',
    'Matemática para Computação',
    'Arquitetura de Computadores',
    'Inglês',
    'Programação Orientada a Objetos',
    'Algoritmos e Estruturas de Dados',
    'Sistemas Operacionais',
    'Engenharia de Software',
    'Desenvolvimento Web',
    'Redes de Computadores',
    'Estatística e Probabilidade',
  ];
  
  export const MOCK_HELPERS = {
    'Desenvolvimento Web': [
      { id: '2', name: 'Pedro Lima', avatar: 'PL', subjects: ['Algoritmos e Estruturas de Dados', 'Banco de Dados', 'Desenvolvimento Web'], helps: 18 },
      { id: '3', name: 'Laura Oliveira', avatar: 'LO', subjects: ['Programação para Dispositivos Móveis', 'Desenvolvimento Web', 'Interação Humano-Computador'], helps: 20 },
    ],
    'Matemática para Computação': [
      { id: '4', name: 'Maria Santos', avatar: 'MS', subjects: ['Matemática para Computação', 'Cálculo I'], helps: 25 },
    ],
  };
  
  export const MOCK_CHATS_LIST = [
      { id: 'chat1', userName: 'Maria Santos', avatar: 'MS', lastMessage: 'Oi! Você pode me ajudar com cálculo?', subject: 'Matemática', time: '0min', unread: 2 },
      { id: 'chat2', userName: 'Pedro Lima', avatar: 'PL', lastMessage: 'Obrigado pela ajuda com física!', subject: 'Física', time: '1h', unread: 0 },
      { id: 'chat3', userName: 'Ana Costa', avatar: 'AC', lastMessage: 'Podemos nos encontrar amanhã para estuda...', subject: 'Química', time: '2h', unread: 1 },
  ];
  
  export const MOCK_CHAT_HISTORY = {
      chat1: [
          { id: 'msg3', text: 'Tenho dificuldade com derivadas. Você poderia explicar?', senderId: '4', time: '00:24' },
          { id: 'msg2', text: 'Claro! Qual é a sua dúvida?', senderId: '1', time: '23:27' },
          { id: 'msg1', text: 'Oi! Você pode me ajudar com cálculo?', senderId: '4', time: '23:24' },
      ],
      chat2: [
          { id: 'msg1', text: 'Obrigado pela ajuda com física!', senderId: '1', time: '1h' },
      ]
  };