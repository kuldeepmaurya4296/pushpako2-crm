"use client";

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { FolderKanban, Plus, Calendar, Users, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';

export default function ProjectsClient() {
    const { user } = useAuthStore();
    const [showCreateModal, setShowCreateModal] = useState(false);

    const { data: projectsData, isLoading } = useQuery({
        queryKey: ['projects'],
        queryFn: async () => {
            const response = await api.get('/projects');
            return response.data;
        },
    });

    const canCreate = user?.role === 'SUPER_ADMIN' || user?.role === 'HR' || user?.role === 'PROJECT_MANAGER';

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
                        <p className="text-gray-600 mt-2">Manage your projects</p>
                    </div>
                    {canCreate && (
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="btn btn-primary flex items-center"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            New Project
                        </button>
                    )}
                </div>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projectsData?.projects?.map((project: any) => (
                        <div key={project.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-2 bg-blue-50 rounded-lg">
                                    <FolderKanban className="w-6 h-6 text-blue-600" />
                                </div>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${project.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                    }`}>
                                    {project.status}
                                </span>
                            </div>

                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{project.name}</h3>
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{project.description}</p>

                            <div className="space-y-3 pt-4 border-t border-gray-100">
                                <div className="flex items-center text-sm text-gray-500">
                                    <Users className="w-4 h-4 mr-2" />
                                    <span>{project.manager?.fullName || 'Unassigned'}</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-500">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    <span>{project.startDate ? format(new Date(project.startDate), 'MMM d, yyyy') : 'No date'}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm text-gray-500 mt-2">
                                    <span>Tasks: {project._count?.tasks || 0}</span>
                                    {project.team && <span className="text-xs bg-gray-100 px-2 py-1 rounded">{project.team.name}</span>}
                                </div>
                            </div>
                        </div>
                    ))}
                    {projectsData?.projects?.length === 0 && (
                        <div className="col-span-full text-center py-12 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                            No projects found. Create one to get started.
                        </div>
                    )}
                </div>
            )}

            {showCreateModal && <CreateProjectModal onClose={() => setShowCreateModal(false)} />}
        </div>
    );
}

function CreateProjectModal({ onClose }: { onClose: () => void }) {
    const queryClient = useQueryClient();
    const { register, handleSubmit, formState: { errors } } = useForm();

    const createMutation = useMutation({
        mutationFn: (data: any) => api.post('/projects', data),
        onSuccess: () => {
            toast.success('Project created!');
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            onClose();
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Failed to create');
        }
    });

    const onSubmit = (data: any) => {
        createMutation.mutate(data);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50 px-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                <h2 className="text-xl font-bold mb-4">Create Project</h2>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Project Name</label>
                        <input {...register('name', { required: 'Name is required' })} className="input mt-1" placeholder="e.g. Website Redesign" />
                        {errors.name && <p className="text-red-500 text-xs mt-1">Required</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea {...register('description')} className="input mt-1" rows={3} placeholder="Project goals..." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Start Date</label>
                            <input type="date" {...register('startDate')} className="input mt-1" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">End Date</label>
                            <input type="date" {...register('endDate')} className="input mt-1" />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
                        <button type="submit" disabled={createMutation.isPending} className="btn btn-primary flex items-center">
                            {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Create
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
