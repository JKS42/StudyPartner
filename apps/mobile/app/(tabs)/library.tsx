import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FolderFilter } from '../../src/components/FolderFilter';
import { Input } from '../../src/components/Input';
import { NoteCard } from '../../src/components/NoteCard';
import { Screen } from '../../src/components/Screen';
import { useCreateFolder, useFolders } from '../../src/hooks/useFolders';
import { useNotes } from '../../src/hooks/useNotes';
import { useOfflineStore } from '../../src/stores/offlineStore';
import { useAppTheme } from '../../src/theme';
import { palette, radius, spacing } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';

export default function LibraryScreen() {
  const theme = useAppTheme();
  const [search, setSearch] = useState('');
  const [folderId, setFolderId] = useState<string | null>(null);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const { data: notes, isLoading } = useNotes(search, folderId);
  const { data: folders = [] } = useFolders();
  const createFolder = useCreateFolder();
  const offlineCount = useOfflineStore((s) => s.queue.length);

  const handleCreateFolder = async () => {
    const name = newFolderName.trim();
    if (!name) {
      Alert.alert('Name required', 'Enter a folder name.');
      return;
    }
    try {
      const folder = await createFolder.mutateAsync({ name });
      setFolderId(folder.id);
      setNewFolderName('');
      setShowNewFolder(false);
    } catch (e) {
      Alert.alert('Could not create folder', e instanceof Error ? e.message : 'Unknown error');
    }
  };

  return (
    <Screen title="My Library" subtitle={`${notes?.length ?? 0} materials`} scroll={false}>
      {offlineCount > 0 ? (
        <Text style={[styles.offlineBanner, { color: theme.textMuted }]}>
          {offlineCount} note{offlineCount === 1 ? '' : 's'} waiting to sync
        </Text>
      ) : null}

      <FolderFilter
        folders={folders}
        selectedId={folderId}
        onSelect={setFolderId}
        onCreatePress={() => setShowNewFolder((v) => !v)}
      />

      {showNewFolder ? (
        <View style={styles.newFolderRow}>
          <Input
            placeholder="Folder name"
            value={newFolderName}
            onChangeText={setNewFolderName}
            style={styles.newFolderInput}
          />
          <Pressable
            style={[styles.createBtn, { backgroundColor: theme.primary }]}
            onPress={handleCreateFolder}
          >
            <Text style={{ color: theme.textOnPrimary, fontWeight: '600' }}>Add</Text>
          </Pressable>
        </View>
      ) : null}

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
            <Text style={styles.empty}>
              {folderId ? 'No materials in this folder yet.' : 'Your study library is empty. Tap + to upload.'}
            </Text>
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
  offlineBanner: { fontSize: 13, marginBottom: spacing.sm },
  newFolderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: spacing.sm },
  newFolderInput: { flex: 1, marginBottom: 0 },
  createBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: radius.pill,
    marginBottom: 12,
  },
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
