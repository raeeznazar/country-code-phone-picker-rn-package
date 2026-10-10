# Changelog

All notable changes to this package are documented here. Format based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); this project follows
[Semantic Versioning](https://semver.org/) — patch for fixes, minor for backward-compatible
additions (e.g. a new prop), major for anything that changes existing behavior or raises a peer
dependency's minimum version.

## [Unreleased]

### Fixed

- README's install steps were missing `SafeAreaProvider` — `CountryCodePicker` calls
  `useSafeAreaInsets()` internally and throws without one. Documented it as a required root-level
  provider alongside `GestureHandlerRootView`/`BottomSheetModalProvider`, and added the exact error
  message to Troubleshooting.

## [0.1.0] - 2026-10-10

### Added

- Initial release: `PhoneNumberInput` and `CountryCodePicker` components, bundled
  `DEFAULT_COUNTRIES` list (~190 countries), `buildCountryList`/`findCountry`/`digitsOnly`/
  `defaultValidator`/`buildPhoneValue` helpers.
