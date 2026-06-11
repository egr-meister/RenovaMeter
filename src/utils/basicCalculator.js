// Expression calculator with correct operator precedence (× and ÷ before + and −).
// No eval and no external parser — a tiny tokenizer + two-pass evaluator.
//
// State shape:
// {
//   tokens: string[],   // finalized expression parts: numbers and operators,
//                        //   e.g. ['2','+','2','×']  (current number not included)
//   current: string,    // the number being typed now; '' means "waiting" after an operator
//   display: string,    // big display value
//   expression: string, // small line: the full expression being built / evaluated
//   justEvaluated: bool, // true right after '=' so the next digit starts fresh
//   error: string|null,
// }

const OPERATORS = ['+', '-', '×', '÷'];

function isOp(t) {
  return OPERATORS.indexOf(t) !== -1;
}

// Build the human-readable expression line from tokens (+ optional current number).
function formatExpression(tokens, current) {
  const parts = tokens.slice();
  if (current !== '' && current != null) {
    parts.push(current);
  }
  let s = '';
  for (let i = 0; i < parts.length; i++) {
    const t = parts[i];
    s += isOp(t) ? ' ' + t + ' ' : t;
  }
  return s.trim();
}

// The big display: the current number, or the most recent number if waiting.
function bigDisplay(tokens, current) {
  if (current !== '' && current != null) {
    return current;
  }
  for (let i = tokens.length - 1; i >= 0; i--) {
    if (!isOp(tokens[i])) {
      return tokens[i];
    }
  }
  return '0';
}

// Evaluate a flat token list [num, op, num, op, num, ...] with precedence.
function evalTokens(tokens) {
  if (tokens.length === 0 || tokens.length % 2 === 0) {
    return { ok: false, error: 'Enter a valid calculation.' };
  }
  const first = Number(tokens[0]);
  if (!isFinite(first)) {
    return { ok: false, error: 'Enter a valid calculation.' };
  }
  // First pass: resolve × and ÷ immediately; collect + and − for the second pass.
  const nums = [first];
  const addOps = [];
  for (let i = 1; i < tokens.length; i += 2) {
    const op = tokens[i];
    const n = Number(tokens[i + 1]);
    if (!isFinite(n)) {
      return { ok: false, error: 'Enter a valid calculation.' };
    }
    if (op === '×') {
      nums[nums.length - 1] = nums[nums.length - 1] * n;
    } else if (op === '÷') {
      if (n === 0) {
        return { ok: false, error: 'Cannot divide by zero.' };
      }
      nums[nums.length - 1] = nums[nums.length - 1] / n;
    } else if (op === '+') {
      nums.push(n);
      addOps.push('+');
    } else if (op === '-') {
      nums.push(n);
      addOps.push('-');
    } else {
      return { ok: false, error: 'Enter a valid calculation.' };
    }
  }
  // Second pass: left-to-right addition and subtraction.
  let result = nums[0];
  for (let j = 0; j < addOps.length; j++) {
    result = addOps[j] === '+' ? result + nums[j + 1] : result - nums[j + 1];
  }
  if (!isFinite(result)) {
    return { ok: false, error: 'Enter a valid calculation.' };
  }
  return { ok: true, value: result };
}

export function createInitialCalcState() {
  return {
    tokens: [],
    current: '0',
    display: '0',
    expression: '',
    justEvaluated: false,
    error: null,
  };
}

export function clearCalculator() {
  return createInitialCalcState();
}

// Append a digit (0-9).
export function inputDigit(state, digit) {
  const d = String(digit);
  if (!/^[0-9]$/.test(d)) {
    return state;
  }

  // After an error or after '=', a digit starts a brand-new calculation.
  if (state.error || state.justEvaluated) {
    return {
      tokens: [],
      current: d,
      display: d,
      expression: d,
      justEvaluated: false,
      error: null,
    };
  }

  let current = state.current;
  if (current === '' || current === '0') {
    current = d; // first digit after an operator, or replace a lone leading zero
  } else {
    // Cap the length of a single number to keep things predictable.
    if (current.replace('-', '').replace('.', '').length >= 12) {
      return state;
    }
    current = current + d;
  }

  return {
    tokens: state.tokens,
    current,
    display: current,
    expression: formatExpression(state.tokens, current),
    justEvaluated: false,
    error: null,
  };
}

// Add a decimal point (only one per number).
export function inputDecimal(state) {
  if (state.error || state.justEvaluated) {
    return {
      tokens: [],
      current: '0.',
      display: '0.',
      expression: '0.',
      justEvaluated: false,
      error: null,
    };
  }

  let current = state.current;
  if (current === '') {
    current = '0.';
  } else if (current.indexOf('.') !== -1) {
    return state; // already has a decimal point
  } else {
    current = current + '.';
  }

  return {
    tokens: state.tokens,
    current,
    display: current,
    expression: formatExpression(state.tokens, current),
    justEvaluated: false,
    error: null,
  };
}

// Append an operator. Operators are NOT evaluated here — the whole expression
// is evaluated on '=', so precedence is respected (2 + 2 × 3 = 8).
export function chooseOperator(state, operator) {
  if (OPERATORS.indexOf(operator) === -1) {
    return state;
  }

  // Recover from an error: start a fresh expression from 0.
  if (state.error) {
    const tokens = ['0', operator];
    return {
      tokens,
      current: '',
      display: '0',
      expression: formatExpression(tokens, ''),
      justEvaluated: false,
      error: null,
    };
  }

  // After '=', continue the next expression from the previous result.
  if (state.justEvaluated) {
    const tokens = [state.current, operator];
    return {
      tokens,
      current: '',
      display: state.current,
      expression: formatExpression(tokens, ''),
      justEvaluated: false,
      error: null,
    };
  }

  let tokens = state.tokens.slice();
  const current = state.current;

  if (current === '') {
    // Waiting after an operator: pressing another operator replaces it.
    if (tokens.length > 0 && isOp(tokens[tokens.length - 1])) {
      tokens[tokens.length - 1] = operator;
    } else if (tokens.length === 0) {
      tokens = ['0', operator];
    } else {
      tokens.push(operator);
    }
  } else {
    // Commit the typed number, then the operator.
    tokens.push(current);
    tokens.push(operator);
  }

  return {
    tokens,
    current: '',
    display: bigDisplay(tokens, ''),
    expression: formatExpression(tokens, ''),
    justEvaluated: false,
    error: null,
  };
}

// Backspace: remove the last digit, or step back over a trailing operator.
export function deleteLast(state) {
  if (state.error) {
    return createInitialCalcState();
  }

  if (state.justEvaluated) {
    // Edit the result as a starting number.
    let cur = state.current.length > 1 ? state.current.slice(0, -1) : '0';
    if (cur === '' || cur === '-') {
      cur = '0';
    }
    return {
      tokens: [],
      current: cur,
      display: cur,
      expression: cur === '0' ? '' : cur,
      justEvaluated: false,
      error: null,
    };
  }

  const tokens = state.tokens.slice();
  let current = state.current;

  if (current !== '') {
    current = current.length > 1 ? current.slice(0, -1) : '0';
    return {
      tokens,
      current,
      display: current,
      expression: formatExpression(tokens, current),
      justEvaluated: false,
      error: null,
    };
  }

  // current === '' : remove the trailing operator and bring the previous number
  // back so it can be edited.
  if (tokens.length > 0 && isOp(tokens[tokens.length - 1])) {
    tokens.pop(); // remove operator
    if (tokens.length > 0) {
      current = tokens.pop(); // bring the number back into editing
    } else {
      current = '0';
    }
    return {
      tokens,
      current,
      display: current,
      expression: formatExpression(tokens, current),
      justEvaluated: false,
      error: null,
    };
  }

  return state;
}

// Evaluate the whole expression with correct precedence.
export function calculateResult(state) {
  if (state.error) {
    return state;
  }

  const tokens = state.tokens.slice();
  if (state.current !== '') {
    tokens.push(state.current);
  }
  // Drop any trailing operators (e.g. "2 + =" -> evaluate "2").
  while (tokens.length > 0 && isOp(tokens[tokens.length - 1])) {
    tokens.pop();
  }

  if (tokens.length === 0) {
    return { ...createInitialCalcState(), error: 'Enter a valid calculation.' };
  }

  // A single number with no operation simply stands as the result.
  if (tokens.length === 1) {
    const v = tokens[0];
    return {
      tokens: [],
      current: v,
      display: v,
      expression: '',
      justEvaluated: true,
      error: null,
    };
  }

  const res = evalTokens(tokens);
  if (!res.ok) {
    return { ...createInitialCalcState(), error: res.error };
  }

  // Trim floating-point noise to a clean, readable number.
  const rounded = Math.round((res.value + Number.EPSILON) * 1e8) / 1e8;

  return {
    tokens: [],
    current: String(rounded),
    display: String(rounded),
    expression: formatExpression(tokens, '') + ' =',
    justEvaluated: true,
    error: null,
  };
}
