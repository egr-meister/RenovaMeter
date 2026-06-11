import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import ScreenContainer from '../components/ScreenContainer';
import AppButton from '../components/AppButton';
import colors from '../theme/colors';
import {
  loadAppData,
  clearSavedCalculations,
  deleteSavedCalculation,
} from '../storage/appStorage';
import { formatDateTime } from '../utils/formatters';

export default function HistoryScreen() {
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(() => {
    let active = true;
    loadAppData().then((data) => {
      if (active) {
        setItems(data.savedCalculations);
        setLoaded(true);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  // Reload whenever the screen comes into focus.
  useFocusEffect(
    useCallback(() => {
      const cleanup = refresh();
      return cleanup;
    }, [refresh])
  );

  const handleClearAll = () => {
    if (items.length === 0) {
      return;
    }
    Alert.alert(
      'Clear History',
      'Delete all saved calculations? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            const data = await clearSavedCalculations();
            setItems(data.savedCalculations);
          },
        },
      ]
    );
  };

  const handleDelete = (id) => {
    Alert.alert('Delete', 'Delete this saved calculation?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const data = await deleteSavedCalculation(id);
          setItems(data.savedCalculations);
        },
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.toolName}>{item.toolName}</Text>
        <Text style={styles.date}>{formatDateTime(item.dateTime)}</Text>
      </View>
      <Text style={styles.resultText}>{item.resultText}</Text>
      {item.inputSummary ? (
        <Text style={styles.summary}>{item.inputSummary}</Text>
      ) : null}
      <AppButton
        title="Delete"
        variant="danger"
        onPress={() => handleDelete(item.id)}
        style={styles.deleteButton}
      />
    </View>
  );

  if (loaded && items.length === 0) {
    return (
      <ScreenContainer>
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyEmoji}>📭</Text>
          <Text style={styles.emptyText}>No saved calculations yet.</Text>
          <Text style={styles.emptyHint}>
            Use Renova Tools and tap “Save Result” to keep calculations here.
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scroll={false}>
      <View style={styles.wrapper}>
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            items.length > 0 ? (
              <AppButton
                title="Clear History"
                variant="danger"
                onPress={handleClearAll}
                style={styles.clearButton}
              />
            ) : null
          }
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    padding: 16,
  },
  listContent: {
    paddingBottom: 24,
  },
  clearButton: {
    marginBottom: 14,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  toolName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  date: {
    fontSize: 12,
    color: colors.textMuted,
  },
  resultText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  summary: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 12,
  },
  deleteButton: {
    marginTop: 4,
  },
  emptyWrap: {
    alignItems: 'center',
    marginTop: 80,
    paddingHorizontal: 24,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  emptyHint: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
  },
});
