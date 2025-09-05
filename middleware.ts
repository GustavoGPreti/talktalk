import { NextRequest, NextResponse } from "next/server";

const locales = ['pt-BR', 'en-US', 'es-ES'] as const;
const defaultLocale = 'pt-BR';

function getLocale(request: NextRequest): string {
  const pathname = request.nextUrl.pathname;
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    return pathname.split('/')[1];
  }

  const cookieLocale = request.cookies.get('i18nextLng')?.value;
  if (cookieLocale && locales.includes(cookieLocale as any)) {
    return cookieLocale;
  }

  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage) {
    const preferredLocale = acceptLanguage
      .split(',')[0]
      .split('-')
      .join('-')
      .toLowerCase();

    for (const locale of locales) {
      if (locale.toLowerCase() === preferredLocale) {
        return locale;
      }
    }

    for (const locale of locales) {
      if (preferredLocale.startsWith(locale.split('-')[0].toLowerCase())) {
        return locale;
      }
    }
  }

  return defaultLocale;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (!pathnameHasLocale) {
    const locale = getLocale(request);
    const newPathname = `/${locale}${pathname}`;
    
    return NextResponse.redirect(new URL(newPathname, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next|_vercel|static|.*\\..*).*)',
  ],
};