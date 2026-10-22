import React, { useState } from 'react';
import {
  Plus,
  Mail,
  Phone,
  Calendar,
  Trash2,
  Tag,
  Info
} from 'lucide-react';
import { api } from '../../api/client';
import type { EventDetail, Vendor, IdType } from '../../types';

interface VendorsTabProps {
  event: EventDetail;
  onRefresh: () => void;
  onOpenAskCoorda: () => void;
}

const VENDOR_CATEGORIES = [
  'venue',
  'catering',
  'decoration',
  'photographer',
  'entertainment',
  'invitation/printing',
  'transport',
  'miscellaneous'
];

export const VendorsTab: React.FC<VendorsTabProps> = ({ event, onRefresh }) => {
  const currency = event.currency || '₹';
  const [vendors, setVendors] = useState<Vendor[]>(event.vendors || []);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isAdding, setIsAdding] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Vendor['category']>('catering');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [estimatedQuote, setEstimatedQuote] = useState('');
  const [finalQuote, setFinalQuote] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [depositPaid, setDepositPaid] = useState(false);
  const [status, setStatus] = useState<Vendor['status']>('contacted');
  const [followUpDate, setFollowUpDate] = useState('');
  const [notes, setNotes] = useState('');

  // Handle status update
  const handleStatusChange = async (vendor: Vendor, newStatus: Vendor['status']) => {
    try {
      const updated = await api.updateVendor(event.id, vendor.id, { status: newStatus });
      setVendors((prev) => prev.map((v) => (v.id === vendor.id ? updated : v)));
      onRefresh();
    } catch (err) {
      alert('Failed to update vendor status');
    }
  };

  // Handle deposit toggle
  const handleToggleDepositPaid = async (vendor: Vendor) => {
    try {
      const updated = await api.updateVendor(event.id, vendor.id, { deposit_paid: !vendor.deposit_paid });
      setVendors((prev) => prev.map((v) => (v.id === vendor.id ? updated : v)));
      onRefresh();
    } catch (err) {
      alert('Failed to update deposit payment status');
    }
  };

  // Create vendor
  const handleAddVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const est = parseFloat(estimatedQuote) || 0;
      const fin = parseFloat(finalQuote) || 0;
      const dep = parseFloat(depositAmount) || 0;
      const base = fin > 0 ? fin : est;
      const bal = depositPaid ? Math.max(0, base - dep) : base;

      const newVendor = await api.addVendor(event.id, {
        name,
        category,
        contact_name: contactName,
        email,
        phone,
        website,
        estimated_quote: est,
        final_quote: fin,
        deposit_amount: dep,
        deposit_paid: depositPaid,
        balance_due: bal,
        status,
        follow_up_date: followUpDate,
        notes,
        rating: 5.0,
      });
      setVendors((prev) => [...prev, newVendor]);
      setIsAdding(false);
      resetForm();
      onRefresh();
    } catch (err) {
      alert('Failed to add vendor');
    }
  };

  const handleDeleteVendor = async (id: IdType) => {
    if (!window.confirm('Delete this vendor record?')) return;
    try {
      await api.deleteVendor(event.id, id);
      setVendors((prev) => prev.filter((v) => v.id !== id));
      onRefresh();
    } catch (err) {
      alert('Failed to delete vendor');
    }
  };

  const resetForm = () => {
    setName('');
    setCategory('catering');
    setContactName('');
    setEmail('');
    setPhone('');
    setWebsite('');
    setEstimatedQuote('');
    setFinalQuote('');
    setDepositAmount('');
    setDepositPaid(false);
    setStatus('contacted');
    setFollowUpDate('');
    setNotes('');
  };

  const filteredVendors = vendors.filter((v) => {
    if (statusFilter !== 'ALL' && v.status !== statusFilter) return false;
    return true;
  });

  const totalCommitted = vendors.reduce((sum, v) => sum + ((v.final_quote && v.final_quote > 0) ? v.final_quote : (v.quoted_amount || v.estimated_quote || 0)), 0);
  const totalDeposits = vendors.reduce((sum, v) => sum + (v.deposit_paid ? v.deposit_amount : 0), 0);
  const totalBalanceDue = vendors.reduce((sum, v) => sum + (v.balance_due || 0), 0);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-editorial text-2xl font-bold text-[#252923]">
            Vendor Checklist & Tracker
          </h2>
          <p className="text-xs text-[#73756F]">
            Organize suppliers across standard categories: quotes, deposits, balance due, and next follow-up dates.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#1F5147] text-white hover:bg-[#173F37] transition shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Vendor</span>
          </button>
        </div>
      </div>

      {/* MVP Guidance Note */}
      <div className="bg-[#F8F7F2] border border-[#E5E3DC] rounded-xl p-3 flex items-center gap-2.5 text-xs text-[#565952]">
        <Info className="w-4 h-4 text-[#1F5147] shrink-0" />
        <span>User-managed directory: Generated or draft vendor records represent placeholder estimates and are not verified real businesses.</span>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-2xl border border-[#E5E3DC] p-4 shadow-2xs">
          <span className="text-[11px] font-medium text-[#73756F] block mb-0.5">
            Total Vendors
          </span>
          <span className="text-xl font-bold font-editorial text-[#252923]">
            {vendors.length} Records
          </span>
          <span className="text-[10px] text-[#73756F] block mt-0.5">
            {vendors.filter(v => v.status === 'booked').length} Booked
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E3DC] p-4 shadow-2xs">
          <span className="text-[11px] font-medium text-[#73756F] block mb-0.5">
            Committed Quotes
          </span>
          <span className="text-xl font-bold font-editorial text-[#252923]">
            {currency}{totalCommitted.toLocaleString()}
          </span>
          <span className="text-[10px] text-[#73756F] block mt-0.5">Active selections</span>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E3DC] p-4 shadow-2xs">
          <span className="text-[11px] font-medium text-[#73756F] block mb-0.5">
            Deposits Paid
          </span>
          <span className="text-xl font-bold font-editorial text-[#1F5147]">
            {currency}{totalDeposits.toLocaleString()}
          </span>
          <span className="text-[10px] text-[#73756F] block mt-0.5">Secured advance payments</span>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E3DC] p-4 shadow-2xs">
          <span className="text-[11px] font-medium text-[#73756F] block mb-0.5">
            Remaining Balance Due
          </span>
          <span className="text-xl font-bold font-editorial text-[#9C582B]">
            {currency}{totalBalanceDue.toLocaleString()}
          </span>
          <span className="text-[10px] text-[#73756F] block mt-0.5">Pending day-of settlement</span>
        </div>
      </div>

      {/* Status Filter Chips */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        {['ALL', 'shortlisted', 'contacted', 'quoted', 'booked', 'cancelled'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition capitalize ${
              statusFilter === st
                ? 'bg-[#1F5147] text-white font-semibold'
                : 'bg-white border border-[#E5E3DC] text-[#565952] hover:bg-[#F8F7F2]'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Add Vendor Form */}
      {isAdding && (
        <div className="bg-white border-2 border-[#1F5147]/30 rounded-2xl p-5 shadow-sm animate-in fade-in duration-200">
          <h3 className="font-editorial text-base font-bold text-[#252923] mb-3">
            Add New Vendor Record
          </h3>
          <form onSubmit={handleAddVendor} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase text-[#73756F] block mb-1">
                  Vendor / Business Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Saffron Greens Hospitality"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#F8F7F2] border border-[#E5E3DC] rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#1F5147]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-[#73756F] block mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-[#F8F7F2] border border-[#E5E3DC] rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#1F5147] capitalize"
                >
                  {VENDOR_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.replace('/', ' / ')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-[#73756F] block mb-1">
                  Booking Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full bg-[#F8F7F2] border border-[#E5E3DC] rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#1F5147] capitalize"
                >
                  <option value="shortlisted">Shortlisted</option>
                  <option value="contacted">Contacted</option>
                  <option value="quoted">Quoted</option>
                  <option value="booked">Booked</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase text-[#73756F] block mb-1">
                  Contact Person
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Sharma"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full bg-[#F8F7F2] border border-[#E5E3DC] rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#1F5147]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-[#73756F] block mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="contact@vendor.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#F8F7F2] border border-[#E5E3DC] rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#1F5147]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-[#73756F] block mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+91 98000 00000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#F8F7F2] border border-[#E5E3DC] rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#1F5147]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase text-[#73756F] block mb-1">
                  Estimated Quote ({currency})
                </label>
                <input
                  type="number"
                  placeholder="7500.00"
                  value={estimatedQuote}
                  onChange={(e) => setEstimatedQuote(e.target.value)}
                  className="w-full bg-[#F8F7F2] border border-[#E5E3DC] rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#1F5147]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-[#73756F] block mb-1">
                  Final Quote ({currency})
                </label>
                <input
                  type="number"
                  placeholder="6500.00"
                  value={finalQuote}
                  onChange={(e) => setFinalQuote(e.target.value)}
                  className="w-full bg-[#F8F7F2] border border-[#E5E3DC] rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#1F5147]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-[#73756F] block mb-1">
                  Deposit Amount ({currency})
                </label>
                <input
                  type="number"
                  placeholder="2000.00"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full bg-[#F8F7F2] border border-[#E5E3DC] rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#1F5147]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-[#73756F] block mb-1">
                  Next Follow-up Date
                </label>
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-full bg-[#F8F7F2] border border-[#E5E3DC] rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#1F5147]"
                />
              </div>
            </div>

            <div className="flex items-center pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#252923]">
                <input
                  type="checkbox"
                  checked={depositPaid}
                  onChange={(e) => setDepositPaid(e.target.checked)}
                  className="w-4 h-4 rounded text-[#1F5147] focus:ring-[#1F5147]"
                />
                <span>Deposit already paid to vendor?</span>
              </label>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-[#73756F] block mb-1">
                Notes & Terms
              </label>
              <textarea
                rows={2}
                placeholder="Contract terms, deliverables, tasting schedule, cancellation clauses..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-[#F8F7F2] border border-[#E5E3DC] rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#1F5147]"
              />
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
                Save Vendor
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Vendors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredVendors.map((vendor) => {
          return (
            <div
              key={vendor.id}
              className="bg-white rounded-2xl border border-[#E5E3DC] p-5 shadow-2xs hover:border-[#1F5147]/50 transition flex flex-col justify-between group"
            >
              <div>
                {/* Top header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#1F5147]/10 text-[#1F5147] border border-[#1F5147]/20 uppercase mb-1">
                      {vendor.category}
                    </span>
                    <h3 className="font-editorial text-lg font-bold text-[#252923]">
                      {vendor.name}
                    </h3>
                  </div>

                  {/* Status Dropdown */}
                  <select
                    value={vendor.status}
                    onChange={(e) => handleStatusChange(vendor, e.target.value as any)}
                    className="text-xs font-bold rounded-lg px-2.5 py-1 bg-[#F8F7F2] border border-[#E5E3DC] text-[#252923] cursor-pointer focus:ring-1 focus:ring-[#1F5147] capitalize"
                  >
                    <option value="shortlisted">Shortlisted</option>
                    <option value="contacted">Contacted</option>
                    <option value="quoted">Quoted</option>
                    <option value="booked">Booked</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Financial figures */}
                <div className="grid grid-cols-3 gap-2 bg-[#F8F7F2] rounded-xl p-3 mb-3 border border-[#E5E3DC]">
                  <div>
                    <span className="text-[10px] text-[#73756F] uppercase font-semibold block">
                      Quote
                    </span>
                    <span className="font-bold text-xs text-[#252923]">
                      {currency}{(((vendor.final_quote && vendor.final_quote > 0) ? vendor.final_quote : (vendor.quoted_amount || vendor.estimated_quote || 0))).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#73756F] uppercase font-semibold block">
                      Deposit
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-xs text-[#252923]">
                        {currency}{vendor.deposit_amount.toLocaleString()}
                      </span>
                      <button
                        onClick={() => handleToggleDepositPaid(vendor)}
                        className={`text-[9px] font-bold px-1 py-0.2 rounded ${
                          vendor.deposit_paid
                            ? 'bg-[#1F5147]/15 text-[#1F5147]'
                            : 'bg-[#E9A477]/20 text-[#9C582B]'
                        }`}
                        title="Toggle deposit payment"
                      >
                        {vendor.deposit_paid ? 'Paid' : 'Unpaid'}
                      </button>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#73756F] uppercase font-semibold block">
                      Balance Due
                    </span>
                    <span className="font-bold text-xs text-[#9C582B]">
                      {currency}{(vendor.balance_due || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Contact info & follow-up */}
                <div className="space-y-1 text-xs text-[#565952] mb-3">
                  {vendor.contact_name && (
                    <div className="flex items-center gap-2">
                      <span className="text-[#73756F] text-[11px]">Contact:</span>
                      <span className="font-medium text-[#252923]">{vendor.contact_name}</span>
                    </div>
                  )}
                  {vendor.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-[#73756F]" />
                      <a href={`mailto:${vendor.email}`} className="text-[#1F5147] hover:underline truncate">
                        {vendor.email}
                      </a>
                    </div>
                  )}
                  {vendor.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-[#73756F]" />
                      <span>{vendor.phone}</span>
                    </div>
                  )}
                  {vendor.follow_up_date && (
                    <div className="flex items-center gap-2 text-[11px] text-[#E9A477]">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Next Follow-up: {vendor.follow_up_date}</span>
                    </div>
                  )}
                </div>

                {vendor.notes && (
                  <p className="text-xs text-[#565952] bg-white p-2.5 rounded-xl border border-[#E5E3DC] leading-relaxed">
                    {vendor.notes}
                  </p>
                )}
              </div>

              {/* Bottom bar */}
              <div className="mt-4 pt-3 border-t border-[#E5E3DC] flex items-center justify-between">
                <span className="text-[10px] text-[#73756F]">User-entered record</span>
                <button
                  onClick={() => handleDeleteVendor(vendor.id)}
                  className="text-xs text-[#73756F] hover:text-rose-600 p-1 transition"
                  title="Remove Vendor"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
