"use client";

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import api from '@/lib/api';
import { Loader2 } from 'lucide-react';

interface CreateTaskModalProps {
    onClose: () => void;
}

interface CreateTaskForm {
    title: string;
    description: string;
    priority: string;
    deadline: string;
    assignedToId?: string; // We might want to fetch users to assign, but keeping simple for now
}

export default function CreateTaskModal({ onClose }: CreateTaskModalProps) {
    const queryClient = useQueryClient();
    const { register, handleSubmit, formState: { errors } } = useForm<CreateTaskForm>();

    const createTaskMutation = useMutation({
        mutationFn: (data: CreateTaskForm) => api.post('/tasks', data),
        onSuccess: () => {
            toast.success('Task created successfully!');
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            onClose();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to create task');
        }
    });

    const onSubmit = (data: CreateTaskForm) => {
        createTaskMutation.mutate(data);
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75" onClick={onClose} />

                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Create New Task</h3>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Title</label>
                                <input
                                    {...register('title', { required: 'Title is required' })}
                                    className="input mt-1"
                                    placeholder="Task title"
                                />
                                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                <textarea
                                    {...register('description')}
                                    className="input mt-1"
                                    rows={3}
                                    placeholder="Task description"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Priority</label>
                                    <select {...register('priority')} className="input mt-1">
                                        <option value="LOW">Low</option>
                                        <option value="MEDIUM">Medium</option>
                                        <option value="HIGH">High</option>
                                        <option value="CRITICAL">Critical</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Deadline</label>
                                    <input
                                        type="date"
                                        {...register('deadline')}
                                        className="input mt-1"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end pt-4 gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="btn btn-secondary"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={createTaskMutation.isPending}
                                    className="btn btn-primary flex items-center"
                                >
                                    {createTaskMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    Create Task
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
