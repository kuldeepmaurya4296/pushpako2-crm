"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { toast, Toaster } from 'react-hot-toast'; // Need to install react-hot-toast if not present
import { LogIn, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';

interface LoginForm {
    email: string;
    password: string;
}

export default function LoginClient() {
    const router = useRouter();
    const { setAuth } = useAuthStore();
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginForm>();

    const onSubmit = async (data: LoginForm) => {
        setLoading(true);
        try {
            const response = await api.post('/auth/login', data);
            const { user, accessToken, refreshToken } = response.data;
            setAuth(user, accessToken, refreshToken);
            toast.success('Login successful!');
            router.push('/dashboard');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4">
            <Toaster position="top-right" />
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-full mb-4">
                            <LogIn className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">PushpakO2 CRM</h1>
                        <p className="text-gray-600 mt-2">Sign in to your account</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                {...register('email', { required: 'Email is required' })}
                                className="input"
                                placeholder="your@email.com"
                            />
                            {errors.email && (
                                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                {...register('password', { required: 'Password is required' })}
                                className="input"
                                placeholder="••••••••"
                            />
                            {errors.password && (
                                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary w-full flex items-center justify-center"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    {/* Sign Up Link */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Don't have an account?{' '}
                            <Link href="/signup" className="text-primary-600 hover:text-primary-700 font-medium">
                                Sign up here
                            </Link>
                        </p>
                    </div>

                    {/* Default Credentials Info */}
                    <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                        <p className="text-xs font-semibold text-gray-700 mb-2">Demo Accounts:</p>
                        <div className="space-y-2 text-xs text-gray-600">
                            <div>
                                <strong>Super Admin:</strong><br />
                                Aditya@pushpako2.com / Adiksha1920#
                            </div>
                            <div>
                                <strong>HR:</strong><br />
                                Hr@pushpako2.com / Navneetisbest#
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
