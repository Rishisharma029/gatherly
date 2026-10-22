import React from 'react';
import type { EventDetail } from '../../types';

interface ActivityLogTabProps {
  event: EventDetail;
}

export const ActivityLogTab: React.FC<ActivityLogTabProps> = ({ event }) => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div>
        <h2 className="font-editorial text-2xl font-bold text-slate-900">
          Activity & Audit Log
        </h2>
        <p className="text-xs text-slate-500">
          Complete chronological timeline of vendor updates, status changes, task completions, and budget edits.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-[#EAE8E0] p-6 shadow-2xs divide-y divide-[#F0EFEA]">
        {event.activity_logs && event.activity_logs.length > 0 ? (
          event.activity_logs.map((log) => (
            <div key={log.id} className="py-3.5 flex items-center justify-between first:pt-0 last:pb-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-pink-100/70 border border-pink-200 text-pink-700 flex items-center justify-center text-xs font-bold shrink-0">
                  {log.user_name ? log.user_name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'EV'}
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800">
                    {log.action}
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                    <span>{log.user_name}</span>
                    <span>•</span>
                    <span>{log.timestamp_label || 'Today'}</span>
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                {log.entity_type}
              </span>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-xs text-slate-400">
            No activity history recorded yet.
          </div>
        )}
      </div>
    </div>
  );
};
