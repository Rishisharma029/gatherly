import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ListFilter,
  CheckCircle2,
  DollarSign,
  Users2,
  HelpCircle,
  Sparkles,
  MoreVertical,
  AlertTriangle
} from 'lucide-react';
import type { EventDetail } from '../../types';

interface OverviewTabProps {
  event: EventDetail;
  onOpenAskCoorda: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ event, onOpenAskCoorda }) => {
  const navigate = useNavigate();
  const stats = event.stats;
  const currency = event.currency || '₹';

  const formattedDate = React.useMemo(() => {
    const rawDate = event.event_date || event.date;
    if (!rawDate) return 'Date TBD';
    try {
      const dt = new Date(rawDate);
      return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return rawDate;
    }
  }, [event.event_date, event.date]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      
      {/* Shortfall or Over-budget Warning Banner */}
      {stats?.is_over_budget && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center justify-between text-xs text-rose-900 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center text-rose-700 shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold block">
                Budget Exceeded: Shortfall of {currency}{(stats.shortfall || 0).toLocaleString()}
              </span>
              <span className="text-[11px] text-rose-700">
                Your committed expenses exceed your total budget. Review your categories to reduce costs.
              </span>
            </div>
          </div>
          <button
            onClick={() => navigate(`/events/${event.id}/budget`)}
            className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-semibold text-xs hover:bg-rose-700 transition"
          >
            Adjust Budget
          </button>
        </div>
      )}

      {/* Date Warning */}
      {stats?.date_warning && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-center gap-2.5 text-xs text-amber-900 shadow-2xs">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
          <span>{stats.date_warning}</span>
        </div>
      )}

      {/* 1. HERO EVENT BANNER CARD */}
      <div className="bg-white rounded-2xl border border-[#E5E3DC] p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            {/* Event Icon Badge */}
            <div className="w-14 h-14 rounded-2xl bg-[#1F5147]/10 border border-[#1F5147]/20 flex items-center justify-center text-2xl shadow-2xs shrink-0">
              {event.icon || '🎉'}
            </div>
            
            {/* Title & Metadata */}
            <div className="space-y-1.5">
              <h1 className="font-editorial text-2xl md:text-3xl font-bold text-[#252923] tracking-tight">
                {event.name}
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#73756F] font-medium">
                <span>{event.event_type}</span>
                <span>•</span>
                <span>{event.city || 'Location TBD'}</span>
                <span>•</span>
                <span>{formattedDate}</span>
                <span>•</span>
                <span className="inline-flex items-center gap-1 text-[#1F5147] bg-[#1F5147]/10 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border border-[#1F5147]/20">
                  ⏱️ {stats?.days_to_go ?? 30} days to go
                </span>
              </div>
            </div>
          </div>

          {/* Right Header Badges and Actions */}
          <div className="flex items-center gap-2.5 self-start md:self-center">
            <span className="px-3 py-1 rounded-full text-[11px] font-bold tracking-wider text-[#565952] bg-[#F8F7F2] border border-[#E5E3DC] uppercase">
              {event.status}
            </span>

            <button
              title="Event information"
              onClick={() => alert(`Event: ${event.name}\nCity: ${event.city}\nGuests: ${event.guest_count}\nTheme: ${event.theme || 'TBD'}\nAtmosphere: ${event.atmosphere || 'TBD'}\nPreferences: ${event.preferences || 'None'}`)}
              className="w-8 h-8 rounded-lg border border-[#E5E3DC] flex items-center justify-center text-[#73756F] hover:text-[#252923] hover:bg-slate-50 transition"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* Gatherly AI Primary Action */}
            <button
              onClick={onOpenAskCoorda}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[#1F5147] text-white hover:bg-[#173F37] transition shadow-xs group border border-[#1F5147]"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#E9A477] group-hover:rotate-12 transition-transform" />
              <span>Gatherly AI</span>
            </button>

            {/* Overflow Options */}
            <button
              onClick={() => navigate(`/events/${event.id}/budget`)}
              className="w-8 h-8 rounded-lg border border-[#E5E3DC] flex items-center justify-center text-[#73756F] hover:text-[#252923] hover:bg-slate-50 transition"
              title="Options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. TOP FOUR METRIC STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Timeline Progress */}
        <div className="bg-white rounded-2xl border border-[#E5E3DC] p-5 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-[#73756F] block mb-1">
              Timeline Progress
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-editorial text-[#252923]">
                {stats?.completed_milestones ?? 0}/{stats?.total_milestones ?? 0}
              </span>
            </div>
            <span className="text-[11px] text-[#73756F] block mt-0.5">
              Milestones completed
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#1F5147]/10 border border-[#1F5147]/20 flex items-center justify-center text-[#1F5147]">
            <ListFilter className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Tasks Progress */}
        <div className="bg-white rounded-2xl border border-[#E5E3DC] p-5 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-[#73756F] block mb-1">
              Tasks Progress
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-editorial text-[#252923]">
                {stats?.completed_tasks ?? 0}/{stats?.total_tasks ?? 0}
              </span>
            </div>
            <span className="text-[11px] text-[#73756F] block mt-0.5">
              Tasks completed
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#1F5147]/10 border border-[#1F5147]/20 flex items-center justify-center text-[#1F5147]">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Budget Committed */}
        <div className="bg-white rounded-2xl border border-[#E5E3DC] p-5 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-[#73756F] block mb-1">
              Budget Committed
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-editorial text-[#252923]">
                {currency}{(stats?.budget_committed ?? 0).toLocaleString()}
              </span>
            </div>
            <span className="text-[11px] text-[#73756F] block mt-0.5">
              of {currency}{(stats?.total_budget ?? 0).toLocaleString()} target
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#E9A477]/15 border border-[#E9A477]/30 flex items-center justify-center text-[#9C582B]">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: Vendors */}
        <div className="bg-white rounded-2xl border border-[#E5E3DC] p-5 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-[#73756F] block mb-1">
              Vendors
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-editorial text-[#252923]">
                {stats?.total_vendors ?? 0}
              </span>
            </div>
            <span className="text-[11px] text-[#73756F] block mt-0.5">
              Total suppliers
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#1F5147]/10 border border-[#1F5147]/20 flex items-center justify-center text-[#1F5147]">
            <Users2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. PROGRESS VISUALIZATION CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Timeline Progress Card */}
        <div className="bg-white rounded-2xl border border-[#E5E3DC] p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="font-editorial text-base font-bold text-[#252923] mb-4">
              Timeline Progress
            </h3>
            <div className="flex items-center justify-between text-xs font-semibold text-[#565952] mb-1.5">
              <span>{stats?.completed_milestones ?? 0}/{stats?.total_milestones ?? 0}</span>
              <span>{stats?.milestone_percentage ?? 0}%</span>
            </div>
            <div className="w-full bg-[#F8F7F2] h-2 rounded-full overflow-hidden mb-5">
              <div
                className="bg-[#1F5147] h-full rounded-full transition-all duration-500"
                style={{ width: `${stats?.milestone_percentage ?? 0}%` }}
              />
            </div>
          </div>
          <button
            onClick={() => navigate(`/events/${event.id}/timeline`)}
            className="w-full py-2.5 px-4 rounded-xl border border-[#E5E3DC] text-xs font-semibold text-[#565952] hover:bg-[#F8F7F2] hover:text-[#252923] transition text-center"
          >
            View Timeline
          </button>
        </div>

        {/* Tasks Progress Card */}
        <div className="bg-white rounded-2xl border border-[#E5E3DC] p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="font-editorial text-base font-bold text-[#252923] mb-4">
              Tasks Progress
            </h3>
            <div className="flex items-center justify-between text-xs font-semibold text-[#565952] mb-1.5">
              <span>{stats?.completed_tasks ?? 0}/{stats?.total_tasks ?? 0}</span>
              <span>{stats?.task_percentage ?? 0}%</span>
            </div>
            <div className="w-full bg-[#F8F7F2] h-2 rounded-full overflow-hidden mb-5">
              <div
                className="bg-[#E9A477] h-full rounded-full transition-all duration-500"
                style={{ width: `${stats?.task_percentage ?? 0}%` }}
              />
            </div>
          </div>
          <button
            onClick={() => navigate(`/events/${event.id}/checklist`)}
            className="w-full py-2.5 px-4 rounded-xl border border-[#E5E3DC] text-xs font-semibold text-[#565952] hover:bg-[#F8F7F2] hover:text-[#252923] transition text-center"
          >
            View Tasks
          </button>
        </div>

      </div>

      {/* 4. RECENT ACTIVITY FEED */}
      <div className="bg-white rounded-2xl border border-[#E5E3DC] p-6 shadow-2xs">
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#E5E3DC]">
          <h3 className="font-editorial text-base font-bold text-[#252923]">
            Recent Activity
          </h3>
          <button
            onClick={() => navigate(`/events/${event.id}/activity`)}
            className="text-xs font-semibold text-[#565952] hover:text-[#252923] px-3 py-1.5 rounded-lg border border-[#E5E3DC] hover:bg-slate-50 transition"
          >
            View Full Audit
          </button>
        </div>

        {/* Activity Items */}
        <div className="space-y-3.5">
          {event.activity_logs && event.activity_logs.length > 0 ? (
            event.activity_logs.slice(0, 5).map((log) => (
              <div key={log.id} className="flex items-center justify-between py-1 group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#1F5147]/10 border border-[#1F5147]/20 text-[#1F5147] flex items-center justify-center text-xs font-bold shrink-0">
                    {log.user_name ? log.user_name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'EV'}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#252923]">
                      {log.action}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-[#73756F]">
                      <span>{log.user_name}</span>
                      <span>•</span>
                      <span>{log.timestamp_label || 'Today'}</span>
                    </div>
                  </div>
                </div>

                <span className="text-[10px] font-semibold tracking-wider text-[#565952] bg-[#F8F7F2] border border-[#E5E3DC] px-2.5 py-0.5 rounded-full uppercase">
                  {log.entity_type}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-xs text-[#73756F]">
              No activity recorded yet.
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
