import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import colors from '../theme/colors';
import HomeScreen from '../screens/HomeScreen';
import BasicCalculatorScreen from '../screens/BasicCalculatorScreen';
import RenovaToolsScreen from '../screens/RenovaToolsScreen';
import HistoryScreen from '../screens/HistoryScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: colors.textOnPrimary,
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'RenovaMeter' }}
        />
        <Stack.Screen
          name="BasicCalculator"
          component={BasicCalculatorScreen}
          options={{ title: 'Basic Calculator' }}
        />
        <Stack.Screen
          name="RenovaTools"
          component={RenovaToolsScreen}
          options={{ title: 'Renova Tools' }}
        />
        <Stack.Screen
          name="History"
          component={HistoryScreen}
          options={{ title: 'Saved Calculations' }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ title: 'Settings' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
