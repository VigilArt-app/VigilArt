"use client";

import { Loader2 } from "lucide-react";
import type { TFunction } from "i18next";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import type { ProfileFormState } from "../dmca-form-utils";
import { DMCA_CONTROL_CLASS, DMCA_INPUT_CLASS, DMCA_LABEL_CLASS } from "../DmcaSchemaForm";

type DmcaProfileStepProps = {
  profileForm: ProfileFormState;
  profileExists: boolean;
  profileEmailInvalid: boolean;
  savingProfile: boolean;
  t: TFunction;
  onProfileChange: (key: keyof ProfileFormState, value: string) => void;
  onSaveProfile: () => void;
  onNext: () => void;
};

export function DmcaProfileStep({
  profileForm,
  profileExists,
  profileEmailInvalid,
  savingProfile,
  t,
  onProfileChange,
  onSaveProfile,
  onNext,
}: DmcaProfileStepProps) {
  return (
    <div className="rounded-xl border p-8 space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{t("dmca_page.profile_title")}</h2>
        <p className="text-muted-foreground mt-2">{t("dmca_page.profile_subtitle")}</p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className={`font-semibold ${DMCA_LABEL_CLASS}`}>{t("dmca_page.profile.full_name")}</Label>
            <Input
              className={DMCA_INPUT_CLASS}
              placeholder="John Doe"
              value={profileForm.fullName}
              onChange={(e) => onProfileChange("fullName", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dmca-profile-email" className={`font-semibold ${DMCA_LABEL_CLASS}`}>{t("dmca_page.profile.email")}</Label>
            <Input
              id="dmca-profile-email"
              className={DMCA_INPUT_CLASS}
              type="email"
              placeholder="john@example.com"
              value={profileForm.email}
              onChange={(e) => onProfileChange("email", e.target.value)}
              aria-invalid={profileEmailInvalid || undefined}
              aria-describedby={profileEmailInvalid ? "dmca-profile-email-error" : undefined}
            />
            {profileEmailInvalid && (
              <p id="dmca-profile-email-error" className="text-sm text-destructive">
                {t("dmca_page.invalid_email")}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label className={`font-semibold ${DMCA_LABEL_CLASS}`}>{t("dmca_page.profile.street")}</Label>
            <Input
              className={DMCA_INPUT_CLASS}
              placeholder="123 Main Street"
              value={profileForm.street}
              onChange={(e) => onProfileChange("street", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className={`font-semibold ${DMCA_LABEL_CLASS}`}>{t("dmca_page.profile.apt_suite")}</Label>
            <Input
              className={DMCA_INPUT_CLASS}
              placeholder="Apt. 4B"
              value={profileForm.aptSuite}
              onChange={(e) => onProfileChange("aptSuite", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className={`font-semibold ${DMCA_LABEL_CLASS}`}>{t("dmca_page.profile.city")}</Label>
            <Input
              className={DMCA_INPUT_CLASS}
              placeholder="New York"
              value={profileForm.city}
              onChange={(e) => onProfileChange("city", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className={`font-semibold ${DMCA_LABEL_CLASS}`}>{t("dmca_page.profile.postal_code")}</Label>
            <Input
              className={DMCA_INPUT_CLASS}
              placeholder="10001"
              value={profileForm.postalCode}
              onChange={(e) => onProfileChange("postalCode", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className={`font-semibold ${DMCA_LABEL_CLASS}`}>{t("dmca_page.profile.country")}</Label>
            <Input
              className={DMCA_INPUT_CLASS}
              placeholder="United States"
              value={profileForm.country}
              onChange={(e) => onProfileChange("country", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className={`font-semibold ${DMCA_LABEL_CLASS}`}>{t("dmca_page.profile.phone")}</Label>
            <Input
              className={DMCA_INPUT_CLASS}
              placeholder="+1 (555) 123-4567"
              value={profileForm.phone}
              onChange={(e) => onProfileChange("phone", e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className={`font-semibold ${DMCA_LABEL_CLASS}`}>{t("dmca_page.profile.signature")}</Label>
          <textarea
            placeholder="Enter your signature or initials"
            value={profileForm.signature}
            onChange={(e) => onProfileChange("signature", e.target.value)}
            className={`${DMCA_CONTROL_CLASS} h-20 py-2 text-foreground`}
          />
        </div>
      </div>

      <div className="flex gap-3 justify-between flex-wrap">
        <div className="flex gap-3">
          <Button className="text-base" size="lg" onClick={onSaveProfile} disabled={savingProfile}>
            {savingProfile && <Loader2 className="size-5 animate-spin mr-2" />}
            {t("dmca_page.save_profile")}
          </Button>
          <Button size="lg" onClick={onNext} className="gap-2 text-base">
            {t("dmca_page.next")} →
          </Button>
        </div>
      </div>
    </div>
  );
}
