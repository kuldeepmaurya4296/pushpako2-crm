"use client";

import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import StatCard from '@/components/StatCard';
import {
    Users,
    ClipboardCheck,
    Clock,
    TrendingUp,
    Calendar,
    CheckCircle2,
    AlertCircle,
} from 'lucide-react';

export default function DashboardClient() {
    const { user } = useAuthStore();

    const { data: stats, isLoading } = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: async () => {
            const response = await api.get('/dashboard/stats');
            return response.data.stats;
        },
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    const isSuperAdminOrHR = user?.role === 'SUPER_ADMIN' || user?.role === 'HR';
    const isTeamLeader =
        user?.role === 'TEAM_LEADER' || user?.role === 'PROJECT_MANAGER';

    return (
        <div className="space-y-6">
            {/* Welcome Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h1 className="text-3xl font-bold text-gray-900">
                    Welcome back, {user?.fullName}!
                </h1>
                <p className="text-gray-600 mt-2">
                    Here's what's happening with your work today.
                </p>
            </div>

            {/* Personal Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="My Tasks"
                    value={stats?.personal?.totalTasks || 0}
                    icon={ClipboardCheck}
                    color="blue"
                />
                <StatCard
                    title="Completed"
                    value={stats?.personal?.completedTasks || 0}
                    icon={CheckCircle2}
                    color="green"
                />
                <StatCard
                    title="Overdue"
                    value={stats?.personal?.overdueTasks || 0}
                    icon={AlertCircle}
                    color="red"
                />
                <StatCard
                    title="Attendance Today"
                    value={stats?.personal?.todayAttendance?.status || 'Not Marked'}
                    icon={Clock}
                    color="purple"
                    isText
                />
            </div>

            {/* Company Stats (Admin/HR Only) */}
            {isSuperAdminOrHR && stats?.company && (
                <>
                    <div className="mt-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Company Overview</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard
                            title="Total Users"
                            value={stats.company.totalUsers}
                            icon={Users}
                            color="blue"
                        />
                        <StatCard
                            title="Active Users"
                            value={stats.company.activeUsers}
                            icon={Users}
                            color="green"
                        />
                        <StatCard
                            title="Total Projects"
                            value={stats.company.totalProjects}
                            icon={Calendar}
                            color="purple"
                        />
                        <StatCard
                            title="Task Completion"
                            value={`${stats.company.completionRate}%`}
                            icon={TrendingUp}
                            color="yellow"
                            isText
                        />
                    </div>

                    {/* Attendance Overview */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Today's Attendance
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Present</span>
                                    <span className="text-2xl font-bold text-green-600">
                                        {stats.company.attendance.present}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Absent</span>
                                    <span className="text-2xl font-bold text-red-600">
                                        {stats.company.attendance.absent}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                    <span className="text-gray-600">Attendance Rate</span>
                                    <span className="text-xl font-bold text-primary-600">
                                        {stats.company.attendance.presentPercentage}%
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Task Progress
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Total Tasks</span>
                                    <span className="text-2xl font-bold text-gray-900">
                                        {stats.company.totalTasks}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Completed</span>
                                    <span className="text-2xl font-bold text-green-600">
                                        {stats.company.completedTasks}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                    <span className="text-gray-600">Completion Rate</span>
                                    <span className="text-xl font-bold text-primary-600">
                                        {stats.company.completionRate}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Team Stats (Team Leader Only) */}
            {isTeamLeader && stats?.team && (
                <>
                    <div className="mt-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Team Overview</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard
                            title="Team Members"
                            value={stats.team.totalMembers}
                            icon={Users}
                            color="blue"
                        />
                        <StatCard
                            title="Team Tasks"
                            value={stats.team.totalTasks}
                            icon={ClipboardCheck}
                            color="purple"
                        />
                        <StatCard
                            title="Completed Tasks"
                            value={stats.team.completedTasks}
                            icon={CheckCircle2}
                            color="green"
                        />
                        <StatCard
                            title="Team Attendance"
                            value={`${stats.team.attendance.presentPercentage}%`}
                            icon={Clock}
                            color="yellow"
                            isText
                        />
                    </div>
                </>
            )}
        </div>
    );
}
