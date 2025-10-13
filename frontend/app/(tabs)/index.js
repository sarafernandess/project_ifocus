import { Ionicons } from '@expo/vector-icons';
import { Link, useFocusEffect, useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { userService } from '../../services/userService';
import { colors } from '../../theme/colors';

// Dados mockados para as atividades recentes
// const recentActivities = [
//     {
//         id: '1',
//         icon1: 'chatbubble-ellipses-outline',
//         title: 'Nova mensagem de Maria Santos',
//         subtitle: 'Sobre dúvidas em Cálculo I',
//         time: '2 min atrás'
//     },
//     {
//         id: '2',
//         icon2: 'people-outline',
//         title: 'Alguém precisa de ajuda em Física',
//         subtitle: 'Movimento uniformemente variado',
//         time: '15 min atrás'
//     },
//     {
//         id: '3',
//         icon3: 'book-outline',
//         title: 'Grupo de estudos criado',
//         subtitle: 'Preparação para prova de Química',
//         time: '1 hora atrás'
//     }
// ];

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
                    {user?.helping_subjects && user.helping_subjects.length > 0 ? (
                        <View style={styles.subjectsContainer}>
                            {user.helping_subjects.map(subject => (
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

            {/* Card 3: Atividades Recentes */}
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle3}>Atividades Recentes</Text>
                </View>
                <Text style={styles.cardSubtitle}>Sem atividades recentes</Text>

                {/* <View style={styles.activitiesContainer}>
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
                </View> */}
            </View>
        </ScrollView>
    );
}

const SP = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20 };
const RAD = { sm: 8, md: 12, pill: 9999 };
const BW = 1;

const baseCard = {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: RAD.md,
    padding: SP.xl,
    marginBottom: SP.xl,
    borderWidth: BW,
    borderColor: colors.border,
};

const baseTitle = {
    color: colors.text,
    fontWeight: 'bold',
};

const baseSubtitle = {
    color: colors.textSecondary,
    marginTop: SP.xs,
    fontSize: 14,
};

const baseCenter = {
    justifyContent: 'center',
    alignItems: 'center',
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    contentContainer: {
        alignItems: 'center',
        padding: SP.xl,
        width: '100%',
    },
    centered: {
        flex: 1,
        backgroundColor: colors.background,
        ...baseCenter,
    },

    greeting: {
        ...baseTitle,
        fontSize: 28,
        width: '100%',
    },
    welcome: {
        fontSize: 16,
        color: colors.textSecondary,
        marginBottom: SP.xl,
        width: '100%',
    },

    card: {
        ...baseCard,
    },
    card2: {
        ...baseCard,
        width: '98%',
        alignItems: 'center',
    },
    cardFlexColumn: {
        marginBottom: SP.md,
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
        ...baseTitle,
        fontSize: 23,
        marginLeft: SP.sm,
    },
    cardTitle2: {
        ...baseTitle,
        fontSize: 16,
        marginTop: SP.xs,
    },
    cardTitle3: {
        ...baseTitle,
        fontSize: 23,
    },
    cardSubtitle: {
        ...baseSubtitle,
    },

    // Seção de disciplinas
    containerColumn: {
        marginTop: SP.md,
    },
    noSubjectsText: {
        color: colors.textSecondary,
        textAlign: 'center',
        marginVertical: SP.lg,
    },
    addButton: {
        flexDirection: 'row',
        backgroundColor: colors.primary,
        paddingVertical: SP.sm + 2,
        paddingHorizontal: SP.lg + 4,
        borderRadius: RAD.sm,
        alignSelf: 'center',
        alignItems: 'center',
    },
    addButtonText: {
        color: colors.text,
        fontWeight: 'bold',
        marginLeft: SP.xs + 1,
    },

    subjectsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
    },
    subjectBadge: {
        borderRadius: RAD.pill,
        borderColor: colors.border_primary,
        backgroundColor: colors.primary_transparent,
        borderWidth: BW,
        paddingVertical: SP.xs,
        paddingHorizontal: SP.sm,
        marginRight: SP.sm,
        marginBottom: SP.sm,
    },
    subjectBadgeText: {
        color: colors.primary,
        fontSize: 12,
        fontWeight: '500',
    },
    containerButton: {
        width: '100%',
        marginTop: SP.md + 3,
        alignItems: 'center',
    },
    manageLink: {
        color: colors.text,
        fontWeight: '500',
    },

    // Atividades
    activitiesContainer: {
        marginTop: SP.xl,
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SP.lg - 1,
    },
    activityItemBorder: {
        borderBottomWidth: BW,
        borderBottomColor: colors.border,
    },
    activityIconContainer: {
        flexDirection: 'row',
        gap: SP.sm,
        marginRight: SP.md,
    },
    activityTextContainer: {
        flex: 1,
    },
    activityTitle: {
        color: colors.text,
        fontSize: 15,
        fontWeight: '500',
        marginBottom: SP.xs,
    },
    activitySubtitle: {
        color: colors.textSecondary,
        fontSize: 13,
    },
    activityTime: {
        color: colors.textSecondary,
        fontSize: 12,
        marginTop: SP.xs,
    },
});
