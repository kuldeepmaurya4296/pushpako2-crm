import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
    id: string;
    email: string;
    fullName: string;
    role: 'SUPER_ADMIN' | 'HR' | 'TEAM_LEADER' | 'PROJECT_MANAGER' | 'TEAM_MEMBER';
    profileImage?: string;
}

interface AuthState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    setAuth: (user: User, accessToken: string, refreshToken: string) => void;
    clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            accessToken: null,
            refreshToken: null,
            setAuth: (user, accessToken, refreshToken) =>
                set({ user, accessToken, refreshToken }),
            clearAuth: () => set({ user: null, accessToken: null, refreshToken: null }),
        }),
        {
            name: 'auth-storage',
        }
    )
);
