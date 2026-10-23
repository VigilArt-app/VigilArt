"use client";

import { useEffect, useState } from "react";
import { Loader2, Upload, X, AlertTriangle, Bell, BellOff, Globe, Smartphone, Mail } from "lucide-react";
import type { UserUpdate } from "@vigilart/shared/types";
import {
  updateUserProfile,
  getAvatarUploadUrl,
  uploadAvatarToR2,
  getAvatarDownloadUrl,
  deleteAccount,
} from "./api";
import { Button, buttonVariants } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { useAuth } from "@/src/components/contexts/authContext";
import { useTranslation } from "react-i18next";
import { Switch } from "@/src/components/ui/switch";
import { useNotificationsSettings } from "@/src/components/contexts/notificationsContext";
import { toast } from "sonner";

export default function ProfilePage() {
  const { t } = useTranslation();
  const { user, loading: isLoading, refreshUser } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [avatarDisplayUrl, setAvatarDisplayUrl] = useState<string>("");

  const {
    isSupported: notificationsSupported,
    permission: notificationPermission,
    error: notificationsError,
    setNotificationsEnabled,
  } = useNotificationsSettings();

  const [formData, setFormData] = useState({
    email: "",
    avatar: "",
    avatarFile: null as File | null,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || "",
        avatar: user.avatar || "",
        avatarFile: null,
      });
    }
  }, [user]);

  useEffect(() => {
    const loadAvatarUrl = async () => {
      if (!formData.avatar) {
        setAvatarDisplayUrl("");
        return;
      }

      if (formData.avatar.startsWith("blob:")) {
        setAvatarDisplayUrl(formData.avatar);
      } else if (formData.avatar.startsWith("profiles/")) {
        try {
          const downloadUrl = await getAvatarDownloadUrl(formData.avatar);
          setAvatarDisplayUrl(downloadUrl);
        } catch (error) {
          setAvatarDisplayUrl("");
        }
      }
    };

    loadAvatarUrl();
  }, [formData.avatar]);

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        avatarFile: file,
        avatar: URL.createObjectURL(file),
      }));
    }
  };

  const handleRemoveAvatar = () => {
    setFormData((prev) => ({
      ...prev,
      avatar: user?.avatar || "",
      avatarFile: null,
    }));
  };

  const handleSaveProfile = async () => {
    if (!user?.id) {
      return;
    }

    const userId = user.id;

    setIsSaving(true);
    try {
      const updatePayload: UserUpdate = {};

      if (formData.avatarFile) {
        try {
          const uploadUrlData = await getAvatarUploadUrl(formData.avatarFile.name);
          await uploadAvatarToR2(formData.avatarFile, uploadUrlData.presignedUrl);
          updatePayload.avatar = uploadUrlData.storageKey;
        } catch (error) {
          setIsSaving(false);
          return;
        }
      }

      if (Object.keys(updatePayload).length === 0) {
        return;
      }

      await updateUserProfile(userId, updatePayload);
      await refreshUser();
      setFormData((prev) => ({
        ...prev,
        avatarFile: null,
      }));
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDeleteAccount = async () => {
    if (!user?.id) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteAccount(user.id);
      setDeleteDialogOpen(false);
      window.location.href = "/login";
    } catch {
      setIsDeleting(false);
    }
  };

  const handleWebNotificationsChange = async (enabled: boolean) => {
    if (!notificationsSupported) {
      toast.error(t("profil_page.notifications_unsupported"));
      return;
    }
    if (!user?.id)
      return;

    try {
      if (enabled) {
        const allowed = await setNotificationsEnabled(true);
        if (!allowed) {
          await setNotificationsEnabled(false);
          if (Notification.permission === "denied")
            toast.error(t("profil_page.notifications_denied"));
          return;
        }
      }
      await updateUserProfile(user.id, { webNotificationsEnabled: enabled });
      if (!enabled)
        await setNotificationsEnabled(false);
      await refreshUser();
    } catch {
      if (enabled)
        await setNotificationsEnabled(false);
      toast.error(t("profil_page.failed_update_notifications"));
    }
  };

  const handleMobileNotificationsChange = async (enabled: boolean) => {
    if (!user?.id)
      return;
    try {
      await updateUserProfile(user.id, { mobileNotificationsEnabled: enabled });
      await refreshUser();
    } catch {
      toast.error(t("profil_page.failed_update_notifications"));
    }
  };

  const handleMailNotificationsChange = async (enabled: boolean) => {
    if (!user?.id)
      return;
    try {
      await updateUserProfile(user.id, { mailNotificationsEnabled: enabled });
      await refreshUser();
    } catch {
      toast.error(t("profil_page.failed_update_notifications"));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="relative z-10 min-h-screen flex flex-col p-8">
        {user && (
          <div className=" text-4xl font-bold mb-8 pt-4">
            {t("profil_page.welcome")}
          </div>
        )}

        <div className="mr-auto w-full max-w-4xl rounded-xl shadow-sm p-8 bg-card border">
          {user && (
            <div className="space-y-8">
              <div className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-6 flex-1">
                  {avatarDisplayUrl ? (
                    <img src={avatarDisplayUrl} alt="Profile" className="h-24 w-24 rounded-full object-cover border-2 shrink-0" />
                  ) : (
                    <div className="h-24 w-24 rounded-full flex items-center justify-center border-2 shrink-0">
                      <span className="text-sm text-muted-foreground">{t("profil_page.no_avatar")}</span>
                    </div>
                  )}

                  <div>
                    <h2 className="text-2xl font-bold">
                      {user.email}
                    </h2>
                  </div>
                </div>
              </div>

              <div className="space-y-6 border-t pt-6">
                <div>
                  <Label className="block text-base font-semibold mb-3">{t("profil_page.profile_picture")}</Label>
                  <div className="flex items-center gap-4">
                    {formData.avatar && formData.avatar !== user?.avatar && (
                      <div className="relative">
                        <img src={avatarDisplayUrl || formData.avatar} alt="Avatar preview" className="h-16 w-16 rounded-full object-cover border-2" />
                        <button onClick={handleRemoveAvatar} disabled={isSaving} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 disabled:opacity-50"  >
                          <X className="size-4" />
                        </button>
                      </div>
                    )}
                    <label className={`${buttonVariants({ variant: "outline", size: "lg" })} text-base ${isSaving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                      {isSaving && formData.avatarFile ? (
                        <Loader2 className="size-5 animate-spin" />
                      ) : (
                        <Upload className="size-5" />
                      )}
                      <span>{isSaving && formData.avatarFile ? t("profil_page.uploading") : t("profil_page.upload_picture")}</span>
                      <input type="file" accept="image/*" onChange={handleAvatarFileChange} className="hidden" disabled={isSaving} />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="email" className="block text-base font-semibold mb-2">
                      {t("profil_page.email")}
                    </Label>
                    <Input id="email" name="email" value={formData.email} type="email" disabled className="w-full h-10 md:text-base cursor-not-allowed" />
                  </div>

                  {/* If we want to be able to change the password, we need a route to update it */}
                  <div>
                    <Label className="block text-base font-semibold mb-2">
                      {t("profil_page.password")}
                    </Label>
                    <Input type="password" value="••••••••••" disabled className="w-full h-10 md:text-base cursor-not-allowed" />
                  </div>
                </div>

                <div className="rounded-lg border bg-muted/30 p-4 space-y-4">
                  <div className="space-y-1">
                    <Label className="flex items-center gap-2 font-semibold text-base">
                      <Bell className="h-4 w-4" />
                      {t("profil_page.notifications_title")}
                    </Label>
                    <p className="text-base text-muted-foreground">
                      {t("profil_page.notifications_description")}
                    </p>
                  </div>

                  <div className="divide-y divide-border/60">
                    {/* Web Notifications Toggle */}
                    <div className="py-3 flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <Label htmlFor="web-notifications-switch" className="flex items-center gap-2 font-medium text-sm cursor-pointer">
                          <Globe className="h-4 w-4 text-primary" />
                          {t("profil_page.web_notifications_title")}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {t("profil_page.web_notifications_description")}
                        </p>
                        <p className="text-xs text-muted-foreground pt-0.5">
                          {notificationPermission === "granted"
                            ? t("profil_page.notifications_allowed")
                            : notificationPermission === "denied"
                              ? t("profil_page.notifications_blocked")
                              : t("profil_page.notifications_permission_prompt")}
                        </p>
                        {notificationsError && (
                          <p className="text-xs text-red-600">{notificationsError}</p>
                        )}
                      </div>

                      <Switch
                        id="web-notifications-switch"
                        checked={user?.webNotificationsEnabled ?? false}
                        onCheckedChange={handleWebNotificationsChange}
                        disabled={!notificationsSupported || isSaving || isDeleting}
                      />
                    </div>

                    {/* Mobile Notifications Toggle */}
                    <div className="py-3 flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <Label htmlFor="mobile-notifications-switch" className="flex items-center gap-2 font-medium text-sm cursor-pointer">
                          <Smartphone className="h-4 w-4 text-primary" />
                          {t("profil_page.mobile_notifications_title")}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {t("profil_page.mobile_notifications_description")}
                        </p>
                      </div>

                      <Switch
                        id="mobile-notifications-switch"
                        checked={user?.mobileNotificationsEnabled ?? false}
                        onCheckedChange={handleMobileNotificationsChange}
                        disabled={isSaving || isDeleting}
                      />
                    </div>

                    {/* Mail Notifications Toggle */}
                    <div className="pt-3 flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <Label htmlFor="mail-notifications-switch" className="flex items-center gap-2 font-medium text-sm cursor-pointer">
                          <Mail className="h-4 w-4 text-primary" />
                          {t("profil_page.mail_notifications_title")}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {t("profil_page.mail_notifications_description")}
                        </p>
                      </div>

                      <Switch
                        id="mail-notifications-switch"
                        checked={user?.mailNotificationsEnabled ?? false}
                        onCheckedChange={handleMailNotificationsChange}
                        disabled={isSaving || isDeleting}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-6 border-t">
                  <Button
                    variant="destructive"
                    size="lg"
                    onClick={() => setDeleteDialogOpen(true)}
                    disabled={isDeleting || isSaving}
                    className="gap-2 text-base"
                  >
                    {isDeleting && <Loader2 className="size-5 animate-spin" />}
                    {t("profil_page.delete_account")}
                  </Button>
                  <Button size="lg" onClick={handleSaveProfile} disabled={isSaving} className="gap-2 text-base">
                    {isSaving && <Loader2 className="size-5 animate-spin" />}
                    {t("profil_page.save")}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              {t("profil_page.delete_account_confirm")}
            </DialogTitle>
            <DialogDescription>
              {t("profil_page.delete_account_warning")}
            </DialogDescription>
          </DialogHeader>
          <div className="my-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-base text-red-700">{t("profil_page.delete_account_irreversible")}</p>
          </div>
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              size="lg"
              className="text-base"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              {t("profil_page.cancel")}
            </Button>
            <Button
              variant="destructive"
              size="lg"
              onClick={handleConfirmDeleteAccount}
              disabled={isDeleting}
              className="gap-2 text-base"
            >
              {isDeleting && <Loader2 className="size-5 animate-spin" />}
              {t("profil_page.delete_permanently")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
