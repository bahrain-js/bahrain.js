/**
 * Shared type definitions for the Bahrain.js community platform.
 *
 * These types mirror the Neon Postgres schema and are used across
 * composables, pages, and components to ensure type safety.
 */

// ─── Auth ────────────────────────────────────────────────────────
export interface AuthUser {
  id: string
  name: string
  email: string
  image: string
  username?: string
  createdAt: string
}

export interface AuthSession {
  id: string
  userId: string
  expiresAt: string
}

// ─── Members ─────────────────────────────────────────────────────
export type MemberRole = 'core' | 'maintainer' | 'contributor' | 'member'

export interface Member {
  id: string
  user_id: string
  display_name: string
  github_username: string
  avatar_url: string
  bio: string | null
  role: MemberRole
  skills: string[]
  favorite_frameworks: string[]
  website: string | null
  website_url: string | null
  twitter_handle: string | null
  currently_building: string | null
  created_at: string
  updated_at: string
}

// ─── Events ──────────────────────────────────────────────────────
export type EventType = 'meetup' | 'builder-session' | 'hackathon' | 'coffee-and-code'
export type EventFormat = 'in-person' | 'virtual' | 'hybrid'
export type EventStatus = 'pending' | 'approved' | 'rejected' | 'draft'

export interface CommunityEvent {
  id: string
  title: string
  description: string
  details: string | null
  date: string
  location: string | null
  type: EventType
  format: EventFormat
  status: EventStatus
  speakers: string[]
  submitted_by: string | null
  reviewed_by: string | null
  created_at: string
  updated_at: string
  /** Populated by admin data enrichment */
  submitter?: Pick<Member, 'user_id' | 'display_name' | 'github_username'> | null
}

export interface EventRsvp {
  id: string
  event_id: number
  user_id: string
  created_at: string
}

export interface EventRsvpWithMember extends EventRsvp {
  member: Pick<Member, 'user_id' | 'display_name' | 'avatar_url' | 'github_username'> | null
}

// ─── Projects ────────────────────────────────────────────────────
export type ProjectStage = 'idea' | 'prototype' | 'repo' | 'package'

export interface Project {
  id: string
  name: string
  slug: string
  description: string
  stack: string[]
  stars: number
  stage: ProjectStage
  featured: boolean
  start_here: boolean
  npm_package: string | null
  url: string
  status: string
  created_at: string
  updated_at: string
}

// ─── Opportunities ───────────────────────────────────────────────
export interface JobListing {
  id: string
  title: string
  company: string | null
  description: string | null
  location: string | null
  url: string | null
  salary_range: string | null
  is_remote: boolean
  tags: string[]
  status: string
  submitted_by: string | null
  created_at: string
}

export interface OssOpportunity {
  id: string
  project_name: string
  description: string | null
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  issues_label: string | null
  url: string | null
  tags: string[]
  status: string
  created_at: string
}

export interface StartupIdea {
  id: string
  title: string
  problem: string | null
  description: string | null
  sector: string | null
  looking_for: string
  contact_url: string
  tags: string[]
  status: string
  submitted_by: string | null
  created_at: string
}

// ─── UI Helpers ──────────────────────────────────────────────────
export interface GitHubRepo {
  name: string
  fullName: string
  description: string
  stars: number
  forks: number
  language: string | null
  url: string
  homepage: string | null
  topics: string[]
  updatedAt: string
  openIssues: number
}

// ─── Constants ───────────────────────────────────────────────────
export const ROLE_OPTIONS: { label: string, value: MemberRole }[] = [
  { label: 'Member', value: 'member' },
  { label: 'Contributor', value: 'contributor' },
  { label: 'Maintainer', value: 'maintainer' },
  { label: 'Core Team', value: 'core' }
]

export const ROLE_BADGE_COLOR: Record<MemberRole, 'primary' | 'success' | 'info' | 'neutral'> = {
  core: 'primary',
  maintainer: 'success',
  contributor: 'info',
  member: 'neutral'
}

export const STATUS_BADGE_COLOR: Record<string, 'warning' | 'success' | 'error' | 'neutral'> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
  draft: 'neutral'
}
