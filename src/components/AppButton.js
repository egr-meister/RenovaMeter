import React from 'react';
import { Text, Pressable, StyleSheet } from 'react-native';
import colors from '../theme/colors';

// Reusable button.
// variant: 'primary' | 'accent' | 'danger' | 'neutral'
// size: 'large' | 'medium'
export default function AppButton({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  style,
}) {
  const palette = getPalette(variant);
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        size === 'large' ? styles.large : styles.medium,
        { backgroundColor: disabled ? colors.disabled : palette.bg },
        pressed && !disabled ? { backgroundColor: palette.pressed } : null,
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          size === 'large' ? styles.textLarge : styles.textMedium,
          { color: palette.text },
        ]}
        numberOfLines={2}
      >
        {title}
      </Text>
    </Pressable>
  );
}

function getPalette(variant) {
  switch (variant) {
    case 'accent':
      return {
        bg: colors.accent,
        pressed: colors.accentDark,
        text: colors.textOnPrimary,
      };
    case 'danger':
      return {
        bg: colors.danger,
        pressed: colors.dangerDark,
        text: colors.textOnPrimary,
      };
    case 'neutral':
      return {
        bg: colors.surface,
        pressed: colors.border,
        text: colors.text,
      };
    case 'primary':
    default:
      return {
        bg: colors.primary,
        pressed: colors.primaryDark,
        text: colors.textOnPrimary,
      };
  }
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medium: {
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  large: {
    paddingVertical: 22,
    paddingHorizontal: 20,
  },
  text: {
    fontWeight: '700',
    textAlign: 'center',
  },
  textMedium: {
    fontSize: 16,
  },
  textLarge: {
    fontSize: 20,
  },
});
