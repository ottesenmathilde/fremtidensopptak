#!/usr/bin/env python3
"""
Henter 20 studieprogramsider fra kristiania.no, fikser sprites/stier/topbar,
injiserer handlekurv-panel, og oppdaterer lenker i studietilbud _ Kristiania.html.
"""
import os
import re
import requests

BASE_DIR = "/Users/markus.sorem/Documents/kristiania"
STUDIER_DIR = os.path.join(BASE_DIR, "studier")

# (url, lokalt filnavn, studieform: "campus" eller "nett")
PROGRAMS = [
    ("https://www.kristiania.no/studier/bachelor/computer-arts/",
     "Computer Arts - Bachelor _ Kristiania.html", "campus"),
    ("https://www.kristiania.no/studier/bachelor/cybersikkerhet/",
     "Cybersikkerhet - Bachelor _ Kristiania.html", "campus"),
    ("https://www.kristiania.no/studier/bachelor/design/",
     "Design - Bachelor _ Kristiania.html", "campus"),
    ("https://www.kristiania.no/studier/bachelor/film-tv-og-medier/",
     "Film TV og medier - Bachelor _ Kristiania.html", "campus"),
    ("https://www.kristiania.no/studier/bachelor/hr-og-personalledelse/",
     "HR og personalledelse - Bachelor _ Kristiania.html", "campus"),
    ("https://www.kristiania.no/studier/bachelor/hr-organisasjonspsykologi-ledelse/",
     "HR organisasjonspsykologi og ledelse - Bachelor _ Kristiania.html", "campus"),
    ("https://www.kristiania.no/studier/bachelor/informasjonsteknologi-fullstack-utvikling/",
     "Informasjonsteknologi Fullstack - Bachelor _ Kristiania.html", "campus"),
    ("https://www.kristiania.no/studier/bachelor/medier-og-kommunikasjon/",
     "Medier og kommunikasjon - Bachelor _ Kristiania.html", "campus"),
    ("https://www.kristiania.no/studier/bachelor/musikk/",
     "Musikk - Bachelor _ Kristiania.html", "campus"),
    ("https://www.kristiania.no/studier/bachelor/okonomi-og-administrasjon/",
     "Økonomi og administrasjon - Bachelor _ Kristiania.html", "campus"),
    ("https://www.kristiania.no/studier/bachelor/psykologi-og-psykisk-helse/",
     "Psykologi og psykisk helse - Bachelor _ Kristiania.html", "campus"),
    ("https://www.kristiania.no/studier/bachelor/rettsvitenskap/",
     "Rettsvitenskap - Bachelor _ Kristiania.html", "campus"),
    ("https://www.kristiania.no/studier/fagskole/film/",
     "Film - Fagskole _ Kristiania.html", "campus"),
    ("https://www.kristiania.no/studier/fagskole/grafisk-design--visuell-identitet-og-brukeropplevelse/",
     "Grafisk design - Fagskole _ Kristiania.html", "campus"),
    ("https://www.kristiania.no/studier/fagskole/interiordesign-og-romarkitektur/",
     "Interiørdesign - Fagskole _ Kristiania.html", "campus"),
    ("https://www.kristiania.no/studier/master/cyber-security/",
     "Cyber Security - Master _ Kristiania.html", "campus"),
    ("https://www.kristiania.no/studier/master/design/",
     "Design - Master _ Kristiania.html", "campus"),
    ("https://www.kristiania.no/studier/master/master-i-okonomi-og-ledelse/",
     "Økonomi og ledelse - Master _ Kristiania.html", "campus"),
    ("https://www.kristiania.no/studier/master/organisasjonspsykologi-og-ledelse/",
     "Organisasjonspsykologi og ledelse - Master _ Kristiania.html", "campus"),
    ("https://www.kristiania.no/studier/nettstudier/bachelor/bachelor-anvendt-psykologi/",
     "Anvendt psykologi - Bachelor (nettstudie) _ Kristiania.html", "nett"),
]

BASKET_LI = (
    '<li class="KA14sZ0r0qb8_TRxNj6t" style="display:flex;align-items:center;">'
    '<button onclick="openSoknaderPanel()" type="button" class="brFFOiXiOEgw5BeGVovg BqI4GIbd_jtD7ZsMt6q5" '
    'aria-label="Handlekurv" style="position:relative;background:none;border:none;cursor:pointer;padding:8px;">'
    '<span class="SvgIcon"><img src="../topbar/Basket.svg" width="24" height="24" alt="" '
    'style="display:inline-block;vertical-align:middle;"></span>'
    '<span id="topbar-basket-count" style="display:none;position:absolute;top:4px;right:4px;'
    'background:#c8233f;color:#fff;border-radius:50%;width:16px;height:16px;font-size:10px;'
    'font-weight:700;line-height:16px;text-align:center;"></span></button></li>'
)

SOK_PANEL = '''<!-- Handlekurv sidebar -->
<div id="sok-backdrop" onclick="closeSoknaderPanel()" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:1200;transition:opacity .3s;opacity:0;"></div>
<div id="sok-panel" style="display:none;position:fixed;top:0;right:0;height:100%;width:440px;max-width:100vw;background:#fff;z-index:1201;box-shadow:-4px 0 32px rgba(0,0,0,0.18);transform:translateX(100%);transition:transform .35s cubic-bezier(.4,0,.2,1);flex-direction:column;font-family:inherit;">
  <div style="display:flex;align-items:center;justify-content:space-between;padding:24px 24px 16px;border-bottom:1px solid #ebebeb;flex-shrink:0;">
    <h2 style="font-size:22px;font-weight:700;color:#7A1515;margin:0;">Handlekurv (<span id="sok-count">0</span>)</h2>
    <button onclick="closeSoknaderPanel()" style="background:none;border:none;cursor:pointer;padding:6px;" aria-label="Lukk">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="#111" stroke-width="2.2" stroke-linecap="round"/></svg>
    </button>
  </div>
  <div style="flex:1;overflow-y:auto;padding:32px 24px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:12px;">
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="#c7c8ca" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><line x1="3" y1="6" x2="21" y2="6" stroke="#c7c8ca" stroke-width="1.5" stroke-linecap="round"/><path d="M16 10a4 4 0 01-8 0" stroke="#c7c8ca" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
    <p style="font-size:15px;font-weight:500;color:#555;margin:0;">Ingen studier valgt ennå</p>
    <p style="font-size:13px;color:#999;margin:0;">Trykk «Søk nå» for å legge studiet til handlekurven.</p>
  </div>
</div>
<script>
function openSoknaderPanel() {
  var panel = document.getElementById("sok-panel");
  var backdrop = document.getElementById("sok-backdrop");
  panel.style.display = "flex";
  backdrop.style.display = "block";
  requestAnimationFrame(function() { requestAnimationFrame(function() {
    panel.style.transform = "translateX(0)";
    backdrop.style.opacity = "1";
  }); });
}
function closeSoknaderPanel() {
  var panel = document.getElementById("sok-panel");
  var backdrop = document.getElementById("sok-backdrop");
  panel.style.transform = "translateX(100%)";
  backdrop.style.opacity = "0";
  setTimeout(function() { panel.style.display = "none"; backdrop.style.display = "none"; }, 350);
}
</script>
'''


def fix_page(html, program_type):
    # 1. Fiks relative stier → CDN absolute URLs
    #    Håndter både attribute-verdier (src="/...") og srcset-entries (" /...")
    html = html.replace('="/contentassets/', '="https://www.kristiania.no/contentassets/')
    html = html.replace('="/dist/', '="https://www.kristiania.no/dist/')
    html = html.replace(' /contentassets/', ' https://www.kristiania.no/contentassets/')
    html = html.replace('\n/contentassets/', '\nhttps://www.kristiania.no/contentassets/')
    # url() i CSS
    html = html.replace('url(/contentassets/', 'url(https://www.kristiania.no/contentassets/')
    html = html.replace('url(/dist/', 'url(https://www.kristiania.no/dist/')

    # 2. Inject basket <li> før Meny-<li> (finn via #sprite-menu)
    if 'openSoknaderPanel' not in html:
        idx = html.find('#sprite-menu')
        if idx != -1:
            li_start = html.rfind('<li ', 0, idx)
            if li_start != -1:
                html = html[:li_start] + BASKET_LI + html[li_start:]

    # 3. Erstatt sprite-SVGer med lokale img-tagger
    # Kristiania.no bruker <use ...></use> (ikke self-closing), så vi bruker
    # mønster som håndterer begge varianter: ...></use></svg> og .../></svg>
    SVG_USE = r'<svg[^>]*><use[^>]*#{sprite}[^>]*>(?:</use>)?</svg>'

    # Logo mobil
    html = re.sub(
        SVG_USE.format(sprite='sprite-logo-mobile'),
        '<img src="../topbar/Kristiania_logo_22_sort.svg" height="44" alt="Kristiania logo" style="display:inline-block;vertical-align:middle;">',
        html
    )
    # Logo desktop (sprite-base)
    html = re.sub(
        SVG_USE.format(sprite='sprite-base'),
        '<img src="../topbar/Kristiania_logo_22_sort.svg" height="44" alt="Kristiania logo" style="display:inline-block;vertical-align:middle;">',
        html
    )
    # Bruker-ikon
    html = re.sub(
        SVG_USE.format(sprite='sprite-user'),
        '<img src="../topbar/User.svg" width="24" height="24" alt="" style="display:inline-block;vertical-align:middle;">',
        html
    )
    # Meny-ikon
    html = re.sub(
        SVG_USE.format(sprite='sprite-menu'),
        '<img src="../topbar/Menu.svg" width="24" height="24" alt="" style="display:inline-block;vertical-align:middle;">',
        html
    )
    # Søk-ikon (topbar-søkeknapp)
    html = re.sub(
        SVG_USE.format(sprite='sprite-search'),
        '<img src="../topbar/search.svg" width="24" height="24" alt="" style="display:inline-block;vertical-align:middle;">',
        html
    )

    # 4. Oppdater CTA-lenker til søknadsskjema
    sok_type = program_type
    html = re.sub(
        r'href="https://www\.kristiania\.no/soknad/"',
        f'href="/sok-skjema.html?type={sok_type}"',
        html
    )
    html = re.sub(
        r'href="https://www\.kristiania\.no/checkout/"',
        f'href="/sok-skjema.html?type={sok_type}"',
        html
    )
    html = re.sub(
        r'href="/soknad/"',
        f'href="/sok-skjema.html?type={sok_type}"',
        html
    )
    html = re.sub(
        r'href="/checkout/"',
        f'href="/sok-skjema.html?type={sok_type}"',
        html
    )

    # 5. Inject sok-panel + script før </body>
    if 'openSoknaderPanel' not in html:
        html = html.replace('</body>', SOK_PANEL + '</body>')

    return html


def process_program(url, filename, program_type, force=False):
    out_path = os.path.join(STUDIER_DIR, filename)
    if os.path.exists(out_path) and not force:
        print(f"  SKIP (finnes allerede): {filename}")
        return True

    headers = {
        'User-Agent': (
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) '
            'AppleWebKit/537.36 (KHTML, like Gecko) '
            'Chrome/120.0.0.0 Safari/537.36'
        ),
        'Accept-Language': 'no,nb;q=0.9,en;q=0.8',
    }
    try:
        r = requests.get(url, headers=headers, timeout=30)
        r.raise_for_status()
        html = r.text
        html = fix_page(html, program_type)
        with open(out_path, 'w', encoding='utf-8') as f:
            f.write(html)
        print(f"  OK: {filename}")
        return True
    except Exception as e:
        print(f"  FEIL {url}: {e}")
        return False


def update_studietilbud():
    path = os.path.join(BASE_DIR, "studietilbud _ Kristiania.html")
    with open(path, 'r', encoding='utf-8') as f:
        html = f.read()

    changed = 0
    for url, filename, _ in PROGRAMS:
        local_href = f'studier/{filename}'
        if url in html:
            html = html.replace(f'href="{url}"', f'href="{local_href}"')
            changed += 1
            print(f"  Oppdatert: {url} → {local_href}")
        else:
            print(f"  ADVARSEL: Fant ikke lenke til {url}")

    with open(path, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f"\nOppdaterte {changed} lenker i studietilbud _ Kristiania.html")


if __name__ == '__main__':
    import sys
    force = '--force' in sys.argv

    os.makedirs(STUDIER_DIR, exist_ok=True)

    errors = []
    for url, filename, program_type in PROGRAMS:
        print(f"Behandler: {filename}")
        ok = process_program(url, filename, program_type, force=force)
        if not ok:
            errors.append(filename)

    print(f"\n--- Ferdig: {len(PROGRAMS) - len(errors)}/{len(PROGRAMS)} OK ---")
    if errors:
        print("Feilet:")
        for e in errors:
            print(f"  - {e}")

    print("\nOppdaterer studietilbud _ Kristiania.html ...")
    update_studietilbud()
    print("\nAlt ferdig!")
