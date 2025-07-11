import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
// 1. Importar os componentes necessários para a responsividade
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View
} from 'react-native';
import AuthInput from '../../components/AuthInput';
import PrimaryButton from '../../components/PrimaryButton';
import { colors } from '../../theme/colors';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('joao@aluno.ifsp.edu.br');
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(false);

  // 2. Usar o hook para obter a largura e altura da tela dinamicamente
  const { width, height } = useWindowDimensions();

  const handleLogin = async () => {
    // ... (lógica de login permanece a mesma)
  };

  // 3. Criar estilos dinâmicos que dependem das dimensões da tela
  const logoSize = height * 0.12; // O logo terá 12% da altura da tela
  
  return (
    // 4. KeyboardAvoidingView ajusta a tela quando o teclado aparece
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingContainer}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* 5. ScrollView garante que a tela role em dispositivos pequenos ou na horizontal */}
      <ScrollView contentContainerStyle={styles.container}>
        <View style={[styles.card, { maxWidth: 450 }]}>
            <View style={[styles.logoContainer, { width: logoSize, height: logoSize, borderRadius: logoSize / 2 }]}>
                <Ionicons name="school" size={logoSize * 0.6} color={colors.primary} />
            </View>
            <Text style={[styles.title, { fontSize: 26 }]}>iFocus</Text>
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
          
          <TouchableOpacity onPress={() => router.push('/register')}>
            <Text style={styles.linkText}>
              Não tem uma conta? <Text style={styles.link}>Criar conta</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
    keyboardAvoidingContainer: {
        flex: 1,
        backgroundColor: colors.background,
    },
    container: {
        flexGrow: 1, // Permite que o conteúdo cresça
        justifyContent: 'center',
        alignItems: 'center',
        padding: 17,
    },
    card: {
      width: '100%', // O card ocupa toda a largura disponível...
      // mas nunca passará de 450px, o que melhora a aparência em tablets
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      padding: 20,
      borderColor: colors.border,
      alignItems: 'center'
    },
    logoContainer: {
        // As dimensões agora são dinâmicas, aplicadas inline
        backgroundColor: colors.surface,
        justifyContent: 'center',
        alignItems: 'center'
    },
    title: {
        // O fontSize agora é dinâmico, aplicado inline
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: 30,
    },
    linkText: {
        color: colors.textSecondary,
        marginTop: 20,
    },
    link: {
        color: colors.primary,
        fontWeight: 'bold',
    },
});