"use client"

import * as React from "react"
import { Monitor, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useTranslation } from "react-i18next"
import { cn } from "./lib/utils"

interface SegmentOption {
  value: string
  label: string
  content: React.ReactNode
}

// A row of mutually exclusive buttons that always shows the current choice,
// so switching takes one click instead of opening a menu first.
function SegmentedControl({
  label,
  value,
  options,
  onChange,
  className,
}: {
  label: string
  value: string | undefined
  options: SegmentOption[]
  onChange: (value: string) => void
  className?: string
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn("flex rounded-lg bg-sidebar-accent p-1", className)}
    >
      {options.map((option) => {
        const selected = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={option.label}
            title={option.label}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex h-10 flex-1 items-center justify-center rounded-md text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring [&>svg]:size-5",
              selected
                ? "bg-sidebar text-sidebar-foreground shadow-sm"
                : "text-sidebar-foreground/60 hover:text-sidebar-foreground"
            )}
          >
            {option.content}
          </button>
        )
      })}
    </div>
  )
}

export function SidebarPreferences() {
  const { t, i18n } = useTranslation()
  const { theme, setTheme } = useTheme()
  // next-themes only knows the stored theme on the client; rendering the
  // selection before mount would mismatch the server HTML.
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  return (
    <div className="flex gap-2 px-2">
      <SegmentedControl
        label={t("sidebar.theme")}
        value={mounted ? theme : undefined}
        onChange={setTheme}
        className="flex-[3]"
        options={[
          { value: "light", label: t("sidebar.theme_light"), content: <Sun /> },
          { value: "dark", label: t("sidebar.theme_dark"), content: <Moon /> },
          { value: "system", label: t("sidebar.theme_system"), content: <Monitor /> },
        ]}
      />
      <SegmentedControl
        label={t("sidebar.language")}
        value={i18n.language?.startsWith("fr") ? "fr" : "en"}
        onChange={(language) => i18n.changeLanguage(language)}
        className="flex-[2]"
        options={[
          { value: "fr", label: "Français", content: "FR" },
          { value: "en", label: "English", content: "EN" },
        ]}
      />
    </div>
  )
}
