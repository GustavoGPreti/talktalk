'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { IoIosMoon } from 'react-icons/io';
import { IoLanguage, IoMenu, IoSunny } from 'react-icons/io5';
import { useTheme } from 'next-themes';
import { FaGithub } from 'react-icons/fa';
import Image from 'next/image';
import LogoSite from '/public/images/icon/logo.png';
import { CountryFlag } from '../countryFlags';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { IoSettingsSharp } from "react-icons/io5";

import { motion } from 'framer-motion';
import i18n from '@/i18n';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Link } from 'next-view-transitions';

interface NavbarItem {
  name: string;
  href: string;
}

export default function NavBar() {
  const pathname = usePathname();
  const theme = useTheme();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState<boolean>(false);
  const [activeItem, setActiveItem] = useState<NavbarItem | null>(null);

  useEffect(() => setHasMounted(true), []);

  const { t } = useTranslation('translation', { keyPrefix: 'navbar' });

  const listaItems = useMemo<NavbarItem[]>(
    () => [
      {
        name: t('pagina_inicial'),
        href: '/locale',
      },
      {
        name: t('sobre_ferramenta'),
        href: '/locale/sobre',
      },
      {
        name: t('conversar'),
        href: '/locale/conversar',
      },
      
    ],
    [t]
  );

  

  const toggleTheme = useCallback(() => {
    theme.setTheme(theme.resolvedTheme === 'dark' ? 'light' : 'dark');
  }, [theme]);

  const isActiveLink = useCallback(
    (href: string) => {
      return pathname === href;
    },
    [pathname]
  );

  const toggleMenu = useCallback(() => {
    setIsMenuOpen((prev) => !prev);
  }, []);

  useEffect(() => {
    const currentItem = listaItems.find((item) => isActiveLink(item.href));
    setActiveItem(currentItem || null);
    if (pathname?.split('/').filter(Boolean)[0] !== i18n.language) {
      i18n.changeLanguage(pathname?.split('/').filter(Boolean)[0]);
    }
  }, [pathname, isActiveLink, listaItems]);

  return (
    <>
      <nav className="sticky top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md dark:bg-gray-900/80 h-16 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0">
              <Link href="/">
                <Image src={LogoSite.src} width={48} height={48} alt="Logo" priority className="w-12 h-12" />
              </Link>
            </div>

            <div className="hidden md:flex items-center space-x-8 relative">
              {listaItems.map((item) => (
                <Link
                  key={item.href}
                  href={`${item.href}`.replace('locale', i18n.language)}
                  className={`relative text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors
                    ${isActiveLink(item.href) ? '!text-sky-600' : ''}`}
                >
                  {item.name}
                  {isActiveLink(item.href) && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute bottom-[-20px] left-0 right-0 h-0.5 bg-sky-600"
                      initial={false}
                      transition={{
                        type: 'spring',
                        stiffness: 500,
                        damping: 30,
                      }}
                    />
                  )}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-2">
              {hasMounted && (
                <>
                  <button
                    onClick={toggleTheme}
                    aria-label={theme.resolvedTheme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
                    className="p-1.5 rounded-full text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    {theme.resolvedTheme === 'dark' ? <IoIosMoon size={18} /> : <IoSunny size={18} />}
                  </button>
                  <div className="hidden sm:block w-px h-6 bg-gray-300 dark:bg-gray-700" />
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Visitar GitHub"
                    className="hidden sm:block p-1.5 rounded-full text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    <FaGithub size={18} />
                  </a>
                  <div className="hidden sm:block w-px h-6 bg-gray-300 dark:bg-gray-700" />
                  <Link
                  href={`/locale/configuracoes`.replace('locale', i18n.language)}
                    rel="noopener noreferrer"
                    aria-label="Visitar GitHub"
                    className="hidden sm:block p-1.5 rounded-full text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                    <IoSettingsSharp size={18} />
                  </Link>
                  <div className="hidden sm:block w-px h-6 bg-gray-300 dark:bg-gray-700" />
                  <LanguageSwitcher />
                  <button
                    onClick={toggleMenu}
                    aria-label="Menu principal"
                    aria-expanded={isMenuOpen}
                    className="md:hidden p-1.5 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    <IoMenu size={18} />
                  </button>
                </>
              )}
            </div>
          </div>

          <div
            className={`md:hidden fixed left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md transition-all duration-300 overflow-hidden ${isMenuOpen ? 'max-h-[calc(100vh-4rem)] border-b border-gray-200 dark:border-gray-800' : 'max-h-0'}`}
          >
            <div className="px-2 py-3 space-y-1">
              {listaItems.map((item) => (
                <Link
                  key={item.href.replace('locale', i18n.language)}
                  href={item.href.replace('locale', i18n.language)}
                  className={`block px-3 py-2 rounded-md text-base font-medium
                    ${isActiveLink(item.href.replace('locale', i18n.language))
                      ? 'bg-sky-100 text-sky-600 dark:bg-sky-900'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                    }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}


function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();

  const [isChangingLocale, setIsChangingLocale] = useState(false);
  const locale = i18n.language;

  const handleLanguageChange = useCallback(
    async (newLocale: string) => {
      try {
        setIsChangingLocale(true);
        const pathParts = pathname?.split('/').filter(Boolean) || [];
        const currentLocale = pathParts[0];

        let newPathname = '';
        if (currentLocale && ['pt-BR', 'es-ES', 'en-US'].includes(currentLocale)) {
          newPathname = '/' + pathParts.slice(1).join('/');
        } else {
          newPathname = pathname ?? '/';
        }

        newPathname = newPathname || '/';
        console.log(newPathname);
        i18n.changeLanguage(newLocale);

        const newUrl = `/${newLocale}${newPathname}`;
        window.history.pushState({}, '', newUrl);

        router.refresh();
      } catch (error) {
        console.error('Erro ao mudar idioma:', error);
      } finally {
        setIsChangingLocale(false);
      }
    },
    [pathname, router]
  );

  const getLanguageName = useCallback((localeCode: string) => {
    const languages = {
      'pt-BR': 'Português (BR)',
      'en-US': 'English (US)',
      'es-ES': 'Español (ES)',
    };
    return languages[localeCode as keyof typeof languages] || localeCode;
  }, []);

  return (
    <Menu as="div" className="relative">
      <MenuButton
        className="inline-flex items-center gap-2 rounded-lg p-1.5 sm:p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        <div className="flex items-center gap-2">
          <IoLanguage size={18} />
          <CountryFlag className="w-6 h-6 sm:w-8 sm:h-8" flag={locale.split('-')[1]} />
          <span className="hidden md:block">{getLanguageName(locale)}</span>
        </div>
      </MenuButton>

      <MenuItems
        className="absolute z-10 right-0 sm:right-auto sm:left-0 mt-2 w-52 origin-top-right rounded-xl bg-white dark:bg-gray-800 p-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
      >
        <MenuItem disabled={isChangingLocale}>
          {({ active }) => (
            <button
              onClick={() => handleLanguageChange('pt-BR')}
              className={`group flex w-full items-center gap-2 rounded-lg py-1.5 px-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 ${active ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
            >
              {isChangingLocale ? (
                <span>Carregando...</span>
              ) : (
                <span className="text-sm flex items-center gap-2">
                  <CountryFlag className="w-8 h-8" flag="BR" />
                  {getLanguageName('pt-BR')}
                </span>
              )}
            </button>
          )}
        </MenuItem>

        <MenuItem disabled={isChangingLocale}>
          <button
            onClick={() => handleLanguageChange('es-ES')}
            className="group flex w-full items-center gap-2 rounded-lg py-1.5 px-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <span className="text-sm flex items-center gap-2">
              <CountryFlag className="w-8 h-8" flag="ES" />
              {getLanguageName('es-ES')}
            </span>
          </button>
        </MenuItem>

        <MenuItem disabled={isChangingLocale}>
          <button
            onClick={() => handleLanguageChange('en-US')}
            className="group flex w-full items-center gap-2 rounded-lg py-1.5 px-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <span className="text-sm flex items-center gap-2">
              <CountryFlag className="w-8 h-8" flag="US" />
              {getLanguageName('en-US')}
            </span>
          </button>
        </MenuItem>
      </MenuItems>
    </Menu>
  );
}
