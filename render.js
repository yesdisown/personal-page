/* ============================================================================
 *  render.js — reads config.js and fills in the page. You generally
 *  shouldn't need to edit this to change content — see config.js.
 *
 *  Navigating between the home view and the "all projects" view is NOT
 *  handled here — it's pure CSS (:target), see style.css. This file only
 *  builds content.
 * ==========================================================================*/

(() => {
  "use strict";

  const BOOT_TIME = Date.now();

  function escapeHtml(s) {
    const div = document.createElement("div");
    div.textContent = s;
    return div.innerHTML;
  }


  // ---- theme -----------------------------------------------------------
  function applyTheme() {
    const t = SITE.theme;
    const root = document.documentElement.style;
    root.setProperty("--bg", t.bg);
    root.setProperty("--text", t.text);
    root.setProperty("--dim", t.dim);
    root.setProperty("--heading", t.heading);
    root.setProperty("--link", t.link);
    root.setProperty("--link-hover", t.linkHover);
  }

  // ---- neofetch box ------------------------------------------------------
  function buildLogoHtml() {
    return ASCII_LOGO.rows
      .map((row) => {
        let html = "";
        let i = 0;
        while (i < row.length) {
          const ch = row[i];
          let j = i;
          while (j < row.length && row[j] === ch) j++;
          const count = j - i;
          if (ch === " ") {
            html += "&nbsp;".repeat(count * 2);
          } else {
            const color = ASCII_LOGO.palette[ch] || "#ffffff";
            html += `<span style="color:${color}">${"\u2588\u2588".repeat(count)}</span>`;
          }
          i = j;
        }
        return html;
      })
      .join("\n");
  }

  function renderNeofetch() {
    const nf = SITE.neofetch;
    const heading = `${SITE.heading}`;
    const swatch = Object.values(ASCII_LOGO.palette)
      .map((c) => `<span style="color:${c}">\u2588\u2588</span>`)
      .join("");

    const headingHtml = escapeHtml(heading).replace(/@yesdisown/g, '<span class="purple">@yesdisown</span>');

    document.getElementById("neofetch").innerHTML = `
      <div class="nf-logo">${buildLogoHtml()}</div>
      <div class="nf-info">
        <div class="nf-userhost">${headingHtml}</div>
        <div> ${escapeHtml(nf.bio)}</div>
        <div class="dim">${"-".repeat(heading.length)}</div>
        <div><span class="label">OS:</span> ${escapeHtml(nf.os)}</div>
        <div><span class="label">Watching:</span> ${escapeHtml(nf.watching)}</div>
        <div><span class="label">Playing: </span> ${escapeHtml(nf.playing)}</div>
        <div><span class="label">Listening: </span> ${escapeHtml(nf.listening)}</div>
        <div><span class="label">Projects:</span> ${SITE.projects.length} (github)</div>
        <div class="swatch">${swatch}</div>
      </div>
    `;
  }

  // ---- links (socials) ---------------------------------------------------
  function renderSocials() {
    const ul = document.getElementById("social-links");
    ul.innerHTML = SITE.neofetch.socials
      .map(({ label, value, url }) => {
        const inner = `<span class="label">${escapeHtml(label)}:</span> ${escapeHtml(value)}`;
        return url
          ? `<li><a href="${escapeHtml(url)}" target="_blank" rel="noopener">${inner}</a></li>`
          : `<li><span class="dim-row">${inner}</span></li>`;
      })
      .join("");
  }

  // ---- projects ------------------------------------------------------
  function projectItemHtml(p) {
    const descHtml = p.desc ? `<span class="proj-desc"> — ${escapeHtml(p.desc)}</span>` : "";
    return `<li><a href="${escapeHtml(p.repo)}" target="_blank" rel="noopener"><span class="label">${escapeHtml(
      p.name
    )}</span>${descHtml}</a></li>`;
  }

  function renderProjects() {
    const all = SITE.projects;
    const preview = all.slice(0, SITE.previewCount);

    document.getElementById("projects-preview").innerHTML = preview.map(projectItemHtml).join("");
    document.getElementById("projects-full").innerHTML = all.map(projectItemHtml).join("");
    document.getElementById("all-projects-heading").textContent = `$ all projects (${all.length})`;

    const seeAllWrap = document.getElementById("see-all-wrap");
    if (all.length > SITE.previewCount) {
      seeAllWrap.innerHTML = `<a href="#all-projects" class="see-all">see all ${all.length} projects &rarr;</a>`;
    } else {
      seeAllWrap.innerHTML = "";
    }
  }

  applyTheme();
  renderNeofetch();
  renderSocials();
  renderProjects();
})();
