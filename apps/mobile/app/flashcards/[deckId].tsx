import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../../src/components/Button';
import { Screen } from '../../src/components/Screen';
import { logProgressEvent } from '../../src/lib/progress';
import { supabase } from '../../src/lib/supabase';
import type { Flashcard } from '../../src/types/database';
import { useAppTheme } from '../../src/theme';

export default function FlashcardsScreen() {
  const { deckId } = useLocalSearchParams<{ deckId: string }>();
  const theme = useAppTheme();
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState(0);

  const { data: cards = [] } = useQuery({
    queryKey: ['flashcards', deckId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('flashcards')
        .select('*')
        .eq('deck_id', deckId!)
        .order('created_at');
      if (error) throw error;
      return data as Flashcard[];
    },
  });

  const card = cards[index];
  const progress = cards.length ? ((index + 1) / cards.length) * 100 : 0;

  const nextCard = async (knewIt: boolean) => {
    const { data: userData } = await supabase.auth.getUser();
    if (userData.user) {
      await logProgressEvent(userData.user.id, 'flashcard_reviewed', {
        deckId,
        cardId: card?.id,
        knewIt,
      });
    }
    if (knewIt) setKnown((k) => k + 1);
    setFlipped(false);
    if (index + 1 < cards.length) setIndex(index + 1);
  };

  if (!card) {
    return (
      <Screen title="Flashcards">
        <Text style={{ color: theme.textMuted }}>No cards in this deck.</Text>
      </Screen>
    );
  }

  if (index >= cards.length - 1 && flipped) {
    return (
      <Screen title="Done">
        <Text style={[styles.done, { color: theme.primary }]}>
          Reviewed {cards.length} cards
        </Text>
        <Text style={{ color: theme.textMuted, textAlign: 'center' }}>
          You knew {known} well
        </Text>
      </Screen>
    );
  }

  return (
    <Screen title="Flashcards" scroll={false}>
      <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
        <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: theme.primary }]} />
      </View>

      <Pressable
        style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}
        onPress={() => setFlipped(!flipped)}
        accessibilityLabel="Flashcard tap to flip"
      >
        <Text style={[styles.cardText, { color: theme.text }]}>
          {flipped ? card.back : card.front}
        </Text>
        <Text style={[styles.hint, { color: theme.textMuted }]}>Tap to flip</Text>
      </Pressable>

      {flipped && (
        <View style={styles.actions}>
          <Button title="Don't know" variant="secondary" onPress={() => nextCard(false)} />
          <Button title="Know it" onPress={() => nextCard(true)} />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  progressBar: { height: 6, borderRadius: 3, marginBottom: 24, overflow: 'hidden' },
  progressFill: { height: '100%' },
  card: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  cardText: { fontSize: 22, textAlign: 'center', fontWeight: '500' },
  hint: { position: 'absolute', bottom: 20, fontSize: 13 },
  actions: { gap: 12 },
  done: { fontSize: 28, fontWeight: '700', textAlign: 'center', marginVertical: 24 },
});
