import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import ScreenContainer from '../components/ScreenContainer';
import colors from '../theme/colors';
import { loadAppData, saveAppData } from '../storage/appStorage';

export default function SettingsScreen() {
  const [data, setData] = useState({
    unitSystem: 'metric',
    decimalPrecision: 1,
    savedCalculations: [],
  });

  useFocusEffect(
    useCallback(() => {
      let active = true;
      loadAppData().then((d) => {
        if (active) {
          setData(d);
        }
      });
      return () => {
        active = false;
      };
    }, [])
  );

  const setPrecision = async (precision) => {
    const updated = { ...data, decimalPrecision: precision };
    setData(updated);
    await saveAppData(updated);
  };

  return (
    <ScreenContainer>
      {/* Unit System */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Unit System</Text>
        <View style={styles.optionRow}>
          <Option label="Metric" selected={true} onPress={() => {}} />
        </View>
        <Text style={styles.note}>
          This version uses the Metric system (meters, m², liters).
        </Text>
      </View>

      {/* Decimal Precision */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Decimal Precision</Text>
        <View style={styles.optionRow}>
          <Option
            label="1 decimal"
            selected={data.decimalPrecision === 1}
            onPress={() => setPrecision(1)}
          />
          <Option
            label="2 decimals"
            selected={data.decimalPrecision === 2}
            onPress={() => setPrecision(2)}
          />
        </View>
        <Text style={styles.note}>
          Controls how area and paint results are rounded.
        </Text>
      </View>

      {/* Privacy */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy</Text>
        <View style={styles.privacyCard}>
          <Text style={styles.privacyText}>
            RenovaMeter does not collect personal data. The app works offline and
            stores saved calculations only on this device.
          </Text>
        </View>
      </View>

      <Text style={styles.version}>RenovaMeter • Version 1.0.0</Text>
    </ScreenContainer>
  );
}

function Option({ label, selected, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.option,
        selected ? styles.optionSelected : null,
        pressed ? styles.optionPressed : null,
      ]}
    >
      <Text style={[styles.optionText, selected ? styles.optionTextSelected : null]}>
        {selected ? '● ' : '○ '}
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 12,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  option: {
    backgroundColor: colors.beige,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingVertical: 12,
    paddingHorizontal: 18,
    marginRight: 10,
    marginBottom: 10,
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: '#EAF2FA',
  },
  optionPressed: {
    backgroundColor: colors.border,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  optionTextSelected: {
    color: colors.primaryDark,
  },
  note: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
  },
  privacyCard: {
    backgroundColor: colors.beige,
    borderRadius: 12,
    padding: 14,
  },
  privacyText: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
  },
  version: {
    textAlign: 'center',
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
    marginBottom: 8,
  },
});
