import { NextResponse } from 'next/server';
import translate from 'google-translate-api-x';
import { supportedLanguages } from './languages';

type SupportedLanguage = keyof typeof supportedLanguages;

export async function POST(request: Request) {
  try {
    const { text, targetLanguage } = await request.json();


    if (!text || !targetLanguage) {
      console.log('[ERROR] Missing text or targetLanguage:', { text: !!text, targetLanguage });
      return NextResponse.json({ error: 'Missing text or targetLanguage' }, { status: 400 });
    }

    if (typeof targetLanguage !== 'string' || targetLanguage.trim() === '') {
      console.log('[ERROR] Invalid targetLanguage:', { targetLanguage, type: typeof targetLanguage });
      return NextResponse.json({ error: 'Invalid targetLanguage - must be non-empty string' }, { status: 400 });
    }

    const languageMapping: { [key: string]: string } = {
      'pt-BR': 'pt',
      'pt-PT': 'pt', 
      'en-US': 'en',
      'en-GB': 'en',
      'es-ES': 'es',
      'es-MX': 'es',
      'fr-FR': 'fr',
      'de-DE': 'de',
      'it-IT': 'it',
      'ja-JP': 'ja',
      'zh-CN': 'zh',
      'zh-TW': 'zh',
      'ru-RU': 'ru',
      'ar-SA': 'ar'
    };

    const mappedLanguage = languageMapping[targetLanguage.trim()] || targetLanguage.trim();
    

    const translation = await translate(text, { to: mappedLanguage, autoCorrect: true, forceTo: true });
    const translationText = Array.isArray(translation) ? translation[0].text : translation.text;


    return NextResponse.json({
      result: translationText,
      language: supportedLanguages[targetLanguage as SupportedLanguage] || supportedLanguages[mappedLanguage as SupportedLanguage] || 'Idioma desconhecido',
    });
  } catch (error) {
    console.error('[ERROR] Erro na tradução:', error);
    return NextResponse.json({ error: `A tradução do Google falhou: ${error}` }, { status: 500 });
  }
}