import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import chatService from '../../services/chatService';
import { auth } from '../../services/firebaseConfig';
import { userService } from '../../services/userService';
import { colors } from '../../theme/colors';

const HelperCard = ({ helper, onStartChat }) => (
  <TouchableOpacity style={styles.card} onPress={() => onStartChat(helper)}>
    <View style={styles.cardContent}>
      <View style={styles.cardHeader}>
        {helper.avatarUrl ? (
          <Image source={{ uri: helper.avatarUrl }} style={styles.avatarImg} />
        ) : (
          <View style={styles.avatar}><Text style={styles.avatarText}>{helper.avatar}</Text></View>
        )}
        <View style={styles.headerText}>
          <Text style={styles.helperName}>{helper.name}</Text>
          {!!helper.helps && <Text style={styles.helpCount}>{helper.helps} ajudas realizadas</Text>}
        </View>
      </View>
      <Text style={styles.subjectsTitle}>Ajuda em:</Text>
      <Text style={styles.subjectsText} numberOfLines={2}>
        {Array.isArray(helper.subjects) ? helper.subjects.join(', ') : '—'}
      </Text>
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
  const [startingChatId, setStartingChatId] = useState(null);

  // carrega disciplinas
  useEffect(() => {
    (async () => {
      try {
        const subjects = await userService.getAllSubjects();
        setAllSubjects(Array.isArray(subjects) ? subjects : []);
      } catch (e) {
        console.error(e);
        Alert.alert('Erro', 'Falha ao carregar disciplinas.');
      }
    })();
  }, []);

  // busca ajudantes ao escolher disciplina
  useEffect(() => {
    (async () => {
      if (!selectedSubject) {
        setHelpers([]);
        return;
      }
      setLoading(true);
      try {
        const result = await userService.findHelpersBySubject(selectedSubject);
        setHelpers(Array.isArray(result) ? result : []);
      } catch (e) {
        console.error(e);
        Alert.alert('Erro', 'Falha ao carregar estudantes ajudantes.');
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedSubject]);

  const handleSelectSubject = (subject) => {
    setSelectedSubject(subject);
    setIsDropdownVisible(false);
  };

  const handleStartChat = useCallback(async (helper) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser?.uid) {
        Alert.alert('Atenção', 'Você precisa estar logado para iniciar um chat.');
        return;
      }
  
      const otherUid = String(helper.uid || helper.id);
      if (!otherUid) {
        Alert.alert('Erro', 'Usuário selecionado sem UID válido.');
        return;
      }
      if (otherUid === String(currentUser.uid)) {
        Alert.alert('Ops', 'Você não pode iniciar um chat consigo mesmo.');
        return;
      }
  
      setStartingChatId(otherUid);
  
      const chatId = await chatService.createOrGetChat(otherUid);
      if (!chatId) {
        Alert.alert('Erro', 'Não foi possível iniciar a conversa.');
        return;
      }
  
      router.push({
        pathname: '/chat',
        params: { userName: helper.name, chatId, otherUserId: otherUid },
      });
    } catch (e) {
      console.error('createOrGetChat error', e?.response?.data || e);
      Alert.alert('Erro', e?.response?.data?.detail || 'Falha ao iniciar o chat.');
    } finally {
      setStartingChatId(null);
    }
  }, [router]);
  

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
            keyExtractor={(item) => String(item)}
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
          <Text style={styles.resultsTitle}>
            Pessoas disponíveis para ajudar em {selectedSubject}
          </Text>

          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
          ) : (
            <FlatList
              data={helpers}
              keyExtractor={(item) => String(item.uid || item.id)}
              renderItem={({ item }) => (
                <View>
                  <HelperCard helper={item} onStartChat={handleStartChat} />
                  {startingChatId === (item.uid || item.id) && (
                    <View style={{ alignItems: 'center', marginBottom: 10 }}>
                      <ActivityIndicator size="small" color={colors.primary} />
                    </View>
                  )}
                </View>
              )}
              style={{ width: '100%' }}
              ListEmptyComponent={
                <Text style={styles.emptyText}>
                  Não encontramos estudantes para <Text style={{ fontWeight: 'bold', color: colors.text }}>{selectedSubject}</Text>.
                  Tente outra disciplina ou volte mais tarde.
                </Text>
              }
            />
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: colors.background, padding: 20, alignItems: 'center',
  },
  label: {
    color: colors.textSecondary, marginBottom: 5, width: '100%', textAlign: 'left',
  },
  dropdown: {
    width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: colors.surface, padding: 15, borderRadius: 8, marginBottom: 10, zIndex: 10,
  },
  dropdownText: { color: colors.text, fontSize: 16 },
  dropdownListContainer: {
    width: '100%', maxHeight: 250, backgroundColor: colors.surface, borderRadius: 8,
    borderColor: colors.border, borderWidth: 1, position: 'absolute', top: 105, zIndex: 20,
  },
  dropdownItem: { padding: 15 },
  dropdownItemText: { color: colors.text, fontSize: 16 },
  separator: { height: 1, backgroundColor: colors.border },
  resultsTitle: {
    width: '100%', color: colors.text, fontSize: 18, fontWeight: 'bold', marginTop: 10, marginBottom: 15,
  },
  card: {
    width: '100%', backgroundColor: colors.surface, padding: 15, borderRadius: 12, marginBottom: 15,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  cardContent: { flex: 1 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatarImg: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  avatar: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center', marginRight: 10,
  },
  avatarText: { color: colors.text, fontWeight: 'bold' },
  headerText: { flex: 1 },
  helperName: { color: colors.text, fontSize: 16, fontWeight: 'bold' },
  helpCount: { color: colors.textSecondary, fontSize: 12 },
  subjectsTitle: { color: colors.textSecondary, fontSize: 12, marginBottom: 5 },
  subjectsText: { color: colors.text },
  arrowIconContainer: { paddingLeft: 10 },
  emptyText: { color: colors.textSecondary, textAlign: 'center', marginTop: 50 },
});
