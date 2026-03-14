import React, { useRef } from "react";
import { Camera, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { TabsContent } from "@/components/ui/tabs";

type ProfileForm = {
  full_name: string;
  email: string;
  phone: string;
  altPhone: string;
  business_name: string;
  businessType: string;
  tin_number: string;
  vatRegistered: boolean;
  bio: string;
  avatar: string;
};

type ProfileTabProps = {
  isEditing: boolean;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  profileForm: ProfileForm;
  setProfileForm: React.Dispatch<React.SetStateAction<ProfileForm>>;
  saveMessage: string | null;
  handleProfileSave: () => Promise<void> | void;
  isLoading: boolean;
  onAvatarUpload: (file: File) => Promise<void> | void;
  avatarUploading: boolean;
};

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const ProfileTab: React.FC<ProfileTabProps> = ({
  isEditing,
  setIsEditing,
  profileForm,
  setProfileForm,
  saveMessage,
  handleProfileSave,
  isLoading,
  onAvatarUpload,
  avatarUploading,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <TabsContent value="profile" className="mt-0">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and how others see you on
                TradeBridge
              </CardDescription>
            </div>
            <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? "Cancel" : "Edit Profile"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              {profileForm.avatar && (
                <AvatarImage src={profileForm.avatar} alt={profileForm.full_name} />
              )}
              <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                {getInitials(profileForm.full_name || "User")}
              </AvatarFallback>
            </Avatar>
            {isEditing && (
              <div className="space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) {
                      void onAvatarUpload(file);
                      event.target.value = "";
                    }
                  }}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={avatarUploading}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  {avatarUploading ? "Uploading..." : "Upload Photo"}
                </Button>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG or WEBP. Max 10MB.
                </p>
              </div>
            )}
          </div>

          <Separator />

          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={profileForm.full_name}
                onChange={(e) =>
                  setProfileForm((prev) => ({
                    ...prev,
                    full_name: e.target.value,
                  }))
                }
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={profileForm.email}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Primary Phone</Label>
              <Input
                id="phone"
                value={profileForm.phone}
                onChange={(e) =>
                  setProfileForm((prev) => ({
                    ...prev,
                    phone: e.target.value,
                  }))
                }
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="altPhone">Alternate Phone</Label>
              <Input
                id="altPhone"
                value={profileForm.altPhone}
                onChange={(e) =>
                  setProfileForm((prev) => ({
                    ...prev,
                    altPhone: e.target.value,
                  }))
                }
                disabled={!isEditing}
              />
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={profileForm.bio}
              onChange={(e) =>
                setProfileForm((prev) => ({
                  ...prev,
                  bio: e.target.value,
                }))
              }
              disabled={!isEditing}
              rows={4}
            />
          </div>
          {saveMessage && (
            <p className="text-sm text-muted-foreground">{saveMessage}</p>
          )}
        </CardContent>
        {isEditing && (
          <CardFooter className="flex justify-end gap-2 border-t pt-6">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => void handleProfileSave()}
              disabled={isLoading}
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        )}
      </Card>
    </TabsContent>
  );
};

export default ProfileTab;
