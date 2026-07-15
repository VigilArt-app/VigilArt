"use client";

import { Loader2 } from "lucide-react";
import type { TFunction } from "i18next";
import type { DmcaFormItem, DmcaNoticeGet, DmcaPlatformGet } from "@vigilart/shared/types";
import { Button } from "@/src/components/ui/button";
import { Label } from "@/src/components/ui/label";
import { DmcaSchemaForm } from "../DmcaSchemaForm";
import type { ArtworkPrefill, JsonLike, PathPart } from "../dmca-form-utils";

type DmcaPreparationStepProps = {
  platforms: DmcaPlatformGet[];
  activeNotice: DmcaNoticeGet | null;
  artworkPrefill: ArtworkPrefill;
  detectedInfringingUrls: string[];
  formPayload: JsonLike;
  preparingNotice: boolean;
  selectedPlatform: DmcaPlatformGet | null;
  selectedPlatformSlug: string;
  t: TFunction;
  onBack: () => void;
  onNext: () => void;
  onPrepareNotice: () => void;
  onUpdatePath: (path: PathPart[], value: JsonLike) => void;
  onSelectedPlatformChange: (value: string) => void;
};

export function DmcaPreparationStep({
  platforms,
  activeNotice,
  artworkPrefill,
  detectedInfringingUrls,
  formPayload,
  preparingNotice,
  selectedPlatform,
  selectedPlatformSlug,
  t,
  onBack,
  onNext,
  onPrepareNotice,
  onUpdatePath,
  onSelectedPlatformChange,
}: DmcaPreparationStepProps) {
  return (
    <div className="rounded-xl border p-8 space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{t("dmca_page.notice_title")}</h2>
        <p className="text-muted-foreground mt-2">{t("dmca_page.notice_subtitle")}</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label className="font-semibold text-lg">{t("dmca_page.platform")}</Label>
          <select
            value={selectedPlatformSlug}
            onChange={(event) => onSelectedPlatformChange(event.target.value)}
            className="w-full rounded-md border border-input px-4 py-3 text-sm font-medium bg-background text-foreground"
          >
            <option value="">-- {t("dmca_page.select_platform")} --</option>
            {platforms.map((platform) => (
              <option key={platform.slug} value={platform.slug}>
                {platform.displayName}
              </option>
            ))}
          </select>
        </div>

        {selectedPlatform && (
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">
                {t("dmca_page.platform_domain")}
              </p>
              <p className="text-foreground mt-1">{selectedPlatform.domain || t("dmca_page.not_available")}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">
                {t("dmca_page.platform_email")}
              </p>
              <p className="text-foreground mt-1 break-all">{selectedPlatform.email || t("dmca_page.not_available")}</p>
            </div>
          </div>
        )}

        {selectedPlatform && (
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-lg">{t("dmca_page.core_data_title")}</h3>
              <p className="text-sm text-muted-foreground mt-1">{t("dmca_page.core_data_subtitle")}</p>
            </div>
            <DmcaSchemaForm
              schema={selectedPlatform.formSchema as DmcaFormItem[]}
              payload={formPayload}
              artworkPrefill={artworkPrefill}
              detectedInfringingUrls={detectedInfringingUrls}
              onUpdatePath={onUpdatePath}
              t={t}
            />
          </div>
        )}

        {activeNotice && (
          <div className="p-3 border-l-4 border-green-500">
            <p className="text-sm">
              <span className="font-semibold">{t("dmca_page.notice_status")}:</span> {activeNotice.status}
            </p>
          </div>
        )}
      </div>

      <div className="flex gap-3 justify-between pt-4 border-t">
        <Button variant="outline" onClick={onBack}>
          ← {t("dmca_page.back")}
        </Button>
        <div className="flex gap-3">
          <Button onClick={onPrepareNotice} disabled={preparingNotice || !selectedPlatform}>
            {preparingNotice && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {t("dmca_page.prepare_notice")}
          </Button>
          <Button
            onClick={onNext}
            disabled={!activeNotice}
            className="gap-2"
          >
            {t("dmca_page.next")} →
          </Button>
        </div>
      </div>
    </div>
  );
}
