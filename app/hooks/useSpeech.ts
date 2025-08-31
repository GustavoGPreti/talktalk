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
  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);

      // If no voice is selected yet, choose the first available one
      if (!settings.voice && availableVoices.length > 0) {
        setSettings(prev => ({
          ...prev,
          voice: availableVoices[0].name
        }));
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    // Load saved settings
    const savedSettings = localStorage.getItem(SPEECH_SETTINGS_KEY);
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
    
    // Cleanup
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [settings.voice]);

  // Save settings when they change
  useEffect(() => {
    localStorage.setItem(SPEECH_SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  const speak = useCallback((text: string) => {
    if (!window.speechSynthesis) return;

    // Cancel any previous speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    // Apply settings
    utterance.volume = settings.volume / 100;
    utterance.rate = settings.rate;
    utterance.pitch = settings.pitch;

    // Find and apply the selected voice
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
