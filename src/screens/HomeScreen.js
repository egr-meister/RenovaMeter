import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import colors from '../theme/colors';

const MENU = [
  {
    key: 'BasicCalculator',
    emoji: '🧮',
    title: 'Basic Calculator',
    subtitle: 'Quick everyday math',
  },
  {
    key: 'RenovaTools',
    emoji: '🧰',
    title: 'Renova Tools',
    subtitle: 'Area, paint, tiles & wallpaper',
  },
  {
    key: 'History',
    emoji: '📒',
    title: 'Saved Calculations',
    subtitle: 'Review your saved results',
  },
  {
    key: 'Settings',
    emoji: '⚙️',
    title: 'Settings',
    subtitle: 'Units, precision & privacy',
  },
];

export default function HomeScreen({ navigation }) {
  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.logo}>📏 🏠</Text>
        <Text style={styles.title}>RenovaMeter</Text>
        <Text style={styles.subtitle}>
          Simple measurement tools for home projects.
        </Text>
      </View>

      {MENU.map((item) => (
        <Pressable
          key={item.key}
          onPress={() => navigation.navigate(item.key)}
          style={({ pressed }) => [
            styles.card,
            pressed ? styles.cardPressed : null,
          ]}
        >
          <Text style={styles.cardEmoji}>{item.emoji}</Text>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
      ))}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 24,
  },
  logo: {
    fontSize: 40,
    marginBottom: 8,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textMuted,
    marginTop: 6,
    textAlign: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 22,
    paddingHorizontal: 18,
    marginBottom: 14,
  },
  cardPressed: {
    backgroundColor: colors.beige,
  },
  cardEmoji: {
    fontSize: 32,
    marginRight: 16,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  cardSubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 2,
  },
  chevron: {
    fontSize: 30,
    color: colors.textMuted,
    marginLeft: 8,
  },
});
