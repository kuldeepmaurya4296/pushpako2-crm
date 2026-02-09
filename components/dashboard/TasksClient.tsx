"use client";

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import api from '@/lib/api';
import TaskColumn from '@/components/tasks/TaskColumn';
import TaskDetailModal from '@/components/tasks/TaskDetailModal';
import CreateTaskModal from '@/components/tasks/CreateTaskModal';
import { useAuthStore } from '@/store/authStore';

const TASK_STATUSES = ['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED'];
const STATUS_LABELS = {
    TODO: 'To Do',
    IN_PROGRESS: 'In Progress',
    REVIEW: 'Review',
    COMPLETED: 'Completed',
};

export default function TasksClient() {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState<any>(null);
    const { user } = useAuthStore();

    const { data: tasksData, isLoading } = useQuery({
        queryKey: ['tasks'],
        queryFn: async () => {
            const response = await api.get('/tasks');
            return response.data;
        },
    });

    const groupedTasks = TASK_STATUSES.reduce((acc, status) => {
        acc[status] = tasksData?.tasks?.filter((task: any) => task.status === status) || [];
        return acc;
    }, {} as Record<string, any[]>);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
                        <p className="text-gray-600 mt-2">Manage your tasks and projects</p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="btn btn-primary flex items-center"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        New Task
                    </button>
                </div>
            </div>

            {/* Kanban Board */}
            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {TASK_STATUSES.map((status) => (
                        <TaskColumn
                            key={status}
                            status={status}
                            label={STATUS_LABELS[status as keyof typeof STATUS_LABELS]}
                            tasks={groupedTasks[status]}
                            onTaskClick={setSelectedTask}
                        />
                    ))}
                </div>
            )}

            {/* Task Detail Modal */}
            {selectedTask && (
                <TaskDetailModal
                    task={selectedTask}
                    onClose={() => setSelectedTask(null)}
                />
            )}

            {/* Create Task Modal */}
            {showCreateModal && (
                <CreateTaskModal onClose={() => setShowCreateModal(false)} />
            )}
        </div>
    );
}
