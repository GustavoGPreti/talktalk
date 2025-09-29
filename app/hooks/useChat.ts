import { Socket } from 'socket.io-client';
import { useState, useCallback, useEffect, useRef } from 'react';
import { MessageType, UserData } from '@/app/types/chat';
import moment from 'moment-timezone';
import { cleanMessage } from '@/app/utils/formatters/cleanMessage';

interface UseChatProps {
  socketClient: Socket | null;
  userData: UserData | null;
  codigo: string;
}


export function useChat({ socketClient, userData, codigo }: UseChatProps) {
  const [mensagens, setMensagens] = useState<MessageType[]>([]);
  const [mensagem, setMensagem] = useState<string>('');
  const [messageLoading, setMessageLoading] = useState(false);
  const [pessoasConectadas, setPessoasConectadas] = useState<number>(0);
  const [usersInRoom, setUsersInRoom] = useState<UserData[]>([]);
  const linguaSelecionadaRef = useRef<string>('pt'); // Initialize with default value
  const [isTyping, setIsTyping] = useState<{[key: string]: boolean}>({});
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const [languageChangeTrigger, setLanguageChangeTrigger] = useState(0);
  
  // Initialize language from localStorage on first load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSettings = localStorage.getItem('talktalk_user_settings');
      if (savedSettings) {
        try {
          const settings = JSON.parse(savedSettings);          
          if (settings.linguaSelecionada?.value) {
            linguaSelecionadaRef.current = settings.linguaSelecionada.value;
          }
        } catch (error) {
          console.error('Erro ao carregar configurações:', error);
          linguaSelecionadaRef.current = 'pt'; // fallback
        }
      }
    }
  }, []);
  
  const onLinguaChange = useCallback((lingua: string) => {
    linguaSelecionadaRef.current = lingua;
    console.log('Lingua selecionada:', lingua);
    // Trigger language change to reload messages
    setLanguageChangeTrigger(prev => prev + 1);
  }, []);

  const handleTyping = useCallback((userToken: string, typing: boolean) => {
    setIsTyping(prev => ({
      ...prev,
      [userToken]: typing
    }));
  }, []);

  const emitTypingStatus = useCallback((typing: boolean) => {
    if (!socketClient || !userData?.userToken) return;

    // Limpa o timeout anterior se existir
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Emite o status atual
    socketClient.emit('typing', {
      typing,
      userToken: userData.userToken,
      room: codigo
    });

    // Se estiver digitando, configura timeout para parar após 5 segundos
    if (typing) {
      typingTimeoutRef.current = setTimeout(() => {
        socketClient.emit('typing', {
          typing: false,
          userToken: userData.userToken,
          room: codigo
        });
      }, 5000);
    }
  }, [socketClient, userData, codigo]);

  const handleMessage = async (message: any) => {
    if (!message || !message.message) {
      console.error('Invalid message received:', message);
      return;
    }
    
    const clientTz = moment.tz.guess(true);
    const messageDate = moment(message.date).tz(clientTz);
    const isOwnMessage = message.userToken === userData?.userToken;

    // Se for mensagem de áudio, adiciona sem tradução
    if (message.type === 'audio') {
      setMensagens((prev) => [
        ...prev,
        {
          isAudio: true,
          message: message.message,
          messageTraduzido: message.message,
          senderId: message.userToken,
          senderApelido: message.apelido,
          senderAvatar: message.avatar,
          senderColor: message.senderColor,
          date: messageDate,
          lingua: message.lingua,
          type: 'audio'
        },
      ]);
      return;
    }

    try {      // Só tenta traduzir se não for mensagem própria E idioma for diferente E targetLanguage não estiver vazio
      if (!isOwnMessage && message.lingua !== linguaSelecionadaRef.current && linguaSelecionadaRef.current.trim() !== '') {
        setMessageLoading(true);
        
        const response = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: message.message,
            targetLanguage: linguaSelecionadaRef.current,
          }),
        });

        if (!response.ok) throw new Error('Erro na tradução');
        const { result: traduzido } = await response.json();
        console.log('Mensagem traduzida:', traduzido);

        setMensagens((prev) => [
          ...prev,
          {
            isAudio: message.isAudio,
            message: message.message,
            messageTraduzido: traduzido,
            senderId: message.userToken,
            senderApelido: message.apelido,
            senderAvatar: message.avatar,
            senderColor: message.senderColor,
            date: messageDate,
            lingua: message.lingua,
            type: 'text'
          },
        ]);
      } else {
        setMensagens((prev) => [
          ...prev,
          {
            isAudio: message.isAudio,
            message: message.message,
            messageTraduzido: message.message,
            senderId: message.userToken,
            senderApelido: message.apelido,
            senderAvatar: message.avatar,
            senderColor: message.senderColor,
            date: messageDate,
            lingua: message.lingua,
            type: 'text'
          },
        ]);
      }
    } catch (error) {
      console.error('Erro na tradução:', error);
      // Em caso de erro, adiciona sem tradução
      setMensagens((prev) => [
        ...prev,
        {
          isAudio: message.isAudio,
          message: message.message,
          messageTraduzido: message.message,
          senderId: message.userToken,
          senderApelido: message.apelido,
          senderAvatar: message.avatar,
          senderColor: message.senderColor,
          date: messageDate,
          lingua: message.lingua,
          type: 'text'
        },
      ]);
    } finally {
      setMessageLoading(false);
    }
  };  useEffect(() => {
    if (!socketClient) return;

    // Removida a lógica de reconexão daqui pois já está no componente principal
    // Mantendo apenas logs para debugging
    const handleConnect = () => {
      console.log('[useChat] Socket conectado');
    };

    const handleDisconnect = () => {
      console.log('[useChat] Socket desconectado');
    };

    socketClient.on('disconnect', handleDisconnect);
    socketClient.on('connect', handleConnect);

    return () => {
      socketClient.off('disconnect', handleDisconnect);
      socketClient.off('connect', handleConnect);
    };
  }, [socketClient]);

  useEffect(() => {
    if (!socketClient) return;

    const handleRoomUsersUpdate = (users: UserData[]) => {
      setUsersInRoom(users);
      setPessoasConectadas(users.length);
    };

    const handleRedirectToHome = () => {
      window.location.href = '/';
    };

    socketClient.on('room-users-update', handleRoomUsersUpdate);
    socketClient.on('redirect-to-home', handleRedirectToHome);

    return () => {
      socketClient.off('room-users-update', handleRoomUsersUpdate);
      socketClient.off('redirect-to-home', handleRedirectToHome);
    };
  }, [socketClient]);

  const sendMessage = useCallback(() => {
    if (socketClient && mensagem && mensagem.trim() && userData) {
      const messageContent = cleanMessage(mensagem);
      if (!messageContent) return; // Don't send if message is empty after cleaning
      
      const messageType = messageContent.startsWith('data:audio') ? 'audio' : 'text';
      
      socketClient.emit(
        'sendMessage',
        messageContent,
        userData.userToken,
        userData.color,
        userData.apelido,
        userData.avatar,
        codigo,
        linguaSelecionadaRef.current,
        messageType
      );
      setMensagem('');
      emitTypingStatus(false);
    }
  }, [socketClient, mensagem, codigo, userData, emitTypingStatus]);
  // Função para carregar histórico de mensagens
  const loadMessageHistory = useCallback(async () => {
    try {
      const response = await fetch(`/api/messages/${codigo}`);
      if (!response.ok) throw new Error('Falha ao carregar mensagens');
      
      const messages = await response.json();
      
      // Processa e traduz as mensagens se necessário
      const processedMessages = await Promise.all(messages.map(async (msg: any) => {
        const isOwnMessage = msg.senderId === userData?.userToken;        // Só traduz se NÃO for mensagem própria E o idioma for diferente E targetLanguage não estiver vazio
        const msgLanguage = msg.linguaOriginal || msg.lingua || 'pt';
        if (!isOwnMessage && msgLanguage !== linguaSelecionadaRef.current && linguaSelecionadaRef.current.trim() !== '') {
          try {
            console.log('Traduzindo mensagem do histórico:', {
              text: msg.message,
              fromLanguage: msgLanguage,
              targetLanguage: linguaSelecionadaRef.current
            });
            
            const response = await fetch('/api/translate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                text: msg.message,
                targetLanguage: linguaSelecionadaRef.current,
              }), 
            });

            if (!response.ok) throw new Error('Erro na tradução');
            const { result: traduzido } = await response.json();

            return {
              ...msg,
              messageTraduzido: traduzido
            };
          } catch (error) {
            console.error('Erro ao traduzir mensagem do histórico:', error);
            return msg;
          }
        }
        // Se for mensagem própria OU mesmo idioma, retorna sem traduzir
        return {
          ...msg,
          messageTraduzido: msg.message
        };
      }));

      setMensagens(processedMessages);
    } catch (error) {
      console.error('Erro ao carregar histórico de mensagens:', error);
    }
  }, [codigo, userData?.userToken]);
  // Carrega mensagens quando o componente monta - apenas uma vez
  const hasLoadedInitialMessages = useRef(false);
  useEffect(() => {
    if (socketClient && userData && !hasLoadedInitialMessages.current) {
      hasLoadedInitialMessages.current = true;
      loadMessageHistory();
      console.log('loadMessageHistory | userData', userData);
    }
  }, [socketClient, userData, loadMessageHistory]);
  // Recarrega mensagens quando o idioma muda
  useEffect(() => {
    if (hasLoadedInitialMessages.current && languageChangeTrigger > 0) {
      loadMessageHistory();
    }
  }, [languageChangeTrigger, loadMessageHistory]);

  // Remova este useEffect que estava duplicando a chamada
  // useEffect(() => {
  //   if (mensagens.length > 0) {
  //     loadMessageHistory();
  //   }
  // }, [linguaSelecionadaRef.current]);

  return {
    mensagens,
    setMensagens,
    mensagem,
    setMensagem,
    messageLoading,
    pessoasConectadas,
    setPessoasConectadas,
    handleMessage,
    sendMessage,
    handleTyping,
    usersInRoom,
    onLinguaChange,
    linguaSelecionadaRef,
    isTyping,
    emitTypingStatus,
  };
}
