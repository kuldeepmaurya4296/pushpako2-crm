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

        const attendance = await prisma.attendance.findUnique({
            where: {
                userId_date: {
                    userId: user.id,
                    date: today,
                },
            },
        });

        if (!attendance || !attendance.checkIn) {
            return NextResponse.json({ message: 'Please check in first' }, { status: 400 });
        }

        if (attendance.checkOut) {
            return NextResponse.json({ message: 'Already checked out today' }, { status: 400 });
        }

        const updated = await prisma.attendance.update({
            where: { id: attendance.id },
            data: { checkOut: new Date() },
        });

        return NextResponse.json({
            message: 'Checked out successfully',
            attendance: updated,
        });

    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
