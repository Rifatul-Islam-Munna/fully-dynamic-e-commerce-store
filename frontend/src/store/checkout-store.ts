"use client";

import { create } from "zustand";
import type {
  CheckoutFormState,
  CheckoutPricingResponse,
  CheckoutOrderResponse,
  CheckoutPageUser,
} from "@/lib/checkout";

export type CheckoutFieldErrors = Partial<
  Record<keyof CheckoutFormState, string>
>;

type CheckoutState = {
  form: CheckoutFormState;
  fieldErrors: CheckoutFieldErrors;
  order: CheckoutOrderResponse | null;
  pricing: CheckoutPricingResponse | null;
  hydratedUserId: string | null;
  hydrateFromUser: (user: CheckoutPageUser | null) => void;
  setField: (field: keyof CheckoutFormState, value: string) => void;
  setFieldErrors: (errors: CheckoutFieldErrors) => void;
  clearFieldError: (field: keyof CheckoutFormState) => void;
  setOrder: (order: CheckoutOrderResponse | null) => void;
  setPricing: (pricing: CheckoutPricingResponse | null) => void;
  resetPricing: () => void;
  resetCheckout: () => void;
};

const emptyForm: CheckoutFormState = {
  email: "",
  phoneNumber: "",
  district: "",
  address: "",
  couponCode: "",
};

export const useCheckoutStore = create<CheckoutState>()((set) => ({
  form: emptyForm,
  fieldErrors: {},
  order: null,
  pricing: null,
  hydratedUserId: null,
  hydrateFromUser: (user) =>
    set((state) => {
      const userId = user?.id ?? "__guest__";

      if (state.hydratedUserId === userId) {
        return state;
      }

      return {
        hydratedUserId: userId,
        form: {
          email: state.form.email || user?.email || "",
          phoneNumber: state.form.phoneNumber || user?.phoneNumber || "",
          district: state.form.district,
          address: state.form.address,
          couponCode: state.form.couponCode,
        },
      };
    }),
  setField: (field, value) =>
    set((state) => ({
      form: {
        ...state.form,
        [field]: value,
      },
    })),
  setFieldErrors: (errors) => set({ fieldErrors: errors }),
  clearFieldError: (field) =>
    set((state) => ({
      fieldErrors: {
        ...state.fieldErrors,
        [field]: undefined,
      },
    })),
  setOrder: (order) => set({ order }),
  setPricing: (pricing) => set({ pricing }),
  resetPricing: () => set({ pricing: null }),
  resetCheckout: () =>
    set({
      form: emptyForm,
      fieldErrors: {},
      order: null,
      pricing: null,
      hydratedUserId: null,
    }),
}));
