/**
 * MecaSamType Web — Aplicación
 * Router por hash, autenticación, práctica, sprint y ranking.
 */

import {
  IS_CONFIGURED,
  SPRINT_SECONDS,
  normalizeUsername,
  validateUsername,
} from "./config.js";
import { LESSONS, getLesson, getNextLesson } from "./data/lessons.js";
import { api, isDemo, authErrorMessage } from "./api.js";
import { TypingEngine } from "./engine.js";
import { Keyboard } from "./keyboard.js";
import {
  icon,
  escapeHtml,
  fmtWpm,
  fmtAcc,
  fmtClock,
  initials,
  loadingHtml,
  errorPanel,
  compactRankingHtml,
  leaderboardHtml,
} from "./ui.js";
import { dashboardView, lessonView, lessonResultView } from "./views.js";
import {
  sprintIntroView,
  sprintPlayView,
  sprintResultView,
  rankingView,
} from "./sprint-views.js";

/* ============================================================
   Estado
   ============================================================ */

const SOUND_KEY = "mecasamtype.sound";
const KEYBOARD_KEY = "mecasamtype.keyboard";

const state = {
  profile: null,
  progress: new Map(),
  sessions: [],
  sprintBest: null,
  leaderboard: null,
  mode: "idle",
  lesson: null,
  engine: null,
  keyboard: null,
  input: null,
  activeUpdate: null,
  lastNext: null,
  lastResult: null,
  sprint: null,
  sound: localStorage.getItem(SOUND_KEY) !== "off",
  showKeyboard: localStorage.getItem(KEYBOARD_KEY) !== "off",
};

let authMode = "login";
let audioCtx = null;

const $ = (selector, root = document) => root.querySelector(selector);

const view = $("#view");
const authScreen = $("#authScreen");
const appScreen = $("#appScreen");
const authForm = $("#authForm");
const authName = $("#authName");
const authUsername = $("#authUsername");
const authPassword = $("#authPassword");
const authSubmit = $("#authSubmit");
const authError = $("#authError");
const nameField = $("#nameField");
const demoBox = $("#demoBox");
const demoBtn = $("#demoBtn");
const demoPill = $("#demoPill");
const passToggle = $("#passToggle");

/* ============================================================
   Arranque
   ============================================================ */

function boot() {
  bindAuth();
  bindGlobalEvents();
  updateDemoUI();
  setAuthMode("login");

  (async () => {
    try {
      const profile = await api.currentUser();

      if (profile) {
        await afterAuth(profile);
        return;
      }

      if (
        !IS_CONFIGURED &&
        new URLSearchParams(location.search).get("demo") === "1"
      ) {
        const demoProfile = await api.signInDemo();
        await afterAuth(demoProfile);
        return;
      }

      showAuth();
    } catch (error) {
      console.error("No se pudo iniciar la aplicación:", error);
      showAuth();
      setAuthError(authErrorMessage(error));
    }
  })();
}

function bindAuth() {
  document.querySelectorAll("[data-auth-tab]").forEach((button) => {
    button.addEventListener("click", () => setAuthMode(button.dataset.authTab));
  });

  authForm.addEventListener("submit", handleAuthSubmit);
  demoBtn.addEventListener("click", handleDemoLogin);
  passToggle.addEventListener("click", togglePasswordVisibility);

  [authName, authUsername, authPassword].forEach((field) => {
    field.addEventListener("input", () => setAuthError(""));
  });
}

function bindGlobalEvents() {
  window.addEventListener("hashchange", () => {
    if (!state.profile) return;
    handleRoute();
  });

  document.addEventListener("click", (event) => {
    const target = event.target.closest("[data-action]");
    if (!target) return;
    handleAction(target.dataset.action, target);
  });

  document.addEventListener("mousedown", (event) => {
    if (
      event.target.closest(
        ".practice-foot [data-action], .practice-card [data-action]"
      )
    ) {
      event.preventDefault();
    }
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden && state.mode === "lesson") pauseLesson();
  });
}

/* ============================================================
   Autenticación
   ============================================================ */

function setAuthMode(mode) {
  authMode = mode === "register" ? "register" : "login";

  document.querySelectorAll("[data-auth-tab]").forEach((button) => {
    const active = button.dataset.authTab === authMode;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-selected", String(active));
  });

  const register = authMode === "register";
  nameField.hidden = !register;
  authName.required = register;
  authPassword.autocomplete = register ? "new-password" : "current-password";

  $("#authTitle").textContent = register ? "Crear cuenta" : "Entrar";
  $("#authSubtitle").textContent = register
    ? "Elige un usuario para el curso. No necesitas correo electrónico."
    : "Tu progreso, tus marcas y el ranking del grupo.";

  refreshAuthSubmit();
  setAuthError("");
}

function refreshAuthSubmit() {
  authSubmit.disabled = false;
  authSubmit.innerHTML = `${
    authMode === "register" ? "Crear cuenta" : "Entrar"
  } ${icon("arrow-right")}`;
}

function setAuthLoading(loading) {
  if (loading) {
    authSubmit.disabled = true;
    authSubmit.innerHTML = `<span class="spinner"></span> Comprobando…`;
    return;
  }
  refreshAuthSubmit();
}

function setAuthError(message) {
  authError.textContent = message || "";
}

function togglePasswordVisibility() {
  const show = authPassword.type === "password";
  authPassword.type = show ? "text" : "password";
  passToggle.innerHTML = icon(show ? "eye-off" : "eye");
  passToggle.setAttribute(
    "aria-label",
    show ? "Ocultar contraseña" : "Mostrar contraseña"
  );
}

async function handleAuthSubmit(event) {
  event.preventDefault();
  setAuthError("");

  const username = normalizeUsername(authUsername.value);
  const password = authPassword.value;
  const displayName = authName.value.trim();

  if (!IS_CONFIGURED) {
    setAuthError(
      "Supabase no está configurado todavía. Usa el modo demo o completa js/config.js."
    );
    return;
  }

  if (!validateUsername(username)) {
    setAuthError(
      "El usuario debe tener entre 3 y 24 caracteres: minúsculas, números, punto, guion o guion bajo."
    );
    return;
  }

  if (password.length < 8) {
    setAuthError("La contraseña debe tener al menos 8 caracteres.");
    return;
  }

  if (authMode === "register" && displayName.length < 2) {
    setAuthError("Escribe tu nombre y apellido para aparecer en el ranking.");
    return;
  }

  setAuthLoading(true);

  try {
    if (authMode === "register") {
      await api.signUp({ username, displayName, password });
    } else {
      await api.signIn(username, password);
    }

    authPassword.value = "";
    await afterAuth();
  } catch (error) {
    console.error("Error de autenticación:", error);
    setAuthError(authErrorMessage(error));
  } finally {
    setAuthLoading(false);
  }
}

async function handleDemoLogin() {
  setAuthError("");
  demoBtn.disabled = true;
  demoBtn.innerHTML = `<span class="spinner"></span> Entrando…`;

  try {
    const profile = await api.signInDemo();
    await afterAuth(profile);
  } catch (error) {
    console.error("Error al entrar en demo:", error);
    setAuthError(authErrorMessage(error));
  } finally {
    demoBtn.disabled = false;
    demoBtn.innerHTML = `${icon("play")} Entrar en modo demo`;
  }
}

async function afterAuth(profile) {
  state.profile = profile || (await api.currentUser());

  if (!state.profile) {
    throw new Error("No se pudo recuperar la sesión.");
  }

  showApp();
  updateUserUI();
  view.innerHTML = loadingHtml("Cargando tu progreso…");

  try {
    await loadData();
  } catch (error) {
    console.error("No se pudo cargar el progreso:", error);
    view.innerHTML = errorPanel(
      "No se pudo cargar tu progreso",
      authErrorMessage(error),
      "Comprueba que ejecutaste sql/setup.sql completo en el SQL Editor de Supabase."
    );
    return;
  }

  handleRoute();
}

function showAuth() {
  authScreen.hidden = false;
  appScreen.hidden = true;
  demoBox.hidden = IS_CONFIGURED;
}

function showApp() {
  authScreen.hidden = true;
  appScreen.hidden = false;
  demoPill.hidden = !isDemo;
}

function updateDemoUI() {
  demoBox.hidden = IS_CONFIGURED;
  demoPill.hidden = !isDemo;
}

function updateUserUI() {
  if (!state.profile) return;

  $("#userAvatar").textContent = initials(
    state.profile.displayName || state.profile.username
  );
  $("#userName").textContent = state.profile.displayName || "Alumno";
  $("#userHandle").textContent = `@${state.profile.username}`;
}

async function logout() {
  try {
    await api.signOut();
  } catch (error) {
    console.warn("No se pudo cerrar sesión limpiamente:", error);
  }

  cleanup();
  state.profile = null;
  state.progress = new Map();
  state.sessions = [];
  state.sprintBest = null;
  state.leaderboard = null;

  if (location.hash) {
    history.replaceState(null, "", location.pathname + location.search);
  }

  setAuthMode("login");
  authPassword.value = "";
  showAuth();
}

/* ============================================================
   Router
   ============================================================ */

function parseHash() {
  const raw = location.hash.replace(/^#\/?/, "");
  const parts = raw.split("/").filter(Boolean);
  return { section: parts[0] || "", param: parts[1] || "" };
}

function navigate(hash) {
  if (location.hash === hash) {
    handleRoute();
    return;
  }
  location.hash = hash;
}

function handleRoute() {
  if (!state.profile) {
    showAuth();
    return;
  }

  cleanup();

  const { section, param } = parseHash();

  if (section === "leccion" && param) {
    const lesson = getLesson(param);
    if (lesson) {
      openLesson(lesson);
      return;
    }
  }

  if (section === "sprint") {
    openSprint();
    return;
  }

  if (section === "ranking") {
    openRanking();
    return;
  }

  openDashboard();
}

function setNav(section) {
  const key =
    section === "leccion" || section === "result" ? "lessons" : section;

  document.querySelectorAll("[data-nav]").forEach((link) => {
    link.classList.toggle("is-active", link.dataset.nav === key);
  });
}

function cleanupPractice() {
  if (state.engine) {
    state.engine.destroy();
    state.engine = null;
  }

  if (state.keyboard) {
    state.keyboard.destroy();
    state.keyboard = null;
  }

  if (state.sprint) {
    if (state.sprint.interval) {
      window.clearInterval(state.sprint.interval);
      state.sprint.interval = null;
    }
    (state.sprint.timeouts || []).forEach((id) => window.clearTimeout(id));
    state.sprint.timeouts = [];
  }

  state.input = null;
  state.activeUpdate = null;
  state.lastNext = null;
}

function cleanup() {
  cleanupPractice();
  state.mode = "idle";
  state.lesson = null;
  state.lastResult = null;
  state.sprint = null;
}

/* ============================================================
   Acciones
   ============================================================ */

function handleAction(action, target) {
  switch (action) {
    case "logout":
      logout();
      break;

    case "open-lesson": {
      const lesson = getLesson(target.dataset.id);
      if (lesson) openLesson(lesson);
      break;
    }

    case "focus-input":
      focusTyping();
      break;

    case "resume-lesson":
      resumeLesson();
      break;

    case "restart-lesson":
      if (state.lesson) openLesson(state.lesson);
      else if (state.mode.startsWith("sprint")) startSprint();
      break;

    case "retry-save":
      saveLessonResult();
      break;

    case "toggle-sound":
      toggleSound();
      break;

    case "toggle-keyboard":
      toggleKeyboard();
      break;

    case "start-sprint":
      startSprint();
      break;

    case "retry-sprint-save":
      saveSprintResult();
      break;

    default:
      break;
  }
}

/* ============================================================
   Datos y dashboard
   ============================================================ */

async function loadData() {
  const [progress, sessions, sprintBest] = await Promise.all([
    api.getProgress(),
    api.getSessions(),
    api.getSprintBest(),
  ]);

  state.progress = new Map(
    progress.map((row) => [row.lessonId, row])
  );
  state.sessions = sessions;
  state.sprintBest = sprintBest || null;

  try {
    state.leaderboard = await api.getLeaderboard();
  } catch (error) {
    console.warn("No se pudo cargar el ranking:", error);
    state.leaderboard = null;
  }
}

function computeStats() {
  const rows = [...state.progress.values()];
  const completed = rows.filter((row) => row.completed).length;
  const best = Math.max(
    0,
    ...rows.map((row) => row.bestWpm || 0),
    state.sprintBest?.wpm || 0
  );

  const recent = state.sessions.slice(0, 20);
  const accuracies = recent
    .map((session) => session.accuracy)
    .filter((value) => Number.isFinite(value) && value > 0);
  const avgAcc = accuracies.length
    ? accuracies.reduce((sum, value) => sum + value, 0) / accuracies.length
    : 0;

  return {
    completed,
    best,
    avgAcc,
    streak: computeStreak(),
    minutes: Math.round(
      state.sessions.reduce((sum, session) => sum + (session.duration || 0), 0) /
        60
    ),
  };
}

function computeStreak() {
  const dayKey = (date) =>
    `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

  const days = new Set(
    state.sessions
      .map((session) => new Date(session.createdAt))
      .filter((date) => !Number.isNaN(date.getTime()))
      .map(dayKey)
  );

  if (!days.size) return 0;

  const cursor = new Date();
  if (!days.has(dayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;
  while (days.has(dayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function isUnlocked(index) {
  if (index <= 0) return true;
  return Boolean(state.progress.get(LESSONS[index - 1].id)?.completed);
}

function nextLessonToDo() {
  for (let index = 0; index < LESSONS.length; index += 1) {
    const lesson = LESSONS[index];
    if (isUnlocked(index) && !state.progress.get(lesson.id)?.completed) {
      return lesson;
    }
  }
  return null;
}

function openDashboard() {
  state.mode = "dashboard";
  state.lesson = null;

  const stats = computeStats();
  const next = nextLessonToDo();

  view.innerHTML = dashboardView({
    profile: state.profile,
    stats,
    next,
    progress: state.progress,
    sessions: state.sessions,
    sprintBest: state.sprintBest,
    leaderboard: state.leaderboard,
    isDemo,
  });

  setNav("lessons");
  hydrateMiniRanking();
}

function hydrateMiniRanking() {
  const element = document.getElementById("miniRanking");
  if (!element) return;

  if (state.leaderboard !== null) {
    element.innerHTML = compactRankingHtml(
      state.leaderboard,
      state.profile.username,
      3
    );
    return;
  }

  getLeaderboardSafe().then((rows) => {
    const current = document.getElementById("miniRanking");
    if (current) {
      current.innerHTML = compactRankingHtml(
        rows,
        state.profile.username,
        3
      );
    }
  });
}

/* ============================================================
   Lección
   ============================================================ */

function openLesson(lesson) {
  if (!lesson) return;

  if (!isUnlocked(lesson.globalIndex)) {
    toast("Completa la lección anterior para desbloquear esta.", "amber");
    navigate("#/");
    return;
  }

  cleanupPractice();

  state.mode = "lesson";
  state.lesson = lesson;
  state.lastResult = null;
  state.lastNext = null;

  const previous = state.progress.get(lesson.id) || null;

  view.innerHTML = lessonView({
    lesson,
    previous,
    showKeyboard: state.showKeyboard,
    sound: state.sound,
  });

  setNav("lessons");

  const input = document.getElementById("typingInput");
  const stream = document.getElementById("stream");
  if (!input || !stream) return;

  state.input = input;
  state.activeUpdate = updateLessonStats;

  state.keyboard = new Keyboard(document.getElementById("virtualKeyboard"));
  state.engine = new TypingEngine({
    text: lesson.text,
    container: stream,
    onUpdate: updateLessonStats,
    onComplete: finishLesson,
    onKey: handleEngineKey,
  });

  attachTypingInput(input);
  updateLessonStats(state.engine.stats());
}

function attachTypingInput(input) {
  input.addEventListener("input", handleTypingInput);
  input.addEventListener("keydown", handleTypingKeyDown);
  input.addEventListener("paste", (event) => event.preventDefault());
  input.addEventListener("focus", handleTypingFocus);
  input.addEventListener("blur", handleTypingBlur);

  const box = document.getElementById("streamBox");
  box?.addEventListener("click", (event) => {
    if (event.target.closest("[data-action]")) return;
    if (state.mode === "lesson" || state.mode === "sprint") focusTyping();
  });
}

function handleTypingInput(event) {
  if (event.isComposing) return;

  const input = event.currentTarget;
  const value = input.value;
  input.value = "";

  if (!value || !state.engine) return;
  if (state.mode === "sprint" && state.sprint?.phase !== "running") return;

  const engine = state.engine;

  for (const char of Array.from(value)) {
    if (char === "\n" || char === "\r" || char === "\t") continue;
    engine.handleChar(char);
    if (engine.finished) break;
  }
}

function handleTypingKeyDown(event) {
  state.keyboard?.press(event.key);

  if (event.key === "Escape") {
    if (state.mode === "lesson") {
      event.preventDefault();
      pauseLesson();
    }
    return;
  }

  if (event.key === "Backspace") {
    event.preventDefault();
    state.engine?.backspace();
    return;
  }

  if (event.key === "Enter" || event.key === "Tab") {
    event.preventDefault();
  }
}

function handleTypingFocus() {
  document.getElementById("practiceCard")?.classList.add("is-focused");

  if (state.mode === "sprint") return;

  if (!state.engine?.paused) {
    const start = document.getElementById("startOverlay");
    if (start) start.hidden = true;
  }
}

function handleTypingBlur() {
  document.getElementById("practiceCard")?.classList.remove("is-focused");

  if (state.mode !== "lesson" || !state.engine) return;

  if (state.engine.started && !state.engine.finished) {
    pauseLesson();
    return;
  }

  if (!state.engine.started) {
    const start = document.getElementById("startOverlay");
    if (start) start.hidden = false;
  }
}

function updateLessonStats(stats) {
  const wpm = document.getElementById("statWpm");
  if (!wpm) return;

  wpm.textContent = fmtWpm(stats.wpm);
  document.getElementById("statAcc").textContent = fmtWpm(stats.accuracy);
  document.getElementById("statTime").textContent = fmtClock(stats.duration);
  document.getElementById("statProgress").textContent = `${Math.round(
    stats.progress * 100
  )}%`;
  document.getElementById("statBar").style.width = `${Math.round(
    stats.progress * 100
  )}%`;

  updateKeyboardHint(stats.nextChar);
}

function updateKeyboardHint(nextChar) {
  if (nextChar === state.lastNext) return;
  state.lastNext = nextChar;

  const hint = state.keyboard ? state.keyboard.setNext(nextChar) : "";
  renderKeyHint(nextChar, hint);
}

function renderKeyHint(char, hint) {
  const element = document.getElementById("keyHint");
  if (!element) return;

  if (!state.showKeyboard || !char) {
    element.hidden = true;
    element.innerHTML = "";
    return;
  }

  const label = char === " " ? "espacio" : char;
  element.hidden = false;
  element.innerHTML = `<span>Siguiente</span><span class="key-hint-char">${escapeHtml(
    label
  )}</span>${
    hint ? `<span class="key-hint-combo">${escapeHtml(hint)}</span>` : ""
  }`;
}

function focusTyping() {
  state.input?.focus({ preventScroll: true });
}

function pauseLesson() {
  const engine = state.engine;
  if (!engine || !engine.started || engine.finished) return;

  engine.pause();

  const pause = document.getElementById("pauseOverlay");
  if (pause) pause.hidden = false;

  const start = document.getElementById("startOverlay");
  if (start) start.hidden = true;
}

function resumeLesson() {
  if (!state.engine) return;

  const pause = document.getElementById("pauseOverlay");
  if (pause) pause.hidden = true;

  state.engine.resume();
  focusTyping();
}

function computeStars(stats, lesson) {
  let stars = 1;
  if (stats.accuracy >= lesson.goalAccuracy) stars = 2;
  if (stats.accuracy >= lesson.goalAccuracy && stats.wpm >= lesson.goalWpm) {
    stars = 3;
  }
  return stars;
}

function finishLesson(stats) {
  const lesson = state.lesson;
  if (!lesson || state.mode !== "lesson") return;

  const previous = state.progress.get(lesson.id) || null;
  const stars = computeStars(stats, lesson);
  const isRecord =
    Boolean(previous) && stats.wpm > (previous.bestWpm || 0) + 0.05;

  state.lastResult = {
    lesson,
    stats,
    stars,
    previous,
    isRecord,
    saving: false,
    saved: false,
  };
  state.mode = "result";

  state.keyboard?.destroy();
  state.keyboard = null;
  state.engine?.destroy();
  state.engine = null;
  state.input = null;
  state.activeUpdate = null;

  const next = getNextLesson(lesson.id);

  view.innerHTML = lessonResultView({
    lesson,
    stats,
    stars,
    previous,
    isRecord,
    next,
  });

  setNav("lessons");
  window.scrollTo({ top: 0, behavior: "auto" });
  saveLessonResult();
}

async function saveLessonResult() {
  const context = state.lastResult;
  if (!context || context.saving || context.saved) return;

  context.saving = true;
  setSaveStatus("saving");

  try {
    const row = await api.saveLesson({
      lessonId: context.lesson.id,
      wpm: context.stats.wpm,
      accuracy: context.stats.accuracy,
      stars: context.stars,
      duration: context.stats.duration,
      totalChars: context.stats.totalKeystrokes,
      errors: context.stats.errors,
    });

    const merged = row || {
      lessonId: context.lesson.id,
      bestWpm: Math.max(context.previous?.bestWpm || 0, context.stats.wpm),
      bestAccuracy: Math.max(
        context.previous?.bestAccuracy || 0,
        context.stats.accuracy
      ),
      stars: Math.max(context.previous?.stars || 0, context.stars),
      attempts: (context.previous?.attempts || 0) + 1,
      completed: true,
      lastPracticedAt: new Date().toISOString(),
    };

    state.progress.set(context.lesson.id, merged);
    state.sessions.unshift({
      id: `local-${Date.now()}`,
      lessonId: context.lesson.id,
      wpm: context.stats.wpm,
      accuracy: context.stats.accuracy,
      duration: context.stats.duration,
      chars: context.stats.totalKeystrokes,
      errors: context.stats.errors,
      createdAt: new Date().toISOString(),
    });
    state.sessions = state.sessions.slice(0, 80);

    context.saved = true;
    setSaveStatus("saved");
  } catch (error) {
    console.error("No se pudo guardar la lección:", error);
    context.saved = false;
    setSaveStatus("error", error);
  } finally {
    context.saving = false;
  }
}

function setSaveStatus(kind, error) {
  const element = document.getElementById("saveStatus");
  if (!element) return;

  element.className = "save-status";

  if (kind === "saving") {
    element.classList.add("is-saving");
    element.innerHTML = `<span class="spinner"></span> Guardando progreso…`;
    return;
  }

  if (kind === "saved") {
    element.classList.add("is-saved");
    element.innerHTML = `${icon("check")} ${
      isDemo ? "Guardado en este navegador" : "Progreso guardado en tu cuenta"
    }`;
    return;
  }

  element.classList.add("is-error");
  element.innerHTML = `${icon("alert")} No se pudo guardar.${
    error?.message
      ? ` <span title="${escapeHtml(error.message)}">(detalle)</span>`
      : ""
  } <button type="button" class="retry" data-action="retry-save">Reintentar</button>`;
}

/* ============================================================
   Sprint
   ============================================================ */

const zeroStats = () => ({
  wpm: 0,
  accuracy: 100,
  errors: 0,
  correctKeystrokes: 0,
  totalKeystrokes: 0,
  duration: 0,
  elapsedMs: 0,
  index: 0,
  length: 0,
  progress: 0,
  nextChar: null,
  started: false,
  finished: true,
  paused: false,
});

function openSprint() {
  cleanupPractice();
  state.sprint = null;
  state.mode = "sprint-intro";
  state.lesson = null;

  view.innerHTML = sprintIntroView({
    best: state.sprintBest,
    leaderboard: state.leaderboard,
    isDemo,
    profile: state.profile,
  });

  setNav("sprint");
  hydrateSprintPreview();
}

function hydrateSprintPreview() {
  const element = document.getElementById("sprintPreview");
  if (!element) return;

  if (state.leaderboard !== null) {
    element.innerHTML = compactRankingHtml(
      state.leaderboard,
      state.profile.username,
      3
    );
    return;
  }

  getLeaderboardSafe().then((rows) => {
    const current = document.getElementById("sprintPreview");
    if (current) {
      current.innerHTML = compactRankingHtml(
        rows,
        state.profile.username,
        3
      );
    }
  });
}

async function startSprint() {
  if (
    state.sprint?.starting ||
    state.sprint?.phase === "countdown" ||
    state.sprint?.phase === "running"
  ) {
    return;
  }

  cleanupPractice();
  state.sprint = { starting: true };
  state.mode = "sprint";
  view.innerHTML = loadingHtml("Buscando un texto aleatorio…");
  setNav("sprint");

  try {
    const text = await api.getSprintText();
    if (!text?.body) throw new Error("No hay textos disponibles.");
    mountSprint(text);
  } catch (error) {
    console.error("No se pudo preparar el sprint:", error);
    state.sprint = null;
    toast("No se pudo preparar el sprint. Inténtalo de nuevo.", "error");
    openSprint();
  }
}

function mountSprint(text) {
  state.sprint = {
    phase: "countdown",
    text,
    interval: null,
    timeouts: [],
    submitted: false,
    saving: false,
    result: null,
  };
  state.mode = "sprint";
  state.lastNext = null;

  view.innerHTML = sprintPlayView({
    text,
    showKeyboard: state.showKeyboard,
    sound: state.sound,
  });

  setNav("sprint");

  const input = document.getElementById("typingInput");
  const stream = document.getElementById("stream");
  if (!input || !stream) return;

  state.input = input;
  state.activeUpdate = updateSprintStats;

  state.keyboard = new Keyboard(document.getElementById("virtualKeyboard"));
  state.engine = new TypingEngine({
    text: text.body,
    container: stream,
    onUpdate: updateSprintStats,
    onComplete: () => finishSprint("complete"),
    onKey: handleEngineKey,
  });

  attachTypingInput(input);
  updateSprintStats(state.engine.stats());

  const countdown = document.getElementById("sprintCountdown");
  countdown?.addEventListener("click", () => input.focus({ preventScroll: true }));

  input.focus({ preventScroll: true });

  const overlay = countdown;
  const number = document.getElementById("countdownNumber");

  const steps = [
    ["3", 0],
    ["2", 900],
    ["1", 1800],
    ["¡Ya!", 2700],
  ];

  steps.forEach(([label, delay]) => {
    const id = window.setTimeout(() => {
      if (!state.sprint || state.sprint.phase !== "countdown") return;

      number.textContent = label;
      number.classList.toggle("is-go", label === "¡Ya!");
      number.style.animation = "none";
      void number.offsetWidth;
      number.style.animation = "";

      if (label === "¡Ya!") {
        const startId = window.setTimeout(() => {
          if (!state.sprint || state.sprint.phase !== "countdown") return;

          if (overlay) overlay.hidden = true;
          state.sprint.phase = "running";
          state.sprint.endsAt = performance.now() + SPRINT_SECONDS * 1000;
          state.engine?.start();
          state.input?.focus({ preventScroll: true });
          state.sprint.interval = window.setInterval(updateSprintTimer, 100);
          updateSprintTimer();
        }, 320);

        state.sprint.timeouts.push(startId);
      }
    }, delay);

    state.sprint.timeouts.push(id);
  });
}

function updateSprintStats(stats) {
  const wpm = document.getElementById("sprintWpm");
  if (!wpm) return;

  wpm.textContent = fmtWpm(stats.wpm);
  document.getElementById("sprintAcc").textContent = fmtWpm(stats.accuracy);
  document.getElementById("sprintChars").textContent =
    stats.correctKeystrokes;
  document.getElementById("sprintErrors").textContent = stats.errors;

  updateKeyboardHint(stats.nextChar);
}

function updateSprintTimer() {
  const sprint = state.sprint;
  if (!sprint || sprint.phase !== "running") return;

  const remaining = Math.max(0, sprint.endsAt - performance.now());
  const timer = document.getElementById("sprintTimer");
  if (timer) timer.textContent = fmtClock(Math.ceil(remaining / 1000));

  const box = document.getElementById("sprintTimerBox");
  if (box) box.classList.toggle("is-warning", remaining <= 10000);

  if (remaining <= 0) finishSprint("time");
}

function finishSprint(reason) {
  const sprint = state.sprint;
  if (!sprint || sprint.phase === "finished") return;

  sprint.phase = "finished";

  if (sprint.interval) {
    window.clearInterval(sprint.interval);
    sprint.interval = null;
  }
  (sprint.timeouts || []).forEach((id) => window.clearTimeout(id));
  sprint.timeouts = [];

  const stats = state.engine ? state.engine.stop() : zeroStats();
  const previousBest = state.sprintBest;
  const newBest =
    stats.totalKeystrokes > 0 &&
    (!previousBest || stats.wpm > previousBest.wpm + 0.01);

  sprint.result = { stats, reason, text: sprint.text, newBest };

  state.mode = "sprint-result";
  state.keyboard?.destroy();
  state.keyboard = null;
  state.engine?.destroy();
  state.engine = null;
  state.input = null;
  state.activeUpdate = null;

  view.innerHTML = sprintResultView({
    sprint,
    isDemo,
    leaderboard: state.leaderboard,
    profile: state.profile,
  });

  setNav("sprint");
  window.scrollTo({ top: 0, behavior: "auto" });

  if (stats.totalKeystrokes > 0) {
    saveSprintResult();
  } else {
    setSprintSaveStatus("none");
    refreshSprintRanking();
  }
}

async function saveSprintResult() {
  const sprint = state.sprint;
  if (!sprint?.result || sprint.saving || sprint.submitted) return;

  const { stats, text } = sprint.result;

  if (stats.totalKeystrokes <= 0) {
    setSprintSaveStatus("none");
    return;
  }

  sprint.saving = true;
  setSprintSaveStatus("saving");

  try {
    await api.saveSprintRun({
      textId: text.dbId ?? null,
      wpm: stats.wpm,
      accuracy: stats.accuracy,
      chars: stats.correctKeystrokes,
      errors: stats.errors,
    });

    sprint.submitted = true;

    if (sprint.result.newBest) {
      state.sprintBest = {
        wpm: stats.wpm,
        accuracy: stats.accuracy,
        chars: stats.correctKeystrokes,
        achievedAt: new Date().toISOString(),
      };
    }

    setSprintSaveStatus("saved");
  } catch (error) {
    console.error("No se pudo guardar el sprint:", error);
    setSprintSaveStatus("error", error);
  } finally {
    sprint.saving = false;
    await refreshSprintRanking();
  }
}

function setSprintSaveStatus(kind, error) {
  const element = document.getElementById("sprintSaveStatus");
  if (!element) return;

  element.className = "save-status";

  if (kind === "saving") {
    element.innerHTML = `<span class="spinner"></span> Guardando marca…`;
    return;
  }

  if (kind === "saved") {
    element.classList.add("is-saved");
    element.innerHTML = `${icon("check")} ${
      isDemo ? "Marca guardada en este navegador" : "Marca publicada en el ranking"
    }`;
    return;
  }

  if (kind === "none") {
    element.innerHTML = `${icon("info")} No se registró marca porque no escribiste ningún carácter.`;
    return;
  }

  element.classList.add("is-error");
  element.innerHTML = `${icon("alert")} No se pudo guardar la marca.${
    error?.message
      ? ` <span title="${escapeHtml(error.message)}">(detalle)</span>`
      : ""
  } <button type="button" class="retry" data-action="retry-sprint-save">Reintentar</button>`;
}

async function refreshSprintRanking() {
  try {
    const rows = await api.getLeaderboard();
    state.leaderboard = rows;

    const element = document.getElementById("sprintRankingBody");
    if (element) {
      element.innerHTML = compactRankingHtml(rows, state.profile.username, 5);
    }
  } catch (error) {
    console.warn("No se pudo actualizar el ranking del sprint:", error);
  }
}

/* ============================================================
   Ranking
   ============================================================ */

function openRanking() {
  state.mode = "ranking";
  state.lesson = null;

  view.innerHTML = rankingView({
    leaderboard: state.leaderboard,
    best: state.sprintBest,
    isDemo,
    profile: state.profile,
  });

  setNav("ranking");
  loadRankingBody();
}

async function loadRankingBody() {
  try {
    const rows = await api.getLeaderboard();
    state.leaderboard = rows;

    const body = document.getElementById("rankingBody");
    if (body) body.innerHTML = leaderboardHtml(rows, state.profile.username);
  } catch (error) {
    console.warn("No se pudo cargar el ranking:", error);

    if (state.leaderboard === null) {
      state.leaderboard = [];
      const body = document.getElementById("rankingBody");
      if (body) {
        body.innerHTML = `<div class="panel rank-empty">
          ${icon("alert")}
          <p style="margin-top:.4rem">No se pudo cargar el ranking. Revisa la conexión con Supabase.</p>
        </div>`;
      }
    }
  }
}

async function getLeaderboardSafe(force = false) {
  if (!force && state.leaderboard !== null) return state.leaderboard;

  try {
    state.leaderboard = await api.getLeaderboard();
    return state.leaderboard;
  } catch (error) {
    console.warn("No se pudo obtener el ranking:", error);
    if (state.leaderboard === null) state.leaderboard = [];
    return state.leaderboard;
  }
}

/* ============================================================
   Preferencias y sonido
   ============================================================ */

function toggleSound() {
  state.sound = !state.sound;
  localStorage.setItem(SOUND_KEY, state.sound ? "on" : "off");
  refreshToolButtons();

  if (state.sound) playKeySound(true);
  focusTyping();
}

function toggleKeyboard() {
  state.showKeyboard = !state.showKeyboard;
  localStorage.setItem(KEYBOARD_KEY, state.showKeyboard ? "on" : "off");

  const wrap = document.getElementById("keyboardWrap");
  if (wrap) wrap.classList.toggle("is-hidden", !state.showKeyboard);

  refreshToolButtons();

  if (!state.showKeyboard) {
    const hint = document.getElementById("keyHint");
    if (hint) hint.hidden = true;
  } else {
    state.lastNext = null;
    const stats = state.engine?.stats();
    if (stats) state.activeUpdate?.(stats);
  }

  focusTyping();
}

function refreshToolButtons() {
  document.querySelectorAll('[data-action="toggle-sound"]').forEach((button) => {
    button.innerHTML = `${icon(state.sound ? "volume" : "volume-off")} ${
      state.sound ? "Sonido" : "Silencio"
    }`;
    button.classList.toggle("is-off", !state.sound);
    button.setAttribute("aria-pressed", String(state.sound));
  });

  document
    .querySelectorAll('[data-action="toggle-keyboard"]')
    .forEach((button) => {
      button.innerHTML = `${icon("keyboard")} ${
        state.showKeyboard ? "Teclado" : "Sin teclado"
      }`;
      button.classList.toggle("is-off", !state.showKeyboard);
      button.setAttribute("aria-pressed", String(state.showKeyboard));
    });
}

function playKeySound(correct) {
  if (!state.sound) return;

  try {
    audioCtx ||= new (window.AudioContext || window.webkitAudioContext)();

    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }

    const oscillator = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const now = audioCtx.currentTime;

    oscillator.type = "sine";
    oscillator.frequency.value = correct ? 620 : 170;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(correct ? 0.025 : 0.045, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.075);

    oscillator.connect(gain);
    gain.connect(audioCtx.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.085);
  } catch (error) {
    // El audio es opcional; si el navegador lo bloquea, no pasa nada.
  }
}

function handleEngineKey({ correct, backspace }) {
  if (backspace) return;
  playKeySound(correct);
}

/* ============================================================
   Avisos
   ============================================================ */

function toast(message, type = "info") {
  const container = document.getElementById("toasts");
  if (!container) return;

  const element = document.createElement("div");
  element.className = `toast toast-${type}`;
  element.innerHTML = `${icon(
    type === "error" || type === "amber" ? "alert" : "check"
  )}<span>${escapeHtml(message)}</span>`;
  container.appendChild(element);

  window.setTimeout(() => {
    element.classList.add("is-out");
    window.setTimeout(() => element.remove(), 260);
  }, 3800);
}

boot();


