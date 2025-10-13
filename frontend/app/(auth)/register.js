import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
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
import { registerSchema } from '../../utils/validationSchemas';

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  // 2. Criar um estado para armazenar os erros de validação
  const [errors, setErrors] = useState({});

  const { width } = useWindowDimensions();

  const handleRegister = async () => {
    try {
      // 3. Limpa erros antigos e valida os dados atuais com o Yup
      setErrors({}); // Limpa os erros antes de cada tentativa
      await registerSchema.validate({ name, email, password }, { abortEarly: false });
      
      // Se a validação passar, continua com a lógica de registro
      setLoading(true);
      const response = await authService.register(name, email, password);
      setLoading(false);
      
      if (response.success) {
        router.replace('/(tabs)');
      } else {
        // Exibe erros vindos do backend/Firebase (ex: e-mail já em uso)
        Alert.alert('Erro no Cadastro', response.error);
      }

    } catch (err) {
      // 4. Se a validação do Yup falhar, captura os erros
      if (err.inner) {
        const newErrors = {};
        err.inner.forEach(error => {
          newErrors[error.path] = error.message;
        });
        setErrors(newErrors);
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingContainer}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={[styles.card, { maxWidth: 450 }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { fontSize: 26 }]}>Criar Conta</Text>
          <Text style={styles.subtitle}>Junte-se à comunidade de estudantes do iFocus</Text>
          
          <AuthInput icon="person-outline" placeholder="Seu nome completo" value={name} onChangeText={setName} />
          {/* 5. Exibir a mensagem de erro para o campo 'name' */}
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          
          <AuthInput icon="mail-outline" placeholder="seu.nome@aluno.ifsp.edu.br" value={email} onChangeText={setEmail} keyboardType="email-address" />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          
          <AuthInput icon="lock-closed-outline" placeholder="Escolha uma senha segura" value={password} onChangeText={setPassword} secureTextEntry />
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
          
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
    paddingTop: 40,
    borderColor: colors.border,
    alignItems: 'center',
    position: 'relative',
  },
  backButton: {
      position: 'absolute',
      top: 20,
      left: 20,
      zIndex: 1,
  },
  title: {
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
  errorText: {
      color: colors.secondary,
      fontSize: 12,
      alignSelf: 'flex-start',
      marginLeft: 5,
      marginTop: -5,
      marginBottom: 5,
  },
});