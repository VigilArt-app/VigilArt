"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, ExternalLink, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import type {
  DmcaFormItem,
  DmcaNoticeGeneratedContent,
  DmcaNoticeGet,
  DmcaPlatformGet,
} from "@vigilart/shared/types";
import {
  createDmcaNotice,
  createDmcaProfile,
  fetchDmcaPlatforms,
  fetchDmcaProfile,
  fetchUserDmcaNotices,
  generateDmcaNotice,
  updateDmcaNotice,
  updateDmcaProfile,
} from "./api";
import { DmcaSchemaForm } from "./DmcaSchemaForm";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { useTranslation } from "react-i18next";
import {
  EMPTY_PROFILE,
  clearPreselectedInfringingUrls,
  createDefaultValueForItems,
  deepClone,
  findInfringingRepeaters,
  hydrateProfileInPayload,
  parseArtworkPrefill,
  setAtPath,
  type JsonLike,
  type PathPart,
  type ProfileFormState,
} from "./dmca-form-utils";
import { useAuth } from "@/src/components/contexts/authContext";

export default function DmcaPage() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const artworkPrefillParam = searchParams.get("prefill") ?? "";
  const artworkPrefill = useMemo(
    () => parseArtworkPrefill(artworkPrefillParam),
    [artworkPrefillParam],
  );
  const initializedPayloadKeyRef = useRef<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const [platforms, setPlatforms] = useState<DmcaPlatformGet[]>([]);
  const [selectedPlatformSlug, setSelectedPlatformSlug] = useState<string>("");

  const [profileForm, setProfileForm] = useState<ProfileFormState>(EMPTY_PROFILE);
  const [profileExists, setProfileExists] = useState(false);

  const [noticesByPlatform, setNoticesByPlatform] = useState<Record<string, DmcaNoticeGet>>({});
  const [activeNotice, setActiveNotice] = useState<DmcaNoticeGet | null>(null);
  const [generatedContent, setGeneratedContent] = useState<DmcaNoticeGeneratedContent | null>(null);

  const [formPayload, setFormPayload] = useState<JsonLike>({});
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [preparingNotice, setPreparingNotice] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [copiedField, setCopiedField] = useState<"subject" | "body" | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const { user, loading: authLoading } = useAuth();

  const selectedPlatform = useMemo(
    () => platforms.find((platform) => platform.slug === selectedPlatformSlug) ?? null,
    [platforms, selectedPlatformSlug],
  );

  const detectedInfringingUrls = useMemo(() => {
    const uniqueUrls = new Set((artworkPrefill.infringingUrls || []).filter(Boolean));
    return Array.from(uniqueUrls);
  }, [artworkPrefill.infringingUrls]);

  const infringingRepeaters = useMemo(() => {
    if (!selectedPlatform) {
      return [];
    }

    return findInfringingRepeaters(selectedPlatform.formSchema as DmcaFormItem[]);
  }, [selectedPlatform]);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user?.id) {
      toast.error(t("dmca_page.not_authenticated"));
      setLoading(false);
      return;
    }

    const resolvedUserId = user.id;
    setUserId(resolvedUserId);

    const loadData = async () => {
      try {
        const [allPlatforms, profile, userNotices] = await Promise.all([
          fetchDmcaPlatforms(),
          fetchDmcaProfile(resolvedUserId),
          fetchUserDmcaNotices(resolvedUserId),
        ]);

        setPlatforms(allPlatforms);

        if (allPlatforms.length > 0) {
          setSelectedPlatformSlug(allPlatforms[0].slug);
        }

        if (profile) {
          setProfileExists(true);
          setProfileForm({
            fullName: profile.fullName || "",
            street: profile.street || "",
            aptSuite: profile.aptSuite || "",
            city: profile.city || "",
            postalCode: profile.postalCode || "",
            country: profile.country || "",
            email: profile.email || "",
            phone: profile.phone || "",
            signature: profile.signature || "",
          });
        }

        const mapped = userNotices.reduce<Record<string, DmcaNoticeGet>>((acc, notice) => {
          const existing = acc[notice.dmcaPlatformSlug];

          if (!existing) {
            acc[notice.dmcaPlatformSlug] = notice;
            return acc;
          }

          const existingDate = new Date(existing.updatedAt).getTime();
          const currentDate = new Date(notice.updatedAt).getTime();
          if (currentDate > existingDate) {
            acc[notice.dmcaPlatformSlug] = notice;
          }

          return acc;
        }, {});

        setNoticesByPlatform(mapped);
        setDataLoaded(true);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : t("dmca_page.failed_to_load"),
        );
        setDataLoaded(true);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [authLoading, t, user?.id]);

  useEffect(() => {
    if (!selectedPlatform || !dataLoaded) return;

    const initializationKey = `${selectedPlatform.slug}::${artworkPrefillParam}`;

    if (initializedPayloadKeyRef.current === initializationKey) {
      return;
    }

    const savedNotice = noticesByPlatform[selectedPlatform.slug];

    if (savedNotice && savedNotice.payload) {
      setActiveNotice(savedNotice);
      setFormPayload(deepClone(savedNotice.payload as JsonLike));
      setGeneratedContent(null);
      initializedPayloadKeyRef.current = initializationKey;
      return;
    }

    const emptyPayload = createDefaultValueForItems(selectedPlatform.formSchema as DmcaFormItem[], artworkPrefill);
    setActiveNotice(null);
    setGeneratedContent(null);
    setFormPayload(
      clearPreselectedInfringingUrls(
        hydrateProfileInPayload(emptyPayload, profileForm),
        infringingRepeaters,
      ),
    );
    initializedPayloadKeyRef.current = initializationKey;
  }, [
    artworkPrefillParam,
    artworkPrefill,
    dataLoaded,
    infringingRepeaters,
    noticesByPlatform,
    profileForm,
    selectedPlatform,
  ]);

  const handleProfileChange = (key: keyof ProfileFormState, value: string) => {
    setProfileForm((prev) => ({ ...prev, [key]: value }));
  };

  const saveProfile = async () => {
    if (!userId) return;

    setSavingProfile(true);

    try {
      const payload = {
        fullName: profileForm.fullName,
        street: profileForm.street,
        aptSuite: profileForm.aptSuite || null,
        city: profileForm.city,
        postalCode: profileForm.postalCode,
        country: profileForm.country,
        email: profileForm.email,
        phone: profileForm.phone,
        signature: profileForm.signature,
      };

      if (profileExists) {
        await updateDmcaProfile(payload, userId);
      } else {
        await createDmcaProfile(payload, userId);
        setProfileExists(true);
      }

      const savedProfile: ProfileFormState = {
        fullName: payload.fullName,
        street: payload.street,
        aptSuite: payload.aptSuite || "",
        city: payload.city,
        postalCode: payload.postalCode,
        country: payload.country,
        email: payload.email,
        phone: payload.phone,
        signature: payload.signature,
      };

      setFormPayload((current) => hydrateProfileInPayload(deepClone(current), savedProfile));
      toast.success(t("dmca_page.profile_saved"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("dmca_page.profile_save_failed"));
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePrepareNotice = async () => {
    if (!userId || !selectedPlatform) return;

    setPreparingNotice(true);

    try {
      const currentNotice = noticesByPlatform[selectedPlatform.slug];
      const canUpdateCurrent = currentNotice && currentNotice.status !== "SUBMITTED";

      const prepared = canUpdateCurrent
        ? await updateDmcaNotice(currentNotice.id, {
            dmcaPlatformSlug: selectedPlatform.slug,
            payload: formPayload,
            userId
          })
        : await createDmcaNotice({
            dmcaPlatformSlug: selectedPlatform.slug,
            payload: formPayload,
            userId,
            artworkId: artworkPrefill.artworkId ?? null,
          });

      setActiveNotice(prepared);
      setNoticesByPlatform((prev) => ({ ...prev, [selectedPlatform.slug]: prepared }));
      setGeneratedContent(null);

      toast.success(t("dmca_page.notice_prepared"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("dmca_page.notice_prepare_failed"));
    } finally {
      setPreparingNotice(false);
    }
  };

  const handleGenerate = async () => {
    if (!activeNotice) {
      toast.error(t("dmca_page.prepare_notice_first"));
      return;
    }

    setGenerating(true);

    try {
      const generated = await generateDmcaNotice(activeNotice.id);
      setGeneratedContent(generated);
      toast.success(t("dmca_page.content_generated"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("dmca_page.content_generation_failed"));
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = async (value: string, kind: "subject" | "body") => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(kind);
      setTimeout(() => setCopiedField(null), 1200);
    } catch {
      toast.error(t("dmca_page.copy_failed"));
    }
  };

  const updatePath = (path: PathPart[], value: JsonLike) => {
    setFormPayload((prev) => setAtPath(prev, path, value));
  };

  const mailtoHref = generatedContent
    ? `mailto:${encodeURIComponent(generatedContent.email.to)}?subject=${encodeURIComponent(generatedContent.email.subject)}&body=${encodeURIComponent(generatedContent.email.body)}`
    : "";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">{t("dmca_page.title")}</h1>
        <p className="text-muted-foreground">{t("dmca_page.subtitle")}</p>
      </div>

      <div className="rounded-lg border border-amber-300/70 bg-amber-50 dark:bg-amber-900/20 p-4">
        <p className="text-sm">{t("dmca_page.legal_notice")}</p>
      </div>

      <section className="rounded-xl border p-5 space-y-4">
        <div>
          <h2 className="text-xl font-semibold">{t("dmca_page.profile_title")}</h2>
          <p className="text-sm text-muted-foreground">{t("dmca_page.profile_subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{t("dmca_page.profile.full_name")}</Label>
            <Input value={profileForm.fullName} onChange={(e) => handleProfileChange("fullName", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{t("dmca_page.profile.email")}</Label>
            <Input type="email" value={profileForm.email} onChange={(e) => handleProfileChange("email", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{t("dmca_page.profile.street")}</Label>
            <Input value={profileForm.street} onChange={(e) => handleProfileChange("street", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{t("dmca_page.profile.apt_suite")}</Label>
            <Input value={profileForm.aptSuite} onChange={(e) => handleProfileChange("aptSuite", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{t("dmca_page.profile.city")}</Label>
            <Input value={profileForm.city} onChange={(e) => handleProfileChange("city", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{t("dmca_page.profile.postal_code")}</Label>
            <Input value={profileForm.postalCode} onChange={(e) => handleProfileChange("postalCode", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{t("dmca_page.profile.country")}</Label>
            <Input value={profileForm.country} onChange={(e) => handleProfileChange("country", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{t("dmca_page.profile.phone")}</Label>
            <Input value={profileForm.phone} onChange={(e) => handleProfileChange("phone", e.target.value)} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>{t("dmca_page.profile.signature")}</Label>
            <Input value={profileForm.signature} onChange={(e) => handleProfileChange("signature", e.target.value)} />
          </div>
        </div>

        <Button onClick={saveProfile} disabled={savingProfile}>
          {savingProfile && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          {t("dmca_page.save_profile")}
        </Button>
      </section>

      <section className="rounded-xl border p-5 space-y-4">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">{t("dmca_page.notice_title")}</h2>
          <p className="text-sm text-muted-foreground">{t("dmca_page.notice_subtitle")}</p>
        </div>

        <div className="space-y-2 max-w-sm">
          <Label>{t("dmca_page.platform")}</Label>
          <select
            value={selectedPlatformSlug}
            onChange={(event) => setSelectedPlatformSlug(event.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm"
          >
            {platforms.map((platform) => (
              <option key={platform.slug} value={platform.slug} className="bg-background text-foreground">
                {platform.displayName}
              </option>
            ))}
          </select>
        </div>

        {selectedPlatform && (
          <div className="rounded-md border p-3 bg-muted/20 text-sm space-y-1">
            <p>
              <span className="font-medium">{t("dmca_page.platform_domain")}: </span>
              {selectedPlatform.domain || t("dmca_page.not_available")}
            </p>
            <p>
              <span className="font-medium">{t("dmca_page.platform_email")}: </span>
              {selectedPlatform.email || t("dmca_page.not_available")}
            </p>
          </div>
        )}

        {selectedPlatform && (
          <DmcaSchemaForm
            schema={selectedPlatform.formSchema as DmcaFormItem[]}
            payload={formPayload}
            artworkPrefill={artworkPrefill}
            detectedInfringingUrls={detectedInfringingUrls}
            onUpdatePath={updatePath}
            t={t}
          />
        )}

        <div className="flex flex-wrap gap-3">
          <Button onClick={handlePrepareNotice} disabled={preparingNotice || !selectedPlatform}>
            {preparingNotice && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {t("dmca_page.prepare_notice")}
          </Button>
          <Button variant="outline" onClick={handleGenerate} disabled={generating || !activeNotice}>
            {generating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {t("dmca_page.generate_content")}
          </Button>
        </div>

        {activeNotice && (
          <p className="text-sm text-muted-foreground">
            {t("dmca_page.notice_status")}: {activeNotice.status}
          </p>
        )}
      </section>

      {selectedPlatform && (
        <section className="rounded-xl border p-5 space-y-4">
          <h2 className="text-xl font-semibold">{t("dmca_page.send_title")}</h2>
          <p className="text-sm text-muted-foreground">{t("dmca_page.send_subtitle")}</p>

          {selectedPlatform.dmcaUrl ? (
            <Button asChild>
              <a href={selectedPlatform.dmcaUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                {t("dmca_page.open_platform_form")}
              </a>
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground">{t("dmca_page.no_platform_url")}</p>
          )}

          {generatedContent && (
            <div className="space-y-4">
              <div className="rounded-md border p-3 space-y-2">
                <p className="text-sm">
                  <span className="font-medium">To:</span> {generatedContent.email.to}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Subject:</span> {generatedContent.email.subject}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(generatedContent.email.subject, "subject")}
                  >
                    {copiedField === "subject" ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                    {t("dmca_page.copy_subject")}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(generatedContent.email.body, "body")}
                  >
                    {copiedField === "body" ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                    {t("dmca_page.copy_body")}
                  </Button>
                  <Button asChild type="button" variant="outline" size="sm">
                    <a href={mailtoHref}>{t("dmca_page.open_mail_app")}</a>
                  </Button>
                </div>
              </div>

              <Button asChild variant="outline">
                <a href={generatedContent.pdf.url} target="_blank" rel="noopener noreferrer">
                  {t("dmca_page.download_pdf")}
                </a>
              </Button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
