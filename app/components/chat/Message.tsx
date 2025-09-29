import moment from 'moment-timezone';
import Image from 'next/image';
import { Moment } from 'moment-timezone';
import { useState, useEffect } from 'react';
import { Play, Pause, AlertCircle } from 'lucide-react';
import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpeech } from '@/app/contexts/SpeechContext';
import { useTranslation } from '@/app/contexts/TranslationContext';
import { useFontSize } from '@/app/contexts/FontSizeContext';
import { useTranslation as useI18nTranslation } from 'react-i18next';
import TranscriptButton from './Transcript';

interface MessageProps {
  isAudio: boolean;
  children: React.ReactNode;
  date: Moment | string | Date;
  lingua: string;
  ownMessage: boolean;
  originalMessage: string;
  senderApelido: string;
  senderAvatar: string;
  senderColor: string;
  compact?: boolean;
}

/**
 * A component that provides a microphone icon with play/pause functionality for text-to-speech.
 * @param {object} props - The component props.
 * @param {string | React.ReactNode} props.text - The text to be spoken.
 * @param {boolean} [props.isOwnMessage=false] - Whether the message is from the current user.
 */

function MicComponent({ text, isOwnMessage = false }: { text: string | React.ReactNode; isOwnMessage?: boolean }) {
  const { settings } = useSpeech();
  const { t } = useI18nTranslation('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const speechRef = React.useRef<SpeechSynthesisUtterance | null>(null);

  const micDataRef = React.useRef({
    isNewMessage: true,
    hasBeenRead: false,
    textKey: typeof text === 'string' ? text.slice(0, 20) : 'message',
  });

  const micId = `mic-${Math.random().toString(36).substring(2, 7)}`;

  const micElementRef = React.useRef<HTMLDivElement>(null);

  const getSpeechContent = React.useCallback((input: string | React.ReactNode): string => {
    if (!input) return '';
    if (typeof input === 'string') return input;
    if (typeof input === 'object' && input !== null) {
      if ('messageTraduzido' in input) return (input as any).messageTraduzido;
      if ('message' in input) return (input as any).message;
      if (typeof (input as any).toString === 'function') return (input as any).toString();
    }
    return '';
  }, []);

  const speechText = React.useMemo(() => getSpeechContent(text), [text, getSpeechContent]);

  const handlePlayPause = React.useCallback(() => {
    if (!speechRef.current) return;

    if (isPlaying) {
      window.speechSynthesis.pause();
    } else {
      if (progress === 0) {
        window.speechSynthesis.speak(speechRef.current);
      } else {
        window.speechSynthesis.resume();
      }
    }
  }, [isPlaying, progress]);
  React.useEffect(() => {
    if (!speechText) return;

    const utterance = new SpeechSynthesisUtterance(speechText);
    speechRef.current = utterance;

    utterance.volume = settings.volume / 100;
    utterance.rate = settings.rate;
    utterance.pitch = settings.pitch;

    if (settings.voice) {
      const voices = window.speechSynthesis.getVoices();
      const selectedVoice = voices.find((v) => v.name === settings.voice);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      setProgress(0);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setProgress(0);
    };

    utterance.onpause = () => setIsPlaying(false);
    utterance.onresume = () => setIsPlaying(true);
    utterance.onboundary = (event) => {
      const { charIndex } = event;
      const progressValue = speechText ? (charIndex / speechText.length) * 100 : 0;
      setProgress(progressValue);
    };
    if (settings.autoRead && micDataRef.current.isNewMessage && !micDataRef.current.hasBeenRead && !isOwnMessage) {
      window.speechSynthesis.speak(utterance);
      micDataRef.current.hasBeenRead = true;
      micDataRef.current.isNewMessage = false;
    }
    return () => {
      window.speechSynthesis.cancel();
    };
  }, [speechText, settings, isOwnMessage]);

  React.useEffect(() => {
    if (micElementRef.current) {
      (micElementRef.current as any).__micData = micDataRef.current;
    }
  }, []);
  if (!speechText) return null;
  return (
    <div
      id={micId}
      ref={micElementRef}
      className="flex items-center gap-1.5 rounded-full bg-primary-50/50 dark:bg-primary-900/20 px-1.5 py-0.5"
    >
      {' '}
      <button
        onClick={handlePlayPause}
        className="rounded-full p-1 hover:bg-primary-100/80 dark:hover:bg-primary-800/30 transition-colors"
        title={isPlaying ? t('chat.mensagem.pausar') : t('chat.mensagem.reproduzir')}
      >
        {isPlaying ? (
          <Pause size={14} className="text-primary-600 dark:text-primary-400" />
        ) : (
          <Play size={14} className="text-primary-600 dark:text-primary-400 ml-0.5" />
        )}
      </button>
      <AnimatePresence>
        {isPlaying && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: '4rem', opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="relative overflow-hidden"
          >
            <div className="w-16 h-0.5 bg-primary-200 dark:bg-primary-700 rounded-full">
              <div
                className="h-full bg-primary-500 dark:bg-primary-400 transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * A component that displays an audio message.
 * @param {object} props - The component props.
 * @param {string} props.src - The source URL of the audio file.
 */
function AudioMessage({ src, ownMessage = false }: { src: string; ownMessage?: boolean }) {
  const { settings } = useSpeech();
  const { t } = useI18nTranslation('');
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = settings.volume / 100;
    audio.playbackRate = settings.rate;
  }, [settings.volume, settings.rate]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onLoadedMetadata = () => setDuration(audio.duration || 0);
    const onTimeUpdate = () => setCurrentTime(audio.currentTime || 0);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);
    return () => {
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const x = Math.min(Math.max(e.clientX - rect.left, 0), rect.width);
    const pct = x / rect.width;
    audio.currentTime = pct * (duration || 0);
  };

  const formatTime = (sec: number) => {
    if (!isFinite(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60)
      .toString()
      .padStart(2, '0');
    return `${m}:${s}`;
  };

  const progressPct = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <div
      className={`w-full max-w-[360px] select-none ${ownMessage ? 'text-white' : 'text-gray-900 dark:text-gray-100'}`}
      aria-label={t('chat.interface.mensagem_audio')}
    >
      {/* Hidden native audio for actual playback */}
      <audio ref={audioRef} className="hidden">
        <source src={src} type="audio/webm" />
      </audio>

      <div
        className={`flex items-center gap-3 overflow-hidden ${
          ownMessage
            ? 'bg-transparent border-0 shadow-none px-0 py-0'
            : 'rounded-xl border px-3 py-2 shadow-sm bg-white/70 dark:bg-zinc-900/60 border-gray-200/50 dark:border-zinc-700/50'
        }`}
      >
        <button
          type="button"
          onClick={togglePlay}
          className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
            ownMessage
              ? 'bg-white/20 hover:bg-white/30 text-white'
              : 'bg-primary-100 hover:bg-primary-200 text-primary-700 dark:bg-primary-900/40 dark:hover:bg-primary-900/60 dark:text-primary-200'
          }`}
          aria-label={isPlaying ? t('chat.mensagem.pausar') : t('chat.mensagem.reproduzir')}
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
        </button>

        <div className="flex-1 min-w-0">
          <div
            className={`relative h-2 w-40 cursor-pointer rounded-full ${
              ownMessage ? 'bg-white/20' : 'bg-gray-200 dark:bg-zinc-700'
            }`}
            onClick={seek}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={duration || 0}
            aria-valuenow={currentTime || 0}
          >
            <div
              className={`h-2 rounded-full transition-[width] duration-100 ease-linear ${
                ownMessage ? 'bg-white/70' : 'bg-gradient-to-r from-primary-400 to-secondary-500'
              }`}
              style={{ width: `${progressPct}%` }}
            />
            <div
              className={`absolute -top-1 h-4 w-4 rounded-full translate-x-[-50%] ${
                ownMessage ? 'bg-white' : 'bg-primary-500'
              }`}
              style={{ left: `${progressPct}%` }}
            />
          </div>
          <div className="mt-1 flex items-center justify-between text-[10px] opacity-80">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Message({
  isAudio,
  children,
  date,
  lingua,
  ownMessage,
  originalMessage,
  senderApelido,
  senderAvatar,
  senderColor,
  compact = false,
}: MessageProps) {
  const { fontSize } = useFontSize();
  const { settings: translationSettings } = useTranslation();
  const { t } = useI18nTranslation('');

  const [showOriginal, setShowOriginal] = useState(!translationSettings.autoTranslate);

  useEffect(() => {
    if (!ownMessage && !isAudio) {
      setShowOriginal(!translationSettings.autoTranslate);

      setTimeout(() => {
        document.querySelectorAll('[id^="mic-"]').forEach((micComponent) => {
          if ((micComponent as any).__micData) {
            (micComponent as any).__micData.isNewMessage = false;
          }
        });
      }, 0);
    }
  }, [translationSettings.autoTranslate, ownMessage, isAudio]);

  const getMessageContent = (content: React.ReactNode): React.ReactNode => {
    return content;
  };
  const [showAudioOriginal, setShowAudioOriginal] = useState(true);
  const renderContent = () => {
    if (isAudio) {
      return (
        <div className="flex flex-col items-start w-full">
          <AudioMessage src={originalMessage} ownMessage={ownMessage} />
          {!ownMessage && (
            <div className="flex gap-3 mt-2 w-full items-center">
              <TranscriptButton base64={originalMessage} lingua={lingua} />
            </div>
          )}
        </div>
      );
    }
    return showOriginal ? originalMessage : getMessageContent(children);
  };

  const formattedDate = moment(date).toDate().toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <>
      {' '}
      <div
        className={`
          relative mb-3 flex items-start gap-3 
          ${compact ? 'py-1' : 'py-3'} 
          ${ownMessage ? 'flex-row-reverse' : 'flex-row'}
          font-size-${fontSize}
        `}
      >
        {' '}
        {!compact && (
          <Image
            src={senderAvatar}
            alt={senderApelido}
            width={44}
            height={44}
            className="rounded-full border-2 p-1 dark:invert-0 invert shadow-lg"
            style={{ borderColor: senderColor }}
          />
        )}
        <div className={`select-text flex max-w-[80%] flex-col ${ownMessage ? 'items-end' : 'items-start'}`}>
          {compact ? (
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-500">{formattedDate}</span>
              <span className="font-medium" style={{ color: senderColor }}>
                {senderApelido}:
              </span>{' '}
              <span className="text-sm">{renderContent()}</span>
              {!ownMessage && !isAudio && (
                <>
                  {' '}
                  <span className="text-xs flex flex-col text-gray-500 mt-1">
                    {' '}
                    <div className="mt-1 flex">
                      {' '}
                      <p>
                        {showOriginal ? t('chat.mensagem.original') : `${t('chat.mensagem.traduzido_de')} (${lingua})`}
                      </p>
                      <button
                        onClick={() => {
                          setShowOriginal(!showOriginal);
                          document.querySelectorAll('[id^="mic-"]').forEach((micComponent) => {
                            if ((micComponent as any).__micData) {
                              (micComponent as any).__micData.isNewMessage = false;
                            }
                          });
                        }}
                        className="ml-1 text-xs text-primary-400 hover:text-primary-500 hover:underline"
                      >
                        {showOriginal ? t('chat.mensagem.ver_traducao') : t('chat.mensagem.ver_original')}
                      </button>
                    </div>
                  </span>
                </>
              )}
            </div>
          ) : (
            <>
              {' '}
              <div className="flex items-center gap-2">
                {ownMessage && !isAudio && (
                  <>
                    <MicComponent text={originalMessage} isOwnMessage={true} />
                  </>
                )}
                <span className="font-medium" style={{ color: senderColor }}>
                  {senderApelido}
                </span>
                <span className="text-xs text-gray-500">{formattedDate}</span>
                {!ownMessage && !isAudio && <MicComponent text={getMessageContent(children)} isOwnMessage={false} />}
              </div>{' '}
              <div
                className={`relative mt-2 max-w-full rounded-2xl p-4 shadow-lg ${ownMessage ? 'setinha-own bg-primary-500 text-white' : 'setinha bg-gray-200 dark:bg-zinc-800'}`}
              >
                {renderContent()}
                {!ownMessage && !isAudio && (
                  <>
                    {' '}
                    <div className="text-xs text-gray-500 ">
                      {' '}
                      <div className="mt-1">
                        {' '}
                        {showOriginal ? t('chat.mensagem.original') : `${t('chat.mensagem.traduzido_de')} (${lingua})`}
                        <button
                          onClick={() => {
                            setShowOriginal(!showOriginal);
                            document.querySelectorAll('[id^="mic-"]').forEach((micComponent) => {
                              if ((micComponent as any).__micData) {
                                (micComponent as any).__micData.isNewMessage = false;
                              }
                            });
                          }}
                          className="ml-2 text-xs text-primary-400 hover:text-primary-500 hover:underline"
                        >
                          {showOriginal ? t('chat.mensagem.ver_traducao') : t('chat.mensagem.ver_original')}
                        </button>
                      </div>
                    </div>{' '}
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default React.memo(Message, (prev, next) => {
  return (
    prev.isAudio === next.isAudio &&
    prev.ownMessage === next.ownMessage &&
    prev.originalMessage === next.originalMessage &&
    prev.senderApelido === next.senderApelido &&
    prev.senderAvatar === next.senderAvatar &&
    prev.senderColor === next.senderColor &&
    prev.compact === next.compact &&
    String(prev.date) === String(next.date) &&
    prev.lingua === next.lingua &&
    // children may be translated message content; rely on originalMessage to trigger rerender
    true
  );
});
