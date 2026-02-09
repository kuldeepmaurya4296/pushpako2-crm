"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { toast, Toaster } from 'react-hot-toast';
import { UserPlus, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';

interface SignupForm {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export default function SignupClient() {
    const router = useRouter();
    const { setAuth } = useAuthStore();
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<SignupForm>();

    const password = watch('password');

    const onSubmit = async (data: SignupForm) => {
        setLoading(true);
        try {
            const response = await api.post('/auth/signup', {
                fullName: data.fullName,
                email: data.email,
                password: data.password,
            });
            const { user, accessToken, refreshToken } = response.data;
            setAuth(user, accessToken, refreshToken);
            toast.success('Account created successfully!');
            router.push('/dashboard');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Signup failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
            <Toaster position="top-right" />
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-full mb-4">
                        <UserPlus className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Create your account</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Join the team and start collaborating
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <input
                                {...register('fullName', { required: 'Full name is required' })}
                                type="text"
                                className="input"
                                placeholder="John Doe"
                            />
                            {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                            <input
                                {...register('email', {
                                    required: 'Email is required',
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: "Invalid email address"
                                    }
                                })}
                                type="email"
                                className="input"
                                placeholder="john@example.com"
                            />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <input
                                {...register('password', {
                                    required: 'Password is required',
                                    minLength: {
                                        value: 6,
                                        message: "Password must be at least 6 characters"
                                    }
                                })}
                                type="password"
                                className="input"
                                placeholder="••••••••"
                            />
                            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                            <input
                                {...register('confirmPassword', {
                                    validate: value => value === password || "The passwords do not match"
                                })}
                                type="password"
                                className="input"
                                placeholder="••••••••"
                            />
                            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary w-full flex justify-center"
                        >
                            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Sign up'}
                        </button>
                    </div>

                    <div className="text-center">
                        <p className="text-sm text-gray-600">
                            Already have an account?{' '}
                            <Link href="/login" className="text-primary-600 hover:text-primary-500 font-medium">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
