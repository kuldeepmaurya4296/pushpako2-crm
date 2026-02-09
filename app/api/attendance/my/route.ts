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

        const { searchParams } = new URL(req.url);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const page = Number(searchParams.get('page')) || 1;
        const limit = Number(searchParams.get('limit')) || 30;

        const where: any = { userId: user.id };

        if (startDate || endDate) {
            where.date = {};
            if (startDate) where.date.gte = new Date(startDate);
            if (endDate) where.date.lte = new Date(endDate);
        }

        const [records, total] = await Promise.all([
            prisma.attendance.findMany({
                where,
                orderBy: { date: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.attendance.count({ where }),
        ]);

        return NextResponse.json({
            records,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });

    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
