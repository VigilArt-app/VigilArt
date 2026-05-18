"use client";

import { Loader2 } from "lucide-react";
import type { TFunction } from "i18next";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import type { ProfileFormState } from "../dmca-form-utils";

type DmcaProfileStepProps = {
  profileForm: ProfileFormState;
  profileExists: boolean;
  savingProfile: boolean;
  t: TFunction;
  onProfileChange: (key: keyof ProfileFormState, value: string) => void;
  onSaveProfile: () => void;
  onNext: () => void;
};

export function DmcaProfileStep({
  profileForm,
  profileExists,
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
            <Label className="font-semibold">{t("dmca_page.profile.full_name")}</Label>
            <Input
              placeholder="John Doe"
              value={profileForm.fullName}
              onChange={(e) => onProfileChange("fullName", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="font-semibold">{t("dmca_page.profile.email")}</Label>
            <Input
              type="email"
              placeholder="john@example.com"
              value={profileForm.email}
              onChange={(e) => onProfileChange("email", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="font-semibold">{t("dmca_page.profile.street")}</Label>
            <Input
              placeholder="123 Main Street"
              value={profileForm.street}
              onChange={(e) => onProfileChange("street", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="font-semibold">{t("dmca_page.profile.apt_suite")}</Label>
            <Input
              placeholder="Apt. 4B"
              value={profileForm.aptSuite}
              onChange={(e) => onProfileChange("aptSuite", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="font-semibold">{t("dmca_page.profile.city")}</Label>
            <Input
              placeholder="New York"
              value={profileForm.city}
              onChange={(e) => onProfileChange("city", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="font-semibold">{t("dmca_page.profile.postal_code")}</Label>
            <Input
              placeholder="10001"
              value={profileForm.postalCode}
              onChange={(e) => onProfileChange("postalCode", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="font-semibold">{t("dmca_page.profile.country")}</Label>
            <Input
              placeholder="United States"
              value={profileForm.country}
              onChange={(e) => onProfileChange("country", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="font-semibold">{t("dmca_page.profile.phone")}</Label>
            <Input
              placeholder="+1 (555) 123-4567"
              value={profileForm.phone}
              onChange={(e) => onProfileChange("phone", e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="font-semibold">{t("dmca_page.profile.signature")}</Label>
          <textarea
            placeholder="Enter your signature or initials"
            value={profileForm.signature}
            onChange={(e) => onProfileChange("signature", e.target.value)}
            className="w-full h-20 rounded-md border border-input px-3 py-2 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      <div className="flex gap-3 justify-between flex-wrap">
        <div className="flex gap-3">
          <Button onClick={onSaveProfile} disabled={savingProfile}>
            {savingProfile && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {t("dmca_page.save_profile")}
          </Button>
          <Button onClick={onNext} disabled={!profileExists} className="gap-2">
            {t("dmca_page.next")} →
          </Button>
        </div>
      </div>
    </div>
  );
}
