"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Spinner } from "@heroui/react";
import Message from "./Message";
import MessageList from "./MessageList";

interface UserDataMap {
  [key: string]: {
    apelido: string;
    avatar: string;
    color: string;
  };
}

interface TypingEntry { userToken: string; typing: boolean }

export interface ChatBodyProps {
  mensagens: any[];
  messageLoading: boolean;
  usersTyping: TypingEntry[];
  usersRoomData: UserDataMap;
  currentUserToken?: string;
  chatCompacto: boolean;
  t: (k: string) => string;
  showGoToBottom: boolean;
  onGoToBottom: () => void;
  messageListRef: React.RefObject<HTMLDivElement | null>;
}

function ChatBodyBase({
  mensagens,
  messageLoading,
  usersTyping,
  usersRoomData,
  currentUserToken,
  chatCompacto,
  t,
  showGoToBottom,
  onGoToBottom,
  messageListRef,
}: ChatBodyProps) {
  useEffect(() => {
    console.log("Rendering ChatBody with messages:", mensagens);
  }, [mensagens]);
  return (
    <div className="relative h-full">
      <MessageList
        ref={messageListRef}
        className={`messageList h-full overflow-y-auto p-3 sm:p-6 space-y-3 sm:space-y-4 ${chatCompacto ? 'chat-compact' : ''}`}
      >
        {mensagens.map((message, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Message
              date={message.date}
              lingua={message.lingua}
              ownMessage={message.senderId == currentUserToken}
              originalMessage={message.message}
              senderApelido={message.senderApelido}
              senderAvatar={message.senderAvatar}
              senderColor={message.senderColor}
              compact={chatCompacto}
              isAudio={message.isAudio}
            >
              {message.isAudio ? (
                <audio controls controlsList="nodownload" className="w-full rounded-lg">
                  <source src={message.message} type="audio/webm" />
                  {t('chat.interface.audio_nao_suportado')}
                </audio>
              ) : (
                message.messageTraduzido
              )}
            </Message>
          </motion.div>
        ))}
        {messageLoading && (
          <motion.div
            className="flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Spinner color="primary" size="lg" />
          </motion.div>
        )}
        <AnimatePresence>
          {usersTyping.map(
            ({ userToken, typing }) =>
              typing &&
              userToken !== currentUserToken &&
              usersRoomData[userToken] && (
                <motion.div
                  key={userToken}
                  className="flex items-center justify-center gap-2 sm:gap-3 text-gray-500 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-2 sm:p-3 mx-2 sm:mx-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.3 }}
                >
                  <Image
                    src={usersRoomData[userToken].avatar}
                    alt={usersRoomData[userToken].apelido}
                    width={30}
                    height={30}
                    className="rounded-full border-2"
                    style={{ borderColor: usersRoomData[userToken].color }}
                  />
                  <motion.span
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-xs sm:text-sm font-medium"
                    style={{ color: usersRoomData[userToken].color }}
                  >
                    {usersRoomData[userToken].apelido} {t('chat.interface.esta_digitando')}...
                  </motion.span>
                </motion.div>
              )
          )}
        </AnimatePresence>
      </MessageList>
      {showGoToBottom && (
        <button
          onClick={onGoToBottom}
          className="absolute right-4 bottom-20 sm:bottom-8 z-50 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-lg p-3 flex items-center gap-2 hover:scale-105 transition-all duration-300"
          style={{ boxShadow: '0 4px 24px 0 rgba(80,80,200,0.15)' }}
          aria-label={t('chat.interface.ir_para_o_final')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          <span className="hidden sm:inline text-xs font-semibold">{t('chat.interface.ir_para_o_final')}</span>
        </button>
      )}
    </div>
  );
}

const ChatBody = React.memo(
  ChatBodyBase,
  (prev, next) =>
    prev.mensagens === next.mensagens &&
    prev.messageLoading === next.messageLoading &&
    prev.usersTyping === next.usersTyping &&
    prev.usersRoomData === next.usersRoomData &&
    prev.currentUserToken === next.currentUserToken &&
    prev.chatCompacto === next.chatCompacto &&
    prev.showGoToBottom === next.showGoToBottom &&
    prev.onGoToBottom === next.onGoToBottom &&
    prev.messageListRef === next.messageListRef
);

export default ChatBody;
