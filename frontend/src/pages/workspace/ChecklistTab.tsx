import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Trash2,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Tag,
  Search
} from 'lucide-react';
import { api } from '../../api/client';
import type { EventDetail, Task, IdType } from '../../types';

interface ChecklistTabProps {
  event: EventDetail;
  onRefresh: () => void;
  onOpenAskCoorda: () => void;
}

export const ChecklistTab: React.FC<ChecklistTabProps> = ({ event, onRefresh, onOpenAskCoorda }) => {
  const [tasks, setTasks] = useState<Task[]>(event.tasks || []);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Logistics');
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [deadline, setDeadline] = useState('');
  const [description, setDescription] = useState('');

  // Toggle completion
  const handleToggleStatus = async (task: Task) => {
    const nextStatus = task.status === 'COMPLETED' ? 'TODO' : 'COMPLETED';
    try {
      const updated = await api.updateTask(event.id, task.id, { status: nextStatus });
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
      onRefresh();
    } catch (err) {
      alert('Failed to update task status');
    }
  };

  const handleUpdateStatusDropdown = async (task: Task, newStatus: string) => {
    try {
      const updated = await api.updateTask(event.id, task.id, { status: newStatus as any });
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
      onRefresh();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const newTask = await api.createTask(event.id, {
        title,
        description,
        category,
        priority,
        deadline: deadline || undefined,
        status: 'TODO',
        is_milestone: false,
      });
      setTasks((prev) => [...prev, newTask]);
      setIsAdding(false);
      setTitle('');
      setDescription('');
      onRefresh();
    } catch (err) {
      alert('Failed to add task');
    }
  };

  const handleDeleteTask = async (taskId: IdType) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.deleteTask(event.id, taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      onRefresh();
    } catch (err) {
      alert('Failed to delete task');
    }
  };

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
    if (priorityFilter !== 'ALL' && t.priority !== priorityFilter) return false;
    if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const completedCount = tasks.filter((t) => t.status === 'COMPLETED').length;
  const totalCount = tasks.length;
  const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-editorial text-2xl font-bold text-slate-900">
            Task Checklist & Action Items
          </h2>
          <p className="text-xs text-slate-500">
            Organize tasks by deadline, priority, and completion status.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Progress & Filters Bar */}
      <div className="bg-white rounded-2xl border border-[#EAE8E0] p-4 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#F0EFEA]">
          <div className="flex items-center gap-3">
            <span className="font-editorial text-lg font-bold text-slate-900">
              {completedCount} of {totalCount} completed ({pct}%)
            </span>
          </div>
          <div className="w-full md:w-64 bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-[#FAF9F5] border border-[#EAE8E0] rounded-xl text-xs focus:ring-1 focus:ring-amber-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-400 text-[11px] font-semibold">Status:</span>
            {['ALL', 'TODO', 'IN_PROGRESS', 'COMPLETED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${
                  statusFilter === st
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'bg-[#FAF9F5] text-slate-600 hover:bg-slate-100'
                }`}
              >
                {st === 'ALL' ? 'All' : st.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-400 text-[11px] font-semibold">Priority:</span>
            {['ALL', 'High', 'Medium', 'Low'].map((pr) => (
              <button
                key={pr}
                onClick={() => setPriorityFilter(pr)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${
                  priorityFilter === pr
                    ? 'bg-amber-100 text-amber-900 font-semibold'
                    : 'bg-[#FAF9F5] text-slate-600 hover:bg-slate-100'
                }`}
              >
                {pr}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Add Task Form */}
      {isAdding && (
        <div className="bg-amber-50/50 border border-amber-200/80 rounded-2xl p-5 shadow-sm animate-in fade-in duration-200">
          <h3 className="font-editorial text-base font-bold text-slate-900 mb-3">
            Add New Checklist Task
          </h3>
          <form onSubmit={handleCreateTask} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Schedule bridal hair and makeup trial"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white border border-[#EAE8E0] rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-white border border-[#EAE8E0] rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-amber-500"
                >
                  <option value="Venue">Venue</option>
                  <option value="Catering">Catering</option>
                  <option value="Decor">Decor</option>
                  <option value="Photography">Photography</option>
                  <option value="Music">Music</option>
                  <option value="Attire">Attire</option>
                  <option value="Invitations">Invitations</option>
                  <option value="Logistics">Logistics</option>
                  <option value="General">General</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                  Notes / Instructions
                </label>
                <input
                  type="text"
                  placeholder="Instructions or contact details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-white border border-[#EAE8E0] rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-amber-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full bg-white border border-[#EAE8E0] rounded-xl px-2 py-2 text-xs focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                    Deadline
                  </label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full bg-white border border-[#EAE8E0] rounded-xl px-2 py-2 text-xs focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs text-slate-600 hover:bg-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
              >
                Add Task
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Task List */}
      <div className="bg-white rounded-2xl border border-[#EAE8E0] divide-y divide-[#F0EFEA] shadow-2xs overflow-hidden">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => {
            const isDone = task.status === 'COMPLETED';

            return (
              <div
                key={task.id}
                className="p-4 flex items-center justify-between gap-3 hover:bg-slate-50/70 transition group"
              >
                {/* Left: Checkbox + Title + Meta */}
                <div className="flex items-start gap-3.5 flex-1">
                  <button
                    onClick={() => handleToggleStatus(task)}
                    className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition ${
                      isDone
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 bg-white hover:border-amber-500'
                    }`}
                  >
                    {isDone && <CheckSquare className="w-3.5 h-3.5" />}
                  </button>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-semibold text-xs text-slate-800 ${
                          isDone ? 'line-through text-slate-400' : ''
                        }`}
                      >
                        {task.title}
                      </span>
                      {task.is_milestone && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-sm bg-amber-100 text-amber-800">
                          Milestone
                        </span>
                      )}
                    </div>

                    {task.description && (
                      <p className="text-[11px] text-slate-400">
                        {task.description}
                      </p>
                    )}

                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Tag className="w-3 h-3 text-slate-300" />
                        {task.category}
                      </span>
                      {task.deadline && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-300" />
                          Due: {task.deadline}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Status selector + Priority + Delete */}
                <div className="flex items-center gap-2.5">
                  <select
                    value={task.status}
                    onChange={(e) => handleUpdateStatusDropdown(task, e.target.value)}
                    className={`text-[11px] font-semibold rounded-lg px-2 py-1 border transition ${
                      task.status === 'COMPLETED'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : task.status === 'IN_PROGRESS'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                  </select>

                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                      task.priority === 'High'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : task.priority === 'Medium'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {task.priority}
                  </span>

                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-1 rounded-md text-slate-300 hover:text-rose-600 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition"
                    title="Delete Task"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center text-xs text-slate-400">
            No tasks match your filters. Click "Add Task" to create one.
          </div>
        )}
      </div>
    </div>
  );
};
