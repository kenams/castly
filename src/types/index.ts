export type ArtistType =
  | 'actor' | 'singer' | 'rapper' | 'dancer' | 'model'
  | 'musician' | 'comedian' | 'presenter' | 'voice_actor' | 'other';

export type Gender = 'male' | 'female' | 'non_binary' | 'prefer_not_to_say';
export type CastingStatus = 'open' | 'closed' | 'upcoming';
export type MatchStatus = 'new' | 'saved' | 'applied' | 'dismissed';
export type SubscriptionTier = 'free' | 'pro';
export type UserRole = 'artist' | 'recruiter';
export type RecruiterType = 'casting_agency' | 'production' | 'brand' | 'music_label' | 'event' | 'other';
export type ProjectType = 'film' | 'series' | 'commercial' | 'music' | 'event' | 'photo' | 'voice' | 'other';
export type BriefMatchStatus = 'new' | 'shortlisted' | 'contacted' | 'dismissed';

export const ARTIST_TYPE_LABELS: Record<ArtistType, string> = {
  actor: 'Acteur / Actrice',
  singer: 'Chanteur / Chanteuse',
  rapper: 'Rappeur / Rappeuse',
  dancer: 'Danseur / Danseuse',
  model: 'Mannequin',
  musician: 'Musicien / Musicienne',
  comedian: 'Humoriste / Comédien',
  presenter: 'Présentateur / Présentatrice',
  voice_actor: 'Comédien voix / Doublage',
  other: 'Autre',
};

export const ARTIST_TYPE_ICONS: Record<ArtistType, string> = {
  actor: '🎬',
  singer: '🎤',
  rapper: '🎤',
  dancer: '💃',
  model: '📸',
  musician: '🎸',
  comedian: '😄',
  presenter: '📺',
  voice_actor: '🎙️',
  other: '🎭',
};

export const GENDER_LABELS: Record<Gender, string> = {
  male: 'Homme',
  female: 'Femme',
  non_binary: 'Non binaire',
  prefer_not_to_say: 'Préfère ne pas préciser',
};

export const RECRUITER_TYPE_LABELS: Record<RecruiterType, string> = {
  casting_agency: 'Agence de casting',
  production: 'Société de production',
  brand: 'Marque / Annonceur',
  music_label: 'Label musical',
  event: 'Organisateur événement',
  other: 'Autre',
};

export const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  film: 'Film / Court-métrage',
  series: 'Série / Web-série',
  commercial: 'Publicité / Spot',
  music: 'Clip / Featuring / Placement',
  event: 'Événement / Concert',
  photo: 'Shooting photo',
  voice: 'Doublage / Voix off',
  other: 'Autre',
};

export const PROJECT_TYPE_ICONS: Record<ProjectType, string> = {
  film: '🎬',
  series: '📺',
  commercial: '📢',
  music: '🎵',
  event: '🎪',
  photo: '📸',
  voice: '🎙️',
  other: '🎭',
};

// Style tags per artist type (for musicians/rappers/dancers)
export const STYLE_TAG_SUGGESTIONS: Partial<Record<ArtistType, string[]>> = {
  rapper: ['Trap', 'Drill', 'Conscient', 'Lyrical', 'Cloud', 'Boom-bap', 'Afro-trap', 'Gangsta', 'Festif', 'Introspectif'],
  singer: ['R&B', 'Soul', 'Pop', 'Gospel', 'Jazz', 'Variété', 'Afrobeat', 'Reggae', 'Electro', 'Classique'],
  musician: ['Hip-hop', 'Jazz', 'Classique', 'Électronique', 'Rock', 'Funk', 'World', 'Ambient'],
  dancer: ['Hip-hop', 'Contemporary', 'Ballet', 'Salsa', 'Waacking', 'Krump', 'Breaking', 'Popping', 'Afro', 'Voguing'],
  model: ['Editorial', 'Commercial', 'Haute couture', 'Sportswear', 'Lingerie', 'Catalogue', 'Runway'],
};

export interface CastlyProfile {
  id: string;
  user_id: string;
  role: UserRole;
  display_name: string;
  artist_type: ArtistType[];
  gender?: Gender;
  birth_year?: number;
  city?: string;
  country: string;
  height_cm?: number;
  weight_kg?: number;
  eye_color?: string;
  hair_color?: string;
  skin_tone?: string;
  clothing_size?: string;
  shoe_size?: string;
  bio?: string;
  skills: string[];
  languages: string[];
  experience_years: number;
  has_agent: boolean;
  avatar_url?: string;
  portfolio_urls: string[];
  demo_reel_url?: string;
  subscription_tier: SubscriptionTier;
  is_complete: boolean;
  is_visible: boolean;
  style_tags: string[];
  social_links: {
    instagram?: string;
    tiktok?: string;
    spotify?: string;
    soundcloud?: string;
    youtube?: string;
    website?: string;
  };
  hourly_rate_eur?: number;
  day_rate_eur?: number;
  created_at: string;
  updated_at: string;
}

export interface CastlyRecruiter {
  id: string;
  user_id: string;
  company_name: string;
  recruiter_type: RecruiterType;
  description?: string;
  website?: string;
  contact_email?: string;
  city?: string;
  verified: boolean;
  logo_url?: string;
  subscription_tier: SubscriptionTier;
  created_at: string;
  updated_at: string;
}

export interface CastlyBrief {
  id: string;
  recruiter_id: string;
  title: string;
  description?: string;
  project_type: ProjectType;
  artist_types: ArtistType[];
  required_skills: string[];
  style_tags: string[];
  required_gender?: 'male' | 'female' | 'any';
  age_min?: number;
  age_max?: number;
  location?: string;
  is_remote: boolean;
  budget_range?: string;
  deadline_at?: string;
  shoot_date?: string;
  status: 'open' | 'closed' | 'draft';
  is_featured: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
  recruiter?: CastlyRecruiter;
}

export interface CastlyBriefMatch {
  id: string;
  brief_id: string;
  profile_id: string;
  match_score: number;
  match_reasons: string[];
  match_blockers: string[];
  status: BriefMatchStatus;
  created_at: string;
  profile?: CastlyProfile;
  brief?: CastlyBrief;
}

export interface CastlyCasting {
  id: string;
  source_name: string;
  source_url?: string;
  external_id?: string;
  title: string;
  description?: string;
  production_name?: string;
  casting_type: ArtistType[];
  required_gender?: Gender;
  age_min?: number;
  age_max?: number;
  required_skills: string[];
  required_languages: string[];
  location?: string;
  is_paid?: boolean;
  compensation_details?: string;
  deadline_at?: string;
  shoot_date?: string;
  status: CastingStatus;
  is_featured: boolean;
  view_count: number;
  scraped_at: string;
  created_at: string;
}

export interface CastlyMatch {
  id: string;
  profile_id: string;
  casting_id: string;
  match_score: number;
  match_reasons: string[];
  match_blockers: string[];
  status: MatchStatus;
  created_at: string;
  casting?: CastlyCasting;
}
