import Anthropic from '@anthropic-ai/sdk';
import type { CastlyProfile, CastlyCasting } from '@/types';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface MatchResult {
  score: number;
  reasons: string[];
  blockers: string[];
}

export async function scoreMatch(profile: CastlyProfile, casting: CastlyCasting): Promise<MatchResult> {
  const prompt = `Tu es un expert casting. Évalue la compatibilité entre ce profil artiste et cette offre de casting.

## PROFIL ARTISTE
- Nom : ${profile.display_name}
- Types : ${profile.artist_type.join(', ')}
- Genre : ${profile.gender ?? 'non précisé'}
- Année de naissance : ${profile.birth_year ?? 'non précisé'}
- Ville : ${profile.city ?? 'non précisé'}
- Compétences : ${profile.skills.join(', ') || 'aucune précisée'}
- Langues : ${profile.languages.join(', ')}
- Expérience : ${profile.experience_years} ans
- Taille : ${profile.height_cm ? profile.height_cm + ' cm' : 'non précisé'}
- Morphologie : ${[profile.eye_color, profile.hair_color, profile.skin_tone].filter(Boolean).join(', ') || 'non précisé'}
- Bio : ${profile.bio ?? 'non précisée'}

## CASTING
- Titre : ${casting.title}
- Description : ${casting.description ?? 'non précisée'}
- Production : ${casting.production_name ?? 'non précisée'}
- Types recherchés : ${casting.casting_type.join(', ')}
- Genre requis : ${casting.required_gender ?? 'tous'}
- Âge : ${casting.age_min ?? '?'}–${casting.age_max ?? '?'} ans
- Compétences requises : ${casting.required_skills.join(', ') || 'aucune'}
- Localisation : ${casting.location ?? 'non précisée'}
- Rémunéré : ${casting.is_paid ? 'oui — ' + (casting.compensation_details ?? '') : 'non précisé'}

Réponds UNIQUEMENT en JSON valide, sans texte autour :
{
  "score": <nombre entre 0 et 100>,
  "reasons": ["<raison 1 courte>", "<raison 2>", "<raison 3 max>"],
  "blockers": ["<frein 1 si applicable>", "<frein 2 si applicable>"]
}

Critères de score :
- 80–100 : profil idéal, correspond à tous les critères clés
- 60–79 : bon match, 1–2 points moins parfaits
- 40–59 : match partiel, mérite d'être vu
- 20–39 : match faible, critères importants manquants
- 0–19 : incompatible`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const json = JSON.parse(text.trim());
    return {
      score: Math.min(100, Math.max(0, Math.round(json.score))),
      reasons: (json.reasons ?? []).slice(0, 3),
      blockers: (json.blockers ?? []).slice(0, 3),
    };
  } catch {
    return { score: 50, reasons: ['Profil compatible avec ce type de casting'], blockers: [] };
  }
}

export async function batchMatchProfile(
  profile: CastlyProfile,
  castings: CastlyCasting[]
): Promise<Array<MatchResult & { casting_id: string }>> {
  const results = await Promise.all(
    castings.map(async (casting) => {
      const result = await scoreMatch(profile, casting);
      return { ...result, casting_id: casting.id };
    })
  );
  return results.sort((a, b) => b.score - a.score);
}
