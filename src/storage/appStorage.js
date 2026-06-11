import AsyncStorage from '@react-native-async-storage/async-storage';

// Single storage key holding all app data.
const STORAGE_KEY = '@renovameter_data_v1';

// Default app data. Always returned when storage is empty or unreadable.
export const DEFAULT_DATA = {
  unitSystem: 'metric',
  decimalPrecision: 1,
  savedCalculations: [],
};

// Make a fresh copy of the defaults so callers never mutate the shared object.
function freshDefaults() {
  return {
    unitSystem: DEFAULT_DATA.unitSystem,
    decimalPrecision: DEFAULT_DATA.decimalPrecision,
    savedCalculations: [],
  };
}

// Merge a stored object onto defaults so missing fields are always filled in.
function normalize(data) {
  const base = freshDefaults();
  if (!data || typeof data !== 'object') {
    return base;
  }
  return {
    unitSystem: data.unitSystem === 'metric' ? 'metric' : base.unitSystem,
    decimalPrecision:
      data.decimalPrecision === 2 ? 2 : 1,
    savedCalculations: Array.isArray(data.savedCalculations)
      ? data.savedCalculations
      : [],
  };
}

// Load all app data. Never throws; returns defaults on any error.
export async function loadAppData() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return freshDefaults();
    }
    const parsed = JSON.parse(raw);
    return normalize(parsed);
  } catch (e) {
    return freshDefaults();
  }
}

// Save the full app data object. Returns true on success, false on failure.
export async function saveAppData(data) {
  try {
    const normalized = normalize(data);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    return true;
  } catch (e) {
    return false;
  }
}

// Append a saved calculation item. Returns the updated, normalized data.
export async function saveCalculation(item) {
  const data = await loadAppData();
  const safeItem = item && typeof item === 'object' ? item : {};
  const entry = {
    id:
      safeItem.id != null
        ? String(safeItem.id)
        : String(Date.now()) + '_' + Math.floor(Math.random() * 100000),
    toolName: safeItem.toolName ? String(safeItem.toolName) : 'Calculation',
    resultText: safeItem.resultText ? String(safeItem.resultText) : '',
    inputSummary: safeItem.inputSummary ? String(safeItem.inputSummary) : '',
    dateTime: safeItem.dateTime ? String(safeItem.dateTime) : new Date().toISOString(),
  };
  const updated = {
    ...data,
    savedCalculations: [entry, ...data.savedCalculations],
  };
  await saveAppData(updated);
  return updated;
}

// Remove all saved calculations. Returns the updated data.
export async function clearSavedCalculations() {
  const data = await loadAppData();
  const updated = { ...data, savedCalculations: [] };
  await saveAppData(updated);
  return updated;
}

// Delete one saved calculation by id. Returns the updated data.
export async function deleteSavedCalculation(id) {
  const data = await loadAppData();
  const target = String(id);
  const updated = {
    ...data,
    savedCalculations: data.savedCalculations.filter(
      (c) => String(c.id) !== target
    ),
  };
  await saveAppData(updated);
  return updated;
}
