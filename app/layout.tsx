import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from './providers';
import NavBar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import CookieConsetimentModal from './components/modal/ModalConsetiment';
import { FontSizeProvider } from './contexts/FontSizeContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Talk-Talk! - Tradução em Tempo Real | Converse em Qualquer Idioma',
  description: 'Talk-Talk! é uma ferramenta de tradução via bate-papo em tempo real. Quebre barreiras linguísticas e comunique-se facilmente com pessoas de todo o mundo.',
  keywords: 'tradução em tempo real, chat multilíngue, comunicação global, quebra de barreiras linguísticas',
  authors: [
    { name: 'Kaike da Silva Sathler', url: 'http://lattes.cnpq.br/2952383935652833' },
    { name: 'Christopher Rodrigues Gouveia', url: 'http://lattes.cnpq.br/3214554816480546' },
    { name: "Gustavo Gomes Preti" }
  ],
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    title: 'Talk-Talk! - Tradução em Tempo Real',
    description: 'Ferramenta de tradução via bate-papo em tempo real para comunicação global',
    images: [{ url: '/images/talktalk-og-image.jpg', width: 1200, height: 630, alt: 'Talk-Talk! Preview' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Talk-Talk! - Tradução em Tempo Real',
    description: 'Ferramenta de tradução via bate-papo em tempo real para comunicação global',
    images: ['/images/talktalk-twitter-image.jpg'],
  },
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  return (
    <html lang='pt' suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/favicon/safari-pinned-tab.svg" color="#5bbad5" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <FontSizeProvider>
          <Providers>
            <CookieConsetimentModal />
            <div className="flex flex-col min-h-screen">
              <header>
                <NavBar />
              </header>
              <main className="flex-1">{children}</main>
              <Footer className="mt-auto" />
            </div>
          </Providers>
        </FontSizeProvider>
      </body>
    </html>
  );
}
