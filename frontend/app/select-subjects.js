import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import PrimaryButton from '../components/PrimaryButton';
import { userService } from '../services/userService';
import { colors } from '../theme/colors';

export default function SelectSubjectsScreen() {
    const router = useRouter();
    const [allSubjects, setAllSubjects] = useState([]);
    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
        try {
            const [subjectsData, userData] = await Promise.all([
            userService.getAllSubjects(),
            userService.getUserProfile(),
            ]);
            setAllSubjects(subjectsData);
            setSelectedSubjects(Array.isArray(userData?.helping_subjects) ? userData.helping_subjects : []);
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível carregar as disciplinas.');
        } finally {
            setLoading(false);
        }
        };
        fetchData();
    }, []);

    const toggleSubject = (subject) => {
        setSelectedSubjects(prev => 
            prev.includes(subject) ? prev.filter(s => s !== subject) : [...prev, subject]
        );
    };

    const handleSaveChanges = async () => {
        try {
            setLoading(true);
            await userService.updateUserSubjects(selectedSubjects);
            Alert.alert('Sucesso', 'Suas disciplinas foram atualizadas.');
            if (router.canGoBack()) router.back();
        } catch (e) {
            Alert.alert('Erro', 'Não foi possível salvar as alterações.');
        } finally {
            setLoading(false);
        }
    };


    if (loading && allSubjects.length === 0) {
        return <View style={styles.centered}><ActivityIndicator size="large" color={colors.primary} /></View>;
    }

    return (
        <View style={{flex: 1, backgroundColor: colors.background}}>
            <ScrollView style={styles.container}>
                <Text style={styles.title}>Escolha suas disciplinas</Text>
                <Text style={styles.subtitle}>Selecione as matérias que você pode ajudar.</Text>
                {allSubjects.map(subject => (
                    <TouchableOpacity key={subject} style={styles.subjectItem} onPress={() => toggleSubject(subject)}>
                        <Ionicons 
                            name={selectedSubjects.includes(subject) ? 'checkbox' : 'square-outline'}
                            size={24}
                            color={selectedSubjects.includes(subject) ? colors.primary : colors.textSecondary}
                        />
                        <Text style={styles.subjectText}>{subject}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
            <View style={styles.buttonContainer}>
                <PrimaryButton title="Salvar Disciplinas" onPress={handleSaveChanges} disabled={loading} />
            </View>
        </View>
    );
};
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 20 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
    title: { fontSize: 24, fontWeight: 'bold', color: colors.text, marginVertical: 10, marginTop: 20 },
    subtitle: { fontSize: 16, color: colors.textSecondary, marginBottom: 20 },
    subjectItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: colors.border },
    subjectText: { color: colors.text, fontSize: 16, marginLeft: 15, flex: 1 },
    buttonContainer: { padding: 20, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface },
});