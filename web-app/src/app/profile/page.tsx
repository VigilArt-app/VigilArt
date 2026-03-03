"use client";

import { useEffect, useState } from "react";
import { Loader2, Upload, X } from "lucide-react";
import type { UserUpdate } from "@vigilart/shared/types";
import {
  updateUserProfile,
  getAvatarUploadUrl,
  uploadAvatarToR2,
  getAvatarDownloadUrl,
} from "./api";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { useAuth } from "@/src/components/contexts/authContext";

export default function ProfilePage() {
  const { user, loading: isLoading, refreshUser } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [avatarDisplayUrl, setAvatarDisplayUrl] = useState<string>("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    avatar: "",
    avatarFile: null as File | null,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

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
    setIsSaving(true);
    try {
      const updatePayload: UserUpdate = {};

      if (formData.firstName !== user?.firstName) {
        updatePayload.firstName = formData.firstName;
      }
      if (formData.lastName !== user?.lastName) {
        updatePayload.lastName = formData.lastName;
      }
      if (formData.email !== user?.email) {
        updatePayload.email = formData.email;
      }

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

      await updateUserProfile(user.id, updatePayload);
      await refreshUser();
      setFormData((prev) => ({
        ...prev,
        avatarFile: null,
      }));
    } finally {
      setIsSaving(false);
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
            Welcome, {user.firstName || "User"}
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
                      <span className="text-xs">No avatar</span>
                    </div>
                  )}

                  <div>
                    <h2 className="text-2xl font-bold">
                      {user.firstName} {user.lastName}
                    </h2>
                    <p className="text-sm mt-1">{user.email}</p>
                  </div>
                </div>
              </div>

                <div className="space-y-6 border-t pt-6">
                  <div>
                    <Label className="block font-semibold mb-3">Profile Picture</Label>
                    <div className="flex items-center gap-4">
                      {formData.avatar && formData.avatar !== user?.avatar && (
                        <div className="relative">
                          <img src={avatarDisplayUrl || formData.avatar} alt="Avatar preview" className="h-16 w-16 rounded-full object-cover border-2"  />
                          <button onClick={handleRemoveAvatar} disabled={isSaving} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 disabled:opacity-50"  >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                      <label className={`flex items-center gap-2 ${isSaving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} text-sm`}>
                        {isSaving && formData.avatarFile ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                        <span>{isSaving && formData.avatarFile ? 'Uploading...' : 'Upload Picture'}</span>
                        <input type="file" accept="image/*" onChange={handleAvatarFileChange} className="hidden" disabled={isSaving} />
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="lastName" className="block font-semibold mb-2">
                        Surname
                      </Label>
                      <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Enter surname" type="text" className="w-full" />
                    </div>

                    <div>
                      <Label htmlFor="firstName" className="block font-semibold mb-2">
                        First Name
                      </Label>
                      <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="Enter first name" type="text" className="w-full" />
                    </div>

                    <div>
                      <Label htmlFor="email" className="block font-semibold mb-2">
                        Email Address
                      </Label>
                      <Input id="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Enter email" type="email" className="w-full" />
                    </div>

                    {/* If we want to be able to change the password, we need a route to update it */}
                    <div>
                      <Label className="block font-semibold mb-2">
                        Password
                      </Label>
                      <Input type="password" value="••••••••••" disabled className="w-full cursor-not-allowed" />
                    </div>
                  </div>

                  <div className="flex justify-end pt-6">
                    <Button onClick={handleSaveProfile} disabled={isSaving} className="gap-2" >
                      {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                      Save
                    </Button>
                  </div>
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
