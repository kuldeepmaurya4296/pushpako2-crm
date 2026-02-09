"use client";

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { Users, Plus, Loader2, FolderKanban } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { useForm } from 'react-hook-form';

export default function TeamsClient() {
    const { user } = useAuthStore();
    const [showCreateModal, setShowCreateModal] = useState(false);

    const { data: teamsData, isLoading } = useQuery({
        queryKey: ['teams'],
        queryFn: async () => {
            const response = await api.get('/teams');
            return response.data;
        },
    });

    const canCreate = user?.role === 'SUPER_ADMIN' || user?.role === 'HR';

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Teams</h1>
                        <p className="text-gray-600 mt-2">Manage your teams</p>
                    </div>
                    {canCreate && (
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="btn btn-primary flex items-center"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            New Team
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
                    {teamsData?.teams?.map((team: any) => (
                        <div key={team.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-2 bg-purple-50 rounded-lg">
                                    <Users className="w-6 h-6 text-purple-600" />
                                </div>
                            </div>

                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{team.name}</h3>
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{team.description}</p>

                            <div className="space-y-3 pt-4 border-t border-gray-100">
                                <div className="flex items-center text-sm text-gray-500">
                                    <span className="font-medium mr-2">Leader:</span>
                                    <span>{team.leader?.fullName || 'Unassigned'}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm text-gray-500 mt-2">
                                    <span>Members: {team._count?.members || 0}</span>
                                    <div className="flex items-center">
                                        <FolderKanban className="w-3 h-3 mr-1" />
                                        <span>{team._count?.projects || 0} Projects</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {teamsData?.teams?.length === 0 && (
                        <div className="col-span-full text-center py-12 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                            No teams found. Create one to get started.
                        </div>
                    )}
                </div>
            )}

            {showCreateModal && <CreateTeamModal onClose={() => setShowCreateModal(false)} />}
        </div>
    );
}

function CreateTeamModal({ onClose }: { onClose: () => void }) {
    const queryClient = useQueryClient();
    const { register, handleSubmit, formState: { errors } } = useForm();

    const createMutation = useMutation({
        mutationFn: (data: any) => api.post('/teams', data),
        onSuccess: () => {
            toast.success('Team created!');
            queryClient.invalidateQueries({ queryKey: ['teams'] });
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
                <h2 className="text-xl font-bold mb-4">Create Team</h2>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Team Name</label>
                        <input {...register('name', { required: 'Name is required' })} className="input mt-1" placeholder="e.g. Engineering" />
                        {errors.name && <p className="text-red-500 text-xs mt-1">Required</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea {...register('description')} className="input mt-1" rows={3} placeholder="Team purpose..." />
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
