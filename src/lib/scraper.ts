// Scraper de castings — sources publiques françaises
// Tourne via GitHub Actions 2x/jour

export interface ScrapedCasting {
  source_name: string;
  source_url: string;
  external_id: string;
  title: string;
  description: string;
  location?: string;
  casting_type: string[];
  age_min?: number;
  age_max?: number;
  required_gender?: string;
  deadline_at?: string;
  is_paid?: boolean;
  compensation_details?: string;
}

// Parse les critères d'âge depuis du texte libre
export function parseAgeFromText(text: string): { min?: number; max?: number } {
  const rangeMatch = text.match(/(\d{1,2})\s*[-à]\s*(\d{1,2})\s*ans/i);
  if (rangeMatch) return { min: parseInt(rangeMatch[1]), max: parseInt(rangeMatch[2]) };
  const minMatch = text.match(/(\+\s*(\d{1,2})|(\d{1,2})\s*ans?\s*et?\s*plus)/i);
  if (minMatch) return { min: parseInt(minMatch[2] ?? minMatch[3]) };
  const exactMatch = text.match(/(\d{1,2})\s*ans/i);
  if (exactMatch) return { min: parseInt(exactMatch[1]), max: parseInt(exactMatch[1]) };
  return {};
}

// Détecte le genre depuis du texte
export function parseGenderFromText(text: string): string | undefined {
  const lower = text.toLowerCase();
  if (/\bfemme\b|\bféminin\b|\bactrice\b|\bchanteuse\b|\bdanseuse\b|\bmannequin\s+femme/.test(lower)) return 'female';
  if (/\bhomme\b|\bmasculin\b|\bacteur\b|\bchanteur\b|\bdanseur\b|\bmannequin\s+homme/.test(lower)) return 'male';
  return undefined;
}

// Détecte les types artistiques depuis du texte
export function parseArtistTypes(text: string): string[] {
  const lower = text.toLowerCase();
  const types: string[] = [];
  if (/acteur|actrice|comédien|comédie|court[\s-]métrage|film|série|téléfilm/.test(lower)) types.push('actor');
  if (/chanteur|chanteuse|chant|musical|comédie musicale/.test(lower)) types.push('singer');
  if (/rappeur|rappeuse|rap|hip[\s-]hop|freestyle/.test(lower)) types.push('rapper');
  if (/danseur|danseuse|danse|chorégraphie|ballet/.test(lower)) types.push('dancer');
  if (/mannequin|modèle|défilé|mode|photo/.test(lower)) types.push('model');
  if (/musicien|musicienne|instrument|groupe|band/.test(lower)) types.push('musician');
  if (/comique|humoriste|stand[\s-]up|one[\s-]man/.test(lower)) types.push('comedian');
  if (/présentateur|présentatrice|animateur|animatrice|tv|télévision/.test(lower)) types.push('presenter');
  if (/voix|doublage|narration|voice[\s-]over|podcast/.test(lower)) types.push('voice_actor');
  return types.length > 0 ? types : ['actor'];
}

// Génère des castings de démonstration pour le MVP
export function generateDemoCastings(): ScrapedCasting[] {
  return [
    {
      source_name: 'demo',
      source_url: 'https://castly.fr',
      external_id: 'demo-001',
      title: 'Recherche acteurs 20–35 ans pour court-métrage dramatique',
      description: 'Production indépendante cherche 3 acteurs (H/F) pour un court-métrage de 15 minutes. Tournage prévu à Paris en juillet 2026. Thème : rupture et reconstruction. Expérience souhaitée mais non obligatoire.',
      location: 'Paris',
      casting_type: ['actor'],
      age_min: 20,
      age_max: 35,
      is_paid: true,
      compensation_details: 'Défraiement transport + repas',
      deadline_at: new Date(Date.now() + 15 * 86400000).toISOString(),
    },
    {
      source_name: 'demo',
      source_url: 'https://castly.fr',
      external_id: 'demo-002',
      title: 'Mannequin femme 18–28 ans — campagne publicitaire mode',
      description: 'Agence parisienne cherche mannequin féminin pour campagne lookbook printemps-été 2027. Taille 36–40, grande silhouette souhaitée. Shooting sur 2 jours à Paris.',
      location: 'Paris',
      casting_type: ['model'],
      required_gender: 'female',
      age_min: 18,
      age_max: 28,
      is_paid: true,
      compensation_details: '500€/jour',
      deadline_at: new Date(Date.now() + 10 * 86400000).toISOString(),
    },
    {
      source_name: 'demo',
      source_url: 'https://castly.fr',
      external_id: 'demo-003',
      title: 'Chanteur/Chanteuse pour groupe pop-rock — Lyon',
      description: 'Groupe pop-rock établi depuis 3 ans cherche chanteur ou chanteuse pour compléter sa formation. Style : Indochine, The Weeknd, Angèle. Répétitions hebdomadaires, scènes régionales.',
      location: 'Lyon',
      casting_type: ['singer'],
      age_min: 18,
      age_max: 40,
      is_paid: false,
      deadline_at: new Date(Date.now() + 30 * 86400000).toISOString(),
    },
    {
      source_name: 'demo',
      source_url: 'https://castly.fr',
      external_id: 'demo-004',
      title: 'Rappeur pour feat sur album hip-hop — Paris',
      description: 'Artiste signé en label indé cherche rappeur pour collaboration sur 2–3 titres. Style trap/conscious rap. Maîtrise du flow et de l\'écriture indispensable. Studio en région parisienne.',
      location: 'Paris',
      casting_type: ['rapper'],
      age_min: 18,
      age_max: 35,
      is_paid: true,
      compensation_details: 'Partage des royalties + session fee 200€',
      deadline_at: new Date(Date.now() + 20 * 86400000).toISOString(),
    },
    {
      source_name: 'demo',
      source_url: 'https://castly.fr',
      external_id: 'demo-005',
      title: 'Danseur/Danseuse — clip vidéo artiste pop',
      description: 'Clip vidéo pour artiste pop avec 600K abonnés. Cherche 4 danseurs (H/F) pour chorégraphie urbaine/contemporaine. Tournage 1 journée en studio à Marseille. Cachet garanti.',
      location: 'Marseille',
      casting_type: ['dancer'],
      age_min: 18,
      age_max: 30,
      is_paid: true,
      compensation_details: '300€/jour + transport',
      deadline_at: new Date(Date.now() + 7 * 86400000).toISOString(),
    },
    {
      source_name: 'demo',
      source_url: 'https://castly.fr',
      external_id: 'demo-006',
      title: 'Comédien voix — narration documentaire animalier',
      description: 'Production documentaire cherche voix masculine ou féminine chaleureuse pour narration d\'un documentaire animalier (52 min). Voix grave ou médium souhaitée. Session studio à Paris.',
      location: 'Paris',
      casting_type: ['voice_actor'],
      is_paid: true,
      compensation_details: 'Tarif syndicat SPEDIDAM',
      deadline_at: new Date(Date.now() + 25 * 86400000).toISOString(),
    },
    {
      source_name: 'demo',
      source_url: 'https://castly.fr',
      external_id: 'demo-007',
      title: 'Acteur 40–60 ans — série policière Netflix France',
      description: 'Casting pour rôle secondaire récurrent dans une série policière de 8 épisodes. Personnage : inspecteur expérimenté, look authentique. Tournage Île-de-France, 3 semaines.',
      location: 'Île-de-France',
      casting_type: ['actor'],
      required_gender: 'male',
      age_min: 40,
      age_max: 60,
      is_paid: true,
      compensation_details: 'Cachet convention collective audiovisuelle',
      deadline_at: new Date(Date.now() + 14 * 86400000).toISOString(),
    },
    {
      source_name: 'demo',
      source_url: 'https://castly.fr',
      external_id: 'demo-008',
      title: 'Présentatrice web TV — chaîne lifestyle beauté',
      description: 'Chaîne YouTube 200K abonnés cherche présentatrice dynamique pour formats courts (3–5 min). Sujets : beauté, mode, lifestyle. Tournage hebdomadaire à domicile possible.',
      location: 'France (télétravail possible)',
      casting_type: ['presenter'],
      required_gender: 'female',
      age_min: 20,
      age_max: 40,
      is_paid: true,
      compensation_details: '150€/épisode',
      deadline_at: new Date(Date.now() + 21 * 86400000).toISOString(),
    },
  ];
}
