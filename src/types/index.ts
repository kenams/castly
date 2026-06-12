export type ArtistType =
  | 'actor' | 'singer' | 'rapper' | 'dancer' | 'model'
  | 'musician' | 'comedian' | 'presenter' | 'voice_actor' | 'other';

export type Gender = 'male' | 'female' | 'non_binary' | 'prefer_not_to_say';
export type CastingStatus = 'open' | 'closed' | 'upcoming';
export type MatchStatus = 'new' | 'saved' | 'applied' | 'dismissed';
export type SubscriptionTier = 'free' | 'pro';

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

export const GENDER_LABELS: Record<Gender, string> = {
  male: 'Homme',
  female: 'Femme',
  non_binary: 'Non binaire',
  prefer_not_to_say: 'Préfère ne pas préciser',
};

export interface CastlyProfile {
  id: string;
  user_id: string;
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
  created_at: string;
  updated_at: string;
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
