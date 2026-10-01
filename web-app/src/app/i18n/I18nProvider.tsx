"use client";

import globalI18n, { createInstance, type i18n as I18nInstance } from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Skeleton } from "../../components/ui/skeleton";
import { setCookie } from "../cookies";
import enTranslations from "../../../public/locales/en/translation.json";
import frTranslations from "../../../public/locales/fr/translation.json";
import { bindLanguageSync, type AppLanguage } from "./language";

const resources = {
  en: { translation: enTranslations },
  fr: { translation: frTranslations },
};

const initialize = (
  instance: I18nInstance,
  language: AppLanguage,
): Promise<unknown> =>
  instance.use(initReactI18next).init({
    lng: language,
    fallbackLng: "en",
    supportedLngs: ["en", "fr"],
    debug: process.env.NODE_ENV === "development",
    initImmediate: false,
    interpolation: {
      escapeValue: false,
    },
    resources,
  });

if (!globalI18n.isInitialized) {
  void initialize(globalI18n, "en");
}

const createScopedI18n = (language: AppLanguage) => {
  const instance = createInstance();
  const initialization = initialize(instance, language);

  return { instance, initialization };
};

const SkeletonLoader = (): React.JSX.Element => (
  <div className="h-full w-full" suppressHydrationWarning>
    <div className="fixed top-0 left-0 h-screen w-64 border-r bg-background p-6">
      <div className="flex h-[280px] items-center justify-center">
        <Skeleton
          className="h-[200px] w-[200px] rounded-4xl bg-black/5 dark:bg-white/10"
          suppressHydrationWarning
        />
      </div>
      <div className="space-y-4">
        {[1, 2, 3, 4].map((item) => (
          <Skeleton
            key={item}
            className="h-10 w-full bg-black/5 dark:bg-white/10"
            suppressHydrationWarning
          />
        ))}
      </div>
    </div>

    <div className="ml-64 p-6">
      <div className="max-w-3xl">
        <div className="space-y-4">
          <Skeleton
            className="h-[200px] w-full bg-black/5 dark:bg-white/10"
            suppressHydrationWarning
          />
          <Skeleton
            className="h-[200px] w-full bg-black/5 dark:bg-white/10"
            suppressHydrationWarning
          />
        </div>
      </div>
    </div>
  </div>
);

const I18nProvider = ({
  children,
  fallback,
  language,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  language: AppLanguage;
}): React.JSX.Element => {
  const router = useRouter();
  const [{ instance, initialization }] = useState(() =>
    createScopedI18n(language),
  );
  const [isInitialized, setIsInitialized] = useState(instance.isInitialized);
  const [hasInitError, setHasInitError] = useState(false);

  useEffect(() => {
    void initialization
      .then(() => setIsInitialized(true))
      .catch(() => setHasInitError(true));
  }, [initialization]);

  useEffect(() => {
    if (instance.language !== language) {
      void instance.changeLanguage(language);
    }
  }, [instance, language]);

  useEffect(
    () => bindLanguageSync(instance, globalI18n, (nextLanguage) => {
      setCookie("language", nextLanguage);
      document.documentElement.lang = nextLanguage;
      router.refresh();
    }),
    [instance, router],
  );

  useEffect(() => {
    if (hasInitError) {
      toast.error("Failed to initialize internationalization");
    }
  }, [hasInitError]);

  if (!isInitialized) {
    return fallback !== undefined ? <>{fallback}</> : <SkeletonLoader />;
  }

  return <I18nextProvider i18n={instance}>{children}</I18nextProvider>;
};

export default I18nProvider;
