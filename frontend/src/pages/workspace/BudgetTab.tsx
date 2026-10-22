import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Plus,
  Trash2,
  Edit2,
  Sparkles,
  PieChart as PieIcon,
  BarChart3,
  AlertTriangle,
  RefreshCw,
  TrendingDown
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { api } from '../../api/client';
import type { EventDetail, Expense, CategorySummary, IdType } from '../../types';

interface BudgetTabProps {
  event: EventDetail;
  onRefresh: () => void;
  onOpenAskCoorda: () => void;
}

const CATEGORY_COLORS = [
  '#1F5147', '#E9A477', '#252923', '#3B82F6',
  '#10B981', '#8B5CF6', '#F59E0B', '#EC4899', '#64748B'
];

export const BudgetTab: React.FC<BudgetTabProps> = ({ event, onRefresh, onOpenAskCoorda }) => {
  const currency = event.currency || '₹';
  const [expenses, setExpenses] = useState<Expense[]>(event.expenses || []);
  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<IdType | null>(null);

  // Form state
  const [formCategory, setFormCategory] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formEstimated, setFormEstimated] = useState('');
  const [formActual, setFormActual] = useState('');
  const [formDeposit, setFormDeposit] = useState('');
  const [formStatus, setFormStatus] = useState('pending');
  const [formNotes, setFormNotes] = useState('');

  // Summary state
  const [totalBudget, setTotalBudget] = useState(event.total_budget || 25000);
  const [totalAllocated, setTotalAllocated] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [totalDepositsPaid, setTotalDepositsPaid] = useState(0);
  const [remainingBalance, setRemainingBalance] = useState(0);
  const [shortfall, setShortfall] = useState(0);
  const [isOverBudget, setIsOverBudget] = useState(false);
  const [reductionSuggestions, setReductionSuggestions] = useState<string[]>([]);

  const fetchBudget = async () => {
    try {
      setLoading(true);
      const data = await api.getBudgetSummary(event.id);
      setExpenses(data.expenses || []);
      setCategories(data.categories || []);
      setTotalBudget(data.total_budget);
      setTotalAllocated(data.total_allocated);
      setTotalSpent(data.total_spent);
      setTotalDepositsPaid(data.total_deposits_paid);
      setRemainingBalance(data.remaining_balance);
      setShortfall(data.shortfall);
      setIsOverBudget(data.is_over_budget);
      setReductionSuggestions(data.reduction_suggestions || []);
    } catch (err) {
      console.error('Error fetching budget summary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudget();
  }, [event.id]);

  // Chart data
  const chartData = React.useMemo(() => {
    return categories.map((c) => ({
      name: c.category.length > 18 ? c.category.slice(0, 16) + '..' : c.category,
      allocated: c.allocated,
      spent: c.actual,
      isOver: c.is_over_budget,
      variance: c.variance
    }));
  }, [categories]);

  const pieData = React.useMemo(() => {
    const valid = categories.filter((c) => c.actual > 0 || c.allocated > 0);
    if (valid.length === 0) return [{ name: 'Budget Cap', value: totalBudget }];
    return valid.map((c) => ({
      name: c.category,
      value: c.actual > 0 ? c.actual : c.allocated,
    }));
  }, [categories, totalBudget]);

  // Handle Add Item
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDescription.trim()) return;

    try {
      const selectedCat = categories.find(c => c.category_id === formCategory || c.category === formCategory);
      await api.addExpense(event.id, {
        category_id: selectedCat?.category_id || undefined,
        description: formDescription,
        estimated_amount: parseFloat(formEstimated) || 0,
        actual_amount: parseFloat(formActual) || 0,
        paid_deposit: parseFloat(formDeposit) || 0,
        payment_status: formStatus,
        notes: formNotes,
      });
      resetForm();
      fetchBudget();
      onRefresh();
    } catch (err) {
      alert('Failed to add expense');
    }
  };

  // Handle Edit Item
  const handleSaveEdit = async (id: IdType) => {
    try {
      const selectedCat = categories.find(c => c.category_id === formCategory || c.category === formCategory);
      await api.updateExpense(id, {
        category_id: selectedCat?.category_id || undefined,
        description: formDescription,
        estimated_amount: parseFloat(formEstimated) || 0,
        actual_amount: parseFloat(formActual) || 0,
        paid_deposit: parseFloat(formDeposit) || 0,
        payment_status: formStatus,
        notes: formNotes,
      });
      resetForm();
      fetchBudget();
      onRefresh();
    } catch (err) {
      alert('Failed to update expense');
    }
  };

  const handleStartEdit = (exp: Expense) => {
    setEditingId(exp.id);
    setIsAdding(false);
    setFormCategory(String(exp.category_id || ''));
    setFormDescription(exp.description);
    setFormEstimated(String(exp.estimated_amount));
    setFormActual(String(exp.actual_amount));
    setFormDeposit(String(exp.paid_deposit));
    setFormStatus(exp.payment_status || 'pending');
    setFormNotes(exp.notes || '');
  };

  const handleDeleteItem = async (id: IdType) => {
    if (!window.confirm('Delete this expense record?')) return;
    try {
      await api.deleteExpense(id);
      fetchBudget();
      onRefresh();
    } catch (err) {
      alert('Failed to delete expense');
    }
  };

  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormCategory(categories[0]?.category_id ? String(categories[0].category_id) : '');
    setFormDescription('');
    setFormEstimated('');
    setFormActual('');
    setFormDeposit('');
    setFormStatus('pending');
    setFormNotes('');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-editorial text-2xl font-bold text-[#252923]">
            Smart Budget Planner
          </h2>
          <p className="text-xs text-[#73756F]">
            Decimal-safe currency accounting with deterministic allocation presets, category limits, and live variance tracking.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchBudget}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-[#E5E3DC] text-[#252923] hover:bg-[#F8F7F2] transition shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#1F5147] ${loading ? 'animate-spin' : ''}`} />
            <span>Recalculate</span>
          </button>
          <button
            onClick={onOpenAskCoorda}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[#E9A477]/15 text-[#9C582B] border border-[#E9A477]/30 hover:bg-[#E9A477]/25 transition shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#E9A477]" />
            <span>Gatherly AI Advice</span>
          </button>
          <button
            onClick={() => {
              resetForm();
              setIsAdding(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#1F5147] text-white hover:bg-[#173F37] transition shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* OVER BUDGET SHORTFALL WARNING */}
      {isOverBudget && (
        <div className="bg-rose-50 border border-rose-300 rounded-2xl p-5 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-rose-200 text-rose-800 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-rose-900">
                Budget Exceeded: Shortfall of {currency}{shortfall.toLocaleString()}
              </h4>
              <p className="text-xs text-rose-800 leading-relaxed">
                Your total spending is {currency}{totalSpent.toLocaleString()} against your budget ceiling of {currency}{totalBudget.toLocaleString()}.
              </p>
              {reductionSuggestions.length > 0 && (
                <div className="pt-2 text-xs text-rose-900 font-medium space-y-1">
                  <span className="font-bold">Suggested reductions:</span>
                  {reductionSuggestions.map((s, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-white rounded-2xl border border-[#E5E3DC] p-4 shadow-2xs">
          <span className="text-[11px] font-medium text-[#73756F] block mb-0.5">
            Total Target Budget
          </span>
          <span className="text-xl font-bold font-editorial text-[#252923]">
            {currency}{totalBudget.toLocaleString()}
          </span>
          <span className="text-[10px] text-[#73756F] block mt-0.5">Global budget cap</span>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E3DC] p-4 shadow-2xs">
          <span className="text-[11px] font-medium text-[#73756F] block mb-0.5">
            Allocated Budget
          </span>
          <span className="text-xl font-bold font-editorial text-[#1F5147]">
            {currency}{totalAllocated.toLocaleString()}
          </span>
          <span className="text-[10px] text-[#73756F] block mt-0.5">
            {currency}{Math.max(0, totalBudget - totalAllocated).toLocaleString()} unallocated
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E3DC] p-4 shadow-2xs">
          <span className="text-[11px] font-medium text-[#73756F] block mb-0.5">
            Actual Spending
          </span>
          <span className={`text-xl font-bold font-editorial ${isOverBudget ? 'text-rose-600' : 'text-[#252923]'}`}>
            {currency}{totalSpent.toLocaleString()}
          </span>
          <span className="text-[10px] text-[#73756F] block mt-0.5">
            {totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0}% of budget
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E3DC] p-4 shadow-2xs">
          <span className="text-[11px] font-medium text-[#73756F] block mb-0.5">
            Deposits Paid
          </span>
          <span className="text-xl font-bold font-editorial text-[#1F5147]">
            {currency}{totalDepositsPaid.toLocaleString()}
          </span>
          <span className="text-[10px] text-[#73756F] block mt-0.5">Confirmed to vendors</span>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E3DC] p-4 shadow-2xs">
          <span className="text-[11px] font-medium text-[#73756F] block mb-0.5">
            Remaining Balance
          </span>
          <span className={`text-xl font-bold font-editorial ${remainingBalance === 0 && isOverBudget ? 'text-rose-600' : 'text-[#1F5147]'}`}>
            {isOverBudget ? `-${currency}${shortfall.toLocaleString()}` : `${currency}${remainingBalance.toLocaleString()}`}
          </span>
          <span className="text-[10px] text-[#73756F] block mt-0.5">
            {isOverBudget ? 'Deficit' : 'Available balance'}
          </span>
        </div>
      </div>

      {/* Category Level Estimates & Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E5E3DC] p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-editorial text-base font-bold text-[#252923] flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#73756F]" />
              Allocated vs. Actual by Category
            </h3>
            <span className="text-[11px] text-[#73756F]">{currency} safe arithmetic</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-15} textAnchor="end" interval={0} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(val: any) => [`${currency}${Number(val).toLocaleString()}`, '']}
                  contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E5E3DC', fontSize: '11px' }}
                />
                <Bar dataKey="allocated" fill="#E5E3DC" radius={[4, 4, 0, 0]} name="Allocated" />
                <Bar dataKey="spent" fill="#1F5147" radius={[4, 4, 0, 0]} name="Actual" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-2xl border border-[#E5E3DC] p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-editorial text-base font-bold text-[#252923] flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-[#73756F]" />
              Category Share
            </h3>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`${currency}${Number(val).toLocaleString()}`, 'Share']}
                  contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E5E3DC', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 text-[10px] text-[#73756F] justify-center">
            {pieData.slice(0, 5).map((d, i) => (
              <span key={i} className="flex items-center gap-1">
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block"
                  style={{ backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }}
                />
                {d.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Add / Edit Form */}
      {(isAdding || editingId !== null) && (
        <div className="bg-white border-2 border-[#1F5147]/30 rounded-2xl p-5 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-editorial text-base font-bold text-[#252923]">
              {editingId !== null ? 'Edit Expense Record' : 'Add New Expense Record'}
            </h3>
            <button onClick={resetForm} className="text-xs text-[#73756F] hover:text-[#252923]">
              Cancel
            </button>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (editingId !== null) handleSaveEdit(editingId);
              else handleAddItem(e);
            }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3"
          >
            <div className="lg:col-span-1">
              <label className="text-[10px] font-bold uppercase text-[#73756F] block mb-1">
                Category
              </label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="w-full bg-[#F8F7F2] border border-[#E5E3DC] rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#1F5147]"
              >
                <option value="">-- Uncategorized --</option>
                {categories.map((c) => (
                  <option key={c.category_id || c.category} value={c.category_id || c.category}>
                    {c.category}
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-2">
              <label className="text-[10px] font-bold uppercase text-[#73756F] block mb-1">
                Expense Description *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Vegetarian Buffet & Mocktail Bar"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="w-full bg-[#F8F7F2] border border-[#E5E3DC] rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#1F5147]"
              />
            </div>

            <div className="lg:col-span-1">
              <label className="text-[10px] font-bold uppercase text-[#73756F] block mb-1">
                Estimated ({currency})
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formEstimated}
                onChange={(e) => setFormEstimated(e.target.value)}
                className="w-full bg-[#F8F7F2] border border-[#E5E3DC] rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#1F5147]"
              />
            </div>

            <div className="lg:col-span-1">
              <label className="text-[10px] font-bold uppercase text-[#73756F] block mb-1">
                Actual Cost ({currency})
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formActual}
                onChange={(e) => setFormActual(e.target.value)}
                className="w-full bg-[#F8F7F2] border border-[#E5E3DC] rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#1F5147]"
              />
            </div>

            <div className="lg:col-span-1">
              <label className="text-[10px] font-bold uppercase text-[#73756F] block mb-1">
                Deposit Paid ({currency})
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formDeposit}
                onChange={(e) => setFormDeposit(e.target.value)}
                className="w-full bg-[#F8F7F2] border border-[#E5E3DC] rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#1F5147]"
              />
            </div>

            <div className="lg:col-span-6 flex items-center justify-between mt-2 pt-2 border-t border-[#E5E3DC]">
              <input
                type="text"
                placeholder="Vendor notes, terms or quotation details..."
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                className="w-2/3 bg-[#F8F7F2] border border-[#E5E3DC] rounded-xl px-3 py-1.5 text-xs focus:ring-1 focus:ring-[#1F5147]"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs text-[#565952] hover:bg-[#F8F7F2]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-[#1F5147] text-white text-xs font-semibold hover:bg-[#173F37]"
                >
                  {editingId !== null ? 'Save Changes' : 'Add Record'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Expense Records Table */}
      <div className="bg-white rounded-2xl border border-[#E5E3DC] overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-[#E5E3DC] flex items-center justify-between">
          <h3 className="font-editorial text-base font-bold text-[#252923]">
            Individual Expense Records ({expenses.length})
          </h3>
          <span className="text-xs text-[#73756F]">
            Automatic decimal-safe recalculation
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8F7F2] text-[#73756F] uppercase text-[10px] tracking-wider border-b border-[#E5E3DC]">
              <tr>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold">Description & Notes</th>
                <th className="py-3 px-4 font-semibold text-right">Estimated</th>
                <th className="py-3 px-4 font-semibold text-right">Actual Cost</th>
                <th className="py-3 px-4 font-semibold text-right">Deposit Paid</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
                <th className="py-3 px-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E3DC]">
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-[#73756F]">
                    No expenses recorded yet. Click "Add Expense" to log your first item.
                  </td>
                </tr>
              ) : (
                expenses.map((exp) => {
                  return (
                    <tr key={exp.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3 px-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#1F5147]/10 text-[#1F5147] border border-[#1F5147]/20 uppercase">
                          {exp.category_name || 'General'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-[#252923] block">
                          {exp.description}
                        </span>
                        {exp.notes && (
                          <span className="text-[11px] text-[#73756F] block truncate max-w-xs">
                            {exp.notes}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-[#565952]">
                        {currency}{exp.estimated_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-[#252923]">
                        {currency}{exp.actual_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-[#1F5147]">
                        {currency}{exp.paid_deposit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          exp.payment_status === 'paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : exp.payment_status === 'deposit_paid'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {exp.payment_status === 'deposit_paid' ? 'Deposit Paid' : exp.payment_status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleStartEdit(exp)}
                            className="p-1.5 rounded-md hover:bg-slate-200/60 text-[#73756F] hover:text-[#252923] transition"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(exp.id)}
                            className="p-1.5 rounded-md hover:bg-rose-100/60 text-[#73756F] hover:text-rose-600 transition"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
