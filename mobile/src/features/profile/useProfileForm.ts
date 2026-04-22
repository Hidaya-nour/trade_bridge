import { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/features/auth/auth.store";
import type { UserRole } from "@/features/auth/auth.types";
import { roleConfig } from "@/config/roleConfig";
import { validateProfileForm } from "@/utils/validation";

export interface ProfileFormState {
  full_name: string;
  email: string;
  phone: string;
  business_name: string;
  tin_number: string;
}

const getFormFromUser = (user: ReturnType<typeof useAuthStore.getState>["user"]): ProfileFormState => ({
  full_name: user?.full_name ?? "",
  email: user?.email ?? "",
  phone: user?.phone ?? "",
  business_name: user?.business_name ?? "",
  tin_number: user?.tin_number ?? "",
});

export const useProfileForm = (role: UserRole) => {
  const user = useAuthStore((state) => state.user);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [form, setForm] = useState<ProfileFormState>(() => getFormFromUser(user));
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileFormState, string>>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setForm(getFormFromUser(user));
  }, [user]);

  const visibleFields = useMemo(() => roleConfig[role].profileFields, [role]);

  const save = async () => {
    const nextErrors = validateProfileForm(form);
    setErrors(nextErrors);
    setSuccessMessage(null);

    if (Object.keys(nextErrors).length) {
      return false;
    }

    await updateProfile({
      full_name: form.full_name.trim(),
      phone: form.phone.trim() || undefined,
      business_name: visibleFields.includes("business_name")
        ? form.business_name.trim() || undefined
        : undefined,
      tin_number: visibleFields.includes("tin_number")
        ? form.tin_number.trim() || undefined
        : undefined,
    });

    setSuccessMessage("Profile saved successfully.");
    setIsEditing(false);
    return true;
  };

  return {
    form,
    setForm,
    errors,
    isEditing,
    isLoading,
    successMessage,
    setIsEditing,
    save,
    user,
    visibleFields,
  };
};
