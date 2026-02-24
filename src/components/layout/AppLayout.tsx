import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function AppLayout() {
    return (
        <div className="flex h-screen overflow-hidden bg-dark-950">
            <Sidebar />
            <main className="flex-1 overflow-hidden">
                <Outlet />
            </main>
        </div>
    );
}
