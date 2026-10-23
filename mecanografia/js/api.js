/**
 * MecaSamType Web — Capa de datos
 *
 * Dos adaptadores con la misma interfaz:
 *  - Supabase (cuentas reales, progreso y ranking compartido).
 *  - Demo local (localStorage) cuando config.js aún no tiene credenciales.
 */

import {
  IS_CONFIGURED,
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  DB_SCHEMA,
  normalizeUsername,
} from "./config.js";
import { getRandomLocalText } from "./data/sprint-texts.js";

const SDK_URL = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

let clientPromise = null;

async function getClient() {
  if (!IS_CONFIGURED) throw new Error("Supabase no está configurado.");
  if (!clientPromise) {
    clientPromise = import(SDK_URL)
      .then(({ createClient }) =>
        createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
          // Todo el módulo vive en su propio esquema de Postgres.
          db: { schema: DB_SCHEMA },
          // No usamos Supabase Auth: no debe leer ni guardar sesiones propias.
          auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
          },
        })
      )
      .catch((error) => {
        clientPromise = null;
        throw error;
      });
  }
  return clientPromise;
}

const asNumber = (value) => (value == null ? 0 : Number(value));

const normalizeProgress = (row) => ({
  lessonId: row.lesson_id,
  bestWpm: asNumber(row.best_wpm),
  bestAccuracy: asNumber(row.best_accuracy),
  stars: Number(row.stars) || 0,
  attempts: Number(row.attempts) || 0,
  completed: Boolean(row.completed),
  lastPracticedAt: row.last_practiced_at,
});

const normalizeSession = (row) => ({
  id: row.id,
  lessonId: row.lesson_id,
  wpm: asNumber(row.wpm),
  accuracy: asNumber(row.accuracy),
  duration: Number(row.duration_seconds) || 0,
  chars: Number(row.total_chars) || 0,
  errors: Number(row.errors) || 0,
  createdAt: row.created_at,
});

const normalizeLeaderboard = (row) => ({
  rank: Number(row.rank) || 0,
  username: row.username,
  displayName: row.display_name,
  wpm: asNumber(row.wpm),
  accuracy: asNumber(row.accuracy),
  chars: Number(row.chars) || 0,
  achievedAt: row.achieved_at,
});

/* ============================================================
   Adaptador Supabase
   ============================================================ */

/* ============================================================
   Sesión propia (sin Supabase Auth)
   ------------------------------------------------------------
   El token se guarda en localStorage y viaja en cada RPC.
   Las tablas no son accesibles: solo las funciones del esquema.
   ============================================================ */

const TOKEN_KEY = "mecasamtype.token.v1";

function readToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || "";
  } catch (error) {
    return "";
  }
}

function writeToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.warn("No se pudo guardar la sesión:", error);
  }
}

const profileFromRow = (row) =>
  row
    ? {
        id: null,
        username: row.username,
        displayName: row.display_name || row.username,
      }
    : null;

const isInvalidSession = (error) =>
  error?.code === "28000" ||
  /Sesión no válida|cuenta está desactivada/i.test(error?.message || "");

const firstRow = (data) => (Array.isArray(data) ? data[0] : data);

async function callRpc(name, args) {
  const supabase = await getClient();
  const { data, error } = await supabase.rpc(name, args);
  if (error) throw error;
  return data;
}

const supabaseApi = {
  async currentUser() {
    const token = readToken();
    if (!token) return null;

    try {
      const row = firstRow(await callRpc("get_me", { p_token: token }));

      if (!row) {
        writeToken("");
        return null;
      }

      return profileFromRow(row);
    } catch (error) {
      if (isInvalidSession(error)) {
        writeToken("");
        return null;
      }
      throw error;
    }
  },

  async signIn(username, password) {
    const row = firstRow(
      await callRpc("login_student", {
        p_username: normalizeUsername(username),
        p_password: password,
      })
    );

    if (!row?.auth_token) throw new Error("No se pudo iniciar sesión.");

    writeToken(row.auth_token);
    return profileFromRow(row);
  },

  async signUp({ username, displayName, password }) {
    const row = firstRow(
      await callRpc("register_student", {
        p_username: normalizeUsername(username),
        p_display_name: String(displayName || "").trim(),
        p_password: password,
      })
    );

    if (!row?.auth_token) throw new Error("No se pudo crear la cuenta.");

    writeToken(row.auth_token);
    return profileFromRow(row);
  },

  async signOut() {
    const token = readToken();
    writeToken("");

    if (!token) return;

    try {
      await callRpc("logout_student", { p_token: token });
    } catch (error) {
      console.warn("No se pudo cerrar la sesión en el servidor:", error);
    }
  },

  async getProgress() {
    const rows = await callRpc("get_progress", { p_token: readToken() });
    return (rows || []).map(normalizeProgress);
  },

  async getSessions() {
    const rows = await callRpc("get_practice_sessions", {
      p_token: readToken(),
    });
    return (rows || []).map(normalizeSession);
  },

  async saveLesson({
    lessonId,
    wpm,
    accuracy,
    stars,
    duration,
    totalChars,
    errors,
  }) {
    const row = firstRow(
      await callRpc("record_lesson_result", {
        p_token: readToken(),
        p_lesson_id: lessonId,
        p_wpm: wpm,
        p_accuracy: accuracy,
        p_stars: stars,
        p_duration: duration,
        p_total_chars: totalChars,
        p_errors: errors,
      })
    );

    return row ? normalizeProgress(row) : null;
  },

  async getSprintText() {
    try {
      const row = firstRow(
        await callRpc("get_random_sprint_text", { p_token: readToken() })
      );

      if (row?.body) {
        return {
          dbId: Number(row.id),
          title: row.title,
          body: row.body,
          source: "db",
        };
      }
    } catch (error) {
      console.warn(
        "No se pudo cargar el texto del sprint desde Supabase:",
        error
      );
    }

    const local = getRandomLocalText();
    return { dbId: null, title: local.title, body: local.body, source: "local" };
  },

  async saveSprintRun({ textId, wpm, accuracy, chars, errors }) {
    return callRpc("submit_sprint_run", {
      p_token: readToken(),
      p_text_id: textId ?? null,
      p_wpm: wpm,
      p_accuracy: accuracy,
      p_chars: chars,
      p_errors: errors,
    });
  },

  async getSprintBest() {
    const row = firstRow(
      await callRpc("get_sprint_best", { p_token: readToken() })
    );

    if (!row) return null;

    return {
      wpm: asNumber(row.wpm),
      accuracy: asNumber(row.accuracy),
      chars: Number(row.chars) || 0,
      achievedAt: row.achieved_at,
    };
  },

  async getLeaderboard() {
    const rows = await callRpc("get_sprint_leaderboard", {
      p_token: readToken(),
    });
    return (rows || []).map(normalizeLeaderboard);
  },
};

/* ============================================================
   Adaptador demo (localStorage)
   ============================================================ */

const DEMO_KEY = "mecasamtype.demo.v2";

const demoDate = (daysAgo, hour = 18) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hour, 12, 0, 0);
  return date.toISOString();
};

const DEMO_PLAYERS = [
  { username: "lucia", displayName: "Lucía M.", wpm: 61.4, accuracy: 98.6, chars: 307, achievedAt: demoDate(0) },
  { username: "dani_88", displayName: "Dani R.", wpm: 57.2, accuracy: 97.9, chars: 286, achievedAt: demoDate(0, 16) },
  { username: "andrea", displayName: "Andrea P.", wpm: 54.8, accuracy: 98.2, chars: 274, achievedAt: demoDate(1) },
  { username: "marcos", displayName: "Marcos G.", wpm: 51.3, accuracy: 96.7, chars: 257, achievedAt: demoDate(1, 17) },
  { username: "paula", displayName: "Paula S.", wpm: 48.9, accuracy: 97.1, chars: 245, achievedAt: demoDate(2) },
  { username: "nerea", displayName: "Nerea C.", wpm: 45.6, accuracy: 95.8, chars: 228, achievedAt: demoDate(2, 19) },
  { username: "ivan", displayName: "Iván L.", wpm: 43.2, accuracy: 96.4, chars: 216, achievedAt: demoDate(3) },
  { username: "sofia", displayName: "Sofía T.", wpm: 40.7, accuracy: 94.9, chars: 204, achievedAt: demoDate(3, 20) },
  { username: "jorge", displayName: "Jorge A.", wpm: 38.4, accuracy: 95.5, chars: 192, achievedAt: demoDate(4) },
  { username: "clara", displayName: "Clara V.", wpm: 35.9, accuracy: 94.2, chars: 180, achievedAt: demoDate(4, 17) },
];

function createDemoData() {
  return {
    session: null,
    progress: {
      "u1-l1": {
        lessonId: "u1-l1",
        bestWpm: 34.2,
        bestAccuracy: 98.1,
        stars: 3,
        attempts: 5,
        completed: true,
        lastPracticedAt: demoDate(6),
      },
      "u1-l2": {
        lessonId: "u1-l2",
        bestWpm: 31.6,
        bestAccuracy: 97.4,
        stars: 3,
        attempts: 4,
        completed: true,
        lastPracticedAt: demoDate(5),
      },
      "u1-l3": {
        lessonId: "u1-l3",
        bestWpm: 27.9,
        bestAccuracy: 95.8,
        stars: 2,
        attempts: 3,
        completed: true,
        lastPracticedAt: demoDate(2),
      },
      "u1-l4": {
        lessonId: "u1-l4",
        bestWpm: 24.3,
        bestAccuracy: 94.6,
        stars: 1,
        attempts: 2,
        completed: true,
        lastPracticedAt: demoDate(1),
      },
    },
    sessions: [
      { id: 8, lessonId: "u1-l4", wpm: 24.3, accuracy: 94.6, duration: 46, chars: 102, errors: 9, createdAt: demoDate(1) },
      { id: 7, lessonId: "u1-l3", wpm: 27.9, accuracy: 95.8, duration: 38, chars: 96, errors: 6, createdAt: demoDate(2) },
      { id: 6, lessonId: "u1-l4", wpm: 22.8, accuracy: 93.1, duration: 51, chars: 102, errors: 12, createdAt: demoDate(3) },
      { id: 5, lessonId: "u1-l3", wpm: 26.4, accuracy: 96.4, duration: 40, chars: 96, errors: 5, createdAt: demoDate(4) },
      { id: 4, lessonId: "u1-l2", wpm: 31.6, accuracy: 97.4, duration: 35, chars: 84, errors: 3, createdAt: demoDate(5) },
      { id: 3, lessonId: "u1-l1", wpm: 34.2, accuracy: 98.1, duration: 30, chars: 82, errors: 2, createdAt: demoDate(6) },
      { id: 2, lessonId: "u1-l2", wpm: 29.8, accuracy: 96.8, duration: 41, chars: 84, errors: 4, createdAt: demoDate(7) },
      { id: 1, lessonId: "u1-l1", wpm: 32.1, accuracy: 97.2, duration: 33, chars: 82, errors: 3, createdAt: demoDate(8) },
    ],
    sprintRuns: [
      { id: 1, textId: 3, wpm: 46.8, accuracy: 96.2, chars: 234, errors: 9, createdAt: demoDate(2) },
    ],
    nextId: 100,
  };
}

function loadDemo() {
  try {
    const raw = localStorage.getItem(DEMO_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.progress && parsed.sessions) return parsed;
    }
  } catch (error) {
    console.warn("No se pudo leer el almacenamiento demo:", error);
  }
  const data = createDemoData();
  saveDemo(data);
  return data;
}

function saveDemo(data) {
  try {
    localStorage.setItem(DEMO_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn("No se pudo guardar el progreso demo:", error);
  }
}

const demoProfile = (data) =>
  data.session
    ? { id: "demo", username: data.session.username, displayName: data.session.displayName }
    : null;

const demoApi = {
  async currentUser() {
    return demoProfile(loadDemo());
  },

  async signIn(username, password) {
    if (!username || !password) throw new Error("Escribe usuario y contraseña.");
    const data = loadDemo();
    data.session = {
      username: normalizeUsername(username) || "demo",
      displayName: username || "Alumno Demo",
    };
    saveDemo(data);
    return demoProfile(data);
  },

  async signUp({ username, displayName, password }) {
    if (!password || password.length < 6) {
      throw new Error("La contraseña debe tener al menos 6 caracteres.");
    }
    const data = loadDemo();
    data.session = {
      username: normalizeUsername(username) || "demo",
      displayName: displayName || username || "Alumno Demo",
    };
    saveDemo(data);
    return demoProfile(data);
  },

  async signInDemo() {
    const data = loadDemo();
    if (!data.session) {
      data.session = { username: "demo", displayName: "Alumno Demo" };
      saveDemo(data);
    }
    return demoProfile(data);
  },

  async signOut() {
    const data = loadDemo();
    data.session = null;
    saveDemo(data);
  },

  async getProgress() {
    return Object.values(loadDemo().progress).sort((a, b) =>
      String(b.lastPracticedAt).localeCompare(String(a.lastPracticedAt))
    );
  },

  async getSessions() {
    return [...loadDemo().sessions].sort((a, b) =>
      String(b.createdAt).localeCompare(String(a.createdAt))
    );
  },

  async saveLesson({ lessonId, wpm, accuracy, stars, duration, totalChars, errors }) {
    const data = loadDemo();
    const previous = data.progress[lessonId];
    const now = new Date().toISOString();
    const row = {
      lessonId,
      bestWpm: Math.max(previous?.bestWpm || 0, wpm),
      bestAccuracy: Math.max(previous?.bestAccuracy || 0, accuracy),
      stars: Math.max(previous?.stars || 0, stars),
      attempts: (previous?.attempts || 0) + 1,
      completed: true,
      lastPracticedAt: now,
    };
    data.progress[lessonId] = row;
    data.sessions.unshift({
      id: data.nextId++,
      lessonId,
      wpm,
      accuracy,
      duration,
      chars: totalChars,
      errors,
      createdAt: now,
    });
    data.sessions = data.sessions.slice(0, 80);
    saveDemo(data);
    return { ...row };
  },

  async getSprintText() {
    const local = getRandomLocalText();
    return {
      dbId: null,
      title: local.title,
      body: local.body,
      source: "demo",
    };
  },

  async saveSprintRun({ textId, wpm, accuracy, chars, errors }) {
    const data = loadDemo();
    const id = data.nextId++;
    data.sprintRuns.push({
      id,
      textId: textId ?? null,
      wpm,
      accuracy,
      chars,
      errors,
      createdAt: new Date().toISOString(),
    });
    data.sprintRuns = data.sprintRuns.slice(-100);
    saveDemo(data);
    return id;
  },

  async getSprintBest() {
    const runs = loadDemo().sprintRuns;
    if (!runs.length) return null;
    const best = runs.reduce((a, b) =>
      b.wpm > a.wpm || (b.wpm === a.wpm && b.accuracy > a.accuracy) ? b : a
    );
    return {
      wpm: best.wpm,
      accuracy: best.accuracy,
      chars: best.chars,
      achievedAt: best.createdAt,
    };
  },

  async getLeaderboard() {
    const data = loadDemo();
    const players = new Map(
      DEMO_PLAYERS.map((player) => [player.username, { ...player }])
    );

    if (data.sprintRuns.length) {
      const best = data.sprintRuns.reduce((a, b) =>
        b.wpm > a.wpm || (b.wpm === a.wpm && b.accuracy > a.accuracy) ? b : a
      );
      players.set("demo", {
        username: "demo",
        displayName: "Tú (demo)",
        wpm: best.wpm,
        accuracy: best.accuracy,
        chars: best.chars,
        achievedAt: best.createdAt,
      });
    }

    return [...players.values()]
      .sort(
        (a, b) =>
          b.wpm - a.wpm ||
          b.accuracy - a.accuracy ||
          String(a.achievedAt).localeCompare(String(b.achievedAt))
      )
      .slice(0, 10)
      .map((player, index) => ({ ...player, rank: index + 1 }));
  },
};

export const isDemo = !IS_CONFIGURED;
export const api = isDemo ? demoApi : supabaseApi;

export function authErrorMessage(error) {
  const message = error?.message || String(error || "");
  const code = error?.code || error?.error_code || "";

  if (code === "28000" || /Sesión no válida|cuenta está desactivada/i.test(message)) {
    return "Tu sesión ha caducado. Vuelve a entrar con tu usuario y contraseña.";
  }
  if (/Usuario o contraseña incorrectos/i.test(message)) {
    return "Usuario o contraseña incorrectos.";
  }
  if (/Demasiados intentos/i.test(message)) {
    return "Demasiados intentos fallidos. Espera unos minutos y vuelve a probar.";
  }
  if (code === "23505" || /ya existe/i.test(message)) {
    return "Ese usuario ya existe. Prueba a entrar o elige otro.";
  }
  if (/desactivada/i.test(message)) {
    return "Esta cuenta está desactivada. Habla con tu profesor.";
  }
  if (/al menos 8 caracteres/i.test(message)) {
    return "La contraseña debe tener al menos 8 caracteres.";
  }
  if (code === "PGRST106" || /schema must be one of/i.test(message)) {
    return "El esquema «mecanografia» no está en «Exposed schemas». Añádelo en Project Settings → API.";
  }
  if (code === "PGRST205" || /Could not find the table|no existe la relación/i.test(message)) {
    return "Falta ejecutar sql/setup.sql en el SQL Editor de Supabase.";
  }
  if (/Failed to fetch|NetworkError|Load failed/i.test(message)) {
    return "No se pudo conectar con Supabase. Revisa tu conexión.";
  }
  if (/Supabase no está configurado/i.test(message)) {
    return "Falta configurar Supabase en js/config.js. Mientras tanto puedes usar el modo demo.";
  }
  return message || "Ha ocurrido un error inesperado.";
}
