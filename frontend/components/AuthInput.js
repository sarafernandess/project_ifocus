import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';

const PrimaryButton = ({ title, onPress, style, textStyle, color = 'primary', disabled = false }) => (
  <TouchableOpacity
    style={[styles.button, { backgroundColor: colors[color] }, style, disabled && styles.disabled]}
    onPress={onPress}
    disabled={disabled}
  >
    {disabled ? <ActivityIndicator color={colors.text} /> : <Text style={[styles.text, textStyle]}>{title}</Text>}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  text: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabled: {
    backgroundColor: '#cccccc',
  },
});

export default PrimaryButton;