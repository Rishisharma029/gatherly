import React, { useState } from 'react';
import {
  Sparkles,
  Heart,
  Plus,
  Clock,
  Layers,
  Wrench,
  CheckCircle2,
  DollarSign
} from 'lucide-react';
import { api } from '../../api/client';
import type { EventDetail, Idea, IdType } from '../../types';

interface IdeasTabProps {
  event: EventDetail;
  onRefresh: () => void;
  onOpenAskCoorda: () => void;
}

const IDEA_MODES = [
  'ALL',
  'Theme inspiration',
  'Affordable alternatives',
  'Activity ideas',
  'Menu suggestions',
  'Decoration plans',
  'Event-day schedule'
];

export const IdeasTab: React.FC<IdeasTabProps> = ({ event, onRefresh, onOpenAskCoorda }) => {
  const [ideas, setIdeas] = useState<Idea[]>(event.ideas || []);
  const [activeMode, setActiveMode] = useState('ALL');
  const [isAdding, setIsAdding] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mode, setMode] = useState('Theme inspiration');
  const [costRange, setCostRange] = useState('');
  const [prepEffort, setPrepEffort] = useState('Medium (1-2 hours)');
  const [requiredMaterials, setRequiredMaterials] = useState('');
  const [whyItSuits, setWhyItSuits] = useState('');
  const [tags, setTags] = useState('');

  const handleToggleFavorite = async (ideaId?: IdType) => {
    if (!ideaId) return;
    try {
      const updated = await api.toggleIdeaFavorite(event.id, ideaId);
      setIdeas((prev) => prev.map((i) => (i.id === ideaId ? { ...i, is_favorite: !i.is_favorite } : i)));
    } catch (err) {
      alert('Failed to update favorite status');
    }
  };

  const handleAddIdea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    try {
      const newIdea = await api.addIdea(event.id, {
        title,
        description,
        category: mode,
        mode,
        estimated_cost_range: costRange || '₹1,500 – ₹3,000',
        prep_effort: prepEffort,
        required_materials: requiredMaterials,
        why_it_suits: whyItSuits,
        tags,
        is_favorite: true,
      });
      setIdeas((prev) => [...prev, newIdea]);
      setIsAdding(false);
      resetForm();
      onRefresh();
    } catch (err) {
      alert('Failed to add idea');
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setMode('Theme inspiration');
    setCostRange('');
    setPrepEffort('Medium (1-2 hours)');
    setRequiredMaterials('');
    setWhyItSuits('');
    setTags('');
  };

  const filteredIdeas = ideas.filter((idea) => {
    if (activeMode !== 'ALL' && idea.mode !== activeMode && idea.category !== activeMode) return false;
    return true;
  });

  const palette = ['#1F5147', '#E9A477', '#252923', '#F8F7F2'];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-editorial text-2xl font-bold text-[#252923]">
            Personalized Ideas & Inspiration
          </h2>
          <p className="text-xs text-[#73756F]">
            Tailored suggestions calibrated to {event.name} ({event.theme || 'Custom Theme'}, {event.city}, Budget: {event.currency || '₹'}{event.total_budget.toLocaleString()}).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAskCoorda}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#1F5147] text-white hover:bg-[#173F37] transition shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#E9A477]" />
            <span>Generate With Gatherly AI</span>
          </button>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-[#E5E3DC] text-[#252923] hover:bg-[#F8F7F2] transition shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Custom Idea</span>
          </button>
        </div>
      </div>

      {/* Theme & Palette Banner Card */}
      <div className="bg-white rounded-2xl border border-[#E5E3DC] p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#1F5147] bg-[#1F5147]/10 px-2.5 py-0.5 rounded-full border border-[#1F5147]/20">
                Curated Theme Concept
              </span>
              <span className="text-[10px] font-semibold text-[#73756F]">
                Atmosphere: {event.atmosphere || 'Minimal, elegant'}
              </span>
            </div>
            <h3 className="font-editorial text-2xl font-bold text-[#252923]">
              {event.theme || 'Black and gold'}
            </h3>
            <p className="text-xs text-[#565952] max-w-xl leading-relaxed">
              {event.preferences || 'Vegetarian menu, music, accessibility needs. Focus on high-contrast elegance without cluttered decor.'}
            </p>
          </div>

          {/* Color Swatches */}
          <div className="bg-[#F8F7F2] p-4 rounded-xl border border-[#E5E3DC] space-y-2 shrink-0">
            <span className="text-[10px] font-bold text-[#73756F] uppercase tracking-wider block">
              Coordinated Palette
            </span>
            <div className="flex items-center gap-2">
              {palette.map((color, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1">
                  <div
                    className="w-10 h-10 rounded-xl border border-black/10 shadow-2xs"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                  <span className="text-[9px] font-mono text-[#73756F]">{color}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Generation Modes Filter Bar */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        {IDEA_MODES.map((md) => (
          <button
            key={md}
            onClick={() => setActiveMode(md)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
              activeMode === md
                ? 'bg-[#1F5147] text-white font-semibold'
                : 'bg-white border border-[#E5E3DC] text-[#565952] hover:bg-[#F8F7F2]'
            }`}
          >
            {md === 'ALL' ? 'All Modes' : md}
          </button>
        ))}
      </div>

      {/* Add Idea Form */}
      {isAdding && (
        <div className="bg-white border-2 border-[#1F5147]/30 rounded-2xl p-5 shadow-sm animate-in fade-in duration-200">
          <h3 className="font-editorial text-base font-bold text-[#252923] mb-3">
            Add Structured Event Idea
          </h3>
          <form onSubmit={handleAddIdea} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="text-[10px] font-bold uppercase text-[#73756F] block mb-1">
                  Idea Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Matte Black & Mirrored Gold Photo Backdrop"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#F8F7F2] border border-[#E5E3DC] rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#1F5147]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-[#73756F] block mb-1">
                  Generation Mode
                </label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                  className="w-full bg-[#F8F7F2] border border-[#E5E3DC] rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#1F5147]"
                >
                  {IDEA_MODES.filter(m => m !== 'ALL').map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-[#73756F] block mb-1">
                Description / Concept *
              </label>
              <textarea
                required
                rows={2}
                placeholder="Describe how to execute this experience..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[#F8F7F2] border border-[#E5E3DC] rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#1F5147]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase text-[#73756F] block mb-1">
                  Estimated Cost Range
                </label>
                <input
                  type="text"
                  placeholder="e.g. ₹2,000 – ₹4,000"
                  value={costRange}
                  onChange={(e) => setCostRange(e.target.value)}
                  className="w-full bg-[#F8F7F2] border border-[#E5E3DC] rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#1F5147]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-[#73756F] block mb-1">
                  Preparation Effort
                </label>
                <input
                  type="text"
                  placeholder="e.g. Low (45 mins) or Medium (half day)"
                  value={prepEffort}
                  onChange={(e) => setPrepEffort(e.target.value)}
                  className="w-full bg-[#F8F7F2] border border-[#E5E3DC] rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#1F5147]"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-[#73756F] block mb-1">
                Required Materials
              </label>
              <input
                type="text"
                placeholder="e.g. Black seamless backdrop, gold geometric balloon arch, fairy lights"
                value={requiredMaterials}
                onChange={(e) => setRequiredMaterials(e.target.value)}
                className="w-full bg-[#F8F7F2] border border-[#E5E3DC] rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#1F5147]"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-[#73756F] block mb-1">
                Why It Suits This Event
              </label>
              <input
                type="text"
                placeholder="e.g. Elevates photography in a home or terrace setting while respecting budget constraints"
                value={whyItSuits}
                onChange={(e) => setWhyItSuits(e.target.value)}
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
                Save Idea
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Ideas Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredIdeas.map((idea) => (
          <div
            key={idea.id}
            className="bg-white rounded-2xl border border-[#E5E3DC] p-5 shadow-2xs hover:border-[#1F5147]/50 transition flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#1F5147]/10 text-[#1F5147] border border-[#1F5147]/20">
                  {idea.mode || idea.category}
                </span>
                <button
                  onClick={() => handleToggleFavorite(idea.id)}
                  className={`p-1 rounded-full transition ${
                    idea.is_favorite
                      ? 'text-rose-500 hover:text-rose-600'
                      : 'text-[#A5A49D] hover:text-[#73756F]'
                  }`}
                  title={idea.is_favorite ? 'Favorited' : 'Add to favorites'}
                >
                  <Heart className={`w-4 h-4 ${idea.is_favorite ? 'fill-rose-500' : ''}`} />
                </button>
              </div>

              <h4 className="font-editorial text-lg font-bold text-[#252923] mb-1.5">
                {idea.title}
              </h4>

              <p className="text-xs text-[#565952] leading-relaxed mb-3">
                {idea.description || (idea as any).content}
              </p>

              {/* Structured Metadata Box */}
              <div className="bg-[#F8F7F2] rounded-xl p-3 border border-[#E5E3DC] space-y-1.5 text-xs text-[#565952]">
                {idea.estimated_cost_range && (
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-[#73756F]">Cost Range:</span>
                    <span className="font-bold text-[#252923]">{idea.estimated_cost_range}</span>
                  </div>
                )}
                {idea.prep_effort && (
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-[#73756F]">Preparation Effort:</span>
                    <span>{idea.prep_effort}</span>
                  </div>
                )}
                {idea.required_materials && (
                  <div className="pt-1 border-t border-[#E5E3DC]">
                    <span className="text-[10px] font-bold uppercase text-[#73756F] block">Materials:</span>
                    <span className="text-[11px] text-[#252923]">{idea.required_materials}</span>
                  </div>
                )}
                {idea.why_it_suits && (
                  <div className="pt-1 border-t border-[#E5E3DC]">
                    <span className="text-[10px] font-bold uppercase text-[#1F5147] block">Why it suits:</span>
                    <span className="text-[11px] italic text-[#565952]">{idea.why_it_suits}</span>
                  </div>
                )}
              </div>
            </div>

            {idea.tags && (
              <div className="pt-3 mt-3 border-t border-[#E5E3DC] flex flex-wrap gap-1">
                {idea.tags.split(',').map((tag, i) => (
                  <span
                    key={i}
                    className="text-[10px] text-[#73756F] bg-[#F8F7F2] px-2 py-0.5 rounded-md"
                  >
                    #{tag.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
