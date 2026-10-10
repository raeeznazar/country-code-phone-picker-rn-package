# phone-code-picker

A simple, customizable phone number input for React Native, with an attached searchable country
code picker. Drop in one component, get a flag + dial-code trigger, a searchable bottom sheet of
countries, and a digits-only phone field wired together.

```tsx
<PhoneNumberInput defaultCountry="CM" onChange={(value) => console.log(value.e164)} />
```

## Features

- One component (`PhoneNumberInput`) combining the country picker and the number field — or use
  `CountryCodePicker` on its own (e.g. for a "preferred language/region" setting).
- Searchable bottom sheet (by country name, dial code, or ISO code) that actually scrolls — see
  [Why a custom bottom sheet setup?](#why-a-custom-bottom-sheet-setup) if you're curious why that's
  called out.
- Controlled or uncontrolled, for both the selected country and the typed number.
- Fully restyleable via a `style` prop (per-part style objects, not one flat theme) — or replace
  rendering entirely with `renderTrigger` / `renderCountryRow`.
- `preferredCountries`, `includeCountries`, `excludeCountries` to curate the list without replacing
  it, or pass your own `countries` array to replace it outright.
- Per-country `maxLength` and a pluggable `validator`/`formatter`, so you're not locked into one
  country's number format.
- Zero icon-library dependency — search/close/chevron/check are plain text glyphs, so it doesn't
  drag in an icon set your app doesn't already use.
- Ships a bundled list of ~190 countries (`DEFAULT_COUNTRIES`), typed, swappable.

## Installation

```sh
npm install phone-code-picker
```

This installs `@gorhom/bottom-sheet`, `react-native-gesture-handler`, `react-native-reanimated`, and
`react-native-safe-area-context` automatically as regular dependencies — you don't need to add them
to your own `package.json`. `react` and `react-native` themselves are peer dependencies (you already
have them).

**What npm *can't* do for you:** those four are native modules. Installing the JS package doesn't
run `pod install`, add Babel plugins, or wrap your app in the right providers — that's a one-time
setup step in every app that uses this package, package manager or not:

1. **iOS**: run `pod install` (or `npx pod-install`) after installing, so the native code for
   `react-native-reanimated` / `react-native-gesture-handler` is linked.
2. **Babel**: add Reanimated's plugin, last in the list, in `babel.config.js`:
   ```js
   module.exports = {
     presets: ['module:@react-native/babel-preset'], // or 'babel-preset-expo' on Expo
     plugins: ['react-native-reanimated/plugin'],
   };
   ```
3. **App root**: wrap your app in `SafeAreaProvider`, `GestureHandlerRootView`, and
   `BottomSheetModalProvider` once, above anything that renders `PhoneNumberInput` or
   `CountryCodePicker`. `CountryCodePicker` reads safe-area insets internally (to keep the sheet's
   header clear of the status bar/notch at its 90% snap point) via `useSafeAreaInsets()` — without a
   `SafeAreaProvider` ancestor, that throws `No safe area value available. Make sure you are
   rendering within a SafeAreaProvider`:
   ```tsx
   import { GestureHandlerRootView } from 'react-native-gesture-handler';
   import { SafeAreaProvider } from 'react-native-safe-area-context';
   import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

   export default function App() {
     return (
       <SafeAreaProvider>
         <GestureHandlerRootView style={{ flex: 1 }}>
           <BottomSheetModalProvider>
             {/* the rest of your app */}
           </BottomSheetModalProvider>
         </GestureHandlerRootView>
       </SafeAreaProvider>
     );
   }
   ```
   If your app already uses `react-navigation`, it already requires `SafeAreaProvider` at the root
   for its own screens — in that case you just need to add `GestureHandlerRootView` and
   `BottomSheetModalProvider` inside/around your existing `SafeAreaProvider`.

> **Using Expo?** Run `npx expo install react-native-gesture-handler react-native-reanimated
> react-native-safe-area-context` once instead of relying on the versions `npm install` picked, so
> they match your Expo SDK exactly — then follow steps 2 and 3 above as normal.

If you skip step 3, opening the picker will either throw or silently do nothing — see
[Troubleshooting](#troubleshooting).

## Quick start

```tsx
import { useState } from 'react';
import { PhoneNumberInput, type PhoneValue } from 'phone-code-picker';

function LoginForm() {
  const [phone, setPhone] = useState<PhoneValue>();

  return (
    <PhoneNumberInput
      defaultCountry="CM"
      placeholder="6 75 12 34 56"
      onChange={(value) => setPhone(value)}
    />
  );
}
```

`onChange` fires on every keystroke and every country change with:

```ts
interface PhoneValue {
  country: Country;        // the full selected Country object
  nationalNumber: string;  // digits only, e.g. "675123456"
  e164: string;             // dialCode + nationalNumber, e.g. "+237675123456"
  isValid: boolean;         // from your `validator`, or "non-empty" by default
}
```

If you only need the raw digits, `onChangeText` is simpler:

```tsx
<PhoneNumberInput onChangeText={(digits) => console.log(digits)} />
```

## Using just the picker

If you don't need the number field — e.g. a "default region" setting elsewhere in your app — use
`CountryCodePicker` on its own:

```tsx
import { CountryCodePicker, type Country } from 'phone-code-picker';

function RegionSetting() {
  return (
    <CountryCodePicker
      defaultCountry="CM"
      onSelect={(country: Country) => console.log(country.isoCode, country.dialCode)}
    />
  );
}
```

## Controlled vs. uncontrolled

Both the number and the country can be controlled or left uncontrolled, independently:

```tsx
// Uncontrolled (component manages its own state) — simplest option
<PhoneNumberInput defaultCountry="CM" defaultValue="675123456" onChange={setPhone} />

// Controlled — you own the state, e.g. to reset the field from elsewhere
const [digits, setDigits] = useState('');
const [isoCode, setIsoCode] = useState('CM');

<PhoneNumberInput
  value={digits}
  onChangeText={setDigits}
  country={isoCode}
  onChangeCountry={(country) => setIsoCode(country.isoCode)}
/>
```

## Styling

Pass a `style` object with one key per part — this mirrors the actual visual pieces (trigger box,
input box, sheet header, search bar, list rows), not one flat color palette:

```tsx
<PhoneNumberInput
  defaultCountry="CM"
  style={{
    container: { gap: 8 },
    trigger: { borderRadius: 17, borderWidth: 1.5, borderColor: '#E5E7EB', paddingHorizontal: 16 },
    triggerText: { fontSize: 17, fontWeight: '700' },
    inputContainer: { borderRadius: 17, borderWidth: 1.5, borderColor: '#E5E7EB', paddingHorizontal: 16 },
    inputText: { fontSize: 17 },
    inputContainerError: { borderColor: '#C81D31' },
    sheetBackgroundColor: '#FFFFFF',
    handleColor: '#D5DAE6',
    row: { paddingVertical: 14 },
    rowSelected: { backgroundColor: '#EEF2FF' },
    checkColor: '#2D46AE',
  }}
/>
```

Every style key is additive on top of the built-in defaults — you only need to set what you want to
change. See [Style reference](#style-reference) below for the full list of keys.

### Going further: `renderTrigger` / `renderCountryRow`

For changes style props can't express (custom icons instead of the flag emoji, an extra subtitle on
each row, etc.), replace the rendering entirely:

```tsx
<PhoneNumberInput
  defaultCountry="CM"
  renderTrigger={(country, open) => (
    <Pressable onPress={open} style={myTriggerStyle}>
      <Text>{country.flag} {country.dialCode}</Text>
    </Pressable>
  )}
  renderCountryRow={(country, isSelected, select) => (
    <Pressable onPress={select} style={[myRowStyle, isSelected && myRowSelectedStyle]}>
      <Text>{country.flag}  {country.name} ({country.dialCode})</Text>
    </Pressable>
  )}
/>
```

## Curating the country list

```tsx
// Pin a few to the top, rest stays alphabetical below them
<PhoneNumberInput preferredCountries={['CM', 'NG', 'GH']} />

// Only show a specific set (e.g. a regional product)
<PhoneNumberInput includeCountries={['CM', 'NG', 'GH', 'CI', 'SN']} />

// Hide specific ones
<PhoneNumberInput excludeCountries={['KP']} />

// Replace the list outright with your own
import type { Country } from 'phone-code-picker';

const myCountries: Country[] = [
  { isoCode: 'CM', name: 'Cameroon', dialCode: '+237', flag: '🇨🇲' },
  { isoCode: 'NG', name: 'Nigeria', dialCode: '+234', flag: '🇳🇬' },
];

<PhoneNumberInput countries={myCountries} />
```

## Validation and formatting

By default, `isValid` just means "the field isn't empty" — deliberately lenient, since real phone
validation varies per country. Plug in your own rule:

```tsx
// Simple: fixed length per country
<PhoneNumberInput
  maxLength={{ CM: 9, NG: 10, default: 10 }}
  validator={(digits, country) => {
    if (country.isoCode === 'CM') return /^6[2-9]\d{7}$/.test(digits);
    return digits.length === 10;
  }}
/>

// Thorough: hand off to libphonenumber-js
import { isValidPhoneNumber } from 'libphonenumber-js';

<PhoneNumberInput
  validator={(digits, country) => isValidPhoneNumber(digits, country.isoCode as any)}
/>
```

`formatter` reformats what's displayed in the field as the user types (the underlying
`nationalNumber`/`onChangeText` value stays digits-only either way):

```tsx
function maskCameroon(digits: string): string {
  const parts = [digits.slice(0, 1), digits.slice(1, 3), digits.slice(3, 5), digits.slice(5, 7), digits.slice(7, 9)];
  return parts.filter(Boolean).join(' ');
}

<PhoneNumberInput defaultCountry="CM" maxLength={9} formatter={(digits) => maskCameroon(digits)} />
```

## API reference

### `<PhoneNumberInput />` props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string` | — | Controlled national number (digits only). Omit for uncontrolled. |
| `defaultValue` | `string` | `''` | Initial number when uncontrolled. |
| `onChangeText` | `(digits: string) => void` | — | Fires with just the digits on every keystroke. |
| `onChange` | `(value: PhoneValue) => void` | — | Fires with the full `PhoneValue` on every change (number or country). |
| `country` | `string` | — | Controlled selected country (ISO code). Omit for uncontrolled. |
| `defaultCountry` | `string` | `'US'` | Initial selected country (ISO code) when uncontrolled. |
| `onChangeCountry` | `(country: Country) => void` | — | Fires when the user picks a different country. |
| `countries` | `Country[]` | `DEFAULT_COUNTRIES` | Replace the bundled list entirely. |
| `preferredCountries` | `string[]` | — | ISO codes pinned to the top of the list. |
| `includeCountries` | `string[]` | — | Allowlist of ISO codes to show. |
| `excludeCountries` | `string[]` | — | ISO codes to hide. |
| `maxLength` | `number \| Record<string, number> & { default?: number }` | `15` | Digit cap — flat, or per ISO code. |
| `validator` | `(digits: string, country: Country) => boolean` | "non-empty" | Decides `PhoneValue.isValid`. |
| `formatter` | `(digits: string, country: Country) => string` | — | Reformats the displayed value as the user types. |
| `placeholder` | `string` | `'Phone number'` | Input placeholder. |
| `keyboardType` | `KeyboardTypeOptions` | `'phone-pad'` | Passed to the underlying `TextInput`. |
| `autoFocus` | `boolean` | — | Focuses the number field on mount. |
| `disabled` | `boolean` | — | Disables both the trigger and the input. |
| `onSubmitEditing` | `() => void` | — | Fires on the keyboard's submit/done action. |
| `error` | `string` | — | Shown under the field; tints both boxes' borders. |
| `style` | `PhoneNumberInputStyle` | — | See [Style reference](#style-reference). |
| `title`, `searchPlaceholder`, `emptyText`, `closeAccessibilityLabel`, `snapPoints`, `renderTrigger`, `renderCountryRow` | — | — | Passed straight through to the internal `CountryCodePicker` — see its props below. |

### `<CountryCodePicker />` props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `countries` | `Country[]` | `DEFAULT_COUNTRIES` | Replace the bundled list entirely. |
| `country` | `string` | — | Controlled selected country (ISO code). |
| `defaultCountry` | `string` | `'US'` | Initial selection when uncontrolled. |
| `onSelect` | `(country: Country) => void` | — | **Required.** Fires with the full `Country` on selection. |
| `preferredCountries` | `string[]` | — | ISO codes pinned to the top. |
| `includeCountries` | `string[]` | — | Allowlist of ISO codes. |
| `excludeCountries` | `string[]` | — | ISO codes to hide. |
| `title` | `string` | `'Select country'` | Sheet header title. |
| `searchPlaceholder` | `string` | `'Search country or code'` | Search field placeholder. |
| `emptyText` | `string` | `'No countries found'` | Shown when search matches nothing. |
| `closeAccessibilityLabel` | `string` | `'Close'` | Accessibility label for the close button. |
| `snapPoints` | `Array<string \| number>` | `['50%', '90%']` | `@gorhom/bottom-sheet` snap points. |
| `style` | `CountryCodePickerStyle` | — | See [Style reference](#style-reference). |
| `renderTrigger` | `(country: Country, open: () => void) => ReactNode` | — | Replace the trigger button entirely. |
| `renderCountryRow` | `(country: Country, selected: boolean, select: () => void) => ReactNode` | — | Replace a list row entirely. |
| `disabled` | `boolean` | — | Disables the trigger. |

### `Country`

```ts
interface Country {
  isoCode: string;  // ISO 3166-1 alpha-2, e.g. "CM" — the stable identifier used everywhere
  name: string;      // "Cameroon"
  dialCode: string;  // "+237"
  flag: string;      // "🇨🇲"
}
```

### Style reference

All keys are optional; `PhoneNumberInputStyle` includes every `CountryCodePickerStyle` key too.

| Key | Applies to |
| --- | --- |
| `container` | The row wrapping the trigger + input (`PhoneNumberInput` only) |
| `trigger` / `triggerText` / `chevronColor` | The country trigger button |
| `inputContainer` / `inputContainerError` / `inputText` | The number field box (`PhoneNumberInput` only) |
| `errorText` | The error message under the field (`PhoneNumberInput` only) |
| `sheetBackgroundColor` / `handleColor` | The bottom sheet itself |
| `title` / `closeButton` / `closeIconColor` | The sheet header |
| `searchContainer` / `searchInput` / `searchIconColor` / `placeholderColor` | The search bar |
| `row` / `rowSelected` / `rowFlag` / `rowName` / `rowDialCode` / `checkColor` | Each country row |

### Exported helpers

```ts
import {
  DEFAULT_COUNTRIES,  // Country[] — the bundled list
  buildCountryList,   // applies includeCountries/excludeCountries/preferredCountries to a list
  findCountry,        // (countries, isoCode) => Country | undefined
  digitsOnly,         // (text) => string — strips everything but digits
  defaultValidator,   // the built-in "non-empty" validator
  buildPhoneValue,    // (country, digits, validator?) => PhoneValue
} from 'phone-code-picker';
```

## Why a custom bottom sheet setup?

`@gorhom/bottom-sheet` defaults `enableDynamicSizing` to `true`, which sizes the sheet off its
*initially rendered* content. For a searchable list that's only the first virtualized screenful
(~9–10 rows) — so without overriding it, the sheet looks "stuck" after a handful of countries, with
dead space below and no further scrolling. This package renders its sheet with fixed `snapPoints`
and `enableDynamicSizing={false}` so the list gets a real, bounded, scrollable viewport. You likely
don't need to think about this — it's handled internally — but it's worth knowing if you ever pass a
custom `snapPoints` and the list stops scrolling: `enableDynamicSizing` is not currently exposed as a
prop, intentionally, since turning it back on reintroduces this bug.

## Troubleshooting

**`No safe area value available. Make sure you are rendering within a SafeAreaProvider.`** Your app
root is missing `SafeAreaProvider` from `react-native-safe-area-context` — `CountryCodePicker` reads
safe-area insets internally. See step 3 in [Installation](#installation).

**Nothing happens when I tap the trigger / an error about a missing provider.** You're missing
`BottomSheetModalProvider` (and/or `GestureHandlerRootView`) at your app's root — see step 3 in
[Installation](#installation).

**The list only shows a few countries and won't scroll further.** You're on an app that already had
`@gorhom/bottom-sheet` installed at an incompatible version, or something upstream is overriding
`enableDynamicSizing`. Confirm `@gorhom/bottom-sheet` is on `^5.0.0`.

**Metro can't resolve `react-native-reanimated` / `react-native-gesture-handler`.** Those weren't
linked — re-run `pod install` on iOS, and rebuild (not just reload) on Android after installing.

**Flags render as boxes/letters on some Android devices.** That's an OS-level emoji font limitation,
not specific to this package — use `renderTrigger`/`renderCountryRow` to swap in flag images if you
need guaranteed rendering across all Android versions.

## License

MIT
