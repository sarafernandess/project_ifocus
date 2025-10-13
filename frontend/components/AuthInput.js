import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { colors } from '../theme/colors';

const AuthInput = ({ icon, rightIconName, onRightIconPress, ...props }) => (
  <View style={styles.container}>
    {icon && <Ionicons name={icon} size={20} color={colors.placeholder} style={styles.icon} />}
    <TextInput
      style={styles.input}
      placeholderTextColor={colors.placeholder}
      {...props}
    />
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
    backgroundColor: colors.surface,
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
    color: colors.text,
    fontSize: 16,
  },
  rightIconContainer: {
    padding: 5,
  },
});

export default AuthInput;