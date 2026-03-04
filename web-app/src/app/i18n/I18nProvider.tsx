'use client';

import { Skeleton } from "../../components/ui/skeleton";
import { ThemeProvider } from "next-themes";
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { useEffect, useState } from 'react';
import Backend from 'i18next-http-backend';
import { getCookie, setCookie } from '../cookies';
import i18next from 'i18next';
import { Toaster, toast } from "sonner";

function SkeletonLoader() {

  return (
    <div className="w-full h-full" suppressHydrationWarning>
      <div className="fixed top-0 left-0 h-screen w-64 border-r bg-background p-6">
        <div className="flex items-center justify-center h-[280px]">
          <Skeleton className="h-[200px] w-[200px] rounded-4xl bg-black/5 dark:bg-white/10" suppressHydrationWarning /> {/* Logo */}
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-10 w-full bg-black/5 dark:bg-white/10" suppressHydrationWarning />
          ))} {/* Nav item */}
        </div>
      </div>

      <div className="ml-64 p-6">
        <div className="max-w-3xl">
          {/* <Skeleton className="h-12 w-3/4 mb-6 bg-black/5 dark:bg-white/10" suppressHydrationWarning /> if potential title */}
          <div className="space-y-4">
            <Skeleton className="h-[200px] w-full bg-black/5 dark:bg-white/10" suppressHydrationWarning /> {/* Card 1 */}
            <Skeleton className="h-[200px] w-full bg-black/5 dark:bg-white/10" suppressHydrationWarning /> {/* Card 2 */}
          </div>
        </div>
      </div>
    </div>
  );
}

function I18nProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasInitError, setHasInitError] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        await i18n
          .use(Backend)
          .use(initReactI18next)
          .init({
            lng: 'en',
            fallbackLng: 'en',
            supportedLngs: ['en', 'fr'],
            debug: process.env.NODE_ENV === 'development',
            interpolation: {
              escapeValue: false,
            },
            backend: {
              loadPath: '/locales/{{lng}}/{{ns}}.json',
            },
          });

        setIsInitialized(true);
      } catch (error) {
        setHasInitError(true);
      }
    };

    init();
  }, []);

  useEffect(() => {
    if (hasInitError) {
      toast.error("Failed to initialize internationalization");
    }
  }, [hasInitError]);

  useEffect(() => {
    const savedLanguage = getCookie('language') || 'en'

    i18next.changeLanguage(savedLanguage)

    i18next.on('languageChanged', (lng) => {
      setCookie('language', lng)
    })

    return () => {
      i18next.off('languageChanged')
    }
  }, [])

  if (!isInitialized) {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem >
        <Toaster position="top-right" richColors />
        <SkeletonLoader />
      </ThemeProvider>
    );
  }

  return <>{children}</>;
}

export default I18nProvider;