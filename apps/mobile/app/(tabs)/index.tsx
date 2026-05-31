import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { HeroCard } from '../../src/components/HeroCard';
import { NoteCard } from '../../src/components/NoteCard';
import { ProfileHeader } from '../../src/components/ProfileHeader';
import { Screen } from '../../src/components/Screen';
import { useNotes } from '../../src/hooks/useNotes';
import { useProfile } from '../../src/hooks/useProfile';
import { useWeeklyProgress } from '../../src/hooks/useProgress';
import { getProfileGreetingName } from '../../src/lib/profile';
import { useAppTheme } from '../../src/theme';
import { palette, spacing } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';

export default function DashboardScreen() {
  const theme = useAppTheme();
  const { data: profile } = useProfile();
  const { data: notes } = useNotes();
  const { data: progress } = useWeeklyProgress();

  const recent = notes?.slice(0, 5) ?? [];
  const greetingName = getProfileGreetingName(profile);
  const subtitle =
    profile?.username?.trim() && profile?.display_name?.trim()
      ? profile.display_name.trim()
      : 'Ready to focus?';
  const streak = profile?.streak_count ?? 0;
  const minutes = progress?.minutes ?? 0;

  return (
    <Screen scroll={false} padded={false}>
      <ProfileHeader
        name={greetingName}
        subtitle={subtitle}
        onAdd={() => router.push('/upload')}
        onSettings={() => router.push('/settings')}
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <HeroCard
          label="Study balance this week"
          value={`${minutes} min`}
          footer={`${streak} day streak · Goal ${profile?.study_goal_minutes ?? 25} min/day`}
          badge={new Date().toLocaleDateString(undefined, { month: '2-digit', day: '2-digit' })}
          style={styles.hero}
        />

        {recent.length > 0 ? (
          <>
            <Text style={[styles.section, { color: theme.text }]}>Continue studying</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontal}>
              {recent.map((note, i) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  index={i}
                  compact
                  onPress={() => router.push(`/note/${note.id}`)}
                />
              ))}
            </ScrollView>
          </>
        ) : null}

        <Text style={[styles.section, { color: theme.text }]}>All materials</Text>
        {recent.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              No notes yet. Tap + to upload your first PDF or notes.
            </Text>
          </View>
        ) : (
          recent.map((note, i) => (
            <NoteCard
              key={`list-${note.id}`}
              note={note}
              index={i + 2}
              onPress={() => router.push(`/note/${note.id}`)}
            />
          ))
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: 120 },
  hero: { marginTop: 4 },
  section: { ...typography.h2, marginTop: spacing.md, marginBottom: spacing.md },
  horizontal: { marginBottom: spacing.md, marginHorizontal: -4 },
  empty: {
    backgroundColor: palette.emptyBlue,
    borderRadius: 20,
    padding: spacing.lg,
    borderWidth: 0,
  },
  emptyText: { ...typography.body, color: palette.white, textAlign: 'center' },
});
