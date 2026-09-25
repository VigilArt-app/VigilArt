"use client"

import { Download } from "lucide-react"
import { useTranslation } from "react-i18next"

import { Button } from "../components/ui/button"

const RELEASES_URL = "https://github.com/VigilArt-app/VigilArt/releases/latest"

export function DownloadApkButton() {
  const { t } = useTranslation()

  return (
    <Button variant="outline" size="sm" asChild className="h-11 min-w-11 px-3">
      <a href={RELEASES_URL} target="_blank" rel="noopener noreferrer">
        <Download />
        <span className="hidden sm:inline">{t("common.download_apk")}</span>
      </a>
    </Button>
  )
}
