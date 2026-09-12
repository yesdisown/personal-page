/* ============================================================================
 *  terminal.js — the engine. You generally shouldn't need to edit this file
 *  to add a project or change your info — see config.js for that.
 *
 *  You WOULD edit this file to add a brand new command.
 * ==========================================================================*/

(() => {
  "use strict";

  const outputEl = document.getElementById("output");
  const inputEl = document.getElementById("cmdline");
  const promptUserHost = document.getElementById("prompt-userhost");
  const promptPath = document.getElementById("prompt-path");
  const screenEl = document.getElementById("screen");

  const BOOT_TIME = Date.now();

  // ---------------------------------------------------------------------
  // fake filesystem, built from config.js
  // ---------------------------------------------------------------------
  function buildProjectsDir() {
    const children = {};
    SITE.projects.forEach((p) => {
      children[p.name] = {
        type: "file",
        isProject: true,
        repo: p.repo,
        content:
          `${p.name}\n` +
          `${"-".repeat(p.name.length)}\n` +
          `A project by ${SITE.user}.\n` +
          `Repository: ${p.repo}\n\n` +
          `(cat this file again to open it)`,
      };
    });
    return { type: "dir", children };
  }

  const FS = {
    type: "dir",
    children: {
      Desktop: { type: "dir", children: {} },
      Documents: { type: "dir", children: {} },
      Downloads: { type: "dir", children: {} },
      Music: { type: "dir", children: {} },
      Pictures: { type: "dir", children: {} },
      projects: buildProjectsDir(),
      "README.txt": {
        type: "file",
        content:
          `Welcome to disown.dev.\n\n` +
          `This whole site is a fake tty running in your browser.\n` +
          `Type 'help' to see what it can do. Everything is a file,\n` +
          `so poke around with 'ls' and 'cat' — that's most of the fun.\n\n` +
          `Careful with 'yes & disown'. You've been warned exactly once.`,
      },
      ".bashrc": {
        type: "file",
        hidden: true,
        content:
          `# ~/.bashrc\n` +
          `alias please='sudo'\n` +
          `alias oops='git reset --hard HEAD~1'\n` +
          `# 'yes & disown' is not an alias. it's a lifestyle.\n`,
      },
      ".bash_history": {
        type: "file",
        hidden: true,
        content:
          `ls\n` +
          `cd projects\n` +
          `cat flaszka\n` +
          `cargo init\nrm -rf ./*\n` +
          `yes & disown\n`,
      },
    },
  };

  // cwd is an array of path segments relative to ~ (home)
  let cwd = [];

  function getNode(pathArr) {
    let node = FS;
    for (const seg of pathArr) {
      if (node.type !== "dir" || !node.children[seg]) return null;
      node = node.children[seg];
    }
    return node;
  }

  function resolvePath(input) {
    if (!input || input === "~") return [];
    let segs = input.startsWith("~/") ? input.slice(2).split("/") : input.split("/");
    let base = input.startsWith("~") || input.startsWith("/") ? [] : [...cwd];
    if (input.startsWith("/")) segs = input.slice(1).split("/");
    for (const seg of segs) {
      if (seg === "" || seg === ".") continue;
      if (seg === "..") {
        base.pop();
      } else {
        base.push(seg);
      }
    }
    return base;
  }

  function pathString(pathArr) {
    return "/home/" + SITE.user + (pathArr.length ? "/" + pathArr.join("/") : "");
  }

  // ---------------------------------------------------------------------
  // output helpers
  // ---------------------------------------------------------------------
  function print(html) {
    const line = document.createElement("div");
    line.className = "line";
    line.innerHTML = html;
    outputEl.appendChild(line);
    scrollToBottom();
  }

  function printText(text) {
    // escapes HTML, preserves newlines as separate lines
    text.split("\n").forEach((l) => print(escapeHtml(l) || "&nbsp;"));
  }

  function escapeHtml(s) {
    const div = document.createElement("div");
    div.textContent = s;
    return div.innerHTML;
  }

  function scrollToBottom() {
    screenEl.scrollTop = screenEl.scrollHeight;
  }

  function printPromptEcho(cmdStr) {
    print(
      `<span class="prompt-echo"><span class="user">${SITE.user}@${SITE.host}</span>` +
        `<span class="dim">:</span><span class="path">${pathString(cwd)
          .replace("/home/" + SITE.user, "~")}</span>` +
        `<span class="dim">$</span> ${escapeHtml(cmdStr)}</span>`
    );
  }

  // ---------------------------------------------------------------------
  // neofetch
  // ---------------------------------------------------------------------
  function formatUptime() {
    const s = Math.floor((Date.now() - BOOT_TIME) / 1000);
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return `${m}m ${rem}s`;
  }

  function renderNeofetch() {
    const nf = SITE.neofetch;
    const logoRows = ASCII_LOGO.rows.map((row) => {
      let html = "";
      let i = 0;
      while (i < row.length) {
        const ch = row[i];
        if (ch === " ") {
          let j = i;
          while (j < row.length && row[j] === " ") j++;
          html += "&nbsp;".repeat((j - i) * 2);
          i = j;
        } else {
          let j = i;
          while (j < row.length && row[j] === ch) j++;
          const color = ASCII_LOGO.palette[ch] || "#ffffff";
          html += `<span style="color:${color}">${"\u2588\u2588".repeat(j - i)}</span>`;
          i = j;
        }
      }
      return html;
    });

    const infoLines = [];
    infoLines.push(`<span class="user">${SITE.user}</span><span class="dim">@</span><span class="user">${SITE.host}</span>`);
    infoLines.push(`<span class="dim">${"-".repeat((SITE.user + "@" + SITE.host).length)}</span>`);
    infoLines.push(`<span class="label">OS:</span> ${nf.os}`);
    infoLines.push(`<span class="label">Kernel:</span> ${nf.kernel}`);
    infoLines.push(`<span class="label">Shell:</span> ${nf.shell}`);
    infoLines.push(`<span class="label">Editor:</span> ${nf.editor}`);
    infoLines.push(`<span class="label">Uptime:</span> ${formatUptime()}`);
    infoLines.push(`<span class="label">Projects:</span> ${SITE.projects.length} (github)`);
    infoLines.push(`&nbsp;`);
    nf.socials.forEach((s) => {
      infoLines.push(`<span class="label">${s.label}:</span> ${escapeHtml(s.value)}`);
    });
    infoLines.push(`&nbsp;`);
    const swatch = Object.values(ASCII_LOGO.palette)
      .map((c) => `<span style="color:${c}">\u2588\u2588</span>`)
      .join("");
    infoLines.push(swatch);

    const rowCount = Math.max(logoRows.length, infoLines.length);
    let out = '<div class="neofetch">';
    for (let i = 0; i < rowCount; i++) {
      const logo = logoRows[i] !== undefined ? logoRows[i] : "";
      const info = infoLines[i] !== undefined ? infoLines[i] : "";
      out += `<div class="nf-row"><span class="nf-logo">${logo}</span><span class="nf-info">${info}</span></div>`;
    }
    out += "</div>";
    print(out);
  }

  // ---------------------------------------------------------------------
  // commands
  // ---------------------------------------------------------------------
  const HELP_ENTRIES = [
    ["help", "show this list"],
    ["neofetch", "show system info (runs automatically on load)"],
    ["ls [-a] [dir]", "list directory contents"],
    ["cd [dir]", "change directory"],
    ["cat <file>", "print a file. some files are more literal than others"],
    ["pwd", "print working directory"],
    ["whoami", "print current user"],
    ["echo <text>", "print text back"],
    ["uname -a", "print system information"],
    ["fortune", "print a random fortune"],
    ["cowsay <text>", "a cow says text"],
    ["clear", "clear the screen"],
    ["yes & disown", "do not run this"],
  ];

  function cmd_help() {
    print('<span class="label">available commands:</span>');
    HELP_ENTRIES.forEach(([name, desc]) => {
      print(
        `&nbsp;&nbsp;<span class="user">${padEnd(name, 16)}</span>` +
          `<span class="dim">${escapeHtml(desc)}</span>`
      );
    });
  }

  function padEnd(str, len) {
    let s = escapeHtml(str);
    const visLen = str.length;
    return s + "&nbsp;".repeat(Math.max(1, len - visLen));
  }

  function cmd_ls(args) {
    const showHidden = args.includes("-a");
    const target = args.filter((a) => a !== "-a")[0];
    const path = target ? resolvePath(target) : cwd;
    const node = getNode(path);
    if (!node) {
      printText(`ls: cannot access '${target}': No such file or directory`);
      return;
    }
    if (node.type !== "dir") {
      print(escapeHtml(target));
      return;
    }
    const names = Object.keys(node.children)
      .filter((n) => showHidden || !n.startsWith("."))
      .filter((n) => showHidden || !node.children[n].hidden)
      .sort();
    if (names.length === 0) {
      return;
    }
    const rendered = names.map((n) => {
      const child = node.children[n];
      return child.type === "dir"
        ? `<span class="dir">${escapeHtml(n)}/</span>`
        : `<span class="file">${escapeHtml(n)}</span>`;
    });
    print(rendered.join("&nbsp;&nbsp;"));
  }

  function cmd_cd(args) {
    const target = args[0];
    if (!target || target === "~") {
      cwd = [];
      return;
    }
    const path = resolvePath(target);
    const node = getNode(path);
    if (!node) {
      printText(`bash: cd: ${target}: No such file or directory`);
      return;
    }
    if (node.type !== "dir") {
      printText(`bash: cd: ${target}: Not a directory`);
      return;
    }
    cwd = path;
  }

  function cmd_cat(args) {
    if (!args[0]) {
      printText("usage: cat <file>");
      return;
    }
    const path = resolvePath(args[0]);
    const node = getNode(path);
    if (!node) {
      printText(`cat: ${args[0]}: No such file or directory`);
      return;
    }
    if (node.type === "dir") {
      printText(`cat: ${args[0]}: Is a directory`);
      return;
    }
    printText(node.content);
    if (node.isProject) {
      print(`<span class="dim">opening ${node.repo} ...</span>`);
      setTimeout(() => {
        window.location.href = node.repo;
      }, 500);
    }
  }

  function cmd_pwd() {
    print(escapeHtml(pathString(cwd)));
  }

  function cmd_whoami() {
    print(`${escapeHtml(SITE.user)} <span class="dim">(probably. who's to say)</span>`);
  }

  function cmd_echo(args) {
    printText(args.join(" "));
  }

  function cmd_uname(args) {
    if (args.includes("-a")) {
      printText(
        `Linux ${SITE.host} ${SITE.neofetch.kernel} #1 SMP PREEMPT_DYNAMIC x86_64 x86_64 x86_64 GNU/Linux`
      );
    } else {
      printText("Linux");
    }
  }

  function cmd_fortune() {
    const f = SITE.fortunes[Math.floor(Math.random() * SITE.fortunes.length)];
    printText(f);
  }

  function cmd_cowsay(args) {
    const msg = args.length ? args.join(" ") : "moo.";
    const width = Math.min(Math.max(msg.length, 4), 40);
    const wrapped = msg.length > width ? msg.slice(0, width - 3) + "..." : msg;
    const top = " " + "_".repeat(wrapped.length + 2);
    const bottom = " " + "-".repeat(wrapped.length + 2);
    const bubble = [top, `< ${wrapped} >`, bottom].map(escapeHtml).join("\n");
    const cow =
      "        \\   ^__^\n" +
      "         \\  (oo)\\_______\n" +
      "            (__)\\       )\\/\\\n" +
      "                ||----w |\n" +
      "                ||     ||";
    printText(bubble + "\n" + cow);
  }

  function cmd_credits() {
    printText(
      `font: "Px437 IBM VGA 8x16" from the Ultimate Oldschool PC Font Pack\n` +
        `(int10h.org/oldschool-pc-fonts), (c) VileR, CC BY-SA 4.0.\n` +
        `see /fonts/LICENSE-CC-BY-SA-4.0.txt in the repo for full text.`
    );
  }

  // -------------------- yes & disown -------------------------------
  let disowned = false;
  function triggerDisown() {
    if (disowned) return;
    disowned = true;
    printText("[1] 31337");
    printText("[1] running in background, disowned from this shell.");
    printText("there is no job control for a job you disowned. good luck.");
    scrollToBottom();

    // this intentionally leaks memory and floods the DOM until the tab
    // becomes unresponsive. that IS the joke — modern browsers handle it
    // gracefully with their own "page unresponsive" dialog, nothing is
    // actually destructive outside this tab.
    const hoard = [];
    function flood() {
      const batch = document.createDocumentFragment();
      for (let i = 0; i < 400; i++) {
        const div = document.createElement("div");
        div.className = "line";
        div.textContent = "y".repeat(80);
        batch.appendChild(div);
      }
      outputEl.appendChild(batch);
      hoard.push(new Array(200000).fill("y"));
      scrollToBottom();
      requestAnimationFrame(flood);
    }
    requestAnimationFrame(flood);
  }

  function cmd_yes(rawInput) {
    if (/^yes\s*&\s*disown$/i.test(rawInput.trim())) {
      triggerDisown();
      return;
    }
    printText("y");
    printText("y");
    printText("y");
    printText(
      "^C (preview interrupted — this normally never stops)\n" +
        "try the real thing: yes & disown"
    );
  }

  // ---------------------------------------------------------------------
  // dispatcher
  // ---------------------------------------------------------------------
  function runCommand(raw) {
    const trimmed = raw.trim();
    printPromptEcho(raw);
    if (trimmed === "") return;

    if (/^yes(\s|$)/i.test(trimmed)) {
      cmd_yes(trimmed);
      return;
    }

    const parts = trimmed.split(/\s+/);
    const name = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch (name) {
      case "help":
        cmd_help();
        break;
      case "neofetch":
        renderNeofetch();
        break;
      case "ls":
        cmd_ls(args);
        break;
      case "cd":
        cmd_cd(args);
        break;
      case "cat":
        cmd_cat(args);
        break;
      case "pwd":
        cmd_pwd();
        break;
      case "whoami":
        cmd_whoami();
        break;
      case "echo":
        cmd_echo(args);
        break;
      case "uname":
        cmd_uname(args);
        break;
      case "fortune":
        cmd_fortune();
        break;
      case "cowsay":
        cmd_cowsay(args);
        break;
      case "clear":
        outputEl.innerHTML = "";
        break;
      case "credits":
        cmd_credits();
        break;
      default:
        printText(`bash: ${name}: command not found`);
    }
  }

  // ---------------------------------------------------------------------
  // input handling
  // ---------------------------------------------------------------------
  const history = [];
  let historyIndex = -1;

  function refreshPrompt() {
    promptUserHost.textContent = `${SITE.user}@${SITE.host}`;
    const p = pathString(cwd).replace("/home/" + SITE.user, "~");
    promptPath.textContent = p;
  }

  inputEl.addEventListener("keydown", (e) => {
    if (disowned) {
      e.preventDefault();
      return;
    }
    if (e.key === "Enter") {
      const val = inputEl.value;
      inputEl.value = "";
      if (val.trim() !== "") {
        history.push(val);
      }
      historyIndex = history.length;
      runCommand(val);
      refreshPrompt();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (historyIndex > 0) {
        historyIndex--;
        inputEl.value = history[historyIndex];
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex < history.length - 1) {
        historyIndex++;
        inputEl.value = history[historyIndex];
      } else {
        historyIndex = history.length;
        inputEl.value = "";
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      const commandNames = HELP_ENTRIES.map((h) => h[0].split(" ")[0]);
      const val = inputEl.value;
      const match = commandNames.find((c) => c.startsWith(val) && val.length > 0);
      if (match) inputEl.value = match + " ";
    }
  });

  screenEl.addEventListener("click", () => inputEl.focus());

  // ---------------------------------------------------------------------
  // boot sequence
  // ---------------------------------------------------------------------
  function boot() {
    refreshPrompt();
    const bootLines = [
      `booting disown.dev tty ...`,
      `loading ${SITE.user}'s config ... ok`,
      `mounting /home/${SITE.user} ... ok`,
      `Welcome to disown.dev!`,
      `&nbsp;`,
    ];
    let i = 0;
    function step() {
      if (i < bootLines.length) {
        print(`<span class="dim">${bootLines[i]}</span>`);
        i++;
        setTimeout(step, 90);
      } else {
        renderNeofetch();
        inputEl.focus();
      }
    }
    step();
  }

  boot();
})();
