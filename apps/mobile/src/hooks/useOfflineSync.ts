import { useEffect } from 'react';
import { useOfflineStore } from '../stores/offlineStore';

/**
 * Monitors connectivity and processes queued offline mutations when back online.
 * Extend with NetInfo for production; MVP uses app focus as sync trigger.
 */
export function useOfflineSync() {
  const queue = useOfflineStore((s) => s.queue);
  const isOnline = useOfflineStore((s) => s.isOnline);
  const removeMutation = useOfflineStore((s) => s.removeMutation);
  const clearQueue = useOfflineStore((s) => s.clearQueue);

  useEffect(() => {
    if (!isOnline || queue.length === 0) return;

    const process = async () => {
      for (const mutation of queue) {
        // Placeholder: wire to supabase calls per mutation.type
        // Process mutation when offline queue is wired to API calls
        removeMutation(mutation.id);
      }
    };

    process().catch(console.error);
  }, [isOnline, queue, removeMutation, clearQueue]);
}
