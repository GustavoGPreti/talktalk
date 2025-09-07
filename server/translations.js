
const translations = {
  'pt-BR': {
    roomFull: 'Sala está cheia! Máximo de 4 usuários permitidos.',
    roomNotFound: 'Sala não encontrada',
    errorJoiningRoom: 'Erro ao entrar na sala',
    userDataError: 'Erro nos dados do usuário',
    databaseUnavailable: 'Banco de dados não disponível'
  },
  'en-US': {
    roomFull: 'Room is full! Maximum of 4 users allowed.',
    roomNotFound: 'Room not found',
    errorJoiningRoom: 'Error joining room',
    userDataError: 'User data error',
    databaseUnavailable: 'Database unavailable'
  },
  'es-ES': {
    roomFull: '¡Sala está llena! Máximo de 4 usuarios permitidos.',
    roomNotFound: 'Sala no encontrada',
    errorJoiningRoom: 'Error al unirse a la sala',
    userDataError: 'Error en los datos del usuario',
    databaseUnavailable: 'Base de datos no disponible'
  }
};

function getTranslation(language, key) {
  const lang = translations[language] || translations['pt-BR'];
  return lang[key] || translations['pt-BR'][key] || key;
}

module.exports = { translations, getTranslation };
