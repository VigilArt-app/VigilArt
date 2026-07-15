"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import type {
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
  updateDmcaNoticeStatus,
  updateDmcaProfile,
} from "./api";
import { useAuth } from "@/src/components/contexts/authContext";
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

export function useDmcaPage() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const artworkPrefillParam = searchParams.get("prefill") ?? "";
  const artworkPrefill = useMemo(() => parseArtworkPrefill(artworkPrefillParam), [artworkPrefillParam]);

  const initializedPayloadKeyRef = useRef<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const [platforms, setPlatforms] = useState<DmcaPlatformGet[]>([]);
  const [selectedPlatformSlug, setSelectedPlatformSlug] = useState<string>("");

  const [profileForm, setProfileForm] = useState<ProfileFormState>(EMPTY_PROFILE);
  const [profileExists, setProfileExists] = useState(false);

  const [noticesByPlatform, setNoticesByPlatform] = useState<Record<string, DmcaNoticeGet>>({});
  const [activeNotice, setActiveNotice] = useState<DmcaNoticeGet | null>(null);
  const [generatedContent, setGeneratedContent] = useState<DmcaNoticeGeneratedContent | null>(null);

  const [allNotices, setAllNotices] = useState<DmcaNoticeGet[]>([]);

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [formPayload, setFormPayload] = useState<JsonLike>({});
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [preparingNotice, setPreparingNotice] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [copiedField, setCopiedField] = useState<"subject" | "body" | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [submittingStatus, setSubmittingStatus] = useState(false);
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
    if (!selectedPlatform) return [];
    return findInfringingRepeaters(selectedPlatform.formSchema as any);
  }, [selectedPlatform]);

  useEffect(() => {
    if (authLoading) return;

    if (!user?.id) {
      toast.error(t("dmca_page.not_authenticated"));
      setLoading(false);
      return;
    }

    const resolvedUserId = user.id;
    setUserId(resolvedUserId);

    const loadData = async () => {
      try {
        const [platformsRes, profileRes, noticesRes] = await Promise.allSettled([
          fetchDmcaPlatforms(),
          fetchDmcaProfile(resolvedUserId),
          fetchUserDmcaNotices(resolvedUserId),
        ]);

        if (platformsRes.status === "fulfilled") {
          const allPlatforms = platformsRes.value;
          setPlatforms(allPlatforms);
          setSelectedPlatformSlug((prev) => prev || (allPlatforms.length > 0 ? allPlatforms[0].slug : null));
        } else {
          toast.error(
            platformsRes.reason instanceof Error ? platformsRes.reason.message : t("dmca_page.failed_to_load"),
          );
        }

        if (profileRes.status === "fulfilled") {
          const profile = profileRes.value;
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
        } else {
          toast.error(
            profileRes.reason instanceof Error ? profileRes.reason.message : t("dmca_page.failed_to_load"),
          );
        }

        if (noticesRes.status === "fulfilled") {
          const userNotices = noticesRes.value;
          setAllNotices(userNotices);

          const mapped = userNotices.reduce<Record<string, DmcaNoticeGet>>((acc, notice) => {
            const existing = acc[notice.dmcaPlatformSlug];
            if (!existing) {
              acc[notice.dmcaPlatformSlug] = notice;
              return acc;
            }

            const existingDate = new Date(existing.updatedAt).getTime();
            const currentDate = new Date(notice.updatedAt).getTime();
            if (currentDate > existingDate) acc[notice.dmcaPlatformSlug] = notice;
            return acc;
          }, {});

          setNoticesByPlatform(mapped);
        } else {
          toast.error(
            noticesRes.reason instanceof Error ? noticesRes.reason.message : t("dmca_page.failed_to_load"),
          );
        }

        setDataLoaded(true);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : t("dmca_page.failed_to_load"));
        setDataLoaded(true);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [authLoading, t, user?.id]);

  useEffect(() => {
    return () => {
      initializedPayloadKeyRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!selectedPlatform || !dataLoaded) return;

    const initializationKey = `${selectedPlatform.slug}::${artworkPrefillParam}`;
    if (initializedPayloadKeyRef.current === initializationKey) return;

    const emptyPayload = createDefaultValueForItems(selectedPlatform.formSchema as any, artworkPrefill);
    setActiveNotice(null);
    setGeneratedContent(null);
    setFormPayload(
      clearPreselectedInfringingUrls(hydrateProfileInPayload(emptyPayload, profileForm), infringingRepeaters),
    );
    initializedPayloadKeyRef.current = initializationKey;
  }, [artworkPrefillParam, artworkPrefill, dataLoaded, infringingRepeaters, profileForm, selectedPlatform]);

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

      if (profileExists) await updateDmcaProfile(payload, userId);
      else {
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
            userId,
          })
        : await createDmcaNotice({
            dmcaPlatformSlug: selectedPlatform.slug,
            payload: formPayload,
            userId,
            artworkId: artworkPrefill.artworkId ?? null,
          });

      setActiveNotice(prepared);
      setNoticesByPlatform((prev) => ({ ...prev, [selectedPlatform.slug]: prepared }));
      setAllNotices((prev) => {
        const idx = prev.findIndex((n) => n.id === prepared.id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = prepared;
          return updated;
        }
        return [prepared, ...prev];
      });
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

  const handleLoadNotice = (notice: DmcaNoticeGet) => {
    if (notice.payload) {
      setFormPayload(deepClone(notice.payload as JsonLike));
      setActiveNotice(notice);
      setGeneratedContent(null);
      setSelectedPlatformSlug(notice.dmcaPlatformSlug);
      initializedPayloadKeyRef.current = `${notice.dmcaPlatformSlug}::${artworkPrefillParam}`;
      setCurrentStep(3);
      toast.success(t("dmca_page.notice_loaded"));
      setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 100);
    }
  };

  const startNewReport = async () => {
    setActiveNotice(null);
    setGeneratedContent(null);
    setFormPayload({});
    initializedPayloadKeyRef.current = null;
    setCurrentStep(1);
    window.scrollTo({ top: 0, behavior: "smooth" });

    if (userId) {
      try {
        const freshNotices = await fetchUserDmcaNotices(userId);
        setAllNotices(freshNotices);

        const mapped = freshNotices.reduce<Record<string, DmcaNoticeGet>>((acc, notice) => {
          const existing = acc[notice.dmcaPlatformSlug];
          if (!existing) {
            acc[notice.dmcaPlatformSlug] = notice;
            return acc;
          }
          const existingDate = new Date(existing.updatedAt).getTime();
          const currentDate = new Date(notice.updatedAt).getTime();
          if (currentDate > existingDate) acc[notice.dmcaPlatformSlug] = notice;
          return acc;
        }, {});
        setNoticesByPlatform(mapped);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : t("dmca_page.failed_to_load"));
      }
    }
  };

  const handleMarkSubmitted = async () => {
    if (!activeNotice) return;
    setSubmittingStatus(true);

    try {
      const updated = await updateDmcaNoticeStatus(activeNotice.id, "SUBMITTED");
      setActiveNotice(updated);
      setNoticesByPlatform((prev) => ({ ...prev, [updated.dmcaPlatformSlug]: updated }));
      setAllNotices((prev) => {
        const idx = prev.findIndex((n) => n.id === updated.id);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = updated;
          return copy;
        }
        return [updated, ...prev];
      });
      toast.success(t("dmca_page.status_updated"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("dmca_page.status_update_failed"));
    } finally {
      setSubmittingStatus(false);
    }
  };

  const mailtoHref = generatedContent
    ? `mailto:${encodeURIComponent(generatedContent.email.to)}?subject=${encodeURIComponent(
        generatedContent.email.subject,
      )}&body=${encodeURIComponent(generatedContent.email.body)}`
    : "";

  return {
    t,
    artworkPrefill,
    platforms,
    selectedPlatformSlug,
    setSelectedPlatformSlug,
    profileForm,
    profileExists,
    savingProfile,
    noticesByPlatform,
    activeNotice,
    generatedContent,
    allNotices,
    currentStep,
    setCurrentStep,
    formPayload,
    loading,
    preparingNotice,
    generating,
    copiedField,
    dataLoaded,
    selectedPlatform,
    detectedInfringingUrls,
    handleProfileChange,
    saveProfile,
    handlePrepareNotice,
    handleGenerate,
    copyToClipboard,
    updatePath,
    handleLoadNotice,
    startNewReport,
    handleMarkSubmitted,
    submittingStatus,
    mailtoHref,
  };
}
