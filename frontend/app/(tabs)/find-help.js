import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { userService } from '../../services/userService';
import { colors } from '../../theme/colors';

const HelperCard = ({ helper, router }) => (
    <TouchableOpacity
        style={styles.card}
        onPress={() => router.push({ pathname: '/chat', params: { userName: helper.name, chatId: `chat-with-${helper.id}` }})}
    >
        <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
                <View style={styles.avatar}><Text style={styles.avatarText}>{helper.avatar}</Text></View>
                <View style={styles.headerText}>
                    <Text style={styles.helperName}>{helper.name}</Text>
                    <Text style={styles.helpCount}>{helper.helps} ajudas realizadas</Text>
                </View>
            </View>
            <Text style={styles.subjectsTitle}>Ajuda em:</Text>
            <Text style={styles.subjectsText} numberOfLines={2}>{helper.subjects.join(', ')}</Text>
        </View>

        <View style={styles.arrowIconContainer}>
            <Ionicons name="chevron-forward-outline" size={24} color={colors.textSecondary} />
        </View>
    </TouchableOpacity>
);


export default function FindHelpScreen() {
    const router = useRouter();
    const [allSubjects, setAllSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState('');
    const [helpers, setHelpers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);

    useEffect(() => {
        const fetchSubjects = async () => {
            const subjects = await userService.getAllSubjects();
            setAllSubjects(subjects);
        };
        fetchSubjects();
    }, []);

    useEffect(() => {
        if (selectedSubject) {
            setLoading(true);
            const fetchHelpers = async () => {
                const result = await userService.findHelpersBySubject(selectedSubject);
                setHelpers(result);
                setLoading(false);
            };
            fetchHelpers();
        } else {
            setHelpers([]);
        }
    }, [selectedSubject]);

    const handleSelectSubject = (subject) => {
        setSelectedSubject(subject);
        setIsDropdownVisible(false);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Selecione a disciplina:</Text>

            <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setIsDropdownVisible(!isDropdownVisible)}
            >
                <Text style={styles.dropdownText}>{selectedSubject || 'Selecione uma disciplina'}</Text>
                <Ionicons name={isDropdownVisible ? "chevron-up" : "chevron-down"} size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            {isDropdownVisible && (
                <View style={styles.dropdownListContainer}>
                    <FlatList
                        data={allSubjects}
                        keyExtractor={(item) => item}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.dropdownItem}
                                onPress={() => handleSelectSubject(item)}
                            >
                                <Text style={styles.dropdownItemText}>{item}</Text>
                            </TouchableOpacity>
                        )}
                        ItemSeparatorComponent={() => <View style={styles.separator} />}
                    />
                </View>
            )}
            
            {selectedSubject && !isDropdownVisible && (
                <>
                    <Text style={styles.resultsTitle}>Pessoas disponíveis para ajudar em {selectedSubject}</Text>
                    {loading ? (
                        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
                    ) : (
                        <FlatList
                            data={helpers}
                            keyExtractor={item => item.id}
                            renderItem={({ item }) => <HelperCard helper={item} router={router} />}
                            ListEmptyComponent={<Text style={styles.emptyText}>Ninguém encontrado para esta disciplina.</Text>}
                            style={{ width: '100%' }}
                        />
                    )}
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        padding: 20,
        alignItems: 'center',
    },
    label: {
        color: colors.textSecondary,
        marginBottom: 5,
        width: '100%',
        textAlign: 'left',
    },
    dropdown: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.surface,
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        zIndex: 10,
    },
    dropdownText: {
        color: colors.text,
        fontSize: 16
    },
    dropdownListContainer: {
        width: '100%',
        maxHeight: 250,
        backgroundColor: colors.surface,
        borderRadius: 8,
        borderColor: colors.border,
        borderWidth: 1,
        position: 'absolute',
        top: 105,
        zIndex: 20,
    },
    dropdownItem: {
        padding: 15,
    },
    dropdownItemText: {
        color: colors.text,
        fontSize: 16,
    },
    separator: {
        height: 1,
        backgroundColor: colors.border,
    },
    resultsTitle: {
        width: '100%',
        color: colors.text,
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 15,
    },
    card: {
        width: '100%',
        backgroundColor: colors.surface,
        padding: 15,
        borderRadius: 12,
        marginBottom: 15,
        flexDirection: 'row', // Alinha conteúdo e seta lado a lado
        justifyContent: 'space-between', // Espaça o conteúdo e a seta
        alignItems: 'center', // Alinha verticalmente
    },
    cardContent: {
        flex: 1, // Permite que o conteúdo principal ocupe o espaço disponível
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10
    },
    avatarText: {
        color: colors.text,
        fontWeight: 'bold'
    },
    headerText: {
        flex: 1
    },
    helperName: {
        color: colors.text,
        fontSize: 16,
        fontWeight: 'bold'
    },
    helpCount: {
        color: colors.textSecondary,
        fontSize: 12
    },
    subjectsTitle: {
        color: colors.textSecondary,
        fontSize: 12,
        marginBottom: 5
    },
    subjectsText: {
        color: colors.text,
    },
    arrowIconContainer: {
        // Estilo para o container da seta, se necessário (ex: padding)
        paddingLeft: 10, // Adiciona um espaço entre o texto e a seta
    },
    emptyText: {
        color: colors.textSecondary,
        textAlign: 'center',
        marginTop: 50
    },
});