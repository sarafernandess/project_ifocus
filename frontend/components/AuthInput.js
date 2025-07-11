import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { colors } from '../theme/colors';

const AuthInput = ({ icon, ...props }) => (
  <View style={styles.container}>
    {icon && <Ionicons name={icon} size={20} color={colors.placeholder} style={styles.icon} />}
    <TextInput
      style={styles.input}
      placeholderTextColor={colors.placeholder}
      {...props}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.text,
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
    color: colors.textSecondary,
    fontSize: 16,
  },
});

export default AuthInput;