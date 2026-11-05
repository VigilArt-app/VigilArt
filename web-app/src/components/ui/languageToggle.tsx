"use client"

import * as React from "react"
import { Languages } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Button } from "../../components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"
import {
  type AppLanguage,
  normalizeLanguage,
  SUPPORTED_LANGUAGES,
} from "../../app/i18n/language"

// Flags stand for countries, not languages, and Windows renders them as bare
// letters, so each language is shown under its own name instead.
const LANGUAGE_NAMES: Record<AppLanguage, string> = {
  en: "English",
  fr: "Français",
}

export const LanguageToggle = () => {
  const { t, i18n } = useTranslation()
  const current = normalizeLanguage(i18n.language)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-1.5 px-2.5 dark:bg-card dark:hover:bg-accent"
        >
          {/* Keeps the visible code in the accessible name, e.g. "Langue FR". */}
          <span className="sr-only">{t("sidebar.language")} </span>
          {/* The header has no room for the icon below 480px. */}
          <Languages className="size-4 max-[479px]:hidden" aria-hidden="true" />
          <span className="text-xs font-semibold">{current.toUpperCase()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup
          value={current}
          onValueChange={(language) =>
            void i18n.changeLanguage(normalizeLanguage(language))
          }
        >
          {SUPPORTED_LANGUAGES.map((code) => (
            <DropdownMenuRadioItem key={code} value={code} lang={code}>
              {LANGUAGE_NAMES[code]}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
