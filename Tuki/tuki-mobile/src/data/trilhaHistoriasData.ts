export interface PaginaHistoria {
  emoji: string;
  bg: string;
  textoBg: string;
  titulo: string;
  texto: string;
}

export interface QuizHistoria {
  pergunta: string;
  opcoes: [string, string];
  correta: 0 | 1;
}

export interface ConfigHistoria {
  idLicao: number;
  titulo: string;
  emoji: string;
  bgHeader: string;
  paginas: PaginaHistoria[];
  quiz: QuizHistoria;
}

const HISTORIAS: Record<number, ConfigHistoria> = {
  20: {
    idLicao: 20,
    titulo: 'O Pequeno Tuki',
    emoji: '🐣',
    bgHeader: '#FDF4FF',
    paginas: [
      {
        emoji: '🐣', bg: '#FDF4FF', textoBg: '#F3E8FF',
        titulo: 'O Despertar de Tuki',
        texto: 'Tuki era um pintinho amarelinho que acordou numa manhã diferente. Ele olhou ao redor do ninho e sentiu algo especial no coração!',
      },
      {
        emoji: '🌸', bg: '#FFF0F5', textoBg: '#FFE4F0',
        titulo: 'A Grande Descoberta',
        texto: 'Ao pular do ninho pela primeira vez, Tuki descobriu um jardim enorme cheio de flores, borboletas e frutas coloridas!',
      },
      {
        emoji: '🌈', bg: '#F0FDF4', textoBg: '#DCFCE7',
        titulo: 'O Presente do Dia',
        texto: 'No cantinho do jardim, Tuki encontrou um arco-íris! Ele aprendeu que cada novo dia traz uma surpresa mágica. Fim! 🌟',
      },
    ],
    quiz: {
      pergunta: 'O que Tuki encontrou ao pular do ninho pela primeira vez? 🐣',
      opcoes: ['Um jardim cheio de flores e cores', 'Uma chuva fortíssima'],
      correta: 0,
    },
  },

  21: {
    idLicao: 21,
    titulo: 'Reino das Cores',
    emoji: '🎨',
    bgHeader: '#FFFBEB',
    paginas: [
      {
        emoji: '⬛', bg: '#F3F4F6', textoBg: '#E5E7EB',
        titulo: 'O Mundo Sem Cores',
        texto: 'Era uma vez um reino onde tudo era cinza. As flores, o céu, os animais — tudo igual, sem graça, sem alegria.',
      },
      {
        emoji: '🖌️', bg: '#FFF7ED', textoBg: '#FED7AA',
        titulo: 'O Pincel Mágico',
        texto: 'Uma menina chamada Sol encontrou um pincel mágico. Cada vez que ela pintava algo, uma cor nova aparecia no mundo!',
      },
      {
        emoji: '🌈', bg: '#ECFDF5', textoBg: '#A7F3D0',
        titulo: 'Cores Para Todos',
        texto: 'Sol pintou o céu de azul, as flores de rosa e o sol de amarelo. O reino inteiro floresceu de alegria e gratidão! Fim! 🎨',
      },
    ],
    quiz: {
      pergunta: 'O que Sol usou para trazer cores ao reino? 🎨',
      opcoes: ['Um pincel mágico', 'Uma poção especial'],
      correta: 0,
    },
  },

  22: {
    idLicao: 22,
    titulo: 'Amigos da Floresta',
    emoji: '🦊',
    bgHeader: '#F0FDF4',
    paginas: [
      {
        emoji: '🦊', bg: '#FEF9EE', textoBg: '#FEF3C7',
        titulo: 'A Raposinha Tímida',
        texto: 'Lili era uma raposinha muito tímida. Ela nunca falava com ninguém e sempre ficava escondida atrás das árvores.',
      },
      {
        emoji: '🐻', bg: '#F0FDF4', textoBg: '#DCFCE7',
        titulo: 'O Urso Gentil',
        texto: 'Um dia, um urso chamado Bruno disse: "Oi Lili, quer brincar comigo?" Lili ficou com medo, mas respondeu baixinho: "Sim!"',
      },
      {
        emoji: '🌿', bg: '#EFF6FF', textoBg: '#DBEAFE',
        titulo: 'A Lição da Amizade',
        texto: 'Bruno e Lili brincaram o dia todo. Lili aprendeu que ser amigo é fácil: basta dar um sorriso e dizer olá! Fim! 🤝',
      },
    ],
    quiz: {
      pergunta: 'O que Lili aprendeu ao brincar com Bruno? 🦊',
      opcoes: ['Amizade começa com um sorriso e um olá', 'Que é melhor ficar sozinha na floresta'],
      correta: 0,
    },
  },

  23: {
    idLicao: 23,
    titulo: 'Viagem ao Mar',
    emoji: '🌊',
    bgHeader: '#EFF6FF',
    paginas: [
      {
        emoji: '🍾', bg: '#EFF6FF', textoBg: '#DBEAFE',
        titulo: 'A Garrafa Misteriosa',
        texto: 'Pedro estava na praia quando viu uma garrafa brilhante. Dentro dela havia uma mensagem: "Venha me encontrar na rocha azul!"',
      },
      {
        emoji: '🌊', bg: '#F0FDFA', textoBg: '#CCFBF1',
        titulo: 'A Aventura Começa',
        texto: 'Pedro nadou corajosamente até a rocha azul. As ondas eram grandes, mas ele não desistiu!',
      },
      {
        emoji: '🐋', bg: '#EFF6FF', textoBg: '#BFDBFE',
        titulo: 'O Amigo do Mar',
        texto: 'Na rocha azul, Pedro encontrou uma baleia bebê que estava sozinha. Eles viraram os melhores amigos do oceano! Fim! 🌊',
      },
    ],
    quiz: {
      pergunta: 'O que Pedro encontrou dentro da garrafa? 🍾',
      opcoes: ['Uma mensagem dizendo onde ir', 'Moedas de ouro do fundo do mar'],
      correta: 0,
    },
  },

  24: {
    idLicao: 24,
    titulo: 'Dragão Amigável',
    emoji: '🐉',
    bgHeader: '#FFF1F2',
    paginas: [
      {
        emoji: '🐉', bg: '#FFF1F2', textoBg: '#FFE4E6',
        titulo: 'O Dragão Assustador',
        texto: 'Todo o reino temia Braso, o dragão gigante. Mas Braso não queria assustar ninguém — ele só queria um amigo!',
      },
      {
        emoji: '👧', bg: '#FDF4FF', textoBg: '#F3E8FF',
        titulo: 'A Menina Corajosa',
        texto: 'A pequena Nina foi até a caverna de Braso sem medo. Ela levou uma torta de morango e perguntou: "Quer ser meu amigo?"',
      },
      {
        emoji: '🔥', bg: '#FFF7ED', textoBg: '#FED7AA',
        titulo: 'O Melhor Amigo',
        texto: 'Braso chorou de alegria e usou seu fogo para iluminar o reino à noite. Todo mundo percebeu que havia julgado errado. Fim! 🐉',
      },
    ],
    quiz: {
      pergunta: 'Por que Braso assustava as pessoas do reino? 🐉',
      opcoes: ['Ele era grande, mas só queria amigos', 'Ele era malvado e perigoso'],
      correta: 0,
    },
  },

  25: {
    idLicao: 25,
    titulo: 'Noite Estrelada',
    emoji: '⭐',
    bgHeader: '#1E1B4B',
    paginas: [
      {
        emoji: '🌙', bg: '#1E1B4B', textoBg: '#312E81',
        titulo: 'Ana e as Estrelas',
        texto: 'Ana não conseguia dormir. Ela foi para a janela e começou a contar as estrelas: uma, duas, três... eram tantas!',
      },
      {
        emoji: '💫', bg: '#1E3A5F', textoBg: '#1E40AF',
        titulo: 'A Estrela Cadente',
        texto: 'De repente, uma estrela riscou o céu brilhando forte. A vovó sempre dizia: "Faça um pedido quando uma estrela cair!"',
      },
      {
        emoji: '❤️', bg: '#3B1F5E', textoBg: '#4C1D95',
        titulo: 'O Pedido Especial',
        texto: 'Ana fechou os olhos e fez seu pedido: "Quero que todos que amo fiquem felizes!" E dormiu sorrindo. Fim! 🌙',
      },
    ],
    quiz: {
      pergunta: 'O que Ana fez quando viu a estrela cadente? ⭐',
      opcoes: ['Fechou os olhos e fez um pedido', 'Gritou assustada e fechou a janela'],
      correta: 0,
    },
  },

  26: {
    idLicao: 26,
    titulo: 'Festa no Castelo',
    emoji: '🏰',
    bgHeader: '#FFFBEB',
    paginas: [
      {
        emoji: '🏰', bg: '#FFFBEB', textoBg: '#FEF3C7',
        titulo: 'O Convite Real',
        texto: 'Todos do reino receberam um convite do rei: "Grande festa no castelo amanhã! Venham fantasiados!"',
      },
      {
        emoji: '👑', bg: '#FFF7ED', textoBg: '#FED7AA',
        titulo: 'O Príncipe Atrapalhado',
        texto: 'O príncipe Leo tropeçou na fantasia, derrubou o bolo e caiu na fonte. Todos riram gostoso, até o próprio Leo!',
      },
      {
        emoji: '🎉', bg: '#F0FDF4', textoBg: '#DCFCE7',
        titulo: 'A Festa Mais Especial',
        texto: 'O rei disse: "Esta foi a festa mais divertida porque todos riram juntos!" A gargalhada une pessoas! Fim! 🏰',
      },
    ],
    quiz: {
      pergunta: 'Por que a festa no castelo foi considerada especial pelo rei? 🏰',
      opcoes: ['Porque todos riram juntos e se divertiram', 'Porque o bolo era enorme e gostoso'],
      correta: 0,
    },
  },
};

export default HISTORIAS;
