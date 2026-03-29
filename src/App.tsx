import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import AppLayout from './components/layout/AppLayout';
import AdminLayout from './components/layout/AdminLayout';
import InboxPage from './pages/InboxPage';
import CalendarPage from './pages/CalendarPage';
import PropertyWizardPage from './pages/PropertyWizardPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import AdminPage from './pages/AdminPage';
import { useAuth } from './api/useAuth';
import { useIsAdmin } from './api/useIsAdmin';

const queryClient = new QueryClient();

// ── Route guards ──────────────────────────────────────────────

function FullscreenSpinner() {
    return (
        <div className="h-screen flex items-center justify-center bg-dark-950">
            <Loader2 size={24} className="text-accent animate-spin" />
        </div>
    );
}

/** Redirects unauthenticated users to /login. */
function RequireAuth() {
    const { isAuthenticated, loading } = useAuth();
    if (loading) return <FullscreenSpinner />;
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    return <Outlet />;
}

/**
 * Blocks non-admin users from /admin routes.
 * Must be nested inside RequireAuth (user is guaranteed to exist here).
 *
 * Two-layered security:
 *  1. This guard redirects non-admins away from the route.
 *  2. Even if bypassed, every Supabase query on /admin returns empty/throws
 *     because RLS policies call is_admin() server-side on every request.
 */
function RequireAdmin() {
    const { isAdmin, isLoading } = useIsAdmin();
    if (isLoading) return <FullscreenSpinner />;
    if (!isAdmin) return <Navigate to="/inbox" replace />;
    return <Outlet />;
}

// ── App ───────────────────────────────────────────────────────

function AppRoutes() {
    return (
        <Routes>
            {/* Public */}
            <Route path="/login"         element={<LoginPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />

            {/* Protected host routes */}
            <Route element={<RequireAuth />}>
                <Route element={<AppLayout />}>
                    <Route path="/"        element={<Navigate to="/inbox" replace />} />
                    <Route path="/inbox"   element={<InboxPage />} />
                    <Route path="/calendar" element={<CalendarPage />} />
                    <Route path="/config"  element={<PropertyWizardPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                </Route>
            </Route>

            {/* Admin routes — separate layout, double-guarded */}
            <Route element={<RequireAuth />}>
                <Route element={<RequireAdmin />}>
                    <Route element={<AdminLayout />}>
                        <Route path="/admin" element={<AdminPage />} />
                    </Route>
                </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/inbox" replace />} />
        </Routes>
    );
}

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <AppRoutes />
            </BrowserRouter>
        </QueryClientProvider>
    );
}
