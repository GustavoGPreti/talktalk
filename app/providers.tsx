'use client';

import { HeroUIProvider } from "@heroui/react";
import { ThemeProvider } from './NextThemesProvider';
import { ReactNode } from 'react';
import { CookiesProvider } from 'react-cookie';
import { ToastContainer } from 'react-toastify';
import { ViewTransitions } from 'next-view-transitions';
import 'react-toastify/dist/ReactToastify.css';
import VLibras from "vlibras-nextjs";

import "../i18n"

export default function Providers({ children }: { children: ReactNode }) {
  return (
    
    <ViewTransitions>
    
	  <div>
      
		{/* only worked in production in tests with nextjs applications maybe you can solve this! */}
		{process.env.NODE_ENV === "development" && <VLibras forceOnload />}
    </div>
      <HeroUIProvider>
      
        <CookiesProvider>
          <ThemeProvider attribute="class" enableSystem themes={['light', 'dark']}>
            {children}
            <ToastContainer />
          </ThemeProvider>
        </CookiesProvider>
      </HeroUIProvider>
    </ViewTransitions>
  );
}

