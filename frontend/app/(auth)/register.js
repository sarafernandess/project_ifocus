import { useRouter } from 'expo-router';
import React, { useState } from 'react';
// 1. Importar componentes de layout e o hook de dimensões
import {
  Alert,
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
import { authService } from '../../services/authService';
import { colors } from '../../theme/colors';

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // 2. Obter as dimensões da tela dinamicamente
  const { width } = useWindowDimensions();

  const handleRegister = async () => {
    // ... (lógica de cadastro permanece a mesma)
    if (!name || !email || !password) {
      Alert.alert('Erro', 'Todos os campos são obrigatórios.');
      return;
    }
    setLoading(true);
    const response = await authService.register(name, email, password);
    setLoading(false);
    if (response.success) {
      router.replace('/(tabs)');
    } else {
      Alert.alert('Falha no Cadastro', response.error);
    }
  };

  return (
    // 4. Envolver a tela com KeyboardAvoidingView e ScrollView
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingContainer}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={[styles.card, { maxWidth: 450 }]}>
          {/* <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity> */}
          <Text style={[styles.title, { fontSize: 26 }]}>Criar Conta</Text>
          <Text style={styles.subtitle}>Junte-se à comunidade de estudantes do iFocus</Text>
          
          <AuthInput icon="person-outline" placeholder="Seu nome completo" value={name} onChangeText={setName} />
          <AuthInput icon="mail-outline" placeholder="seu.nome@aluno.ifsp.edu.br" value={email} onChangeText={setEmail} keyboardType="email-address" />
          <Text style={styles.subtitle2}>Use seu email institucional do IFSP (@aluno.ifsp.edu.br)</Text>
          <AuthInput icon="lock-closed-outline" placeholder="Escolha uma senha segura" value={password} onChangeText={setPassword} secureTextEntry />
          
          <PrimaryButton title="Criar Conta" onPress={handleRegister} disabled={loading} />
          
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.linkText}>
              Já tem uma conta? <Text style={styles.link}>Fazer login</Text>
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
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 17,
    },
    card: {
      width: '100%',
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      padding: 20,
      borderColor: colors.border,
      alignItems: 'center'
    },
    // backButton: {
    //     // 5. Ajuste no posicionamento do botão para ser relativo ao card
    //     position: 'absolute',
    //     top: -170,
    //     left: 20,
    //     zIndex: 1,
    // },
    title: {
        // O fontSize agora é dinâmico e aplicado inline
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: 30,
        marginTop: 10, // Espaço extra para não sobrepor o botão de voltar
    },
    subtitle2: {
      fontSize: 12,
      alignSelf: 'flex-start',
      marginBottom: 10,
      color: colors.textSecondary,
    },
    linkText: {
        color: colors.textSecondary,
        marginTop: 20,
        textAlign: 'center',
    },
    link: {
        color: colors.primary,
        fontWeight: 'bold',
    },
});