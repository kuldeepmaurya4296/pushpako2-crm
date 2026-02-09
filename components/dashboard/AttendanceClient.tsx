"use client";

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { Clock, CheckCircle, XCircle, Download } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

export default function AttendanceClient() {
    const { user } = useAuthStore();
    const queryClient = useQueryClient();
    const [dateRange, setDateRange] = useState({
        startDate: format(new Date(), 'yyyy-MM-01'),
        endDate: format(new Date(), 'yyyy-MM-dd'),
    });

    const isSuperAdminOrHR = user?.role === 'SUPER_ADMIN' || user?.role === 'HR';

    // Get attendance records
    const { data: attendanceData, isLoading } = useQuery({
        queryKey: ['attendance', dateRange],
        queryFn: async () => {
            const endpoint = isSuperAdminOrHR ? '/attendance/all' : '/attendance/my';
            const response = await api.get(endpoint, { params: dateRange });
            return response.data;
        },
    });

    // Check-in mutation
    const checkInMutation = useMutation({
        mutationFn: () => api.post('/attendance/checkin'),
        onSuccess: () => {
            toast.success('Checked in successfully!');
            queryClient.invalidateQueries({ queryKey: ['attendance'] });
            // Also invalidate dashboard stats
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Check-in failed');
        },
    });

    // Check-out mutation
    const checkOutMutation = useMutation({
        mutationFn: () => api.post('/attendance/checkout'),
        onSuccess: () => {
            toast.success('Checked out successfully!');
            queryClient.invalidateQueries({ queryKey: ['attendance'] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Check-out failed');
        },
    });

    // Export attendance
    const handleExport = async () => {
        try {
            const response = await api.get('/attendance/export', {
                params: dateRange,
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'attendance.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success('Attendance exported successfully!');
        } catch (error) {
            toast.error('Export failed');
        }
    };

    const todayAttendance = attendanceData?.records?.find(
        (record: any) => format(new Date(record.date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Attendance</h1>
                        <p className="text-gray-600 mt-2">Track your daily attendance</p>
                    </div>
                    {isSuperAdminOrHR && (
                        <button onClick={handleExport} className="btn btn-primary flex items-center">
                            <Download className="w-5 h-5 mr-2" />
                            Export CSV
                        </button>
                    )}
                </div>
            </div>

            {/* Check-in/Check-out Card */}
            <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg shadow-lg p-8 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold mb-2">Today's Attendance</h2>
                        <p className="text-primary-100">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
                        {todayAttendance && (
                            <div className="mt-4 space-y-2">
                                {todayAttendance.checkIn && (
                                    <p className="text-sm">
                                        Check-in: {format(new Date(todayAttendance.checkIn), 'hh:mm a')}
                                    </p>
                                )}
                                {todayAttendance.checkOut && (
                                    <p className="text-sm">
                                        Check-out: {format(new Date(todayAttendance.checkOut), 'hh:mm a')}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="flex gap-4">
                        {!todayAttendance?.checkIn && (
                            <button
                                onClick={() => checkInMutation.mutate()}
                                disabled={checkInMutation.isPending}
                                className="bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center"
                            >
                                <CheckCircle className="w-5 h-5 mr-2" />
                                Check In
                            </button>
                        )}
                        {todayAttendance?.checkIn && !todayAttendance?.checkOut && (
                            <button
                                onClick={() => checkOutMutation.mutate()}
                                disabled={checkOutMutation.isPending}
                                className="bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center"
                            >
                                <XCircle className="w-5 h-5 mr-2" />
                                Check Out
                            </button>
                        )}
                        {todayAttendance?.checkOut && (
                            <div className="bg-green-500 px-6 py-3 rounded-lg font-semibold flex items-center">
                                <CheckCircle className="w-5 h-5 mr-2" />
                                Completed
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Date Range Filter */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Start Date
                        </label>
                        <input
                            type="date"
                            value={dateRange.startDate}
                            onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                            className="input"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            End Date
                        </label>
                        <input
                            type="date"
                            value={dateRange.endDate}
                            onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                            className="input"
                        />
                    </div>
                </div>
            </div>

            {/* Attendance Records */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
                                </th>
                                {isSuperAdminOrHR && (
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        User
                                    </th>
                                )}
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Check In
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Check Out
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                                        Loading...
                                    </td>
                                </tr>
                            ) : attendanceData?.records?.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                                        No attendance records found
                                    </td>
                                </tr>
                            ) : (
                                attendanceData?.records?.map((record: any) => (
                                    <tr key={record.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {format(new Date(record.date), 'MMM d, yyyy')}
                                        </td>
                                        {isSuperAdminOrHR && record.user && (
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {record.user.fullName}
                                            </td>
                                        )}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {record.checkIn
                                                ? format(new Date(record.checkIn), 'hh:mm a')
                                                : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {record.checkOut
                                                ? format(new Date(record.checkOut), 'hh:mm a')
                                                : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${record.status === 'PRESENT'
                                                    ? 'bg-green-100 text-green-800'
                                                    : record.status === 'ABSENT'
                                                        ? 'bg-red-100 text-red-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                    }`}
                                            >
                                                {record.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
