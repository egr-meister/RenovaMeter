import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import ToolCard from '../components/ToolCard';
import InputField from '../components/InputField';
import ResultCard from '../components/ResultCard';
import AppButton from '../components/AppButton';
import colors from '../theme/colors';
import { loadAppData, saveCalculation } from '../storage/appStorage';
import {
  calculateFloorArea,
  calculateWallArea,
  calculatePaintLiters,
  calculateTilesNeeded,
  calculateWallpaperRolls,
} from '../utils/renovaCalculations';

// Tool definitions: fields, default values, units, and a compute function
// that receives the current field values and the chosen decimal precision.
const TOOLS = [
  {
    key: 'floor',
    emoji: '📐',
    title: 'Floor Area',
    description: 'Length × width',
    fields: [
      { key: 'length', label: 'Room length', unit: 'm', default: '' },
      { key: 'width', label: 'Room width', unit: 'm', default: '' },
    ],
    compute: (v, p) => calculateFloorArea(v.length, v.width, p),
    summary: (v) => `L ${v.length || '-'} m × W ${v.width || '-'} m`,
  },
  {
    key: 'wall',
    emoji: '🧱',
    title: 'Wall Area',
    description: 'Width × height',
    fields: [
      { key: 'width', label: 'Wall width', unit: 'm', default: '' },
      { key: 'height', label: 'Wall height', unit: 'm', default: '' },
    ],
    compute: (v, p) => calculateWallArea(v.width, v.height, p),
    summary: (v) => `W ${v.width || '-'} m × H ${v.height || '-'} m`,
  },
  {
    key: 'paint',
    emoji: '🎨',
    title: 'Paint',
    description: 'Liters of paint needed',
    fields: [
      { key: 'area', label: 'Wall area', unit: 'm²', default: '' },
      { key: 'coverage', label: 'Coverage per liter', unit: 'm²/L', default: '10' },
      { key: 'coats', label: 'Number of coats', unit: '', default: '2' },
    ],
    compute: (v, p) => calculatePaintLiters(v.area, v.coverage, v.coats, p),
    summary: (v) =>
      `Area ${v.area || '-'} m², ${v.coats || '-'} coat(s), ${v.coverage || '-'} m²/L`,
  },
  {
    key: 'tile',
    emoji: '🟫',
    title: 'Tiles',
    description: 'Tiles needed with waste',
    fields: [
      { key: 'surface', label: 'Surface area', unit: 'm²', default: '' },
      { key: 'tileLength', label: 'Tile length', unit: 'cm', default: '' },
      { key: 'tileWidth', label: 'Tile width', unit: 'cm', default: '' },
      { key: 'waste', label: 'Waste percent', unit: '%', default: '10' },
    ],
    compute: (v) =>
      calculateTilesNeeded(v.surface, v.tileLength, v.tileWidth, v.waste),
    summary: (v) =>
      `Surface ${v.surface || '-'} m², tile ${v.tileLength || '-'}×${
        v.tileWidth || '-'
      } cm, waste ${v.waste || '-'}%`,
  },
  {
    key: 'wallpaper',
    emoji: '🧻',
    title: 'Wallpaper',
    description: 'Rolls needed',
    fields: [
      { key: 'wallWidth', label: 'Wall width', unit: 'm', default: '' },
      { key: 'wallHeight', label: 'Wall height', unit: 'm', default: '' },
      { key: 'rollWidth', label: 'Roll width', unit: 'm', default: '0.53' },
      { key: 'rollLength', label: 'Roll length', unit: 'm', default: '10' },
    ],
    compute: (v) =>
      calculateWallpaperRolls(v.wallWidth, v.wallHeight, v.rollWidth, v.rollLength),
    summary: (v) =>
      `Wall ${v.wallWidth || '-'}×${v.wallHeight || '-'} m, roll ${
        v.rollWidth || '-'
      }×${v.rollLength || '-'} m`,
  },
];

function buildDefaults(tool) {
  const obj = {};
  tool.fields.forEach((f) => {
    obj[f.key] = f.default;
  });
  return obj;
}

export default function RenovaToolsScreen() {
  const [selectedKey, setSelectedKey] = useState(TOOLS[0].key);
  const [values, setValues] = useState(buildDefaults(TOOLS[0]));
  const [result, setResult] = useState(null); // { ok, value?, text?, error? }
  const [precision, setPrecision] = useState(1);

  // Load the user's decimal precision setting.
  useEffect(() => {
    let active = true;
    loadAppData().then((data) => {
      if (active) {
        setPrecision(data.decimalPrecision === 2 ? 2 : 1);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const tool = TOOLS.find((t) => t.key === selectedKey) || TOOLS[0];

  const selectTool = (key) => {
    const next = TOOLS.find((t) => t.key === key) || TOOLS[0];
    setSelectedKey(key);
    setValues(buildDefaults(next));
    setResult(null);
  };

  const updateField = (fieldKey, text) => {
    setValues((v) => ({ ...v, [fieldKey]: text }));
  };

  const handleCalculate = () => {
    const r = tool.compute(values, precision);
    setResult(r);
  };

  const handleReset = () => {
    setValues(buildDefaults(tool));
    setResult(null);
  };

  const handleSave = async () => {
    if (!result || !result.ok) {
      return;
    }
    try {
      await saveCalculation({
        toolName: tool.title,
        resultText: result.text,
        inputSummary: tool.summary(values),
        dateTime: new Date().toISOString(),
      });
      Alert.alert('Saved', 'Calculation saved to your history.');
    } catch (e) {
      Alert.alert('Error', 'Could not save the calculation.');
    }
  };

  return (
    <ScreenContainer>
      <Text style={styles.sectionTitle}>Choose a tool</Text>
      {TOOLS.map((t) => (
        <ToolCard
          key={t.key}
          emoji={t.emoji}
          title={t.title}
          description={t.description}
          selected={t.key === selectedKey}
          onPress={() => selectTool(t.key)}
        />
      ))}

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>
          {tool.emoji} {tool.title}
        </Text>

        {tool.fields.map((f) => (
          <InputField
            key={f.key}
            label={f.label}
            unit={f.unit}
            value={values[f.key]}
            placeholder="0"
            onChangeText={(text) => updateField(f.key, text)}
          />
        ))}

        <AppButton title="Calculate" onPress={handleCalculate} variant="primary" />

        {result ? (
          <ResultCard
            text={result.ok ? result.text : result.error}
            type={result.ok ? 'success' : 'error'}
          />
        ) : null}

        <View style={styles.actionRow}>
          <AppButton
            title="Save Result"
            onPress={handleSave}
            variant="accent"
            disabled={!result || !result.ok}
            style={styles.actionButton}
          />
          <AppButton
            title="Reset"
            onPress={handleReset}
            variant="neutral"
            style={styles.actionButton}
          />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: 10,
  },
  panel: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginTop: 8,
  },
  panelTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 16,
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
});
