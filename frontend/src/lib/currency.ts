const FALLBACK_CURRENCY_CODE = "BDT";
const FALLBACK_LOCALE = "en-BD";

const envCurrencyCode = process.env.NEXT_PUBLIC_CURRENCY_CODE?.trim();
const envCurrencyLocale = process.env.NEXT_PUBLIC_CURRENCY_LOCALE?.trim();
const envCurrencySymbol = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL?.trim();

export const CURRENCY_CODE = envCurrencyCode || FALLBACK_CURRENCY_CODE;
export const CURRENCY_LOCALE = envCurrencyLocale || FALLBACK_LOCALE;
export const CURRENCY_SYMBOL = envCurrencySymbol || null;

export function formatCurrency(value: number) {
  const amount = Number.isFinite(value) ? value : 0;

  if (CURRENCY_SYMBOL) {
    const number = new Intl.NumberFormat(CURRENCY_LOCALE, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);

    return `${CURRENCY_SYMBOL}${number}`;
  }

  return new Intl.NumberFormat(CURRENCY_LOCALE, {
    style: "currency",
    currency: CURRENCY_CODE,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}
