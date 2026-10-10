import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { CountryCodePicker } from './CountryCodePicker';
import { buildCountryList, DEFAULT_COUNTRIES, findCountry } from './countries';
import type { Country, PhoneNumberInputProps } from './types';
import { buildPhoneValue, defaultValidator, digitsOnly, resolveMaxLength } from './utils';

/**
 * A phone number field with an attached, searchable country code picker — the trigger and the
 * input render as two separate rounded boxes side by side.
 *
 * Validation/length are per-country aware but deliberately simple by default (see `maxLength` and
 * `validator` in the README) — for real-world validation, pass a `validator` built on a library
 * like `libphonenumber-js`.
 */
export function PhoneNumberInput({
  value,
  defaultValue = '',
  onChangeText,
  onChange,
  country,
  defaultCountry = 'US',
  onChangeCountry,
  countries = DEFAULT_COUNTRIES,
  preferredCountries,
  includeCountries,
  excludeCountries,
  maxLength,
  validator = defaultValidator,
  formatter,
  placeholder = 'Phone number',
  keyboardType = 'phone-pad',
  autoFocus,
  disabled,
  onSubmitEditing,
  error,
  style,
  title,
  searchPlaceholder,
  emptyText,
  closeAccessibilityLabel,
  snapPoints,
  renderTrigger,
  renderCountryRow,
}: PhoneNumberInputProps): React.JSX.Element {
  const list = useMemo(
    () => buildCountryList({ countries, preferredCountries, includeCountries, excludeCountries }),
    [countries, preferredCountries, includeCountries, excludeCountries],
  );

  const isCountryControlled = country !== undefined;
  const [internalCountry, setInternalCountry] = useState<Country>(
    () => findCountry(list, country ?? defaultCountry) ?? list[0] ?? DEFAULT_COUNTRIES[0]!,
  );
  const selectedCountry = isCountryControlled ? (findCountry(list, country) ?? internalCountry) : internalCountry;

  const isNumberControlled = value !== undefined;
  const [internalNumber, setInternalNumber] = useState(defaultValue);
  const number = isNumberControlled ? value : internalNumber;

  const resolvedMaxLength = resolveMaxLength(maxLength, selectedCountry);
  const displayValue = formatter ? formatter(number, selectedCountry) : number;

  const emitChange = useCallback(
    (nextCountry: Country, nextNumber: string) => {
      onChange?.(buildPhoneValue(nextCountry, nextNumber, validator));
    },
    [onChange, validator],
  );

  const handleCountrySelect = useCallback(
    (nextCountry: Country) => {
      if (!isCountryControlled) setInternalCountry(nextCountry);
      onChangeCountry?.(nextCountry);
      emitChange(nextCountry, number);
    },
    [emitChange, isCountryControlled, number, onChangeCountry],
  );

  const handleChangeText = useCallback(
    (text: string) => {
      const digits = digitsOnly(text).slice(0, resolvedMaxLength);
      if (!isNumberControlled) setInternalNumber(digits);
      onChangeText?.(digits);
      emitChange(selectedCountry, digits);
    },
    [emitChange, isNumberControlled, onChangeText, resolvedMaxLength, selectedCountry],
  );

  return (
    <View>
      <View style={[styles.container, style?.container]}>
        <CountryCodePicker
          countries={list}
          country={selectedCountry.isoCode}
          onSelect={handleCountrySelect}
          preferredCountries={preferredCountries}
          includeCountries={includeCountries}
          excludeCountries={excludeCountries}
          title={title}
          searchPlaceholder={searchPlaceholder}
          emptyText={emptyText}
          closeAccessibilityLabel={closeAccessibilityLabel}
          snapPoints={snapPoints}
          disabled={disabled}
          renderTrigger={renderTrigger}
          renderCountryRow={renderCountryRow}
          style={{
            ...style,
            trigger: [styles.trigger, Boolean(error) && styles.borderError, style?.trigger],
          }}
        />

        <View
          style={[
            styles.inputContainer,
            style?.inputContainer,
            Boolean(error) && (style?.inputContainerError ?? styles.borderError),
          ]}
        >
          <TextInput
            value={displayValue}
            onChangeText={handleChangeText}
            placeholder={placeholder}
            placeholderTextColor="#9CA3AF"
            keyboardType={keyboardType}
            textContentType="telephoneNumber"
            autoFocus={autoFocus}
            editable={!disabled}
            returnKeyType="done"
            onSubmitEditing={onSubmitEditing}
            style={[styles.inputText, style?.inputText]}
          />
        </View>
      </View>
      {error ? <Text style={[styles.errorText, style?.errorText]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  trigger: {
    height: 52,
  },
  inputContainer: {
    flex: 1,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
  },
  borderError: {
    borderColor: '#DC2626',
  },
  inputText: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  errorText: {
    marginTop: 4,
    fontSize: 12,
    color: '#DC2626',
  },
});
