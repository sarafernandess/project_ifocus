import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { userService } from '../../services/userService';
import { colors } from '../../theme/colors';

export default function ProfileScreen() {
    const router = useRouter();
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
                { text: "Sair", onPress: () => router.replace('/(auth)/login'), style: 'destructive' }
            ]
        );
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            {/* Cabeçalho do Perfil com Avatar */}
            <View style={styles.profileHeader}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{user?.avatar}</Text>
                    <TouchableOpacity style={styles.cameraIconContainer}>
                        <Ionicons name="camera" size={20} color={colors.text} />
                    </TouchableOpacity>
                </View>
                <Text style={styles.userName}>{user?.name}</Text>
                <TouchableOpacity style={styles.editPhotoButton}>
                    <Ionicons name="camera-outline" size={16} color={colors.text} />
                    <Text style={styles.editPhotoText}>Alterar Foto</Text>
                </TouchableOpacity>
            </View>

            {/* Seção de Informações Pessoais (NOVO) */}
            <View style={styles.infoSection}>
                <View style={styles.sectionHeader}>
                    <Ionicons name="person-outline" size={22} color={colors.text} />
                    <Text style={styles.sectionTitle}>Informações Pessoais</Text>
                </View>

                <Text style={styles.label}>Nome</Text>
                <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Seu nome"
                    placeholderTextColor={colors.textSecondary}
                />

                <Text style={styles.label}>Email</Text>
                <View style={styles.emailContainer}>
                    <Ionicons name="mail-outline" size={20} color={colors.textSecondary} style={styles.emailIcon} />
                    <Text style={styles.emailText}>{user?.email}</Text>
                </View>
            </View>
            
            {/* Botão Alterar Senha */}
            <TouchableOpacity style={styles.optionButton} onPress={() => router.push('/change-password')}>
                <Ionicons name="lock-closed-outline" size={18} color={colors.text} />
                <Text style={styles.optionText}>Alterar Senha</Text>
            </TouchableOpacity>

            {/* Botão Sair da Conta */}
            <TouchableOpacity
                style={[styles.logoutButton, { width: '100%' }]}
                onPress={handleLogout}
            >
                <Ionicons name="log-out-outline" size={20} color={colors.text} />
                <Text style={styles.logoutButtonText}>Sair da Conta</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    contentContainer: {
        padding: 20,
    },
    profileHeader: {
        alignItems: 'center',
        backgroundColor: colors.surface,
        padding: 20,
        borderRadius: 12,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: colors.border,
    },
    avatar: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        position: 'relative', // Necessário para posicionar o ícone da câmera
    },
    avatarText: {
        color: colors.text,
        fontSize: 36,
        fontWeight: 'bold',
    },
    cameraIconContainer: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: colors.surface,
        padding: 6,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: colors.border,
    },
    userName: {
        color: colors.text,
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    editPhotoButton: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 50,
    },
    editPhotoText: {
        color: colors.textSecondary,
        marginLeft: 8,
    },
    infoSection: {
        backgroundColor: colors.surface,
        padding: 20,
        borderRadius: 12,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: colors.border,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    sectionTitle: {
        color: colors.text,
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    label: {
        color: colors.textSecondary,
        fontSize: 14,
        marginBottom: 8,
    },
    input: {
        backgroundColor: colors.background,
        color: colors.text,
        padding: 12,
        borderRadius: 8,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: colors.border,
        fontSize: 16,
    },
    emailContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border,
    },
    emailIcon: {
        marginRight: 10,
    },
    emailText: {
        color: colors.textSecondary, // Cor mais escura para indicar que não é editável
        fontSize: 16,
    },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.surface,
        padding: 15,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border,
    },
    optionText: {
        color: colors.text,
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.secondary, // A cor vermelha para "sair"
        padding: 15,
        borderRadius: 8,
        marginTop: 15,
    },
    logoutButtonText: {
        color: colors.text,
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8, // Espaço entre o ícone e o texto
    },
});