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

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const params = await props.params;
        const user = await getUser(req);
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const task = await prisma.task.findFirst({
            where: { id: params.id, deletedAt: null },
            include: {
                assignedTo: {
                    select: { id: true, fullName: true, email: true },
                },
                createdBy: {
                    select: { id: true, fullName: true, email: true },
                },
                project: { select: { id: true, name: true } },
                team: { select: { id: true, name: true } },
                comments: {
                    include: {
                        user: {
                            select: { id: true, fullName: true, email: true },
                        },
                    },
                    orderBy: { createdAt: 'asc' },
                },
                attachments: true,
            },
        });

        if (!task) {
            return NextResponse.json({ message: 'Task not found' }, { status: 404 });
        }

        return NextResponse.json({ task });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const params = await props.params;
        const user = await getUser(req);
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const updates = body;

        const existingTask = await prisma.task.findFirst({
            where: { id: params.id, deletedAt: null },
        });

        if (!existingTask) {
            return NextResponse.json({ message: 'Task not found' }, { status: 404 });
        }

        const task = await prisma.task.update({
            where: { id: params.id },
            data: {
                ...updates,
                deadline: updates.deadline ? new Date(updates.deadline) : undefined,
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

        // Notify assigned user if assignment changed
        if (
            updates.assignedToId &&
            updates.assignedToId !== existingTask.assignedToId
        ) {
            await prisma.notification.create({
                data: {
                    userId: updates.assignedToId,
                    type: 'TASK_UPDATED',
                    title: 'Task Reassigned',
                    message: `You have been assigned to task: ${task.title}`,
                    link: `/tasks`,
                },
            });
        }

        // Audit log
        await prisma.auditLog.create({
            data: {
                userId: user.id,
                action: 'UPDATE_TASK',
                entity: 'TASK',
                entityId: task.id,
                oldValue: JSON.stringify(existingTask),
                newValue: JSON.stringify(task),
            },
        });

        return NextResponse.json({
            message: 'Task updated successfully',
            task,
        });

    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const params = await props.params;
        const user = await getUser(req);
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const task = await prisma.task.findFirst({
            where: { id: params.id, deletedAt: null },
        });

        if (!task) {
            return NextResponse.json({ message: 'Task not found' }, { status: 404 });
        }

        // Only super admin can delete
        if (user.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ message: 'Access denied' }, { status: 403 });
        }

        await prisma.task.update({
            where: { id: params.id },
            data: { deletedAt: new Date() },
        });

        // Audit log
        await prisma.auditLog.create({
            data: {
                userId: user.id,
                action: 'DELETE_TASK',
                entity: 'TASK',
                entityId: params.id,
                oldValue: JSON.stringify(task),
            },
        });

        return NextResponse.json({ message: 'Task deleted successfully' });

    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
