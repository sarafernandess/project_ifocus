// tabs/chats.js
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import chatService from '../../services/chatService';
import { auth } from '../../services/firebaseConfig';
import { userService } from '../../services/userService';
import { colors } from '../../theme/colors';

const formatTime = (ms) => {
  if (!ms) return '—';
  const d = new Date(ms);
  // mostra só hora:min; ajuste se quiser data quando for outro dia
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// normaliza a última mensagem para rótulos amigáveis
const presentLastMessage = (raw) => {
  if (!raw) return '';
  const s = String(raw).toLowerCase();
  if (s === 'foto' || s.startsWith('[foto]')) return 'Foto';
  if (s === 'mídia' || s === 'midia' || s.startsWith('[mídia]') || s.startsWith('[midia]')) return 'Mídia';
  if (s === 'arquivo' || s.startsWith('[arquivo]')) return 'Arquivo';
  return raw; // texto normal
};

const ChatItem = ({ item, onPress }) => {
  const initial = (item.userName?.trim?.()[0] || item.otherUserId?.[0] || '?').toUpperCase();
  return (
    <TouchableOpacity style={styles.chatItem} onPress={onPress}>
      {item.avatarUrl ? (
        <Image source={{ uri: item.avatarUrl }} style={styles.avatarImg} />
      ) : (
        <View style={styles.avatar}><Text style={styles.avatarText}>{initial}</Text></View>
      )}

      <View style={styles.textContainer}>
        <Text style={styles.userName} numberOfLines={1} ellipsizeMode="tail">
          {item.userName || item.otherUserId}
        </Text>
        <Text style={styles.lastMessage} numberOfLines={1} ellipsizeMode="tail">
          {item.lastMessage || 'Sem mensagens ainda'}
        </Text>
      </View>

      <View style={styles.metaContainer}>
        <Text style={styles.time}>{formatTime(item.updated_at)}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default function ChatsListScreen() {
  const router = useRouter();
  const uid = auth.currentUser?.uid;

  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const mapServerChatToUI = useCallback((c) => {
    const participants = Array.isArray(c.participants) ? c.participants.map(String) : [];
    const otherUserId = participants.find(p => p !== String(uid)) || '';

    // aceita snake e camel
    const rawLast = c.last_message ?? c.lastMessage ?? '';
    const rawUpdated = c.updated_at ?? c.updatedAt ?? null;

    // 1) Mapeia para rótulo amigável
    let preview = presentLastMessage(rawLast);

    // 2) Fallback local:
    // se não veio last_message mas existe updated_at (ou seja, já houve atividade),
    // mostramos "Mensagem" para não aparecer "Sem mensagens ainda".
    if (!preview && rawUpdated) {
      preview = 'Mensagem';
    }

    return {
      id: String(c.id),
      otherUserId,
      userName: otherUserId,   // enriquecemos depois com o nome real
      avatarUrl: null,
      lastMessage: preview,
      last_sender: c.last_sender ?? c.lastSender ?? null,
      updated_at: rawUpdated || null,
    };
  }, [uid]);

  const enrichWithProfiles = useCallback(async (items) => {
    const uids = Array.from(new Set(items.map(i => i.otherUserId).filter(Boolean)));
    if (!uids.length) return items;
    const map = await userService.getPublicUsers(uids);
    return items.map(i => {
      const u = map[i.otherUserId] || {};
      return { ...i, userName: u.name || i.userName, avatarUrl: u.avatarUrl || null };
    });
  }, []);

  const fetchChats = useCallback(async () => {
    if (!uid) return;
    setLoading(true);
    setError(null);
    try {
      const data = await chatService.listConversations(uid);
      const arr = Array.isArray(data) ? data : [];
      // caso o backend ainda não ordene, garantimos aqui
      arr.sort((a, b) => ((b.updated_at ?? b.updatedAt ?? 0) - (a.updated_at ?? a.updatedAt ?? 0)));
      const base = arr.map(mapServerChatToUI);
      const enriched = await enrichWithProfiles(base);
      setChats(enriched);
    } catch (e) {
      console.error('Erro ao listar conversas:', e?.response?.data || e);
      setError(e?.response?.data?.detail || 'Falha ao carregar suas conversas.');
      setChats([]);
    } finally {
      setLoading(false);
    }
  }, [uid, mapServerChatToUI, enrichWithProfiles]);

  useFocusEffect(useCallback(() => { fetchChats(); }, [fetchChats]));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try { await fetchChats(); } finally { setRefreshing(false); }
  }, [fetchChats]);

  const openChat = (item) => {
    router.push({
      pathname: '/chat',
      params: {
        userName: item.userName || item.otherUserId,
        chatId: item.id,
        otherUserId: item.otherUserId,
      },
    });
  };

  if (!uid) {
    return <View style={styles.centered}><Text style={{ color: colors.text }}>Faça login para ver suas conversas.</Text></View>;
  }
  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }
  if (error) {
    return <View style={styles.centered}><Text style={{ color: colors.text }}>{error}</Text></View>;
  }
  if (!chats.length) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: colors.textSecondary, textAlign: 'center', paddingHorizontal: 24 }}>
          Você ainda não tem conversas.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ChatItem item={item} onPress={() => openChat(item)} />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  chatItem: { flexDirection: 'row', padding: 15, alignItems: 'center' },
  avatarImg: { width: 50, height: 50, borderRadius: 25, marginRight: 15 },
  avatar: {
    width: 50, height: 50, borderRadius: 25, backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center', marginRight: 15
  },
  avatarText: { color: colors.text, fontWeight: 'bold', fontSize: 18 },
  textContainer: { flex: 1, minWidth: 0 }, // minWidth:0 para truncar corretamente
  userName: { color: colors.text, fontSize: 16, fontWeight: 'bold' },
  lastMessage: { color: colors.textSecondary, fontSize: 14, marginTop: 2 },
  metaContainer: { alignItems: 'flex-end', marginLeft: 8 },
  time: { color: colors.textSecondary, fontSize: 12 },
  separator: { height: 1, backgroundColor: colors.border },
});
