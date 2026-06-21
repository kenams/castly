"""
Scraper agences de casting / maisons de production
Sources : Google Maps via requête + Pages Jaunes
Output  : agencies.csv (nom, email, ville, site, téléphone)
"""
import csv, time, re, json, urllib.request, urllib.parse
from pathlib import Path
from playwright.sync_api import sync_playwright

OUT = Path(__file__).parent / "agencies.csv"
FIELDS = ["nom", "email", "telephone", "site", "ville", "source"]

QUERIES = [
    "agence de casting Paris",
    "agence de casting Lyon",
    "agence de casting Marseille",
    "agence de casting Bordeaux",
    "maison de production cinéma Paris",
    "agence talents comédiens Paris",
    "agence mannequins Paris",
    "directeur casting film Paris",
    "casting agency France",
]

def extract_email(text: str) -> str:
    m = re.search(r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}", text)
    return m.group(0) if m else ""

def scrape_google_maps(page, query: str) -> list[dict]:
    results = []
    url = f"https://www.google.com/maps/search/{urllib.parse.quote(query)}/"
    page.goto(url, wait_until="networkidle", timeout=30000)
    time.sleep(2)

    # Fermer cookies si présent
    try:
        page.click("button:has-text('Tout accepter')", timeout=3000)
        time.sleep(1)
    except Exception:
        pass

    # Scroll dans la sidebar pour charger plus de résultats
    for _ in range(5):
        page.keyboard.press("End")
        time.sleep(1)
        try:
            sidebar = page.locator("div[role='feed']")
            sidebar.evaluate("el => el.scrollBy(0, 800)")
        except Exception:
            pass
        time.sleep(1)

    # Récupérer les cartes résultat
    cards = page.locator("div[role='feed'] > div > div > a[href*='/maps/place/']").all()
    print(f"  {len(cards)} résultats pour '{query}'")

    for card in cards[:15]:
        try:
            name = card.get_attribute("aria-label") or ""
            href = card.get_attribute("href") or ""
            if not name:
                continue

            # Cliquer pour ouvrir le détail
            card.click()
            time.sleep(2)

            # Extraire infos du panneau détail
            detail_text = page.locator("div[role='main']").inner_text(timeout=5000)
            email = extract_email(detail_text)

            phone = ""
            phone_el = page.locator("button[data-tooltip*='Copier le numéro']").first
            if phone_el.count():
                phone = phone_el.get_attribute("data-value") or ""

            site = ""
            site_el = page.locator("a[data-tooltip*='site']").first
            if site_el.count():
                site = site_el.get_attribute("href") or ""

            ville = query.split()[-1] if query.split()[-1] not in ["France", "cinéma", "film", "agency"] else "France"

            results.append({
                "nom": name.strip(),
                "email": email,
                "telephone": phone,
                "site": site,
                "ville": ville,
                "source": "google_maps"
            })
            print(f"    ✓ {name[:40]} | email: {email or '-'}")
        except Exception as e:
            print(f"    ! Erreur: {e}")
            continue

    return results


def scrape_pages_jaunes(page, query: str, ville: str) -> list[dict]:
    results = []
    url = f"https://www.pagesjaunes.fr/recherche/{urllib.parse.quote(query)}/{urllib.parse.quote(ville)}"
    try:
        page.goto(url, wait_until="domcontentloaded", timeout=20000)
        time.sleep(2)

        try:
            page.click("button#didomi-notice-agree-button", timeout=3000)
            time.sleep(1)
        except Exception:
            pass

        cards = page.locator("article.bi-content").all()
        for card in cards[:10]:
            try:
                name = card.locator("a.bi-denomination").inner_text(timeout=2000).strip()
                phone = ""
                try:
                    phone = card.locator("a[href^='tel:']").first.get_attribute("href", timeout=1000).replace("tel:", "")
                except Exception:
                    pass
                site = ""
                try:
                    site = card.locator("a.bi-website").first.get_attribute("href", timeout=1000)
                except Exception:
                    pass

                results.append({
                    "nom": name,
                    "email": "",
                    "telephone": phone,
                    "site": site,
                    "ville": ville,
                    "source": "pages_jaunes"
                })
                print(f"    ✓ PJ: {name[:40]}")
            except Exception:
                continue
    except Exception as e:
        print(f"  PJ erreur {query}/{ville}: {e}")
    return results


def run():
    existing = set()
    if OUT.exists():
        with open(OUT, encoding="utf-8") as f:
            existing = {r["nom"] for r in csv.DictReader(f)}
        print(f"{len(existing)} agences déjà en base")

    all_results = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            viewport={"width": 1280, "height": 800}
        )
        page = context.new_page()

        for query in QUERIES:
            print(f"\n→ Google Maps: {query}")
            try:
                results = scrape_google_maps(page, query)
                all_results.extend(results)
            except Exception as e:
                print(f"  Erreur: {e}")
            time.sleep(2)

        # Pages Jaunes pour les villes principales
        for query, ville in [("agence casting", "Paris"), ("agence casting", "Lyon"), ("agence mannequins", "Paris")]:
            print(f"\n→ Pages Jaunes: {query} / {ville}")
            try:
                results = scrape_pages_jaunes(page, query, ville)
                all_results.extend(results)
            except Exception as e:
                print(f"  Erreur: {e}")
            time.sleep(2)

        browser.close()

    # Déduplication + merge
    seen = set(existing)
    new_results = []
    for r in all_results:
        if r["nom"] and r["nom"] not in seen:
            seen.add(r["nom"])
            new_results.append(r)

    # Écriture CSV
    mode = "a" if OUT.exists() else "w"
    with open(OUT, mode, newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=FIELDS)
        if mode == "w":
            writer.writeheader()
        writer.writerows(new_results)

    print(f"\n✅ {len(new_results)} nouvelles agences ajoutées → {OUT}")
    print(f"   Total en base : {len(seen)}")


if __name__ == "__main__":
    run()
