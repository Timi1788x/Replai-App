import { create } from 'zustand';

type SortBy = 'created_at' | 'email' | 'is_active' | 'property_count';
type SortDir = 'asc' | 'desc';

interface AdminStore {
    selectedUserId: string | null;
    searchQuery: string;
    sortBy: SortBy;
    sortDir: SortDir;

    selectUser: (id: string | null) => void;
    setSearch: (q: string) => void;
    setSort: (by: SortBy, dir: SortDir) => void;
}

// No persist — admin UI state must not survive tab close.
export const useAdminStore = create<AdminStore>((set) => ({
    selectedUserId: null,
    searchQuery: '',
    sortBy: 'created_at',
    sortDir: 'desc',

    selectUser: (id) => set({ selectedUserId: id }),
    setSearch: (q) => set({ searchQuery: q }),
    setSort: (by, dir) => set({ sortBy: by, sortDir: dir }),
}));
