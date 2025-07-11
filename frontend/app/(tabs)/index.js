import { Ionicons } from '@expo/vector-icons';
import { Link, useFocusEffect, useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { userService } from '../../services/userService';
import { colors } from '../../theme/colors';

// Dados mockados para as atividades recentes
const recentActivities = [
    {
        id: '1',
        icon1: 'chatbubble-ellipses-outline',
        title: 'Nova mensagem de Maria Santos',
        subtitle: 'Sobre dúvidas em Cálculo I',
        time: '2 min atrás'
    },
    {
        id: '2',
        icon2: 'people-outline',
        title: 'Alguém precisa de ajuda em Física',
        subtitle: 'Movimento uniformemente variado',
        time: '15 min atrás'
    },
    {
        id: '3',
        icon3: 'book-outline',
        title: 'Grupo de estudos criado',
        subtitle: 'Preparação para prova de Química',
        time: '1 hora atrás'
    }
];

export default function HomeScreen() {
    const router = useRouter();
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
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <Text style={styles.greeting}>Olá, {user?.name.split(' ')[0]}! 👋</Text>
            <Text style={styles.welcome}>Bem-vindo de volta ao iFocus</Text>

            {/* Card 1: Suas Disciplinas */}
            <View style={styles.card}>
                <View style={styles.cardFlexColumn}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="book-outline" size={24} color={colors.text} />
                        <Text style={styles.cardTitle}>Suas Disciplinas</Text>
                    </View>
                    <Text style={styles.cardSubtitle}>Disciplinas em que você está disposto a ajudar outros estudantes</Text>
                </View>
                <View style={styles.containerColumn}>
                    {user?.subjects && user.subjects.length > 0 ? (
                        <View style={styles.subjectsContainer}>
                            {user.subjects.map(subject => (
                                <View key={subject} style={styles.subjectBadge}>
                                    <Text style={styles.subjectBadgeText}>{subject}</Text>
                                </View>
                            ))}
                            <View style={styles.containerButton}>
                                <TouchableOpacity onPress={() => router.push('/select-subjects')}>
                                    <Text style={styles.manageLink}>Gerenciar Disciplinas</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <>
                            <Text style={styles.noSubjectsText}>Você ainda não adicionou disciplinas</Text>
                            <Link href="/select-subjects" asChild>
                                <TouchableOpacity style={styles.addButton}>
                                    <Ionicons name="add" size={20} color={colors.text} />
                                    <Text style={styles.addButtonText}>Adicionar Disciplinas</Text>
                                </TouchableOpacity>
                            </Link>
                        </>
                    )}
                </View>
            </View>

            {/* Card 2: Encontrar Ajuda */}
            <TouchableOpacity style={styles.card2} onPress={() => router.push('/(tabs)/find-help')}>
                <View style={styles.cardHeader2}>
                    <Ionicons name="people-outline" size={32} color={colors.primary} />
                    <Text style={styles.cardTitle2}>Encontrar Ajuda</Text>
                </View>
                <Text style={styles.cardSubtitle}>Conecte-se com colegas</Text>
            </TouchableOpacity>

            {/* Card 3: Atividades Recentes (NOVO) */}
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle3}>Atividades Recentes</Text>
                </View>
                <Text style={styles.cardSubtitle}>Suas últimas interações e notificações</Text>
                
                <View style={styles.activitiesContainer}>
                    {recentActivities.map((activity, index) => (
                        <View key={activity.id} style={[
                            styles.activityItem,
                            index < recentActivities.length - 1 && styles.activityItemBorder // Adiciona borda a todos, menos o último
                        ]}>
                            <View style={styles.activityIconContainer}>
                                <Ionicons name={activity.icon1} size={20} color={colors.primary} />
                                <Ionicons name={activity.icon2} size={20} color={colors.green} />
                                <Ionicons name={activity.icon3} size={20} color={colors.orange} />
                            </View>
                            <View style={styles.activityTextContainer}>
                                <Text style={styles.activityTitle}>{activity.title}</Text>
                                <Text style={styles.activitySubtitle}>{activity.subtitle}</Text>
                                <Text style={styles.activityTime}>{activity.time}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    contentContainer: {
        alignItems: 'center',
        padding: 20,
        width: '100%'
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
    greeting: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.text,
        width: '100%', // Garante que o texto ocupe a largura
    },
    welcome: {
        fontSize: 16,
        color: colors.textSecondary,
        marginBottom: 20,
        width: '100%', // Garante que o texto ocupe a largura
    },
    card: {
        width: '100%',
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: colors.border,
    },
    card2: {
        width: '98%',
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
    },
    cardFlexColumn: {
        marginBottom: 10,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cardHeader2: {
        flexDirection: 'column',
        alignItems: 'center',
    },
    cardTitle: {
        fontSize: 23,
        fontWeight: 'bold',
        color: colors.text,
        marginLeft: 10,
    },
    cardTitle2: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.text,
        marginTop: 5,
    },
    cardTitle3: {
        fontSize: 23,
        fontWeight: 'bold',
        color: colors.text,
    },
    cardSubtitle: {
        fontSize: 14,
        marginTop: 4,
        color: colors.textSecondary,
    },
    containerColumn: {
        marginTop: 15,
    },
    noSubjectsText: {
        color: colors.textSecondary,
        textAlign: 'center',
        marginVertical: 20,
    },
    addButton: {
        flexDirection: 'row',
        backgroundColor: colors.primary,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignSelf: 'center',
        alignItems: 'center',
    },
    addButtonText: {
        color: colors.text,
        fontWeight: 'bold',
        marginLeft: 5,
    },
    subjectsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
    },
    subjectBadge: {
        borderRadius: 9999,
        borderColor: colors.border_primary, 
        backgroundColor: colors.primary_transparent,
        borderWidth: 1,
        paddingVertical: 4,
        paddingHorizontal: 6,
        marginRight: 8,
        marginBottom: 8,
    },
    subjectBadgeText: {
        color: colors.primary,
        fontSize: 12,
        fontWeight: '500',
    },
    containerButton: {
        width: '100%',
        marginTop: 15,
        alignItems: 'center',
    },
    manageLink: {
        color: colors.text,
        fontWeight: '500',
    },
    // Estilos para o novo card de atividades
    activitiesContainer: {
        marginTop: 20,
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
    },
    activityItemBorder: {
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    activityIconContainer: {
        marginRight: 15,
    },
    activityTextContainer: {
        flex: 1,
    },
    activityTitle: {
        color: colors.text,
        fontSize: 15,
        fontWeight: '500',
        marginBottom: 2,
    },
    activitySubtitle: {
        color: colors.textSecondary,
        fontSize: 13,
    },
    activityTime: {
        color: colors.textSecondary,
        fontSize: 12,
        marginTop: 4,
    },
});