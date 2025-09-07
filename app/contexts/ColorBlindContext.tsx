'use client';

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

export type ColorBlindType = 'none' | 'protanopia' | 'protanomalia' | 'deuteranopia' | 'deuteranomalia' | 'tritanopia' | 'tritanomalia' | 'acromatopsia';

interface ColorBlindContextType {
  colorBlindType: ColorBlindType;
  setColorBlindType: (type: ColorBlindType) => void;
}

const ColorBlindContext = createContext<ColorBlindContextType | undefined>(undefined);

export const useColorBlind = () => {
  const context = useContext(ColorBlindContext);
  if (context === undefined) {
    throw new Error('useColorBlind must be used within a ColorBlindProvider');
  }
  return context;
};

interface ColorBlindProviderProps {
  children: ReactNode;
}

export const ColorBlindProvider = ({ children }: ColorBlindProviderProps) => {
  const [colorBlindType, setColorBlindTypeState] = useState<ColorBlindType>('none');

  const setColorBlindType = (type: ColorBlindType) => {
    setColorBlindTypeState(type);
    
    const savedSettings = localStorage.getItem('talktalk_user_settings');
    const settings = savedSettings ? JSON.parse(savedSettings) : {};
    settings.colorBlindType = type;
    localStorage.setItem('talktalk_user_settings', JSON.stringify(settings));

    const root = document.documentElement;
    if (type === 'none') {
      root.style.filter = 'none';
    } else {
      root.style.filter = `url("#${type}")`;
    }
  };

  useEffect(() => {
    const savedSettings = localStorage.getItem('talktalk_user_settings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      if (settings.colorBlindType) {
        setColorBlindTypeState(settings.colorBlindType);
        const root = document.documentElement;
        if (settings.colorBlindType === 'none') {
          root.style.filter = 'none';
        } else {
          root.style.filter = `url("#${settings.colorBlindType}")`;
        }
      }
    }
  }, []);

  return (
    <ColorBlindContext.Provider value={{ colorBlindType, setColorBlindType }}>
      {children}
    </ColorBlindContext.Provider>
  );
};
