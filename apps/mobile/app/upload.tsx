import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';
import { Button } from '../src/components/Button';
import { Input } from '../src/components/Input';
import { LoadingOverlay } from '../src/components/LoadingOverlay';
import { Screen } from '../src/components/Screen';
import { useCreateNote } from '../src/hooks/useNotes';
import { supabase } from '../src/lib/supabase';
import { mimeToSourceType, uploadNoteFile } from '../src/lib/storage';
import type { SourceType } from '../src/types/database';
import { DOCUMENT_PICKER_TYPES, resolveMimeType } from '../src/lib/validators';
import { useAppTheme } from '../src/theme';

export default function UploadScreen() {
  const theme = useAppTheme();
  const [title, setTitle] = useState('');
  const [contentText, setContentText] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const createNote = useCreateNote();

  const saveNote = async (
    sourceType: SourceType,
    file?: { uri: string; mimeType: string; name: string }
  ) => {
    if (!title.trim()) {
      Alert.alert('Title required', 'Give your material a title.');
      return;
    }

    setLoading(true);
    try {
      const note = await createNote.mutateAsync({
        title: title.trim(),
        content_text: contentText || undefined,
        source_type: sourceType,
        tags: tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      });

      if (file) {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) throw new Error('Not authenticated');

        const { storagePath, sizeBytes, mimeType } = await uploadNoteFile(
          userData.user.id,
          note.id,
          file.uri,
          file.mimeType,
          file.name
        );

        await supabase.from('files').insert({
          note_id: note.id,
          storage_path: storagePath,
          mime_type: mimeType,
          size_bytes: sizeBytes,
        });

        await supabase.from('notes').update({ status: 'ready' }).eq('id', note.id);
      }

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
    if (!title.trim() && suggestedTitle) {
      setTitle(suggestedTitle);
    }

    const noteTitle = title.trim() || suggestedTitle;
    if (!noteTitle) {
      Alert.alert('Title required', 'Give your material a title.');
      return;
    }

    setLoading(true);
    try {
      const note = await createNote.mutateAsync({
        title: noteTitle,
        content_text: contentText || undefined,
        source_type: sourceType,
        tags: tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      });

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      const { storagePath, sizeBytes, mimeType: storedMime } = await uploadNoteFile(
        userData.user.id,
        note.id,
        asset.uri,
        mimeType,
        asset.name
      );

      await supabase.from('files').insert({
        note_id: note.id,
        storage_path: storagePath,
        mime_type: storedMime,
        size_bytes: sizeBytes,
      });

      await supabase.from('notes').update({ status: 'ready' }).eq('id', note.id);
      router.replace(`/note/${note.id}`);
    } catch (e) {
      Alert.alert('Upload failed', e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    await saveNote('image', {
      uri: asset.uri,
      mimeType: asset.mimeType ?? 'image/jpeg',
      name: asset.fileName ?? 'photo.jpg',
    });
  };

  const saveTextOnly = () => saveNote('text');

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

      <Text style={[styles.hint, { color: theme.textMuted }]}>
        PDF, Word (.doc/.docx), images, and plain text supported (max 15 MB).
      </Text>

      <Button title="Pick PDF, Word, or text file" onPress={pickDocument} />
      <Button title="Pick image" variant="secondary" onPress={pickImage} />
      <Button title="Save text only" variant="ghost" onPress={saveTextOnly} />
      <Button title="Cancel" variant="ghost" onPress={() => router.back()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  multiline: { minHeight: 120, textAlignVertical: 'top', paddingTop: 12 },
  hint: { fontSize: 13, marginBottom: 16 },
});
