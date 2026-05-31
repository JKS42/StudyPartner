import { StyleSheet, Text, View } from 'react-native';
import { Card } from './Card';
import { cardAccents } from '../theme/colors';
import { typography } from '../theme/typography';
import type { Note } from '../types/database';

interface NoteCardProps {
  note: Note;
  onPress: () => void;
  index?: number;
  compact?: boolean;
}

function accentForNote(noteId: string, index: number): string {
  const hash = noteId.charCodeAt(0) + index;
  return cardAccents[hash % cardAccents.length];
}

export function NoteCard({ note, onPress, index = 0, compact }: NoteCardProps) {
  const accent = accentForNote(note.id, index);
  const isLightText = true;

  return (
    <Card
      onPress={onPress}
      accent={accent}
      accessibilityLabel={`Open note ${note.title}`}
      style={compact ? styles.compact : undefined}
    >
      <View style={styles.row}>
        <View style={styles.icon}>
          <Text style={styles.iconText}>{note.source_type[0]?.toUpperCase()}</Text>
        </View>
        <View style={styles.body}>
          <Text
            style={[styles.title, isLightText && styles.lightText]}
            numberOfLines={compact ? 1 : 2}
          >
            {note.title}
          </Text>
          {!compact && note.tags.length > 0 ? (
            <Text style={styles.metaLight}>{note.tags.slice(0, 2).join(' · ')}</Text>
          ) : null}
        </View>
        <Text style={[styles.type, isLightText && styles.lightText]}>
          {note.source_type.toUpperCase()}
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  compact: { minWidth: 160, marginRight: 12, marginBottom: 0 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  body: { flex: 1 },
  title: { ...typography.h3 },
  lightText: { color: '#fff' },
  metaLight: { ...typography.caption, color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  type: { ...typography.caption, fontWeight: '700' },
});
