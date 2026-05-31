import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
} from 'react-native';
import { useAppTheme } from '../theme';
import { radius } from '../theme/colors';
import { typography } from '../theme/typography';

interface ButtonProps extends PressableProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'inverse';
  loading?: boolean;
}

export function Button({
  title,
  variant = 'primary',
  loading,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const theme = useAppTheme();

  const bg =
    variant === 'primary'
      ? theme.primary
      : variant === 'inverse'
        ? theme.surface
        : variant === 'secondary'
          ? theme.surface
          : 'transparent';

  const textColor =
    variant === 'primary'
      ? theme.textOnPrimary
      : variant === 'inverse'
        ? theme.primary
        : theme.text;

  return (
    <Pressable
      accessibilityRole="button"
      style={(state) => [
        styles.base,
        {
          backgroundColor: bg,
          borderColor: variant === 'secondary' ? theme.border : 'transparent',
          borderWidth: variant === 'secondary' ? 1.5 : 0,
          opacity: state.pressed || disabled ? 0.88 : 1,
        },
        typeof style === 'function' ? style(state) : style,
      ]}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.label, { color: textColor }]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 54,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  label: { ...typography.button },
});
