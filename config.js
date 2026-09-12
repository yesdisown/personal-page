/* ============================================================================
 *  config.js — EDIT THIS FILE, not terminal.js.
 *
 *  Everything you'll want to change day-to-day lives here:
 *    - your socials / neofetch info
 *    - your projects list (adding one line = a new `cat`-able file)
 *    - the ascii logo (pre-baked from your pfp, see notes below)
 *    - fortune quotes
 *
 *  terminal.js reads this object and builds the fake filesystem + neofetch
 *  output from it, so you don't have to touch the engine for normal edits.
 * ==========================================================================*/

const SITE = {
  // shown in the prompt: <user>@<host>:~$
  user: "yes",
  host: "disown.dev",

  // ---- neofetch info block (right-hand side) --------------------------
  neofetch: {
    os: "Fedora Linux 44 (Workstation Edition)",
    kernel: "Linux 7.1.12-200.fc44.x86_64",
    shell: "bash 5.2.32",
    editor: "nvim",
    // uptime is NOT typed here — it's computed live from page-load time,
    // see terminal.js -> formatUptime()

    socials: [
      { label: "Telegram", value: "@yesdisown" },
      { label: "Discord",  value: "@yesdisown" },
      { label: "Matrix",   value: "@yesdisown:matrix.org" },
      { label: "Mastodon", value: "@yesdisown@101010.pl" },
      { label: "GitHub",   value: "@yesdisown" },
    ],
  },

  // ---- projects -----------------------------------------------------
  // To add a project: add ONE object here. It automatically shows up in
  // `ls ~/projects`, becomes `cat`-able, redirects to the repo, AND bumps
  // the "Projects:" counter in neofetch. Nothing else to touch.
  projects: [
    { name: "flaszka", repo: "https://github.com/yesdisown/flaszka" },
  ],

  // ---- fortune quotes (edit/add freely, one per line) ----------------
  fortunes: [
    "the compiler is never wrong. you are.",
    "there are only two hard problems in computer science:\ncache invalidation, naming things, and off-by-one errors.",
    "a backend dev's favorite HTTP status is 204: no content,\nno bugs, no comments needed.",
    "I don't always test my code, but when I do, I do it in production.",
    "not written in Rust. deal with it.",
    "yes & disown: the only two commands you need to know.",
    "everything is a file. even your bad decisions.",
    "\"it works on my machine\" - every backend dev, ever.",
    "real programmers count from zero. some also stop caring around then.",
    "frajer",
  ],
};

/* ============================================================================
 *  ASCII_LOGO — colorized pixel-art rendering of the pfp, quantized down to
 *  a small palette and a 25x24 grid. Each character in a row maps to a
 *  color via PALETTE below (space = transparent/background).
 *
 *  Regenerating this if you change your pfp is a bit of manual work — ping
 *  whoever/whatever helped you build this site the first time, or write a
 *  small script that: downsamples the image to its native pixel grid,
 *  snaps each cell to a small palette, and encodes rows as strings.
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
