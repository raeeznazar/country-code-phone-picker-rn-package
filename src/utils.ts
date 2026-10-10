import type { Country, PhoneValue } from './types';

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, '');
}

/** The longest a national significant number can be under E.164. Used as the default typing cap. */
export const DEFAULT_MAX_LENGTH = 15;

export function resolveMaxLength(
  maxLength: number | (Partial<Record<string, number>> & { default?: number }) | undefined,
  country: Country,
): number {
  if (maxLength === undefined) return DEFAULT_MAX_LENGTH;
  if (typeof maxLength === 'number') return maxLength;
  return maxLength[country.isoCode] ?? maxLength.default ?? DEFAULT_MAX_LENGTH;
}

/** Default `isValid`: just "has the user typed something". Pass your own `validator` for real rules. */
export function defaultValidator(nationalNumber: string): boolean {
  return nationalNumber.length > 0;
}

export function buildPhoneValue(
  country: Country,
  nationalNumber: string,
  validator: (nationalNumber: string, country: Country) => boolean = defaultValidator,
): PhoneValue {
  return {
    country,
    nationalNumber,
    e164: `${country.dialCode}${nationalNumber}`,
    isValid: validator(nationalNumber, country),
  };
}
