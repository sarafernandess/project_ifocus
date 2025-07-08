import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router'; // 1. Importar
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AuthInput from '../../components/AuthInput';
import PrimaryButton from '../../components/PrimaryButton';
import { authService } from '../../services/authService';
import { colors } from '../../theme/colors';

export default function RegisterScreen() {
  const router = useRouter(); // 2. Inicializar
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Erro', 'Todos os campos são obrigatórios.');
      return;
    }
    setLoading(true);
    const response = await authService.register(name, email, password);
    setLoading(false);
    if (response.success) {
      // 3. Navegar para o app principal
      router.replace('/(tabs)');
    } else {
      Alert.alert('Falha no Cadastro', response.error);
    }
  };

  return (
    <View style={styles.container}>
      {/* 4. Voltar para a tela anterior (login) */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color={colors.text} />
      </TouchableOpacity>
      <Text style={styles.title}>Criar Conta</Text>
      <Text style={styles.subtitle}>Junte-se à comunidade de estudantes do iFocus</Text>
      
      <AuthInput icon="person-outline" placeholder="Seu nome completo" value={name} onChangeText={setName} />
      <AuthInput icon="mail-outline" placeholder="seu.nome@aluno.ifsp.edu.br" value={email} onChangeText={setEmail} keyboardType="email-address" />
      <AuthInput icon="lock-closed-outline" placeholder="Escolha uma senha segura" value={password} onChangeText={setPassword} secureTextEntry />
      
      <PrimaryButton title="Criar Conta" onPress={handleRegister} disabled={loading} />
      
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.linkText}>
          Já tem uma conta? <Text style={styles.link}>Fazer login</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
};
// ... (estilos permanecem os mesmos)
const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: colors.background, },
    backButton: { position: 'absolute', top: 60, left: 20, zIndex: 1, },
    title: { fontSize: 32, fontWeight: 'bold', color: colors.text, marginBottom: 10, textAlign: 'center', },
    subtitle: { fontSize: 16, color: colors.textSecondary, textAlign: 'center', marginBottom: 30, },
    linkText: { color: colors.textSecondary, marginTop: 20, textAlign: 'center', },
    link: { color: colors.primary, fontWeight: 'bold', },
});