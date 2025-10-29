"use client";

import React, { KeyboardEvent, ChangeEvent, useMemo } from "react";
import { Button, Textarea } from "@heroui/react";
import { motion } from "framer-motion";
import { IoMicOutline } from "react-icons/io5";
import { IoIosSend } from "react-icons/io";
import EmojiPicker from "./EmojiPicker";
import { useTranslation } from "react-i18next";

export interface ComposerProps {
  value: string;
  placeholder: string;
  isRecording: boolean;
  onChange: (e: ChangeEvent<any>) => void;
  onKeyUp: (e: KeyboardEvent<any>) => void;
  onKeyDown: (e: KeyboardEvent<any>) => void;
  onRecord: () => void;
  onSend: () => void;
  onEmojiSelect: (emoji: string) => void;
}

function ComposerBase({
  value,
  placeholder,
  isRecording,
  onChange,
  onKeyUp,
  onKeyDown,
  onRecord,
  onSend,
  onEmojiSelect,
}: ComposerProps) {
  const { t } = useTranslation();
  const classNames = useMemo(
    () => ({
      input: "textarea-message p-2 sm:p-4 text-sm sm:text-base",
      inputWrapper:
        "w-full bg-white/95 dark:bg-gray-700/95 backdrop-blur-sm border border-gray-200/60 dark:border-gray-600/60 hover:border-primary-500/60 dark:hover:border-primary-400/60 focus-within:border-primary-500 dark:focus-within:border-primary-400 transition-all duration-300 rounded-2xl shadow-lg hover:shadow-xl",
    }),
    []
  );

  const hasText = value.trim().length > 0;
  const showMic = isRecording || !hasText;
  const showSend = !isRecording && hasText;
  const micClass = isRecording
    ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
    : "bg-gradient-to-r from-primary-500 to-secondary-600 hover:from-primary-600 hover:to-secondary-700";

  return (
    <div className="flex items-end gap-2 sm:gap-3 w-full">
      <div className="flex-1 min-w-0">
        <Textarea
          id="chat-message-input"
          aria-label={placeholder}
          placeholder={placeholder}
          minRows={1}
          maxRows={4}
          classNames={classNames as any}
          onChange={onChange}
          onKeyUp={onKeyUp}
          onKeyDown={onKeyDown}
          value={value}
          size="lg"
        />
      </div>
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        {showMic ? (
          <Button
            isIconOnly
            onClick={onRecord}
            color={isRecording ? "danger" : "primary"}
            className={`${micClass} text-white shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl w-12 h-12 sm:w-14 sm:h-14`}
            size="lg"
            aria-label={isRecording ? t('chat.interface.composer.parar_gravacao') : t('chat.interface.composer.iniciar_gravacao')}
          >
            <IoMicOutline className={`text-xl sm:text-2xl ${isRecording ? "animate-pulse" : ""}`} />
          </Button>
        ) : showSend ? (
          <Button
            isIconOnly
            onClick={onSend}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl w-12 h-12 sm:w-14 sm:h-14"
            size="lg"
            aria-label={t('chat.interface.composer.enviar')}
          >
            <IoIosSend className={"text-xl sm:text-2xl"} />
          </Button>
        ) : null}
      </motion.div>
      <EmojiPicker onEmojiSelect={onEmojiSelect} className="" />
    </div>
  );
}

const Composer = React.memo(ComposerBase);
export default Composer;
