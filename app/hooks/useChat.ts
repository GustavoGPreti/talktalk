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

/**
 * Custom hook for managing chat state and interactions.
 * @param socketClient - The Socket.IO client instance.
 * @param userData - The current user's data.
 * @param codigo - The room code.
 * @returns An object with chat state and functions.
 */
export function useChat({ socketClient, userData, codigo }: UseChatProps) {
  const [mensagens, setMensagens] = useState<MessageType[]>([]);
  const [mensagem, setMensagem] = useState<string>('');
  const [messageLoading, setMessageLoading] = useState(false);
  const [pessoasConectadas, setPessoasConectadas] = useState<number>(0);
  const [usersInRoom, setUsersInRoom] = useState<UserData[]>([]);
  const linguaSelecionadaRef = useRef<string>('pt'); // Stores the selected language
  const [isTyping, setIsTyping] = useState<{[key: string]: boolean}>({});
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const [languageChangeTrigger, setLanguageChangeTrigger] = useState(0);
  
  // Initializes the selected language from localStorage on component mount.
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
          console.error('Error loading settings:', error);
          linguaSelecionadaRef.current = 'pt'; // Fallback to default language
        }
      }
    }
  }, []);
  
  /**
   * Callback function to update the selected language and trigger a message reload.
   * @param lingua - The new language code (e.g., 'en', 'pt').
   */
  const onLinguaChange = useCallback((lingua: string) => {
    linguaSelecionadaRef.current = lingua;
    // Triggers a state update to re-fetch and re-translate messages.
    setLanguageChangeTrigger(prev => prev + 1);
  }, []);

  /**
   * Updates the typing status for a specific user.
   * @param userToken - The unique token of the user.
   * @param typing - Boolean indicating if the user is typing.
   */
  const handleTyping = useCallback((userToken: string, typing: boolean) => {
    setIsTyping(prev => ({
      ...prev,
      [userToken]: typing
    }));
  }, []);

  /**
   * Emits the user's typing status to the server.
   * A timeout is set to automatically send a 'false' status after 5 seconds of inactivity.
   * @param typing - Boolean indicating if the user has started or stopped typing.
   */
  const emitTypingStatus = useCallback((typing: boolean) => {
    if (!socketClient || !userData?.userToken) return;

    // Clears any existing timeout to avoid premature 'stop typing' events.
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Emits the current typing status to the room.
    socketClient.emit('typing', {
      typing,
      userToken: userData.userToken,
      room: codigo
    });

    // If the user is typing, set a timeout to automatically clear the status.
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

  /**
   * Processes incoming messages, handling translation and state updates.
   * @param message - The message object received from the socket.
   */
  const handleMessage = async (message: any) => {
    if (!message || !message.message) {
      console.error('Invalid message received:', message);
      return;
    }
    
    const clientTz = moment.tz.guess(true);
    const messageDate = moment(message.date).tz(clientTz);
    const isOwnMessage = message.userToken === userData?.userToken;

    // Audio messages are added directly without translation.
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

    try {
      // Translates the message if it's not from the current user and the language differs.
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

        if (!response.ok) throw new Error('Translation failed');
        const { result: traduzido } = await response.json();

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
        // Adds the message without translation if it's from the user or languages match.
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
      console.error('Translation error:', error);
      // In case of a translation error, adds the message without translation.
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
  };

  // Effect for handling socket connection and disconnection logs.
  useEffect(() => {
    if (!socketClient) return;

    // Reconnection logic is handled by the main socket provider.
    // This effect is for debugging connection status within this hook.
    const handleConnect = () => {
      console.log('[useChat] Socket connected');
    };

    const handleDisconnect = () => {
      console.log('[useChat] Socket disconnected');
    };

    socketClient.on('disconnect', handleDisconnect);
    socketClient.on('connect', handleConnect);

    return () => {
      socketClient.off('disconnect', handleDisconnect);
      socketClient.off('connect', handleConnect);
    };
  }, [socketClient]);

  // Effect for handling room-specific socket events.
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

  /**
   * Sends a chat message to the server.
   */
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

  /**
   * Fetches and processes the message history for the current room.
   */
  const loadMessageHistory = useCallback(async () => {
    try {
      const response = await fetch(`/api/messages/${codigo}`);
      if (!response.ok) throw new Error('Failed to load messages');
      
      const messages = await response.json();
      
      // Processes and translates historical messages if necessary.
      const processedMessages = await Promise.all(messages.map(async (msg: any) => {
        const isOwnMessage = msg.senderId === userData?.userToken;
        const msgLanguage = msg.linguaOriginal || msg.lingua || 'pt';

        // Translates if the message is not from the user and languages differ.
        if (!isOwnMessage && msgLanguage !== linguaSelecionadaRef.current && linguaSelecionadaRef.current.trim() !== '') {
          try {
            const response = await fetch('/api/translate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                text: msg.message,
                targetLanguage: linguaSelecionadaRef.current,
              }), 
            });

            if (!response.ok) throw new Error('Translation failed');
            const { result: traduzido } = await response.json();

            return {
              ...msg,
              messageTraduzido: traduzido
            };
          } catch (error) {
            console.error('Error translating historical message:', error);
            return msg; // Return original message on translation error
          }
        }
        // Returns the message without translation if it's from the user or languages match.
        return {
          ...msg,
          messageTraduzido: msg.message
        };
      }));

      setMensagens(processedMessages);
    } catch (error) {
      console.error('Error loading message history:', error);
    }
  }, [codigo, userData?.userToken]);

  // Loads message history once on initial component mount.
  const hasLoadedInitialMessages = useRef(false);
  useEffect(() => {
    if (socketClient && userData && !hasLoadedInitialMessages.current) {
      hasLoadedInitialMessages.current = true;
      loadMessageHistory();
    }
  }, [socketClient, userData, loadMessageHistory]);

  // Reloads message history when the selected language changes.
  useEffect(() => {
    if (hasLoadedInitialMessages.current && languageChangeTrigger > 0) {
      loadMessageHistory();
    }
  }, [languageChangeTrigger, loadMessageHistory]);

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
    isTyping,
    emitTypingStatus,
  };
}
