
import TaskCard from './TaskCard';

interface TaskColumnProps {
    status: string;
    label: string;
    tasks: any[];
    onTaskClick: (task: any) => void;
}

export default function TaskColumn({ status, label, tasks, onTaskClick }: TaskColumnProps) {
    const colorMap: Record<string, string> = {
        TODO: 'bg-gray-100 border-gray-300',
        IN_PROGRESS: 'bg-blue-50 border-blue-300',
        REVIEW: 'bg-yellow-50 border-yellow-300',
        COMPLETED: 'bg-green-50 border-green-300',
    };

    return (
        <div className={`rounded-lg border-2 ${colorMap[status]} p-4 h-full`}>
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">{label}</h3>
                <span className="px-2 py-1 text-xs font-medium bg-white rounded-full">
                    {tasks.length}
                </span>
            </div>

            <div className="space-y-3">
                {tasks.map((task) => (
                    <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
                ))}
            </div>
        </div>
    );
}
