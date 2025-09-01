import { heroui } from "@heroui/react";
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
    './node_modules/@material-tailwind/react/components/**/*.{js,ts,jsx,tsx}',
    './node_modules/@material-tailwind/react/theme/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#38A3F5',
          50: '#EBF7FE',
          100: '#D7EFFD', 
          200: '#AFDFFA',
          300: '#87CFF7',
          400: '#5FBFF4',
          500: '#38A3F5',
          600: '#2D82C4',
          700: '#226193',
          800: '#174162',
          900: '#0C2031',
        },
        secondary: {
          DEFAULT: '#786FF2',
          50: '#F0EFFE',
          100: '#E1DFFD',
          200: '#C3BFFB',
          300: '#A59FF9',
          400: '#877FF7',
          500: '#786FF2',
          600: '#5F56C1',
          700: '#483E91',
          800: '#302760',
          900: '#180F30',
        },
        accent: {
          DEFAULT: '#6F90F2',
          50: '#EDEFFE',
          100: '#DBDFFE',
          200: '#B7BFFD',
          300: '#939FFC',
          400: '#6F7FFB',
          500: '#6F90F2',
          600: '#5170C1',
          700: '#3D5491',
          800: '#293860',
          900: '#141C30',
        },
        cyan: {
          DEFAULT: '#6FE3F2',
          50: '#EDFDFF',
          100: '#DBFBFE',
          200: '#B7F7FD',
          300: '#93F3FC',
          400: '#6FEFFB',
          500: '#6FE3F2',
          600: '#59B6C1',
          700: '#438991',
          800: '#2D5C60',
          900: '#162E30',
        },
        purple: {
          DEFAULT: '#A46FF2',
          50: '#F5EDFF',
          100: '#EBDBFE',
          200: '#D7B7FD',
          300: '#C393FC',
          400: '#AF6FFB',
          500: '#A46FF2',
          600: '#8355C1',
          700: '#624091',
          800: '#412A60',
          900: '#201530',
        },
        light: {
          DEFAULT: '#BFCCF2',
          50: '#F8FAFF',
          100: '#F1F5FE',
          200: '#E3EBFD',
          300: '#D5E1FC',
          400: '#C7D7FB',
          500: '#BFCCF2',
          600: '#99A3C1',
          700: '#737A91',
          800: '#4D5260',
          900: '#262930',
        }
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideDown: {
          '0%': { height: '0' },
          '100%': { height: 'var(--radix-accordion-content-height)' },
        },
        slideUp: {
          '0%': { height: 'var(--radix-accordion-content-height)' },
          '100%': { height: '0' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        bounce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-25%)' },
        }
      },
      animation: {
        fadeIn: 'fadeIn 0.2s ease-in-out',
        slideDown: 'slideDown 300ms cubic-bezier(0.87, 0, 0.13, 1)',
        slideUp: 'slideUp 300ms cubic-bezier(0.87, 0, 0.13, 1)',
        scaleIn: 'scaleIn 0.2s ease-out',
        slideInRight: 'slideInRight 0.3s ease-out',
        pulse: 'pulse 2s ease-in-out infinite',
        bounce: 'bounce 1s infinite'
      },
    },
  },
  darkMode: 'class',
  plugins: [
    heroui({
      themes: {
        light: {
          colors: {
            primary: {
              DEFAULT: '#38A3F5',
              50: '#EBF7FE',
              100: '#D7EFFD', 
              200: '#AFDFFA',
              300: '#87CFF7',
              400: '#5FBFF4',
              500: '#38A3F5',
              600: '#2D82C4',
              700: '#226193',
              800: '#174162',
              900: '#0C2031',
              foreground: '#FFFFFF',
            },
            secondary: {
              DEFAULT: '#786FF2',
              50: '#F0EFFE',
              100: '#E1DFFD',
              200: '#C3BFFB',
              300: '#A59FF9',
              400: '#877FF7',
              500: '#786FF2',
              600: '#5F56C1',
              700: '#483E91',
              800: '#302760',
              900: '#180F30',
              foreground: '#FFFFFF',
            }
          }
        },
        dark: {
          colors: {
            primary: {
              DEFAULT: '#38A3F5',
              50: '#EBF7FE',
              100: '#D7EFFD', 
              200: '#AFDFFA',
              300: '#87CFF7',
              400: '#5FBFF4',
              500: '#38A3F5',
              600: '#2D82C4',
              700: '#226193',
              800: '#174162',
              900: '#0C2031',
              foreground: '#000000',
            },
            secondary: {
              DEFAULT: '#786FF2',
              50: '#F0EFFE',
              100: '#E1DFFD',
              200: '#C3BFFB',
              300: '#A59FF9',
              400: '#877FF7',
              500: '#786FF2',
              600: '#5F56C1',
              700: '#483E91',
              800: '#302760',
              900: '#180F30',
              foreground: '#FFFFFF',
            }
          }
        }
      }
    }), 
    require('@codaworks/react-glow/tailwind')
  ],
} as Config;

export default config;
