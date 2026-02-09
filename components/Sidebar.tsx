"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '../store/authStore';
import {
    LayoutDashboard,
    ClipboardList,
    Clock,
    Users,
    FolderKanban,
    MessageSquare,
    User,
    LogOut,
    X,
} from 'lucide-react';

export default function Sidebar({
    isOpen,
    setIsOpen
}: {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}) {
    const { clearAuth } = useAuthStore();
    const pathname = usePathname();

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Tasks', href: '/tasks', icon: ClipboardList },
        { name: 'Attendance', href: '/attendance', icon: Clock },
        { name: 'Projects', href: '/projects', icon: FolderKanban },
        { name: 'Teams', href: '/teams', icon: Users },
        { name: 'Chat', href: '/chat', icon: MessageSquare },
    ];

    const handleLogout = () => {
        clearAuth();
        window.location.href = '/login';
    };

    return (
        <>
            {/* Mobile sidebar backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-gray-900 bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
                        <h1 className="text-xl font-bold text-primary-600">PushpakO2</h1>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="lg:hidden text-gray-500 hover:text-gray-700"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive
                                            ? 'bg-primary-50 text-primary-700'
                                            : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    <item.icon className="w-5 h-5 mr-3" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User section */}
                    <div className="border-t border-gray-200 p-4">
                        <Link
                            href="/profile"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 mb-2"
                        >
                            <User className="w-5 h-5 mr-3" />
                            Profile
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50"
                        >
                            <LogOut className="w-5 h-5 mr-3" />
                            Logout
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
