import { useRouter } from 'expo-router'; // 1. Importar
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { chatService } from '../../services/';
import { colors } from '../../theme/colors';

// O router é passado como prop para o item da lista
const ChatItem = ({ item, router }) => (
    <TouchableOpacity 
        style={styles.chatItem}
        // 2. Usar router.push para navegar para a tela de chat
        onPress={() => router.push({ pathname: '/chat', params: { userName: item.userName, chatId: item.id }})}
    >
        <View style={styles.avatar}><Text style={styles.avatarText}>{item.avatar}</Text></View>
        <View style={styles.textContainer}>
            <Text style={styles.userName}>{item.userName}</Text>
            <Text style={styles.lastMessage}>{item.lastMessage}</Text>
            <Text style={styles.subject}>{item.subject}</Text>
        </View>
        <View style={styles.metaContainer}>
            <Text style={styles.time}>{item.time}</Text>
            {item.unread > 0 && (
                <View style={styles.unreadBadge}><Text style={styles.unreadText}>{item.unread}</Text></View>
            )}
        </View>
    </TouchableOpacity>
);

export default function ChatsListScreen() {
    const router = useRouter(); // 3. Inicializar
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchChats = async () => {
            const result = await chatService.getChatsList();
            setChats(result);
            setLoading(false);
        };
        fetchChats();
    }, []);

    if (loading) {
        return <View style={styles.centered}><ActivityIndicator size="large" color={colors.primary} /></View>;
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={chats}
                keyExtractor={item => item.id}
                // 4. Passar o router como prop
                renderItem={({ item }) => <ChatItem item={item} router={router} />}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
        </View>
    );
};
// ... (estilos permanecem os mesmos)
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
    chatItem: { flexDirection: 'row', padding: 15, alignItems: 'center' },
    avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    avatarText: { color: colors.text, fontWeight: 'bold', fontSize: 18 },
    textContainer: { flex: 1 },
    userName: { color: colors.text, fontSize: 16, fontWeight: 'bold' },
    lastMessage: { color: colors.textSecondary, fontSize: 14 },
    subject: { color: colors.primary, fontSize: 12, marginTop: 4 },
    metaContainer: { alignItems: 'flex-end' },
    time: { color: colors.textSecondary, fontSize: 12 },
    unreadBadge: { backgroundColor: colors.primary, borderRadius: 10, width: 20, height: 20, justifyContent: 'center', alignItems: 'center', marginTop: 5 },
    unreadText: { color: colors.text, fontWeight: 'bold', fontSize: 12 },
    separator: { height: 1, backgroundColor: colors.border },
});