import { supabase } from './supabase';
import type { StudySession } from '../types/database';

export async function logProgressEvent(
  userId: string,
  eventType: string,
  payload: Record<string, unknown> = {}
) {
  await supabase.from('progress_events').insert({
    user_id: userId,
    event_type: eventType,
    payload,
  });
}

export async function logStudySession(
  session: Omit<StudySession, 'id'>
): Promise<void> {
  const { error } = await supabase.from('study_sessions').insert(session);
  if (error) throw error;
}

export async function updateStreak(userId: string): Promise<number> {
  const today = new Date().toISOString().slice(0, 10);
  const { data: profile } = await supabase
    .from('profiles')
    .select('streak_count, last_study_date')
    .eq('id', userId)
    .single();

  if (!profile) return 0;

  let streak = profile.streak_count ?? 0;
  const last = profile.last_study_date;

  if (last === today) return streak;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  if (last === yesterdayStr) {
    streak += 1;
  } else {
    streak = 1;
  }

  await supabase
    .from('profiles')
    .update({ streak_count: streak, last_study_date: today })
    .eq('id', userId);

  return streak;
}
