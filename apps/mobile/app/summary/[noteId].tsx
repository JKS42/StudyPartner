import { useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { Screen } from '../../src/components/Screen';
import { generateSummary } from '../../src/lib/api';
import { fetchSummaryContent } from '../../src/lib/summaries';
import { useAppTheme } from '../../src/theme';
import { useState } from 'react';
import { Alert } from 'react-native';

export default function SummaryScreen() {
  const { noteId } = useLocalSearchParams<{ noteId: string }>();
  const theme = useAppTheme();
  const [regenerating, setRegenerating] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['summary', noteId],
    queryFn: () => fetchSummaryContent(noteId!),
  });

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      await generateSummary(noteId!, true);
      await refetch();
    } catch (e) {
      Alert.alert('Failed', e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setRegenerating(false);
    }
  };

  if (isLoading) {
    return (
      <Screen title="Summary">
        <ActivityIndicator color={theme.primary} />
      </Screen>
    );
  }

  if (!data) {
    return (
      <Screen title="Summary">
        <Text style={{ color: theme.textMuted }}>
          No summary yet. Generate from the note screen, or add text content to your note first.
        </Text>
        <Button title="Generate now" onPress={handleRegenerate} loading={regenerating} />
      </Screen>
    );
  }

  return (
    <Screen title="Summary">
      <Card>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Overview</Text>
        <Text style={{ color: theme.text }}>{data.overview}</Text>
      </Card>

      {data.keyPoints.length > 0 ? (
        <>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Key points</Text>
          {data.keyPoints.map((point, i) => (
            <Text key={i} style={[styles.bullet, { color: theme.text }]}>
              • {point}
            </Text>
          ))}
        </>
      ) : null}

      {data.definitions.length > 0 ? (
        <>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Definitions</Text>
          {data.definitions.map((d, i) => (
            <View key={i} style={styles.def}>
              <Text style={[styles.term, { color: theme.primary }]}>{d.term}</Text>
              <Text style={{ color: theme.text }}>{d.definition}</Text>
            </View>
          ))}
        </>
      ) : null}

      {data.examTips.length > 0 ? (
        <>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Exam tips</Text>
          {data.examTips.map((tip, i) => (
            <Text key={i} style={[styles.bullet, { color: theme.text }]}>
              • {tip}
            </Text>
          ))}
        </>
      ) : null}

      <Button title="Regenerate" variant="secondary" onPress={handleRegenerate} loading={regenerating} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { fontSize: 18, fontWeight: '600', marginTop: 8, marginBottom: 8 },
  bullet: { fontSize: 15, lineHeight: 22, marginBottom: 6 },
  def: { marginBottom: 12 },
  term: { fontWeight: '600', marginBottom: 4 },
});
