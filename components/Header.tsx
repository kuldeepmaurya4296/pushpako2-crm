"use client";

import { useAuthStore } from '../store/authStore';
import { Menu } from 'lucide-react';

export default function Header({
    setSidebarOpen
}: {
    setSidebarOpen: (open: boolean) => void;
}) {
    const { user } = useAuthStore();

    return (
        <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200">
            <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-500 hover:text-gray-700"
            >
                <Menu className="w-6 h-6" />
            </button>

            <div className="flex items-center ml-auto space-x-4">
                <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
                    <p className="text-xs text-gray-500">{user?.role.replace('_', ' ')}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary-700">
                        {user?.fullName?.charAt(0).toUpperCase() || 'U'}
                    </span>
                </div>
            </div>
        </header>
    );
}
