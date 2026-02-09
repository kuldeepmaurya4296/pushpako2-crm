"use client";

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import api from '@/lib/api';
import { format } from 'date-fns';

interface TaskDetailModalProps {
    task: any;
    onClose: () => void;
}

export default function TaskDetailModal({ task, onClose }: TaskDetailModalProps) {
    const queryClient = useQueryClient();
    const [comment, setComment] = useState('');
    const [progress, setProgress] = useState(task.progress);

    const updateProgressMutation = useMutation({
        mutationFn: (data: { progress: number; comment: string }) =>
            api.patch(`/tasks/${task.id}/progress`, data),
        onSuccess: () => {
            toast.success('Progress updated successfully!');
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            setComment('');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update progress');
        }
    });

    const handleUpdateProgress = () => {
        if (progress === task.progress && !comment) {
            toast.error('Please update progress or add a comment');
            return;
        }
        updateProgressMutation.mutate({ progress, comment });
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75" onClick={onClose} />

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                    {task.title}
                                </h3>
                                <div className="mt-2 space-y-4">
                                    {task.description && (
                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-900">Description</h4>
                                            <p className="text-sm text-gray-500">{task.description}</p>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-xs font-semibold text-gray-500 uppercase">Status</span>
                                            <p className="text-sm text-gray-900">{task.status.replace('_', ' ')}</p>
                                        </div>
                                        <div>
                                            <span className="text-xs font-semibold text-gray-500 uppercase">Priority</span>
                                            <p className="text-sm text-gray-900">{task.priority}</p>
                                        </div>
                                        {task.deadline && (
                                            <div>
                                                <span className="text-xs font-semibold text-gray-500 uppercase">Deadline</span>
                                                <p className="text-sm text-gray-900">
                                                    {format(new Date(task.deadline), 'MMM d, yyyy')}
                                                </p>
                                            </div>
                                        )}
                                        {task.assignedTo && (
                                            <div>
                                                <span className="text-xs font-semibold text-gray-500 uppercase">Assigned To</span>
                                                <p className="text-sm text-gray-900">{task.assignedTo.fullName}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Update Progress */}
                                    <div className="border-t border-gray-200 pt-4 mt-4">
                                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Update Progress</h4>

                                        <div className="mb-4">
                                            <div className="flex justify-between mb-1">
                                                <label className="block text-xs font-medium text-gray-700">
                                                    Progress
                                                </label>
                                                <span className="text-xs font-medium text-gray-700">{progress}%</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                value={progress}
                                                onChange={(e) => setProgress(Number(e.target.value))}
                                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                                            />
                                        </div>

                                        <div className="mb-4">
                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                                Comment (optional)
                                            </label>
                                            <textarea
                                                value={comment}
                                                onChange={(e) => setComment(e.target.value)}
                                                className="input text-sm"
                                                rows={3}
                                                placeholder="Add a progress update..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                            type="button"
                            onClick={handleUpdateProgress}
                            disabled={updateProgressMutation.isPending}
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                        >
                            {updateProgressMutation.isPending ? 'Updating...' : 'Update Progress'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
