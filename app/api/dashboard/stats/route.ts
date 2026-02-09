import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth-helpers';

export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const decoded = verifyToken(token);

        if (!decoded) {
            return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
        });

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        const userId = user.id;
        const role = user.role;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const stats: any = {};

        // Common stats
        const [myTasks, myCompletedTasks, myOverdueTasks] = await Promise.all([
            prisma.task.count({
                where: {
                    assignedToId: userId,
                    deletedAt: null,
                },
            }),
            prisma.task.count({
                where: {
                    assignedToId: userId,
                    status: 'COMPLETED',
                    deletedAt: null,
                },
            }),
            prisma.task.count({
                where: {
                    assignedToId: userId,
                    deadline: { lt: new Date() },
                    status: { not: 'COMPLETED' },
                    deletedAt: null,
                },
            }),
        ]);

        // For attendance, findFirst is safer than findUnique with composite keys if dates aren't perfect string matches in manual queries sometimes
        // But since we use Prisma, it should handle it. However, let's use checkIn time today range if exact match fails?
        // Actually, unique constraint expects exact value.
        const myAttendanceToday = await prisma.attendance.findUnique({
            where: {
                userId_date: {
                    userId,
                    date: today,
                },
            },
        });

        stats.personal = {
            totalTasks: myTasks,
            completedTasks: myCompletedTasks,
            overdueTasks: myOverdueTasks,
            todayAttendance: myAttendanceToday,
        };

        // Super Admin and HR
        if (role === 'SUPER_ADMIN' || role === 'HR') {
            const [
                totalUsers,
                activeUsers,
                totalProjects,
                totalTasks,
                completedTasks,
                todayAttendanceCount,
                presentToday,
                absentToday,
            ] = await Promise.all([
                prisma.user.count(),
                prisma.user.count({ where: { isActive: true } }),
                prisma.project.count({ where: { deletedAt: null } }),
                prisma.task.count({ where: { deletedAt: null } }),
                prisma.task.count({ where: { status: 'COMPLETED', deletedAt: null } }),
                prisma.attendance.count({ where: { date: today } }),
                prisma.attendance.count({ where: { date: today, status: { in: ['PRESENT', 'LATE'] } } }),
                prisma.attendance.count({ where: { date: today, status: 'ABSENT' } }),
            ]);

            stats.company = {
                totalUsers,
                activeUsers,
                totalProjects,
                totalTasks,
                completedTasks,
                completionRate: totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(2) : 0,
                attendance: {
                    total: todayAttendanceCount,
                    present: presentToday,
                    absent: absentToday,
                    presentPercentage: todayAttendanceCount > 0 ? ((presentToday / todayAttendanceCount) * 100).toFixed(2) : 0,
                },
            };

            // Recent activities
            stats.recentActivities = await prisma.auditLog.findMany({
                take: 10,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: { id: true, fullName: true, email: true },
                    },
                },
            });
        }

        // Team Leader
        if (role === 'TEAM_LEADER' || role === 'PROJECT_MANAGER') {
            const teams = await prisma.team.findMany({
                where: { leaderId: userId },
                include: {
                    members: true,
                    tasks: { where: { deletedAt: null } },
                },
            });

            const teamMemberIds = teams.flatMap((t) => t.members.map((m) => m.userId));

            // Calculate tasks manually from the fetched teams to avoid complex manual queries
            const totalTeamTasks = teams.reduce((sum, t) => sum + t.tasks.length, 0);
            const completedTeamTasks = teams.reduce(
                (sum, t) => sum + t.tasks.filter((task) => task.status === 'COMPLETED').length,
                0
            );

            const [teamAttendanceToday, teamPresent] = await Promise.all([
                prisma.attendance.count({
                    where: {
                        userId: { in: teamMemberIds },
                        date: today,
                    },
                }),
                prisma.attendance.count({
                    where: {
                        userId: { in: teamMemberIds },
                        date: today,
                        status: { in: ['PRESENT', 'LATE'] },
                    },
                }),
            ]);

            stats.team = {
                totalMembers: teamMemberIds.length,
                totalTasks: totalTeamTasks,
                completedTasks: completedTeamTasks,
                attendance: {
                    total: teamAttendanceToday,
                    present: teamPresent,
                    presentPercentage: teamAttendanceToday > 0 ? ((teamPresent / teamAttendanceToday) * 100).toFixed(2) : 0,
                },
            };
        }

        return NextResponse.json({ stats });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
