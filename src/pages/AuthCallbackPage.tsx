import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase } from '../api/supabaseClient';

/**
 * Landing page for the OAuth redirect from Google.
 * Supabase JS v2 (PKCE flow) exchanges the ?code= param automatically
 * on getSession(). We then check admin status and redirect accordingly.
 */
export default function AuthCallbackPage() {
    const navigate = useNavigate();

    useEffect(() => {
        let cancelled = false;

        const handleCallback = async () => {
            // Exchange the code for a session (PKCE flow).
            // supabase-js v2 handles this automatically when the URL
            // contains a `code` query param.
            const { data: { session }, error } = await supabase.auth.getSession();

            if (cancelled) return;

            if (error || !session) {
                navigate('/login', { replace: true });
                return;
            }

            // DB-based admin check — never trust JWT metadata.
            const { data: isAdmin } = await supabase.rpc('is_admin', {
                uid: session.user.id,
            });

            if (cancelled) return;
            navigate(isAdmin ? '/admin' : '/inbox', { replace: true });
        };

        handleCallback();
        return () => { cancelled = true; };
    }, [navigate]);

    return (
        <div className="h-screen flex items-center justify-center bg-dark-950">
            <Loader2 size={28} className="text-accent animate-spin" />
        </div>
    );
}
