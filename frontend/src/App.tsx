import React, { useState, useEffect, lazy, Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { AskCoordaModal } from './components/common/AskCoordaModal';
import { api } from './api/client';
import type { Event, EventDetail } from './types';

// Code-splitting via dynamic lazy loading for maximum efficiency and sub-second TTI
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const NewEventWizardPage = lazy(() => import('./pages/NewEventWizardPage').then(m => ({ default: m.NewEventWizardPage })));
const EventWorkspacePage = lazy(() => import('./pages/EventWorkspacePage').then(m => ({ default: m.EventWorkspacePage })));

const PageLoader: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3" role="status" aria-live="polite">
    <div className="w-8 h-8 border-3 border-[#1F5147]/20 border-t-[#1F5147] rounded-full animate-spin" />
    <span className="text-xs font-semibold text-[#73756F]">Loading workspace...</span>
  </div>
);

// Main App Layout Wrapper
const AppLayout: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [activeEvent, setActiveEvent] = useState<EventDetail | null>(null);
  const [isAskCoordaOpen, setIsAskCoordaOpen] = useState(false);
  const location = useLocation();

  const fetchEvents = async () => {
    try {
      const list = await api.getEvents();
      setEvents(list);
    } catch (err) {
      console.error('Failed to load events list', err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [location.pathname]);

  const isWizard = location.pathname === '/events/new';

  return (
    <div className="min-h-screen bg-[#FAF9F5] flex flex-col font-sans">
      <Navbar onOpenAskCoorda={() => setIsAskCoordaOpen(true)} />

      <div className="flex flex-1">
        {/* Render sidebar on all pages except full screen wizard */}
        {!isWizard && (
          <Sidebar events={events} currentEventId={activeEvent?.id} />
        )}

        <main className="flex-1 p-4 md:p-8 overflow-y-auto" id="main-content" tabIndex={-1}>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/events" element={<DashboardPage />} />
              <Route path="/events/new" element={<NewEventWizardPage />} />
              
              {/* Event workspace and all its subtabs */}
              <Route
                path="/events/:eventId/*"
                element={
                  <EventWorkspacePage
                    onEventLoaded={(ev) => setActiveEvent(ev)}
                    isAskCoordaOpen={isAskCoordaOpen}
                    setIsAskCoordaOpen={setIsAskCoordaOpen}
                  />
                }
              />
              
              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Suspense>
        </main>
      </div>

      {/* Global Ask Coorda Drawer if opened from Navbar */}
      <AskCoordaModal
        isOpen={isAskCoordaOpen}
        onClose={() => setIsAskCoordaOpen(false)}
        event={activeEvent}
        onRefreshEvent={fetchEvents}
      />
    </div>
  );
};

export default function App() {
  return (
    <HashRouter>
      <AppLayout />
    </HashRouter>
  );
}
