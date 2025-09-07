'use client';

import React, { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@heroui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { BsEmojiSmile } from 'react-icons/bs';
import { useTranslation } from 'react-i18next';


const EmojiPickerReact = dynamic(
  () => import('emoji-picker-react'),
  { 
    ssr: false,
    loading: () => <div className="w-8 h-8 animate-pulse bg-gray-200 dark:bg-gray-700 rounded"></div>
  }
);

interface EmojiPickerProps {
  /**
   * Callback function triggered when an emoji is selected.
   * @param emoji - The selected emoji character.
   */
  onEmojiSelect: (emoji: string) => void;
  className?: string;
}

interface EmojiClickData {
  emoji: string;
  activeSkinTone?: string;
  unified?: string;
  unifiedWithoutSkinTone?: string;
  originalUnified?: string;
  names?: string[];
}

export default function EmojiPicker({ onEmojiSelect, className = "" }: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [screenSize, setScreenSize] = useState({ width: 320, height: 400 });
  const pickerRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  useEffect(() => {
    setMounted(true);
    
    const updateScreenSize = () => {
      const isMobile = window.innerWidth < 768;
      setScreenSize({
        width: isMobile ? Math.min(300, window.innerWidth - 40) : 320,
        height: isMobile ? 350 : 400
      });
    };

    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    onEmojiSelect(emojiData.emoji);
    setIsOpen(false);
  };

  if (!mounted) {
    return (
      <Button
        isIconOnly
        className={`bg-white/50 dark:bg-gray-700/50 text-gray-400 ${className}`}
        size="lg"
        disabled
      >
        <BsEmojiSmile className="text-xl" />
      </Button>
    );
  }

  return (
    <div className={`relative ${className}`} ref={pickerRef}>
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          isIconOnly
          onClick={() => setIsOpen(!isOpen)}
          className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl w-12 h-12 sm:w-14 sm:h-14"
          size="lg"
          aria-label={isOpen ? t('chat.interface.emoji_picker.botao_fechar') : t('chat.interface.emoji_picker.botao_abrir')}
          title={isOpen ? t('chat.interface.emoji_picker.botao_fechar') : t('chat.interface.emoji_picker.botao_abrir')}
        >
          <BsEmojiSmile className="text-xl sm:text-2xl" />
        </Button>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute bottom-full right-0 mb-2 z-50"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-600 p-2 backdrop-blur-sm">
              <EmojiPickerReact
                onEmojiClick={handleEmojiClick}
                autoFocusSearch={false}
                width={screenSize.width}
                height={screenSize.height}
                previewConfig={{
                  showPreview: false
                }}
                searchDisabled={false}
                skinTonesDisabled={false}
                lazyLoadEmojis={true}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
