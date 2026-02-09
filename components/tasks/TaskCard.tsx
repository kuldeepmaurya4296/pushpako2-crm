
import { Calendar, MessageSquare, User } from 'lucide-react';
import { format } from 'date-fns';

interface TaskCardProps {
    task: any;
    onClick: () => void;
}

export default function TaskCard({ task, onClick }: TaskCardProps) {
    const priorityColors: Record<string, string> = {
        LOW: 'bg-gray-100 text-gray-800',
        MEDIUM: 'bg-blue-100 text-blue-800',
        HIGH: 'bg-orange-100 text-orange-800',
        CRITICAL: 'bg-red-100 text-red-800',
    };

    return (
        <div
            onClick={onClick}
            className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
        >
            <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-gray-900 text-sm line-clamp-2">{task.title}</h4>
                <span
                    className={`px-2 py-1 text-xs font-medium rounded ${priorityColors[task.priority]
                        }`}
                >
                    {task.priority}
                </span>
            </div>

            {task.description && (
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">{task.description}</p>
            )}

            {/* Progress Bar */}
            <div className="mb-3">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{task.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className="bg-primary-600 h-2 rounded-full transition-all"
                        style={{ width: `${task.progress}%` }}
                    />
                </div>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center">
                    {task.deadline && (
                        <div className="flex items-center mr-3">
                            <Calendar className="w-3 h-3 mr-1" />
                            {format(new Date(task.deadline), 'MMM d')}
                        </div>
                    )}
                    {task._count?.comments > 0 && (
                        <div className="flex items-center">
                            <MessageSquare className="w-3 h-3 mr-1" />
                            {task._count.comments}
                        </div>
                    )}
                </div>
                {task.assignedTo && (
                    <div className="flex items-center">
                        <User className="w-3 h-3 mr-1" />
                        {task.assignedTo.fullName.split(' ')[0]}
                    </div>
                )}
            </div>
        </div>
    );
}
