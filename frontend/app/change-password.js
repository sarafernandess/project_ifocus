import { Stack, useRouter } from 'expo-router'; // 1. Importar
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import AuthInput from '../components/AuthInput';
import PrimaryButton from '../components/PrimaryButton';
import { userService } from '../services/userService';
import { colors } from '../theme/colors';

export default function ChangePasswordScreen() {
    const router = useRouter(); // 2. Inicializar
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (newPassword.length < 6) {
            Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres.');
            return;
        }
        if (newPassword !== confirmPassword) {
            Alert.alert('Erro', 'As senhas não coincidem.');
            return;
        }
        setLoading(true);
        const response = await userService.updatePassword(newPassword);
        setLoading(false);
        if (response.success) {
            Alert.alert('Sucesso', 'Sua senha foi alterada.', [{ text: 'OK', onPress: () => router.back() }]); // 3. Voltar
        } else {
            Alert.alert('Erro', 'Não foi possível alterar a senha.');
        }
    };

    return (
        <>
            {/* 4. Definir o título do cabeçalho para esta rota específica */}
            <Stack.Screen options={{ title: "Alterar Senha" }} />
            <View style={styles.container}>
                <Text style={styles.label}>Nova Senha</Text>
                <AuthInput 
                    placeholder="Digite a nova senha"
                    secureTextEntry
                    value={newPassword}
                    onChangeText={setNewPassword}
                />
                <Text style={styles.label}>Confirmar Nova Senha</Text>
                <AuthInput 
                    placeholder="Confirme a nova senha"
                    secureTextEntry
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                />
                <PrimaryButton title="Salvar Nova Senha" onPress={handleSave} disabled={loading} style={{marginTop: 20}} />
            </View>
        </>
    );
};
// ... (estilos permanecem os mesmos)
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, padding: 20 },
    label: { color: colors.textSecondary, fontSize: 14, marginBottom: 5, marginTop: 10 },
});