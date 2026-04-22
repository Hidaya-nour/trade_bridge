export interface ProfileFormValues {
  full_name: string;
  phone: string;
  business_name: string;
  tin_number: string;
}

export interface SupportFormValues {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateProfileForm = (values: ProfileFormValues) => {
  const errors: Partial<Record<keyof ProfileFormValues, string>> = {};

  if (!values.full_name.trim()) {
    errors.full_name = "Full name is required.";
  }

  if (values.phone && values.phone.trim().length < 7) {
    errors.phone = "Use a valid phone number.";
  }

  if (values.tin_number && values.tin_number.trim().length < 5) {
    errors.tin_number = "TIN number looks too short.";
  }

  return errors;
};

export const validateSupportForm = (values: SupportFormValues) => {
  const errors: Partial<Record<keyof SupportFormValues, string>> = {};

  if (!values.name.trim()) {
    errors.name = "Name is required.";
  }

  if (!values.email.trim()) {
    errors.email = "Email is required.";
  } else if (!emailPattern.test(values.email.trim())) {
    errors.email = "Use a valid email address.";
  }

  if (!values.subject.trim()) {
    errors.subject = "Subject is required.";
  }

  if (!values.message.trim()) {
    errors.message = "Message is required.";
  } else if (values.message.trim().length < 10) {
    errors.message = "Add a bit more detail so support can help quickly.";
  }

  return errors;
};
