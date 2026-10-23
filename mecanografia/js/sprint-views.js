/**
 * MecaSamType Web — Vistas de sprint y ranking
 */

import {
  icon,
  escapeHtml,
  fmtWpm,
  fmtAcc,
  timeAgo,
  emptyState,
  demoBanner,
  compactRankingHtml,
  leaderboardHtml,
} from "./ui.js";
import { toolButtonsHtml } from "./views.js";

/* ============================================================
   Sprint: introducción
   ============================================================ */

export const sprintIntroView = ({ best, leaderboard, isDemo, profile }) => {
  const preview = leaderboard?.length
    ? compactRankingHtml(leaderboard, profile.username, 3)
    : emptyState("trophy", "Aún no hay marcas. Puedes ser el primero.");

  return `<div class="view-inner sprint-view">
    ${demoBanner(isDemo)}

    <div class="page-head">
      <div class="page-head-copy">
        <span class="page-kicker">${icon("zap")} Competición</span>
        <h1 class="page-title">Sprint de 60 segundos</h1>
        <p class="page-sub">Un texto aleatorio, un minuto y el top 10 del grupo.</p>
      </div>
      <div class="page-head-actions">
        <a class="btn btn-ghost" href="#/ranking">${icon("trophy")} Ver ranking</a>
      </div>
    </div>

    <div class="sprint-intro">
      <div class="sprint-hero">
        <div class="sprint-hero-copy">
          <span class="sprint-badge">${icon("zap")} 60 segundos</span>
          <h2 class="sprint-title">Demuestra tu <span class="grad">velocidad.</span></h2>
          <p class="sprint-lead">
            Al empezar recibirás un texto aleatorio desde la base de datos.
            Escribe todo lo que puedas: cada carácter correcto cuenta para tu marca.
          </p>
          <ul class="sprint-rules">
            <li>${icon("clock")} El cronómetro arranca después de la cuenta atrás.</li>
            <li>${icon("target")} La precisión también forma parte del resultado.</li>
            <li>${icon("trophy")} Solo tu mejor intento entra en el top 10.</li>
          </ul>
          <button type="button" class="btn btn-primary" data-action="start-sprint">
            ${icon("play")} Empezar sprint
          </button>
        </div>
        <div class="sprint-dial" aria-hidden="true">
          <div class="sprint-dial-inner"><b>60</b><span>segundos</span></div>
        </div>
      </div>

      <aside class="sprint-aside">
        <div class="sprint-best-card">
          <div class="sprint-best-head"><span>Tu mejor marca</span>${icon("zap")}</div>
          <div class="sprint-best-value">
            ${best ? fmtWpm(best.wpm) : "—"}<small>ppm</small>
          </div>
          <div class="sprint-best-sub">
            ${
              best
                ? `${fmtAcc(best.accuracy)} precisión · ${timeAgo(best.achievedAt)}`
                : "Corre tu primer sprint para entrar al ranking."
            }
          </div>
        </div>

        <div class="sprint-preview">
          <h3>Top 10 actual</h3>
          <div id="sprintPreview">${preview}</div>
          <p class="sprint-note">
            Solo se publica tu nombre, velocidad y precisión del sprint.
            El progreso de las lecciones es privado.
          </p>
        </div>
      </aside>
    </div>
  </div>`;
};

/* ============================================================
   Sprint: en juego
   ============================================================ */

export const sprintPlayView = ({ text, showKeyboard, sound }) => `
  <div class="view-inner sprint-play">
    <div class="sprint-play-head">
      <div class="sprint-play-title">
        <span class="page-kicker">${icon("zap")} Sprint de 60 segundos</span>
        <h1>${escapeHtml(text.title)}</h1>
        <p>Texto ${text.source === "db" ? "aleatorio desde Supabase" : "local"} · top 10</p>
      </div>
      <div class="sprint-live-timer" id="sprintTimerBox">
        ${icon("clock")}
        <div>
          <span class="timer-value" id="sprintTimer">1:00</span>
          <span class="timer-label">restante</span>
        </div>
      </div>
    </div>

    <div class="practice-card is-focused" id="practiceCard">
      <div class="stats-strip">
        <div class="stat-block">
          <span class="stat-block-label">Velocidad</span>
          <span class="stat-block-value"><b id="sprintWpm">0</b><small>ppm</small></span>
        </div>
        <div class="stat-block">
          <span class="stat-block-label">Precisión</span>
          <span class="stat-block-value"><b id="sprintAcc">100</b><small>%</small></span>
        </div>
        <div class="stat-block">
          <span class="stat-block-label">Aciertos</span>
          <span class="stat-block-value"><b id="sprintChars">0</b><small>car.</small></span>
        </div>
        <div class="stat-block">
          <span class="stat-block-label">Errores</span>
          <span class="stat-block-value"><b id="sprintErrors">0</b></span>
        </div>
      </div>

      <div class="stream-box" id="streamBox">
        <div class="stream" id="stream"></div>
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
        aria-label="Escribe el texto del sprint"
      />

      <div class="practice-foot">
        <span class="foot-note">${icon("info")} El cronómetro no se detiene al perder el foco.</span>
        <div class="foot-actions">${toolButtonsHtml(showKeyboard, sound)}</div>
      </div>

      <div class="key-hint" id="keyHint" hidden></div>
      <div class="keyboard-wrap${showKeyboard ? "" : " is-hidden"}" id="keyboardWrap">
        <div class="virtual-keyboard" id="virtualKeyboard"></div>
      </div>

      <div class="sprint-countdown" id="sprintCountdown">
        <div class="countdown-number" id="countdownNumber">3</div>
      </div>
    </div>
  </div>
`;

/* ============================================================
   Sprint: resultado
   ============================================================ */

export const sprintResultView = ({ sprint, isDemo, leaderboard, profile }) => {
  const { stats, reason, text, newBest } = sprint.result;
  const reasonLabel = reason === "complete" ? "Texto completado" : "Tiempo completado";
  const lead = newBest
    ? "Tu mejor marca del sprint acaba de subir. El ranking ya puede verla."
    : "Sprint registrado. Repite cuando quieras y busca una marca más alta.";
  const ranking = leaderboard?.length
    ? compactRankingHtml(leaderboard, profile.username, 5)
    : emptyState("trophy", "Todavía no hay marcas en el ranking.");

  return `<div class="view-inner sprint-result">
    ${demoBanner(isDemo)}

    <div class="sprint-result-hero">
      <span class="sprint-badge">${icon("zap")} ${reasonLabel}</span>
      <h1>${newBest ? "Nueva mejor marca" : "Sprint terminado"}</h1>
      <p class="result-lead">${lead}</p>

      <div class="sprint-result-metrics">
        <div class="metric">
          <span class="metric-label">Velocidad</span>
          <span class="metric-value">${fmtWpm(stats.wpm)}<small>ppm</small></span>
        </div>
        <div class="metric">
          <span class="metric-label">Precisión</span>
          <span class="metric-value">${fmtWpm(stats.accuracy)}<small>%</small></span>
        </div>
        <div class="metric">
          <span class="metric-label">Aciertos</span>
          <span class="metric-value">${stats.correctKeystrokes}</span>
        </div>
        <div class="metric">
          <span class="metric-label">Errores</span>
          <span class="metric-value">${stats.errors}</span>
        </div>
      </div>

      <div class="save-status" id="sprintSaveStatus"></div>

      <div class="sprint-result-actions">
        <button type="button" class="btn btn-primary" data-action="start-sprint">
          ${icon("rotate")} Repetir sprint
        </button>
        <a class="btn btn-ghost" href="#/ranking">${icon("trophy")} Ranking completo</a>
        <a class="btn btn-ghost" href="#/">${icon("keyboard")} Lecciones</a>
      </div>
    </div>

    <div class="panel">
      <div class="panel-head" style="padding:1rem 1.1rem .55rem">
        <h2 class="panel-title">${icon("trophy")} Top 10</h2>
        <a class="panel-link" href="#/ranking">Ver completo ${icon("chevron-right")}</a>
      </div>
      <div id="sprintRankingBody" style="padding:0 1.1rem 1.1rem">${ranking}</div>
    </div>

    <p class="ranking-note">Texto del sprint: ${escapeHtml(text.title)}.</p>
  </div>`;
};

/* ============================================================
   Ranking
   ============================================================ */

export const rankingView = ({ leaderboard, best, isDemo, profile }) => `
  <div class="view-inner ranking-view">
    ${demoBanner(isDemo)}

    <div class="page-head">
      <div class="page-head-copy">
        <span class="page-kicker">${icon("trophy")} Competición</span>
        <h1 class="page-title">Top 10 del sprint</h1>
        <p class="page-sub">La mejor marca de cada alumno en el minuto de velocidad.</p>
      </div>
      <div class="page-head-actions">
        <a class="btn btn-primary" href="#/sprint">${icon("zap")} Hacer un sprint</a>
      </div>
    </div>

    <div class="ranking-hero">
      <div>
        <span class="page-kicker">${icon("zap")} 60 segundos</span>
        <h1>Ranking del grupo</h1>
        <p>Un texto aleatorio por intento. Solo cuenta tu mejor marca.</p>
      </div>
      <div class="ranking-trophy" aria-hidden="true">${icon("trophy")}</div>
    </div>

    <div class="sprint-best-card" style="margin-bottom:1rem">
      <div class="sprint-best-head"><span>Tu mejor marca</span>${icon("zap")}</div>
      <div class="sprint-best-value">${best ? fmtWpm(best.wpm) : "—"}<small>ppm</small></div>
      <div class="sprint-best-sub">
        ${
          best
            ? `${fmtAcc(best.accuracy)} precisión · ${timeAgo(best.achievedAt)}`
            : "Todavía no has corrido un sprint."
        }
      </div>
    </div>

    <div id="rankingBody">
      ${
        leaderboard === null
          ? `<div class="panel" style="padding:1.5rem">${emptyState("clock", "Cargando ranking…")}</div>`
          : leaderboardHtml(leaderboard, profile.username)
      }
    </div>

    <p class="ranking-note">
      Solo aparecen los alumnos que han completado al menos un sprint.
      Tu progreso de lecciones nunca se publica.
    </p>
  </div>
`;
