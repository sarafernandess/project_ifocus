import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router'; // 1. Importar
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import PrimaryButton from '../../components/PrimaryButton';
import { userService } from '../../services/userService';
import { colors } from '../../theme/colors';

export default function ProfileScreen() {
    const router = useRouter(); // 2. Inicializar
    const [user, setUser] = useState(null);
    const [name, setName] = useState('');
    
    useEffect(() => {
        const fetchProfile = async () => {
            const userData = await userService.getUserProfile();
            setUser(userData);
            setName(userData.name);
        };
        fetchProfile();
    }, []);

    const handleLogout = () => {
        Alert.alert(
            "Sair da Conta",
            "Você tem certeza que deseja sair?",
            [
                { text: "Cancelar", style: "cancel" },
                // 3. Navegar para a tela de login, limpando o histórico
                { text: "Sair", onPress: () => router.replace('/(auth)/login'), style: 'destructive' }
            ]
        );
    };

    return (
        <View style={styles.container}>
            {/* ... (código do cabeçalho do perfil) ... */}
            <View style={styles.profileHeader}>
                <View style={styles.avatar}><Text style={styles.avatarText}>{user?.avatar}</Text></View>
                <Text style={styles.userName}>{user?.name}</Text>
                <TouchableOpacity style={styles.editPhoto}><Ionicons name="camera-outline" size={16} color={colors.text} /><Text style={styles.editPhotoText}>Alterar Foto</Text></TouchableOpacity>
            </View>

            <View style={styles.infoSection}>
                {/* ... (código da seção de informações) ... */}
            </View>
            
            {/* 4. Navegar para uma nova rota para alterar senha */}
            <TouchableOpacity style={styles.optionButton} onPress={() => router.push('/profile/change-password')}>
                <Ionicons name="lock-closed-outline" size={20} color={colors.text} />
                <Text style={styles.optionText}>Alterar Senha</Text>
            </TouchableOpacity>

            <PrimaryButton title="Sair da Conta" color="secondary" onPress={handleLogout} style={{ marginTop: 20 }}/>
        </View>
    );
};
// ... (estilos permanecem os mesmos)
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, padding: 20 },
    profileHeader: { alignItems: 'center', backgroundColor: colors.surface, padding: 20, borderRadius: 12, marginBottom: 20 },
    avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
    avatarText: { color: colors.text, fontSize: 32, fontWeight: 'bold' },
    userName: { color: colors.text, fontSize: 22, fontWeight: 'bold' },
    editPhoto: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
    editPhotoText: { color: colors.textSecondary, marginLeft: 5 },
    infoSection: { backgroundColor: colors.surface, padding: 20, borderRadius: 12, marginBottom: 10 },
    optionButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, padding: 15, borderRadius: 8 },
    optionText: { color: colors.text, fontSize: 16, marginLeft: 10 },
});