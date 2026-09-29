import React, { useState, useEffect, useRef } from 'react';
import { CopilotMessage } from '../types';
import { queryAICopilot } from '../api/api';
import { Bot, Send, X, Sparkles, ShieldAlert, CheckCircle2, FileText, ChevronRight, Trash2 } from 'lucide-react';

interface AICopilotDrawerProps {
  projectId: number;
  isOpen: boolean;
  onClose: () => void;
}

export const AICopilotDrawer: React.FC<AICopilotDrawerProps> = ({
  projectId,
  isOpen,
  onClose,
}) => {
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Hello! I am BuildSure AI Safety Copilot. Ask me anything about site risk scores, OSHA compliance standards, worker PPE compliance, or insurance exposure.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (!isOpen) return null;

  const quickPrompts = [
    "What are our top OSHA compliance risks?",
    "Summarize current insurance exposure ($)",
    "Which site zones have high risk levels?",
    "How can we improve worker PPE compliance?"
  ];

  const handleClear = () => {
    setMessages([
      {
        id: 'welcome-' + Date.now(),
        sender: 'assistant',
        text: 'Chat history cleared. How can I assist you with safety monitoring & risk analytics?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ]);
  };

  const handleSend = async (textToSend?: string) => {
    const q = (textToSend || inputQuery).trim();
    if (!q || loading) return;

    const userMsg: CopilotMessage = {
      id: String(Date.now()),
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputQuery('');
    setLoading(true);

    try {
      const res = await queryAICopilot(projectId, q);
      const botMsg: CopilotMessage = {
        id: String(Date.now() + 1),
        sender: 'assistant',
        text: res.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        data: res,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg: CopilotMessage = {
        id: String(Date.now() + 2),
        sender: 'assistant',
        text: 'Apologies, I encountered an issue connecting to the AI Intelligence engine. Please ensure backend services are active.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end">
      <div className="theme-card-bg border-l border-slate-700 w-full max-w-lg h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 border-b border-slate-700/80 bg-slate-900 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Bot className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h3 className="font-bold text-sm text-white">BuildSure AI Advisor</h3>
                <span className="px-1.5 py-0.2 text-[10px] font-mono bg-cyan-500 text-slate-950 rounded font-bold">COPILOT</span>
              </div>
              <p className="text-[11px] text-slate-400">Context-Aware Construction Risk Intelligence Assistant</p>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={handleClear}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
              title="Clear Conversation History"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
              title="Close Drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Prompts Bar */}
        <div className="p-3 bg-slate-900/40 border-b border-slate-800 overflow-x-auto flex items-center space-x-2 scrollbar-none">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              disabled={loading}
              className="px-2.5 py-1 text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 rounded-full shrink-0 border border-slate-700/80 transition"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[88%] p-3.5 rounded-2xl ${
                  msg.sender === 'user'
                    ? 'bg-cyan-600 text-slate-950 font-medium rounded-tr-none'
                    : 'bg-slate-800/90 text-slate-100 border border-slate-700 rounded-tl-none space-y-2.5'
                }`}
              >
                <p className="leading-relaxed">{msg.text}</p>

                {/* Render Rich AI Response Context Data if available */}
                {msg.data && (
                  <div className="pt-2 border-t border-slate-700/80 space-y-2">
                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                      <div className="bg-slate-900/60 p-1.5 rounded border border-slate-700/60">
                        <span className="text-slate-400 block">Site Risk Score</span>
                        <span className="font-bold text-rose-400">{msg.data.key_metrics.site_risk_score}/100</span>
                      </div>
                      <div className="bg-slate-900/60 p-1.5 rounded border border-slate-700/60">
                        <span className="text-slate-400 block">Safety Score</span>
                        <span className="font-bold text-emerald-400">{msg.data.key_metrics.safety_score}/100</span>
                      </div>
                      <div className="bg-slate-900/60 p-1.5 rounded border border-slate-700/60">
                        <span className="text-slate-400 block">Compliance Score</span>
                        <span className="font-bold text-cyan-400">{msg.data.key_metrics.compliance_score}/100</span>
                      </div>
                      <div className="bg-slate-900/60 p-1.5 rounded border border-slate-700/60">
                        <span className="text-slate-400 block">Insurance Exposure</span>
                        <span className="font-bold text-amber-400">${Number(msg.data.key_metrics.estimated_exposure_usd || 0).toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Recommended Actions */}
                    {msg.data.recommended_actions.length > 0 && (
                      <div>
                        <span className="font-bold text-emerald-400 block text-[11px] mb-1">Recommended Actions:</span>
                        <ul className="space-y-1 text-[11px] text-slate-300">
                          {msg.data.recommended_actions.map((act, i) => (
                            <li key={i} className="flex items-start space-x-1">
                              <ChevronRight className="w-3 h-3 text-cyan-400 shrink-0 mt-0.5" />
                              <span>{act}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {/* Provider Engine Badge */}
                    {msg.data.llm_provider && (
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-700/60">
                        <span>Engine:</span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-900 text-cyan-300 font-bold border border-cyan-500/30 flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
                          {msg.data.llm_provider.startsWith('ollama')
                            ? `Ollama (${msg.data.llm_provider.split(':')[1] || 'local'})`
                            : msg.data.llm_provider}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 px-1 font-mono">{msg.timestamp}</span>
            </div>
          ))}

          {loading && (
            <div className="flex items-center space-x-2 text-slate-400 text-xs py-2">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
              <span>Analyzing live site metrics and generating intelligence advice...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 border-t border-slate-700/80 bg-slate-900 flex items-center space-x-2"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask BuildSure AI (e.g. 'How to improve safety score?')..."
            className="flex-1 theme-input border rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-cyan-500"
          />
          <button
            type="submit"
            disabled={loading || !inputQuery.trim()}
            className="p-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
