import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import type { EventDetail } from '../types';
import { OverviewTab } from './workspace/OverviewTab';
import { BudgetTab } from './workspace/BudgetTab';
import { TimelineTab } from './workspace/TimelineTab';
import { ChecklistTab } from './workspace/ChecklistTab';
import { VendorsTab } from './workspace/VendorsTab';
import { IdeasTab } from './workspace/IdeasTab';
import { ActivityLogTab } from './workspace/ActivityLogTab';
import { GuestsSeatingPlaceholder } from './workspace/GuestsSeatingPlaceholder';
import { AskCoordaModal } from '../components/common/AskCoordaModal';

interface EventWorkspacePageProps {
  onEventLoaded?: (event: EventDetail) => void;
  isAskCoordaOpen: boolean;
  setIsAskCoordaOpen: (val: boolean) => void;
}

export const EventWorkspacePage: React.FC<EventWorkspacePageProps> = ({
  onEventLoaded,
  isAskCoordaOpen,
  setIsAskCoordaOpen,
}) => {
  const { eventId } = useParams<{ eventId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvent = async () => {
    if (!eventId) return;
    try {
      setLoading(true);
      const data = await api.getEvent(eventId);
      setEvent(data);
      if (onEventLoaded) onEventLoaded(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load event');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [eventId]);

  // Determine current tab from URL path
  // e.g. /events/1/budget -> 'budget'
  // /events/1 -> 'overview'
  const currentTab = React.useMemo(() => {
    const pathParts = location.pathname.split('/');
    if (pathParts.length > 3) {
      return pathParts[3]; // e.g. 'budget', 'timeline', 'checklist', 'vendors', 'ideas'
    }
    return 'overview';
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-10 h-10 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-500">Loading event workspace...</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-xl mx-auto my-12 bg-white p-8 rounded-2xl border border-rose-200 text-center shadow-sm">
        <h3 className="font-editorial text-xl font-bold text-slate-900 mb-2">Event Not Found</h3>
        <p className="text-xs text-slate-500 mb-6">{error || 'Unable to retrieve event record.'}</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Sub-tab navigation strip for convenience */}
      <div className="mb-6 flex items-center gap-1 border-b border-[#EAE8E0] pb-2 overflow-x-auto text-xs font-medium">
        {[
          { id: 'overview', label: 'Overview', path: `/events/${event.id}` },
          { id: 'timeline', label: 'Timeline', path: `/events/${event.id}/timeline` },
          { id: 'checklist', label: 'Tasks & Checklist', path: `/events/${event.id}/checklist` },
          { id: 'budget', label: 'Budget Planner', path: `/events/${event.id}/budget` },
          { id: 'vendors', label: 'Vendors', path: `/events/${event.id}/vendors` },
          { id: 'ideas', label: 'Personalized AI', path: `/events/${event.id}/ideas` },
          { id: 'guests', label: 'Guests', path: `/events/${event.id}/guests` },
          { id: 'seating', label: 'Seating', path: `/events/${event.id}/seating` },
          { id: 'activity', label: 'Activity Log', path: `/events/${event.id}/activity` },
        ].map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
                isActive
                  ? 'bg-white font-bold text-slate-900 shadow-2xs border border-[#E0DED5]'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-black/5'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Render Active Tab */}
      {currentTab === 'overview' && (
        <OverviewTab
          event={event}
          onOpenAskCoorda={() => setIsAskCoordaOpen(true)}
        />
      )}

      {currentTab === 'budget' && (
        <BudgetTab
          event={event}
          onRefresh={fetchEvent}
          onOpenAskCoorda={() => setIsAskCoordaOpen(true)}
        />
      )}

      {currentTab === 'timeline' && (
        <TimelineTab
          event={event}
          onRefresh={fetchEvent}
          onOpenAskCoorda={() => setIsAskCoordaOpen(true)}
        />
      )}

      {currentTab === 'checklist' && (
        <ChecklistTab
          event={event}
          onRefresh={fetchEvent}
          onOpenAskCoorda={() => setIsAskCoordaOpen(true)}
        />
      )}

      {currentTab === 'vendors' && (
        <VendorsTab
          event={event}
          onRefresh={fetchEvent}
          onOpenAskCoorda={() => setIsAskCoordaOpen(true)}
        />
      )}

      {currentTab === 'ideas' && (
        <IdeasTab
          event={event}
          onRefresh={fetchEvent}
          onOpenAskCoorda={() => setIsAskCoordaOpen(true)}
        />
      )}

      {currentTab === 'guests' && (
        <GuestsSeatingPlaceholder event={event} mode="guests" />
      )}

      {currentTab === 'seating' && (
        <GuestsSeatingPlaceholder event={event} mode="seating" />
      )}

      {currentTab === 'files' && (
        <GuestsSeatingPlaceholder event={event} mode="files" />
      )}

      {currentTab === 'activity' && (
        <ActivityLogTab event={event} />
      )}

      {/* "Ask Coorda" Slide-out AI Assistant */}
      <AskCoordaModal
        isOpen={isAskCoordaOpen}
        onClose={() => setIsAskCoordaOpen(false)}
        event={event}
        onRefreshEvent={fetchEvent}
      />
    </div>
  );
};
