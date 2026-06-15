"use client";

import { Check, Copy, ExternalLink, Loader2 } from "lucide-react";
import type { TFunction } from "i18next";
import type { DmcaNoticeGeneratedContent, DmcaPlatformGet } from "@vigilart/shared/types";
import { Button } from "@/src/components/ui/button";

type DmcaSubmissionStepProps = {
  activeNotice: boolean;
  copiedField: "subject" | "body" | null;
  generatedContent: DmcaNoticeGeneratedContent | null;
  generating: boolean;
  mailtoHref: string;
  selectedPlatform: DmcaPlatformGet | null;
  t: TFunction;
  onBack: () => void;
  onCopyToClipboard: (value: string, kind: "subject" | "body") => void;
  onGenerate: () => void;
};

export function DmcaSubmissionStep({
  activeNotice,
  copiedField,
  generatedContent,
  generating,
  mailtoHref,
  selectedPlatform,
  t,
  onBack,
  onCopyToClipboard,
  onGenerate,
}: DmcaSubmissionStepProps) {
  return (
    <div className="rounded-xl border p-8 space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{t("dmca_page.send_title")}</h2>
        <p className="text-muted-foreground mt-2">{t("dmca_page.send_subtitle")}</p>
      </div>

      {selectedPlatform && (
        <div className="space-y-4">
          <div className="rounded-lg border p-4 space-y-3">
            {selectedPlatform.dmcaUrl ? (
              <Button asChild className="w-full">
                <a href={selectedPlatform.dmcaUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  {t("dmca_page.open_platform_form")}
                </a>
              </Button>
            ) : (
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm text-muted-foreground">{t("dmca_page.platform_form_url_unavailable")}</p>
              </div>
            )}
          </div>

          {generatedContent ? (
            <div className="space-y-4">
              <div className="rounded-lg border-2 border-dashed p-4 space-y-3">
                <div>
                  <p className="font-semibold text-sm text-gray-600">{t("dmca_page.email_to")}</p>
                  <p className="text-foreground font-mono text-sm">{generatedContent.email.to}</p>
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-600">{t("dmca_page.email_subject")}</p>
                  <p className="text-foreground text-sm break-words">{generatedContent.email.subject}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => onCopyToClipboard(generatedContent.email.subject, "subject")}
                  className="gap-2"
                >
                  {copiedField === "subject" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {t("dmca_page.copy_subject")}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onCopyToClipboard(generatedContent.email.body, "body")}
                  className="gap-2"
                >
                  {copiedField === "body" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {t("dmca_page.copy_body")}
                </Button>
              </div>

              <Button asChild variant="outline" className="w-full">
                <a href={mailtoHref} className="gap-2">
                  ✉️ {t("dmca_page.open_mail_app")}
                </a>
              </Button>

              <Button asChild className="w-full gap-2">
                <a href={generatedContent.pdf.url} target="_blank" rel="noopener noreferrer">
                  📄 {t("dmca_page.download_pdf")}
                </a>
              </Button>
            </div>
          ) : (
            <div className="rounded-lg border p-4">
              <p className="text-sm">{t("dmca_page.generate_notice_first")}</p>
              <Button onClick={onGenerate} disabled={generating || !activeNotice} className="mt-3 gap-2">
                {generating && <Loader2 className="h-4 w-4 animate-spin" />}
                {t("dmca_page.generate_content")}
              </Button>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-3 justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          ← {t("dmca_page.back")}
        </Button>
      </div>
    </div>
  );
}