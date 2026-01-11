/**
 * OnboardingAIManager - Interactive AI Instructor for Training Modules
 * Provides real-time Q&A with context-aware AI tutor
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Sparkles, Loader2 } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface OnboardingAIManagerProps {
  moduleTitle: string;
  moduleNumber: number;
  wingTrack: 'contributor-copper' | 'operator-silver' | 'creator-gold';
  moduleContent?: string; // Optional: pass module content for better context
}

export function OnboardingAIManager({ 
  moduleTitle, 
  moduleNumber, 
  wingTrack,
  moduleContent 
}: OnboardingAIManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Add welcome message when opened for first time
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const trackName = 
        wingTrack === 'contributor-copper' ? 'Contributor Copper Wings' :
        wingTrack === 'operator-silver' ? 'Operator Silver Wings' :
        'Creator Gold Wings';
      
      setMessages([{
        role: 'assistant',
        content: `Welcome to **${trackName}** training! 🎓

I'm your Onboarding Instructor for **Module ${moduleNumber}: ${moduleTitle}**.

I'm here to help you understand the concepts, answer questions, and guide you through the material. Feel free to ask:

• **Clarification questions** about any concept
• **Deep dives** into HHF-AI science
• **Practical examples** of how to apply ideas
• **Connections** between modules or concepts

What would you like to explore?`,
        timestamp: new Date()
      }]);
    }
  }, [isOpen, messages.length, moduleTitle, moduleNumber, wingTrack]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/onboarding-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          moduleTitle,
          moduleNumber,
          wingTrack,
          moduleContent: moduleContent?.substring(0, 2000) // Limit context size
        })
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: '⚠️ Sorry, I encountered an error. Please try again or rephrase your question.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const trackColor = 
    wingTrack === 'contributor-copper' ? 'var(--metal-copper)' :
    wingTrack === 'operator-silver' ? 'var(--metal-silver)' :
    'var(--metal-gold)';

  const trackIcon = 
    wingTrack === 'contributor-copper' ? '🪙' :
    wingTrack === 'operator-silver' ? '🛡️' :
    '👑';

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-3 px-5 py-3 rounded-full shadow-2xl transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(255,215,0,0.3)] border-2"
          style={{
            backgroundColor: 'var(--cockpit-carbon)',
            borderColor: trackColor,
            color: trackColor
          }}
          title="Ask the Onboarding Instructor"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="font-semibold text-sm hidden sm:inline">Ask Instructor</span>
          <Sparkles className="w-4 h-4" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[420px] h-[600px] flex flex-col rounded-lg shadow-2xl border-2 overflow-hidden"
          style={{
            backgroundColor: 'var(--cockpit-carbon)',
            borderColor: trackColor
          }}
        >
          {/* Header */}
          <div className="p-4 border-b flex items-center justify-between"
            style={{
              borderColor: 'var(--keyline-primary)',
              backgroundColor: `${trackColor}15`
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-2xl"
                style={{ backgroundColor: `${trackColor}30` }}
              >
                {trackIcon}
              </div>
              <div>
                <div className="font-bold text-sm" style={{ color: trackColor }}>
                  Onboarding Instructor
                </div>
                <div className="text-xs opacity-70">
                  Module {moduleNumber}: {moduleTitle.substring(0, 30)}...
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, idx) => (
              <div
                key={idx}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg p-3 text-sm leading-relaxed ${
                    message.role === 'user'
                      ? 'bg-blue-500/20 border border-blue-500/30'
                      : 'bg-black/40 border border-white/10'
                  }`}
                >
                  <div 
                    className="prose prose-sm prose-invert max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: message.content
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\n/g, '<br/>')
                    }}
                  />
                  <div className="text-[10px] opacity-50 mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-black/40 border border-white/10 rounded-lg p-3 flex items-center gap-2">
                  <Loader2 className="w-4 h-4" />
                  <span className="text-sm opacity-70">Instructor is thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t"
            style={{ borderColor: 'var(--keyline-primary)' }}
          >
            <div className="flex gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about this module..."
                className="flex-1 bg-black/40 border rounded-lg px-3 py-2 text-sm resize-none outline-none focus:border-opacity-100 transition-colors"
                style={{ borderColor: `${trackColor}40` }}
                rows={2}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="w-10 h-full rounded-lg flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105"
                style={{
                  backgroundColor: `${trackColor}20`,
                  color: trackColor,
                  border: `1px solid ${trackColor}40`
                }}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="text-[10px] opacity-50 mt-2">
              Press Enter to send, Shift+Enter for new line
            </div>
          </form>
        </div>
      )}
    </>
  );
}

