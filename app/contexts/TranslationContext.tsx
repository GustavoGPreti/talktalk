'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface TranslationSettings {
  autoTranslate: boolean;
}

interface TranslationContextType {
  settings: TranslationSettings;
  updateSettings: (newSettings: Partial<TranslationSettings>) => void;
}

const defaultSettings: TranslationSettings = {
  autoTranslate: true,
};

const TranslationContext = createContext<TranslationContextType | null>(null);

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
}

export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<TranslationSettings>(defaultSettings);

  useEffect(() => {
    const savedSettings = localStorage.getItem('talktalk_translation_settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('talktalk_translation_settings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (newSettings: Partial<TranslationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return (
    <TranslationContext.Provider value={{ settings, updateSettings }}>
      {children}
    </TranslationContext.Provider>
  );
}
