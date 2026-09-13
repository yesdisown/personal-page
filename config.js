/* ============================================================================
 *  config.js — EDIT THIS FILE for everything day-to-day.
 *
 *  This is a link page, not a shell — everything here becomes either a
 *  <a href> link or a piece of text on the page. render.js reads this
 *  object and builds the DOM from it; you shouldn't need to touch render.js
 *  for normal edits.
 * ==========================================================================*/

const SITE = {
  heading: "Hi, im @yesdisown!",


  // ---- colors ---------------------------------------------------------
  // Any valid CSS color works (#hex, rgb(), etc). These become CSS custom
  // properties, so you can also override them per-element in style.css if
  // you ever want to get fancier than a flat palette.
  theme: {
    bg: "#000000",
    text: "#d8d8d8", // body text
    dim: "#888888", // secondary/quiet text
    heading: "#ffffff", // labels, prompt, headings
    link: "#9c68e0", // matches the logo palette by default
    linkHover: "#ffffff",
  },

  // ---- neofetch-style info block ---------------------------------------
  neofetch: {
    os: "Fedora Linux 44 (Workstation Edition)",
    watching: "Black Mirror",
    playing: "Celeste",
    listening: "Riverside",
    bio: "Rustacean, open-source enthusiast, and progressive rock lover." ,

    // Add `url` to make a social a real link. Omit `url` (or set it to
    // null) to show it as plain text — useful for things like Discord
    // usernames that don't have a canonical profile URL.
    socials: [
      { label: "Telegram", value: "@yesdisown", url: "https://t.me/yesdisown" },
      { label: "Discord", value: "@yesdisown", url: null },
      { label: "Matrix", value: "@yesdisown:matrix.org", url: "https://matrix.to/#/@yesdisown:matrix.org" },
      { label: "Mastodon", value: "@yd@101010.pl", url: "https://101010.pl/@yd" },
      { label: "GitHub", value: "@yesdisown", url: "https://github.com/yesdisown" },
    ],
  },

  // ---- projects ---------------------------------------------------------
  // To add a project: add ONE object here. It shows up on the home page
  // (up to `previewCount`) and always shows up on the "all projects" page.
  // The "Projects: N (github)" count in neofetch and the "see all" link
  // both update themselves automatically — nothing else to touch.
  previewCount: 3,
  projects: [
    {
      name: "flaszka",
      desc: "A simple CLI flashcard app.",
      repo: "https://github.com/yesdisown/flaszka",
    },
  ],
};

/* ============================================================================
 *  ASCII_LOGO — colorized pixel-art rendering of the pfp, quantized down to
 *  a small palette and a 25x24 grid. Each character in a row maps to a
 *  color via `palette` below (space = transparent/background).
 *
 *  Changing your pfp means regenerating this by hand isn't realistic —
 *  come back with the new image and ask for a fresh ASCII_LOGO block.
 * ==========================================================================*/
const ASCII_LOGO = {
  palette: {
    "1": "#3e1e62",
    "2": "#562d86",
    "3": "#7543b3",
    "4": "#8552c5",
    "5": "#9460d7",
    "6": "#9c68e0",
    "7": "#b78cec",
    "8": "#c2a4e8",
    "9": "#b79cec",
  },
  rows: [
    "                         ",
    "       1111111           ",
    "     11233333211         ",
    "     13443345422111      ",
    "    125521124882881      ",
    "    26872  12883881      ",
    "    28884   111111       ",
    "    28884                ",
    "    248931               ",
    "     256421              ",
    "    12475421        1    ",
    "   1245665421  1 1 1     ",
    "  124543345421 1 3311    ",
    " 12454211245421 1352     ",
    " 135421  1234422245111   ",
    " 13631    11244347521    ",
    " 13631      1366735      ",
    " 135421     1368631      ",
    " 1245421   124766421     ",
    "  1355421112454334421    ",
    "  12345433344321124421   ",
    "   112333333211  123321  ",
    "     11111111     111111 ",
    "                         ",
  ],
};
