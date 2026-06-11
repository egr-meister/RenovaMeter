import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import colors from '../theme/colors';
import {
  createInitialCalcState,
  inputDigit,
  inputDecimal,
  chooseOperator,
  clearCalculator,
  deleteLast,
  calculateResult,
} from '../utils/basicCalculator';

export default function BasicCalculatorScreen() {
  const [state, setState] = useState(createInitialCalcState());

  // Build the line that shows the pending operation, e.g. "12 ×".
  const expressionLine =
    state.operator && state.operand1 !== null
      ? `${state.operand1} ${state.operator}`
      : ' ';

  const mainDisplay = state.error ? '0' : state.display;

  const handleDigit = (d) => setState((s) => inputDigit(s, d));
  const handleDecimal = () => setState((s) => inputDecimal(s));
  const handleOperator = (op) => setState((s) => chooseOperator(s, op));
  const handleClear = () => setState(clearCalculator());
  const handleDelete = () => setState((s) => deleteLast(s));
  const handleEquals = () => setState((s) => calculateResult(s));

  return (
    <ScreenContainer scroll={false}>
      <View style={styles.wrapper}>
        {/* Display */}
        <View style={styles.display}>
          <Text style={styles.expression} numberOfLines={1}>
            {expressionLine}
          </Text>
          <Text style={styles.result} numberOfLines={1} adjustsFontSizeToFit>
            {mainDisplay}
          </Text>
          {state.error ? (
            <Text style={styles.error}>{state.error}</Text>
          ) : (
            <Text style={styles.hint}>One operation at a time</Text>
          )}
        </View>

        {/* Keypad */}
        <View style={styles.keypad}>
          <View style={styles.row}>
            <Key label="C" onPress={handleClear} variant="function" />
            <Key label="⌫" onPress={handleDelete} variant="function" />
            <Key label="÷" onPress={() => handleOperator('÷')} variant="operator" />
            <Key label="×" onPress={() => handleOperator('×')} variant="operator" />
          </View>
          <View style={styles.row}>
            <Key label="7" onPress={() => handleDigit('7')} />
            <Key label="8" onPress={() => handleDigit('8')} />
            <Key label="9" onPress={() => handleDigit('9')} />
            <Key label="-" onPress={() => handleOperator('-')} variant="operator" />
          </View>
          <View style={styles.row}>
            <Key label="4" onPress={() => handleDigit('4')} />
            <Key label="5" onPress={() => handleDigit('5')} />
            <Key label="6" onPress={() => handleDigit('6')} />
            <Key label="+" onPress={() => handleOperator('+')} variant="operator" />
          </View>
          <View style={styles.row}>
            <Key label="1" onPress={() => handleDigit('1')} />
            <Key label="2" onPress={() => handleDigit('2')} />
            <Key label="3" onPress={() => handleDigit('3')} />
            <Key label="=" onPress={handleEquals} variant="equals" tall />
          </View>
          <View style={styles.row}>
            <Key label="0" onPress={() => handleDigit('0')} wide />
            <Key label="." onPress={handleDecimal} />
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
}

function Key({ label, onPress, variant = 'digit', wide = false, tall = false }) {
  const palette = keyPalette(variant);
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.key,
        wide ? styles.keyWide : null,
        tall ? styles.keyTall : null,
        { backgroundColor: pressed ? palette.pressed : palette.bg },
        { borderColor: palette.border },
      ]}
    >
      <Text style={[styles.keyLabel, { color: palette.text }]}>{label}</Text>
    </Pressable>
  );
}

function keyPalette(variant) {
  switch (variant) {
    case 'operator':
      return {
        bg: colors.primary,
        pressed: colors.primaryDark,
        text: colors.textOnPrimary,
        border: colors.primary,
      };
    case 'equals':
      return {
        bg: colors.accent,
        pressed: colors.accentDark,
        text: colors.textOnPrimary,
        border: colors.accent,
      };
    case 'function':
      return {
        bg: colors.beige,
        pressed: colors.border,
        text: colors.text,
        border: colors.border,
      };
    case 'digit':
    default:
      return {
        bg: colors.surface,
        pressed: colors.border,
        text: colors.text,
        border: colors.border,
      };
  }
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    padding: 16,
    justifyContent: 'flex-end',
  },
  display: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    marginBottom: 16,
    minHeight: 140,
    justifyContent: 'center',
  },
  expression: {
    fontSize: 18,
    color: colors.textMuted,
    textAlign: 'right',
    minHeight: 22,
  },
  result: {
    fontSize: 48,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'right',
  },
  hint: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'right',
    marginTop: 4,
  },
  error: {
    fontSize: 14,
    color: colors.danger,
    fontWeight: '700',
    textAlign: 'right',
    marginTop: 4,
  },
  keypad: {
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  key: {
    flex: 1,
    height: 64,
    marginHorizontal: 5,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyWide: {
    flex: 2.16,
  },
  keyTall: {
    // '=' visually emphasized by accent color; height kept consistent.
  },
  keyLabel: {
    fontSize: 26,
    fontWeight: '700',
  },
});
