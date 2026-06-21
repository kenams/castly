"""
Prospection Castly — invitations email via Brevo API REST
- Artistes  → invitation créer profil sur castly.kah-digital.ch
- Agences   → invitation poster leurs castings sur castly.kah-digital.ch
Envoi : 20/jour (10 artistes + 10 agences)
"""
import os, csv, time, json, urllib.request
from datetime import datetime, timezone
from pathlib import Path

BREVO_API_KEY = os.environ.get("BREVO_API_KEY", "")
FROM_EMAIL = "contact@kah-digital.ch"
FROM_NAME  = "Kenams — Castly"

APP_URL    = "https://castly.kah-digital.ch"
MAX_PER_RUN = 20

ARTISTS_CSV  = Path(__file__).parent / "artists.csv"
AGENCIES_CSV = Path(__file__).parent / "agencies.csv"
SENT_LOG     = Path(__file__).parent / "sent.csv"


# ── Email artiste ────────────────────────────────────────────────────────────
def email_artiste(nom: str, specialite: str) -> tuple[str, str, str]:
    prenom = nom.split()[0].capitalize()
    metier = specialite or "artiste"
    subject = f"{prenom}, tes opportunités casting en un seul endroit"
    html = f"""<html><body style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#111;">
<p>Bonjour {prenom},</p>
<p>J'ai créé <strong>Castly</strong> pour que les {metier}s comme toi accèdent directement aux casting calls
des agences, maisons de prod et marques — sans passer par des intermédiaires.</p>
<p>Tu crées ton profil en 5 minutes, tu mets en avant ta spécialité, et les recruteurs te contactent directement.</p>
<p><strong>C'est gratuit pour les artistes.</strong></p>
<p><a href="{APP_URL}/auth?role=artist" style="background:#111;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;margin:12px 0;">Créer mon profil Castly →</a></p>
<p>Des questions ? Réponds directement à cet email.</p>
<p>Kenams<br><strong>Castly</strong> — <a href="{APP_URL}">{APP_URL}</a></p>
<hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
<p style="font-size:11px;color:#999;"><a href="mailto:{FROM_EMAIL}?subject=Desabonnement">Me désabonner</a></p>
</body></html>"""
    text = f"""Bonjour {prenom},

J'ai créé Castly pour que les {metier}s accèdent directement aux castings sans intermédiaires.

Profil gratuit en 5 min → les recruteurs te contactent directement.

{APP_URL}/auth?role=artist

Des questions ? Réponds à cet email.

Kenams — Castly
{APP_URL}"""
    return subject, html, text


# ── Email agence ─────────────────────────────────────────────────────────────
def email_agence(nom: str) -> tuple[str, str, str]:
    subject = f"{nom} — publiez vos castings, accédez à 500+ profils vérifiés"
    html = f"""<html><body style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#111;">
<p>Bonjour,</p>
<p>Je me permets de vous contacter au sujet de <strong>Castly</strong>, une plateforme dédiée
aux professionnels du casting en France.</p>
<p>En quelques clics, vous pouvez :</p>
<ul>
  <li>Publier un brief de casting ciblé (comédien, mannequin, danseur...)</li>
  <li>Accéder à une base de profils vérifiés et filtrable par spécialité, ville, âge</li>
  <li>Gérer vos candidatures directement sur la plateforme</li>
</ul>
<p>Premier casting <strong>offert</strong> — sans engagement.</p>
<p><a href="{APP_URL}/auth?role=recruiter" style="background:#111;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;margin:12px 0;">Publier un casting →</a></p>
<p>Je suis disponible pour un appel de 15 minutes si vous souhaitez une démo.</p>
<p>Kenams<br><strong>Castly</strong> — <a href="{APP_URL}">{APP_URL}</a></p>
<hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
<p style="font-size:11px;color:#999;"><a href="mailto:{FROM_EMAIL}?subject=Desabonnement">Me désabonner</a></p>
</body></html>"""
    text = f"""Bonjour,

Castly est une plateforme dédiée aux professionnels du casting en France.

- Publier un brief ciblé (comédien, mannequin, danseur...)
- Accéder à des profils vérifiés, filtrables
- Gérer vos candidatures en ligne

Premier casting offert — sans engagement.

{APP_URL}/auth?role=recruiter

Disponible pour un appel de 15 min si vous voulez une démo.

Kenams — Castly
{APP_URL}"""
    return subject, html, text


# ── Envoi via Brevo API REST ─────────────────────────────────────────────────
def send(to_email: str, to_name: str, subject: str, html: str, text: str) -> bool:
    if not BREVO_API_KEY:
        print(f"  [DRY] {to_email} — {subject[:50]}")
        return True
    try:
        payload = json.dumps({
            "sender": {"name": FROM_NAME, "email": FROM_EMAIL},
            "to": [{"email": to_email, "name": to_name}],
            "replyTo": {"email": FROM_EMAIL},
            "subject": subject,
            "htmlContent": html,
            "textContent": text,
        }).encode()
        req = urllib.request.Request(
            "https://api.brevo.com/v3/smtp/email",
            data=payload,
            headers={
                "api-key": BREVO_API_KEY,
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            method="POST"
        )
        urllib.request.urlopen(req)
        return True
    except Exception as e:
        print(f"  ERR {to_email}: {e}")
        return False


# ── Load + filtre déjà envoyés ───────────────────────────────────────────────
def load_sent() -> set[str]:
    if not SENT_LOG.exists():
        return set()
    with open(SENT_LOG, encoding="utf-8") as f:
        return {r["email"] for r in csv.DictReader(f) if r.get("email")}

def mark_sent(email: str, type_: str):
    mode = "a" if SENT_LOG.exists() else "w"
    with open(SENT_LOG, mode, newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=["email", "type", "sent_at"])
        if mode == "w":
            w.writeheader()
        w.writerow({"email": email, "type": type_, "sent_at": datetime.now(timezone.utc).isoformat()})

def load_csv(path: Path) -> list[dict]:
    if not path.exists():
        return []
    with open(path, encoding="utf-8") as f:
        return list(csv.DictReader(f))


# ── Main ─────────────────────────────────────────────────────────────────────
def run():
    print(f"[Castly Prospection] {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}")

    sent = load_sent()
    artists  = [r for r in load_csv(ARTISTS_CSV)  if r.get("email") and r["email"] not in sent]
    agencies = [r for r in load_csv(AGENCIES_CSV) if r.get("email") and r["email"] not in sent]

    print(f"  Artistes disponibles  : {len(artists)}")
    print(f"  Agences disponibles   : {len(agencies)}")

    quota_art = MAX_PER_RUN // 2
    quota_agc = MAX_PER_RUN - quota_art

    sent_count = failed = 0

    for lead in artists[:quota_art]:
        nom  = lead.get("nom", "")
        email = lead["email"].strip()
        subject, html, text = email_artiste(nom, lead.get("specialite", "artiste"))
        ok = send(email, nom, subject, html, text)
        print(f"  [{'OK' if ok else 'KO'}] ARTISTE {nom[:25]:<25} {email}")
        if ok:
            mark_sent(email, "artist")
            sent_count += 1
        else:
            failed += 1
        time.sleep(1.2)

    for lead in agencies[:quota_agc]:
        nom   = lead.get("nom", "")
        email = lead["email"].strip()
        subject, html, text = email_agence(nom)
        ok = send(email, nom, subject, html, text)
        print(f"  [{'OK' if ok else 'KO'}] AGENCE  {nom[:25]:<25} {email}")
        if ok:
            mark_sent(email, "agency")
            sent_count += 1
        else:
            failed += 1
        time.sleep(1.2)

    print(f"\n  {sent_count} envoyés / {failed} échecs")


if __name__ == "__main__":
    run()
