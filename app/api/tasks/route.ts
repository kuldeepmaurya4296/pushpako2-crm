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
        const projectId = searchParams.get('projectId');
        const teamId = searchParams.get('teamId');
        const assignedToId = searchParams.get('assignedToId');
        const status = searchParams.get('status');
        const priority = searchParams.get('priority');
        const search = searchParams.get('search');
        const page = Number(searchParams.get('page')) || 1;
        const limit = Number(searchParams.get('limit')) || 20;

        const where: any = {};

        // Filter based on user role
        if (user.role === 'TEAM_MEMBER') {
            where.assignedToId = user.id;
        } else if (
            user.role === 'TEAM_LEADER' ||
            user.role === 'PROJECT_MANAGER'
        ) {
            // Team leaders see their team's tasks
            const teams = await prisma.team.findMany({
                where: { leaderId: user.id },
                select: { id: true },
            });
            where.OR = [
                { assignedToId: user.id },
                { teamId: { in: teams.map((t) => t.id) } },
            ];
        }

        if (projectId) where.projectId = projectId;
        if (teamId) where.teamId = teamId;
        if (assignedToId) where.assignedToId = assignedToId;
        if (status) where.status = status;
        if (priority) where.priority = priority;
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }

        where.deletedAt = null;

        const [tasks, total] = await Promise.all([
            prisma.task.findMany({
                where,
                include: {
                    assignedTo: {
                        select: { id: true, fullName: true, email: true },
                    },
                    createdBy: {
                        select: { id: true, fullName: true, email: true },
                    },
                    project: { select: { id: true, name: true } },
                    team: { select: { id: true, name: true } },
                    _count: { select: { comments: true, attachments: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.task.count({ where }),
        ]);

        return NextResponse.json({
            tasks,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });

    } catch (error: any) {
        console.error('Get Tasks Error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const user = await getUser(req);
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const {
            title,
            description,
            projectId,
            teamId,
            assignedToId,
            priority,
            deadline,
            status,
        } = body;

        const task = await prisma.task.create({
            data: {
                title,
                description,
                projectId,
                teamId,
                assignedToId,
                createdById: user.id,
                priority: priority || 'MEDIUM',
                status: status || 'TODO',
                deadline: deadline ? new Date(deadline) : null,
            },
            include: {
                assignedTo: {
                    select: { id: true, fullName: true, email: true },
                },
                createdBy: {
                    select: { id: true, fullName: true, email: true },
                },
                project: { select: { id: true, name: true } },
                team: { select: { id: true, name: true } },
            },
        });

        // Create notification for assigned user
        if (assignedToId) {
            await prisma.notification.create({
                data: {
                    userId: assignedToId,
                    type: 'TASK_ASSIGNED',
                    title: 'New Task Assigned',
                    message: `You have been assigned a new task: ${title}`,
                    link: `/tasks`, // Point to tasks page
                },
            });
        }

        // Audit log
        await prisma.auditLog.create({
            data: {
                userId: user.id,
                action: 'CREATE_TASK',
                entity: 'TASK',
                entityId: task.id,
                newValue: JSON.stringify(task),
            },
        });

        return NextResponse.json({
            message: 'Task created successfully',
            task,
        }, { status: 201 });

    } catch (error: any) {
        console.error('Create Task Error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
