// Simple, predictable calculator that supports ONLY ONE operation at a time.
// No expression parsing and no eval. State is a plain object.
//
// State shape:
// {
//   display: string,        // what the user currently sees / is typing
//   operand1: string|null,  // stored first operand (as a string) once an operator is chosen
//   operator: string|null,  // '+', '-', '×' or '÷'
//   waitingForSecond: bool, // true right after an operator is chosen
//   justEvaluated: bool,    // true right after '=' so the next digit starts fresh
//   error: string|null,     // error message, if any
// }

const OPERATORS = ['+', '-', '×', '÷'];

export function createInitialCalcState() {
  return {
    display: '0',
    operand1: null,
    operator: null,
    waitingForSecond: false,
    justEvaluated: false,
    error: null,
  };
}

// Clear everything back to the initial state.
export function clearCalculator() {
  return createInitialCalcState();
}

// Append a single digit (0-9) to the current entry.
export function inputDigit(state, digit) {
  const d = String(digit);
  if (!/^[0-9]$/.test(d)) {
    return state;
  }

  // Starting a fresh calculation after an error or after pressing '='.
  if (state.error || state.justEvaluated) {
    return {
      ...createInitialCalcState(),
      display: d,
    };
  }

  // First digit of the second operand.
  if (state.waitingForSecond) {
    return {
      ...state,
      display: d,
      waitingForSecond: false,
      error: null,
    };
  }

  // Replace a lone leading zero, otherwise append.
  const next = state.display === '0' ? d : state.display + d;
  // Guard against runaway length.
  if (next.replace(/[^0-9]/g, '').length > 12) {
    return state;
  }
  return { ...state, display: next, error: null };
}

// Add a decimal point to the current entry (only one allowed).
export function inputDecimal(state) {
  if (state.error || state.justEvaluated) {
    return {
      ...createInitialCalcState(),
      display: '0.',
    };
  }

  if (state.waitingForSecond) {
    return {
      ...state,
      display: '0.',
      waitingForSecond: false,
      error: null,
    };
  }

  if (state.display.indexOf('.') !== -1) {
    return state; // already has a decimal point
  }
  return { ...state, display: state.display + '.', error: null };
}

// Choose the single operator for this calculation.
export function chooseOperator(state, operator) {
  if (OPERATORS.indexOf(operator) === -1) {
    return state;
  }

  // After '=' allow chaining the result into a new operation.
  const baseDisplay = state.error ? '0' : state.display;

  return {
    display: baseDisplay,
    operand1: baseDisplay,
    operator: operator,
    waitingForSecond: true,
    justEvaluated: false,
    error: null,
  };
}

// Remove the last character of the current entry (backspace).
export function deleteLast(state) {
  if (state.error) {
    return createInitialCalcState();
  }

  // Do not delete into a stored operand; just reset the pending second entry.
  if (state.waitingForSecond) {
    return state;
  }

  if (state.justEvaluated) {
    // Backspace after a result behaves like starting over from that result.
    const trimmed = state.display.length > 1 ? state.display.slice(0, -1) : '0';
    return {
      ...createInitialCalcState(),
      display: trimmed === '' || trimmed === '-' ? '0' : trimmed,
    };
  }

  const next = state.display.length > 1 ? state.display.slice(0, -1) : '0';
  return { ...state, display: next === '' ? '0' : next };
}

// Evaluate the single stored operation.
export function calculateResult(state) {
  // Nothing to do if no operator was chosen.
  if (!state.operator || state.operand1 === null) {
    return {
      ...state,
      error: 'Enter a valid calculation.',
      display: state.display,
    };
  }

  // Operator chosen but no second operand entered yet.
  if (state.waitingForSecond) {
    return {
      ...createInitialCalcState(),
      error: 'Enter a valid calculation.',
    };
  }

  const a = Number(state.operand1);
  const b = Number(state.display);

  if (!isFinite(a) || !isFinite(b)) {
    return {
      ...createInitialCalcState(),
      error: 'Enter a valid calculation.',
    };
  }

  let result;
  switch (state.operator) {
    case '+':
      result = a + b;
      break;
    case '-':
      result = a - b;
      break;
    case '×':
      result = a * b;
      break;
    case '÷':
      if (b === 0) {
        return {
          ...createInitialCalcState(),
          error: 'Cannot divide by zero.',
        };
      }
      result = a / b;
      break;
    default:
      return {
        ...createInitialCalcState(),
        error: 'Enter a valid calculation.',
      };
  }

  if (!isFinite(result)) {
    return {
      ...createInitialCalcState(),
      error: 'Enter a valid calculation.',
    };
  }

  // Limit floating point noise to a clean, readable number.
  const rounded = Math.round((result + Number.EPSILON) * 1e8) / 1e8;

  return {
    display: String(rounded),
    operand1: null,
    operator: null,
    waitingForSecond: false,
    justEvaluated: true,
    error: null,
  };
}
