import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { HeroCard } from '../../src/components/HeroCard';
import { Screen } from '../../src/components/Screen';
import { useProfile } from '../../src/hooks/useProfile';
import { useWeeklyProgress } from '../../src/hooks/useProgress';
import { useAppTheme } from '../../src/theme';
import { cardAccents, palette, radius, spacing } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';

export default function ProgressScreen() {
  const theme = useAppTheme();
  const { data: profile } = useProfile();
  const { data, isLoading } = useWeeklyProgress();

  const streak = profile?.streak_count ?? 0;
  const minutes = data?.minutes ?? 0;
  const quizzes = data?.quizzes ?? 0;
  const cards = data?.cards ?? 0;

  return (
    <Screen title="Weekly Insights" subtitle="March 2026" scroll={false}>
      {isLoading ? (
        <ActivityIndicator color={palette.orange} style={{ marginTop: 40 }} />
      ) : (
        <View style={styles.content}>
          <HeroCard
            label="Total focus time"
            value={`${minutes}m`}
            footer={`${data?.sessions?.length ?? 0} sessions this week`}
            badge={streak > 0 ? `${streak}d streak` : undefined}
          />

          <View style={[styles.chart, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            {[40, 25, 55, 70, 45, 30, 50].map((h, i) => (
              <View key={i} style={styles.barCol}>
                <View style={[styles.bar, { height: h, backgroundColor: i === 3 ? palette.coral : palette.orangeLight }]} />
                <Text style={[styles.barLabel, { color: theme.textMuted }]}>{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</Text>
              </View>
            ))}
          </View>

          <Text style={[styles.section, { color: theme.text }]}>Breakdown</Text>
          <View style={styles.grid}>
            <StatTile label="Quizzes" value={String(quizzes)} color={cardAccents[2]} />
            <StatTile label="Flashcards" value={String(cards)} color={cardAccents[0]} />
          </View>
        </View>
      )}
    </Screen>
  );
}

function StatTile({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={[styles.tile, { backgroundColor: color }]}>
      <Text style={styles.tileValue}>{value}</Text>
      <Text style={styles.tileLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 120 },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 120,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
  },
  barCol: { alignItems: 'center', flex: 1 },
  bar: { width: 20, borderRadius: 10, marginBottom: 8 },
  barLabel: { ...typography.caption },
  section: { ...typography.h2, marginBottom: spacing.md },
  grid: { flexDirection: 'row', gap: spacing.md },
  tile: {
    flex: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  tileValue: { fontSize: 32, fontWeight: '800', color: '#fff' },
  tileLabel: { ...typography.caption, color: 'rgba(255,255,255,0.9)', marginTop: 4 },
});
