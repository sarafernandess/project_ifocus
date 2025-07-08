import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import AppNavigator from './navigation/AppNavigator'; // <-- Importa da pasta /navigation
import { darkColors } from './theme/colors';

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <AppNavigator />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: darkColors.background, // Cor de fundo principal
  },
});