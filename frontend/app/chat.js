import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router'; // 1. Importar hooks
import React, { useEffect, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { chatService } from '../services/chatService';
import { colors } from '../theme/colors';

const ChatBubble = ({ message, isSender }) => (
    <View style={[styles.bubbleContainer, isSender ? styles.senderContainer : styles.receiverContainer]}>
        <View style={[styles.bubble, isSender ? styles.senderBubble : styles.receiverBubble]}>
            <Text style={styles.bubbleText}>{message.text}</Text>
            <Text style={styles.bubbleTime}>{message.time}</Text>
        </View>
    </View>
);

export default function ChatScreen() {
    // 2. Usar useLocalSearchParams para pegar os parâmetros da rota
    const { userName, chatId } = useLocalSearchParams();

    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const currentUserId = '1'; // Mocked current user ID

    useEffect(() => {
        const fetchHistory = async () => {
            const history = await chatService.getChatHistory(chatId);
            setMessages(history);
        };
        fetchHistory();
    }, [chatId]);

    const handleSend = async () => {
        if (inputText.trim().length === 0) return;
        const newMessage = {
            text: inputText,
            senderId: currentUserId,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [newMessage, ...prev]);
        setInputText('');
        await chatService.sendMessage(chatId, newMessage);
    };

    return (
        <>
            {/* 3. Configurar o título do cabeçalho dinamicamente */}
            <Stack.Screen options={{ title: userName }} />
            <KeyboardAvoidingView 
                style={styles.container}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={90}
            >
                <FlatList
                    data={messages}
                    keyExtractor={(_, index) => index.toString()}
                    renderItem={({ item }) => <ChatBubble message={item} isSender={item.senderId === currentUserId} />}
                    inverted
                    style={styles.messageList}
                />
                <View style={styles.inputContainer}>
                    <TouchableOpacity style={styles.iconButton}><Ionicons name="attach" size={24} color={colors.textSecondary} /></TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton}><Ionicons name="camera-outline" size={24} color={colors.textSecondary} /></TouchableOpacity>
                    <TextInput
                        style={styles.input}
                        placeholder="Digite sua mensagem..."
                        placeholderTextColor={colors.placeholder}
                        value={inputText}
                        onChangeText={setInputText}
                    />
                    <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
                        <Ionicons name="send" size={24} color={colors.text} />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </>
    );
};
// ... (estilos permanecem os mesmos)
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    messageList: { paddingHorizontal: 10 },
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
});