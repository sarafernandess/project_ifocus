// app/(auth)/_layout.js
import { Stack } from 'expo-router';

// Este layout envolve apenas as telas de login e registro.
export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}