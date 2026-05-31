import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../../src/components/Input';
import { NoteCard } from '../../src/components/NoteCard';
import { Screen } from '../../src/components/Screen';
import { useNotes } from '../../src/hooks/useNotes';
import { useAppTheme } from '../../src/theme';
import { palette, radius, spacing } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';

export default function LibraryScreen() {
  const theme = useAppTheme();
  const [search, setSearch] = useState('');
  const { data: notes, isLoading } = useNotes(search);

  return (
    <Screen title="My Library" subtitle={`${notes?.length ?? 0} materials`} scroll={false}>
      <View style={styles.searchWrap}>
        <Input
          placeholder="Search notes..."
          value={search}
          onChangeText={setSearch}
          accessibilityLabel="Search notes"
          style={styles.searchInput}
        />
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <ActivityIndicator color={palette.orange} style={{ marginTop: 40 }} />
        ) : (
          notes?.map((note, i) => (
            <NoteCard
              key={note.id}
              note={note}
              index={i}
              onPress={() => router.push(`/note/${note.id}`)}
            />
          ))
        )}

        {!isLoading && (notes?.length ?? 0) === 0 && (
          <View style={styles.emptyBox}>
            <Text style={styles.empty}>Your study library is empty. Tap + to upload.</Text>
          </View>
        )}
      </ScrollView>

      <Pressable
        style={styles.fab}
        onPress={() => router.push('/upload')}
        accessibilityRole="button"
        accessibilityLabel="Upload new material"
      >
        <Ionicons name="add" size={28} color={palette.white} />
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchWrap: { marginBottom: spacing.sm },
  searchInput: { marginBottom: spacing.md },
  list: { paddingBottom: 120 },
  emptyBox: {
    backgroundColor: palette.emptyBlue,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginTop: spacing.lg,
  },
  empty: { ...typography.body, color: palette.white, textAlign: 'center' },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 100,
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: palette.orange,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
});
