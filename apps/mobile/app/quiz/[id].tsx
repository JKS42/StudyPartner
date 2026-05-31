import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../../src/components/Button';
import { Screen } from '../../src/components/Screen';
import { logProgressEvent } from '../../src/lib/progress';
import { normalizeQuizQuestions } from '../../src/lib/studyContent';
import { supabase } from '../../src/lib/supabase';
import { useAppTheme } from '../../src/theme';

export default function QuizScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useAppTheme();
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [finished, setFinished] = useState(false);

  const { data: quiz } = useQuery({
    queryKey: ['quiz', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('quizzes').select('*').eq('id', id!).single();
      if (error) throw error;
      const questions = normalizeQuizQuestions(data.questions_json);
      return {
        ...data,
        questions,
      };
    },
  });

  const questions = quiz?.questions ?? [];
  const current = questions[index];

  const submitAnswer = () => {
    if (selected === null || !current) return;
    const correct = selected === current.correctIndex;
    const newScore = score + (correct ? 1 : 0);
    const newAnswers = [...answers, selected];
    setAnswers(newAnswers);
    setScore(newScore);
    setSelected(null);

    if (index + 1 >= questions.length) {
      finishQuiz(newScore, newAnswers);
    } else {
      setIndex(index + 1);
    }
  };

  const finishQuiz = async (finalScore: number, finalAnswers: number[]) => {
    setFinished(true);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user || !quiz) return;

    const percent = Math.round((finalScore / questions.length) * 100);
    await supabase.from('quiz_attempts').insert({
      quiz_id: quiz.id,
      user_id: userData.user.id,
      score: percent,
      answers_json: finalAnswers,
    });
    await logProgressEvent(userData.user.id, 'quiz_completed', {
      quizId: quiz.id,
      score: percent,
    });
  };

  if (!quiz || questions.length === 0) {
    return (
      <Screen title="Quiz">
        <Text style={{ color: theme.textMuted }}>
          {quiz ? 'This quiz has no valid questions yet.' : 'Loading quiz...'}
        </Text>
      </Screen>
    );
  }

  if (finished) {
    const percent = Math.round((score / questions.length) * 100);
    return (
      <Screen title="Results">
        <Text style={[styles.score, { color: theme.primary }]}>{percent}%</Text>
        <Text style={{ color: theme.text, textAlign: 'center', marginBottom: 24 }}>
          You got {score} of {questions.length} correct
        </Text>
        <Button title="Done" onPress={() => Alert.alert('Great job!', 'Quiz saved to your progress.')} />
      </Screen>
    );
  }

  return (
    <Screen title={quiz.title} scroll={false}>
      <Text style={[styles.progress, { color: theme.textMuted }]}>
        Question {index + 1} of {questions.length}
      </Text>
      <Text style={[styles.question, { color: theme.text }]}>{current.question}</Text>

      {current.options.map((opt: string, i: number) => (
        <Pressable
          key={i}
          style={[
            styles.option,
            {
              borderColor: selected === i ? theme.primary : theme.border,
              backgroundColor: theme.surface,
            },
          ]}
          onPress={() => setSelected(i)}
        >
          <Text style={{ color: theme.text }}>{opt}</Text>
        </Pressable>
      ))}

      <Button title="Submit" onPress={submitAnswer} disabled={selected === null} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  progress: { marginBottom: 12 },
  question: { fontSize: 20, fontWeight: '600', marginBottom: 20 },
  option: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    minHeight: 48,
    justifyContent: 'center',
  },
  score: { fontSize: 64, fontWeight: '700', textAlign: 'center', marginVertical: 24 },
});
