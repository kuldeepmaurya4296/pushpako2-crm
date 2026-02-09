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

        const projects = await prisma.project.findMany({
            where: { deletedAt: null },
            include: {
                manager: {
                    select: { fullName: true }
                },
                team: {
                    select: { name: true }
                },
                _count: {
                    select: { tasks: true }
                }
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({ projects });

    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const user = await getUser(req);
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        // Only Admin can create projects for now
        if (user.role !== 'SUPER_ADMIN' && user.role !== 'HR' && user.role !== 'PROJECT_MANAGER') {
            return NextResponse.json({ message: 'Access denied' }, { status: 403 });
        }

        const body = await req.json();
        const { name, description, startDate, endDate, teamId } = body;

        const project = await prisma.project.create({
            data: {
                name,
                description,
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
                managerId: user.id,
                teamId: teamId || null,
            }
        });

        return NextResponse.json({
            message: 'Project created successfully',
            project,
        }, { status: 201 });

    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
