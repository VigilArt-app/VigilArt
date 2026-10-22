import type { i18n as I18nInstance } from "i18next";

export const SUPPORTED_LANGUAGES = ["en", "fr"] as const;

export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const normalizeLanguage = (
  value: string | null | undefined,
): AppLanguage => (value === "fr" ? "fr" : "en");

export const bindLanguageSync = (
  instance: I18nInstance,
  globalInstance: I18nInstance,
  onChange: (language: AppLanguage) => void,
): (() => void) => {
  let currentLanguage = normalizeLanguage(instance.language);
  // Called from the provider's browser effect, never during request rendering.
  void globalInstance.changeLanguage(currentLanguage);

  const onLanguageChanged = (nextLanguage: string) => {
    const language = normalizeLanguage(nextLanguage);
    void globalInstance.changeLanguage(language);
    if (language === currentLanguage) return;
    currentLanguage = language;
    onChange(language);
  };

  instance.on("languageChanged", onLanguageChanged);
  return () => {
    instance.off("languageChanged", onLanguageChanged);
  };
};
