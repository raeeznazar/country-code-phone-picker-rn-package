import type { KeyboardTypeOptions, StyleProp, TextStyle, ViewStyle } from 'react-native';

/** One entry in the country list — the data behind a row in the picker and the selected trigger. */
export interface Country {
  /** ISO 3166-1 alpha-2 code, e.g. "CM". Used as the stable identifier everywhere in this package. */
  isoCode: string;
  /** English display name, e.g. "Cameroon". */
  name: string;
  /** E.164 calling code, including the "+", e.g. "+237". */
  dialCode: string;
  /** Flag emoji, e.g. "🇨🇲". */
  flag: string;
}

/** What `PhoneNumberInput`'s `onChange` hands back on every keystroke / country change. */
export interface PhoneValue {
  country: Country;
  /** Digits only, as typed (no spaces, no dial code). */
  nationalNumber: string;
  /** `dialCode + nationalNumber`, e.g. "+237675123456". */
  e164: string;
  isValid: boolean;
}

/** Style hooks for `CountryCodePicker` (also inherited by `PhoneNumberInput`). */
export interface CountryCodePickerStyle {
  trigger?: StyleProp<ViewStyle>;
  triggerText?: StyleProp<TextStyle>;
  chevronColor?: string;
  sheetBackgroundColor?: string;
  handleColor?: string;
  title?: StyleProp<TextStyle>;
  closeButton?: StyleProp<ViewStyle>;
  closeIconColor?: string;
  searchContainer?: StyleProp<ViewStyle>;
  searchInput?: StyleProp<TextStyle>;
  searchIconColor?: string;
  placeholderColor?: string;
  row?: StyleProp<ViewStyle>;
  rowSelected?: StyleProp<ViewStyle>;
  rowFlag?: StyleProp<TextStyle>;
  rowName?: StyleProp<TextStyle>;
  rowDialCode?: StyleProp<TextStyle>;
  checkColor?: string;
}

/** Additional style hooks `PhoneNumberInput` layers on top of `CountryCodePickerStyle`. */
export interface PhoneNumberInputStyle extends CountryCodePickerStyle {
  container?: StyleProp<ViewStyle>;
  inputContainer?: StyleProp<ViewStyle>;
  inputContainerError?: StyleProp<ViewStyle>;
  inputText?: StyleProp<TextStyle>;
  errorText?: StyleProp<TextStyle>;
  gap?: number;
}

export interface CountryCodePickerProps {
  /** Full country list to show. Defaults to the bundled list (`DEFAULT_COUNTRIES`). */
  countries?: Country[];
  /** Controlled selected country (ISO code). Omit to let the picker manage its own state. */
  country?: string;
  /** Initial selection when uncontrolled. Defaults to `"US"`. */
  defaultCountry?: string;
  /** Fires with the full `Country` object whenever the user picks one. Required. */
  onSelect: (country: Country) => void;
  /** ISO codes pinned to the top of the list, above the alphabetical rest. */
  preferredCountries?: string[];
  /** If set, only these ISO codes are shown (an allowlist). */
  includeCountries?: string[];
  /** ISO codes to hide from the list. */
  excludeCountries?: string[];
  /** Sheet title. Defaults to `"Select country"`. */
  title?: string;
  searchPlaceholder?: string;
  /** Shown when a search matches nothing. Defaults to `"No countries found"`. */
  emptyText?: string;
  closeAccessibilityLabel?: string;
  /** `@gorhom/bottom-sheet` snap points. Defaults to `['50%', '90%']`. */
  snapPoints?: Array<string | number>;
  style?: CountryCodePickerStyle;
  /** Replace the trigger button entirely. Receives the selected country and an `open` callback. */
  renderTrigger?: (country: Country, open: () => void) => React.ReactNode;
  /** Replace a list row entirely. Receives the row's country, whether it's selected, and a `select` callback. */
  renderCountryRow?: (country: Country, selected: boolean, select: () => void) => React.ReactNode;
  disabled?: boolean;
}

export interface PhoneNumberInputProps
  extends Omit<CountryCodePickerProps, 'onSelect' | 'style' | 'defaultCountry' | 'country'> {
  /** Controlled national number, digits only. Omit to let the component manage its own state. */
  value?: string;
  /** Initial national number when uncontrolled. */
  defaultValue?: string;
  /** Fires with just the digits on every keystroke. */
  onChangeText?: (nationalNumber: string) => void;
  /** Fires with the full `PhoneValue` (country + number + e164 + validity) on every change. */
  onChange?: (value: PhoneValue) => void;
  /** Controlled selected country (ISO code). */
  country?: string;
  /** Initial selected country (ISO code) when uncontrolled. Defaults to `"US"`. */
  defaultCountry?: string;
  onChangeCountry?: (country: Country) => void;
  /**
   * Caps how many digits can be typed. A flat number applies to every country; a map keyed by
   * ISO code lets you vary it per country, with `default` as the fallback. Defaults to 15
   * (the longest a national number can be under E.164).
   */
  maxLength?: number | (Partial<Record<string, number>> & { default?: number });
  /**
   * Decides `isValid` on the returned `PhoneValue`. Defaults to "non-empty" — plug in your own
   * (or a library like `libphonenumber-js`) for real per-country validation.
   */
  validator?: (nationalNumber: string, country: Country) => boolean;
  /** Reformats the digits for display as the user types (e.g. grouping with spaces). */
  formatter?: (nationalNumber: string, country: Country) => string;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  autoFocus?: boolean;
  disabled?: boolean;
  onSubmitEditing?: () => void;
  /** Shown under the field, and tints both boxes' borders. */
  error?: string;
  style?: PhoneNumberInputStyle;
}
