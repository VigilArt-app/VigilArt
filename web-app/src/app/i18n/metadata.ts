import type { AppLanguage } from "./language";

export const selectLocalizedMetadata = <T>(
  language: AppLanguage,
  metadata: Record<AppLanguage, T>,
): T => metadata[language];
