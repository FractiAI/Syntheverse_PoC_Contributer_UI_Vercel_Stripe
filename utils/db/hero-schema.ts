/**
 * Hero/Story Catalog System - Database Schema
 * 
 * Comprehensive hero and story management system with:
 * - Hero catalog (characters with metadata, prompts, assignments)
 * - Story catalog (narratives, interactions, system prompts)
 * - Session management (active AI interactions)
 * - Analytics tracking (engagement, popularity, metrics)
 */

import { pgTable, text, timestamp, boolean, integer, jsonb, numeric } from 'drizzle-orm/pg-core';

// ============================================================================
// Heroes Catalog Table
// ============================================================================
export const heroCatalogTable = pgTable('hero_catalog', {
  id: text('id').primaryKey(), // hero-{uuid}
  name: text('name').notNull(), // Hero display name
  tagline: text('tagline').notNull(), // Short description
  icon: text('icon'), // Icon/avatar URL or emoji
  role: text('role').notNull(), // 'guide', 'mentor', 'explorer', 'scientist', etc.
  
  // System prompt configuration
  default_system_prompt: text('default_system_prompt').notNull(), // Base AI behavior prompt
  prompt_version: text('prompt_version').default('v1.0.0'), // Versioning for prompts
  
  // Page/pillar assignment
  assigned_pages: jsonb('assigned_pages').$type<string[]>().default([]), // ['landing', 'dashboard', 'onboarding']
  assigned_pillars: jsonb('assigned_pillars').$type<string[]>().default([]), // ['contributor', 'operator', 'creator']
  
  // Metadata
  metadata: jsonb('metadata').$type<{
    personality_traits?: string[];
    expertise_areas?: string[];
    communication_style?: string;
    interaction_mode?: 'conversational' | 'instructional' | 'exploratory';
    voice_tone?: string;
    [key: string]: any;
  }>(),
  
  // Status and visibility
  status: text('status').notNull().default('draft'), // 'draft', 'active', 'archived'
  is_public: boolean('is_public').default(true), // Visible to consumers
  is_default: boolean('is_default').default(false), // Default hero for pages
  
  // Creator information
  created_by: text('created_by').notNull(), // Email of creator
  updated_by: text('updated_by'),
  
  // Analytics summary
  total_interactions: integer('total_interactions').default(0),
  total_sessions: integer('total_sessions').default(0),
  average_rating: numeric('average_rating', { precision: 3, scale: 2 }).default('0'),
  
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export type InsertHero = typeof heroCatalogTable.$inferInsert;
export type SelectHero = typeof heroCatalogTable.$inferSelect;

// ============================================================================
// Stories Catalog Table
// ============================================================================
export const storyCatalogTable = pgTable('story_catalog', {
  id: text('id').primaryKey(), // story-{uuid}
  hero_id: text('hero_id').notNull(), // References hero_catalog.id
  
  title: text('title').notNull(), // Story title
  description: text('description').notNull(), // Story description
  category: text('category'), // 'tutorial', 'exploration', 'challenge', 'narrative'
  
  // Story content and prompts
  story_prompt: text('story_prompt').notNull(), // AI system prompt for this story
  story_context: text('story_context'), // Additional context/background
  interaction_goals: jsonb('interaction_goals').$type<string[]>(), // Learning/engagement goals
  
  // AI configuration
  ai_model: text('ai_model').default('llama-3.3-70b-versatile'), // AI model to use
  temperature: numeric('temperature', { precision: 3, scale: 2 }).default('0.7'),
  max_tokens: integer('max_tokens').default(500),
  
  // Story metadata
  metadata: jsonb('metadata').$type<{
    difficulty_level?: 'beginner' | 'intermediate' | 'advanced';
    estimated_duration_minutes?: number;
    prerequisites?: string[];
    tags?: string[];
    learning_outcomes?: string[];
    [key: string]: any;
  }>(),
  
  // Status and visibility
  status: text('status').notNull().default('draft'), // 'draft', 'active', 'archived'
  is_featured: boolean('is_featured').default(false),
  display_order: integer('display_order').default(0),
  
  // Creator information
  created_by: text('created_by').notNull(),
  updated_by: text('updated_by'),
  
  // Analytics
  total_completions: integer('total_completions').default(0),
  total_starts: integer('total_starts').default(0),
  average_completion_time_minutes: integer('average_completion_time_minutes'),
  
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export type InsertStory = typeof storyCatalogTable.$inferInsert;
export type SelectStory = typeof storyCatalogTable.$inferSelect;

// ============================================================================
// Hero Sessions Table (Active AI Interactions)
// ============================================================================
export const heroSessionsTable = pgTable('hero_sessions', {
  id: text('id').primaryKey(), // session-{uuid}
  
  // Session identification
  hero_id: text('hero_id').notNull(), // References hero_catalog.id
  story_id: text('story_id'), // References story_catalog.id (optional)
  user_email: text('user_email').notNull(), // User interacting
  
  // Session configuration
  system_prompt: text('system_prompt').notNull(), // Active prompt for this session
  session_type: text('session_type').notNull(), // 'story', 'free_chat', 'guided', 'operator_override'
  
  // Session state
  status: text('status').notNull().default('active'), // 'active', 'completed', 'abandoned', 'error'
  started_at: timestamp('started_at').defaultNow().notNull(),
  ended_at: timestamp('ended_at'),
  
  // Interaction tracking
  message_count: integer('message_count').default(0),
  total_tokens_used: integer('total_tokens_used').default(0),
  
  // Conversation history
  messages: jsonb('messages').$type<Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: string;
    tokens?: number;
  }>>().default([]),
  
  // Session metadata
  metadata: jsonb('metadata').$type<{
    page_context?: string; // Where session was initiated
    device_type?: string;
    user_rating?: number; // 1-5 stars
    user_feedback?: string;
    completion_percentage?: number;
    [key: string]: any;
  }>(),
  
  // Operator management
  launched_by_operator: text('launched_by_operator'), // Operator email if operator-launched
  is_operator_session: boolean('is_operator_session').default(false),
  
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export type InsertHeroSession = typeof heroSessionsTable.$inferInsert;
export type SelectHeroSession = typeof heroSessionsTable.$inferSelect;

// ============================================================================
// Hero Analytics Table
// ============================================================================
export const heroAnalyticsTable = pgTable('hero_analytics', {
  id: text('id').primaryKey(), // analytics-{uuid}
  
  // Event identification
  hero_id: text('hero_id').notNull(),
  story_id: text('story_id'),
  session_id: text('session_id'),
  user_email: text('user_email').notNull(),
  
  // Event details
  event_type: text('event_type').notNull(), // 'hero_viewed', 'story_started', 'message_sent', 'session_completed', 'rating_given'
  event_data: jsonb('event_data').$type<{
    page_context?: string;
    interaction_duration_seconds?: number;
    user_rating?: number;
    completion_status?: string;
    [key: string]: any;
  }>(),
  
  // Timing
  event_timestamp: timestamp('event_timestamp').defaultNow().notNull(),
  
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export type InsertHeroAnalytics = typeof heroAnalyticsTable.$inferInsert;
export type SelectHeroAnalytics = typeof heroAnalyticsTable.$inferSelect;

// ============================================================================
// AI Prompt Templates Table (Creator Tool)
// ============================================================================
export const aiPromptTemplatesTable = pgTable('ai_prompt_templates', {
  id: text('id').primaryKey(), // template-{uuid}
  
  name: text('name').notNull(),
  description: text('description'),
  category: text('category').notNull(), // 'hero_base', 'story_guide', 'interaction_style', 'domain_expert'
  
  // Template content
  template_prompt: text('template_prompt').notNull(),
  variables: jsonb('variables').$type<Array<{
    name: string;
    description: string;
    default_value?: string;
    required: boolean;
  }>>(),
  
  // AI-assisted generation metadata
  generated_by_ai: boolean('generated_by_ai').default(false),
  ai_generation_prompt: text('ai_generation_prompt'), // Prompt used to generate this template
  
  // Usage tracking
  times_used: integer('times_used').default(0),
  
  // Creator information
  created_by: text('created_by').notNull(),
  is_public: boolean('is_public').default(false), // Available to all creators
  
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export type InsertPromptTemplate = typeof aiPromptTemplatesTable.$inferInsert;
export type SelectPromptTemplate = typeof aiPromptTemplatesTable.$inferSelect;

// ============================================================================
// Export all tables for migration
// ============================================================================
export const heroSystemTables = {
  heroCatalog: heroCatalogTable,
  storyCatalog: storyCatalogTable,
  heroSessions: heroSessionsTable,
  heroAnalytics: heroAnalyticsTable,
  aiPromptTemplates: aiPromptTemplatesTable,
};

