import React, { useState } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Info,
  Clock,
  BookOpen,
  User,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { AIMessage } from '../types';

export const AIAssistantPage: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: 'system-welcome',
      sender: 'assistant',
      content: 'Welcome to the AtlasIQ Location Intelligence Assistant. In Phase 4, this assistant will connect to Google Gemini models with geospatial tool calling to answer queries grounded in verified environmental and socioeconomic datasets.',
      timestamp: 'Session start',
      isNotice: true,
      sources: ['AtlasIQ Architecture Specification · Phase 4 Integration Target']
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const suggestedQuestions = [
    'What are the major environmental challenges in this location?',
    'Which crops may be suitable for this region?',
    'What renewable-energy opportunities should be investigated?',
    'How does this location compare with another region?',
    'What information is needed to evaluate local water stress?'
  ];

  const handleSend = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const userMsgId = `user-${Date.now()}`;
    const userMsg: AIMessage = {
      id: userMsgId,
      sender: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    // Simulate clean interface transition without pretending real AI exists
    setTimeout(() => {
      setIsLoading(false);
      const assistantMsg: AIMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        content: `Prompt received: "${text}". Note: Real LLM generation is intentionally not executed during Phase 1. The full Gemini AI provider integration and Retrieval-Augmented Generation (RAG) toolchain are scheduled for Prompt 4.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: [
          'Phase 4 Integration Target: Gemini API / Vertex AI',
          'AtlasIQ Knowledge Base Schema'
        ],
        isNotice: true,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    }, 600);
  };

  const handleQuestionClick = (q: string) => {
    setInputText(q);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Grounded Conversational Intelligence</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              AI Location Assistant
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
              Query multi-spectral data, compare regional vulnerabilities, and receive citations tied directly to telemetry sources.
            </p>
          </div>
          <div className="shrink-0">
            <span className="text-xs font-mono bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200 block text-center">
              LLM Engine: Prompt 4
            </span>
          </div>
        </div>

        {/* Phase Disclaimer */}
        <div className="p-3 bg-blue-50/90 border border-blue-200 rounded-lg text-blue-900 text-xs flex items-start gap-2.5">
          <Info className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="font-semibold">Interface Prototype: </strong>
            This conversational interface is fully styled and interactive. In Prompt 4, it will be wired to the Google Gemini AI provider with function calling over our location intelligence database.
          </div>
        </div>
      </div>

      {/* Suggested Questions Pill Rack */}
      <div className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Suggested Analytical Inquiries
        </span>
        <div className="flex flex-wrap gap-2">
          {suggestedQuestions.map((q, i) => (
            <button
              key={i}
              onClick={() => handleQuestionClick(q)}
              className="text-xs text-left px-3 py-1.5 rounded-lg bg-white hover:bg-brand-50 border border-slate-200 hover:border-brand-300 text-slate-700 hover:text-brand-700 transition-colors shadow-2xs"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Session Conversation Area */}
      <Card className="flex flex-col h-[460px] p-0 overflow-hidden">
        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-medium ${
                    isUser
                      ? 'bg-slate-800 text-white'
                      : 'bg-brand-600 text-white shadow-xs'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Content Box */}
                <div className="space-y-1.5">
                  <div
                    className={`p-3.5 rounded-xl text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? 'bg-brand-600 text-white rounded-tr-xs shadow-xs'
                        : msg.isNotice
                        ? 'bg-slate-100 text-slate-800 rounded-tl-xs border border-slate-200'
                        : 'bg-white text-slate-800 rounded-tl-xs border border-slate-200/90 shadow-2xs'
                    }`}
                  >
                    <p>{msg.content}</p>

                    {/* Supporting Sources Area */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-slate-200 text-[11px] text-slate-500 space-y-1">
                        <div className="font-semibold text-slate-700 flex items-center gap-1">
                          <BookOpen className="w-3 h-3 text-brand-600" />
                          <span>Supporting Telemetry Citations:</span>
                        </div>
                        <ul className="list-disc list-inside space-y-0.5 text-slate-600 font-mono text-[10px]">
                          {msg.sources.map((s, idx) => (
                            <li key={idx}>{s}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div
                    className={`text-[10px] text-slate-500 flex items-center gap-1 ${
                      isUser ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <Clock className="w-3 h-3" />
                    <span>{msg.timestamp}</span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex gap-3 mr-auto max-w-[85%] items-center">
              <div className="w-7 h-7 rounded-lg bg-brand-600 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3 bg-slate-100 rounded-xl rounded-tl-xs text-xs text-slate-500 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
                <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse delay-100"></span>
                <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse delay-200"></span>
                <span>Grounded response workflow standby...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask an intelligence question about any region..."
              className="flex-1 bg-white px-4 py-2.5 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <Button
              type="submit"
              size="md"
              disabled={!inputText.trim() || isLoading}
              icon={<Send className="w-3.5 h-3.5" />}
            >
              Send
            </Button>
          </form>
          <div className="mt-1.5 flex justify-between items-center text-[10px] text-slate-500 px-1">
            <span>Model citation safety active</span>
            <span>Gemini API connection target: Prompt 4</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
