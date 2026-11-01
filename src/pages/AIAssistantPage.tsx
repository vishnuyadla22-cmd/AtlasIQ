import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Clock,
  BookOpen,
  User,
  ShieldCheck,
  MapPin,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { StatusPill } from '../components/common/StatusPill';
import { AIMessage, GeocodeResult } from '../types';
import { useLocationContext } from '../context/LocationContext';
import {
  askIntelligenceAssistant,
  AIResponse,
  ConversationContextState,
} from '../services/aiAssistant';
import { formatDisplayValueWithUnit } from '../utils/formatters';

export const AIAssistantPage: React.FC = () => {
  const {
    activeLocation,
    weatherData,
    airQualityData,
    worldBankData,
    hydrologyData,
    seismicData,
  } = useLocationContext();

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationLocation, setConversationLocation] = useState<GeocodeResult | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const latestRequestIdRef = useRef<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Persistent conversation context across follow-up queries
  const conversationContextRef = useRef<ConversationContextState>({
    lastLocation: null,
    lastWeather: null,
    lastAirQuality: null,
    lastWorldBank: null,
    lastHydrology: null,
    lastSeismic: null,
  });

  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: 'system-welcome',
      sender: 'assistant',
      content: `Welcome to the **AtlasIQ Location Intelligence Assistant**.\n\nI answer queries strictly grounded in verified Open-Meteo weather models, Copernicus CAMS atmospheric chemistry, Copernicus GloFAS river discharge, USGS seismic hazards, and official World Bank national accounts. I will never substitute simulated values, invent missing numbers, or fabricate unverified ground measurements.\n\n*Current Active Context:* **${activeLocation ? activeLocation.displayName : 'None selected (You can specify any city directly in your query)'}**`,
      timestamp: 'Session start',
      isNotice: true,
      sources: [
        'AtlasIQ Verification Engine',
        'Open-Meteo Weather Model Analysis',
        'Copernicus Atmosphere Monitoring Service (CAMS)',
        'Copernicus GloFAS Flood API',
        'USGS Earthquake Hazards Program',
        'World Bank Open Data API',
      ],
      limitations: 'Environmental data reflects numerical model assimilations (~5-11 km grid resolution). Socioeconomic indicators represent sovereign national accounts.',
    },
  ]);

  const suggestedQuestions = [
    'Give me about Chennai, India',
    'What is the air quality in Tokyo?',
    'How does Chennai compare with Hyderabad?',
    'Why is the groundwater indicator unavailable?',
    'What is the source of the solar data?',
    'What are the current weather conditions in Hyderabad?',
    'What is the river discharge in Chennai?',
    'Are there recent earthquakes near Tokyo?',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    // Track request ID to prevent stale asynchronous overwrites
    const currentRequestId = ++latestRequestIdRef.current;

    // Abort previous in-flight request if any
    abortControllerRef.current?.abort();
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

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

    try {
      const response: AIResponse = await askIntelligenceAssistant(
        text,
        activeLocation,
        weatherData,
        airQualityData,
        worldBankData,
        hydrologyData,
        seismicData,
        abortController.signal,
        conversationContextRef.current
      );

      // Verify request is still the latest before committing state
      if (currentRequestId !== latestRequestIdRef.current) {
        return;
      }

      // Update conversation context if a new location was resolved
      if (response.resolvedLocation) {
        setConversationLocation(response.resolvedLocation);
        conversationContextRef.current.lastLocation = response.resolvedLocation;
      }

      const assistantMsg: AIMessage = {
        id: response.id,
        sender: 'assistant',
        content: response.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: response.sources,
        supportingData: response.supportingData,
        limitations: response.limitations,
        targetLocationName: response.targetLocationName,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: unknown) {
      if (currentRequestId !== latestRequestIdRef.current) return;
      if (err instanceof DOMException && err.name === 'AbortError') return;

      const errorMsg: AIMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        content: 'An error occurred while evaluating the grounded location data. Please check your network connection and try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: ['AtlasIQ Exception Handler'],
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      if (currentRequestId === latestRequestIdRef.current) {
        setIsLoading(false);
      }
    }
  };

  const handleQuestionClick = (q: string) => {
    setInputText(q);
    handleSend(q);
  };

  const renderInlineFormatting = (str: string) => {
    const parts = str.split(/(\*\*.*?\*\*|\*.*?\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={idx} className="font-semibold text-slate-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return (
          <em key={idx} className="italic text-slate-600">
            {part.slice(1, -1)}
          </em>
        );
      }
      return part;
    });
  };

  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    return (
      <div className="space-y-2 text-xs sm:text-sm text-slate-800 leading-relaxed">
        {lines.map((line, i) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={i} className="h-1" />;

          // Headings ###
          if (trimmed.startsWith('### ')) {
            return (
              <h3 key={i} className="text-sm sm:text-base font-bold text-slate-900 pt-1">
                {trimmed.replace('### ', '')}
              </h3>
            );
          }
          if (trimmed.startsWith('#### ')) {
            return (
              <h4 key={i} className="text-xs sm:text-sm font-semibold text-slate-800 pt-0.5">
                {trimmed.replace('#### ', '')}
              </h4>
            );
          }

          // Bullet point
          if (trimmed.startsWith('- ')) {
            return (
              <div key={i} className="flex items-start gap-2 pl-2">
                <span className="text-brand-600 font-bold">•</span>
                <span>{renderInlineFormatting(trimmed.replace('- ', ''))}</span>
              </div>
            );
          }

          // Numbered list
          const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
          if (numMatch) {
            return (
              <div key={i} className="flex items-start gap-2 pl-2">
                <span className="text-brand-700 font-semibold">{numMatch[1]}.</span>
                <span>{renderInlineFormatting(numMatch[2])}</span>
              </div>
            );
          }

          // Standard paragraph
          return <p key={i}>{renderInlineFormatting(trimmed)}</p>;
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Evidence-Grounded Intelligence Assistant</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              AI Location Assistant
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
              Natural language inquiries verified against Open-Meteo, Copernicus CAMS, and OpenStreetMap spatial data.
            </p>
          </div>
          <div className="shrink-0 flex flex-col sm:items-end gap-1.5">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Grounded Engine Active</span>
            </span>
            <span className="text-[11px] text-slate-500 font-mono">Zero Synthetic Hallucination</span>
          </div>
        </div>

        {/* Active Location Banner */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-3 text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-700">Conversation Focus:</span>
              {conversationLocation ? (
                <span className="inline-flex items-center gap-1 text-purple-700 font-medium bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                  <MapPin className="w-3 h-3 text-purple-600" />
                  <span>{conversationLocation.name}</span>
                </span>
              ) : (
                <span className="text-slate-500 italic">Same as active map</span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-700">Map Context:</span>
              {activeLocation ? (
                <span className="inline-flex items-center gap-1 text-brand-700 font-medium bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                  <MapPin className="w-3 h-3 text-brand-600" />
                  <span>{activeLocation.displayName}</span>
                </span>
              ) : (
                <span className="text-slate-500 italic">None selected</span>
              )}
            </div>
          </div>
          <div className="text-[11px] text-slate-500">
            Persistence: <span className="font-semibold text-slate-700">Isolated & Context-Aware</span>
          </div>
        </div>
      </div>

      {/* Suggested Questions Pill Rack */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Suggested Evidence Inquiries
          </span>
          <span className="text-[11px] text-slate-500">Click to execute query</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {suggestedQuestions.map((q, i) => (
            <button
              key={i}
              onClick={() => handleQuestionClick(q)}
              className="text-xs text-left p-2.5 rounded-lg bg-white hover:bg-brand-50 border border-slate-200 hover:border-brand-300 text-slate-700 hover:text-brand-700 transition-colors shadow-2xs flex items-center justify-between group"
            >
              <span className="truncate pr-2">{q}</span>
              <span className="text-slate-400 group-hover:text-brand-600 font-bold shrink-0">→</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Session Conversation Area */}
      <Card className="flex flex-col h-[520px] p-0 overflow-hidden shadow-xs">
        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-slate-50/40">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[90%] sm:max-w-[85%] ${
                  isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-medium ${
                    isUser ? 'bg-slate-800 text-white' : 'bg-brand-600 text-white shadow-xs'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Content Box */}
                <div className="space-y-2 max-w-full">
                  <div
                    className={`p-4 rounded-xl text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? 'bg-brand-600 text-white rounded-tr-xs shadow-xs'
                        : msg.isNotice
                        ? 'bg-white text-slate-800 rounded-tl-xs border border-purple-200/80 shadow-2xs ring-1 ring-purple-100'
                        : 'bg-white text-slate-800 rounded-tl-xs border border-slate-200/90 shadow-2xs'
                    }`}
                  >
                    {isUser ? <p>{msg.content}</p> : renderFormattedText(msg.content)}

                    {/* Supporting Telemetry Metric Cards (Collapsible Details) */}
                    {msg.supportingData && msg.supportingData.length > 0 && (
                      <details className="mt-3.5 pt-2.5 border-t border-slate-100 group">
                        <summary className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-800 cursor-pointer flex items-center justify-between py-1 transition-colors select-none">
                          <span className="flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-brand-600" />
                            <span>Supporting Telemetry Records ({msg.supportingData.length})</span>
                          </span>
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-open:rotate-180 transition-transform" />
                        </summary>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 mt-1">
                          {msg.supportingData.map((d, idx) => (
                            <div
                              key={idx}
                              className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1 shadow-2xs"
                            >
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-semibold text-slate-700 truncate">{d.metric}</span>
                                <StatusPill status={d.tier} />
                              </div>
                              <div className="text-sm font-bold text-slate-900 font-mono">
                                {formatDisplayValueWithUnit(d.value, d.unit)}
                              </div>
                              <div className="text-[10px] text-slate-500 truncate" title={d.source}>
                                Source: {d.source}
                              </div>
                            </div>
                          ))}
                        </div>
                      </details>
                    )}

                    {/* Supporting Sources Citations */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
                        <div className="font-semibold text-slate-700 flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5 text-brand-600" />
                          <span>Authoritative Telemetry Sources:</span>
                        </div>
                        <ul className="list-disc list-inside space-y-0.5 text-slate-600 font-mono text-[10px]">
                          {msg.sources.map((s, idx) => (
                            <li key={idx}>{s}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Limitations callout */}
                    {msg.limitations && (
                      <div className="mt-2.5 p-2 bg-slate-100/70 border border-slate-200 rounded text-[11px] text-slate-600 space-y-0.5">
                        <span className="font-semibold text-slate-700">Telemetry Provenance & Scope: </span>
                        <span>{msg.limitations}</span>
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
              <div className="p-3.5 bg-white rounded-xl rounded-tl-xs border border-slate-200 text-xs text-slate-600 flex items-center gap-2 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse"></span>
                <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse delay-100"></span>
                <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse delay-200"></span>
                <span className="font-medium text-slate-700">Resolving telemetry and computing grounded evidence...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200 space-y-2">
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
              placeholder="Ask about weather, air quality, solar values, or compare locations (e.g., 'Compare Tokyo and Hyderabad')..."
              className="flex-1 bg-slate-50 hover:bg-white focus:bg-white px-4 py-2.5 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
              disabled={isLoading}
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

          <div className="flex flex-wrap justify-between items-center text-[10px] text-slate-500 px-1">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>Grounded in actual retrieved telemetry · No fake measurements generated</span>
            </span>
            <span className="font-mono text-slate-400">Open-Meteo & Copernicus CAMS</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
