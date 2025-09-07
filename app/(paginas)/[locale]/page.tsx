'use client';

import Marquee from 'react-fast-marquee';
import { motion } from 'framer-motion';
import { CountryFlag } from '../../components/countryFlags';
import linguagens from '../../locales/languages.json';
import { memo, ReactNode, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import LanguageDetector from '../../components/functionals/LanguageDetector';

function MarqueeText({ children }: { children: ReactNode }) {
  return <span className="mx-6 text-gray-600 dark:text-gray-400">{children}</span>;
}

interface FlagData {
  flag: string;
  left: number;
  top: number;
  duration: number;
  delay: number;
}

const AnimatedFlag = memo(
  ({
    flagData,
    index,
    onAnimationComplete,
  }: {
    flagData: FlagData;
    index: number;
    onAnimationComplete: (index: number) => void;
  }) => {
    const handleAnimationUpdate = (progress: number) => {
      if (progress >= 0.99) {
        onAnimationComplete(index);
      }
    };

    return (
      <motion.div
        className="absolute text-2xl opacity-60"
        style={{
          left: `${flagData.left}%`,
          top: `${flagData.top}%`,
        }}
        initial={{ y: 50, opacity: 0 }}
        animate={{
          y: -150,
          opacity: [0, 0.6, 0],
        }}
        transition={{
          duration: flagData.duration,
          repeat: Infinity,
          delay: flagData.delay,
          ease: 'easeInOut',
        }}
        onUpdate={(latest) => handleAnimationUpdate((latest.y as number) / -150)}
      >
        <CountryFlag flag={flagData.flag} />
      </motion.div>
    );
  }
);

AnimatedFlag.displayName = 'AnimatedFlag';

export default function Home({}) {
  const [flags, setFlags] = useState<FlagData[]>([]);
  const params = useParams();
  const locale = params?.locale as string || 'pt-BR';
  const { t } = useTranslation('translation', { keyPrefix: 'pagina_inicial' });
  
  useEffect(() => {
    const novasBandeiras = Array.from({ length: 5 }).map(() => ({
      flag: linguagens[Math.floor(Math.random() * linguagens.length)].flag,
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: 12 + Math.random() * 16,
      delay: Math.random() * 12,
    }));
    setFlags(novasBandeiras);
  }, []);

  const atualizarBandeira = useCallback((index: number) => {
    setFlags((prev) => {
      const novaBandeira = linguagens[Math.floor(Math.random() * linguagens.length)].flag;
      if (prev[index].flag === novaBandeira) {
        return prev;
      }
      const novasBandeiras = [...prev];
      novasBandeiras[index] = {
        ...novasBandeiras[index],
        flag: novaBandeira,
      };
      return novasBandeiras;
    });
  }, []);
  return (
    <>
      <LanguageDetector />
      {flags && (
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-blue-50/40 to-cyan-50/40 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <div className="absolute inset-0 opacity-15">
              {flags.map((flagData, i) => (
                <AnimatedFlag
                  key={`${i}-${flagData.flag}`}
                  flagData={flagData}
                  index={i}
                  onAnimationComplete={atualizarBandeira}
                />
              ))}
            </div>
          </div>
        </div>
      )}{' '}
      <div className="flex flex-col h-[85vh]">
        {' '}
        <Marquee
          autoFill
          speed={25}
          className="h-10 pt-1 text-xs opacity-50 font-light tracking-wide border-b border-gray-200/20 dark:border-gray-700/20 backdrop-blur-sm"
        >
          <MarqueeText>Converse</MarqueeText>
          <MarqueeText>•</MarqueeText>
          <MarqueeText>Talk</MarqueeText>
          <MarqueeText>•</MarqueeText>
          <MarqueeText>Hable</MarqueeText>
          <MarqueeText>•</MarqueeText>
          <MarqueeText>Plaudern</MarqueeText>
          <MarqueeText>•</MarqueeText>
          <MarqueeText>채팅</MarqueeText>
          <MarqueeText>•</MarqueeText>
          <MarqueeText>Xatejar</MarqueeText>
          <MarqueeText>•</MarqueeText>
          <MarqueeText>Чат</MarqueeText>
          <MarqueeText>•</MarqueeText>
          <MarqueeText>Chat</MarqueeText>
          <MarqueeText>•</MarqueeText>
          <MarqueeText>แชท</MarqueeText>
          <MarqueeText>•</MarqueeText>
          <MarqueeText>Snak</MarqueeText>
          <MarqueeText>•</MarqueeText>
          <MarqueeText>Sohbet</MarqueeText>
          <MarqueeText>•</MarqueeText>
          <MarqueeText>Razgovor</MarqueeText>
          <MarqueeText>•</MarqueeText>
          <MarqueeText>チャット</MarqueeText>
          <MarqueeText>•</MarqueeText>
          <MarqueeText>Comhrá</MarqueeText>
          <MarqueeText>•</MarqueeText>
          <MarqueeText>Chiacchierata</MarqueeText>
          <MarqueeText>•</MarqueeText>
          <MarqueeText>Ћаскање</MarqueeText>
        </Marquee>{' '}
        <section className="flex flex-1 items-center justify-center px-6 text-center py-4">
          <div className="relative flex flex-col items-center justify-center w-full max-w-4xl">
            <div className="absolute inset-0 -z-10">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl"></div>
              <div className="absolute top-1/4 left-1/4 w-48 h-48 bg-gradient-to-r from-purple-400/15 to-pink-400/15 rounded-full blur-2xl"></div>
              <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-gradient-to-r from-green-400/15 to-blue-400/15 rounded-full blur-2xl"></div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="relative z-10"
            >
              {' '}       
              <motion.h1
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
                className="mb-3 text-3xl font-extrabold !leading-[1.1] sm:text-5xl lg:text-6xl tracking-tight relative"
                style={{
                  background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 50%, #3b82f6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  color: 'transparent'
                }}
              >
                <span className="relative inline-block px-4 py-2">
                  <span className="relative z-10 drop-shadow-lg bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-700 animate-gradient-x">
                  Talk<span className="text-cyan-400">-</span>Talk!
                  </span>
                  <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/30 via-cyan-400/20 to-blue-700/30 rounded-2xl blur-2xl -z-10"></div>
                </span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.6 }}
                className="mb-6 max-w-3xl mx-auto text-sm text-gray-600 dark:text-gray-300 sm:text-base lg:text-lg font-light leading-relaxed"
              >
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {t('descricao')}
                </span>
              </motion.p>{' '}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.8 }}
                className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mb-6"
              >                <Link
                  href={`/${locale}/conversar`}
                  className="group relative inline-flex items-center justify-center px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-[#2563eb] to-[#3b82f6] rounded-xl shadow-xl shadow-blue-500/25 transition-all duration-300 hover:scale-105 hover:shadow-blue-500/40 active:scale-95 sm:text-base overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {t('comece_a_conversar')}
                    <svg
                      className="w-3 h-3 transition-transform group-hover:translate-x-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#1d4ed8] to-[#2563eb] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>                <Link
                  href="/sobre"
                  className="group inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border border-gray-200/60 dark:border-gray-600/60 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:bg-white dark:hover:bg-gray-800 hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-500 active:scale-95 sm:text-base"
                >
                  <span className="flex items-center gap-2">
                    {t('botoes.saiba_mais')}
                    <svg
                      className="w-3 h-3 transition-transform group-hover:rotate-12"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </span>
                </Link>
              </motion.div>{' '}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 1 }}
                className="flex flex-wrap justify-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400"
              >
                {' '}                <motion.div
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                  whileHover={{ y: -1 }}
                >
                  <div className="w-1.5 h-1.5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"></div>
                  <span className="font-medium">{t('highlights.gratuito')}</span>
                </motion.div>
                <motion.div
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                  whileHover={{ y: -1 }}
                >
                  <div className="w-1.5 h-1.5 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full"></div>
                  <span className="font-medium">{t('highlights.sem_cadastro')}</span>
                </motion.div>
                <motion.div
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                  whileHover={{ y: -1 }}
                >
                  <div className="w-1.5 h-1.5 bg-gradient-to-r from-purple-400 to-violet-500 rounded-full"></div>
                  <span className="font-medium">{t('highlights.traducao_instantanea')}</span>
                </motion.div>
                <motion.div
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                  whileHover={{ y: -1 }}
                >
                  <div className="w-1.5 h-1.5 bg-gradient-to-r from-red-400 to-pink-500 rounded-full"></div>
                  <span className="font-medium">{t('highlights.totalmente_seguro')}</span>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
}
