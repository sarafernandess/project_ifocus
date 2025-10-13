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
import { loginSchema } from '../../utils/validationSchemas';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Novos estados para validação e visibilidade da senha
  const [errors, setErrors] = useState({});
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const { width, height } = useWindowDimensions();
  const logoSize = height * 0.12;

  const handleLogin = async () => {
    // Lógica de validação com Yup
    try {
      setErrors({});
      await loginSchema.validate({ email, password }, { abortEarly: false });

      // Se a validação passar, continua
      setLoading(true);
      const response = await authService.login(email, password);
      setLoading(false);
      if (response.success) {
        router.replace('/(tabs)');
      } else {
        Alert.alert('Falha no Login', response.error);
      }
    } catch (err) {
      // Captura e define os erros de validação
      const newErrors = {};
      err.inner.forEach(error => {
        newErrors[error.path] = error.message;
      });
      setErrors(newErrors);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingContainer}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
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
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

          <AuthInput
            icon="lock-closed-outline"
            placeholder="Sua senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!isPasswordVisible}
            rightIconName={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
            onRightIconPress={() => setIsPasswordVisible(!isPasswordVisible)}
          />
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
          
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
    logoContainer: {
        backgroundColor: colors.surface,
        justifyContent: 'center',
        alignItems: 'center'
    },
    title: {
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
    errorText: {
        color: colors.secondary,
        fontSize: 12,
        alignSelf: 'flex-start',
        marginLeft: 5,
        marginTop: -5,
        marginBottom: 5,
    },
});