'use client';

import { HeroUIProvider } from '@heroui/react';
import { ThemeProvider } from './NextThemesProvider';
import { ReactNode, useEffect, useState } from 'react';
import { CookiesProvider } from 'react-cookie';
import { ToastContainer } from 'react-toastify';
import { ViewTransitions } from 'next-view-transitions';
import 'react-toastify/dist/ReactToastify.css';
import VLibras from 'vlibras-nextjs';
import { SpeechProvider } from './contexts/SpeechContext';
import { TranslationProvider } from './contexts/TranslationContext';
import { ColorBlindProvider } from './contexts/ColorBlindContext';
import { FontSizeProvider } from './contexts/FontSizeContext';
import ColorBlindFilters from './components/global/ColorBlindFilters';

import i18n from '../i18n';

export default function Providers({ children }: { children: ReactNode }) {
  const [isI18nInitialized, setIsI18nInitialized] = useState(false);

  useEffect(() => {
    const initI18n = async () => {
      if (!i18n.isInitialized) {
        try {
          await i18n.init();
        } catch (error) {
          console.error('Failed to initialize i18n:', error);
        }
      }
      setIsI18nInitialized(true);
    };

    initI18n();
  }, []);

  if (!isI18nInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  return (
    <ViewTransitions>
      <div>
        <VLibras forceOnload />
      </div>
      <HeroUIProvider>
        <CookiesProvider>
          {' '}
          <ThemeProvider attribute="class" enableSystem themes={['light', 'dark']}>
            {' '}
            <ColorBlindProvider>
              <ColorBlindFilters />
              <FontSizeProvider>
                <SpeechProvider>
                  <TranslationProvider>{children}</TranslationProvider>
                </SpeechProvider>
              </FontSizeProvider>
            </ColorBlindProvider>
            <ToastContainer />
          </ThemeProvider>
        </CookiesProvider>
      </HeroUIProvider>
    </ViewTransitions>
  );
}
