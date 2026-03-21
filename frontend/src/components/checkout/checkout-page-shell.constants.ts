import type { CheckoutFormState } from "@/lib/checkout";
import type { CheckoutFieldErrors } from "@/store/checkout-store";

export function validateCheckoutForm(form: CheckoutFormState) {
  const errors: CheckoutFieldErrors = {};
  const trimmedEmail = form.email.trim();

  if (trimmedEmail && !/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
    errors.email = "Use a valid email address or leave it empty.";
  }

  if (!form.phoneNumber.trim()) {
    errors.phoneNumber = "Phone number is required.";
  }

  if (!form.district.trim()) {
    errors.district = "District is required.";
  }

  if (!form.address.trim()) {
    errors.address = "Address is required.";
  }

  return errors;
}

export const FLAT_FIELD_STYLE = { boxShadow: "none" } as const;
export const SECTION_CLASS_NAME =
  "rounded-sm bg-surface-container-lowest p-5 sm:p-6 ";
export const FIELD_SHELL_CLASS_NAME =
  "rounded-sm bg-surface-container-low px-4 py-3 transition-colors focus-within:bg-surface-container/60";
export const INPUT_CLASS_NAME =
  "mt-1 h-auto border-0 bg-transparent px-0 py-0 font-body text-[15px] font-medium text-on-surface placeholder:text-on-surface-variant/50 focus-visible:ring-0";
export const TEXTAREA_CLASS_NAME =
  "mt-1 min-h-28 border-0 bg-transparent px-0 py-0 font-body text-[15px] font-medium text-on-surface placeholder:text-on-surface-variant/50 focus-visible:ring-0";
