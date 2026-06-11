import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../theme/colors';

// Card that shows a calculation result or an error message.
// type: 'success' | 'error'
export default function ResultCard({ text, type = 'success' }) {
  if (!text) {
    return null;
  }
  const isError = type === 'error';
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: isError ? '#FBEAEA' : colors.beige },
        { borderColor: isError ? colors.danger : colors.accent },
      ]}
    >
      <Text style={styles.icon}>{isError ? '⚠️' : '✅'}</Text>
      <Text
        style={[
          styles.text,
          { color: isError ? colors.dangerDark : colors.text },
        ]}
      >
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginTop: 8,
  },
  icon: {
    fontSize: 22,
    marginRight: 10,
  },
  text: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
  },
});
