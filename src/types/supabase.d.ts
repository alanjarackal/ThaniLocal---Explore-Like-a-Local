import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

declare module '@supabase/supabase-js' {
  interface RealtimeChannel {
    on<T = any>(
      type: 'system' | 'presence' | 'postgres_changes' | 'broadcast',
      filter: {
        event: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
        schema?: string;
        table: string;
        filter?: string;
        value?: any[];
      },
      callback: (payload: RealtimePostgresChangesPayload<T>) => void
    ): RealtimeChannel;
  }
} 