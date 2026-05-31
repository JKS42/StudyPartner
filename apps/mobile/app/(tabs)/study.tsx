import { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../../src/components/Button';
import { Screen } from '../../src/components/Screen';
import { logProgressEvent, logStudySession, updateStreak } from '../../src/lib/progress';
import { supabase } from '../../src/lib/supabase';
import { useTimerStore } from '../../src/stores/timerStore';
import { palette, radius, spacing } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function StudyScreen() {
  const {
    phase,
    secondsLeft,
    isRunning,
    focusMinutes,
    breakMinutes,
    linkedNoteId,
    startFocus,
    startBreak,
    tick,
    pause,
    resume,
    reset,
  } = useTimerStore();

  const startedAt = useRef<string | null>(null);
  const totalSeconds = (phase === 'break' ? breakMinutes : focusMinutes) * 60;
  const progress = totalSeconds > 0 ? 1 - secondsLeft / totalSeconds : 0;

  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(() => tick(), 1000);
    return () => clearInterval(id);
  }, [isRunning, tick]);

  useEffect(() => {
    if (secondsLeft > 0 || !startedAt.current) return;

    const completeSession = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const duration = phase === 'focus' ? focusMinutes * 60 : breakMinutes * 60;
      await logStudySession({
        user_id: userData.user.id,
        note_id: linkedNoteId,
        deck_id: null,
        type: 'pomodoro',
        duration_seconds: duration,
        started_at: startedAt.current!,
        ended_at: new Date().toISOString(),
      });
      await logProgressEvent(userData.user.id, 'pomodoro_completed', { phase });
      if (phase === 'focus') await updateStreak(userData.user.id);
      startedAt.current = null;
      reset();
    };

    completeSession();
  }, [secondsLeft, phase, focusMinutes, breakMinutes, linkedNoteId, reset]);

  const handleStartFocus = () => {
    startedAt.current = new Date().toISOString();
    startFocus();
  };

  const phaseLabel =
    phase === 'idle' ? 'Pomodoro' : phase === 'focus' ? 'Focus session' : 'Break time';

  return (
    <Screen title="Focus Timer" subtitle="Stay in the zone" scroll={false}>
      <View style={styles.center}>
        <View style={styles.ringOuter}>
          <View style={[styles.ringProgress, { opacity: 0.15 + progress * 0.85 }]} />
          <View style={styles.ringInner}>
            <Text style={styles.phase}>{phaseLabel}</Text>
            <Text style={styles.timer} accessibilityLabel="Timer">
              {formatTime(secondsLeft)}
            </Text>
          </View>
        </View>

        <View style={styles.controls}>
          {phase === 'idle' ? (
            <Button title="Start focus · 25 min" onPress={handleStartFocus} />
          ) : (
            <>
              <Button
                title={isRunning ? 'Pause' : 'Resume'}
                variant="secondary"
                onPress={isRunning ? pause : resume}
              />
              {phase === 'focus' && secondsLeft > 0 ? (
                <Button title="Start break" variant="ghost" onPress={startBreak} />
              ) : null}
              <Button title="Reset" variant="ghost" onPress={reset} />
            </>
          )}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 100 },
  ringOuter: {
    width: 260,
    height: 260,
    borderRadius: radius.pill,
    backgroundColor: palette.navy,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  ringProgress: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radius.pill,
    backgroundColor: palette.orange,
  },
  ringInner: {
    width: 220,
    height: 220,
    borderRadius: radius.pill,
    backgroundColor: palette.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phase: { ...typography.caption, color: 'rgba(255,255,255,0.75)', marginBottom: 8 },
  timer: {
    fontSize: 56,
    fontWeight: '200',
    color: palette.white,
    fontVariant: ['tabular-nums'],
  },
  controls: { width: '100%', gap: 12, paddingHorizontal: spacing.lg },
});
