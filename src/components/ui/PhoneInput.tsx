// PhoneInput — champ téléphone avec dropdown indicatif pays (18 pays + diaspora)
// Émet onChange avec la valeur LOCALE (sans le +XXX) ; combine avec country.dial
// pour obtenir le E.164 final côté parent (ex: country.dial + local).
import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, TextInput, Modal, FlatList } from 'react-native';
import { colors, radius } from '../../theme/tokens';
import { fonts } from '../../theme/typography';

export type Country = { code: string; flag: string; name: string; dial: string };

// Marché Donia (Afrique de l'Ouest + Centre) + diaspora Europe + Amérique du Nord.
export const COUNTRIES: Country[] = [
  // Marché principal Afrique de l'Ouest / Centre
  { code: 'BJ', flag: '🇧🇯', name: 'Bénin', dial: '+229' },
  { code: 'CI', flag: '🇨🇮', name: "Côte d'Ivoire", dial: '+225' },
  { code: 'SN', flag: '🇸🇳', name: 'Sénégal', dial: '+221' },
  { code: 'TG', flag: '🇹🇬', name: 'Togo', dial: '+228' },
  { code: 'BF', flag: '🇧🇫', name: 'Burkina Faso', dial: '+226' },
  { code: 'ML', flag: '🇲🇱', name: 'Mali', dial: '+223' },
  { code: 'NE', flag: '🇳🇪', name: 'Niger', dial: '+227' },
  { code: 'CM', flag: '🇨🇲', name: 'Cameroun', dial: '+237' },
  { code: 'GH', flag: '🇬🇭', name: 'Ghana', dial: '+233' },
  { code: 'GN', flag: '🇬🇳', name: 'Guinée', dial: '+224' },
  { code: 'MA', flag: '🇲🇦', name: 'Maroc', dial: '+212' },
  { code: 'DZ', flag: '🇩🇿', name: 'Algérie', dial: '+213' },
  { code: 'TN', flag: '🇹🇳', name: 'Tunisie', dial: '+216' },
  // Europe — UE / EEE / autres
  { code: 'FR', flag: '🇫🇷', name: 'France', dial: '+33' },
  { code: 'BE', flag: '🇧🇪', name: 'Belgique', dial: '+32' },
  { code: 'DE', flag: '🇩🇪', name: 'Allemagne', dial: '+49' },
  { code: 'ES', flag: '🇪🇸', name: 'Espagne', dial: '+34' },
  { code: 'IT', flag: '🇮🇹', name: 'Italie', dial: '+39' },
  { code: 'PT', flag: '🇵🇹', name: 'Portugal', dial: '+351' },
  { code: 'NL', flag: '🇳🇱', name: 'Pays-Bas', dial: '+31' },
  { code: 'CH', flag: '🇨🇭', name: 'Suisse', dial: '+41' },
  { code: 'AT', flag: '🇦🇹', name: 'Autriche', dial: '+43' },
  { code: 'IE', flag: '🇮🇪', name: 'Irlande', dial: '+353' },
  { code: 'LU', flag: '🇱🇺', name: 'Luxembourg', dial: '+352' },
  { code: 'DK', flag: '🇩🇰', name: 'Danemark', dial: '+45' },
  { code: 'SE', flag: '🇸🇪', name: 'Suède', dial: '+46' },
  { code: 'NO', flag: '🇳🇴', name: 'Norvège', dial: '+47' },
  { code: 'FI', flag: '🇫🇮', name: 'Finlande', dial: '+358' },
  { code: 'GB', flag: '🇬🇧', name: 'Royaume-Uni', dial: '+44' },
  { code: 'PL', flag: '🇵🇱', name: 'Pologne', dial: '+48' },
  { code: 'CZ', flag: '🇨🇿', name: 'Tchéquie', dial: '+420' },
  { code: 'GR', flag: '🇬🇷', name: 'Grèce', dial: '+30' },
  { code: 'HU', flag: '🇭🇺', name: 'Hongrie', dial: '+36' },
  { code: 'RO', flag: '🇷🇴', name: 'Roumanie', dial: '+40' },
  { code: 'BG', flag: '🇧🇬', name: 'Bulgarie', dial: '+359' },
  { code: 'HR', flag: '🇭🇷', name: 'Croatie', dial: '+385' },
  { code: 'SK', flag: '🇸🇰', name: 'Slovaquie', dial: '+421' },
  { code: 'SI', flag: '🇸🇮', name: 'Slovénie', dial: '+386' },
  { code: 'EE', flag: '🇪🇪', name: 'Estonie', dial: '+372' },
  { code: 'LV', flag: '🇱🇻', name: 'Lettonie', dial: '+371' },
  { code: 'LT', flag: '🇱🇹', name: 'Lituanie', dial: '+370' },
  { code: 'CY', flag: '🇨🇾', name: 'Chypre', dial: '+357' },
  { code: 'MT', flag: '🇲🇹', name: 'Malte', dial: '+356' },
  // Amérique du Nord
  { code: 'CA', flag: '🇨🇦', name: 'Canada', dial: '+1' },
  { code: 'US', flag: '🇺🇸', name: 'États-Unis', dial: '+1' },
];

export const DEFAULT_COUNTRY: Country = COUNTRIES[0]!;

type Props = {
  country: Country;
  onCountryChange: (c: Country) => void;
  localNumber: string;
  onLocalNumberChange: (s: string) => void;
  label?: string;
  placeholder?: string;
};

export function PhoneInput({ country, onCountryChange, localNumber, onLocalNumberChange, label, placeholder }: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <View>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.row}>
        <Pressable style={styles.dialBtn} onPress={() => setPickerOpen(true)}>
          <Text style={styles.dialFlag}>{country.flag}</Text>
          <Text style={styles.dialCode}>{country.dial}</Text>
          <Text style={styles.dialChevron}>▾</Text>
        </Pressable>
        <TextInput
          value={localNumber}
          onChangeText={onLocalNumberChange}
          placeholder={placeholder ?? '90 12 34 56'}
          placeholderTextColor={colors.ink3}
          keyboardType="phone-pad"
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.input}
        />
      </View>

      <Modal visible={pickerOpen} animationType="slide" transparent onRequestClose={() => setPickerOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setPickerOpen(false)}>
          <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Choisis ton indicatif</Text>
            <FlatList
              data={COUNTRIES}
              keyExtractor={(c) => c.code}
              renderItem={({ item }) => {
                const isCurrent = item.code === country.code;
                return (
                  <Pressable
                    onPress={() => {
                      onCountryChange(item);
                      setPickerOpen(false);
                    }}
                    style={[styles.countryRow, isCurrent && { backgroundColor: 'rgba(244,72,111,0.08)' }]}
                  >
                    <Text style={styles.countryFlag}>{item.flag}</Text>
                    <Text style={styles.countryName}>{item.name}</Text>
                    <Text style={styles.countryDial}>{item.dial}</Text>
                  </Pressable>
                );
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

// Utilitaire : numéro complet E.164 à passer à l'API
export function toE164(country: Country, localNumber: string): string {
  const digits = localNumber.replace(/\D/g, '');
  return `${country.dial}${digits}`;
}

const styles = StyleSheet.create({
  label: { fontFamily: fonts.displayItalic, fontSize: 12, color: colors.ink2, marginBottom: 6 },
  row: { flexDirection: 'row', gap: 8 },
  dialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    height: 52,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.lineSoft,
  },
  dialFlag: { fontSize: 20 },
  dialCode: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.ink },
  dialChevron: { fontSize: 10, color: colors.ink2, marginLeft: 2 },
  input: {
    flex: 1,
    height: 52,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    paddingHorizontal: 14,
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.ink,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(42,15,26,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
    paddingBottom: 24,
    maxHeight: '75%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.ink3,
    alignSelf: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontFamily: fonts.displayMedium,
    fontSize: 18,
    color: colors.ink,
    textAlign: 'center',
    marginBottom: 12,
  },
  countryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 22,
    paddingVertical: 14,
  },
  countryFlag: { fontSize: 22 },
  countryName: { flex: 1, fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.ink },
  countryDial: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.ink2 },
});
