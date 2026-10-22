import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Save,
  AlertTriangle
} from 'lucide-react';
import { api } from '../api/client';
import type { AIGeneratedPlan } from '../types';

export const NewEventWizardPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreviewingAI, setIsPreviewingAI] = useState(false);
  const [aiPlan, setAiPlan] = useState<AIGeneratedPlan | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Form Fields matching section 5.A
  const [eventType, setEventType] = useState('Birthday');
  const [name, setName] = useState("Aarav's 21st Birthday");
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [city, setCity] = useState('Faridabad');
  const [guestCount, setGuestCount] = useState(40);
  const [totalBudget, setTotalBudget] = useState(25000);
  const [currency, setCurrency] = useState('₹');
  const [theme, setTheme] = useState('Black and gold');
  const [atmosphere, setAtmosphere] = useState('Minimal, elegant');
  const [venueType, setVenueType] = useState('Home, restaurant or outdoor');
  const [preferences, setPreferences] = useState('Vegetarian menu, music, accessibility needs');
  const [dietaryRequirements, setDietaryRequirements] = useState('Strict vegetarian menu with elders options');
  const [accessibilityRequirements, setAccessibilityRequirements] = useState('Ground floor or lift access required');
  const [icon, setIcon] = useState('🎉');

  // Check past date
  const isPastDate = React.useMemo(() => {
    if (!date) return false;
    const selected = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selected < today;
  }, [date]);

  // Validate step
  const validateStep = (currentStep: number): boolean => {
    setValidationError(null);
    if (currentStep === 1) {
      if (!name.trim()) {
        setValidationError('Event name is required.');
        return false;
      }
      if (!date) {
        setValidationError('Valid event date is required.');
        return false;
      }
      if (isPastDate) {
        setValidationError('Warning: The selected event date is in the past. Please choose today or a future date, or save as draft.');
        return false;
      }
    } else if (currentStep === 2) {
      if (guestCount <= 0) {
        setValidationError('Guest count must be greater than 0.');
        return false;
      }
      if (totalBudget < 0) {
        setValidationError('Total budget cannot be negative.');
        return false;
      }
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  // Preview AI Plan
  const handlePreviewAI = async () => {
    if (!validateStep(3)) return;
    setIsPreviewingAI(true);
    try {
      const plan = await api.generatePlanPreview({
        event_type: eventType,
        name,
        date,
        city,
        currency,
        guest_count: guestCount,
        total_budget: totalBudget,
        theme,
        atmosphere,
        preferences,
        venue_type: venueType,
        dietary_requirements: dietaryRequirements,
        accessibility_requirements: accessibilityRequirements,
      });
      setAiPlan(plan);
      setStep(4);
    } catch (err) {
      alert('Failed to generate AI plan preview. You can still save the event directly.');
    } finally {
      setIsPreviewingAI(false);
    }
  };

  // Submit / Save event
  const handleSubmit = async (isDraft = false) => {
    if (!name.trim()) {
      alert('Please enter an event name.');
      return;
    }
    if (!isDraft && isPastDate) {
      alert('Event date cannot be in the past. Please select a future date or save as draft.');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await api.createEvent(
        {
          name,
          event_type: eventType,
          date,
          city,
          venue_type: venueType,
          guest_count: guestCount,
          total_budget: totalBudget,
          currency,
          theme,
          atmosphere,
          preferences,
          dietary_requirements: dietaryRequirements,
          accessibility_requirements: accessibilityRequirements,
          status: isDraft ? 'DRAFT' : 'PLANNING',
          icon,
        },
        true // deterministic budget allocation & timeline tasks
      );

      navigate(`/events/${created.id}`);
    } catch (err: any) {
      alert(err.message || 'Failed to save event');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 pb-20">
      
      {/* Top Header */}
      <div className="text-center space-y-2 mb-8">
        <div className="w-10 h-10 rounded-2xl bg-[#1F5147]/10 border border-[#1F5147]/20 text-[#1F5147] flex items-center justify-center mx-auto text-lg shadow-2xs">
          🌿
        </div>
        <h1 className="font-editorial text-3xl font-bold text-[#252923] tracking-tight">
          Event Setup Wizard
        </h1>
        <p className="text-xs text-[#73756F] max-w-md mx-auto">
          Capture your event fundamentals and preferences. Gatherly will calibrate your verified budget allocation, time-aware milestones, and supplier records.
        </p>
      </div>

      {/* Step Indicators */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {[
          { num: 1, label: 'Fundamentals' },
          { num: 2, label: 'Scale & Budget' },
          { num: 3, label: 'Aesthetic & Notes' },
          { num: 4, label: 'Plan Preview' },
        ].map((s) => {
          const isActive = step === s.num;
          const isDone = step > s.num;

          return (
            <button
              key={s.num}
              onClick={() => {
                if (s.num < step || validateStep(step)) {
                  setStep(s.num);
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                isActive
                  ? 'bg-[#1F5147] text-white shadow-2xs'
                  : isDone
                  ? 'bg-[#1F5147]/10 text-[#1F5147]'
                  : 'bg-white border border-[#E5E3DC] text-[#73756F]'
              }`}
            >
              <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px]">
                {isDone ? <Check className="w-3 h-3 text-[#1F5147]" /> : s.num}
              </span>
              <span>{s.label}</span>
            </button>
          );
        })}
      </div>

      {/* Validation Warning Alert */}
      {validationError && (
        <div className="mb-6 bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center gap-3 text-xs text-rose-800 shadow-2xs">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Main Wizard Form Card */}
      <div className="bg-white rounded-3xl border border-[#E5E3DC] p-6 sm:p-8 shadow-2xs">
        
        {/* STEP 1: FUNDAMENTALS */}
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <h2 className="font-editorial text-xl font-bold text-[#252923] border-b border-[#E5E3DC] pb-3">
              Step 1: Event Fundamentals
            </h2>

            <div>
              <label className="text-xs font-bold text-[#252923] block mb-2">
                Event Type
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { label: 'Birthday', icon: '🎂' },
                  { label: 'Wedding', icon: '💍' },
                  { label: 'Community Gathering', icon: '🌟' },
                  { label: 'Corporate Gala', icon: '💼' },
                  { label: 'Anniversary', icon: '🥂' },
                  { label: 'Private Dinner', icon: '🍷' },
                  { label: 'Product Launch', icon: '🚀' },
                  { label: 'Conference / Summit', icon: '🎤' },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      setEventType(item.label);
                      setIcon(item.icon);
                    }}
                    className={`p-3 rounded-2xl border text-left transition flex items-center gap-2.5 ${
                      eventType === item.label
                        ? 'border-[#1F5147] bg-[#1F5147]/5 font-bold text-[#1F5147] shadow-2xs'
                        : 'border-[#E5E3DC] bg-[#F8F7F2] text-[#252923] hover:border-[#1F5147]/30'
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-xs">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#252923] block mb-1">
                Event Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Aarav's 21st Birthday"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#F8F7F2] border border-[#E5E3DC] rounded-xl px-3.5 py-2.5 text-xs text-[#252923] focus:bg-white focus:ring-1 focus:ring-[#1F5147] font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[#252923] block mb-1">
                  Event Date *
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-[#F8F7F2] border border-[#E5E3DC] rounded-xl px-3.5 py-2.5 text-xs text-[#252923] focus:bg-white focus:ring-1 focus:ring-[#1F5147] font-medium"
                />
                {isPastDate && (
                  <span className="text-[10px] text-rose-600 mt-1 block">
                    ⚠️ Date is in the past. Requires draft mode or future date.
                  </span>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-[#252923] block mb-1">
                  City / Location *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Faridabad"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-[#F8F7F2] border border-[#E5E3DC] rounded-xl px-3.5 py-2.5 text-xs text-[#252923] focus:bg-white focus:ring-1 focus:ring-[#1F5147] font-medium"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#252923] block mb-1">
                Venue Setting / Type
              </label>
              <input
                type="text"
                placeholder="e.g. Home, restaurant or outdoor"
                value={venueType}
                onChange={(e) => setVenueType(e.target.value)}
                className="w-full bg-[#F8F7F2] border border-[#E5E3DC] rounded-xl px-3.5 py-2.5 text-xs text-[#252923] focus:bg-white focus:ring-1 focus:ring-[#1F5147] font-medium"
              />
            </div>
          </div>
        )}

        {/* STEP 2: SCALE & BUDGET */}
        {step === 2 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <h2 className="font-editorial text-xl font-bold text-[#252923] border-b border-[#E5E3DC] pb-3">
              Step 2: Scale, Budget & Requirements
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-[#252923] block mb-1">
                  Guest Count * (Positive integer)
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={guestCount}
                  onChange={(e) => setGuestCount(parseInt(e.target.value, 10) || 1)}
                  className="w-full bg-[#F8F7F2] border border-[#E5E3DC] rounded-xl px-3.5 py-2.5 text-xs text-[#252923] focus:bg-white focus:ring-1 focus:ring-[#1F5147] font-medium"
                />
                <span className="text-[10px] text-[#73756F] mt-1 block">e.g. 40 attendees</span>
              </div>

              <div>
                <label className="text-xs font-bold text-[#252923] block mb-1">
                  Total Budget Cap * (Non-negative)
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  required
                  value={totalBudget}
                  onChange={(e) => setTotalBudget(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#F8F7F2] border border-[#E5E3DC] rounded-xl px-3.5 py-2.5 text-xs text-[#252923] focus:bg-white focus:ring-1 focus:ring-[#1F5147] font-medium"
                />
                <span className="text-[10px] text-[#73756F] mt-1 block">e.g. 25,000</span>
              </div>

              <div>
                <label className="text-xs font-bold text-[#252923] block mb-1">
                  Currency Symbol
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-[#F8F7F2] border border-[#E5E3DC] rounded-xl px-3.5 py-2.5 text-xs text-[#252923] focus:bg-white focus:ring-1 focus:ring-[#1F5147] font-medium"
                >
                  <option value="₹">₹ (Indian Rupee - INR)</option>
                  <option value="$">$ (US Dollar - USD)</option>
                  <option value="€">€ (Euro - EUR)</option>
                  <option value="£">£ (British Pound - GBP)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#252923] block mb-1">
                Dietary Requirements & Catering Notes
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Vegetarian menu, no onion/garlic options for senior guests."
                value={dietaryRequirements}
                onChange={(e) => setDietaryRequirements(e.target.value)}
                className="w-full bg-[#F8F7F2] border border-[#E5E3DC] rounded-xl px-3.5 py-2.5 text-xs text-[#252923] focus:bg-white focus:ring-1 focus:ring-[#1F5147] font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#252923] block mb-1">
                Accessibility Requirements
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Ground floor or lift access, step-free access for elders."
                value={accessibilityRequirements}
                onChange={(e) => setAccessibilityRequirements(e.target.value)}
                className="w-full bg-[#F8F7F2] border border-[#E5E3DC] rounded-xl px-3.5 py-2.5 text-xs text-[#252923] focus:bg-white focus:ring-1 focus:ring-[#1F5147] font-medium"
              />
            </div>
          </div>
        )}

        {/* STEP 3: AESTHETIC & THEMES */}
        {step === 3 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <h2 className="font-editorial text-xl font-bold text-[#252923] border-b border-[#E5E3DC] pb-3">
              Step 3: Aesthetic, Atmosphere & Preferences
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[#252923] block mb-1">
                  Theme Concept
                </label>
                <input
                  type="text"
                  placeholder="e.g. Black and gold"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="w-full bg-[#F8F7F2] border border-[#E5E3DC] rounded-xl px-3.5 py-2.5 text-xs text-[#252923] focus:bg-white focus:ring-1 focus:ring-[#1F5147] font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#252923] block mb-1">
                  Atmosphere
                </label>
                <input
                  type="text"
                  placeholder="e.g. Minimal, elegant"
                  value={atmosphere}
                  onChange={(e) => setAtmosphere(e.target.value)}
                  className="w-full bg-[#F8F7F2] border border-[#E5E3DC] rounded-xl px-3.5 py-2.5 text-xs text-[#252923] focus:bg-white focus:ring-1 focus:ring-[#1F5147] font-medium"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#252923] block mb-1">
                Event Preferences & Entertainment
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Vegetarian menu, music, accessibility needs, ambient photo lighting..."
                value={preferences}
                onChange={(e) => setPreferences(e.target.value)}
                className="w-full bg-[#F8F7F2] border border-[#E5E3DC] rounded-xl px-3.5 py-2.5 text-xs text-[#252923] focus:bg-white focus:ring-1 focus:ring-[#1F5147] font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#252923] block mb-2">
                Event Icon
              </label>
              <div className="flex gap-2 text-xl">
                {['🎉', '🎂', '💍', '💼', '🥂', '🌸', '✨', '🎻'].map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => setIcon(em)}
                    className={`w-10 h-10 rounded-xl border flex items-center justify-center transition ${
                      icon === em
                        ? 'border-[#1F5147] bg-[#1F5147]/10'
                        : 'border-[#E5E3DC] bg-[#F8F7F2] hover:bg-white'
                    }`}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: PLAN PREVIEW */}
        {step === 4 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-[#E5E3DC] pb-3">
              <div>
                <h2 className="font-editorial text-xl font-bold text-[#252923]">
                  Step 4: Gatherly Plan Preview
                </h2>
                <p className="text-xs text-[#73756F]">
                  Calibrated for {name} ({currency}{totalBudget.toLocaleString()}).
                </p>
              </div>
              <button
                onClick={handlePreviewAI}
                disabled={isPreviewingAI}
                className="text-xs font-semibold text-[#1F5147] bg-[#1F5147]/10 border border-[#1F5147]/20 px-3 py-1.5 rounded-xl hover:bg-[#1F5147]/20 transition"
              >
                {isPreviewingAI ? 'Re-analyzing...' : 'Refresh Plan'}
              </button>
            </div>

            {aiPlan ? (
              <div className="space-y-4">
                {/* Theme & Palette */}
                <div className="bg-[#F8F7F2] p-4 rounded-2xl border border-[#E5E3DC] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#73756F] block">Theme & Atmosphere</span>
                    <span className="font-editorial text-lg font-bold text-[#252923]">{aiPlan.recommended_theme} • {atmosphere}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {aiPlan.color_palette.map((color, i) => (
                      <div
                        key={i}
                        className="w-7 h-7 rounded-lg border border-black/10"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>

                {/* Milestones Preview */}
                <div className="bg-[#F8F7F2] p-4 rounded-2xl border border-[#E5E3DC]">
                  <span className="text-[10px] uppercase font-bold text-[#73756F] block mb-2">
                    Time-Aware Milestones ({aiPlan.tasks.length} total, {aiPlan.time_remaining_days} days to go)
                  </span>
                  <div className="space-y-1.5">
                    {aiPlan.tasks.slice(0, 4).map((t, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-[#E5E3DC]/60 last:border-0">
                        <span className="font-medium text-[#252923]">{t.title}</span>
                        <span className="text-[11px] text-[#73756F] font-mono">{t.deadline}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Budget Breakdown Preview */}
                <div className="bg-[#F8F7F2] p-4 rounded-2xl border border-[#E5E3DC]">
                  <span className="text-[10px] uppercase font-bold text-[#73756F] block mb-2">
                    Deterministic 100% Budget Preset ({(aiPlan.budget_breakdown || []).length} categories)
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    {(aiPlan.budget_breakdown || []).slice(0, 6).map((b, idx) => (
                      <div key={idx} className="bg-white p-2 rounded-xl border border-[#E5E3DC]">
                        <span className="text-[10px] text-[#73756F] block uppercase">{b.category}</span>
                        <span className="font-bold text-[#252923]">{currency}{b.allocated_amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-10">
                <Sparkles className="w-8 h-8 text-[#1F5147] animate-spin mx-auto mb-2" />
                <p className="text-xs text-[#73756F] font-medium">Generating deterministic plan preview...</p>
              </div>
            )}
          </div>
        )}

        {/* Wizard Footer Controls */}
        <div className="mt-8 pt-5 border-t border-[#E5E3DC] flex flex-wrap items-center justify-between gap-3">
          <div>
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-[#565952] hover:bg-[#F8F7F2] transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="text-xs text-[#73756F] hover:text-[#252923]"
              >
                Cancel
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Save as Draft */}
            <button
              type="button"
              disabled={isSubmitting || !name.trim()}
              onClick={() => handleSubmit(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#E5E3DC] text-xs font-semibold text-[#565952] hover:bg-[#F8F7F2] transition disabled:opacity-40"
            >
              <Save className="w-3.5 h-3.5 text-[#73756F]" />
              <span>Save Draft</span>
            </button>

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#1F5147] text-white text-xs font-semibold hover:bg-[#173F37] transition"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : step === 3 ? (
              <button
                type="button"
                onClick={handlePreviewAI}
                disabled={isPreviewingAI || !name.trim()}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#1F5147] text-white text-xs font-semibold hover:bg-[#173F37] transition shadow-2xs disabled:opacity-40"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#E9A477]" />
                <span>{isPreviewingAI ? 'Analyzing...' : 'Preview Plan'}</span>
              </button>
            ) : (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleSubmit(false)}
                className="inline-flex items-center gap-1.5 px-6 py-2 rounded-xl bg-[#1F5147] text-white text-xs font-semibold hover:bg-[#173F37] transition shadow-2xs disabled:opacity-40"
              >
                <Check className="w-4 h-4 text-[#E9A477]" />
                <span>{isSubmitting ? 'Launching...' : 'Create & Open Workspace'}</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
