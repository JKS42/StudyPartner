import { ScrollView, Pressable, StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../theme';
import { radius, spacing } from '../theme/colors';
import type { Folder } from '../types/database';

interface FolderFilterProps {
  folders: Folder[];
  selectedId: string | null;
  onSelect: (folderId: string | null) => void;
  onCreatePress: () => void;
}

export function FolderFilter({ folders, selectedId, onSelect, onCreatePress }: FolderFilterProps) {
  const theme = useAppTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      <Pressable
        style={[
          styles.chip,
          {
            backgroundColor: selectedId === null ? theme.primary : theme.surface,
            borderColor: theme.border,
          },
        ]}
        onPress={() => onSelect(null)}
      >
        <Text style={{ color: selectedId === null ? theme.textOnPrimary : theme.text }}>All</Text>
      </Pressable>

      {folders.map((folder) => {
        const active = selectedId === folder.id;
        return (
          <Pressable
            key={folder.id}
            style={[
              styles.chip,
              {
                backgroundColor: active ? folder.color : theme.surface,
                borderColor: active ? folder.color : theme.border,
              },
            ]}
            onPress={() => onSelect(folder.id)}
          >
            <Text style={{ color: active ? '#fff' : theme.text }} numberOfLines={1}>
              {folder.name}
            </Text>
          </Pressable>
        );
      })}

      <Pressable
        style={[styles.chip, styles.addChip, { borderColor: theme.border, backgroundColor: theme.surface }]}
        onPress={onCreatePress}
      >
        <Text style={{ color: theme.primary }}>+ Folder</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: 8, paddingBottom: spacing.sm },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    maxWidth: 140,
  },
  addChip: { borderStyle: 'dashed' },
});
