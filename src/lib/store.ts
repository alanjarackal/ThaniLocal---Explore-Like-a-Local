import { create } from 'zustand';
import { supabase } from './supabaseClient';
import type { Profile } from './types';

interface AuthState {
  user: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, profile: Omit<Profile, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  signOut: () => Promise<void>;
  loadUser: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  loading: true,
  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  },
  signUp: async (email, password, profile) => {
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });
    if (signUpError) throw signUpError;

    if (authData.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{ id: authData.user.id, ...profile }]);
      if (profileError) throw profileError;
    }
  },
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    set({ user: null });
  },
  loadUser: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        set({ user: profile });
      }
    } finally {
      set({ loading: false });
    }
  },
}));