// app/_layout.js
import { Stack } from 'expo-router';
import { darkColors as colors } from '../theme/colors';

// Este é o navegador principal. Ele decide se mostra as telas de auth ou as telas de abas.
export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface, },
        headerTintColor: colors.text,
        contentStyle: { backgroundColor: colors.background }
      }}
    >
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="chat" options={{ title: 'Chat' }} />
      <Stack.Screen
        name="select-subjects"
        options={{ title: 'Selecionar Disciplinas', presentation: 'modal' }}
      />
    </Stack>
  );
}