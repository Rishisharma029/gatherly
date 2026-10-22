import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Plus,
  Calendar,
  DollarSign,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  AlertTriangle
} from 'lucide-react';
import { api } from '../api/client';
import type { DashboardSummary, Task } from '../types';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const summary = await api.getDashboardSummary();
      setData(summary);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleToggleTaskStatus = async (task: Task) => {
    const nextStatus = task.status === 'COMPLETED' ? 'TODO' : 'COMPLETED';
    try {
      await api.updateTask(task.event_id, task.id, { status: nextStatus });
      fetchDashboard();
    } catch (err) {
      alert('Failed to update task');
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-10 h-10 border-4 border-[#1F5147]/20 border-t-[#1F5147] rounded-full animate-spin" />
        <p className="text-xs font-semibold text-[#73756F]">Loading Gatherly workspace...</p>
      </div>
    );
  }

  // Error State
  if (error || !data) {
    return (
      <div className="max-w-lg mx-auto my-12 bg-white p-8 rounded-2xl border border-rose-200 text-center shadow-2xs">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="font-editorial text-xl font-bold text-[#252923] mb-2">Unable to load dashboard</h3>
        <p className="text-xs text-[#73756F] mb-6">{error || 'Something went wrong while connecting to the server.'}</p>
        <button
          onClick={fetchDashboard}
          className="px-4 py-2 bg-[#1F5147] text-white rounded-xl text-xs font-semibold hover:bg-[#173F37] transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Empty State (no events)
  if (data.upcoming_events.length === 0) {
    return (
      <div className="max-w-xl mx-auto my-16 bg-white p-10 rounded-3xl border border-[#E5E3DC] text-center shadow-2xs">
        <div className="w-16 h-16 rounded-2xl bg-[#1F5147]/10 text-[#1F5147] flex items-center justify-center mx-auto mb-4 text-3xl">
          🌿
        </div>
        <h2 className="font-editorial text-2xl font-bold text-[#252923] mb-2">
          No events created yet
        </h2>
        <p className="text-xs text-[#73756F] mb-6 max-w-sm mx-auto leading-relaxed">
          Plan birthdays, weddings, or community gatherings. Gatherly builds your verified budget allocation, time-aware timeline, and vendor records.
        </p>
        <button
          onClick={() => navigate('/events/new')}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1F5147] text-white text-xs font-semibold hover:bg-[#173F37] transition shadow-2xs"
        >
          <Plus className="w-4 h-4" />
          <span>Create Your First Event</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-[#252923]">
            Event Portfolio Dashboard
          </h1>
          <p className="text-xs text-[#73756F]">
            Overview of scheduled occasions, budget allocations, and tasks due soon.
          </p>
        </div>
        <button
          onClick={() => navigate('/events/new')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1F5147] text-white text-xs font-semibold hover:bg-[#173F37] transition shadow-2xs self-start sm:self-center"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Create Event</span>
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-[#E5E3DC] p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[#73756F]">Active Events</span>
            <div className="w-8 h-8 rounded-lg bg-[#1F5147]/10 border border-[#1F5147]/20 flex items-center justify-center text-[#1F5147]">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-bold font-editorial text-[#252923]">
            {data.total_events}
          </span>
          <span className="text-[11px] text-[#73756F] block mt-1">Currently in planning</span>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E3DC] p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[#73756F]">Total Planned Budget</span>
            <div className="w-8 h-8 rounded-lg bg-[#1F5147]/10 border border-[#1F5147]/20 flex items-center justify-center text-[#1F5147]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-bold font-editorial text-[#252923]">
            ₹{data.total_planned_spending.toLocaleString()}
          </span>
          <span className="text-[11px] text-[#73756F] block mt-1">Combined portfolio budget</span>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E3DC] p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[#73756F]">Committed Spending</span>
            <div className="w-8 h-8 rounded-lg bg-[#E9A477]/15 border border-[#E9A477]/30 flex items-center justify-center text-[#9C582B]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-bold font-editorial text-[#9C582B]">
            ₹{data.total_committed_spending.toLocaleString()}
          </span>
          <span className="text-[11px] text-[#73756F] block mt-1">Active vendor commitments</span>
        </div>
      </div>

      {/* Upcoming Events Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-editorial text-lg font-bold text-[#252923]">
            Scheduled Events ({data.upcoming_events.length})
          </h2>
          <span className="text-xs text-[#73756F]">Click any event to open its workspace</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.upcoming_events.map((ev) => {
            const stats = ev.stats;
            const currency = ev.currency || '₹';

            return (
              <div
                key={ev.id}
                onClick={() => navigate(`/events/${ev.id}`)}
                className="bg-white rounded-2xl border border-[#E5E3DC] p-5 shadow-2xs hover:border-[#1F5147]/60 hover:shadow-xs transition cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#1F5147]/10 border border-[#1F5147]/20 flex items-center justify-center text-xl shrink-0">
                        {ev.icon || '🎉'}
                      </div>
                      <div>
                        <h3 className="font-editorial text-lg font-bold text-[#252923] group-hover:text-[#1F5147] transition">
                          {ev.name}
                        </h3>
                        <p className="text-xs text-[#73756F]">
                          {ev.event_type} • {ev.city || 'Location TBD'} • {ev.date}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#F8F7F2] text-[#565952] border border-[#E5E3DC]">
                      {ev.status}
                    </span>
                  </div>

                  {/* Over budget shortfall warning on event card if applicable */}
                  {stats?.is_over_budget && (
                    <div className="mb-3 px-3 py-1.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-[11px] text-rose-800 font-semibold">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span>Shortfall: {currency}{(stats.shortfall || 0).toLocaleString()}</span>
                    </div>
                  )}

                  {/* Days to go badge & budget */}
                  <div className="grid grid-cols-2 gap-2 bg-[#F8F7F2] rounded-xl p-3 mb-4 border border-[#E5E3DC] text-xs">
                    <div>
                      <span className="text-[10px] font-semibold text-[#73756F] uppercase block">Countdown</span>
                      <span className="font-bold text-[#252923]">⏱️ {stats?.days_to_go ?? 0} days to go</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-[#73756F] uppercase block">Committed Budget</span>
                      <span className="font-bold text-[#252923]">
                        {currency}{(stats?.budget_committed ?? 0).toLocaleString()} / {currency}{(ev.total_budget || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Progress bars */}
                  <div className="space-y-2 mb-2">
                    <div>
                      <div className="flex justify-between text-[11px] text-[#73756F] font-medium mb-1">
                        <span>Milestones Progress</span>
                        <span>{stats?.completed_milestones ?? 0}/{stats?.total_milestones ?? 0} ({stats?.milestone_percentage ?? 0}%)</span>
                      </div>
                      <div className="w-full bg-[#F8F7F2] h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[#1F5147] h-full rounded-full"
                          style={{ width: `${stats?.milestone_percentage ?? 0}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-[#73756F] font-medium mb-1">
                        <span>Tasks Completed</span>
                        <span>{stats?.completed_tasks ?? 0}/{stats?.total_tasks ?? 0} ({stats?.task_percentage ?? 0}%)</span>
                      </div>
                      <div className="w-full bg-[#F8F7F2] h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[#E9A477] h-full rounded-full"
                          style={{ width: `${stats?.task_percentage ?? 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E5E3DC] flex items-center justify-between text-xs font-semibold text-[#1F5147] group-hover:translate-x-0.5 transition-transform">
                  <span>Open Event Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tasks Due Soon */}
      <div className="bg-white rounded-2xl border border-[#E5E3DC] p-6 shadow-2xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E5E3DC]">
          <div>
            <h2 className="font-editorial text-base font-bold text-[#252923]">
              Tasks Due Soon Across Events
            </h2>
            <p className="text-xs text-[#73756F]">
              Action items prioritized by approaching deadlines.
            </p>
          </div>
        </div>

        <div className="divide-y divide-[#E5E3DC]">
          {data.tasks_due_soon.length > 0 ? (
            data.tasks_due_soon.map((task) => (
              <div key={task.id} className="py-3 flex items-center justify-between gap-3 group">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggleTaskStatus(task)}
                    className="w-5 h-5 rounded-md border border-[#E5E3DC] hover:border-[#1F5147] bg-[#F8F7F2] flex items-center justify-center transition"
                  >
                    {task.status === 'COMPLETED' && <CheckCircle2 className="w-4 h-4 text-[#1F5147]" />}
                  </button>
                  <div>
                    <span className="text-xs font-semibold text-[#252923] block">
                      {task.title}
                    </span>
                    <span className="text-[11px] text-[#73756F]">
                      Category: {task.category} {task.deadline ? `• Due: ${task.deadline}` : ''}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                      task.priority === 'High'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : task.priority === 'Medium'
                        ? 'bg-[#E9A477]/20 text-[#9C582B] border border-[#E9A477]/40'
                        : 'bg-[#F8F7F2] text-[#565952]'
                    }`}
                  >
                    {task.priority}
                  </span>
                  <Link
                    to={`/events/${task.event_id}`}
                    className="text-xs font-medium text-[#73756F] hover:text-[#252923] p-1"
                    title="Open event"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="py-6 text-center text-xs text-[#73756F]">
              No tasks due soon. All scheduled deliverables are complete!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
