"""
Scraper artistes / comédiens / mannequins
Sources : casting.fr (profils publics), StarNow, annuaires publics
Output  : artists.csv (nom, email, specialite, ville, profil_url)
"""
import csv, time, re
from pathlib import Path
from playwright.sync_api import sync_playwright

OUT = Path(__file__).parent / "artists.csv"
FIELDS = ["nom", "email", "specialite", "ville", "profil_url", "source"]

CASTING_FR_CATEGORIES = [
    "https://www.casting.fr/artistes/comediens",
    "https://www.casting.fr/artistes/mannequins",
    "https://www.casting.fr/artistes/figurants",
    "https://www.casting.fr/artistes/danseurs",
    "https://www.casting.fr/artistes/chanteurs",
]

def extract_email(text: str) -> str:
    m = re.search(r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}", text)
    return m.group(0) if m else ""

def scrape_casting_fr(page) -> list[dict]:
    results = []

    for cat_url in CASTING_FR_CATEGORIES:
        specialite = cat_url.split("/")[-1].rstrip("s")  # comedien, mannequin...
        print(f"\n→ casting.fr : {specialite}")

        try:
            page.goto(cat_url, wait_until="domcontentloaded", timeout=20000)
            time.sleep(2)

            # Accepter cookies
            try:
                page.click("button:has-text('Accepter')", timeout=3000)
                time.sleep(1)
            except Exception:
                pass

            # Récupérer les profils sur 3 pages
            for page_num in range(1, 4):
                if page_num > 1:
                    try:
                        next_btn = page.locator("a:has-text('Suivant'), a[rel='next']").first
                        if next_btn.count():
                            next_btn.click()
                            time.sleep(2)
                        else:
                            break
                    except Exception:
                        break

                profile_links = page.locator("a[href*='/artiste/']").all()
                print(f"  Page {page_num}: {len(profile_links)} profils")

                for link in profile_links[:20]:
                    try:
                        href = link.get_attribute("href") or ""
                        name = link.inner_text(timeout=1000).strip()
                        if not href or not name or len(name) < 2:
                            continue

                        full_url = f"https://www.casting.fr{href}" if href.startswith("/") else href

                        # Ouvrir profil pour récupérer ville + email
                        page.goto(full_url, wait_until="domcontentloaded", timeout=15000)
                        time.sleep(1.5)

                        profile_text = page.locator("body").inner_text(timeout=3000)
                        email = extract_email(profile_text)

                        ville = ""
                        try:
                            ville_el = page.locator("span[itemprop='addressLocality'], .ville, .location").first
                            if ville_el.count():
                                ville = ville_el.inner_text(timeout=1000).strip()
                        except Exception:
                            pass

                        results.append({
                            "nom": name,
                            "email": email,
                            "specialite": specialite,
                            "ville": ville,
                            "profil_url": full_url,
                            "source": "casting.fr"
                        })
                        print(f"    ✓ {name[:30]} | {ville} | {email or '-'}")

                        # Revenir à la liste
                        page.go_back()
                        time.sleep(1)
                    except Exception as e:
                        print(f"    ! {e}")
                        try:
                            page.goto(cat_url, wait_until="domcontentloaded", timeout=15000)
                            time.sleep(1)
                        except Exception:
                            pass
                        continue

        except Exception as e:
            print(f"  Erreur {cat_url}: {e}")
        time.sleep(2)

    return results


def scrape_startnow(page) -> list[dict]:
    results = []
    categories = ["actor", "model", "dancer", "singer"]

    for cat in categories:
        url = f"https://www.startnow.com/talent/?q={cat}&country=FR"
        print(f"\n→ StarNow: {cat} / France")
        try:
            page.goto(url, wait_until="domcontentloaded", timeout=20000)
            time.sleep(2)

            try:
                page.click("button:has-text('Accept')", timeout=3000)
                time.sleep(1)
            except Exception:
                pass

            cards = page.locator(".talent-card, .profile-card, article").all()
            print(f"  {len(cards)} profils")

            for card in cards[:15]:
                try:
                    name = card.locator("h2, h3, .name, .talent-name").first.inner_text(timeout=1000).strip()
                    href = card.locator("a").first.get_attribute("href") or ""
                    full_url = f"https://www.startnow.com{href}" if href.startswith("/") else href

                    results.append({
                        "nom": name,
                        "email": "",
                        "specialite": cat,
                        "ville": "France",
                        "profil_url": full_url,
                        "source": "startnow"
                    })
                    print(f"    ✓ {name[:30]}")
                except Exception:
                    continue
        except Exception as e:
            print(f"  Erreur: {e}")
        time.sleep(2)

    return results


def run():
    existing = set()
    if OUT.exists():
        with open(OUT, encoding="utf-8") as f:
            existing = {r["nom"] for r in csv.DictReader(f)}
        print(f"{len(existing)} artistes déjà en base")

    all_results = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            viewport={"width": 1280, "height": 900},
            locale="fr-FR"
        )
        page = context.new_page()

        print("=== Scraping casting.fr ===")
        all_results.extend(scrape_casting_fr(page))

        print("\n=== Scraping StarNow ===")
        all_results.extend(scrape_startnow(page))

        browser.close()

    # Déduplication
    seen = set(existing)
    new_results = []
    for r in all_results:
        if r["nom"] and r["nom"] not in seen:
            seen.add(r["nom"])
            new_results.append(r)

    mode = "a" if OUT.exists() else "w"
    with open(OUT, mode, newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=FIELDS)
        if mode == "w":
            writer.writeheader()
        writer.writerows(new_results)

    print(f"\n✅ {len(new_results)} nouveaux artistes → {OUT}")
    print(f"   Total : {len(seen)}")


if __name__ == "__main__":
    run()
