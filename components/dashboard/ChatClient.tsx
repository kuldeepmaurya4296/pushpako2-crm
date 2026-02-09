"use client";

import { MessageSquare } from 'lucide-react';

export default function ChatClient() {
    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
                <div className="p-4 bg-primary-50 rounded-full mb-4">
                    <MessageSquare className="w-12 h-12 text-primary-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Chat</h1>
                <p className="text-gray-600 mt-2 max-w-md">Internal messaging and collaboration. This feature is coming soon with real-time capabilities.</p>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl text-left">
                    <div className="border border-gray-200 p-4 rounded-lg bg-gray-50 opacity-60">
                        <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    </div>
                    <div className="border border-gray-200 p-4 rounded-lg bg-gray-50 opacity-60">
                        <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
