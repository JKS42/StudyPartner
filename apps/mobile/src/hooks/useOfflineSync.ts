import { useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { useOfflineStore } from '../stores/offlineStore';
import { processOfflineMutation } from '../lib/offlineProcessor';
import { useQueryClient } from '@tanstack/react-query';

export function useOfflineSync() {
  const queue = useOfflineStore((s) => s.queue);
  const isOnline = useOfflineStore((s) => s.isOnline);
  const setOnline = useOfflineStore((s) => s.setOnline);
  const removeMutation = useOfflineStore((s) => s.removeMutation);
  const client = useQueryClient();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const online = Boolean(state.isConnected && state.isInternetReachable !== false);
      setOnline(online);
    });

    NetInfo.fetch().then((state) => {
      setOnline(Boolean(state.isConnected && state.isInternetReachable !== false));
    });

    return unsubscribe;
  }, [setOnline]);

  useEffect(() => {
    if (!isOnline || queue.length === 0) return;

    const process = async () => {
      for (const mutation of [...queue]) {
        try {
          await processOfflineMutation(mutation);
          removeMutation(mutation.id);
        } catch (e) {
          console.warn('Offline sync failed for mutation', mutation.id, e);
          break;
        }
      }
      await client.invalidateQueries({ queryKey: ['notes'] });
    };

    process().catch(console.error);
  }, [isOnline, queue, removeMutation, client]);
}

export function queueNoteCreate(
  payload: {
    title: string;
    content_text?: string;
    source_type: import('../types/database').SourceType;
    folder_id?: string | null;
    tags?: string[];
  },
  addMutation: (mutation: { id: string; type: 'note_create'; payload: Record<string, unknown> }) => void
): string {
  const id = `offline-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  addMutation({ id, type: 'note_create', payload });
  return id;
}
