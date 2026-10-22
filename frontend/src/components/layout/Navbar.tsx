import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, MessageSquare, ChevronLeft, Sparkles } from 'lucide-react';

interface NavbarProps {
  onOpenAskCoorda?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAskCoorda }) => {
  const navigate = useNavigate();

  return (
    <header className="h-16 bg-[#F8F7F2] border-b border-[#E5E3DC] px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Brand & Left Toggle */}
      <div className="flex items-center gap-3">
        <Link to="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-[#1F5147] flex items-center justify-center text-white shadow-2xs">
            <span className="font-serif font-bold text-sm tracking-tight text-[#E9A477]">G</span>
          </div>
          <div>
            <span className="font-serif font-bold text-lg tracking-tight text-[#252923] group-hover:text-[#1F5147] transition">
              Gatherly
            </span>
            <span className="block text-[9px] tracking-widest text-[#73756F] font-semibold uppercase -mt-1">
              Event Management
            </span>
          </div>
        </Link>
        <button
          className="ml-2 w-7 h-7 rounded-lg border border-[#E5E3DC] bg-white flex items-center justify-center text-[#73756F] hover:text-[#252923] hover:bg-slate-50 transition shadow-2xs"
          title="Toggle Navigation"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {onOpenAskCoorda && (
          <button
            onClick={onOpenAskCoorda}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#1F5147]/10 text-[#1F5147] border border-[#1F5147]/20 hover:bg-[#1F5147]/15 transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#1F5147]" />
            <span>Gatherly AI</span>
          </button>
        )}

        <button
          onClick={() => navigate('/events/new')}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-[#1F5147] text-white hover:bg-[#173F37] transition shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Create Event</span>
        </button>

        <button
          onClick={() => alert("Gatherly Feedback: We appreciate your input!")}
          className="hidden md:inline-flex items-center gap-1.5 text-xs font-medium text-[#73756F] hover:text-[#252923] px-2 py-1.5 rounded-md hover:bg-black/5 transition"
        >
          <MessageSquare className="w-3.5 h-3.5 text-[#A5A49D]" />
          <span>Feedback</span>
        </button>

        {/* User avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-[#E5E3DC]">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-[#E5E3DC] bg-white ring-1 ring-[#1F5147]/20 flex items-center justify-center font-bold text-xs text-[#1F5147]">
            AS
          </div>
        </div>
      </div>
    </header>
  );
};
