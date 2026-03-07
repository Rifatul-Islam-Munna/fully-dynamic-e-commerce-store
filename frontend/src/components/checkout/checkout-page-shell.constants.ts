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
  "rounded-[28px] border border-border bg-card p-4 sm:p-5";
export const FIELD_SHELL_CLASS_NAME =
  "rounded-[22px] border border-border bg-muted/20 px-4 py-3 transition-colors focus-within:border-primary/35 focus-within:bg-background";
export const INPUT_CLASS_NAME =
  "mt-1 h-auto border-0 bg-transparent px-0 py-0 text-[15px] font-medium text-foreground placeholder:text-muted-foreground/65 focus-visible:ring-0";
export const TEXTAREA_CLASS_NAME =
  "mt-1 min-h-28 border-0 bg-transparent px-0 py-0 text-[15px] font-medium text-foreground placeholder:text-muted-foreground/65 focus-visible:ring-0";
