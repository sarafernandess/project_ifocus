import { Ionicons } from '@expo/vector-icons';
import { Link, useFocusEffect, useRouter } from 'expo-router'; // Importar hooks do router
import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { userService } from '../../services/userService';
import { colors } from '../../theme/colors';

export default function HomeScreen() {
    const router = useRouter(); // Inicializar o router
    const [user, setUser] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

    useFocusEffect(
        React.useCallback(() => {
            const fetchUserData = async () => {
                setLoading(true);
                const userData = await userService.getUserProfile();
                setUser(userData);
                setLoading(false);
            };
            fetchUserData();
        }, [])
    );
    
    if (loading) {
        return <View style={styles.centered}><ActivityIndicator size="large" color={colors.primary} /></View>;
    }

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.greeting}>Olá, {user?.name.split(' ')[0]}! 👋</Text>
            <Text style={styles.welcome}>Bem-vindo de volta ao iFocus</Text>
            
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Ionicons name="book-outline" size={24} color={colors.textSecondary} />
                    <Text style={styles.cardTitle}>Suas Disciplinas</Text>
                </View>
                <Text style={styles.cardSubtitle}>Disciplinas em que você está disposto a ajudar</Text>
                
                {user?.subjects && user.subjects.length > 0 ? (
                    <>
                        {user.subjects.map(subject => <Text key={subject} style={styles.subjectText}>{subject}</Text>)}
                        <TouchableOpacity onPress={() => router.push('/select-subjects')}>
                            <Text style={styles.manageLink}>Gerenciar Disciplinas</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <>
                        <Text style={styles.noSubjectsText}>Você ainda não adicionou disciplinas</Text>
                        {/* O componente Link é uma alternativa para navegação simples */}
                        <Link href="/select-subjects" asChild>
                            <TouchableOpacity style={styles.addButton}>
                                <Ionicons name="add" size={20} color={colors.text} />
                                <Text style={styles.addButtonText}>Adicionar Disciplinas</Text>
                            </TouchableOpacity>
                        </Link>
                    </>
                )}
            </View>

            <TouchableOpacity style={styles.card} onPress={() => router.push('/(tabs)/find-help')}>
                <View style={styles.cardHeader}>
                    <Ionicons name="people-outline" size={24} color={colors.primary} />
                    <Text style={styles.cardTitle}>Encontrar Ajuda</Text>
                </View>
                <Text style={styles.cardSubtitle}>Conecte-se com colegas</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};
// ... (estilos permanecem os mesmos)
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, padding: 20 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
    greeting: { fontSize: 28, fontWeight: 'bold', color: colors.text, },
    welcome: { fontSize: 16, color: colors.textSecondary, marginBottom: 20 },
    card: { backgroundColor: colors.surface, borderRadius: 12, padding: 20, marginBottom: 20 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
    cardTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text, marginLeft: 10 },
    cardSubtitle: { fontSize: 14, color: colors.textSecondary, marginBottom: 15 },
    noSubjectsText: { color: colors.textSecondary, textAlign: 'center', marginVertical: 20 },
    addButton: { flexDirection: 'row', backgroundColor: colors.primary, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, alignSelf: 'center', alignItems: 'center' },
    addButtonText: { color: colors.text, fontWeight: 'bold', marginLeft: 5 },
    subjectText: { color: colors.primary, fontSize: 16, marginBottom: 5 },
    manageLink: { color: colors.primary, marginTop: 10, fontWeight: 'bold', textAlign: 'center' },
});