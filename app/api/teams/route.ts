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

        const teams = await prisma.team.findMany({
            where: { deletedAt: null },
            include: {
                leader: {
                    select: { fullName: true }
                },
                _count: {
                    select: { members: true, projects: true }
                }
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({ teams });

    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const user = await getUser(req);
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        // Only Admin can create teams
        if (user.role !== 'SUPER_ADMIN' && user.role !== 'HR') {
            return NextResponse.json({ message: 'Access denied' }, { status: 403 });
        }

        const body = await req.json();
        const { name, description } = body;

        const team = await prisma.team.create({
            data: {
                name,
                description,
                leaderId: user.id, // Default to creator as leader for simplicity
            }
        });

        return NextResponse.json({
            message: 'Team created successfully',
            team,
        }, { status: 201 });

    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
