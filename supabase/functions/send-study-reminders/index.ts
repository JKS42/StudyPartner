import { adminClient } from '../_shared/auth.ts';
import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { chunkMessages, sendExpoPush } from '../_shared/expo-push.ts';

/**
 * Sends streak / study reminders to users who opted in and have not studied today.
 * Invoke on a schedule (e.g. Supabase cron at 18:00 UTC) with service role / cron secret.
 */
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const cronSecret = Deno.env.get('CRON_SECRET');
  const authHeader = req.headers.get('Authorization');
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  try {
    const supabase = adminClient();
    const today = new Date().toISOString().slice(0, 10);

    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, display_name, streak_count, last_study_date')
      .eq('push_notifications_enabled', true)
      .or(`last_study_date.is.null,last_study_date.neq.${today}`);

    if (profileError) throw profileError;
    if (!profiles?.length) {
      return jsonResponse({ success: true, sent: 0, message: 'No users need reminders' });
    }

    const userIds = profiles.map((p) => p.id);
    const { data: tokenRows, error: tokenError } = await supabase
      .from('push_tokens')
      .select('user_id, expo_push_token')
      .in('user_id', userIds);

    if (tokenError) throw tokenError;

    const profileById = new Map(profiles.map((p) => [p.id, p]));
    const messages = (tokenRows ?? []).map((row) => {
      const profile = profileById.get(row.user_id);
      const streak = profile?.streak_count ?? 0;
      const name = profile?.display_name?.split(' ')[0] ?? 'there';

      return {
        to: row.expo_push_token,
        title: streak > 0 ? `Keep your ${streak}-day streak!` : 'Time to study',
        body:
          streak > 0
            ? `Hey ${name}, open StudyPartner for a quick session before the day ends.`
            : `Hey ${name}, a short study session now beats cramming later.`,
        sound: 'default' as const,
        channelId: 'studypartner-default',
        data: { url: '/(tabs)/study' },
      };
    });

    if (!messages.length) {
      return jsonResponse({ success: true, sent: 0, message: 'No push tokens found' });
    }

    let sent = 0;
    for (const batch of chunkMessages(messages)) {
      const res = await sendExpoPush(batch);
      const result = await res.json();
      if (!res.ok) throw new Error(JSON.stringify(result));
      sent += batch.length;
    }

    return jsonResponse({ success: true, sent, users: profiles.length });
  } catch (e) {
    return jsonResponse({ error: e instanceof Error ? e.message : 'Server error' }, 500);
  }
});
