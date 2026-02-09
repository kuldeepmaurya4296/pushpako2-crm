import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, signAccessToken, signRefreshToken } from '@/lib/auth-helpers';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, password, fullName, role } = body;

        // Basic validation
        if (!email || !password || !fullName) {
            return NextResponse.json(
                { message: 'Missing required fields' },
                { status: 400 }
            );
        }

        const existingUser = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (existingUser) {
            return NextResponse.json(
                { message: 'User already exists' },
                { status: 400 }
            );
        }

        const hashedPassword = await hashPassword(password);

        const user = await prisma.user.create({
            data: {
                email: email.toLowerCase(),
                password: hashedPassword,
                fullName,
                role: role || 'TEAM_MEMBER',
                isActive: true, // Default to true for now
            },
        });

        const accessToken = signAccessToken(user.id);
        const refreshToken = signRefreshToken(user.id);

        const { password: _, ...userWithoutPassword } = user;

        return NextResponse.json({
            user: userWithoutPassword,
            accessToken,
            refreshToken,
        }, { status: 201 });
    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
