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

// Choose the operator for the next operation.
// Still ONE operation at a time: if an operation is already pending and a
// second operand has been entered, it is evaluated first (left-to-right),
// and the running result becomes the first operand of the new operation.
export function chooseOperator(state, operator) {
  if (OPERATORS.indexOf(operator) === -1) {
    return state;
  }

  // Recover from an error state by starting fresh from 0.
  if (state.error) {
    return {
      ...createInitialCalcState(),
      operand1: '0',
      operator: operator,
      waitingForSecond: true,
    };
  }

  // A complete pending operation (operator set, second operand typed) is
  // evaluated before applying the new operator. This makes sequences like
  // "2 + 3 + 4 =" produce 9 instead of discarding the running total.
  if (
    state.operator &&
    state.operand1 !== null &&
    !state.waitingForSecond &&
    !state.justEvaluated
  ) {
    const evaluated = calculateResult(state);
    if (evaluated.error) {
      return evaluated; // e.g. division by zero
    }
    return {
      display: evaluated.display,
      operand1: evaluated.display,
      operator: operator,
      waitingForSecond: true,
      justEvaluated: false,
      error: null,
    };
  }

  // Otherwise use the current value as the first operand. This also covers:
  //  - choosing the first operator,
  //  - changing the operator right after pressing one ("8 + ×" -> uses ×),
  //  - chaining from a result produced by "=" (operand1 = that result).
  return {
    display: state.display,
    operand1: state.display,
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
  // No pending operation (a lone number, or pressing "=" again on a result):
  // the current value simply stands as the result. No error.
  if (!state.operator || state.operand1 === null) {
    return {
      ...state,
      operand1: null,
      operator: null,
      waitingForSecond: false,
      justEvaluated: true,
      error: null,
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
