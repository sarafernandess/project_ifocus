import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router'; // 1. Importar useRouter
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AuthInput from '../../components/AuthInput';
import PrimaryButton from '../../components/PrimaryButton';
import { authService } from '../../services/authService';
import { colors } from '../../theme/colors';

export default function LoginScreen() {
  const router = useRouter(); // 2. Inicializar o router
  const [email, setEmail] = useState('joao@aluno.ifsp.edu.br');
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }
    setLoading(true);
    const response = await authService.login(email, password);
    setLoading(false);
    if (response.success) {
      // 3. Navegar para as abas principais substituindo a rota de auth
      router.replace('/(tabs)');
    } else {
      Alert.alert('Falha no Login', response.error);
    }
  };

  return (
    <View style={styles.container}>
        <View style={styles.logoContainer}>
            <Ionicons name="school" size={60} color={colors.primary} />
        </View>
        <Text style={styles.title}>iFocus</Text>
        <Text style={styles.subtitle}>Entre na sua conta para colaborar com outros estudantes</Text>

      <AuthInput
        icon="mail-outline"
        placeholder="seu@email.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <AuthInput
        icon="lock-closed-outline"
        placeholder="Sua senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <PrimaryButton title="Entrar" onPress={handleLogin} disabled={loading} />
      
      {/* 4. Navegar para a tela de registro */}
      <TouchableOpacity onPress={() => router.push('/register')}>
        <Text style={styles.linkText}>
          Não tem uma conta? <Text style={styles.link}>Criar conta</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// ... (os estilos permanecem os mesmos)
const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: colors.background, },
    logoContainer: { width: 100, height: 100, borderRadius: 50, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', marginBottom: 20, },
    title: { fontSize: 32, fontWeight: 'bold', color: colors.text, marginBottom: 10, },
    subtitle: { fontSize: 16, color: colors.textSecondary, textAlign: 'center', marginBottom: 30, },
    linkText: { color: colors.textSecondary, marginTop: 20, },
    link: { color: colors.primary, fontWeight: 'bold', },
});