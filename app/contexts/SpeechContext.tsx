'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface SpeechSettings {
  volume: number;
  pitch: number;
  rate: number;
  voice: string;
  autoRead: boolean;
  enabled: boolean;
}

interface SpeechContextType {
  settings: SpeechSettings;
  availableVoices: SpeechSynthesisVoice[];
  updateSettings: (newSettings: Partial<SpeechSettings>) => void;
  speak: (text: string) => void;
  stopSpeaking: () => void;
}

const defaultSettings: SpeechSettings = {
  volume: 75,
  pitch: 1,
  rate: 1,
  voice: '',
  autoRead: false,
  enabled: true,
};

const SpeechContext = createContext<SpeechContextType | null>(null);

export function useSpeech() {
  const context = useContext(SpeechContext);
  if (!context) {
    throw new Error('useSpeech must be used within a SpeechProvider');
  }
  return context;
}

export function SpeechProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SpeechSettings>(defaultSettings);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  const updateSettings = (newSettings: Partial<SpeechSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  useEffect(() => {
    const savedSettings = localStorage.getItem('talktalk_speech_settings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(parsedSettings);
      } catch (error) {
        console.error('Error parsing speech settings:', error);
      }
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
      
      if (isInitialized && !settings.voice && voices.length > 0) {
        const defaultVoice = voices.find(voice => voice.default) || voices[0];
        setSettings(prev => ({ ...prev, voice: defaultVoice.name }));
      }
    };

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [isInitialized, settings.voice]);

  useEffect(() => {
    if (!isInitialized) return;
    
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        document.querySelectorAll('[id^="mic-"]').forEach((micComponent) => {
          if ((micComponent as any).__micData) {
            (micComponent as any).__micData.isNewMessage = false;
          }
        });
      }, 0);
    }
    
    localStorage.setItem('talktalk_speech_settings', JSON.stringify(settings));
  }, [settings, isInitialized]);
  const speak = (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    utterance.volume = settings.volume / 100;
    utterance.pitch = settings.pitch;
    utterance.rate = settings.rate;
    const voice = availableVoices.find(v => v.name === settings.voice);
    if (voice) {
      utterance.voice = voice;
    }

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  return (
    <SpeechContext.Provider value={{ settings, availableVoices, updateSettings, speak, stopSpeaking }}>
      {children}
    </SpeechContext.Provider>
  );
}
