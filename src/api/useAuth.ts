import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import type { Session, User } from '@supabase/supabase-js';

// ─── Hook ─────────────────────────────────────────────────────
/**
 * Manages Supabase Auth session state.
 *
 * - Automatically listens for auth state changes (login, logout, token refresh)
 * - Provides the current `user`, `session`, and loading state
 * - All other hooks should check `user` before making queries
 */
export function useAuth() {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session: s } }) => {
            setSession(s);
            setUser(s?.user ?? null);
            setLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, s) => {
                setSession(s);
                setUser(s?.user ?? null);
                setLoading(false);
            },
        );

        return () => subscription.unsubscribe();
    }, []);

    // ── Auth actions ──
    const signInWithEmail = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
    };

    const signUpWithEmail = async (email: string, password: string) => {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
    };

    const signInWithGoogle = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: `${window.location.origin}/auth/callback` },
        });
        if (error) throw error;
    };

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    };

    return {
        session,
        user,
        loading,
        isAuthenticated: !!session,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signOut,
    };
}
