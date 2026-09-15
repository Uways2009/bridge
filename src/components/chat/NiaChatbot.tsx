import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  ExternalLink,
  ChevronRight,
  GraduationCap,
  Briefcase,
  Calendar,
  AlertCircle,
  HelpCircle,
  Headphones,
} from 'lucide-react';
import { PageId } from '../../types';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  groundedResults?: {
    opportunities?: Array<{
      id: string;
      title: string;
      company: string;
      category: string;
      type: string;
      location?: string;
    }>;
    courses?: Array<{
      id: string;
      title: string;
      category: string;
      duration: string;
      tuitionStatus: string;
      startDate?: string;
    }>;
    events?: Array<{
      id: string;
      title: string;
      date: string;
      time: string;
      location: string;
    }>;
  };
  isSupportHandoff?: boolean;
}

interface NiaChatbotProps {
  onNavigate: (page: PageId) => void;
}

export const NiaChatbot: React.FC<NiaChatbotProps> = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content:
        "Hello! I am Nia, the NaijaBridge Opportunity Assistant. How can I help you today with verified Nigerian opportunities, Tech Academy cohorts, or upcoming community workshops?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Build conversation history for context
      const history = messages.slice(-5).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          history,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        const assistantMsg: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: data.reply || 'I am ready to help you explore verified opportunities across Nigeria.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          groundedResults: data.groundedResults,
          isSupportHandoff: data.isSupportHandoff,
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        const errorMsg: ChatMessage = {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content:
            data.error ||
            "I'm temporarily experiencing connectivity limitations. Please try again in a moment or visit our Contact page to reach our team directly.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } catch (err) {
      const fallbackMsg: ChatMessage = {
        id: `fallback-${Date.now()}`,
        role: 'assistant',
        content:
          "Unable to connect to assistant service right now. Please check your network connection or contact support via the Contact page.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#087F5B] hover:bg-[#076c4d] text-white shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer group"
          aria-label="Open Nia Opportunity Assistant"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 text-emerald-200 animate-pulse" />
          </div>
          <div className="text-left">
            <span className="text-xs font-bold block leading-none">Ask Nia</span>
            <span className="text-[10px] text-emerald-100 font-medium">Opportunity Assistant</span>
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-[92vw] sm:w-[400px] h-[540px] max-h-[82vh] bg-white rounded-2xl shadow-2xl border border-[#E4E1D8] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="bg-[#0B1F33] text-white px-4 py-3.5 flex items-center justify-between border-b border-[#152e4a]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#087F5B] flex items-center justify-center text-white font-bold text-xs shadow-xs">
                <Sparkles className="w-4 h-4 text-emerald-200" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm text-white">Nia</h3>
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Verified Public Assistant
                  </span>
                </div>
                <p className="text-[10px] text-stone-300">NaijaBridge Opportunities & Academy</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-stone-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close assistant"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Filter Chips for instant query */}
          <div className="bg-[#F8F7F2] px-3 py-2 border-b border-[#E4E1D8] flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
            <button
              onClick={() => handleSendMessage('What Tech Academy courses are currently open?')}
              className="px-2.5 py-1 rounded-full bg-white border border-[#E4E1D8] hover:border-[#087F5B] hover:text-[#087F5B] text-[#1F2933]/80 font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer"
            >
              🎓 Tech Academy Courses
            </button>
            <button
              onClick={() => handleSendMessage('What verified opportunities are available?')}
              className="px-2.5 py-1 rounded-full bg-white border border-[#E4E1D8] hover:border-[#087F5B] hover:text-[#087F5B] text-[#1F2933]/80 font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer"
            >
              💼 Verified Jobs
            </button>
            <button
              onClick={() => handleSendMessage('Are there upcoming workshops or events?')}
              className="px-2.5 py-1 rounded-full bg-white border border-[#E4E1D8] hover:border-[#087F5B] hover:text-[#087F5B] text-[#1F2933]/80 font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer"
            >
              📅 Workshops
            </button>
            <button
              onClick={() => handleSendMessage('How do I contact human support?')}
              className="px-2.5 py-1 rounded-full bg-white border border-[#E4E1D8] hover:border-[#087F5B] hover:text-[#087F5B] text-[#1F2933]/80 font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer"
            >
              🤝 Human Support
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-stone-50/50 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-[#087F5B] flex items-center justify-center text-white shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3 space-y-2.5 ${
                    msg.role === 'user'
                      ? 'bg-[#087F5B] text-white rounded-tr-xs'
                      : 'bg-white border border-[#E4E1D8] text-[#1F2933] rounded-tl-xs shadow-2xs'
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed">{msg.content}</p>

                  {/* Render Grounded DB Search Results */}
                  {msg.groundedResults && (
                    <div className="space-y-2 pt-1 border-t border-[#E4E1D8]/60">
                      {/* Academy Courses results */}
                      {msg.groundedResults.courses && msg.groundedResults.courses.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-bold text-[#087F5B] uppercase tracking-wider block">
                            Academy Cohorts
                          </span>
                          {msg.groundedResults.courses.map((c) => (
                            <div
                              key={c.id}
                              className="p-2 rounded-xl bg-[#F8F7F2] border border-[#E4E1D8] flex items-center justify-between gap-2"
                            >
                              <div className="min-w-0">
                                <span className="font-bold text-[#0B1F33] block truncate text-[11px]">
                                  {c.title}
                                </span>
                                <span className="text-[10px] text-[#1F2933]/60">
                                  {c.duration} • {c.tuitionStatus}
                                </span>
                              </div>
                              <button
                                onClick={() => {
                                  onNavigate('academy');
                                  setIsOpen(false);
                                }}
                                className="px-2 py-1 rounded-lg bg-[#087F5B] text-white text-[10px] font-semibold shrink-0 cursor-pointer"
                              >
                                View
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Opportunities results */}
                      {msg.groundedResults.opportunities && msg.groundedResults.opportunities.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-bold text-[#D99A28] uppercase tracking-wider block">
                            Verified Opportunities
                          </span>
                          {msg.groundedResults.opportunities.map((opp) => (
                            <div
                              key={opp.id}
                              className="p-2 rounded-xl bg-[#F8F7F2] border border-[#E4E1D8] flex items-center justify-between gap-2"
                            >
                              <div className="min-w-0">
                                <span className="font-bold text-[#0B1F33] block truncate text-[11px]">
                                  {opp.title}
                                </span>
                                <span className="text-[10px] text-[#1F2933]/60">
                                  {opp.company} • {opp.type}
                                </span>
                              </div>
                              <button
                                onClick={() => {
                                  onNavigate('opportunities');
                                  setIsOpen(false);
                                }}
                                className="px-2 py-1 rounded-lg bg-[#0B1F33] text-white text-[10px] font-semibold shrink-0 cursor-pointer"
                              >
                                View
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Events results */}
                      {msg.groundedResults.events && msg.groundedResults.events.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-bold text-[#0B1F33] uppercase tracking-wider block">
                            Workshops & Events
                          </span>
                          {msg.groundedResults.events.map((evt) => (
                            <div
                              key={evt.id}
                              className="p-2 rounded-xl bg-[#F8F7F2] border border-[#E4E1D8] flex items-center justify-between gap-2"
                            >
                              <div className="min-w-0">
                                <span className="font-bold text-[#0B1F33] block truncate text-[11px]">
                                  {evt.title}
                                </span>
                                <span className="text-[10px] text-[#1F2933]/60">
                                  {evt.date} • {evt.location}
                                </span>
                              </div>
                              <button
                                onClick={() => {
                                  onNavigate('workshops');
                                  setIsOpen(false);
                                }}
                                className="px-2 py-1 rounded-lg bg-[#087F5B] text-white text-[10px] font-semibold shrink-0 cursor-pointer"
                              >
                                View
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Human Support Handoff Action */}
                  {msg.isSupportHandoff && (
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2 mt-2">
                      <div className="flex items-center gap-1.5 font-bold text-[11px]">
                        <Headphones className="w-3.5 h-3.5 text-amber-800" />
                        <span>NaijaBridge Human Support Team</span>
                      </div>
                      <p className="text-[10px] leading-tight text-amber-950">
                        Our administrative support officers are available to assist with admissions appeals, verification requests, and partner inquiries.
                      </p>
                      <button
                        onClick={() => {
                          onNavigate('contact');
                          setIsOpen(false);
                        }}
                        className="w-full py-1.5 rounded-lg bg-[#0B1F33] text-white text-[10px] font-bold text-center block transition-colors cursor-pointer"
                      >
                        Contact Human Support
                      </button>
                    </div>
                  )}

                  <span
                    className={`block text-[9px] pt-1 ${
                      msg.role === 'user' ? 'text-emerald-100 text-right' : 'text-[#1F2933]/40'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2 items-center text-xs text-[#1F2933]/60">
                <div className="w-6 h-6 rounded-full bg-[#087F5B]/10 flex items-center justify-center text-[#087F5B]">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                </div>
                <div className="p-3 bg-white rounded-2xl border border-[#E4E1D8] shadow-2xs space-x-1 flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#087F5B] animate-bounce"></span>
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-[#087F5B] animate-bounce"
                    style={{ animationDelay: '0.15s' }}
                  ></span>
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-[#087F5B] animate-bounce"
                    style={{ animationDelay: '0.3s' }}
                  ></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-[#E4E1D8] flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask Nia about courses, jobs, or workshops..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-[#E4E1D8] focus:outline-none focus:border-[#087F5B]"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="p-2 rounded-xl bg-[#087F5B] hover:bg-[#076c4d] text-white disabled:opacity-50 transition-colors cursor-pointer"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
