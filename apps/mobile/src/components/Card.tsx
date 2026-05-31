import { Pressable, StyleSheet, type PressableProps } from 'react-native';
import { useAppTheme } from '../theme';
import { radius, spacing } from '../theme/colors';

interface CardProps extends PressableProps {
  accent?: string;
  elevated?: boolean;
}

export function Card({
  style,
  children,
  accent,
  elevated = false,
  ...props
}: CardProps) {
  const theme = useAppTheme();

  return (
    <Pressable
      style={(state) => [
        styles.card,
        {
          backgroundColor: accent ?? theme.card,
          borderColor: accent ? 'transparent' : theme.border,
          shadowColor: theme.shadow,
          shadowOpacity: elevated ? 0.12 : 0,
          elevation: elevated ? 4 : 0,
          opacity: state.pressed ? 0.96 : 1,
        },
        typeof style === 'function' ? style(state) : style,
      ]}
      {...props}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
  },
});
