# 🗄️ Esquema de Persistencia y Modelo de Datos — Vanilla Blog Ofimática

## 1. Motores y Estrategia de Persistencia

El sistema usa **dos estrategias de datos independientes**, una por subsistema:

| Subsistema | Motor | Qué guarda | Dónde |
| :--- | :--- | :--- | :--- |
| Portal 00–08 | Web Storage API (`localStorage`) | Preferencia cromática del visitante | Navegador del usuario |
| Portal 00–08 | Modelo DOM pre-renderizado | Módulos, clases, guías, prácticas y descargables | Archivos HTML estáticos |
| Mecanografía 09 | `localStorage` | Token de sesión, modo demo y preferencias de sonido/teclado | Navegador del alumno |
| Mecanografía 09 | PostgreSQL vía PostgREST (Supabase) | Alumnos, sesiones, progreso, prácticas y marcas de sprint | Esquema `mecanografia` |

> El portal **no** tiene base de datos. Solo el módulo 09 la usa. El detalle operativo de Supabase (exposición de esquema, permisos, batería de pruebas y errores de PostgREST) está en [`SUPABASE_ESQUEMAS.md`](SUPABASE_ESQUEMAS.md).

### 🔐 Regla de acceso

El cliente de mecanografía **no lee tablas**. Todas las operaciones pasan por funciones `SECURITY DEFINER` que reciben `p_token` y resuelven el alumno con `touch_session`. Las tablas tienen RLS activo y **sin políticas**, y `anon` no conserva privilegios sobre ellas.

---

## 2. Diagrama Entidad-Relación — Esquema `mecanografia`

```text
+---------------------------+          1:N          +---------------------------+
|        students           | --------------------> |         sessions          |
|---------------------------|                       |---------------------------|
| id            uuid PK     |                       | token         uuid PK     |
| username      text UQ     |                       | student_id    uuid FK     |
| display_name  text        |                       | created_at    timestamptz |
| password_hash text        |                       | last_seen_at  timestamptz |
| is_active     boolean     |                       | expires_at    timestamptz |
| failed_attempts smallint  |                       +---------------------------+
| locked_until  timestamptz |
| created_at    timestamptz |          1:N          +---------------------------+
| last_login_at timestamptz | --------------------> |      lesson_progress      |
+---------------------------+                       |---------------------------|
                                                    | student_id    uuid FK/PK  |
                                                    | lesson_id     text   PK   |
                                                    | best_wpm      numeric(6,1)|
                                                    | best_accuracy numeric(5,2)|
                                                    | stars         smallint    |
                                                    | attempts      integer     |
                                                    | completed     boolean     |
                                                    | last_practiced_at         |
                                                    +---------------------------+

                             1:N          +---------------------------+
        students -----------------------> |     practice_sessions     |
                                          |---------------------------|
                                          | id            bigint PK   |
                                          | student_id    uuid FK     |
                                          | lesson_id     text        |
                                          | wpm           numeric(6,1)|
                                          | accuracy      numeric(5,2)|
                                          | duration_seconds integer  |
                                          | total_chars   integer     |
                                          | errors        integer     |
                                          | created_at    timestamptz |
                                          +---------------------------+

                             1:N          +---------------------------+   1:N   +---------------------------+
        students -----------------------> |       sprint_runs         | ------> |      sprint_texts         |
                                          |---------------------------|         |---------------------------|
                                          | id            bigint PK   |         | id         bigint PK      |
                                          | student_id    uuid FK     |         | title      text UQ        |
                                          | text_id       bigint FK   |         | body       text           |
                                          | wpm           numeric(6,1)|         | active     boolean        |
                                          | accuracy      numeric(5,2)|         | created_at timestamptz    |
                                          | chars         integer     |         +---------------------------+
                                          | errors        integer     |           120 ≤ body ≤ 1200
                                          | duration_seconds integer  |
                                          | created_at    timestamptz |
                                          +---------------------------+

Borrado en cascada: al eliminar una fila de `students` desaparecen sus sesiones,
su progreso, sus prácticas y sus marcas de sprint.
```

---

## 3. Diccionario de Datos

### 💾 Tabla 1: Almacenamiento local del portal

| Clave (*key*) | Tipo | Valores permitidos | Descripción / regla de negocio |
| :--- | :--- | :--- | :--- |
| `theme` | `String` | `"dark"` \| `"light"` | Preferencia cromática. Si es `"dark"` se asigna `data-theme="dark"` a `<html>`. Si no existe, se consulta `prefers-color-scheme`. La escriben `busqueda.js` y los scripts inline de las páginas de contenido. |

### 💾 Tabla 2: Almacenamiento local de mecanografía

| Clave (*key*) | Tipo | Valores permitidos | Descripción / regla de negocio |
| :--- | :--- | :--- | :--- |
| `mecasamtype.token.v1` | `String` (UUID) | Token emitido por `login_student` | Sesión activa. Se renueva a 60 días en cada RPC y se elimina en el cierre de sesión. |
| `mecasamtype.demo.v2` | `JSON` | Objeto serializado | Estado completo del modo demo: perfil, progreso y marcas de sprint. Solo se usa cuando `IS_CONFIGURED` es `false`. |
| `mecasamtype.sound` | `String` | `"on"` \| `"off"` | Sonido de tecleo. Ausente equivale a `"on"`. |
| `mecasamtype.keyboard` | `String` | `"on"` \| `"off"` | Visibilidad del teclado virtual. Ausente equivale a `"on"`. |

### 🏷️ Tabla 3: Atributos de estado del DOM

| Atributo | Elemento objetivo | Valores permitidos | Descripción |
| :--- | :--- | :--- | :--- |
| `data-theme` | `<html>` | `"dark"` \| `"light"` | Controla las variables CSS globales del portal. |
| `data-module` | `.card`, `.module-section`, `.item-list` | `win`, `word`, `ppt`, `xls`, `pub`, `net`, `ia`, `access`, `herramientas`, `meca` | Identifica el módulo y define `--module-color` para bordes, badges y acentos. |
| `data-nav` | Enlaces del menú de mecanografía | `lessons`, `sprint`, `ranking` | Marca la sección activa en la barra superior. |
| `data-action` | Botones de mecanografía | `logout`, `open-lesson`, `focus-input`, `resume-lesson`, `restart-lesson`, `retry-save`, `toggle-sound`, `toggle-keyboard`, `start-sprint`, `retry-sprint-save` | Despacho de acciones por delegación de eventos. |
| `data-id` | Tarjetas de lección | `u1-l1` … `u5-l4` | Identificador estable de la lección; se usa como clave en `lesson_progress`. |

> ⚠️ `data-module="meca"` existe en la portada, pero **no tiene reglas CSS asociadas**: no hay `--color-meca` ni selectores `.card[data-module="meca"]`. La tarjeta usa el estilo base. Los otros nueve valores sí están cubiertos en `main-style.css`.

### 📄 Tabla 4: Contrato de una página de contenido (DOM)

Campos obligatorios de una lección, guía o práctica del portal:

| Campo / elemento | Selector | Tipo | Restricción | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| **Anti-FOUC** | `<script>` en `<head>` | IIFE | Obligatorio en el portal | Aplica `data-theme` antes del primer pintado. |
| **Encabezado de impresión** | `.print-header` | `<div>` | Obligatorio | Contiene `.print-header-left` (profesor), `.print-header-center` (título, vacío en el HTML) y `.print-header-right` (institución y módulo). |
| **Migas de pan** | `.breadcrumb-nav` | `<nav>` | Obligatorio | Inicio › Módulo › Título. Contiene el botón `#theme-toggle`. |
| **Toggle de tema** | `#theme-toggle` | `<button>` | Obligatorio en el portal | En índices lo gestiona `busqueda.js`; en contenido, un script inline. |
| **Buscador de índice** | `#buscador-*` | `<input>` | Requerido en índices | IDs válidos: `buscador-clases`, `buscador-guias`, `buscador-practicas`, `buscador-evaluaciones`, `buscador-index`. |
| **Lista de contenidos** | `.item-list` | `<ul>` | Requerido en índices | Contenedor de los enlaces que filtra la búsqueda. |
| **Ítem de lista** | `.item-list li` | `<li>` | Multiplicidad N | Unidad de filtrado; se evalúa su `textContent`. |
| **Título de lección** | `.lesson-header h1`, `.guide-header h1` | `<h1>` | Único por página | Origen del texto que se copia al encabezado de impresión. |
| **Centro de impresión** | `.print-header-center` | `<div>` | Obligatorio | Destino de la copia del `<h1>`. |
| **Pie de impresión** | `.print-footer` | `<div>` | Presente en las 98 páginas de contenido | El CSS le añade `Página N` con `counter(page)`. |
| **Modal de imagen** | `#imageModal` | `<div>` | Opcional | Solo en `01-word/guias/atajos-esenciales.html` y `03-excel/guias/atajos-esenciales.html`, con `openModal`/`closeModal` inline y cierre con `Escape`. |

### 🧪 Tabla 5: Contrato de una evaluación (`01-word/evaluaciones/` y `02-powerpoint/evaluaciones/`)

| Elemento | ID / selector | Tipo | Descripción |
| :--- | :--- | :--- | :--- |
| Nombre del alumno | `#student-name` | `<input required>` | Se pide antes de empezar; no se persiste. |
| Registro | `#registration-form` | `<section>` | Contenedor del formulario inicial. |
| Pantalla de preguntas | `#quiz-screen` | `<section>` | Visible tras el registro. |
| Contador | `#question-counter` | `<div>` | Texto «Pregunta N de 10». |
| Progreso | `#progress-fill` | `<div>` | Ancho porcentual según avance. |
| Pregunta | `#question-text`, `#options-grid` | `<div>` | Enunciado y botones generados por `quiz-core.js`. |
| Pantalla de resultado | `#result-screen` | `<section>` | Nota final y retroalimentación. |
| Nombre mostrado | `#student-name-display` | `<p>` | Nombre introducido por el alumno. |
| Nota | `#final-score` | `<div>` | Entero de 0 a 100. |
| Comentario | `#feedback-text` | `<p>` | Mensaje según el rango de nota. |
| Resumen | `#quiz-summary` | `<div>` | Una fila por pregunta con acierto/error y `explicacion`. |

#### Estructura de una pregunta

```js
// Opción múltiple
{ pregunta: "…", opciones: ["A", "B", "C", "D"], respuesta: 0, tipo: "multiple", explicacion: "…" }

// Verdadero / falso
{ pregunta: "…", opciones: [], respuesta: 0, tipo: "vf", explicacion: "…" }
```

Cada test declara **10 preguntas**. El motor las baraja con Fisher-Yates en cada intento.

### 🗃️ Tabla 6: `mecanografia.students`

| Columna | Tipo | Restricción | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | PK, `gen_random_uuid()` | Identificador interno del alumno. |
| `username` | `text` | NOT NULL, único, `^[a-z0-9._-]{3,24}$`, siempre en minúsculas | Credencial de acceso. |
| `display_name` | `text` | NOT NULL, longitud 2–48 | Nombre visible en el ranking. |
| `password_hash` | `text` | NOT NULL | Hash bcrypt (`gen_salt('bf', 10)`); nunca la contraseña. |
| `is_active` | `boolean` | NOT NULL, por defecto `true` | Permite desactivar la cuenta sin borrar datos. |
| `failed_attempts` | `smallint` | NOT NULL, por defecto `0` | Intentos fallidos consecutivos; a los 5 se bloquea 5 minutos. |
| `locked_until` | `timestamptz` | NULL | Fin del bloqueo temporal. |
| `created_at` | `timestamptz` | NOT NULL, por defecto `now()` | Alta del alumno. |
| `last_login_at` | `timestamptz` | NULL | Último acceso correcto. |

### 🗃️ Tabla 7: `mecanografia.sessions`

| Columna | Tipo | Restricción | Descripción |
| :--- | :--- | :--- | :--- |
| `token` | `uuid` | PK | Token de sesión enviado en cada RPC. |
| `student_id` | `uuid` | FK → `students.id`, `ON DELETE CASCADE` | Titular de la sesión. |
| `created_at` | `timestamptz` | NOT NULL | Emisión. |
| `last_seen_at` | `timestamptz` | NOT NULL | Última llamada válida. |
| `expires_at` | `timestamptz` | `now() + interval '60 days'` | Caducidad renovable. |

Índices: `sessions_student_idx`, `sessions_expires_idx`.

### 🗃️ Tabla 8: `mecanografia.lesson_progress`

| Columna | Tipo | Restricción | Descripción |
| :--- | :--- | :--- | :--- |
| `student_id` | `uuid` | PK compuesta, FK → `students.id` | Alumno. |
| `lesson_id` | `text` | PK compuesta | ID estable de la lección (`u1-l1` … `u5-l4`). |
| `best_wpm` | `numeric(6,1)` | 0–300 | Mejor velocidad registrada. |
| `best_accuracy` | `numeric(5,2)` | 0–100 | Mejor precisión registrada. |
| `stars` | `smallint` | 0–3 | 1 por completar, 2 con precisión objetivo, 3 con precisión y velocidad. |
| `attempts` | `integer` | ≥ 0 | Número de intentos. |
| `completed` | `boolean` | por defecto `false` | Marca de lección superada. |
| `last_practiced_at` | `timestamptz` | por defecto `now()` | Última práctica. |

### 🗃️ Tabla 9: `mecanografia.practice_sessions`

| Columna | Tipo | Restricción | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | `bigint` | PK, `generated always as identity` | Identificador del intento. |
| `student_id` | `uuid` | FK → `students.id`, cascada | Alumno. |
| `lesson_id` | `text` | NOT NULL | Lección practicada. |
| `wpm` | `numeric(6,1)` | 0–300 | Velocidad del intento. |
| `accuracy` | `numeric(5,2)` | 0–100 | Precisión del intento. |
| `duration_seconds` | `integer` | ≥ 0 | Duración efectiva. |
| `total_chars` | `integer` | ≥ 0 | Caracteres escritos. |
| `errors` | `integer` | ≥ 0 | Errores cometidos. |
| `created_at` | `timestamptz` | por defecto `now()` | Fecha del intento. |

### 🗃️ Tabla 10: `mecanografia.sprint_texts`

| Columna | Tipo | Restricción | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | `bigint` | PK, identity | Identificador del texto. |
| `title` | `text` | NOT NULL, único | Título del texto. |
| `body` | `text` | NOT NULL, 120–1200 caracteres | Contenido que se teclea. |
| `active` | `boolean` | por defecto `true` | Solo los activos entran en el sorteo. |
| `created_at` | `timestamptz` | por defecto `now()` | Alta. |

El `setup.sql` inserta **12 textos** iniciales.

### 🗃️ Tabla 11: `mecanografia.sprint_runs`

| Columna | Tipo | Restricción | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | `bigint` | PK, identity | Identificador de la marca. |
| `student_id` | `uuid` | FK → `students.id`, cascada | Alumno. |
| `text_id` | `bigint` | FK → `sprint_texts.id`, `ON DELETE SET NULL` | Texto utilizado. |
| `wpm` | `numeric(6,1)` | 0–300 | Velocidad del sprint. |
| `accuracy` | `numeric(5,2)` | 0–100 | Precisión del sprint. |
| `chars` | `integer` | 0–4000 | Caracteres escritos. |
| `errors` | `integer` | ≥ 0 | Errores. |
| `duration_seconds` | `integer` | 1–120, por defecto `60` | Duración del sprint. |
| `created_at` | `timestamptz` | por defecto `now()` | Fecha. |

Índices: `sprint_runs_student_idx`, `sprint_runs_rank_idx`.

---

## 4. Superficie de API (RPC)

Trece funciones viven en el esquema; **once se conceden a `anon` y `authenticated`**.

| Función | Argumentos | Devuelve | Expuesta a `anon` |
| :--- | :--- | :--- | :-: |
| `touch_session` | `p_token uuid` | `student_id` (uso interno) | ❌ |
| `register_student` | `p_username text, p_display_name text, p_password text` | `auth_token` | ✅ |
| `login_student` | `p_username text, p_password text` | `auth_token` | ✅ |
| `get_me` | `p_token uuid` | perfil del alumno | ✅ |
| `logout_student` | `p_token uuid` | — (borra la sesión) | ✅ |
| `record_lesson_result` | `p_token, p_lesson_id, p_wpm, p_accuracy, p_stars, p_duration, p_total_chars, p_errors` | — (upsert de progreso) | ✅ |
| `get_progress` | `p_token uuid` | filas de `lesson_progress` | ✅ |
| `get_practice_sessions` | `p_token uuid` | filas de `practice_sessions` | ✅ |
| `get_random_sprint_text` | `p_token uuid` | texto activo al azar | ✅ |
| `submit_sprint_run` | `p_token, p_text_id, p_wpm, p_accuracy, p_chars, p_errors` | id de la marca | ✅ |
| `get_sprint_best` | `p_token uuid` | mejor marca del alumno | ✅ |
| `get_sprint_leaderboard` | `p_token uuid` | Top 10 público | ✅ |
| `reset_password` | `p_username text, p_new_password text` | — | ❌ (solo SQL Editor) |

Todas las funciones `SECURITY DEFINER` fijan `set search_path = mecanografia, public`.

---

## 5. Índices y Estrategia de Rendimiento

Al no existir motor relacional para el portal, la indexación se traslada al navegador; en Supabase se apoya en índices explícitos.

1. **Búsqueda DOM directa O(N)**. `busqueda.js` resuelve `document.querySelectorAll(".item-list li")` una sola vez al cargar y filtra por subcadena en memoria (`indexOf`), con respuesta inferior a 2 ms para las listas actuales.
2. **Caché estática en CDN**. Los activos del portal se sirven con las cabeceras de Vercel, lo que reduce la latencia en visitas sucesivas.
3. **Activos vectoriales**. Los íconos SVG evitan tablas de metadatos y peticiones adicionales de imágenes.
4. **Índices de Postgres**. `students_username_key` (único), `sessions_student_idx`, `sessions_expires_idx`, `lesson_progress_student_idx`, `practice_sessions_student_idx`, `sprint_runs_student_idx` y `sprint_runs_rank_idx` sostienen las consultas del ranking y del historial.
5. **Carga diferida del SDK**. El cliente de Supabase se importa con `import()` la primera vez que se necesita y se reutiliza en una promesa memoizada (`clientPromise`).
6. **Cero escrituras en el portal estático**. Las 98 páginas de contenido no escriben nada salvo la preferencia `theme`.

---

## 6. Validación y Verificación del Esquema

`mecanografia/sql/setup.sql` termina con un bloque de verificación. El resultado esperado es:

```text
tablas            6
funciones        13
textos           12
rls               6
expuestas_a_anon 11
```

Si alguna cifra no coincide, falta ejecutar una parte del script o alguien alteró el esquema. La consulta y su interpretación se detallan en `mecanografia/README.md` y en la sección 7 de [`SUPABASE_ESQUEMAS.md`](SUPABASE_ESQUEMAS.md).

Toda la definición va dentro de `begin; … commit;`, de modo que un error deja la base sin cambios. El script es reejecutable: usa `if not exists` y `create or replace`.
