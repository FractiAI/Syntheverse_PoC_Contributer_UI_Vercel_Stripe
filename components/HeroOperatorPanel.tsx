'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { ChevronDown, Power, Play, Square } from 'lucide-react';

interface Hero {
  id: string;
  name: string;
  icon_url: string | null;
  tagline: string | null;
  page_assignment: string | null;
  pillar_assignment: string | null;
  status: 'online' | 'offline' | 'maintenance';
  metadata?: {
    personality?: string;
    capabilities?: string[];
  };
}

interface Story {
  id: string;
  hero_id: string;
  title: string;
  description: string | null;
  system_prompt: string;
  context: string | null;
}

interface Session {
  id: string;
  hero_id: string;
  story_id: string | null;
  session_type: string;
  user_id: string | null;
  status: string;
  started_at: string;
  ended_at: string | null;
  hero_name?: string;
  story_title?: string;
}

export default function HeroOperatorPanel() {
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [stories, setStories] = useState<{ [heroId: string]: Story[] }>({});
  const [selectedHero, setSelectedHero] = useState<Hero | null>(null);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [customSystemPrompt, setCustomSystemPrompt] = useState('');
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'heroes' | 'sessions'>('heroes');

  const supabase = createClient();

  // Load heroes
  const loadHeroes = async () => {
    try {
      const response = await fetch('/api/heroes');
      if (!response.ok) throw new Error('Failed to fetch heroes');
      const data = await response.json();
      setHeroes(data.heroes || []);
    } catch (err) {
      console.error('Error loading heroes:', err);
    }
  };

  // Load sessions
  const loadSessions = async () => {
    try {
      const response = await fetch('/api/hero-sessions');
      if (!response.ok) throw new Error('Failed to fetch sessions');
      const data = await response.json();
      
      const enrichedSessions = await Promise.all(
        data.sessions.map(async (session: Session) => {
          const hero = heroes.find(h => h.id === session.hero_id);
          let story = null;
          
          if (session.story_id && stories[session.hero_id]) {
            story = stories[session.hero_id].find(s => s.id === session.story_id);
          }

          return {
            ...session,
            hero_name: hero?.name || 'Unknown',
            story_title: story?.title || 'Ad-hoc Session',
          };
        })
      );

      setSessions(enrichedSessions);
    } catch (err) {
      console.error('Error loading sessions:', err);
    }
  };

  // Load stories for hero
  const loadStoriesForHero = async (heroId: string) => {
    if (stories[heroId]) return;

    try {
      const response = await fetch(`/api/heroes/${heroId}/stories`);
      if (!response.ok) throw new Error('Failed to fetch stories');
      const data = await response.json();
      setStories(prev => ({ ...prev, [heroId]: data.stories || [] }));
    } catch (err) {
      console.error('Error loading stories:', err);
    }
  };

  // Toggle hero status
  const toggleHeroStatus = async (heroId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'online' ? 'offline' : 'online';
    
    try {
      const response = await fetch(`/api/heroes/${heroId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update hero status');
      await loadHeroes();
    } catch (err) {
      console.error('Error toggling hero status:', err);
      alert('Failed to update hero status');
    }
  };

  // Launch session
  const launchSession = async () => {
    if (!selectedHero) {
      alert('Please select a hero first');
      return;
    }

    try {
      const sessionData: any = {
        hero_id: selectedHero.id,
        session_type: selectedStory ? 'story_guided' : 'open_ended',
      };

      if (selectedStory) {
        sessionData.story_id = selectedStory.id;
        sessionData.system_prompt = selectedStory.system_prompt;
      } else if (customSystemPrompt.trim()) {
        sessionData.system_prompt = customSystemPrompt.trim();
      } else {
        alert('Please select a story or provide a custom system prompt');
        return;
      }

      const response = await fetch('/api/hero-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData),
      });

      if (!response.ok) throw new Error('Failed to create session');
      
      const data = await response.json();
      alert(`Session ${data.session.id.substring(0, 8)} launched successfully!`);
      
      setSelectedHero(null);
      setSelectedStory(null);
      setCustomSystemPrompt('');
      await loadSessions();
    } catch (err) {
      console.error('Error launching session:', err);
      alert('Failed to launch session');
    }
  };

  // End session
  const endSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('hero_sessions')
        .update({ status: 'ended', ended_at: new Date().toISOString() })
        .eq('id', sessionId);

      if (error) throw error;
      await loadSessions();
    } catch (err) {
      console.error('Error ending session:', err);
      alert('Failed to end session');
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadHeroes();
      await loadSessions();
      setLoading(false);
    };
    init();

    const interval = setInterval(loadSessions, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (heroes.length > 0) {
      loadSessions();
    }
  }, [heroes]);

  useEffect(() => {
    if (selectedHero) {
      loadStoriesForHero(selectedHero.id);
    }
  }, [selectedHero]);

  const activeSessions = sessions.filter(s => s.status === 'active');

  if (loading) {
    return (
      <div className="p-4 text-center" style={{ color: 'hsl(var(--text-secondary))' }}>
        <div className="rounded-full h-8 w-8 border-b-2 mx-auto" style={{ borderColor: 'hsl(var(--hydrogen-alpha))' }}></div>
        <p className="mt-2 text-sm">Loading hero operators...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* View Toggle */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setView('heroes')}
          className={`px-4 py-2 rounded text-sm font-medium transition-all ${
            view === 'heroes'
              ? 'text-white'
              : 'opacity-60 hover:opacity-100'
          }`}
          style={view === 'heroes' ? { 
            backgroundColor: 'hsl(var(--hydrogen-alpha))',
            color: 'hsl(var(--background))' 
          } : { color: 'hsl(var(--text-secondary))' }}
        >
          Hero Control ({heroes.length})
        </button>
        <button
          onClick={() => setView('sessions')}
          className={`px-4 py-2 rounded text-sm font-medium transition-all ${
            view === 'sessions'
              ? 'text-white'
              : 'opacity-60 hover:opacity-100'
          }`}
          style={view === 'sessions' ? { 
            backgroundColor: 'hsl(var(--hydrogen-alpha))',
            color: 'hsl(var(--background))' 
          } : { color: 'hsl(var(--text-secondary))' }}
        >
          Active Sessions ({activeSessions.length})
        </button>
      </div>

      {/* Heroes View */}
      {view === 'heroes' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Heroes List */}
          <div>
            <h3 className="text-sm font-semibold mb-3 uppercase tracking-wider" style={{ color: 'hsl(var(--hydrogen-alpha))' }}>
              Available Heroes
            </h3>
            <div className="space-y-2">
              {heroes.map(hero => (
                <div
                  key={hero.id}
                  onClick={() => setSelectedHero(hero)}
                  className={`p-3 rounded cursor-pointer transition-all border ${
                    selectedHero?.id === hero.id
                      ? 'border-opacity-100'
                      : 'border-opacity-20 hover:border-opacity-40'
                  }`}
                  style={{
                    backgroundColor: selectedHero?.id === hero.id ? 'hsl(var(--hydrogen-alpha) / 0.1)' : 'hsl(var(--card-background))',
                    borderColor: 'hsl(var(--hydrogen-beta))'
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2">
                      <div className="text-xl">{hero.icon_url || '🤖'}</div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm" style={{ color: 'hsl(var(--text-primary))' }}>{hero.name}</h4>
                        <p className="text-xs mt-1" style={{ color: 'hsl(var(--text-secondary))' }}>{hero.tagline}</p>
                        <div className="flex gap-1 mt-2">
                          {hero.page_assignment && (
                            <span className="text-xs px-2 py-0.5 rounded" style={{ 
                              backgroundColor: 'hsl(var(--card-background))',
                              color: 'hsl(var(--text-secondary))'
                            }}>
                              {hero.page_assignment}
                            </span>
                          )}
                          {hero.pillar_assignment && (
                            <span className="text-xs px-2 py-0.5 rounded" style={{ 
                              backgroundColor: 'hsl(var(--card-background))',
                              color: 'hsl(var(--text-secondary))'
                            }}>
                              {hero.pillar_assignment}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleHeroStatus(hero.id, hero.status);
                      }}
                      className={`p-2 rounded transition-all ${
                        hero.status === 'online' ? 'hover:opacity-80' : 'hover:opacity-80'
                      }`}
                      style={{
                        backgroundColor: hero.status === 'online' 
                          ? 'hsl(142, 76%, 36%)' 
                          : 'hsl(var(--card-background))',
                        color: hero.status === 'online' ? 'white' : 'hsl(var(--text-secondary))'
                      }}
                      title={hero.status === 'online' ? 'Online - Click to disable' : 'Offline - Click to enable'}
                    >
                      <Power className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Session Launcher */}
          <div>
            <h3 className="text-sm font-semibold mb-3 uppercase tracking-wider" style={{ color: 'hsl(var(--hydrogen-alpha))' }}>
              Launch AI Session
            </h3>
            
            {selectedHero ? (
              <div className="space-y-3">
                <div className="p-3 rounded border" style={{ 
                  backgroundColor: 'hsl(var(--card-background))',
                  borderColor: 'hsl(var(--hydrogen-beta) / 0.2)'
                }}>
                  <p className="text-xs mb-1" style={{ color: 'hsl(var(--text-secondary))' }}>Selected Hero</p>
                  <p className="font-medium" style={{ color: 'hsl(var(--text-primary))' }}>{selectedHero.name}</p>
                </div>

                {/* Story Selection */}
                <div>
                  <label className="block text-xs font-medium mb-2" style={{ color: 'hsl(var(--text-secondary))' }}>
                    Select Story
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    <button
                      onClick={() => setSelectedStory(null)}
                      className={`w-full p-2 rounded border text-left transition-all ${
                        !selectedStory ? 'border-opacity-100' : 'border-opacity-20 hover:border-opacity-40'
                      }`}
                      style={{
                        backgroundColor: !selectedStory ? 'hsl(var(--hydrogen-alpha) / 0.1)' : 'hsl(var(--card-background))',
                        borderColor: 'hsl(var(--hydrogen-beta))'
                      }}
                    >
                      <p className="text-sm font-medium" style={{ color: 'hsl(var(--text-primary))' }}>Custom Prompt</p>
                      <p className="text-xs" style={{ color: 'hsl(var(--text-secondary))' }}>Use custom system prompt</p>
                    </button>
                    {stories[selectedHero.id]?.map(story => (
                      <button
                        key={story.id}
                        onClick={() => setSelectedStory(story)}
                        className={`w-full p-2 rounded border text-left transition-all ${
                          selectedStory?.id === story.id ? 'border-opacity-100' : 'border-opacity-20 hover:border-opacity-40'
                        }`}
                        style={{
                          backgroundColor: selectedStory?.id === story.id ? 'hsl(var(--hydrogen-alpha) / 0.1)' : 'hsl(var(--card-background))',
                          borderColor: 'hsl(var(--hydrogen-beta))'
                        }}
                      >
                        <p className="text-sm font-medium" style={{ color: 'hsl(var(--text-primary))' }}>{story.title}</p>
                        <p className="text-xs" style={{ color: 'hsl(var(--text-secondary))' }}>{story.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Prompt */}
                {!selectedStory && (
                  <div>
                    <label className="block text-xs font-medium mb-2" style={{ color: 'hsl(var(--text-secondary))' }}>
                      Custom System Prompt
                    </label>
                    <textarea
                      value={customSystemPrompt}
                      onChange={(e) => setCustomSystemPrompt(e.target.value)}
                      placeholder="Enter custom system prompt..."
                      className="w-full h-24 px-3 py-2 rounded border text-sm focus:outline-none focus:ring-1 resize-none"
                      style={{
                        backgroundColor: 'hsl(var(--card-background))',
                        borderColor: 'hsl(var(--hydrogen-beta) / 0.2)',
                        color: 'hsl(var(--text-primary))'
                      }}
                    />
                  </div>
                )}

                <button
                  onClick={launchSession}
                  className="w-full px-4 py-2 rounded font-medium transition-all hover:opacity-90 flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: 'hsl(var(--hydrogen-alpha))',
                    color: 'hsl(var(--background))'
                  }}
                >
                  <Play className="h-4 w-4" />
                  Launch Session
                </button>
              </div>
            ) : (
              <div className="p-8 text-center rounded border" style={{ 
                backgroundColor: 'hsl(var(--card-background))',
                borderColor: 'hsl(var(--hydrogen-beta) / 0.2)',
                color: 'hsl(var(--text-secondary))'
              }}>
                <p className="text-sm">Select a hero to launch a session</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sessions View */}
      {view === 'sessions' && (
        <div>
          <h3 className="text-sm font-semibold mb-3 uppercase tracking-wider" style={{ color: 'hsl(var(--hydrogen-alpha))' }}>
            Active Sessions
          </h3>
          
          {activeSessions.length > 0 ? (
            <div className="space-y-2">
              {activeSessions.map(session => {
                const startTime = new Date(session.started_at);
                const duration = Math.floor((Date.now() - startTime.getTime()) / 1000 / 60);

                return (
                  <div
                    key={session.id}
                    className="p-3 rounded border"
                    style={{
                      backgroundColor: 'hsl(var(--card-background))',
                      borderColor: 'hsl(var(--hydrogen-beta) / 0.2)'
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm" style={{ color: 'hsl(var(--text-primary))' }}>
                            {session.hero_name}
                          </h4>
                          <span className="text-xs px-2 py-0.5 rounded" style={{ 
                            backgroundColor: 'hsl(142, 76%, 36% / 0.2)',
                            color: 'hsl(142, 76%, 36%)',
                            border: '1px solid hsl(142, 76%, 36% / 0.4)'
                          }}>
                            ACTIVE
                          </span>
                        </div>
                        <p className="text-xs mb-1" style={{ color: 'hsl(var(--text-secondary))' }}>
                          {session.story_title}
                        </p>
                        <div className="flex gap-3 text-xs" style={{ color: 'hsl(var(--text-secondary))' }}>
                          <span>Type: {session.session_type}</span>
                          <span>Duration: {duration}m</span>
                          <span>Started: {startTime.toLocaleTimeString()}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => endSession(session.id)}
                        className="p-2 rounded transition-all hover:opacity-80"
                        style={{
                          backgroundColor: 'hsl(0, 84%, 60% / 0.2)',
                          color: 'hsl(0, 84%, 60%)',
                          border: '1px solid hsl(0, 84%, 60% / 0.4)'
                        }}
                        title="End session"
                      >
                        <Square className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center rounded border" style={{ 
              backgroundColor: 'hsl(var(--card-background))',
              borderColor: 'hsl(var(--hydrogen-beta) / 0.2)',
              color: 'hsl(var(--text-secondary))'
            }}>
              <p className="text-sm">No active sessions</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

