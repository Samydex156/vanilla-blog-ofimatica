/**
 * MecaSamType Web — Teclado virtual español (ES)
 * Colores por dedo, siguiente tecla iluminada y pistas para Shift/AltGr/acentos.
 */

const ROWS = [
  [
    { key: "1", shift: "!", finger: "lp" },
    { key: "2", shift: '"', finger: "lr" },
    { key: "3", shift: "·", finger: "lm" },
    { key: "4", shift: "$", finger: "li" },
    { key: "5", shift: "%", finger: "li" },
    { key: "6", shift: "&", finger: "ri" },
    { key: "7", shift: "/", finger: "ri" },
    { key: "8", shift: "(", finger: "rm" },
    { key: "9", shift: ")", finger: "rr" },
    { key: "0", shift: "=", finger: "rp" },
    { key: "'", shift: "?", finger: "rp" },
    { key: "¡", shift: "¿", finger: "rp" },
    { key: "⌫", special: "backspace", width: 1.35 },
  ],
  [
    { key: "q", shift: "Q", finger: "lp" },
    { key: "w", shift: "W", finger: "lr" },
    { key: "e", shift: "E", finger: "lm" },
    { key: "r", shift: "R", finger: "li" },
    { key: "t", shift: "T", finger: "li" },
    { key: "y", shift: "Y", finger: "ri" },
    { key: "u", shift: "U", finger: "ri" },
    { key: "i", shift: "I", finger: "rm" },
    { key: "o", shift: "O", finger: "rr" },
    { key: "p", shift: "P", finger: "rp" },
    { key: "`", shift: "^", finger: "rp" },
    { key: "+", shift: "*", finger: "rp" },
  ],
  [
    { key: "a", shift: "A", finger: "lp" },
    { key: "s", shift: "S", finger: "lr" },
    { key: "d", shift: "D", finger: "lm" },
    { key: "f", shift: "F", finger: "li" },
    { key: "g", shift: "G", finger: "li" },
    { key: "h", shift: "H", finger: "ri" },
    { key: "j", shift: "J", finger: "ri" },
    { key: "k", shift: "K", finger: "rm" },
    { key: "l", shift: "L", finger: "rr" },
    { key: "ñ", shift: "Ñ", finger: "rp" },
    { key: "´", shift: "¨", finger: "rp" },
    { key: "Enter", special: "enter", width: 1.35 },
  ],
  [
    { key: "Shift", special: "shift", width: 1.45 },
    { key: "z", shift: "Z", finger: "lp" },
    { key: "x", shift: "X", finger: "lr" },
    { key: "c", shift: "C", finger: "lm" },
    { key: "v", shift: "V", finger: "li" },
    { key: "b", shift: "B", finger: "li" },
    { key: "n", shift: "N", finger: "ri" },
    { key: "m", shift: "M", finger: "ri" },
    { key: ",", shift: ";", finger: "rm" },
    { key: ".", shift: ":", finger: "rr" },
    { key: "-", shift: "_", finger: "rp" },
    { key: "Shift", special: "shift", width: 1.45 },
  ],
  [
    { key: "Ctrl", special: "mod", width: 1.15 },
    { key: "Alt", special: "mod", width: 0.9 },
    { key: " ", label: "espacio", finger: "th", width: 5.2 },
    { key: "AltGr", special: "mod", width: 1.15 },
    { key: "Ctrl", special: "mod", width: 1.15 },
  ],
];

const SIMPLE_MAP = {
  ";": { key: ",", shift: true, hint: "Shift + ," },
  ":": { key: ".", shift: true, hint: "Shift + ." },
  "?": { key: "'", shift: true, hint: "Shift + '" },
  "¿": { key: "¡", shift: true, hint: "Shift + ¡" },
  "!": { key: "1", shift: true, hint: "Shift + 1" },
  '"': { key: "2", shift: true, hint: 'Shift + 2' },
  "(": { key: "8", shift: true, hint: "Shift + 8" },
  ")": { key: "9", shift: true, hint: "Shift + 9" },
  "_": { key: "-", shift: true, hint: "Shift + -" },
  "%": { key: "5", shift: true, hint: "Shift + 5" },
  "&": { key: "6", shift: true, hint: "Shift + 6" },
  "/": { key: "7", shift: true, hint: "Shift + 7" },
  "=": { key: "0", shift: true, hint: "Shift + 0" },
  "*": { key: "+", shift: true, hint: "Shift + +" },
  "^": { key: "`", shift: true, hint: "Shift + `" },
  "@": { key: "2", alt: true, hint: "AltGr + 2" },
  "#": { key: "3", alt: true, hint: "AltGr + 3" },
  "€": { key: "e", alt: true, hint: "AltGr + E" },
  "|": { key: "1", alt: true, hint: "AltGr + 1" },
  "\\": { key: "`", alt: true, hint: "AltGr + `" },
  "´": { key: "´" },
  "¨": { key: "´", shift: true, hint: "Shift + ´" },
  "+": { key: "+" },
  "-": { key: "-" },
  ".": { key: "." },
  ",": { key: "," },
  "'": { key: "'" },
  "¡": { key: "¡" },
  " ": { key: " " },
};

const ACCENT_MAP = {
  á: "a", é: "e", í: "i", ó: "o", ú: "u",
  Á: "a", É: "e", Í: "i", Ó: "o", Ú: "u",
};

const KEY_ALIASES = {
  Backspace: "⌫",
  Enter: "Enter",
  Shift: "Shift",
  Control: "Ctrl",
  Alt: "Alt",
  AltGraph: "AltGr",
  Dead: "´",
};

export class Keyboard {
  constructor(container, { legend = true } = {}) {
    this.container = container;
    this.legend = legend;
    this.keyEls = new Map();
    this.render();
  }

  register(key, el) {
    if (!this.keyEls.has(key)) this.keyEls.set(key, []);
    this.keyEls.get(key).push(el);
  }

  render() {
    this.container.innerHTML = "";
    this.keyEls = new Map();

    const board = document.createElement("div");
    board.className = "kb-board";

    for (const row of ROWS) {
      const rowEl = document.createElement("div");
      rowEl.className = "kb-row";

      for (const key of row) {
        const el = document.createElement("div");
        el.className = "kb-key";
        if (key.finger) el.classList.add(`finger-${key.finger}`);
        if (key.special) el.classList.add("is-special");
        if (key.key === " ") el.classList.add("kb-space");
        el.dataset.key = key.key;
        el.style.flexGrow = String(key.width || 1);
        el.style.flexBasis = "0";

        if (key.shift && key.shift !== key.key && key.shift !== key.key.toUpperCase()) {
          const top = document.createElement("span");
          top.className = "kb-shift-label";
          top.textContent = key.shift;
          el.appendChild(top);
        }
        const main = document.createElement("span");
        main.className = "kb-main";
        main.textContent = key.label || key.key;
        el.appendChild(main);

        this.register(key.key, el);
        rowEl.appendChild(el);
      }
      board.appendChild(rowEl);
    }

    this.container.appendChild(board);

    if (this.legend) {
      const legend = document.createElement("div");
      legend.className = "kb-legend";
      legend.innerHTML = [
        ["lp", "Meñique"],
        ["lr", "Anular"],
        ["lm", "Medio"],
        ["li", "Índice"],
        ["th", "Pulgar"],
      ]
        .map(
          ([finger, label]) =>
            `<span><i class="finger-dot finger-${finger}"></i>${label}</span>`
        )
        .join("");
      this.container.appendChild(legend);
    }
  }

  clearActive() {
    this.container
      .querySelectorAll(".is-next")
      .forEach((el) => el.classList.remove("is-next"));
  }

  getEls(key) {
    return this.keyEls.get(key) || [];
  }

  setNext(rawChar) {
    this.clearActive();
    if (!rawChar) return "";

    const char = rawChar;
    let keys = [];
    let shift = false;
    let alt = false;
    let hint = "";

    if (ACCENT_MAP[char]) {
      keys = ["´", ACCENT_MAP[char]];
      shift = char !== char.toLowerCase();
      hint = `${char} = ${shift ? "Shift + " : ""}´ + ${ACCENT_MAP[char]}`;
    } else if (char === "ü" || char === "Ü") {
      keys = ["´", "u"];
      shift = true;
      hint = `${char} = Shift + ´ + u`;
    } else if (char === "ñ" || char === "Ñ") {
      keys = ["ñ"];
      shift = char === "Ñ";
    } else if (/^[A-Z]$/.test(char)) {
      keys = [char.toLowerCase()];
      shift = true;
    } else if (/^[a-z0-9]$/.test(char)) {
      keys = [char];
    } else if (SIMPLE_MAP[char]) {
      const target = SIMPLE_MAP[char];
      keys = [target.key];
      shift = Boolean(target.shift);
      alt = Boolean(target.alt);
      hint = target.hint || "";
    } else if (char === " ") {
      keys = [" "];
    }

    for (const key of keys) {
      this.getEls(key).forEach((el) => el.classList.add("is-next"));
    }
    if (shift) this.getEls("Shift").forEach((el) => el.classList.add("is-next"));
    if (alt) this.getEls("AltGr").forEach((el) => el.classList.add("is-next"));

    return hint;
  }

  press(rawKey) {
    const key = KEY_ALIASES[rawKey] || (rawKey.length === 1 ? rawKey.toLowerCase() : rawKey);
    const els = this.getEls(key);
    if (!els.length) return;
    els.forEach((el) => el.classList.add("is-pressed"));
    window.setTimeout(() => {
      els.forEach((el) => el.classList.remove("is-pressed"));
    }, 110);
  }

  destroy() {
    if (this.container) this.container.innerHTML = "";
    this.keyEls = new Map();
  }
}
