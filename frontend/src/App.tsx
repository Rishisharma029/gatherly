import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { NewEventWizardPage } from './pages/NewEventWizardPage';
import { EventWorkspacePage } from './pages/EventWorkspacePage';
import { AskCoordaModal } from './components/common/AskCoordaModal';
import { api } from './api/client';
import type { Event, EventDetail } from './types';

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

        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
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
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
