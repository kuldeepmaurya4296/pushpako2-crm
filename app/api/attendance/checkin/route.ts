import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth-helpers';

// Helper to get user from token
async function getUser(req: Request) {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded) return null;

    return await prisma.user.findUnique({
        where: { id: decoded.userId },
    });
}

export async function POST(req: Request) {
    try {
        const user = await getUser(req);
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check if already checked in today
        const existing = await prisma.attendance.findUnique({
            where: {
                userId_date: {
                    userId: user.id,
                    date: today,
                },
            },
        });

        if (existing && existing.checkIn) {
            return NextResponse.json({ message: 'Already checked in today' }, { status: 400 });
        }

        const attendance = await prisma.attendance.upsert({
            where: {
                userId_date: {
                    userId: user.id,
                    date: today,
                },
            },
            update: {
                checkIn: new Date(),
                status: 'PRESENT',
            },
            create: {
                userId: user.id,
                date: today,
                checkIn: new Date(),
                status: 'PRESENT',
            },
        });

        return NextResponse.json({
            message: 'Checked in successfully',
            attendance,
        });

    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
