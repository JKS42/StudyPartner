import { StyleSheet, Text, TextInput, type TextInputProps } from 'react-native';
import { useAppTheme } from '../theme';
import { radius, spacing } from '../theme/colors';
import { typography } from '../theme/typography';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, error, style, ...props }: InputProps) {
  const theme = useAppTheme();

  return (
    <>
      {label ? (
        <Text style={[styles.label, { color: theme.textMuted }]}>{label}</Text>
      ) : null}
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={theme.textMuted}
        style={[
          styles.input,
          {
            backgroundColor: theme.inputBg,
            borderColor: error ? '#E85D4C' : theme.border,
            color: theme.text,
          },
          style,
        ]}
        {...props}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </>
  );
}

const styles = StyleSheet.create({
  label: { ...typography.label, marginBottom: spacing.sm },
  input: {
    minHeight: 54,
    borderWidth: 1.5,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    fontSize: 16,
    marginBottom: spacing.md,
  },
  error: {
    color: '#E85D4C',
    fontSize: 13,
    marginTop: -8,
    marginBottom: spacing.sm,
  },
});
