import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Linking,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import PrimaryButton from '../../components/PrimaryButton';
import { authService } from '../../services/authService';
import { userService } from '../../services/userService';
import { colors } from '../../theme/colors';

const DocumentPicker = require('expo-document-picker');
const ImagePicker = Platform.OS !== 'web' ? require('expo-image-picker') : null;

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [initialName, setInitialName] = useState('');
  const [imageUri, setImageUri] = useState(null);       
  const [avatarDataUrl, setAvatarDataUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      const fetchProfile = async () => {
        try {
          setIsLoading(true);
          const userData = await userService.getUserProfile();
          setUser(userData);
          setName(userData.name || '');
          setInitialName(userData.name || '');
          setImageUri(null);
          setAvatarDataUrl(null);
        } catch (error) {
          console.error('Perfil /user/me error:', error?.response?.data || error);
          Alert.alert('Erro', 'Não foi possível carregar seu perfil.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchProfile();
    }, [])
  );

  const ensureSizeUnder = async (uri, maxMB = 10) => {
    const info = await FileSystem.getInfoAsync(uri);
    const sizeMB = (info.size || 0) / (1024 * 1024);
    if (sizeMB > maxMB) throw new Error(`Arquivo acima de ${maxMB} MB`);
  };

  const handlePickImage = async () => {
    try {
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
        const b64 = await FileSystem.readAsStringAsync(asset.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        const mime = asset.mimeType || 'image/jpeg';
        const dataUrl = `data:${mime};base64,${b64}`;

        setImageUri(asset.uri);
        setAvatarDataUrl(dataUrl);
        return;
      }

      // iOS/Android: expo-image-picker
      let perm = await ImagePicker.getMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      }
      if (!perm.granted) {
        Alert.alert(
          'Permissão de Fotos',
          'Abra as configurações para permitir acesso à galeria.',
          [
            { text: 'Cancelar' },
            { text: 'Abrir Configurações', onPress: () => Linking.openSettings() },
          ]
        );
        return;
      }

      const mediaTypes =
        ImagePicker?.MediaType
          ? [ImagePicker.MediaType.Images]            
          : ImagePicker?.MediaTypeOptions?.Images ?? 1; 

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (result.canceled) return;

      const asset = result.assets?.[0];
      if (!asset?.uri) return;

      await ensureSizeUnder(asset.uri);
      const b64 = await FileSystem.readAsStringAsync(asset.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const mime = asset.mimeType || 'image/jpeg';
      const dataUrl = `data:${mime};base64,${b64}`;

      setImageUri(asset.uri);
      setAvatarDataUrl(dataUrl);
    } catch (e) {
      console.error('handlePickImage error', e);
      Alert.alert('Erro', e?.message || 'Não foi possível abrir a galeria.');
    }
  };

  const handleUpdateProfile = async () => {
    const trimmedName = name.trim();
    const hasNameChanged = trimmedName !== '' && trimmedName !== initialName;
    const hasImageChanged = !!avatarDataUrl;

    if (!hasNameChanged && !hasImageChanged) return;

    setIsUpdating(true);
    try {
      const updateData = {};
      if (hasNameChanged) updateData.name = trimmedName;
      if (hasImageChanged) updateData.avatarImageBase64 = avatarDataUrl;

      const updatedUser = await userService.updateProfile(updateData);
      setUser(updatedUser);
      setInitialName(updatedUser.name || trimmedName);
      setImageUri(null);
      setAvatarDataUrl(null);
      Alert.alert('Sucesso', 'Seu perfil foi atualizado!');
    } catch (error) {
      console.error('Erro ao atualizar o perfil:', error?.response?.data || error);
      Alert.alert('Erro', error?.response?.data?.detail || 'Não foi possível atualizar seu perfil.');
    } finally {
      setIsUpdating(false);
    }
  };

  const performLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível sair da sua conta.');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const hasChanges = (name.trim() !== '' && name.trim() !== initialName) || !!avatarDataUrl;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Cabeçalho do Perfil com Avatar */}
      <View style={styles.profileHeader}>
        <TouchableOpacity onPress={handlePickImage}>
          <View style={styles.avatar}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.avatarImage} />
            ) : user?.avatarUrl ? (
              <Image source={{ uri: user.avatarUrl }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>{user?.avatar}</Text>
            )}
            <View style={styles.cameraIconContainer}>
              <Ionicons name="camera" size={20} color={colors.text} />
            </View>
          </View>
        </TouchableOpacity>
        <Text style={styles.userName}>{name}</Text>
      </View>

      {/* Botão Salvar Alterações (condicional) */}
      {hasChanges && (
        <PrimaryButton
          title={isUpdating ? 'Salvando...' : 'Salvar Alterações'}
          onPress={handleUpdateProfile}
          disabled={isUpdating}
          style={{ marginBottom: 15, width: '100%' }}
        />
      )}

      {/* Informações Pessoais */}
      <View style={styles.infoSection}>
        <View style={styles.sectionHeader}>
          <Ionicons name="person-outline" size={22} color={colors.text} />
          <Text style={styles.sectionTitle}>Informações Pessoais</Text>
        </View>

        <Text style={styles.label}>Nome</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Seu nome"
          placeholderTextColor={colors.textSecondary}
        />

        <Text style={styles.label}>Email</Text>
        <View style={styles.emailContainer}>
          <Ionicons name="mail-outline" size={20} color={colors.textSecondary} style={styles.emailIcon} />
          <Text style={styles.emailText}>{user?.email}</Text>
        </View>
      </View>

      {/* Botões */}
      <TouchableOpacity style={styles.optionButton} onPress={() => router.push('/change-password')}>
        <Ionicons name="lock-closed-outline" size={18} color={colors.text} />
        <Text style={styles.optionText}>Alterar Senha</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.logoutButton, { width: '100%' }]} onPress={performLogout}>
        <Ionicons name="log-out-outline" size={20} color={colors.text} />
        <Text style={styles.logoutButtonText}>Sair da Conta</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  contentContainer: { padding: 20 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  profileHeader: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    position: 'relative',
    overflow: 'hidden',
  },
  avatarImage: { width: '100%', height: '100%' },
  avatarText: { color: colors.text, fontSize: 36, fontWeight: 'bold' },
  cameraIconContainer: { position: 'absolute', bottom: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.5)', padding: 6, borderRadius: 15 },
  userName: { color: colors.text, fontSize: 22, fontWeight: 'bold' },
  infoSection: {
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
  label: { color: colors.textSecondary, fontSize: 14, marginBottom: 8 },
  input: {
    backgroundColor: colors.background,
    color: colors.text,
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 16,
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emailIcon: { marginRight: 10 },
  emailText: { color: colors.textSecondary, fontSize: 16 },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionText: { color: colors.text, fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondary,
    padding: 15,
    borderRadius: 8,
    marginTop: 15,
  },
  logoutButtonText: { color: colors.text, fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
});
