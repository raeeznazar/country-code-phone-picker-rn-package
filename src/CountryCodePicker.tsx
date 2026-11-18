import {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetModal,
  BottomSheetTextInput,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { useCallback, useMemo, useRef, useState, type ComponentRef } from 'react';
import { Pressable, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { buildCountryList, DEFAULT_COUNTRIES, findCountry } from './countries';
import type { Country, CountryCodePickerProps } from './types';

const DEFAULT_SNAP_POINTS = ['50%', '90%'];

/** Default colors for light/dark appearance — only used where `style` doesn't override them. */
const LIGHT_COLORS = {
  triggerBg: '#FFFFFF',
  triggerBorder: '#E5E7EB',
  triggerText: '#111827',
  chevron: '#6B7280',
  sheetBg: '#FFFFFF',
  handle: '#D5DAE6',
  title: '#111827',
  closeBg: '#F3F4F6',
  closeIcon: '#6B7280',
  searchBg: '#F3F4F6',
  searchIcon: '#9CA3AF',
  placeholder: '#9CA3AF',
  searchText: '#111827',
  rowName: '#111827',
  rowDialCode: '#6B7280',
  rowSelectedBg: '#EEF2FF',
  check: '#4F46E5',
  emptyText: '#6B7280',
} as const;

const DARK_COLORS = {
  triggerBg: '#1C212B',
  triggerBorder: '#333A49',
  triggerText: '#F3F4F6',
  chevron: '#9CA3AF',
  sheetBg: '#13161F',
  handle: '#3A4150',
  title: '#F3F4F6',
  closeBg: '#262B38',
  closeIcon: '#9CA3AF',
  searchBg: '#262B38',
  searchIcon: '#9CA3AF',
  placeholder: '#6B7280',
  searchText: '#F3F4F6',
  rowName: '#F3F4F6',
  rowDialCode: '#9CA3AF',
  rowSelectedBg: '#262B52',
  check: '#818CF8',
  emptyText: '#9CA3AF',
} as const;

/**
 * A trigger button (flag + dial code) that opens a searchable bottom sheet of countries.
 *
 * Renders its own `BottomSheetModal` with `enableDynamicSizing={false}` and fixed `snapPoints`
 * rather than relying on the library's default dynamic sizing — dynamic sizing measures a sheet's
 * height off its *initially rendered* content, which for a long `BottomSheetFlatList` is only the
 * first virtualized screenful. Without this, the list looks "stuck" after a handful of rows.
 *
 * Needs `BottomSheetModalProvider` (from `@gorhom/bottom-sheet`) somewhere above it in the tree —
 * see the package README for setup.
 */
export function CountryCodePicker({
  countries = DEFAULT_COUNTRIES,
  country,
  defaultCountry = 'US',
  onSelect,
  preferredCountries,
  includeCountries,
  excludeCountries,
  title = 'Select country',
  searchPlaceholder = 'Search country or code',
  emptyText = 'No countries found',
  closeAccessibilityLabel = 'Close',
  snapPoints = DEFAULT_SNAP_POINTS,
  style,
  renderTrigger,
  renderCountryRow,
  disabled,
}: CountryCodePickerProps): React.JSX.Element {
  const { top } = useSafeAreaInsets();
  const sheetRef = useRef<ComponentRef<typeof BottomSheetModal>>(null);
  const [search, setSearch] = useState('');
  const colors = useColorScheme() === 'dark' ? DARK_COLORS : LIGHT_COLORS;

  const list = useMemo(
    () => buildCountryList({ countries, preferredCountries, includeCountries, excludeCountries }),
    [countries, preferredCountries, includeCountries, excludeCountries],
  );

  const isControlled = country !== undefined;
  const [internalCountry, setInternalCountry] = useState<Country>(
    () => findCountry(list, country ?? defaultCountry) ?? list[0] ?? DEFAULT_COUNTRIES[0]!,
  );
  const selected = isControlled ? (findCountry(list, country) ?? internalCountry) : internalCountry;

  const filtered = useMemo(() => {
    if (!search.trim()) return list;
    const query = search.trim().toLowerCase();
    return list.filter(
      (item) => item.name.toLowerCase().includes(query) || item.dialCode.includes(query) || item.isoCode.toLowerCase() === query,
    );
  }, [list, search]);

  const openSheet = useCallback(() => {
    setSearch('');
    sheetRef.current?.present();
  }, []);

  const handleSelect = useCallback(
    (item: Country) => {
      if (!isControlled) setInternalCountry(item);
      onSelect(item);
      sheetRef.current?.dismiss();
    },
    [isControlled, onSelect],
  );

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} pressBehavior="close" />
    ),
    [],
  );

  const renderItem = useCallback(
    ({ item }: { item: Country }) => {
      const isActive = item.isoCode === selected.isoCode;
      if (renderCountryRow) return <>{renderCountryRow(item, isActive, () => handleSelect(item))}</>;
      return (
        <Pressable
          accessibilityRole="button"
          onPress={() => handleSelect(item)}
          style={[
            styles.row,
            isActive && { backgroundColor: colors.rowSelectedBg, marginHorizontal: -18, paddingHorizontal: 18, borderRadius: 10 },
            style?.row,
            isActive && style?.rowSelected,
          ]}
        >
          <Text style={[styles.flag, style?.rowFlag]}>{item.flag}</Text>
          <Text style={[styles.rowName, { color: colors.rowName }, style?.rowName]}>{item.name}</Text>
          <Text style={[styles.rowDialCode, { color: colors.rowDialCode }, style?.rowDialCode]}>{item.dialCode}</Text>
          {isActive ? <Text style={[styles.check, { color: style?.checkColor ?? colors.check }]}>✓</Text> : null}
        </Pressable>
      );
    },
    [colors, handleSelect, renderCountryRow, selected.isoCode, style],
  );

  return (
    <>
      {renderTrigger ? (
        renderTrigger(selected, openSheet)
      ) : (
        <Pressable
          accessibilityRole="button"
          disabled={disabled}
          onPress={openSheet}
          style={[styles.trigger, { backgroundColor: colors.triggerBg, borderColor: colors.triggerBorder }, style?.trigger]}
        >
          <Text style={[styles.triggerText, { color: colors.triggerText }, style?.triggerText]}>
            {selected.flag} {selected.dialCode}
          </Text>
          <Text style={[styles.chevron, { color: style?.chevronColor ?? colors.chevron }]}>▾</Text>
        </Pressable>
      )}

      <BottomSheetModal
        ref={sheetRef}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        enablePanDownToClose
        topInset={top + 10}
        keyboardBehavior="extend"
        keyboardBlurBehavior="restore"
        backdropComponent={renderBackdrop}
        backgroundStyle={[
          styles.sheetBackground,
          { backgroundColor: colors.sheetBg },
          style?.sheetBackgroundColor ? { backgroundColor: style.sheetBackgroundColor } : null,
        ]}
        handleIndicatorStyle={[
          styles.handleIndicator,
          { backgroundColor: colors.handle },
          style?.handleColor ? { backgroundColor: style.handleColor } : null,
        ]}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.title }, style?.title]}>{title}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={closeAccessibilityLabel}
            hitSlop={8}
            onPress={() => sheetRef.current?.dismiss()}
            style={[styles.closeButton, { backgroundColor: colors.closeBg }, style?.closeButton]}
          >
            <Text style={{ color: style?.closeIconColor ?? colors.closeIcon, fontSize: 16 }}>✕</Text>
          </Pressable>
        </View>

        <View style={[styles.searchContainer, { backgroundColor: colors.searchBg }, style?.searchContainer]}>
          <Text style={{ color: style?.searchIconColor ?? colors.searchIcon }}>🔍</Text>
          <BottomSheetTextInput
            value={search}
            onChangeText={setSearch}
            placeholder={searchPlaceholder}
            placeholderTextColor={style?.placeholderColor ?? colors.placeholder}
            style={[styles.searchInput, { color: colors.searchText }, style?.searchInput]}
          />
        </View>

        <BottomSheetFlatList
          data={filtered}
          keyExtractor={(item: Country) => item.isoCode}
          renderItem={renderItem}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={[styles.emptyText, { color: colors.emptyText }]}>{emptyText}</Text>
            </View>
          }
        />
      </BottomSheetModal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 14,
  },
  triggerText: {
    fontSize: 16,
    fontWeight: '700',
  },
  chevron: {
    fontSize: 14,
    marginLeft: 2,
  },
  sheetBackground: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handleIndicator: {
    width: 40,
    height: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeButton: {
    height: 32,
    width: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    marginHorizontal: 18,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: 18,
    paddingBottom: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  flag: {
    fontSize: 20,
  },
  rowName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  rowDialCode: {
    fontSize: 14,
  },
  check: {
    fontSize: 16,
    marginLeft: 4,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 48,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
