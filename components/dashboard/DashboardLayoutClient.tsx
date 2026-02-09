"use client";

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';

export default function DashboardLayoutClient({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { accessToken } = useAuthStore();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted && !accessToken) {
            router.push('/login');
        }
    }, [mounted, accessToken, router]);

    if (!mounted) return null; // Prevent hydration error

    if (!accessToken) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
            <div className="lg:pl-64">
                <Header setSidebarOpen={setSidebarOpen} />
                <main className="p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
