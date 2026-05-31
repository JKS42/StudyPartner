import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../theme';
import { radius, spacing } from '../theme/colors';
import { typography } from '../theme/typography';

interface ProfileHeaderProps {
  name: string;
  subtitle?: string;
  onAdd?: () => void;
  onSettings?: () => void;
}

export function ProfileHeader({ name, subtitle, onAdd, onSettings }: ProfileHeaderProps) {
  const theme = useAppTheme();
  const initial = name?.charAt(0)?.toUpperCase() || 'S';
  const greetingName = name.split(' ')[0];

  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <View>
          <Text style={[styles.greeting, { color: theme.text }]}>Hello, {greetingName}</Text>
          {subtitle ? (
            <Text style={[styles.sub, { color: theme.textMuted }]}>{subtitle}</Text>
          ) : null}
        </View>
      </View>
      <View style={styles.actions}>
        {onSettings ? (
          <Pressable
            style={[styles.iconBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={onSettings}
            accessibilityLabel="Settings"
          >
            <Ionicons name="settings-outline" size={20} color={theme.text} />
          </Pressable>
        ) : null}
        {onAdd ? (
          <Pressable
            style={[styles.iconBtn, styles.addBtn, { backgroundColor: theme.primary, borderColor: theme.primary }]}
            onPress={onAdd}
            accessibilityLabel="Add"
          >
            <Ionicons name="add" size={24} color={theme.text} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: 8,
    paddingBottom: 16,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: '#1A8A7D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 20, fontWeight: '700' },
  greeting: { ...typography.h3 },
  sub: { ...typography.caption, marginTop: 2 },
  actions: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  addBtn: {},
});
