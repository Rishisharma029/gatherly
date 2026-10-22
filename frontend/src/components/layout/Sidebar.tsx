import React from 'react';
import { NavLink, useParams, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Clock,
  CheckSquare,
  UserPlus,
  Grid,
  Handshake,
  DollarSign,
  FolderClosed,
  History,
  Sparkles,
  Settings,
  ChevronDown
} from 'lucide-react';
import type { Event } from '../../types';

interface SidebarProps {
  events: Event[];
  currentEventId?: string | number;
}

export const Sidebar: React.FC<SidebarProps> = ({ events, currentEventId }) => {
  const { eventId: paramEventId } = useParams<{ eventId?: string }>();
  const navigate = useNavigate();

  const activeId = currentEventId || paramEventId || events[0]?.id;
  const currentEvent = events.find(e => e.id === activeId) || events[0];

  const handleSelectEvent = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    if (selectedId) {
      navigate(`/events/${selectedId}`);
    }
  };

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
      isActive
        ? 'bg-[#1F5147]/10 text-[#1F5147] font-semibold border-l-2 border-[#1F5147] pl-2.5'
        : 'text-[#565952] hover:text-[#252923] hover:bg-black/5'
    }`;

  return (
    <aside className="w-56 bg-[#F8F7F2] border-r border-[#E5E3DC] min-h-[calc(100vh-4rem)] flex flex-col justify-between p-4 shrink-0">
      <div className="space-y-6">
        {/* CURRENT EVENT SELECTOR */}
        <div className="bg-white rounded-xl border border-[#E5E3DC] p-2.5 shadow-2xs">
          <label className="text-[10px] font-bold text-[#73756F] uppercase tracking-wider block mb-1">
            Current Event
          </label>
          <div className="relative">
            <select
              value={currentEvent?.id || ''}
              onChange={handleSelectEvent}
              aria-label="Current Event"
              className="w-full appearance-none bg-transparent pr-7 text-xs font-semibold text-[#252923] focus:outline-none cursor-pointer truncate"
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.name} ({ev.currency || '₹'}{(ev.total_budget || 0).toLocaleString()})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#73756F] absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* MAIN NAVIGATION */}
        <div>
          <span className="text-[10px] font-bold text-[#73756F] uppercase tracking-wider block mb-2 px-3">
            Main
          </span>
          <nav className="space-y-1">
            <NavLink to="/dashboard" className={navItemClass}>
              <LayoutDashboard className="w-4 h-4 text-[#73756F]" />
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/events" className={navItemClass}>
              <Calendar className="w-4 h-4 text-[#73756F]" />
              <span>Events</span>
            </NavLink>
            <button
              onClick={() => alert("Client directory module")}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#565952] hover:text-[#252923] hover:bg-black/5 transition"
            >
              <Users className="w-4 h-4 text-[#73756F]" />
              <span>Clients</span>
            </button>
          </nav>
        </div>

        {/* EVENT NAVIGATION */}
        {currentEvent && (
          <div>
            <span className="text-[10px] font-bold text-[#73756F] uppercase tracking-wider block mb-2 px-3">
              Event Workspace
            </span>
            <nav className="space-y-1">
              <NavLink to={`/events/${currentEvent.id}`} end className={navItemClass}>
                <Grid className="w-4 h-4 text-[#73756F]" />
                <span>Overview</span>
              </NavLink>
              <NavLink to={`/events/${currentEvent.id}/budget`} className={navItemClass}>
                <DollarSign className="w-4 h-4 text-[#1F5147]" />
                <span>Budget Planner</span>
              </NavLink>
              <NavLink to={`/events/${currentEvent.id}/timeline`} className={navItemClass}>
                <Clock className="w-4 h-4 text-[#73756F]" />
                <span>Timeline</span>
              </NavLink>
              <NavLink to={`/events/${currentEvent.id}/checklist`} className={navItemClass}>
                <CheckSquare className="w-4 h-4 text-[#73756F]" />
                <span>Tasks</span>
              </NavLink>
              <NavLink to={`/events/${currentEvent.id}/vendors`} className={navItemClass}>
                <Handshake className="w-4 h-4 text-[#73756F]" />
                <span>Vendors</span>
              </NavLink>
              <NavLink to={`/events/${currentEvent.id}/ideas`} className={navItemClass}>
                <Sparkles className="w-4 h-4 text-[#E9A477]" />
                <span>Personalized AI</span>
              </NavLink>
              <NavLink to={`/events/${currentEvent.id}/guests`} className={navItemClass}>
                <UserPlus className="w-4 h-4 text-[#73756F]" />
                <span>Guests</span>
              </NavLink>
              <NavLink to={`/events/${currentEvent.id}/seating`} className={navItemClass}>
                <Grid className="w-4 h-4 text-[#73756F]" />
                <span>Seating</span>
              </NavLink>
              <NavLink to={`/events/${currentEvent.id}/files`} className={navItemClass}>
                <FolderClosed className="w-4 h-4 text-[#73756F]" />
                <span>Documents</span>
              </NavLink>
              <NavLink to={`/events/${currentEvent.id}/activity`} className={navItemClass}>
                <History className="w-4 h-4 text-[#73756F]" />
                <span>Audit Log</span>
              </NavLink>
            </nav>
          </div>
        )}
      </div>

      {/* SETTINGS */}
      <div className="pt-4 border-t border-[#E5E3DC]">
        <span className="text-[10px] font-bold text-[#73756F] uppercase tracking-wider block mb-2 px-3">
          Settings
        </span>
        <nav className="space-y-1">
          <button
            onClick={() => alert("Team management & permissions")}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#565952] hover:text-[#252923] hover:bg-black/5 transition"
          >
            <Users className="w-4 h-4 text-[#73756F]" />
            <span>Team</span>
          </button>
          <button
            onClick={() => alert("Workspace preferences and integrations")}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#565952] hover:text-[#252923] hover:bg-black/5 transition"
          >
            <Settings className="w-4 h-4 text-[#73756F]" />
            <span>Settings</span>
          </button>
        </nav>
      </div>
    </aside>
  );
};
