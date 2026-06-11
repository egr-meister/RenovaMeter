import React from 'react';
import { Text, View, Pressable, StyleSheet } from 'react-native';
import colors from '../theme/colors';

// Selectable card for a renovation tool.
export default function ToolCard({ emoji, title, description, selected, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        selected ? styles.cardSelected : null,
        pressed ? styles.cardPressed : null,
      ]}
    >
      <Text style={styles.emoji}>{emoji}</Text>
      <View style={styles.textWrap}>
        <Text style={styles.title}>{title}</Text>
        {description ? (
          <Text style={styles.description}>{description}</Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  cardSelected: {
    borderColor: colors.primary,
    backgroundColor: '#EAF2FA',
  },
  cardPressed: {
    backgroundColor: colors.border,
  },
  emoji: {
    fontSize: 28,
    marginRight: 14,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  description: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
});
