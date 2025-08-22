import { useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

type SubscriptionCallback<T extends Record<string, any>> = (payload: {
  new: T;
  old: T | null;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
}) => void;

export function useRealtimeSubscription<T extends Record<string, any>>(
  table: string,
  callback: SubscriptionCallback<T>,
  filters?: {
    event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
    filter?: string;
    filterValues?: any[];
  }
) {
  useEffect(() => {
    let channel: RealtimeChannel;

    const setupSubscription = async () => {
      // Create a new real-time channel
      channel = supabase.channel(`public:${table}`, {
        config: {
          broadcast: { self: true },
          presence: { key: '' },
        },
      });

      channel
        .on('postgres_changes', {
          event: filters?.event || '*',
          schema: 'public',
          table: table,
          ...(filters?.filter && {
            filter: filters.filter,
            value: filters.filterValues,
          }),
        }, (payload: RealtimePostgresChangesPayload<T>) => {
          callback({
            new: payload.new as T,
            old: payload.old as T | null,
            eventType: payload.eventType,
          });
        })
        .subscribe();
    };

    setupSubscription();

    // Cleanup subscription on unmount
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [table, callback, filters]);
} 