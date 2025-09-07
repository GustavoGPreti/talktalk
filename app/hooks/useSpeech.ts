'use client';

import { useState, useEffect, useCallback } from 'react';

interface SpeechSettings {
  volume: number;
  rate: number;
  pitch: number;
  voice: string;
  autoRead: boolean;
}

const SPEECH_SETTINGS_KEY = 'talktalk_speech_settings';

export const useSpeech = () => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [settings, setSettings] = useState<SpeechSettings>({
    volume: 75,
    rate: 1,
    pitch: 1,
    voice: '',
    autoRead: false,
  });
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);

      if (!settings.voice && availableVoices.length > 0) {
        setSettings(prev => ({
          ...prev,
          voice: availableVoices[0].name
        }));
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    const savedSettings = localStorage.getItem(SPEECH_SETTINGS_KEY);
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
    
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [settings.voice]);
  useEffect(() => {
    localStorage.setItem(SPEECH_SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  const speak = useCallback((text: string) => {
    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    utterance.volume = settings.volume / 100;
    utterance.rate = settings.rate;
    utterance.pitch = settings.pitch;

    const selectedVoice = voices.find(voice => voice.name === settings.voice);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    window.speechSynthesis.speak(utterance);
  }, [settings, voices]);

  const updateSettings = useCallback((newSettings: Partial<SpeechSettings>) => {
    setSettings(prev => ({
      ...prev,
      ...newSettings
    }));
  }, []);

  return {
    voices,
    settings,
    updateSettings,
    speak,
  };
};
