"use client"

import { Download } from "lucide-react"
import { useTranslation } from "react-i18next"

import { Button } from "../components/ui/button"

export function DownloadApkButton() {
  const { t } = useTranslation()

  return (
    <Button variant="outline" size="sm" asChild>
      <a href="/downloads/vigilart.apk" download>
        <Download />
        {t("common.download_apk")}
      </a>
    </Button>
  )
}
