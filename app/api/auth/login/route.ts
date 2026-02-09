import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { comparePassword, signAccessToken, signRefreshToken } from '@/lib/auth-helpers';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json(
                { message: 'Email and password are required' },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (!user) {
            return NextResponse.json(
                { message: 'Invalid credentials' },
                { status: 401 }
            );
        }

        const isPasswordValid = await comparePassword(password, user.password);

        if (!isPasswordValid) {
            return NextResponse.json(
                { message: 'Invalid credentials' },
                { status: 401 }
            );
        }

        if (!user.isActive) {
            return NextResponse.json(
                { message: 'Account is deactivated. Please contact administrator.' },
                { status: 403 }
            );
        }

        const accessToken = signAccessToken(user.id);
        const refreshToken = signRefreshToken(user.id);

        // Filter out password from user object
        const { password: _, ...userWithoutPassword } = user;

        return NextResponse.json({
            user: userWithoutPassword,
            accessToken,
            refreshToken,
        });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
