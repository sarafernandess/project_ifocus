import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'; // Adicionar TouchableOpacity
import { colors } from '../theme/colors';

// Adicionar as novas props: rightIconName e onRightIconPress
const AuthInput = ({ icon, rightIconName, onRightIconPress, ...props }) => (
  <View style={styles.container}>
    {icon && <Ionicons name={icon} size={20} color={colors.placeholder} style={styles.icon} />}
    <TextInput
      style={styles.input}
      placeholderTextColor={colors.placeholder}
      {...props}
    />
    {/* Renderiza o ícone da direita apenas se ele for fornecido */}
    {rightIconName && (
      <TouchableOpacity onPress={onRightIconPress} style={styles.rightIconContainer}>
        <Ionicons name={rightIconName} size={24} color={colors.placeholder} />
      </TouchableOpacity>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface, // Corrigido para surface para melhor contraste
    borderRadius: 8,
    width: '100%',
    paddingHorizontal: 15,
    marginVertical: 10,
    borderColor: colors.border,
    borderWidth: 1,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    color: colors.text, // Corrigido para texto primário
    fontSize: 16,
  },
  rightIconContainer: {
    padding: 5, // Adiciona uma área de toque maior para o ícone
  },
});

export default AuthInput;