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

export function LanguageToggle() {
  const { i18n } = useTranslation()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <span className="h-[1.2rem] w-[1.2rem] overflow-hidden rounded-full">
            {i18n.language === 'fr' ? '🇫🇷' : '🇬🇧'}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => i18n.changeLanguage('fr')}>
          <span className="mr-2">🇫🇷</span>
          Français
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => i18n.changeLanguage('en')}>
          <span className="mr-2">🇬🇧</span>
          English
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}