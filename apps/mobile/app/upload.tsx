import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, Pressable, StyleSheet, Text } from 'react-native';
import { Button } from '../src/components/Button';
import { Input } from '../src/components/Input';
import { LoadingOverlay } from '../src/components/LoadingOverlay';
import { Screen } from '../src/components/Screen';
import { useFolders } from '../src/hooks/useFolders';
import { queueNoteCreate } from '../src/hooks/useOfflineSync';
import { mimeToSourceType } from '../src/lib/storage';
import { saveNoteWithOptionalFile } from '../src/lib/uploadNote';
import { useOfflineStore } from '../src/stores/offlineStore';
import type { SourceType } from '../src/types/database';
import { DOCUMENT_PICKER_TYPES, resolveMimeType } from '../src/lib/validators';
import { useAppTheme } from '../src/theme';
import { radius, spacing } from '../src/theme/colors';

export default function UploadScreen() {
  const theme = useAppTheme();
  const [title, setTitle] = useState('');
  const [contentText, setContentText] = useState('');
  const [tags, setTags] = useState('');
  const [folderId, setFolderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { data: folders = [] } = useFolders();
  const isOnline = useOfflineStore((s) => s.isOnline);
  const addMutation = useOfflineStore((s) => s.addMutation);

  const parsedTags = () =>
    tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

  const persistNote = async (
    sourceType: SourceType,
    file?: { uri: string; mimeType: string; name: string }
  ) => {
    const noteTitle = title.trim();
    if (!noteTitle) {
      Alert.alert('Title required', 'Give your material a title.');
      return;
    }

    const payload = {
      title: noteTitle,
      content_text: contentText || undefined,
      source_type: sourceType,
      folder_id: folderId,
      tags: parsedTags(),
    };

    if (!isOnline && !file) {
      queueNoteCreate(payload, addMutation);
      Alert.alert('Saved offline', 'Your note will sync when you are back online.');
      router.replace('/(tabs)/library');
      return;
    }

    if (!isOnline && file) {
      Alert.alert('Offline', 'File uploads need a connection. Try again when online.');
      return;
    }

    setLoading(true);
    try {
      const note = await saveNoteWithOptionalFile({ ...payload, file });
      router.replace(`/note/${note.id}`);
    } catch (e) {
      Alert.alert('Upload failed', e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: [...DOCUMENT_PICKER_TYPES],
      copyToCacheDirectory: true,
      multiple: false,
    });
    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    const mimeType = resolveMimeType(asset.mimeType, asset.name);
    const sourceType = mimeToSourceType(mimeType);

    if (sourceType === 'voice') {
      Alert.alert('Unsupported file', 'That file type is not supported.');
      return;
    }

    const suggestedTitle = asset.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim();
    if (!title.trim() && suggestedTitle) setTitle(suggestedTitle);

    await persistNote(sourceType, {
      uri: asset.uri,
      mimeType,
      name: asset.name,
    });
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    await persistNote('image', {
      uri: asset.uri,
      mimeType: asset.mimeType ?? 'image/jpeg',
      name: asset.fileName ?? 'photo.jpg',
    });
  };

  return (
    <Screen title="Upload" scroll>
      <LoadingOverlay visible={loading} message="Uploading..." />

      <Input label="Title" value={title} onChangeText={setTitle} placeholder="e.g. Biology Chapter 3" />
      <Input
        label="Notes (optional)"
        value={contentText}
        onChangeText={setContentText}
        placeholder="Paste text or add study notes..."
        multiline
        style={styles.multiline}
      />
      <Input label="Tags" value={tags} onChangeText={setTags} placeholder="biology, exam" />

      <Text style={[styles.label, { color: theme.textMuted }]}>Folder (optional)</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.folderRow}>
            <Pressable
              style={[
                styles.folderChip,
                { borderColor: theme.border, backgroundColor: !folderId ? theme.primary : theme.surface },
              ]}
              onPress={() => setFolderId(null)}
            >
              <Text style={{ color: !folderId ? theme.textOnPrimary : theme.text }}>None</Text>
            </Pressable>
            {folders.map((f) => (
              <Pressable
                key={f.id}
                style={[
                  styles.folderChip,
                  {
                    borderColor: f.color,
                    backgroundColor: folderId === f.id ? f.color : theme.surface,
                  },
                ]}
                onPress={() => setFolderId(f.id)}
              >
                <Text style={{ color: folderId === f.id ? '#fff' : theme.text }}>{f.name}</Text>
              </Pressable>
            ))}
      </ScrollView>

      <Text style={[styles.hint, { color: theme.textMuted }]}>
        PDF, Word (.docx), images, and plain text supported (max 15 MB). Text is extracted from PDF and
        Word files when possible.
      </Text>

      <Button title="Pick PDF, Word, or text file" onPress={pickDocument} />
      <Button title="Pick image" variant="secondary" onPress={pickImage} />
      <Button title="Save text only" variant="ghost" onPress={() => persistNote('text')} />
      <Button title="Cancel" variant="ghost" onPress={() => router.back()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  multiline: { minHeight: 120, textAlignVertical: 'top', paddingTop: 12 },
  hint: { fontSize: 13, marginBottom: 16, lineHeight: 18 },
  label: { fontSize: 14, marginBottom: 8 },
  folderRow: { marginBottom: spacing.md, maxHeight: 44 },
  folderChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    marginRight: 8,
  },
});
