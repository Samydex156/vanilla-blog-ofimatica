/**
 * MecaSamType Web — Vistas de dashboard, lección y resultados
 */

import { UNITS, LESSONS, getLesson } from "./data/lessons.js";
import {
  icon,
  escapeHtml,
  fmtWpm,
  fmtAcc,
  fmtClock,
  timeAgo,
  starsHtml,
  starsIcons,
  emptyState,
  demoBanner,
  compactRankingHtml,
  focusKeysHtml,
  greeting,
  todayLabel,
} from "./ui.js";

/* ============================================================
   Fragmentos compartidos
   ============================================================ */

export const toolButtonsHtml = (showKeyboard, sound) => `
  <button type="button" class="tool-btn${sound ? "" : " is-off"}" data-action="toggle-sound" aria-pressed="${sound}">
    ${icon(sound ? "volume" : "volume-off")} ${sound ? "Sonido" : "Silencio"}
  </button>
  <button type="button" class="tool-btn${showKeyboard ? "" : " is-off"}" data-action="toggle-keyboard" aria-pressed="${showKeyboard}">
    ${icon("keyboard")} ${showKeyboard ? "Teclado" : "Sin teclado"}
  </button>
`;

const statsStripHtml = () => `
  <div class="stats-strip">
    <div class="stat-block">
      <span class="stat-block-label">Velocidad</span>
      <span class="stat-block-value"><b id="statWpm">0</b><small>ppm</small></span>
    </div>
    <div class="stat-block">
      <span class="stat-block-label">Precisión</span>
      <span class="stat-block-value"><b id="statAcc">100</b><small>%</small></span>
    </div>
    <div class="stat-block">
      <span class="stat-block-label">Tiempo</span>
      <span class="stat-block-value"><b id="statTime">0:00</b></span>
    </div>
    <div class="stat-block stat-progress">
      <span class="stat-block-label">Progreso</span>
      <span class="stat-block-value"><b id="statProgress">0%</b></span>
      <div class="progress-track"><i class="progress-fill" id="statBar"></i></div>
    </div>
  </div>
`;

const lessonCardHtml = (lesson, progress) => {
  const index = lesson.globalIndex;
  const row = progress.get(lesson.id);
  const unlocked =
    index === 0 || Boolean(progress.get(LESSONS[index - 1]?.id)?.completed);
  const completed = Boolean(row?.completed);
  const classes = [
    "lesson-card",
    completed ? "is-complete" : "",
    !unlocked && !completed ? "is-locked" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const inner = `
    <span class="lesson-card-top">
      <span class="lesson-num">${String(index + 1).padStart(2, "0")}</span>
      ${
        completed
          ? `<span class="lesson-lock">${icon("check")}</span>`
          : unlocked
            ? `<span class="lesson-card-arrow">${icon("chevron-right")}</span>`
            : `<span class="lesson-lock">${icon("lock")}</span>`
      }
    </span>
    <span class="lesson-name">${escapeHtml(lesson.title)}</span>
    <span class="lesson-focus">${escapeHtml(lesson.focus.slice(0, 7).join(" "))}</span>
    <span class="lesson-card-foot">
      ${starsHtml(row?.stars || 0)}
      <span class="lesson-best">${
        row
          ? `<strong>${fmtWpm(row.bestWpm)}</strong> ppm`
          : `Meta ${lesson.goalWpm} ppm`
      }</span>
    </span>
  `;

  if (unlocked || completed) {
    return `<button type="button" class="${classes}" data-action="open-lesson" data-id="${lesson.id}" title="${escapeHtml(
      lesson.title
    )}">${inner}</button>`;
  }

  return `<div class="${classes}" aria-disabled="true" title="Completa la lección anterior para desbloquear">${inner}</div>`;
};

const unitHtml = (unit, progress) => {
  const lessons = unit.lessons
    .map((lesson) => getLesson(lesson.id))
    .filter(Boolean);
  const completed = lessons.filter(
    (lesson) => progress.get(lesson.id)?.completed
  ).length;
  const total = lessons.length;
  const percent = total ? Math.round((completed / total) * 100) : 0;

  return `<section class="unit-block" style="--unit-accent:${unit.accent}">
    <div class="unit-head">
      <span class="unit-badge">${unit.num}</span>
      <div class="unit-head-copy">
        <strong>${escapeHtml(unit.title)}</strong>
        <span>${escapeHtml(unit.subtitle)}</span>
      </div>
      <div class="unit-progress">
        <span>${completed}/${total}</span>
        <span class="unit-bar"><i style="width:${percent}%"></i></span>
      </div>
    </div>
    <div class="lesson-grid">
      ${lessons.map((lesson) => lessonCardHtml(lesson, progress)).join("")}
    </div>
  </section>`;
};

/* ============================================================
   Dashboard
   ============================================================ */

export const dashboardView = ({
  profile,
  stats,
  next,
  progress,
  sessions,
  sprintBest,
  leaderboard,
  isDemo,
}) => {
  const firstName = String(profile.displayName || profile.username || "Alumno")
    .trim()
    .split(/\s+/)[0];
  const percent = Math.round((stats.completed / LESSONS.length) * 100);
  const nextRow = next ? progress.get(next.id) : null;

  const statCards = [
    {
      label: "Mejor velocidad",
      value: fmtWpm(stats.best),
      unit: "ppm",
      foot: "Récord personal",
      icon: "gauge",
      color: "var(--teal)",
      glow: "rgba(50,230,196,.12)",
    },
    {
      label: "Precisión media",
      value: fmtWpm(stats.avgAcc),
      unit: "%",
      foot: "Últimas 20 prácticas",
      icon: "target",
      color: "var(--violet)",
      glow: "rgba(139,108,255,.14)",
    },
    {
      label: "Lecciones",
      value: `${stats.completed}/${LESSONS.length}`,
      unit: "",
      foot: `${percent}% del curso`,
      icon: "check",
      color: "var(--amber)",
      glow: "rgba(255,184,77,.14)",
    },
    {
      label: "Racha",
      value: String(stats.streak),
      unit: stats.streak === 1 ? "día" : "días",
      foot: `${stats.minutes} min practicados`,
      icon: "flame",
      color: "var(--pink)",
      glow: "rgba(255,122,144,.14)",
    },
  ];

  const continueHtml = next
    ? `<div class="continue-card">
        <div class="continue-copy">
          <span class="continue-kicker">${icon("play")} Continuar donde lo dejaste</span>
          <h2 class="continue-title">${escapeHtml(next.title)}</h2>
          <div class="continue-focus">
            ${focusKeysHtml(next.focus, 9)}
            <span class="continue-best">Meta ${next.goalWpm} ppm · ${next.goalAccuracy}% precisión</span>
          </div>
        </div>
        <div class="continue-actions">
          ${
            nextRow
              ? `<span class="continue-best">Mejor: <strong>${fmtWpm(nextRow.bestWpm)} ppm</strong></span>`
              : ""
          }
          <a class="btn btn-primary" href="#/leccion/${next.id}">
            ${icon("play")} Practicar
          </a>
        </div>
      </div>`
    : `<div class="continue-card">
        <div class="continue-copy">
          <span class="continue-kicker">${icon("check")} Curso completado</span>
          <h2 class="continue-title">Has terminado las 17 lecciones.</h2>
          <div class="continue-focus">
            <span class="continue-best">Ahora mide tu velocidad real en el sprint de 60 segundos.</span>
          </div>
        </div>
        <div class="continue-actions">
          <a class="btn btn-primary" href="#/sprint">${icon("zap")} Hacer un sprint</a>
        </div>
      </div>`;

  const recentHtml = sessions.length
    ? `<div class="recent-list">${sessions
        .slice(0, 4)
        .map((session) => {
          const lesson = LESSONS.find((item) => item.id === session.lessonId);
          return `<div class="recent-row">
            <span class="recent-icon">${icon("keyboard")}</span>
            <span class="recent-main">
              <strong>${escapeHtml(lesson?.title || session.lessonId)}</strong>
              <span>${fmtAcc(session.accuracy)} precisión · ${timeAgo(session.createdAt)}</span>
            </span>
            <span class="recent-metrics"><b>${fmtWpm(session.wpm)} ppm</b><span>${fmtClock(session.duration)}</span></span>
          </div>`;
        })
        .join("")}</div>`
    : emptyState("clock", "Todavía no hay prácticas registradas.");

  const chartHtml = sessions.length
    ? (() => {
        const last = [...sessions].slice(0, 8).reverse();
        const max = Math.max(...last.map((session) => session.wpm), 1);
        return `<div class="spark-chart">${last
          .map(
            (session) =>
              `<div class="spark-col"><span class="spark-value">${Math.round(
                session.wpm
              )}</span><span class="spark-bar" style="height:${Math.max(
                8,
                (session.wpm / max) * 100
              )}%"></span></div>`
          )
          .join("")}</div>`;
      })()
    : emptyState("chart", "Completa una lección para ver tu evolución.");

  const rankingHtml = leaderboard?.length
    ? compactRankingHtml(leaderboard, profile.username, 3)
    : `<div id="miniRanking">${emptyState(
        "trophy",
        "Aún no hay marcas de sprint."
      )}</div>`;

  return `<div class="view-inner">
    ${demoBanner(isDemo)}
    <div class="page-head">
      <div class="page-head-copy">
        <span class="page-kicker">${icon("calendar")} ${todayLabel()}</span>
        <h1 class="page-title">${greeting()}, ${escapeHtml(firstName)}.</h1>
        <p class="page-sub">Tu mapa de mecanografía: ${stats.completed} de ${LESSONS.length} lecciones completadas.</p>
      </div>
      <div class="page-head-actions">
        <a class="btn btn-ghost" href="#/sprint">${icon("zap")} Sprint de 60 s</a>
      </div>
    </div>

    <div class="stats-grid">
      ${statCards
        .map(
          (card) => `<div class="stat-card" style="--stat-color:${card.color};--stat-glow:${card.glow}">
            <div class="stat-top"><span>${card.label}</span>${icon(card.icon)}</div>
            <div class="stat-value">${card.value}${card.unit ? `<small>${card.unit}</small>` : ""}</div>
            <div class="stat-foot">${card.foot}</div>
          </div>`
        )
        .join("")}
    </div>

    <div class="dash-layout">
      <div class="dash-main">
        ${continueHtml}
        ${unitsHtml(progress)}
      </div>

      <aside class="dash-aside">
        <div class="side-card sprint-side">
          <div class="sprint-side-top">
            <span class="sprint-icon">${icon("zap")}</span>
            <span class="badge badge-amber">60 s</span>
          </div>
          <h3>Sprint de velocidad</h3>
          <p>Texto aleatorio de la base de datos. Un minuto. Top 10 del grupo.</p>
          <div class="sprint-side-best">
            <span>Tu mejor marca</span>
            <b>${sprintBest ? `${fmtWpm(sprintBest.wpm)} ppm` : "—"}</b>
          </div>
          <a href="#/sprint" class="btn btn-primary btn-block">${icon("trophy")} Entrar al sprint</a>
        </div>

        <div class="side-card">
          <div class="panel-head" style="padding:0 0 .45rem">
            <h3 class="panel-title">${icon("trophy")} Top 10</h3>
            <a class="panel-link" href="#/ranking">Ver todo ${icon("chevron-right")}</a>
          </div>
          ${rankingHtml}
        </div>

        <div class="side-card">
          <div class="panel-head" style="padding:0 0 .2rem">
            <h3 class="panel-title">${icon("chart")} Evolución</h3>
            <span class="badge">WPM</span>
          </div>
          ${chartHtml}
        </div>

        <div class="side-card">
          <div class="panel-head" style="padding:0 0 .2rem">
            <h3 class="panel-title">${icon("clock")} Últimas prácticas</h3>
          </div>
          ${recentHtml}
        </div>
      </aside>
    </div>
  </div>`;
};

const unitsHtml = (progress) =>
  `<div class="units">${UNITS.map((unit) => unitHtml(unit, progress)).join("")}</div>`;

/* ============================================================
   Lección
   ============================================================ */

export const lessonView = ({ lesson, previous, showKeyboard, sound }) => `
  <div class="view-inner lesson-view">
    <div class="lesson-topbar">
      <a class="back-link" href="#/">${icon("arrow-left")} Lecciones</a>
      <div class="lesson-goals">
        ${previous ? `<span class="goal-chip">${starsHtml(previous.stars)}</span>` : ""}
      </div>
    </div>

    <div class="lesson-head" style="--unit-accent:${lesson.unitAccent}">
      <div class="lesson-head-main">
        <span class="lesson-kicker">Unidad ${lesson.unitNum} · ${escapeHtml(lesson.unitTitle)}</span>
        <h1 class="lesson-title">${escapeHtml(lesson.title)}</h1>
        <p class="lesson-tip">${escapeHtml(lesson.tip)}</p>
      </div>
      <div class="lesson-goals">
        <span class="goal-chip">${icon("gauge")} Meta ${lesson.goalWpm} ppm</span>
        <span class="goal-chip">${icon("target")} ${lesson.goalAccuracy}% precisión</span>
      </div>
    </div>

    <div class="practice-card" id="practiceCard">
      ${statsStripHtml()}

      <div class="stream-box" id="streamBox">
        <div class="stream" id="stream"></div>

        <div class="overlay" id="startOverlay">
          <span class="eyebrow">${icon("keyboard")} Listo cuando quieras</span>
          <h2 class="overlay-title">${escapeHtml(lesson.title)}</h2>
          <p class="overlay-text">Haz clic para activar el teclado y escribe sin mirar las manos.</p>
          <button type="button" class="overlay-btn" data-action="focus-input">
            ${icon("play")} Empezar a escribir
          </button>
        </div>

        <div class="overlay" id="pauseOverlay" hidden>
          <span class="eyebrow">${icon("pause")} En pausa</span>
          <h2 class="overlay-title">El cronómetro está detenido</h2>
          <p class="overlay-text">Respira, revisa la postura y continúa cuando estés listo.</p>
          <div class="overlay-actions">
            <button type="button" class="btn btn-primary" data-action="resume-lesson">Continuar</button>
            <button type="button" class="btn btn-ghost" data-action="restart-lesson">${icon("rotate")} Reiniciar</button>
            <a class="btn btn-ghost" href="#/">Salir</a>
          </div>
        </div>
      </div>

      <input
        id="typingInput"
        class="typing-input"
        type="text"
        autocomplete="off"
        autocorrect="off"
        autocapitalize="off"
        spellcheck="false"
        inputmode="text"
        aria-label="Escribe el texto de la lección"
      />

      <div class="practice-foot">
        <span class="foot-note">${icon("info")} Backspace corrige. Escape pausa.</span>
        <div class="foot-actions">
          ${toolButtonsHtml(showKeyboard, sound)}
          <a class="tool-btn" href="#/">${icon("arrow-left")} Salir</a>
        </div>
      </div>

      <div class="key-hint" id="keyHint" hidden></div>
      <div class="keyboard-wrap${showKeyboard ? "" : " is-hidden"}" id="keyboardWrap">
        <div class="virtual-keyboard" id="virtualKeyboard"></div>
      </div>
    </div>
  </div>
`;

/* ============================================================
   Resultado de lección
   ============================================================ */

export const lessonResultView = ({
  lesson,
  stats,
  stars,
  previous,
  isRecord,
  next,
}) => {
  const messages = {
    3: "Ritmo y precisión de nivel. Esta lección ya es tuya.",
    2: "A un paso de las tres estrellas. Repite para ganar velocidad.",
    1: "Lección superada. La constancia hace el resto.",
  };
  const previousLine = previous
    ? `Tu mejor marca anterior era ${fmtWpm(previous.bestWpm)} ppm.`
    : "Es la primera marca que guardas de esta lección.";

  return `<div class="view-inner result-view">
    <div class="result-card">
      <span class="result-kicker">${icon("check")} Lección completada</span>
      <h1 class="result-title">${escapeHtml(lesson.title)}</h1>
      <div class="result-stars">${starsIcons(stars)}</div>
      <p class="result-lead">${messages[stars]} ${previousLine}</p>

      <div class="result-metrics">
        <div class="metric">
          <span class="metric-label">Velocidad</span>
          <span class="metric-value">${fmtWpm(stats.wpm)}<small>ppm</small></span>
        </div>
        <div class="metric">
          <span class="metric-label">Precisión</span>
          <span class="metric-value">${fmtWpm(stats.accuracy)}<small>%</small></span>
        </div>
        <div class="metric">
          <span class="metric-label">Tiempo</span>
          <span class="metric-value">${fmtClock(stats.duration)}</span>
        </div>
        <div class="metric">
          <span class="metric-label">Errores</span>
          <span class="metric-value">${stats.errors}</span>
        </div>
      </div>

      ${isRecord ? `<div class="result-record">${icon("spark")} Nuevo récord personal</div>` : ""}
      <div class="save-status" id="saveStatus"></div>

      <div class="result-actions">
        <button type="button" class="btn btn-ghost" data-action="restart-lesson">
          ${icon("rotate")} Repetir
        </button>
        ${
          next
            ? `<a class="btn btn-primary" href="#/leccion/${next.id}">Siguiente lección ${icon("arrow-right")}</a>`
            : `<a class="btn btn-primary" href="#/sprint">${icon("zap")} Probar el sprint</a>`
        }
        <a class="btn btn-ghost" href="#/">${icon("keyboard")} Volver al mapa</a>
      </div>
    </div>
  </div>`;
};
