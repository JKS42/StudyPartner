import {
  buildLocalFlashcards,
  buildLocalQuizQuestions,
  normalizeFlashcards,
  normalizeQuizQuestions,
} from '../studyContent';

describe('studyContent', () => {
  it('builds local quiz questions from note text', () => {
    const questions = buildLocalQuizQuestions(
      { title: 'Biology', content_text: 'Cells are the basic unit of life. Mitosis divides cells.' },
      2
    );
    expect(questions.length).toBeGreaterThan(0);
    expect(questions[0].options.length).toBeGreaterThanOrEqual(2);
  });

  it('builds local flashcards from note text', () => {
    const cards = buildLocalFlashcards(
      { title: 'History', content_text: 'World War II ended in 1945. The UN was founded after the war.' },
      2
    );
    expect(cards.length).toBe(2);
    expect(cards[0].front).toContain('History');
  });

  it('normalizes quiz JSON wrapped in questions key', () => {
    const questions = normalizeQuizQuestions({
      questions: [
        {
          question: 'Q1?',
          options: ['A', 'B', 'C', 'D'],
          correct_index: 1,
          explanation: 'Because B',
        },
      ],
    });
    expect(questions[0]?.correctIndex).toBe(1);
  });

  it('normalizes flashcards wrapped in cards key', () => {
    const cards = normalizeFlashcards({
      cards: [{ front: 'Term', back: 'Definition' }],
    });
    expect(cards).toEqual([{ front: 'Term', back: 'Definition' }]);
  });

  it('builds flashcards from term: definition lines', () => {
    const cards = buildLocalFlashcards(
      {
        title: 'Bio',
        content_text: 'Mitosis: cell division\nPhotosynthesis: converts light to energy',
      },
      4
    );
    expect(cards[0]?.front).toBe('Mitosis');
    expect(cards[0]?.back).toContain('cell division');
  });
});
