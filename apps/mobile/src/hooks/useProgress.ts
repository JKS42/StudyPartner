import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export function useWeeklyProgress() {
  return useQuery({
    queryKey: ['progress', 'weekly'],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return { minutes: 0, quizzes: 0, cards: 0, sessions: [] };

      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const [sessionsRes, attemptsRes, eventsRes] = await Promise.all([
        supabase
          .from('study_sessions')
          .select('*')
          .eq('user_id', userData.user.id)
          .gte('started_at', weekAgo.toISOString()),
        supabase
          .from('quiz_attempts')
          .select('*, quizzes(title)')
          .eq('user_id', userData.user.id)
          .gte('completed_at', weekAgo.toISOString()),
        supabase
          .from('progress_events')
          .select('*')
          .eq('user_id', userData.user.id)
          .eq('event_type', 'flashcard_reviewed')
          .gte('created_at', weekAgo.toISOString()),
      ]);

      const sessions = sessionsRes.data ?? [];
      const minutes = Math.round(
        sessions.reduce((sum, s) => sum + (s.duration_seconds ?? 0), 0) / 60
      );

      return {
        minutes,
        quizzes: attemptsRes.data?.length ?? 0,
        cards: eventsRes.data?.length ?? 0,
        sessions,
        attempts: attemptsRes.data ?? [],
      };
    },
  });
}
