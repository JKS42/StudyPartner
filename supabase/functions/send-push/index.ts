import { getUserFromRequest, adminClient } from '../_shared/auth.ts';
import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { chunkMessages, sendExpoPush } from '../_shared/expo-push.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const auth = await getUserFromRequest(req);
    if (!auth) return jsonResponse({ error: 'Unauthorized' }, 401);

    const { title, body, data, userId } = await req.json();
    if (!title || !body) return jsonResponse({ error: 'title and body required' }, 400);

    const targetUserId = userId ?? auth.user.id;
    if (targetUserId !== auth.user.id) {
      return jsonResponse({ error: 'Cannot send push to other users' }, 403);
    }

    const supabase = adminClient();
    const { data: tokens, error } = await supabase
      .from('push_tokens')
      .select('expo_push_token')
      .eq('user_id', targetUserId);

    if (error) throw error;
    if (!tokens?.length) {
      return jsonResponse({ error: 'No push tokens registered for this user' }, 404);
    }

    const messages = tokens.map((row) => ({
      to: row.expo_push_token,
      title,
      body,
      sound: 'default' as const,
      channelId: 'studypartner-default',
      data: data ?? {},
    }));

    let sent = 0;
    for (const batch of chunkMessages(messages)) {
      const res = await sendExpoPush(batch);
      const result = await res.json();
      if (!res.ok) throw new Error(JSON.stringify(result));
      sent += batch.length;
    }

    return jsonResponse({ success: true, sent });
  } catch (e) {
    return jsonResponse({ error: e instanceof Error ? e.message : 'Server error' }, 500);
  }
});
