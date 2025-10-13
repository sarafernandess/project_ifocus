// screens/ChatScreen.js
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import { Stack, useLocalSearchParams } from 'expo-router';
import { collection, doc, getDoc, limit, onSnapshot, orderBy, query } from 'firebase/firestore';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator, Alert, FlatList, Image, KeyboardAvoidingView,
    Linking, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View
} from 'react-native';
import chatService from '../services/chatService';
import { auth, db } from '../services/firebaseConfig';
import { userService } from '../services/userService';
import { colors } from '../theme/colors';

// ⚠️ IMPORTAÇÕES "WEB-SAFE"
const DocumentPicker = require('expo-document-picker');
// Só carrega o ImagePicker em iOS/Android (módulo nativo)
const ImagePicker = Platform.OS !== 'web' ? require('expo-image-picker') : null;

const fmtTime = (ms) => {
  if (!ms) return '';
  const d = new Date(ms);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const isImage = (t) => typeof t === 'string' && t.startsWith('image/');
const isLikelyUrl = (s) => typeof s === 'string' && /^https?:\/\//i.test(s.trim());

const decodeFileName = (nameOrUrl) => {
  if (!nameOrUrl) return 'arquivo';
  try {
    const isUrl = /^https?:\/\//i.test(nameOrUrl);
    let raw = isUrl ? nameOrUrl.split('?')[0].split('/').pop() || '' : String(nameOrUrl);
    raw = raw.replace(/\+/g, ' ');
    let out = raw;
    try { out = decodeURIComponent(out); } catch {}
    try { out = decodeURIComponent(out); } catch {}
    out = out.replace(/%20/g, ' ');
    out = out.replace(/[\\\/]+/g, '');
    return out || 'arquivo';
  } catch {
    return (String(nameOrUrl) || 'arquivo').replace(/%20/g, ' ');
  }
};

const ChatBubble = ({ m, isSender }) => {
  const showImage = !!m.file_url && isImage(m.file_type);
  const isFile = !!m.file_url && !isImage(m.file_type);
  const fileDisplayName = decodeFileName(m.file_name || m.file_url);

  const shouldShowText =
    !!m.text &&
    !isLikelyUrl(m.text) &&
    String(m.text).trim() !== String(m.file_url || '').trim();

  const openLink = async (url) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) await Linking.openURL(url);
      else Alert.alert('Atenção', 'Não foi possível abrir o arquivo.');
    } catch {
      Alert.alert('Atenção', 'Não foi possível abrir o arquivo.');
    }
  };

  return (
    <View style={[styles.bubbleContainer, isSender ? styles.senderContainer : styles.receiverContainer]}>
      <View style={[styles.bubble, isSender ? styles.senderBubble : styles.receiverBubble]}>
        {showImage && (
          <Image
            source={{ uri: m.file_url }}
            style={{ width: 180, height: 180, borderRadius: 8, marginBottom: 6 }}
            resizeMode="cover"
          />
        )}

        {isFile && (
          <TouchableOpacity onPress={() => openLink(m.file_url)}>
            <View style={styles.fileChip}>
              <Ionicons name="document-attach-outline" size={18} color={colors.text} />
              <Text style={styles.fileName} numberOfLines={1} ellipsizeMode="middle">
                {fileDisplayName}
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {shouldShowText && <Text style={styles.bubbleText}>{m.text}</Text>}
        <Text style={styles.bubbleTime}>{fmtTime(m.timestamp)}</Text>
      </View>
    </View>
  );
};

const MAX_FILE_MB = 10;

export default function ChatScreen() {
  const routeParams = useLocalSearchParams();
  const initialUserName = routeParams.userName;
  const chatId = String(routeParams.chatId || '');
  const paramOtherUserId = routeParams.otherUserId ? String(routeParams.otherUserId) : null;

  const currentUser = auth.currentUser;
  const currentUserId = currentUser?.uid;

  const [otherUserId, setOtherUserId] = useState(paramOtherUserId);
  const [userName, setUserName] = useState(initialUserName || 'Chat');
  const [avatarUrl, setAvatarUrl] = useState(null);

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState('');
  const [error, setError] = useState(null);

  const listRef = useRef(null);

  // Deriva otherUserId do doc do chat se não vier por params
  useEffect(() => {
    (async () => {
      if (!chatId || otherUserId || !currentUserId) return;
      try {
        const chatSnap = await getDoc(doc(db, 'chats', chatId));
        if (chatSnap.exists()) {
          const data = chatSnap.data() || {};
          const participants = Array.isArray(data.participants) ? data.participants.map(String) : [];
          const other = participants.find(p => p !== String(currentUserId)) || null;
          if (other) {
            setOtherUserId(other);
            if (!initialUserName) setUserName(other);
          }
        }
      } catch (e) {
        console.error('Falha ao derivar otherUserId', e);
      }
    })();
  }, [chatId, otherUserId, currentUserId, initialUserName]);

  // Busca nome/avatar reais do outro participante
  useEffect(() => {
    (async () => {
      if (!otherUserId) return;
      try {
        const map = await userService.getPublicUsers([otherUserId]);
        const u = map[otherUserId];
        if (u) {
          if (!initialUserName) setUserName(u.name || otherUserId);
          setAvatarUrl(u.avatarUrl || null);
        }
      } catch (e) {
        console.warn('Falha ao obter perfil público do outro usuário', e);
      }
    })();
  }, [otherUserId, initialUserName]);

  // Listener de mensagens
  useEffect(() => {
    if (!chatId) {
      setLoading(false);
      setError('Chat inválido.');
      return;
    }
    try {
      const q = query(
        collection(db, `chats/${chatId}/messages`),
        orderBy('timestamp', 'asc'),
        limit(100)
      );
      const unsub = onSnapshot(
        q,
        (snap) => {
          const list = snap.docs.map((d) => {
            const m = d.data() || {};
            return {
              id: d.id,
              text: m.message ?? m.text ?? null,
              file_url: m.file_url ?? null,
              file_type: m.file_type ?? null,
              file_name: m.file_name ?? null,
              senderId: m.sender_id ?? m.senderId,
              receiverId: m.receiver_id ?? m.receiverId,
              timestamp: m.timestamp?.toMillis ? m.timestamp.toMillis() : Number(m.timestamp) || 0,
            };
          });
          setMessages(list);
          setLoading(false);
          setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
        },
        (err) => {
          console.error('onSnapshot error', err);
          setError('Não foi possível carregar as mensagens em tempo real.');
          setLoading(false);
        }
      );
      return () => unsub();
    } catch (e) {
      console.error(e);
      setError('Falha ao iniciar o listener de mensagens.');
      setLoading(false);
    }
  }, [chatId]);

  const ensureSizeUnder = async (uri) => {
    const info = await FileSystem.getInfoAsync(uri);
    const sizeMB = (info.size || 0) / (1024 * 1024);
    if (sizeMB > MAX_FILE_MB) throw new Error(`Arquivo acima de ${MAX_FILE_MB} MB`);
  };

  const pickImage = useCallback(async () => {
    try {
      // WEB → usa DocumentPicker para imagens
      if (Platform.OS === 'web') {
        const res = await DocumentPicker.getDocumentAsync({
          type: ['image/*'],
          multiple: false,
          copyToCacheDirectory: true,
        });
        if (res.canceled) return;
        const asset = res.assets?.[0];
        if (!asset?.uri) return;

        await ensureSizeUnder(asset.uri);
        const file = {
          uri: asset.uri,
          name: asset.name || `photo_${Date.now()}.jpg`,
          type: asset.mimeType || 'image/jpeg',
        };
        await chatService.sendMessage({ chatId, receiverId: String(otherUserId), text: undefined, file });
        return;
      }

      // iOS/Android → expo-image-picker
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permissão necessária', 'Autorize o acesso às fotos para anexar imagens.');
        return;
      }

      // Suporte a APIs antigas e novas do ImagePicker
      const mediaTypes =
        ImagePicker?.MediaType
          ? [ImagePicker.MediaType.Images]
          : ImagePicker?.MediaTypeOptions?.Images ?? 1;

      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (res.canceled) return;
      const asset = res.assets?.[0];
      if (!asset?.uri) return;

      await ensureSizeUnder(asset.uri);
      const file = {
        uri: asset.uri,
        name: asset.fileName || `photo_${Date.now()}.jpg`,
        type: asset.mimeType || 'image/jpeg',
      };
      await chatService.sendMessage({ chatId, receiverId: String(otherUserId), text: undefined, file });
    } catch (e) {
      console.error(e);
      Alert.alert('Erro', e?.message || 'Falha ao anexar imagem.');
    }
  }, [chatId, otherUserId]);

  const pickDocument = useCallback(async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        multiple: false,
        copyToCacheDirectory: true
      });
      if (res.canceled) return;
      const asset = res.assets?.[0];
      if (!asset?.uri) return;

      await ensureSizeUnder(asset.uri);
      const file = {
        uri: asset.uri,
        name: asset.name || `file_${Date.now()}`,
        type: asset.mimeType || 'application/octet-stream'
      };
      await chatService.sendMessage({ chatId, receiverId: String(otherUserId), text: undefined, file });
    } catch (e) {
      console.error(e);
      Alert.alert('Erro', e?.message || 'Falha ao anexar arquivo.');
    }
  }, [chatId, otherUserId]);

  const handleSend = useCallback(async () => {
    const text = inputText.trim();
    if (!text) return;
    if (!chatId) { Alert.alert('Erro', 'Chat inválido.'); return; }
    if (!currentUserId || !otherUserId) { Alert.alert('Erro', 'Usuário inválido.'); return; }

    try {
      setInputText('');
      await chatService.sendMessage({ chatId, receiverId: String(otherUserId), text, file: undefined });
    } catch (e) {
      console.error(e);
      Alert.alert('Erro', 'Falha ao enviar mensagem.');
    }
  }, [chatId, inputText, currentUserId, otherUserId]);

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ title: userName || otherUserId || 'Chat' }} />
        <View style={styles.centered}><ActivityIndicator size="large" color={colors.primary} /></View>
      </>
    );
  }
  if (error) {
    return (
      <>
        <Stack.Screen options={{ title: userName || otherUserId || 'Chat' }} />
        <View style={styles.centered}><Text style={{ color: colors.text }}>{error}</Text></View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: userName || otherUserId || 'Chat' }} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={90}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ChatBubble m={item} isSender={item.senderId === currentUserId} />}
          contentContainerStyle={styles.messageListContent}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={<Text style={{ color: colors.text, textAlign: 'center' }}>Nenhuma mensagem.</Text>}
        />

        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.iconButton} onPress={pickDocument}>
            <Ionicons name="attach" size={24} color={colors.textSecondary} />
          </TouchableOpacity>

          {Platform.OS !== 'web' && (
            <TouchableOpacity style={styles.iconButton} onPress={pickImage}>
              <Ionicons name="camera-outline" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          )}

          <TextInput
            style={styles.input}
            placeholder="Digite sua mensagem..."
            placeholderTextColor={colors.placeholder}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleSend}
            returnKeyType="send"
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend} disabled={!otherUserId}>
            <Ionicons name="send" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  messageListContent: { paddingHorizontal: 10, paddingVertical: 8 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', padding: 10, backgroundColor: colors.surface, borderTopWidth: 1, borderColor: colors.border },
  input: { flex: 1, backgroundColor: colors.background, borderRadius: 20, paddingHorizontal: 15, paddingVertical: 10, color: colors.text, marginRight: 10 },
  iconButton: { padding: 5 },
  sendButton: { backgroundColor: colors.primary, padding: 10, borderRadius: 25 },
  bubbleContainer: { marginVertical: 5, maxWidth: '80%' },
  senderContainer: { alignSelf: 'flex-end' },
  receiverContainer: { alignSelf: 'flex-start' },
  bubble: { padding: 10, borderRadius: 15 },
  senderBubble: { backgroundColor: colors.chatBubbleSent },
  receiverBubble: { backgroundColor: colors.chatBubbleReceived },
  bubbleText: { color: colors.text, fontSize: 16 },
  bubbleTime: { color: colors.text, fontSize: 10, alignSelf: 'flex-end', marginTop: 5, opacity: 0.7 },
  fileChip: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6, maxWidth: 220 },
  fileName: { color: colors.text, textDecorationLine: 'underline', flexShrink: 1 },
});
