import React, { useState } from 'react';
import type { EventDetail } from '../../types';

interface GuestsSeatingPlaceholderProps {
  event: EventDetail;
  mode: 'guests' | 'seating' | 'files';
}

export const GuestsSeatingPlaceholder: React.FC<GuestsSeatingPlaceholderProps> = ({ event, mode }) => {
  const [guests, setGuests] = useState([
    { id: 1, name: 'Eleanor Vance', table: 'Table 1 — Head Table', status: 'Confirmed', meal: 'Herb Salmon' },
    { id: 2, name: 'Julian Vance', table: 'Table 1 — Head Table', status: 'Confirmed', meal: 'Filet Mignon' },
    { id: 3, name: 'Claire Bennett', table: 'Table 2 — Family', status: 'Confirmed', meal: 'Vegetarian Risotto' },
    { id: 4, name: 'David Chen', table: 'Table 3 — Friends', status: 'Pending', meal: 'Undecided' },
    { id: 5, name: 'Sarah Jenkins', table: 'Table 3 — Friends', status: 'Confirmed', meal: 'Filet Mignon' },
  ]);
  const [newGuestName, setNewGuestName] = useState('');

  const handleAddGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuestName.trim()) return;
    setGuests(prev => [
      ...prev,
      {
        id: Date.now(),
        name: newGuestName,
        table: 'Unassigned',
        status: 'Pending',
        meal: 'Standard'
      }
    ]);
    setNewGuestName('');
  };

  if (mode === 'files') {
    return (
      <div className="space-y-6 max-w-4xl mx-auto pb-12">
        <h2 className="font-editorial text-2xl font-bold text-slate-900">
          Event Documents & Contracts
        </h2>
        <div className="bg-white rounded-2xl border border-[#EAE8E0] p-8 text-center shadow-2xs">
          <p className="text-xs text-slate-500 mb-4">
            Upload PDFs, vendor agreements, and floor plan diagrams for {event.name}.
          </p>
          <div className="p-8 border-2 border-dashed border-[#EAE8E0] rounded-xl bg-[#FAF9F5] text-slate-400 text-xs">
            Drag and drop contracts and invoices here, or click to browse
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-editorial text-2xl font-bold text-slate-900">
            {mode === 'guests' ? 'Guest List & RSVPs' : 'Interactive Seating Chart'}
          </h2>
          <p className="text-xs text-slate-500">
            {mode === 'guests'
              ? `Manage invitations, RSVPs, and meal selections for ${event.guest_count} invited guests.`
              : `Arrange floor tables, head table, and seating assignments.`}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#EAE8E0] p-6 shadow-2xs">
        <form onSubmit={handleAddGuest} className="flex gap-2 mb-6">
          <input
            type="text"
            placeholder="Add new guest name..."
            value={newGuestName}
            onChange={(e) => setNewGuestName(e.target.value)}
            className="flex-1 bg-[#FAF9F5] border border-[#EAE8E0] rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-amber-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition"
          >
            Add Guest
          </button>
        </form>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF9F5] text-slate-500 uppercase text-[10px] tracking-wider border-b border-[#EAE8E0]">
              <tr>
                <th className="py-2.5 px-3">Guest Name</th>
                <th className="py-2.5 px-3">Assigned Table</th>
                <th className="py-2.5 px-3">Meal Selection</th>
                <th className="py-2.5 px-3">RSVP Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EFEA]">
              {guests.map((g) => (
                <tr key={g.id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-3 font-semibold text-slate-800">{g.name}</td>
                  <td className="py-3 px-3 text-slate-600">{g.table}</td>
                  <td className="py-3 px-3 text-slate-500">{g.meal}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      g.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'
                    }`}>
                      {g.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
