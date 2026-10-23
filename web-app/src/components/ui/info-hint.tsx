"use client"

import * as React from "react"
import { Info } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip"
import { cn } from "../lib/utils"

/**
 * An "i" next to a label that reveals help text on hover, keyboard focus or
 * tap (touch screens have no hover). Pass `id` and point the field's
 * aria-describedby at it: the text is also rendered off-screen so screen
 * readers announce it with the field, tooltip open or not.
 */
export function InfoHint({
  children,
  id,
  className,
}: {
  children: React.ReactNode
  id?: string
  className?: string
}) {
  const { t } = useTranslation()
  const [open, setOpen] = React.useState(false)

  return (
    <>
      <Tooltip open={open} onOpenChange={setOpen} delayDuration={150}>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label={t("common.more_info")}
            onClick={(event) => {
              event.preventDefault()
              setOpen((value) => !value)
            }}
            className={cn(
              "inline-flex size-6 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              className
            )}
          >
            <Info className="size-[18px]" aria-hidden="true" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" sideOffset={4} className="max-w-xs text-sm leading-relaxed">
          {children}
        </TooltipContent>
      </Tooltip>
      {id && (
        <span id={id} className="sr-only">
          {children}
        </span>
      )}
    </>
  )
}
