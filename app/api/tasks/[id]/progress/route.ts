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

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const params = await props.params;
        const user = await getUser(req);
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const { progress, comment } = body;

        if (progress < 0 || progress > 100) {
            return NextResponse.json({ message: 'Progress must be between 0 and 100' }, { status: 400 });
        }

        const task = await prisma.task.findFirst({
            where: { id: params.id, deletedAt: null },
        });

        if (!task) {
            return NextResponse.json({ message: 'Task not found' }, { status: 404 });
        }

        // Update task progress
        const updatedTask = await prisma.task.update({
            where: { id: params.id },
            data: { progress },
        });

        // Add comment if provided
        if (comment) {
            await prisma.taskComment.create({
                data: {
                    taskId: params.id,
                    userId: user.id,
                    content: comment,
                    progressUpdate: progress,
                },
            });

            // Notify task assignee if needed (skipping redundant notification if self-update)
            if (task.assignedToId && task.assignedToId !== user.id) {
                await prisma.notification.create({
                    data: {
                        userId: task.assignedToId,
                        type: 'COMMENT_ADDED',
                        title: 'Progress Update',
                        message: `${user.fullName} updated progress to ${progress}% on task: ${task.title}`,
                        link: `/tasks`,
                    },
                });
            }
        }

        return NextResponse.json({
            message: 'Progress updated successfully',
            task: updatedTask,
        });

    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
