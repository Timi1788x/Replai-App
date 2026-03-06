/// <reference types="vite/client" />

interface ImportMetaEnv {
    /** Self-hosted Supabase REST URL, e.g. https://api.hostbuddy.at */
    readonly VITE_SUPABASE_URL: string;
    /** Supabase anonymous (public) key */
    readonly VITE_SUPABASE_ANON_KEY: string;
    /** n8n webhook for knowledge-base sync */
    readonly VITE_N8N_WEBHOOK_URL: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
