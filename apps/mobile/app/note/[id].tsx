import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text } from 'react-native';
import { Button } from '../../src/components/Button';
import { LoadingOverlay } from '../../src/components/LoadingOverlay';
import { Screen } from '../../src/components/Screen';
import { useDeleteNote, useNote } from '../../src/hooks/useNotes';
import { generateFlashcards, generateQuiz, generateSummary } from '../../src/lib/api';
import { supabase } from '../../src/lib/supabase';
import { useAppTheme } from '../../src/theme';

export default function NoteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useAppTheme();
  const { data: note, isLoading } = useNote(id);
  const deleteNote = useDeleteNote();
  const [busy, setBusy] = useState(false);
  const [busyLabel, setBusyLabel] = useState('Working...');

  const getNoteText = () => {
    if (!note) return '';
    return note.content_text ?? '';
  };

  const handleSummarize = async () => {
    setBusyLabel('Creating summary...');
    setBusy(true);
    try {
      await generateSummary(id!, false);
      router.push(`/summary/${id}`);
    } catch (e) {
      Alert.alert('Summary failed', e instanceof Error ? e.message : 'Try again later.');
    } finally {
      setBusy(false);
    }
  };

  const handleQuiz = async () => {
    setBusyLabel('Building quiz...');
    setBusy(true);
    try {
      const result = await generateQuiz(id!);
      const quiz = result.quiz as { id: string };
      router.push(`/quiz/${quiz.id}`);
    } catch (e) {
      Alert.alert('Quiz generation failed', e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setBusy(false);
    }
  };

  const handleFlashcards = async () => {
    setBusyLabel('Building flashcards...');
    setBusy(true);
    try {
      const result = await generateFlashcards(id!);
      const deck = result.deck as { id: string };
      router.push(`/flashcards/${deck.id}`);
    } catch (e) {
      Alert.alert('Flashcards failed', e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setBusy(false);
    }
  };

  const openExistingSummary = async () => {
    const { data } = await supabase
      .from('summaries')
      .select('id')
      .eq('note_id', id!)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (data) router.push(`/summary/${id}`);
    else handleSummarize();
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete material?',
      `"${note?.title ?? 'This note'}" will be removed from your library. Uploaded files are deleted from storage.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setBusy(true);
            try {
              await deleteNote.mutateAsync(id!);
              router.replace('/(tabs)/library');
            } catch (e) {
              Alert.alert('Delete failed', e instanceof Error ? e.message : 'Unknown error');
            } finally {
              setBusy(false);
            }
          },
        },
      ]
    );
  };

  if (isLoading || !note) {
    return (
      <Screen title="Note">
        <Text style={{ color: theme.textMuted }}>Loading...</Text>
      </Screen>
    );
  }

  return (
    <Screen title={note.title}>
      <LoadingOverlay visible={busy} message={busyLabel} />

      <ScrollView>
        <Text style={[styles.meta, { color: theme.textMuted }]}>
          {note.source_type} · {note.status}
        </Text>
        {getNoteText() ? (
          <Text style={[styles.body, { color: theme.text }]} numberOfLines={12}>
            {getNoteText()}
          </Text>
        ) : (
          <Text style={{ color: theme.textMuted }}>
            Content stored in uploaded file. Add text in the notes field when uploading for summaries,
            quizzes, and flashcards.
          </Text>
        )}
        <Text style={[styles.hint, { color: theme.textMuted }]}>
          Summaries, quizzes, and flashcards are built from your note text on this device.
        </Text>
      </ScrollView>

      <Button title="Summary" onPress={openExistingSummary} />
      <Button title="Generate Quiz" variant="secondary" onPress={handleQuiz} />
      <Button title="Generate Flashcards" variant="secondary" onPress={handleFlashcards} />
      <Button title="Delete material" variant="ghost" onPress={handleDelete} />
      <Button title="Back to library" variant="ghost" onPress={() => router.back()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  meta: { fontSize: 14, marginBottom: 12 },
  body: { fontSize: 15, lineHeight: 22, marginBottom: 12 },
  hint: { fontSize: 13, marginBottom: 24, lineHeight: 18 },
});
