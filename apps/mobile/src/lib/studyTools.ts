import { supabase } from './supabase';
import { buildLocalFlashcards, buildLocalQuizQuestions } from './studyContent';

async function fetchNote(noteId: string) {
  const { data: note, error } = await supabase
    .from('notes')
    .select('id, title, content_text')
    .eq('id', noteId)
    .is('deleted_at', null)
    .single();

  if (error || !note) throw new Error('Note not found');
  return note;
}

export async function generateQuiz(
  noteId: string,
  questionCount = 8
): Promise<{ quiz: unknown }> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('Not authenticated');

  const note = await fetchNote(noteId);
  const questions = buildLocalQuizQuestions(note, questionCount);

  const { data: quiz, error } = await supabase
    .from('quizzes')
    .insert({
      note_id: noteId,
      title: `Quiz: ${note.title}`,
      questions_json: questions,
      difficulty: 'medium',
    })
    .select()
    .single();

  if (error) throw error;
  return { quiz };
}

export async function generateFlashcards(
  noteId: string,
  cardCount = 12
): Promise<{ deck: unknown; cardCount: number }> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('Not authenticated');

  const note = await fetchNote(noteId);
  const cards = buildLocalFlashcards(note, cardCount);

  const { data: deck, error: deckError } = await supabase
    .from('flashcard_decks')
    .insert({
      user_id: userData.user.id,
      note_id: noteId,
      title: `Flashcards: ${note.title}`,
    })
    .select()
    .single();

  if (deckError || !deck) throw deckError;

  const { error: cardsError } = await supabase.from('flashcards').insert(
    cards.map((card) => ({
      deck_id: deck.id,
      front: card.front,
      back: card.back,
    }))
  );

  if (cardsError) throw cardsError;
  return { deck, cardCount: cards.length };
}
