/**
 * Hero Analytics Tracking Utilities
 * Tracks hero interactions, session metrics, and engagement data
 */

import { createClient } from '@/utils/supabase/client';

export interface HeroInteractionEvent {
  hero_id: string;
  session_id?: string;
  event_type: 'hero_viewed' | 'story_selected' | 'message_sent' | 'session_started' | 'session_ended' | 'hero_expanded' | 'hero_collapsed';
  event_metadata?: Record<string, any>;
}

export interface SessionMetrics {
  session_id: string;
  hero_id: string;
  story_id?: string;
  message_count: number;
  duration_seconds: number;
  user_satisfaction?: number;
  completion_status: 'completed' | 'abandoned' | 'active';
}

/**
 * Track a hero interaction event
 */
export async function trackHeroInteraction(event: HeroInteractionEvent): Promise<void> {
  try {
    const supabase = createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    await supabase.from('hero_analytics').insert({
      hero_id: event.hero_id,
      session_id: event.session_id || null,
      user_id: user?.id || null,
      event_type: event.event_type,
      event_metadata: event.event_metadata || {},
      event_timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to track hero interaction:', error);
    // Don't throw - analytics failures shouldn't break user experience
  }
}

/**
 * Update session metrics
 */
export async function updateSessionMetrics(metrics: SessionMetrics): Promise<void> {
  try {
    const supabase = createClient();
    
    await supabase
      .from('hero_sessions')
      .update({
        message_count: metrics.message_count,
        user_satisfaction: metrics.user_satisfaction,
        ended_at: metrics.completion_status !== 'active' ? new Date().toISOString() : null,
        status: metrics.completion_status === 'active' ? 'active' : 'ended',
      })
      .eq('id', metrics.session_id);

    // Also track in analytics
    await supabase.from('hero_analytics').insert({
      hero_id: metrics.hero_id,
      session_id: metrics.session_id,
      event_type: 'session_ended',
      event_metadata: {
        message_count: metrics.message_count,
        duration_seconds: metrics.duration_seconds,
        completion_status: metrics.completion_status,
        user_satisfaction: metrics.user_satisfaction,
      },
      event_timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to update session metrics:', error);
  }
}

/**
 * Get hero engagement statistics
 */
export async function getHeroEngagementStats(heroId: string, timeRange: 'day' | 'week' | 'month' | 'all' = 'week') {
  try {
    const supabase = createClient();
    
    let startDate = new Date();
    switch (timeRange) {
      case 'day':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'all':
        startDate = new Date(0); // Beginning of time
        break;
    }

    // Get interaction counts
    const { data: interactions, error: interactionsError } = await supabase
      .from('hero_analytics')
      .select('event_type')
      .eq('hero_id', heroId)
      .gte('event_timestamp', startDate.toISOString());

    if (interactionsError) throw interactionsError;

    // Get session metrics
    const { data: sessions, error: sessionsError } = await supabase
      .from('hero_sessions')
      .select('*')
      .eq('hero_id', heroId)
      .gte('started_at', startDate.toISOString());

    if (sessionsError) throw sessionsError;

    // Calculate metrics
    const totalViews = interactions?.filter(i => i.event_type === 'hero_viewed').length || 0;
    const totalSessions = sessions?.length || 0;
    const activeSessions = sessions?.filter(s => s.status === 'active').length || 0;
    const completedSessions = sessions?.filter(s => s.status === 'ended').length || 0;
    
    const totalMessages = sessions?.reduce((sum, s) => sum + (s.message_count || 0), 0) || 0;
    const avgMessagesPerSession = totalSessions > 0 ? totalMessages / totalSessions : 0;

    const avgSatisfaction = sessions && sessions.length > 0
      ? sessions.reduce((sum, s) => sum + (s.user_satisfaction || 0), 0) / sessions.filter(s => s.user_satisfaction).length
      : 0;

    return {
      totalViews,
      totalSessions,
      activeSessions,
      completedSessions,
      totalMessages,
      avgMessagesPerSession: Math.round(avgMessagesPerSession * 10) / 10,
      avgSatisfaction: Math.round(avgSatisfaction * 10) / 10,
      conversionRate: totalViews > 0 ? (totalSessions / totalViews) * 100 : 0,
    };
  } catch (error) {
    console.error('Failed to get hero engagement stats:', error);
    return {
      totalViews: 0,
      totalSessions: 0,
      activeSessions: 0,
      completedSessions: 0,
      totalMessages: 0,
      avgMessagesPerSession: 0,
      avgSatisfaction: 0,
      conversionRate: 0,
    };
  }
}

/**
 * Get top performing heroes
 */
export async function getTopHeroes(limit: number = 10) {
  try {
    const supabase = createClient();
    
    const { data: heroes, error } = await supabase
      .from('hero_catalog')
      .select('id, name, icon_url, tagline')
      .eq('status', 'online')
      .limit(limit);

    if (error) throw error;

    // Get engagement stats for each hero
    const heroesWithStats = await Promise.all(
      heroes.map(async (hero) => {
        const stats = await getHeroEngagementStats(hero.id, 'week');
        return {
          ...hero,
          ...stats,
        };
      })
    );

    // Sort by total sessions
    return heroesWithStats.sort((a, b) => b.totalSessions - a.totalSessions);
  } catch (error) {
    console.error('Failed to get top heroes:', error);
    return [];
  }
}

/**
 * Track hero panel visibility
 */
export async function trackHeroPanelVisibility(heroId: string, visible: boolean): Promise<void> {
  await trackHeroInteraction({
    hero_id: heroId,
    event_type: visible ? 'hero_expanded' : 'hero_collapsed',
  });
}

/**
 * Track story selection
 */
export async function trackStorySelection(heroId: string, storyId: string, sessionId?: string): Promise<void> {
  await trackHeroInteraction({
    hero_id: heroId,
    session_id: sessionId,
    event_type: 'story_selected',
    event_metadata: { story_id: storyId },
  });
}

/**
 * Track message sent in session
 */
export async function trackMessageSent(heroId: string, sessionId: string): Promise<void> {
  await trackHeroInteraction({
    hero_id: heroId,
    session_id: sessionId,
    event_type: 'message_sent',
  });
}

