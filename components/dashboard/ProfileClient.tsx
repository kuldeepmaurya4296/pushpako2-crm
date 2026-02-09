"use client";

import { useAuthStore } from '@/store/authStore';

export default function ProfileClient() {
    const { user } = useAuthStore();

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
                <p className="text-gray-600 mt-2">Manage your account settings</p>

                <div className="mt-8 space-y-4 max-w-lg">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                        <p className="mt-1 text-gray-900 p-2 bg-gray-50 rounded border border-gray-200">{user?.fullName}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <p className="mt-1 text-gray-900 p-2 bg-gray-50 rounded border border-gray-200">{user?.email}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Role</label>
                        <p className="mt-1 text-gray-900 p-2 bg-gray-50 rounded border border-gray-200">{user?.role.replace('_', ' ')}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
