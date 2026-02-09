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

export async function GET(req: Request) {
    try {
        const user = await getUser(req);
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        // Only Admin/HR can export
        if (user.role !== 'SUPER_ADMIN' && user.role !== 'HR') {
            return NextResponse.json({ message: 'Access denied' }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const userId = searchParams.get('userId');

        const where: any = {};

        if (userId) where.userId = userId;
        if (startDate || endDate) {
            where.date = {};
            if (startDate) where.date.gte = new Date(startDate);
            if (endDate) where.date.lte = new Date(endDate);
        }

        const records = await prisma.attendance.findMany({
            where,
            include: {
                user: {
                    select: { fullName: true, email: true, role: true },
                },
            },
            orderBy: { date: 'desc' },
        });

        const csv = [
            'Date,User Name,Email,Role,Check In,Check Out,Status,Notes',
            ...records.map((r) =>
                [
                    r.date.toISOString().split('T')[0],
                    r.user.fullName,
                    r.user.email,
                    r.user.role,
                    r.checkIn ? r.checkIn.toISOString() : '',
                    r.checkOut ? r.checkOut.toISOString() : '',
                    r.status,
                    r.notes || '',
                ].join(',')
            ),
        ].join('\n');

        return new NextResponse(csv, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': 'attachment; filename="attendance.csv"',
            },
        });

    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
