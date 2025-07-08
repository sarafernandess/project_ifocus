import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router'; // 1. Importar
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import PrimaryButton from '../../components/PrimaryButton';
import { userService } from '../../services/userService';
import { colors } from '../../theme/colors';

// O componente HelperCard agora usa o router passado como prop
const HelperCard = ({ helper, router }) => (
    <View style={styles.card}>
        <View style={styles.cardHeader}>
            <View style={styles.avatar}><Text style={styles.avatarText}>{helper.avatar}</Text></View>
            <View style={styles.headerText}>
                <Text style={styles.helperName}>{helper.name}</Text>
                <Text style={styles.helpCount}>{helper.helps} ajudas realizadas</Text>
            </View>
        </View>
        <Text style={styles.subjectsTitle}>Ajuda em:</Text>
        <Text style={styles.subjectsText}>{helper.subjects.join(', ')}</Text>
        <PrimaryButton 
            title="Iniciar Conversa"
            // 2. Usar router.push com pathname e params
            onPress={() => router.push({ pathname: '/chat', params: { userName: helper.name, chatId: `chat-with-${helper.id}` }})}
        />
    </View>
);

export default function FindHelpScreen() {
    const router = useRouter(); // 3. Inicializar o router aqui
    const [allSubjects, setAllSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState('Desenvolvimento Web');
    const [helpers, setHelpers] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Lógica para buscar disciplinas e ajudantes (permanece a mesma)
        const fetchSubjects = async () => {
            const subjects = await userService.getAllSubjects();
            setAllSubjects(subjects);
        };
        fetchSubjects();
    }, []);

    useEffect(() => {
        const fetchHelpers = async () => {
            if (selectedSubject) {
                setLoading(true);
                const result = await userService.findHelpersBySubject(selectedSubject);
                setHelpers(result);
                setLoading(false);
            }
        };
        fetchHelpers();
    }, [selectedSubject]);

    // Componente mockado para o dropdown (a lógica real pode ser mais complexa)
    const SubjectDropdown = () => (
        <View style={styles.dropdown}>
            <Text style={styles.dropdownText}>{selectedSubject || 'Selecione uma disciplina'}</Text>
            <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Selecione a disciplina:</Text>
            <SubjectDropdown />

            <Text style={styles.resultsTitle}>Pessoas disponíveis para ajudar em {selectedSubject}</Text>
            
            {loading ? (
                <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={helpers}
                    keyExtractor={item => item.id}
                    // 4. Passar o router para o componente do item
                    renderItem={({ item }) => <HelperCard helper={item} router={router} />}
                    ListEmptyComponent={<Text style={styles.emptyText}>Ninguém encontrado para esta disciplina.</Text>}
                />
            )}
        </View>
    );
};
// ... (estilos permanecem os mesmos)
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, padding: 20 },
    label: { color: colors.textSecondary, marginBottom: 5 },
    dropdown: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surface, padding: 15, borderRadius: 8, marginBottom: 20 },
    dropdownText: { color: colors.text, fontSize: 16 },
    resultsTitle: { color: colors.text, fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
    card: { backgroundColor: colors.surface, padding: 15, borderRadius: 12, marginBottom: 15 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
    avatarText: { color: colors.text, fontWeight: 'bold' },
    headerText: { flex: 1 },
    helperName: { color: colors.text, fontSize: 16, fontWeight: 'bold' },
    helpCount: { color: colors.textSecondary, fontSize: 12 },
    subjectsTitle: { color: colors.textSecondary, fontSize: 12, marginBottom: 5 },
    subjectsText: { color: colors.text, marginBottom: 15 },
    emptyText: { color: colors.textSecondary, textAlign: 'center', marginTop: 50 },
});