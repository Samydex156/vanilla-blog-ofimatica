/**
 * MecaSamType Web — Utilidades de interfaz
 * Helpers de formato y fragmentos HTML reutilizables.
 */

export const icon = (name, cls = "") =>
  `<svg class="icon ${cls}" aria-hidden="true"><use href="#i-${name}"></use></svg>`;

export const escapeHtml = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (char) => {
    switch (char) {
      case "&": return "&amp;";
      case "<": return "&lt;";
      case ">": return "&gt;";
      case '"': return "&quot;";
      case "'": return "&#39;";
      default: return char;
    }
  });

export const clampNumber = (value, min, max) =>
  Math.min(max, Math.max(min, Number(value) || 0));

export const fmtWpm = (value) => {
  const number = Number(value) || 0;
  if (Number.isInteger(number)) return String(number);
  return number.toFixed(1).replace(/\.0$/, "");
};

export const fmtAcc = (value) => `${fmtWpm(value)}%`;

export const fmtClock = (seconds) => {
  const total = Math.max(0, Math.round(Number(seconds) || 0));
  const minutes = Math.floor(total / 60);
  const rest = total % 60;
  return `${minutes}:${String(rest).padStart(2, "0")}`;
};

export const initials = (name) => {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);
  const text = parts.map((part) => part[0]?.toUpperCase() || "").join("");
  return text || "?";
};

export const avatarColor = (seed) => {
  let hash = 0;
  const text = String(seed || "alumno");
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) % 360;
  }
  return `hsl(${hash} 68% 62%)`;
};

export const timeAgo = (dateValue) => {
  if (!dateValue) return "";
  const time = new Date(dateValue).getTime();
  if (Number.isNaN(time)) return "";
  const diff = Math.max(0, Date.now() - time);
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "ahora";
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "ayer";
  if (days < 7) return `hace ${days} días`;
  return new Intl.DateTimeFormat("es", { day: "numeric", month: "short" }).format(
    new Date(time)
  );
};

export const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 6) return "Buenas noches";
  if (hour < 13) return "Buenos días";
  if (hour < 20) return "Buenas tardes";
  return "Buenas noches";
};

export const todayLabel = () => {
  const text = new Intl.DateTimeFormat("es", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const starsIcons = (stars) =>
  [1, 2, 3]
    .map(
      (index) =>
        `<svg class="icon${index <= stars ? " is-on" : ""}" aria-hidden="true"><use href="#i-star"></use></svg>`
    )
    .join("");

export const starsHtml = (stars = 0, cls = "") =>
  `<span class="stars ${cls}" aria-label="${stars} de 3 estrellas">${starsIcons(stars)}</span>`;

export const focusKeysHtml = (focus = [], limit = 8) =>
  focus
    .slice(0, limit)
    .map((key) => `<span class="focus-key">${escapeHtml(key)}</span>`)
    .join("");

export const emptyState = (iconName, text) =>
  `<div class="empty-state"><span class="empty-icon">${icon(iconName)}</span><span>${escapeHtml(text)}</span></div>`;

export const loadingHtml = (message = "Cargando…") =>
  `<div class="loading-screen"><span class="spinner"></span><span>${escapeHtml(message)}</span></div>`;

export const errorPanel = (title, message, hint = "") =>
  `<div class="view-inner"><div class="panel" style="max-width:640px;margin:3rem auto;padding:2rem;text-align:center">
    <span class="empty-icon" style="margin:0 auto 0.8rem;width:48px;height:48px">${icon("alert")}</span>
    <h2 style="font-family:var(--font-display);font-size:1.35rem;letter-spacing:-0.03em">${escapeHtml(title)}</h2>
    <p style="margin-top:0.45rem;color:var(--muted);font-size:0.82rem;line-height:1.6">${escapeHtml(message)}</p>
    ${hint ? `<p class="ranking-note">${escapeHtml(hint)}</p>` : ""}
  </div></div>`;

export const demoBanner = (isDemo) =>
  isDemo
    ? `<div class="demo-banner">${icon("alert")}<div><strong>Modo demo.</strong> Supabase aún no está configurado: el progreso y las marcas se guardan solo en este navegador. El ranking usa rivales de ejemplo.</div></div>`
    : "";

export const compactRankingHtml = (rows = [], currentUsername = "", limit = 5) => {
  if (!rows.length) {
    return emptyState("trophy", "Todavía no hay marcas de sprint.");
  }

  return `<div class="mini-rank">${rows
    .slice(0, limit)
    .map((row) => {
      const me = row.username === currentUsername;
      return `<div class="mini-rank-row${me ? " is-me" : ""}">
        <span class="mini-rank-pos">${row.rank}</span>
        <span class="mini-rank-name">${escapeHtml(row.displayName || row.username)}</span>
        <span class="mini-rank-wpm"><strong>${fmtWpm(row.wpm)}</strong> ppm</span>
      </div>`;
    })
    .join("")}</div>`;
};

const podiumHtml = (rows, currentUsername) => {
  const top = rows.slice(0, 3);
  const positions = ["is-first", "is-second", "is-third"];
  const medals = ["crown", "medal", "medal"];

  return `<div class="podium" style="grid-template-columns:repeat(${Math.max(top.length, 1)},minmax(0,1fr))">
    ${top
      .map((row, index) => {
        const me = row.username === currentUsername;
        return `<div class="podium-item ${positions[index]}${me ? " is-me" : ""}">
          <span class="podium-medal" aria-hidden="true">${icon(medals[index])}</span>
          <span class="podium-avatar" style="--av:${avatarColor(row.username)}">${initials(row.displayName || row.username)}</span>
          <span class="podium-name">${escapeHtml(row.displayName || row.username)}</span>
          <span class="podium-wpm">${fmtWpm(row.wpm)}<small>ppm</small></span>
          <span class="podium-acc">${fmtAcc(row.accuracy)} precisión</span>
          <span class="podium-rank">#${row.rank}</span>
        </div>`;
      })
      .join("")}
  </div>`;
};

const rankRowHtml = (row, currentUsername) => {
  const me = row.username === currentUsername;
  return `<div class="rank-row${me ? " is-me" : ""}">
    <span class="rank-pos">#${row.rank}</span>
    <span class="rank-user">
      <span class="rank-avatar" style="--av:${avatarColor(row.username)}">${initials(row.displayName || row.username)}</span>
      <span class="rank-name">${escapeHtml(row.displayName || row.username)}</span>
    </span>
    <span class="rank-wpm">${fmtWpm(row.wpm)}<small>ppm</small></span>
    <span class="rank-acc">${fmtAcc(row.accuracy)}</span>
    <span class="rank-date">${timeAgo(row.achievedAt)}</span>
  </div>`;
};

export const leaderboardHtml = (rows = [], currentUsername = "") => {
  if (!rows.length) {
    return `<div class="panel rank-empty">${emptyState(
      "trophy",
      "Aún no hay marcas de sprint. Sé el primero en competir."
    )}</div>`;
  }

  const rest = rows.slice(3);

  return `${podiumHtml(rows, currentUsername)}
    ${
      rest.length
        ? `<div class="rank-table">
            <div class="rank-table-head">
              <span>Puesto</span><span>Alumno</span><span>Velocidad</span><span>Precisión</span><span>Fecha</span>
            </div>
            ${rest.map((row) => rankRowHtml(row, currentUsername)).join("")}
          </div>`
        : ""
    }
    <p class="ranking-note">Ranking del sprint: mejor marca de cada alumno. El progreso de las lecciones sigue siendo privado.</p>`;
};
