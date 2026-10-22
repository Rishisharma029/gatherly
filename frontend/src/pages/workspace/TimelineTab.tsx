import React, { useState } from 'react';
import {
  Plus,
  Calendar,
  Sparkles,
  Trash2,
  Check,
  AlertTriangle
} from 'lucide-react';
import { api } from '../../api/client';
import type { EventDetail, Task, IdType } from '../../types';

interface TimelineTabProps {
  event: EventDetail;
  onRefresh: () => void;
  onOpenAskCoorda: () => void;
}

export const TimelineTab: React.FC<TimelineTabProps> = ({ event, onRefresh, onOpenAskCoorda }) => {
  const [tasks, setTasks] = useState<Task[]>(event.tasks || []);
  const [isAdding, setIsAdding] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState(event.date || '');
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('High');
  const [category, setCategory] = useState('planning');

  // Filter milestones only for timeline view
  const milestones = tasks.filter((t) => t.is_milestone);
  const sortedMilestones = [...milestones].sort((a, b) => {
    if (!a.deadline) return 1;
    if (!b.deadline) return -1;
    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
  });

  const completedCount = sortedMilestones.filter((m) => m.status === 'COMPLETED').length;
  const totalMilestones = sortedMilestones.length;
  const progressPct = totalMilestones > 0 ? Math.round((completedCount / totalMilestones) * 100) : 0;
  const daysToGo = event.stats?.days_to_go ?? 30;

  // Toggle milestone completion
  const handleToggleStatus = async (task: Task) => {
    const nextStatus = task.status === 'COMPLETED' ? 'TODO' : 'COMPLETED';
    try {
      const updated = await api.updateTask(event.id, task.id, { status: nextStatus });
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
      onRefresh();
    } catch (err) {
      alert('Failed to update milestone status');
    }
  };

  // Add Milestone
  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const newTask = await api.createTask(event.id, {
        title,
        description,
        deadline,
        priority,
        category,
        is_milestone: true,
        status: 'TODO',
      });
      setTasks((prev) => [...prev, newTask]);
      setIsAdding(false);
      setTitle('');
      setDescription('');
      onRefresh();
    } catch (err) {
      alert('Failed to create milestone');
    }
  };

  // AI Auto-Generate time-aware timeline
  const handleGenerateAI = async () => {
    if (!window.confirm(`Generate structured timeline milestones calculated for ${event.name} (${daysToGo} days remaining)?`)) return;
    setIsGenerating(true);
    try {
      const newTasks = await api.generateTimelineTasks(event.id);
      setTasks(newTasks);
      onRefresh();
    } catch (err) {
      alert('Failed to generate AI timeline');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteTask = async (id: IdType) => {
    if (!window.confirm('Delete this milestone?')) return;
    try {
      await api.deleteTask(event.id, id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      onRefresh();
    } catch (err) {
      alert('Failed to delete milestone');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-editorial text-2xl font-bold text-[#252923]">
            Event Milestones & Timeline
          </h2>
          <p className="text-xs text-[#73756F]">
            Time-aware scheduling for {event.date} ({daysToGo} days remaining). Never generates past deadlines without alerting.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerateAI}
            disabled={isGenerating}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[#1F5147]/10 text-[#1F5147] border border-[#1F5147]/20 hover:bg-[#1F5147]/20 transition shadow-2xs disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#1F5147]" />
            <span>{isGenerating ? 'Generating...' : 'Regenerate Time-Aware Schedule'}</span>
          </button>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#1F5147] text-white hover:bg-[#173F37] transition shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Milestone</span>
          </button>
        </div>
      </div>

      {/* Urgent Schedule Notice if less than 7 days */}
      {daysToGo <= 7 && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex items-center gap-3 text-xs text-amber-900 shadow-2xs">
          <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0" />
          <div>
            <span className="font-bold block">Urgent Preparation Runway ({daysToGo} days to event)</span>
            <span>Gatherly AI has compressed the schedule to prioritize high-dependency tasks (Venue lock & Caterer headcount) over advance planning.</span>
          </div>
        </div>
      )}

      {/* Progress banner */}
      <div className="bg-white rounded-2xl border border-[#E5E3DC] p-5 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#1F5147]/10 border border-[#1F5147]/20 flex items-center justify-center text-[#1F5147] font-bold font-editorial text-lg">
            {completedCount}/{totalMilestones}
          </div>
          <div>
            <h4 className="font-editorial text-base font-bold text-[#252923]">
              Milestone Progression: {progressPct}% Completed
            </h4>
            <p className="text-xs text-[#73756F]">
              {completedCount} of {totalMilestones} phases completed on schedule.
            </p>
          </div>
        </div>
        <div className="w-full sm:w-48 bg-[#F8F7F2] h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-[#1F5147] h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Add Milestone Form */}
      {isAdding && (
        <div className="bg-white border-2 border-[#1F5147]/30 rounded-2xl p-5 shadow-sm animate-in fade-in duration-200">
          <h3 className="font-editorial text-base font-bold text-[#252923] mb-3">
            Add Timeline Milestone
          </h3>
          <form onSubmit={handleAddMilestone} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="text-[10px] font-bold uppercase text-[#73756F] block mb-1">
                  Milestone Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Confirm menu and decorations"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#F8F7F2] border border-[#E5E3DC] rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#1F5147]"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-[#73756F] block mb-1">
                  Target Due Date (YYYY-MM-DD)
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full bg-[#F8F7F2] border border-[#E5E3DC] rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#1F5147]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="text-[10px] font-bold uppercase text-[#73756F] block mb-1">
                  Description / Deliverables
                </label>
                <input
                  type="text"
                  placeholder="Key contracts, deposits, or items required..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#F8F7F2] border border-[#E5E3DC] rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#1F5147]"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-[#73756F] block mb-1">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full bg-[#F8F7F2] border border-[#E5E3DC] rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#1F5147]"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs text-[#565952] hover:bg-[#F8F7F2]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-[#1F5147] text-white text-xs font-semibold hover:bg-[#173F37]"
              >
                Save Milestone
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Visual Timeline Stream */}
      <div className="relative pl-6 sm:pl-8 space-y-5 before:content-[''] before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#E5E3DC]">
        {sortedMilestones.map((m, index) => {
          const isDone = m.status === 'COMPLETED';

          return (
            <div key={m.id} className="relative group">
              {/* Dot */}
              <button
                onClick={() => handleToggleStatus(m)}
                className={`absolute -left-6 sm:-left-8 top-3.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${
                  isDone
                    ? 'bg-[#1F5147] border-[#1F5147] text-white shadow-2xs'
                    : 'bg-white border-[#E5E3DC] text-transparent hover:border-[#1F5147]'
                }`}
                title={isDone ? 'Mark as Incomplete' : 'Mark as Completed'}
              >
                <Check className={`w-3.5 h-3.5 ${isDone ? 'opacity-100' : 'opacity-0'}`} />
              </button>

              {/* Milestone Card */}
              <div
                className={`bg-white rounded-2xl border p-5 transition shadow-2xs ${
                  isDone ? 'border-[#E5E3DC] opacity-75 bg-[#F8F7F2]/40' : 'border-[#E5E3DC] hover:border-[#1F5147]/50'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-[#1F5147]/10 text-[#1F5147] border border-[#1F5147]/20">
                      Phase {index + 1}
                    </span>
                    <span className="text-xs font-semibold text-[#73756F] flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {m.deadline || 'Date TBD'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                        m.priority === 'High'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : m.priority === 'Medium'
                          ? 'bg-[#E9A477]/20 text-[#9C582B] border border-[#E9A477]/40'
                          : 'bg-[#F8F7F2] text-[#565952]'
                      }`}
                    >
                      {m.priority} Priority
                    </span>
                    <button
                      onClick={() => handleDeleteTask(m.id)}
                      className="text-[#73756F] hover:text-rose-600 p-1 rounded-md opacity-0 group-hover:opacity-100 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3
                  className={`font-editorial text-base font-bold text-[#252923] ${
                    isDone ? 'line-through text-[#73756F]' : ''
                  }`}
                >
                  {m.title}
                </h3>

                {m.description && (
                  <p className="text-xs text-[#565952] mt-1 leading-relaxed">
                    {m.description}
                  </p>
                )}

                <div className="mt-3 pt-3 border-t border-[#E5E3DC] flex items-center justify-between text-[11px] text-[#73756F]">
                  <span>Category: {m.category || 'General'}</span>
                  <span className="font-semibold text-[#252923]">
                    Status: {m.status}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
