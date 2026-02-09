"use client";

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function HomeClient() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Direct check to avoid store hydration issues initially
        const storedAuth = localStorage.getItem('auth-storage');
        let hasToken = false;

        if (storedAuth) {
            try {
                const parsed = JSON.parse(storedAuth);
                if (parsed.state?.accessToken) {
                    hasToken = true;
                }
            } catch (e) {
                console.error("Auth parse error", e);
            }
        }

        if (hasToken) {
            router.push('/dashboard');
        } else {
            router.push('/login');
        }
        setLoading(false);
    }, [router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
            <p className="text-gray-600 text-lg">Redirecting...</p>

            <div className="mt-8 text-sm text-gray-500">
                Taking too long?
                <div className="flex gap-4 mt-2">
                    <button
                        onClick={() => router.push('/login')}
                        className="text-primary-600 hover:underline"
                    >
                        Go to Login
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="text-primary-600 hover:underline"
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
}
