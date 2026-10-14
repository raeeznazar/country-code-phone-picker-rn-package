# Changelog

All notable changes to this package are documented here. Format based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); this project follows
[Semantic Versioning](https://semver.org/) — patch for fixes, minor for backward-compatible
additions (e.g. a new prop), major for anything that changes existing behavior or raises a peer
dependency's minimum version.

## [Unreleased]

## [0.2.1] - 2026-10-14

### Fixed

- `onChange` never fired for the initial/default country selection — only on an explicit picker
  selection or a text change — so a consumer reading the dial code off `onChange` (instead of
  duplicating the `defaultCountry` prop itself) saw nothing until the user interacted with the
  input. Now fires once on mount with the initial country and number.
- README's install steps were missing `SafeAreaProvider` — `CountryCodePicker` calls
  `useSafeAreaInsets()` internally and throws without one. Documented it as a required root-level
  provider alongside `GestureHandlerRootView`/`BottomSheetModalProvider`, and added the exact error
  message to Troubleshooting.

## [0.2.0] - 2026-10-12

### Changed

- **Breaking:** `@gorhom/bottom-sheet`, `react-native-gesture-handler`, `react-native-reanimated`,
  and `react-native-safe-area-context` moved from `dependencies` to `peerDependencies`. Pinning our
  own copies as regular dependencies risked a second, conflicting native-module install in any app
  that also depends on them directly — which is effectively every Expo app, and became a real problem
  once Expo SDK 54 started bundling Reanimated 4 (a major version this package's old `^3.10.0`
  dependency range couldn't satisfy) by default. Consumers now install these four themselves — see
  [Installation](#installation) in the README.
- Peer ranges left unbounded on the upper end (e.g. `react-native-reanimated": ">=3.10.0"`) rather
  than capped to a major, since this package only touches stable, long-unchanged
  `@gorhom/bottom-sheet`/`react-native-safe-area-context` APIs and works unmodified across Reanimated
  3 and 4, and Gesture Handler 2 and 3.

## [0.1.0] - 2026-10-10

### Added

- Initial release: `PhoneNumberInput` and `CountryCodePicker` components, bundled
  `DEFAULT_COUNTRIES` list (~190 countries), `buildCountryList`/`findCountry`/`digitsOnly`/
  `defaultValidator`/`buildPhoneValue` helpers.
