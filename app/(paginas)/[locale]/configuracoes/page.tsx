'use client';

import React, { useState, useEffect, useCallback, ChangeEvent, useMemo, useRef, useLayoutEffect } from 'react';
import { Image } from '@heroui/react';
import { Save, Volume2, Moon, Sun, Globe, User, Bell, MessageSquare, Mic, Sliders, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import languagesData from '@/app/locales/languages.json';
import ColorBlindSettings from '@/app/components/functionals/ColorBlindSettings';
import { useColorBlind, ColorBlindType } from '@/app/contexts/ColorBlindContext';

import { LanguageSelector } from '@/app/components/functionals/LanguageSelector';
import { colors as colorsData } from '@/app/components/functionals/ColorsSelector';
import ColorSelector from '@/app/components/functionals/ColorsSelector';
import { AvatarSelector } from '@/app/components/functionals/AvatarSelector';
import { RandomNicks } from '@/app/utils/strings/randomNicks';
import AvatarDropdown from '@/app/components/functionals/AvatarDropdown';
import { useFontSize } from '@/app/contexts/FontSizeContext';
import { useSpeech } from '@/app/contexts/SpeechContext';
import { useTranslation } from '@/app/contexts/TranslationContext';
import SpeechSettings from '@/app/components/functionals/SpeechSettings';

const UserSettingsPage = () => {
  const supportedLanguages = {
    'pt-BR': 'Português (Brasil)',
    'en-US': 'Inglês (Estados Unidos)',
    'es-ES': 'Espanhol (Espanha)',
    'fr-FR': 'Francês (França)',
    'de-DE': 'Alemão (Alemanha)',
    'it-IT': 'Italiano (Itália)',
    'ja-JP': 'Japonês (Japão)',
    'zh-CN': 'Chinês (China)',
    'ru-RU': 'Russo (Rússia)',
    'ar-SA': 'Árabe (Arábia Saudita)',
  };
  // Estados para as configurações do usuário
  const [preferredLanguage, setPreferredLanguage] = useState('pt-BR');
  const [userName, setUserName] = useState('');
  const [userApelido, setUserApelido] = useState('');
  const [avatar, setAvatar] = useState('/api/placeholder/100/100');
  const [userColor, setUserColor] = useState('#3b82f6');
  const [darkMode, setDarkMode] = useState(false);
  const [compactMode, setCompactMode] = useState(false);
  const [autoTranslate, setAutoTranslate] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');

  // Hook de síntese de voz
  const { settings, updateSettings, speak } = useSpeech();
  const { settings: translationSettings, updateSettings: updateTranslationSettings } = useTranslation();
  const [isSaving, setIsSaving] = useState(false);
  const [quietHoursStart, setQuietHoursStart] = useState('22:00');
  const [quietHoursEnd, setQuietHoursEnd] = useState('07:00');
  const [isColorModalOpenned, setColorModalOpenned] = useState(false);
  const [avatarColor, setAvatarColor] = useState('');
  const [avatarDetails, setAvatarDetails] = useState<{ avatarURL: string; avatarName: string }>({
    avatarURL: '',
    avatarName: '',
  }); // Use the ColorBlind context directly
  const { colorBlindType, setColorBlindType } = useColorBlind();

  const theme = useTheme();

  const { fontSize, setFontSize } = useFontSize();

  // Add new function to save settings
  const saveUserSettings = useCallback((settings: any) => {
    localStorage.setItem('talktalk_user_settings', JSON.stringify(settings));
  }, []);
  const [linguaSelecionada, setLinguaSelecionada] = useState<{ label: string; value: string; flag: string }>({
    label: 'Português',
    value: 'pt',
    flag: 'PT',
  });
  const isFirstLoad = useRef(true);

  // Use the context for colorBlindType directly  // Add useEffect to load saved settings on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('talktalk_user_settings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      if (settings.linguaSelecionada) {
        // Only update if different
        if (
          settings.linguaSelecionada.value !== linguaSelecionada.value ||
          settings.linguaSelecionada.label !== linguaSelecionada.label ||
          settings.linguaSelecionada.flag !== linguaSelecionada.flag
        ) {
          setLinguaSelecionada(settings.linguaSelecionada);
        }
      }
      if (settings.avatarDetails) {
        setAvatarDetails(settings.avatarDetails);
      }
      if (settings.avatarColor) {
        setAvatarColor(settings.avatarColor);
      }
      // Note: We don't need to handle colorBlindType here anymore,
      // the ColorBlindContext takes care of loading and applying it
    }
    isFirstLoad.current = false;
  }, [setLinguaSelecionada, linguaSelecionada.value, linguaSelecionada.label, linguaSelecionada.flag]);// State for managing available voices
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Voice settings and initialization
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);

      if (settings.voice && preferredLanguage) {
        const matchingVoice = voices.find((voice) => voice.lang && voice.lang.includes(preferredLanguage));
        if (matchingVoice && matchingVoice.name !== settings.voice) {
          updateSettings({ voice: matchingVoice.name });
        }
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [preferredLanguage, settings.voice, updateSettings]);
  // Test voice function now uses speech context
  const testVoice = () => {
    speak('Olá! Esta é uma mensagem de teste para as configurações de voz.');
  };
  useEffect(() => {
    // Atualiza o estado local com o valor do contexto quando a página carrega
    setAutoTranslate(translationSettings.autoTranslate);
  }, [translationSettings.autoTranslate]);

  // Função para atualizar a configuração de tradução automática
  const handleAutoTranslateChange = useCallback(
    (value: boolean) => {
      setAutoTranslate(value);
      updateTranslationSettings({ autoTranslate: value });
    },
    [updateTranslationSettings]
  );

  const handleLanguageChange = (language) => {
    const index = languagesData.findIndex((lang) => lang.value === language);
    if (index === -1) return;
    // Only update if different
    if (linguaSelecionada.value === languagesData[index].value) return;
    setLinguaSelecionada({
      label: languagesData[index].label,
      value: languagesData[index].value,
      flag: languagesData[index].flag,
    });
    saveUserSettings({
      linguaSelecionada: {
        label: languagesData[index].label,
        value: languagesData[index].value,
        flag: languagesData[index].flag,
      },
      avatarDetails,
      avatarColor,
      userApelido,
    });
  };

  const getRandomAvatar = useCallback(() => {
    const randomAnimal = RandomNicks.get();
    const englishName = RandomNicks.getEnglish(randomAnimal);

    if (!englishName) {
      console.error(`Apelido "${randomAnimal}" não encontrado.`);
      return ''; // Retorna uma string vazia como valor padrão
    }

    const imageUrl = `/images/avatars/${englishName.toLowerCase()}.png`;
    setAvatarDetails({ avatarURL: imageUrl, avatarName: randomAnimal });
    return randomAnimal;
  }, [setAvatarDetails]);

  const handleSelectColor = useCallback(
    (color: string) => {
      setAvatarColor(color);
      setColorModalOpenned(false);
      saveUserSettings({
        linguaSelecionada,
        avatarDetails,
        avatarColor: color,
      });
    },
    [saveUserSettings, linguaSelecionada, avatarDetails]
  );

  const handleNameInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setUserName(e.target.value);
  }, []);

  const handleFontSizeChange = (size: string | number) => {
    setFontSize(Number(size));
  };

  const AvatarComponent = useMemo(() => {
    const handleAvatarSelect = (avatar: string, url: string) => {
      const newAvatarDetails = { avatarURL: url, avatarName: avatar };
      setAvatarDetails(newAvatarDetails);
      saveUserSettings({
        linguaSelecionada,
        avatarDetails: newAvatarDetails,
        avatarColor,
      });
    };

    // Use panda as default avatar if none is set
    const avatarSrc =
      avatarDetails.avatarURL && avatarDetails.avatarURL.trim() ? avatarDetails.avatarURL : '/images/avatars/panda.png';

    return (
      <div className="flex flex-col items-center gap-3">
        <AvatarDropdown openModal={() => setColorModalOpenned((prev) => !prev)}>
          <Image
            alt="Avatar do usuário"
            src={avatarSrc}
            width={120}
            height={120}
            className={`rounded-full ${avatarColor} p-2 bg-blue-500 !opacity-100`}
            style={{
              backgroundColor: avatarColor,
            }}
          />
        </AvatarDropdown>
        <AvatarSelector onAvatarSelect={handleAvatarSelect} color={avatarColor} getRandomAvatar={getRandomAvatar} />
      </div>
    );
  }, [avatarDetails.avatarURL, avatarColor, getRandomAvatar, linguaSelecionada, saveUserSettings]);
  const handleColorBlindChange = useCallback(
    (type: ColorBlindType) => {
      // Use the context's setColorBlindType function
      setColorBlindType(type);

      // Save other settings
      const settings = {
        linguaSelecionada,
        avatarDetails,
        avatarColor,
      };
      localStorage.setItem('talktalk_user_settings', JSON.stringify(settings));
    },    [linguaSelecionada, avatarDetails, avatarColor, setColorBlindType]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-cyan-50/40 dark:from-[#0f0f0f] dark:via-[#1a1a2e] dark:to-[#16213e] relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-blue-400/8 to-cyan-400/8 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-purple-400/6 to-blue-400/6 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-cyan-400/6 to-blue-400/6 rounded-full blur-2xl"></div>
      </div>

      <div className="relative z-10 flex flex-col p-4 text-gray-900 dark:text-gray-100 transition-colors duration-200">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            <span 
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 50%, #8b5cf6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Configurações
            </span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Personalize sua experiência no TalkTalk</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto w-full">
          {/* Menu lateral */}
          <nav className="lg:w-72 bg-white/80 dark:bg-[#18181B]/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/30 p-6 h-fit">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Categorias</h2>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center justify-between p-4 rounded-xl transition-all duration-300 group ${
                    activeTab === 'profile' 
                      ? 'bg-gradient-to-r from-blue-500/10 to-cyan-500/10 text-blue-600 dark:text-blue-400 shadow-lg border border-blue-200/50 dark:border-blue-700/50' 
                      : 'hover:bg-gray-100/80 dark:hover:bg-gray-700/50 hover:scale-[1.02]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg transition-colors ${
                      activeTab === 'profile' 
                        ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400' 
                        : 'bg-gray-200/80 dark:bg-gray-700/80 group-hover:bg-blue-500/10'
                    }`}>
                      <User size={18} />
                    </div>
                    <span className="font-medium">Perfil</span>
                  </div>
                  <ChevronRight size={16} className={`transition-all duration-300 ${
                    activeTab === 'profile' ? 'opacity-100 rotate-90' : 'opacity-0 group-hover:opacity-50'
                  }`} />
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('language')}
                  className={`w-full flex items-center justify-between p-4 rounded-xl transition-all duration-300 group ${
                    activeTab === 'language' 
                      ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 text-green-600 dark:text-green-400 shadow-lg border border-green-200/50 dark:border-green-700/50' 
                      : 'hover:bg-gray-100/80 dark:hover:bg-gray-700/50 hover:scale-[1.02]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg transition-colors ${
                      activeTab === 'language' 
                        ? 'bg-green-500/20 text-green-600 dark:text-green-400' 
                        : 'bg-gray-200/80 dark:bg-gray-700/80 group-hover:bg-green-500/10'
                    }`}>
                      <Globe size={18} />
                    </div>
                    <span className="font-medium">Idiomas</span>
                  </div>
                  <ChevronRight size={16} className={`transition-all duration-300 ${
                    activeTab === 'language' ? 'opacity-100 rotate-90' : 'opacity-0 group-hover:opacity-50'
                  }`} />
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('audio')}
                  className={`w-full flex items-center justify-between p-4 rounded-xl transition-all duration-300 group ${
                    activeTab === 'audio' 
                      ? 'bg-gradient-to-r from-purple-500/10 to-violet-500/10 text-purple-600 dark:text-purple-400 shadow-lg border border-purple-200/50 dark:border-purple-700/50' 
                      : 'hover:bg-gray-100/80 dark:hover:bg-gray-700/50 hover:scale-[1.02]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg transition-colors ${
                      activeTab === 'audio' 
                        ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400' 
                        : 'bg-gray-200/80 dark:bg-gray-700/80 group-hover:bg-purple-500/10'
                    }`}>
                      <Volume2 size={18} />
                    </div>
                    <span className="font-medium">Áudio</span>
                  </div>
                  <ChevronRight size={16} className={`transition-all duration-300 ${
                    activeTab === 'audio' ? 'opacity-100 rotate-90' : 'opacity-0 group-hover:opacity-50'
                  }`} />
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('appearance')}
                  className={`w-full flex items-center justify-between p-4 rounded-xl transition-all duration-300 group ${
                    activeTab === 'appearance' 
                      ? 'bg-gradient-to-r from-orange-500/10 to-amber-500/10 text-orange-600 dark:text-orange-400 shadow-lg border border-orange-200/50 dark:border-orange-700/50' 
                      : 'hover:bg-gray-100/80 dark:hover:bg-gray-700/50 hover:scale-[1.02]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg transition-colors ${
                      activeTab === 'appearance' 
                        ? 'bg-orange-500/20 text-orange-600 dark:text-orange-400' 
                        : 'bg-gray-200/80 dark:bg-gray-700/80 group-hover:bg-orange-500/10'
                    }`}>
                      <Sliders size={18} />
                    </div>
                    <span className="font-medium">Aparência</span>
                  </div>
                  <ChevronRight size={16} className={`transition-all duration-300 ${
                    activeTab === 'appearance' ? 'opacity-100 rotate-90' : 'opacity-0 group-hover:opacity-50'
                  }`} />
                </button>
              </li>
            </ul>
          </nav>

          {/* Conteúdo principal */}
          <div className="flex-1 bg-white/80 dark:bg-[#18181B]/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/30 p-8 hover:shadow-2xl transition-all duration-300">
            {/* Perfil */}
            {activeTab === 'profile' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl">
                    <User size={24} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Informações do Perfil</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Configure seu avatar e dados pessoais</p>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                  <div className="relative flex-shrink-0">
                    {AvatarComponent}
                    <ColorSelector
                      onSelectColor={handleSelectColor}
                      isOpen={isColorModalOpenned}
                      onModalClose={() => setColorModalOpenned(false)}
                    />
                  </div>

                  <div className="flex-1 space-y-4">
                    <div>
                      <label htmlFor="userName" className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                        Nome completo
                      </label>
                      <input
                        id="userName"
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        className="w-full p-3 border border-gray-200 dark:border-gray-600 bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent transition-all duration-300 hover:shadow-md"
                        placeholder="Seu nome completo"
                      />
                    </div>

                    <div>
                      <label htmlFor="userApelido" className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                        Apelido (exibido nos chats)
                      </label>
                      <input
                        id="userApelido"
                        type="text"
                        value={userApelido}
                        onChange={(e) => setUserApelido(e.target.value)}
                        className="w-full p-3 border border-gray-200 dark:border-gray-600 bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent transition-all duration-300 hover:shadow-md"
                        placeholder="Como deseja ser chamado"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                        Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        className="w-full p-3 border border-gray-200 dark:border-gray-600 bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent transition-all duration-300 hover:shadow-md"
                        placeholder="seu.email@exemplo.com"
                      />
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end mt-8">
                  <button
                    onClick={() => {
                      const settings = {
                        userName,
                        userApelido,
                        avatarDetails,
                        avatarColor,
                      };
                      saveUserSettings(settings);
                      setIsSaving(true);
                      setTimeout(() => setIsSaving(false), 800);
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 font-medium"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Salvar alterações
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Idiomas */}
            {activeTab === 'language' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl">
                    <Globe size={24} className="text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Configurações de Idioma</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Defina seu idioma preferido e traduções</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="preferredLanguage" className="block text-sm font-medium mb-1">
                      Idioma principal
                    </label>
                    <LanguageSelector
                      selectedLanguage={{
                        label: linguaSelecionada.label,
                        value: linguaSelecionada.value,
                        flag: linguaSelecionada.flag,
                      }}
                      onLanguageChange={handleLanguageChange}
                    />
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Este é o idioma em que você deseja receber as traduções
                    </p>
                  </div>
                  <div className="p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Globe size={18} />
                        <div>
                          <p className="font-medium">Tradução automática</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            <strong>Quando ativado:</strong> as mensagens serão exibidas já traduzidas.
                            <br />
                            <strong>Quando desativado:</strong> as mensagens serão exibidas no idioma original e você
                            precisa clicar no botão para ver a tradução.
                          </p>
                        </div>
                      </div>

                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={translationSettings.autoTranslate}
                          onChange={(e) => updateTranslationSettings({ autoTranslate: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-500 peer-checked:bg-blue-500"></div>
                      </label>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end mt-8">
                    <button
                      onClick={() => {
                        const settings = {
                          linguaSelecionada,
                          preferredLanguage: linguaSelecionada.value
                        };
                        saveUserSettings(settings);
                        setIsSaving(true);
                        setTimeout(() => setIsSaving(false), 800);
                      }}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 font-medium"
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Save size={16} />
                          Salvar alterações
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Áudio */}
            {activeTab === 'audio' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-r from-purple-500/20 to-violet-500/20 rounded-xl">
                    <Volume2 size={24} className="text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Configurações de Áudio</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Personalize a síntese de voz e reprodução</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="voice" className="block text-sm font-medium mb-1">
                      Voz para leitura
                    </label>
                    <div className="relative">
                      <select
                        id="voice"
                        value={settings.voice}
                        onChange={(e) => updateSettings({ voice: e.target.value })}
                        className="w-full p-2 border dark:border-gray-700 bg-white dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent appearance-none"
                      >
                        <option value="">Selecione uma voz</option>
                        {availableVoices
                          .sort((a, b) => {
                            // Preferência para vozes em português
                            const aPt = a.lang && a.lang.startsWith('pt');
                            const bPt = b.lang && b.lang.startsWith('pt');
                            if (aPt && !bPt) return -1;
                            if (!aPt && bPt) return 1;
                            return a.name.localeCompare(b.name);
                          })
                          .map((voice, index) => (
                            <option key={index} value={voice.name}>
                              {voice.name} ({voice.lang || 'Desconhecido'})
                            </option>
                          ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                        <ChevronRight size={16} className="transform rotate-90 text-gray-400" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label htmlFor="volume" className="text-sm font-medium">
                        Volume
                      </label>
                      <span className="text-sm">{settings.volume}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Volume2 size={16} className="text-gray-600 dark:text-gray-400" />
                      <input
                        id="volume"
                        type="range"
                        min="0"
                        max="100"
                        value={settings.volume}
                        onChange={(e) => updateSettings({ volume: Number(e.target.value) })}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label htmlFor="rate" className="text-sm font-medium">
                        Velocidade
                      </label>
                      <span className="text-sm">{settings.rate}x</span>
                    </div>
                    <input
                      id="rate"
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={settings.rate}
                      onChange={(e) => updateSettings({ rate: Number(e.target.value) })}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-blue-500"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label htmlFor="pitch" className="text-sm font-medium">
                        Tom
                      </label>
                      <span className="text-sm">{settings.pitch}</span>
                    </div>
                    <input
                      id="pitch"
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={settings.pitch}
                      onChange={(e) => updateSettings({ pitch: Number(e.target.value) })}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="test-text" className="text-sm font-medium">
                      Texto para teste
                    </label>
                    <textarea
                      id="test-text"
                      rows={2}
                      placeholder="Digite um texto para testar as configurações de voz"
                      defaultValue="Olá! Esta é uma mensagem de teste para as configurações de voz."
                      className="w-full p-2 border dark:border-gray-700 bg-white dark:bg-gray-700 rounded-lg resize-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          speak(e.currentTarget.value);
                        }
                      }}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Pressione Enter para ouvir o texto ou use o botão abaixo
                    </p>
                    <button
                      onClick={(e) => {
                        const textarea = document.getElementById('test-text') as HTMLTextAreaElement;
                        speak(textarea.value);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      <Mic size={18} />
                      <span>Testar configurações de voz</span>
                    </button>
                  </div>

                  <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Mic size={18} />
                        <div>
                          <p className="font-medium">Leitura automática</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Quando ativado: <strong>apenas mensagens recebidas de outros usuários</strong> serão lidas em voz alta automaticamente.
                            <br />
                            <strong>Suas próprias mensagens nunca serão lidas automaticamente.</strong>
                            <br />
                            <strong>Padrão:</strong> Desativado (você precisa clicar no botão de play manualmente)
                          </p>
                        </div>
                      </div>

                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.autoRead}
                          onChange={(e) => updateSettings({ autoRead: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-500 peer-checked:bg-blue-500"></div>
                      </label>
                    </div>
                    
                    {settings.autoRead && (
                      <div className="mt-3 p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <p className="text-sm text-green-700 dark:text-green-300">
                          ✓ Leitura automática ativada - apenas mensagens recebidas de outros usuários serão lidas automaticamente
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Aparência */}
            {activeTab === 'appearance' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-xl">
                    <Sliders size={24} className="text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Aparência</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Customize o tema e visual da interface</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {darkMode ? <Moon size={20} /> : <Sun size={20} />}
                      <div>
                        <p className="font-medium">Modo escuro</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Alterar entre temas claro e escuro</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        aria-label={theme.resolvedTheme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
                        type="checkbox"
                        checked={darkMode}
                        onChange={() => setDarkMode(!darkMode)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-500 peer-checked:bg-blue-500"></div>
                    </label>
                  </div>

                  <div className="p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium">Tamanho da fonte</label>
                      <span className="text-sm font-mono">{fontSize}px</span>
                    </div>
                    <input
                      type="range"
                      min="8"
                      max="24"
                      step="1"
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-600 accent-blue-500"
                    />
                    <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
                      <span>8px</span>
                      <span>16px</span>
                      <span>24px</span>
                    </div>

                    <div className="mt-4 grid grid-cols-4 gap-2">
                      <button
                        onClick={() => setFontSize(12)}
                        className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                          fontSize === 12
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500'
                        }`}
                      >
                        Pequena
                      </button>
                      <button
                        onClick={() => setFontSize(16)}
                        className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                          fontSize === 16
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500'
                        }`}
                      >
                        Média
                      </button>
                      <button
                        onClick={() => setFontSize(20)}
                        className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                          fontSize === 20
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500'
                        }`}
                      >
                        Grande
                      </button>
                      <button
                        onClick={() => setFontSize(24)}
                        className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                          fontSize === 24
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500'
                        }`}
                      >
                        Extra Grande
                      </button>
                    </div>

                    <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Exemplo de texto com o tamanho selecionado
                      </p>
                      <p style={{ fontSize: `${fontSize}px` }} className="mt-2">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      </p>
                    </div>
                  </div>

                  {/* Adicione o componente ColorBlindSettings aqui */}
                  <ColorBlindSettings onColorBlindChange={handleColorBlindChange} currentType={colorBlindType} />
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSettingsPage;
