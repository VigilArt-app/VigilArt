"use client";

import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { DmcaNoticesHistorySection } from "./components/DmcaNoticesHistorySection";
import { DmcaPreparationStep } from "./components/DmcaPreparationStep";
import { DmcaProfileStep } from "./components/DmcaProfileStep";
import { DmcaStepIndicator } from "./components/DmcaStepIndicator";
import { DmcaSubmissionStep } from "./components/DmcaSubmissionStep";
import { useDmcaPage } from "./useDmcaPage";

export default function DmcaPage() {
  const { t } = useTranslation();
  const dmca = useDmcaPage();

  if (dmca.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">{t("dmca_page.title")}</h1>
        <p className="text-muted-foreground">{t("dmca_page.subtitle")}</p>
      </div>

      <div className="rounded-lg border border-amber-300/70 bg-amber-50 dark:bg-amber-900/20 p-4">
        <p className="text-sm">{t("dmca_page.legal_notice")}</p>
      </div>

      <DmcaStepIndicator currentStep={dmca.currentStep} />

      <DmcaNoticesHistorySection notices={dmca.allNotices} t={t} onLoadNotice={dmca.handleLoadNotice} />

      {dmca.currentStep === 1 && (
        <DmcaProfileStep
          profileForm={dmca.profileForm}
          profileExists={dmca.profileExists}
          savingProfile={dmca.savingProfile}
          t={t}
          onProfileChange={dmca.handleProfileChange}
          onSaveProfile={dmca.saveProfile}
          onNext={() => dmca.setCurrentStep(2)}
        />
      )}

      {dmca.currentStep === 2 && (
        <DmcaPreparationStep
          platforms={dmca.platforms}
          activeNotice={dmca.activeNotice}
          artworkPrefill={dmca.artworkPrefill}
          detectedInfringingUrls={dmca.detectedInfringingUrls}
          formPayload={dmca.formPayload}
          preparingNotice={dmca.preparingNotice}
          selectedPlatform={dmca.selectedPlatform}
          selectedPlatformSlug={dmca.selectedPlatformSlug}
          t={t}
          onBack={() => dmca.setCurrentStep(1)}
          onNext={() => dmca.activeNotice && dmca.setCurrentStep(3)}
          onPrepareNotice={dmca.handlePrepareNotice}
          onUpdatePath={dmca.updatePath}
          onSelectedPlatformChange={dmca.setSelectedPlatformSlug}
        />
      )}

      {dmca.currentStep === 3 && (
        <DmcaSubmissionStep
          activeNotice={Boolean(dmca.activeNotice)}
          copiedField={dmca.copiedField}
          generatedContent={dmca.generatedContent}
          generating={dmca.generating}
          mailtoHref={dmca.mailtoHref}
          selectedPlatform={dmca.selectedPlatform}
          t={t}
          onBack={() => dmca.setCurrentStep(2)}
          onCopyToClipboard={dmca.copyToClipboard}
          onGenerate={dmca.handleGenerate}
        />
      )}
    </div>
  );
}

