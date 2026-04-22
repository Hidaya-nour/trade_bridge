import { Linking } from "react-native";
import type { SupportFormValues } from "@/utils/validation";

const SUPPORT_EMAIL = "support@tradebridge.com";
const SUPPORT_PHONE = "+251111234567";

const buildMailtoUrl = (payload: SupportFormValues, roleLabel: string) => {
  const subject = encodeURIComponent(`[${roleLabel}] ${payload.subject}`);
  const body = encodeURIComponent(
    [
      `Name: ${payload.name}`,
      `Email: ${payload.email}`,
      "",
      payload.message,
    ].join("\n"),
  );

  return `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
};

export const supportService = {
  email: SUPPORT_EMAIL,
  phone: SUPPORT_PHONE,

  async submit(payload: SupportFormValues, roleLabel: string) {
    const url = buildMailtoUrl(payload, roleLabel);
    const canOpen = await Linking.canOpenURL(url);

    if (!canOpen) {
      throw new Error("Email is not available on this device.");
    }

    await Linking.openURL(url);
  },

  async call() {
    const url = `tel:${SUPPORT_PHONE}`;
    const canOpen = await Linking.canOpenURL(url);

    if (!canOpen) {
      throw new Error("Phone calls are not available on this device.");
    }

    await Linking.openURL(url);
  },
};
