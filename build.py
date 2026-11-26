#!/usr/bin/env python3
"""Generator strony: site.toml + template.html  ->  index.html

  python3 build.py          zbuduj index.html
  python3 build.py add      dodaj projekt interaktywnie (dopisuje do site.toml i buduje)
  python3 build.py serve    zbuduj, odpal podgląd na http://localhost:8000 i przebudowuj przy zmianach

Tylko biblioteka standardowa, wymaga Pythona 3.11+ (tomllib).
"""
import colorsys
import html
import json
import re
import sys
import tomllib
from pathlib import Path

ROOT = Path(__file__).parent
SITE_TOML = ROOT / "site.toml"
TEMPLATE = ROOT / "template.html"
OUTPUT = ROOT / "index.html"
LOGO = ROOT / "logo.svg"

URL_RE = re.compile(r"^https?://\S+$")


class SiteError(Exception):
    pass


def esc(s) -> str:
    return html.escape(str(s), quote=True)


# ----------------------------------------------------------------- validation
def require(d: dict, key: str, where: str) -> str:
    v = d.get(key)
    if not isinstance(v, str) or not v.strip():
        raise SiteError(f"{where}: brakuje pola '{key}'")
    return v.strip()


def check_url(url: str, where: str) -> str:
    if not URL_RE.match(url):
        raise SiteError(f"{where}: '{url}' to nie jest poprawny URL (musi zaczynać się od http:// lub https://)")
    return url


def validate(cfg: dict) -> None:
    site = cfg.get("site") or {}
    for k in ("handle", "domain", "tagline", "intro"):
        require(site, k, "[site]")
    if not isinstance(site.get("preview_limit", 6), int) or site.get("preview_limit", 6) < 1:
        raise SiteError("[site]: preview_limit musi być liczbą >= 1")

    for i, s in enumerate(cfg.get("socials", []), 1):
        w = f"[[socials]] #{i}"
        require(s, "label", w)
        require(s, "text", w)
        check_url(require(s, "url", w), w)

    names = set()
    for i, p in enumerate(cfg.get("projects", []), 1):
        w = f"[[projects]] #{i}"
        name = require(p, "name", w)
        w = f"projekt '{name}'"
        if name in names:
            raise SiteError(f"{w}: zduplikowana nazwa")
        names.add(name)
        require(p, "desc", w)
        for j, link in enumerate(p.get("links", []), 1):
            lw = f"{w}, link #{j}"
            require(link, "label", lw)
            check_url(require(link, "url", lw), lw)


# ------------------------------------------------------------------ rendering
def render_project(p: dict) -> str:
    wip = "[WIP] " if p.get("wip") else ""
    row = (
        f'<span class="label">{esc(wip + p["name"])}</span>'
        f'<span class="proj-desc"> — {esc(p["desc"])}</span>'
    )
    links = p.get("links", [])
    ind = " " * 12

    if len(links) == 0:
        return f'{ind}<li><div class="proj-row">{row}</div></li>'

    if len(links) == 1:
        return (
            f'{ind}<li><a class="proj-row" href="{esc(links[0]["url"])}" '
            f'target="_blank" rel="noopener">{row}</a></li>'
        )

    buttons = "".join(
        f'<a class="btn" href="{esc(l["url"])}" target="_blank" rel="noopener">{esc(l["label"])}</a>'
        for l in links
    )
    # <details> = rozwijanie bez JS; atrybut name robi z listy "harmonijkę" (otwarty tylko jeden naraz)
    return (
        f'{ind}<li><details name="projects">'
        f'<summary class="proj-row">{row}</summary>'
        f'<div class="proj-actions"><span class="tree" aria-hidden="true">└─</span>'
        f'<span class="proj-links">{buttons}</span></div>'
        f"</details></li>"
    )


def swatch_from_logo() -> str:
    """Pasek kolorów = unikalne kolory logo, od najciemniejszego do najjaśniejszego."""
    colors = dict.fromkeys(re.findall(r'fill="(#[0-9a-fA-F]{6})"', LOGO.read_text(encoding="utf-8")))

    def lightness(c: str) -> float:
        r, g, b = (int(c[i : i + 2], 16) / 255 for i in (1, 3, 5))
        return colorsys.rgb_to_hls(r, g, b)[1]

    return "".join(f'<span style="color:{c}">█</span>' for c in sorted(colors, key=lightness))


def build_context(cfg: dict) -> dict:
    site = cfg["site"]
    projects = cfg.get("projects", [])
    limit = site.get("preview_limit", 6)
    ind = " " * 10

    about = [a for a in cfg.get("about", []) if str(a.get("value", "")).strip()]
    about_html = [
        f'{ind}<div><span class="label">{esc(a["label"])}:</span> {esc(a["value"])}</div>'
        for a in about
    ]
    about_html.append(
        f'{ind}<div><span class="label">Projects:</span> {len(projects)}</div>'
    )

    socials = "\n".join(
        f'{" " * 12}<li><a href="{esc(s["url"])}" target="_blank" rel="noopener">'
        f'<span class="label">{esc(s["label"])}:</span> {esc(s["text"])}</a></li>'
        for s in cfg.get("socials", [])
    )

    preview = projects[:limit]
    if len(projects) > limit:
        see_all_link = (
            f'\n          <a class="see-all" href="#all-projects">see all ({len(projects)}) &rarr;</a>'
        )
        all_view = (
            '    <section id="all-projects">\n'
            '      <a href="#" class="back-link">&larr; back</a>\n'
            f'      <h2 class="section-heading">$ all projects ({len(projects)})</h2>\n'
            '      <ul class="project-list">\n'
            + "\n".join(render_project(p) for p in projects)
            + "\n      </ul>\n    </section>\n"
        )
    else:
        see_all_link, all_view = "", ""

    same_as = [s["url"] for s in cfg.get("socials", []) if s.get("index", True)]
    jsonld = json.dumps(
        {
            "@context": "https://schema.org",
            "@type": "Person",
            "name": site["handle"],
            "url": f'https://{site["domain"]}/',
            "description": site["tagline"],
            "sameAs": same_as,
        },
        indent=2,
        ensure_ascii=False,
    ).replace("</", "<\\/")

    return {
        "handle": esc(site["handle"]),
        "domain": esc(site["domain"]),
        "tagline": esc(site["tagline"]),
        "intro": esc(site["intro"]),
        "jsonld": jsonld,
        "about_lines": "\n".join(about_html),
        "swatch": swatch_from_logo(),
        "socials": socials,
        "projects_preview": "\n".join(render_project(p) for p in preview),
        "see_all_link": see_all_link,
        "all_projects_view": all_view,
    }


def build() -> None:
    try:
        cfg = tomllib.loads(SITE_TOML.read_text(encoding="utf-8"))
    except tomllib.TOMLDecodeError as e:
        raise SiteError(f"site.toml: błąd składni TOML — {e}")
    validate(cfg)
    ctx = build_context(cfg)

    def sub(m: re.Match) -> str:
        key = m.group(1)
        if key not in ctx:
            raise SiteError(f"template.html: nieznany placeholder {{{{{key}}}}}")
        return ctx[key]

    out = re.sub(r"\{\{(\w+)\}\}", sub, TEMPLATE.read_text(encoding="utf-8"))
    OUTPUT.write_text(out, encoding="utf-8")
    n = len(cfg.get("projects", []))
    print(f"ok: index.html ({n} projects, {len(out)} B)")


# ------------------------------------------------------------------- commands
def toml_str(s: str) -> str:
    return json.dumps(s, ensure_ascii=False)  # JSON-owy string jest poprawnym basic stringiem TOML


def cmd_add() -> None:
    print("Nowy projekt (Ctrl+C anuluje).")
    name = input("Nazwa: ").strip()
    desc = input("Opis (jedno zdanie): ").strip()
    wip = input("WIP? [y/N]: ").strip().lower() == "y"
    links = []
    print("Linki — puste 'label' kończy. (0 = bez klikania, 1 = od razu otwiera, 2+ = rozwija przyciski)")
    while True:
        label = input(f"  link #{len(links) + 1} label (np. GitHub, Demo, Docs): ").strip()
        if not label:
            break
        links.append({"label": label, "url": input("  link url: ").strip()})

    block = ["", "[[projects]]", f"name  = {toml_str(name)}"]
    if wip:
        block.append("wip   = true")
    block.append(f"desc  = {toml_str(desc)}")
    block.append("links = [")
    block += [f'  {{ label = {toml_str(l["label"])}, url = {toml_str(l["url"])} }},' for l in links]
    block.append("]")

    original = SITE_TOML.read_text(encoding="utf-8")
    SITE_TOML.write_text(original.rstrip("\n") + "\n" + "\n".join(block) + "\n", encoding="utf-8")
    try:
        build()
    except SiteError:
        SITE_TOML.write_text(original, encoding="utf-8")  # nie zostawiaj zepsutego pliku
        raise


def cmd_serve(port: int = 8000) -> None:
    import functools
    import http.server
    import threading
    import time

    def safe_build():
        try:
            build()
        except SiteError as e:
            print(f"BŁĄD: {e}")

    safe_build()
    watched = [SITE_TOML, TEMPLATE, LOGO]

    def watch():
        last = [p.stat().st_mtime for p in watched]
        while True:
            time.sleep(0.5)
            now = [p.stat().st_mtime for p in watched]
            if now != last:
                last = now
                safe_build()

    threading.Thread(target=watch, daemon=True).start()
    handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(ROOT))
    print(f"podgląd: http://localhost:{port}  (Ctrl+C kończy)")
    http.server.ThreadingHTTPServer(("127.0.0.1", port), handler).serve_forever()


def main() -> int:
    cmd = sys.argv[1] if len(sys.argv) > 1 else "build"
    try:
        if cmd == "build":
            build()
        elif cmd == "add":
            cmd_add()
        elif cmd == "serve":
            cmd_serve()
        else:
            print(__doc__)
            return 2
    except SiteError as e:
        print(f"BŁĄD: {e}", file=sys.stderr)
        return 1
    except (KeyboardInterrupt, EOFError):
        print()
    return 0


if __name__ == "__main__":
    sys.exit(main())
