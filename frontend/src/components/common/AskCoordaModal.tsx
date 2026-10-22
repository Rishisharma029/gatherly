import React, { useState } from 'react';
import { X, Sparkles, Send, Bot, Lightbulb } from 'lucide-react';
import { api } from '../../api/client';
import type { EventDetail } from '../../types';

interface AskCoordaModalProps {
  isOpen: boolean;
  onClose: () => void;
  event?: EventDetail | null;
  onRefreshEvent?: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  suggested_actions?: string[];
}

export const AskCoordaModal: React.FC<AskCoordaModalProps> = ({
  isOpen,
  onClose,
  event,
}) => {
  const currency = event?.currency || '₹';
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hello! I'm **Gatherly AI**, your practical event-management advisor. I have the context for **${event?.name || 'your event'}** (${event?.event_type || 'Event'}, Budget: ${currency}${(event?.total_budget || 25000).toLocaleString()}, City: ${event?.city || 'Faridabad'}). How can I assist with your planning?`,
      suggested_actions: [
        'How can we resolve our budget shortfall?',
        'Suggest lower-cost catering alternatives',
        'Review urgent timeline milestones',
        'Recommend black & gold minimal decor ideas'
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', content: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await api.askCoorda(textToSend, event?.id, {
        name: event?.name,
        total_budget: event?.total_budget,
        currency: event?.currency || '₹',
        guest_count: event?.guest_count,
        date: event?.date,
        theme: event?.theme,
        city: event?.city
      });

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: res.reply,
          suggested_actions: res.suggested_actions
        }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an issue connecting to Gatherly AI. Please try again.',
          suggested_actions: ['Try again']
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionClick = (action: string) => {
    handleSend(action);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-2xs flex justify-end">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col border-l border-[#E5E3DC] animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-[#E5E3DC] bg-[#F8F7F2] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#1F5147] flex items-center justify-center text-white shadow-2xs">
              <Sparkles className="w-4 h-4 text-[#E9A477]" />
            </div>
            <div>
              <h3 className="font-editorial font-bold text-[#252923] text-base">Gatherly AI</h3>
              <p className="text-[11px] text-[#73756F]">
                Practical Event Planning Advisor • {event?.name || 'Workspace'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#73756F] hover:text-[#252923] hover:bg-slate-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Event Context Pill Banner */}
        {event && (
          <div className="bg-[#1F5147]/5 border-b border-[#1F5147]/10 px-4 py-2 flex items-center justify-between text-xs text-[#1F5147]">
            <span className="font-medium truncate max-w-[280px]">
              {event.name} ({event.date})
            </span>
            <span className="font-semibold text-[#1F5147]">
              Budget: {currency}{event.total_budget.toLocaleString()}
            </span>
          </div>
        )}

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FAF9F5]">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${
                m.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[90%] rounded-2xl p-4 text-xs leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-[#1F5147] text-white rounded-br-xs'
                    : 'bg-white border border-[#E5E3DC] text-[#252923] rounded-bl-xs shadow-2xs'
                }`}
              >
                <div className="whitespace-pre-wrap space-y-2">
                  {m.content}
                </div>
              </div>

              {/* Action suggestions */}
              {m.suggested_actions && m.suggested_actions.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1.5 max-w-[90%]">
                  {m.suggested_actions.map((act, i) => (
                    <button
                      key={i}
                      onClick={() => handleActionClick(act)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#E9A477]/15 text-[#9C582B] border border-[#E9A477]/30 hover:bg-[#E9A477]/25 transition shadow-2xs text-left"
                    >
                      <Lightbulb className="w-3 h-3 text-[#E9A477] shrink-0" />
                      <span>{act}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-[#73756F] bg-white border border-[#E5E3DC] rounded-xl p-3 max-w-[60%]">
              <Bot className="w-4 h-4 text-[#1F5147] animate-spin" />
              <span>Gatherly AI is calculating practical advice...</span>
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-3 border-t border-[#E5E3DC] bg-white flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => handleSend("Analyze budget trade-offs and suggest where we can save 10%")}
            className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-md bg-[#F8F7F2] border border-[#E5E3DC] text-[#565952] hover:text-[#252923] transition"
          >
            💰 Budget Trade-offs
          </button>
          <button
            onClick={() => handleSend("Suggest lower-cost catering & mocktail alternatives")}
            className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-md bg-[#F8F7F2] border border-[#E5E3DC] text-[#565952] hover:text-[#252923] transition"
          >
            🍽️ Menu Alternatives
          </button>
          <button
            onClick={() => handleSend("What are the most urgent tasks for this week?")}
            className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-md bg-[#F8F7F2] border border-[#E5E3DC] text-[#565952] hover:text-[#252923] transition"
          >
            ⏱️ Urgent Priorities
          </button>
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-[#E5E3DC] bg-[#F8F7F2]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Gatherly AI about budget, tasks, vendors, ideas..."
              className="flex-1 bg-white border border-[#E5E3DC] rounded-xl px-3 py-2 text-xs text-[#252923] placeholder:text-[#A5A49D] focus:outline-none focus:ring-1 focus:ring-[#1F5147]"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-2.5 rounded-xl bg-[#1F5147] text-white hover:bg-[#173F37] disabled:opacity-40 transition"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
