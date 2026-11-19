"use client"

import * as React from "react"
import { useTranslation } from "react-i18next"
import { Button } from "../../components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"
import { normalizeLanguage } from "../../app/i18n/language"

export function LanguageToggle() {
  const { t, i18n } = useTranslation()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="dark:bg-card dark:hover:bg-accent">
          {/* Flags stand for countries, not languages, and Windows shows them as bare letters. */}
          <span className="sr-only">{t("sidebar.language")} </span>
          <span className="text-xs font-semibold">{normalizeLanguage(i18n.language).toUpperCase()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => i18n.changeLanguage('fr')}>
          Français
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => i18n.changeLanguage('en')}>
          English
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}