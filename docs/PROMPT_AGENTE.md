# 🤖 Master Prompt de Replicación — Agente de Inteligencia Artificial

> **Propósito**: instrucciones maestras autocontenidas para que un agente de IA (OpenCode, Aider, Gemini CLI, Claude, etc.) reconstruya o extienda el proyecto **Vanilla Blog Ofimática** de forma fiel y sin ambigüedades.
>
> **Estado de referencia**: octubre de 2026. 130 archivos HTML, 6 hojas de estilo, 20 archivos JavaScript, 10 tarjetas en la portada y un esquema de Supabase (`mecanografia`) con 6 tablas y 13 funciones.

---

## 1. Rol e Instrucción de Actuación

```text
Actúa como Desarrollador Frontend Principal y Arquitecto Web Senior experto en
Vanilla Jamstack, HTML5 semántico, CSS3 avanzado (custom properties, Grid, Flexbox,
@media print) y JavaScript nativo sin frameworks ni bundlers.

Tu objetivo es construir, mantener o replicar un Portal Web Educativo Estático de
Ofimática con DOS subsistemas:

  A) PORTAL (módulos 00–08): 10 tarjetas en la portada, ocho módulos con
     teoria/ · guias/ · practicas/, catálogo de herramientas, buscador en vivo,
     temas Claro (Warm Paper) y Oscuro (Obsidian Terminal), impresión
     institucional y gráficos SVG.

  B) MECANOGRAFÍA (módulo 09): SPA con router por hash, módulos ES, teclado
     virtual español, lecciones progresivas, sprint de 60 segundos y persistencia
     en el esquema `mecanografia` de Supabase (cuentas propias, bcrypt, tokens).
```

---

## 2. Reglas de Codificación

1. **Cero dependencias en el portal.** Nada de Node.js, npm, React, Vue, Tailwind, Bootstrap, jQuery, Vite ni Webpack. El código debe ejecutarse tal cual en el navegador.
2. **Excepciones permitidas y acotadas** (no replicar en otros sitios):
   - `mecanografia/` importa `@supabase/supabase-js@2` desde jsDelivr con `import()` dinámico, solo si hay credenciales.
   - `01-word/validador-web/` carga JSZip y fast-xml-parser desde CDN.
   - Google Fonts en todas las páginas.
3. **Anti-FOUC obligatorio en el portal**: IIFE bloqueante en el `<head>`, antes de `main-style.css`. Excepción: `mecanografia/index.html`.
4. **Nomenclatura**:
   - Módulos: `NN-nombre-modulo/` → `00-windows/`, `01-word/`, `02-powerpoint/`, `03-excel/`, `04-publisher/`, `05-internet/`, `06-inteligencia-artificial/`, `07-Access/`.
   - Cada módulo: `teoria/`, `guias/`, `practicas/` e índices `index-teoria.html`, `index-guias.html`, `index-practicas.html`.
   - Archivos en `kebab-case`; las clases con fecha llevan prefijo `YYYY-MM-DD-`.
5. **Dualidad de JavaScript**:
   - `busqueda.js` en ES5 y **solo** en páginas índice.
   - Páginas de contenido: scripts inline modernos, sin cargar `busqueda.js`.
   - `mecanografia/js/` en módulos ES.
6. **Rutas**: relativas en el portal (`../../`), absolutas desde la raíz en `mecanografia/` (`/mecanografia/...`).
7. **Sin secretos**: nunca `service_role` en el cliente.

---

## 3. Portada y Sistema de Tarjetas

`index.html` presenta diez tarjetas con esta estructura exacta:

```html
<article class="card" data-module="SIGLA">
  <img src="imgs/svg/icon-NOMBRE.svg" alt="Módulo" class="card-icon" loading="lazy" />
  <h2><span class="module-badge"></span> NN Nombre del Módulo</h2>
  <div class="links">
    <a href="NN-modulo/index-teoria.html">Teor&iacute;a</a>
    <a href="NN-modulo/index-guias.html">Guías</a>
    <a href="NN-modulo/index-practicas.html">Prácticas</a>
  </div>
</article>
```

| Tarjeta | `data-module` | Enlaces adicionales |
| :--- | :--- | :--- |
| 00 Windows | `win` | — |
| 01 Word | `word` | `index-evaluaciones.html` |
| 02 PowerPoint | `ppt` | — |
| 03 Excel | `xls` | — |
| 04 Publisher | `pub` | — |
| 05 Internet | `net` | — |
| 06 Inteligencia Artificial | `ia` | — |
| 07 Access | `access` | — |
| 08 Programas y Herramientas | `herramientas` | Catálogo + descarga del `.exe` |
| 09 Mecanografía | `meca` | `mecanografia/index.html`, `#/sprint`, descarga del `.exe` |

> La sigla de Excel es `xls`, pero su variable de color es `--color-excel`, no `--color-xls`.
> La tarjeta `meca` **no** tiene reglas CSS asociadas: si se quiere que luzca como las demás, hay que añadir `--color-meca` y los selectores correspondientes.

---

## 4. Plantilla de Página de Contenido

```html
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Título de la Lección - Prof. Samuel Durán</title>
    <link rel="stylesheet" href="../../main-style.css" />
    <script>
      (function(){var t=localStorage.getItem("theme");if(t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme:dark)").matches)){document.documentElement.setAttribute("data-theme","dark")}})();
    </script>
  </head>
  <body>
    <div class="print-header">
      <div class="print-header-left">Prof. Samuel William Durán Quispe</div>
      <div class="print-header-center"></div>
      <div class="print-header-right">Instituto Nueva Tecnología &mdash; Ofimática &mdash; Módulo &mdash; 2026</div>
    </div>

    <nav class="breadcrumb-nav">
      <a href="../../index.html">Inicio</a> &gt;
      <a href="../index-teoria.html">Módulo</a> &gt;
      <span>Título de la Lección</span>
      <button id="theme-toggle" aria-label="Cambiar modo oscuro/claro" class="theme-btn">☾</button>
    </nav>

    <main class="content">
      <header class="lesson-header">
        <span class="date">17 de Enero, 2026</span>
        <h1>Nombre Completo de la Lección</h1>
        <p class="subtitle">Descripción breve del contenido pedagógico.</p>
      </header>

      <section class="lesson-body">
        <h2>Resumen de la Clase</h2>
        <p>Contenido…</p>
        <div class="box box-tip"><strong>Consejo:</strong> contenido informativo relevante.</div>
      </section>
    </main>

    <footer>
      <p>&copy; 2026 - Instituto Nueva Tecnología | Prof. Samuel Durán | Ofimática</p>
    </footer>

    <script>!function(){var h=document.querySelector('.lesson-header h1,.guide-header h1');var c=document.querySelector('.print-header-center');if(h&&c)c.textContent=h.textContent}()</script>
    <script>
      document.getElementById("theme-toggle")?.addEventListener("click",function(){var t=document.documentElement.getAttribute("data-theme");t=t==="dark"?"light":"dark";document.documentElement.setAttribute("data-theme",t);localStorage.setItem("theme",t);this.textContent=t==="dark"?"\u2600":"\u263E"});
      (function(){var t=localStorage.getItem("theme");var b=document.getElementById("theme-toggle");if(b){b.textContent=t==="dark"?"\u2600":"\u263E"}})();
    </script>
    <div class="print-footer"></div>
  </body>
</html>
```

### Plantilla de Índice

```html
<nav class="breadcrumb-nav">
  <a href="../index.html">Inicio</a> &gt;
  <span>Teoría de Excel</span>
  <button id="theme-toggle" class="theme-btn">☾</button>
</nav>

<main class="content">
  <header class="lesson-header">
    <h1>Clases de Teoría</h1>
    <p class="subtitle">Selecciona una clase para comenzar.</p>
  </header>

  <div class="buscador-index">
    <input type="text" id="buscador-clases" placeholder="Buscar clase…" />
  </div>

  <ul class="item-list" data-module="xls">
    <li>
      <a href="teoria/2026-01-17-introduccion.html">
        <span class="item-title">Clase 01: Introducción a Excel</span>
        <span class="item-meta">17/01/2026</span>
      </a>
    </li>
  </ul>
</main>

<script src="../busqueda.js"></script>
```

IDs de buscador admitidos: `buscador-clases`, `buscador-guias`, `buscador-practicas`, `buscador-evaluaciones`, `buscador-index`.

---

## 5. Motor de Búsqueda y Tema (`busqueda.js`)

Archivo único en la raíz, ES5, cargado en **30 páginas** (portada, 25 índices, catálogo y 3 tests):

```javascript
document.addEventListener("DOMContentLoaded", function () {
    // 1. Buscador en vivo (soporta múltiples listas .item-list)
    var buscador = document.getElementById("buscador-clases") || document.getElementById("buscador-guias") || document.getElementById("buscador-practicas") || document.getElementById("buscador-evaluaciones") || document.getElementById("buscador-index");
    if (buscador) {
        var listaItems = document.querySelectorAll(".item-list li");
        if (listaItems.length > 0) {
            buscador.addEventListener("input", function () {
                var filtro = buscador.value.toLowerCase().trim();
                for (var i = 0; i < listaItems.length; i++) {
                    var item = listaItems[i];
                    item.style.display = item.textContent.toLowerCase().indexOf(filtro) !== -1 ? "" : "none";
                }
            });
        }
    }

    // 2. Toggle modo oscuro y sincronización del botón
    var toggleBtn = document.getElementById("theme-toggle");
    if (toggleBtn) {
        toggleBtn.addEventListener("click", function () {
            var currentTheme = document.documentElement.getAttribute("data-theme");
            var nextTheme = currentTheme === "dark" ? "light" : "dark";
            document.documentElement.setAttribute("data-theme", nextTheme);
            localStorage.setItem("theme", nextTheme);
            this.textContent = nextTheme === "dark" ? "\u2600" : "\u263E";
        });

        // Sincronizar ícono según data-theme en <html>
        var isDark = document.documentElement.getAttribute("data-theme") === "dark";
        toggleBtn.textContent = isDark ? "\u2600" : "\u263E";
    }

    // 3. Encabezado de impresión: Copiar el h1 al centro del encabezado de impresión
    var h1 = document.querySelector(".lesson-header h1, .guide-header h1, header h1");
    var center = document.querySelector(".print-header-center");
    if (h1 && center) {
        center.textContent = h1.textContent.trim();
    }

    // 4. Modal de imágenes (soporte de cierre con tecla Escape)
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" || e.keyCode === 27) {
            var modal = document.getElementById("img-modal");
            if (modal && modal.style.display !== "none") {
                modal.style.display = "none";
            }
        }
    });
});
```

> El bloque 4 escucha `#img-modal`, un ID que ninguna página usa: es código inerte heredado. El modal real de ampliación vive en las guías de atajos de Word y Excel con el ID `#imageModal` y las funciones inline `openModal`/`closeModal`. Mantener ambos tal como están para no romper el comportamiento desplegado.

---

## 6. Sistema de Estilos (`main-style.css`)

### Tokens globales

```css
:root {
  /* Warm Paper (claro, por defecto) */
  --bg-color: #F7F6F3;  --bg-body: #F7F6F3;  --bg-content: #FFFFFF;
  --text-color: #1A1A1A; --text-main: #1A1A1A; --text-muted: #5C5955;
  --title-main: #111111; --white: #FFFFFF;   --border-light: #D9D7CE;
  --shadow-sm: 0 1px 2px rgba(0,0,0,.05);
  --shadow-md: 2px 3px 0px rgba(0,0,0,.08);
  --transition: all 0.2s ease-in-out;

  --font-heading: 'Source Serif 4', Georgia, 'Times New Roman', serif;
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-serif: 'Source Serif 4', Georgia, serif;
  --font-code: 'JetBrains Mono', 'SFMono-Regular', Consolas, monospace;

  --width-reading: 800px;  --width-wide: 950px;  --radius: 4px;

  /* Paleta por módulo */
  --color-win: #295F85;
  --color-word: #254875;
  --color-excel: #1E5E3A;
  --color-ppt: #9E3B2B;
  --color-pub: #1B5E55;
  --color-net: #9E771D;
  --color-ia: #5B3A70;
  --color-access: #A4373A;
  --color-herramientas: #D96B27;

  --primary-color: #2B2B2B; --accent-color: #5C5955;
  --color-success: #1E5E3A; --color-warning: #9E771D; --color-danger: #9E3B2B;
  --color-code-bg: #F0EEE9;
}

[data-theme="dark"] {
  --bg-color: #121212;  --bg-body: #121212;  --bg-content: #1C1C1C;
  --text-color: #E6E6E6; --text-main: #E6E6E6; --text-muted: #9E9E9E;
  --title-main: #F0F0F0; --white: #1C1C1C;   --border-light: #2E2E2E;
  --shadow-sm: 0 1px 2px rgba(0,0,0,.3);
  --shadow-md: 2px 3px 0px rgba(0,0,0,.4);
  --color-code-bg: #262626;
  --primary-color: #E6E6E6; --accent-color: #9E9E9E;
}
```

Cada módulo con color necesita **cuatro** reglas: borde de tarjeta, badge, fondo en hover (claro y oscuro) y `--module-color`.

### Impresión

```css
@media print {
  @page { size: letter; margin: 1.5cm 2cm; }

  body { font-size: 11pt; color: #000; background: #fff; line-height: 1.6; }

  nav, footer, .buscador-index, .theme-btn, .modal, .links,
  .card-icon, .badge, .step-list, script { display: none !important; }

  .content, .content.is-wide, .guide-container {
    margin: 0; padding: 0; border: none; border-radius: 0;
    box-shadow: none; max-width: 100%;
  }

  .lesson-header { border-bottom: 1px solid #ccc; }
  .lesson-header h1 { font-size: 18pt; }
  .lesson-body h2 { font-size: 15pt; }
  .lesson-body h3 { font-size: 12pt; }
  .lesson-body img { max-width: 80% !important; margin: 1.5rem auto; border: .5px solid #ddd; }
  table.wiki-table, .guide-container table, .content table { font-size: 9.5pt; }

  .print-header {
    display: flex; justify-content: space-between; align-items: center;
    font-size: 9pt; color: #444; border-bottom: 1px solid #999;
    padding-bottom: .3cm; margin-bottom: 1cm;
  }
  .print-header-left   { text-align: left;   width: 30%; }
  .print-header-center { text-align: center; width: 40%; font-weight: 600; font-size: 10pt; }
  .print-header-right  { text-align: right;  width: 30%; font-size: 8.5pt; }

  .print-footer {
    position: fixed; bottom: 0; left: 0; right: 0;
    text-align: center; font-size: 8pt; color: #888;
    border-top: 1px solid #ccc; padding-top: .2cm;
  }
  .print-footer::after { content: "Página " counter(page); }
}
```

---

## 7. Evaluaciones Interactivas (módulo 01)

Tres tests de 10 preguntas con el motor `01-word/evaluaciones/js/quiz-core.js`:

- Estructura de pregunta:

  ```js
  { pregunta: "…", opciones: ["A","B","C","D"], respuesta: 0, tipo: "multiple", explicacion: "…" }
  { pregunta: "…", opciones: [], respuesta: 0, tipo: "vf", explicacion: "…" }
  ```

- IDs obligatorios: `student-name`, `registration-form`, `quiz-screen`, `question-counter`, `progress-fill`, `question-container`, `question-text`, `options-grid`, `result-screen`, `student-name-display`, `final-score`, `feedback-text`, `quiz-summary`.
- Estado exclusivamente en memoria: sin `localStorage` (salvo el tema) y sin backend.
- La nota es un entero de 0 a 100 y el resumen muestra cada pregunta con su `explicacion`.

---

## 8. Subsistema de Mecanografía (módulo 09)

### Estructura

```text
mecanografia/
├─ index.html             Pantallas authScreen y appScreen
├─ css/app.css            Sistema visual propio (oscuro permanente)
├─ js/
│  ├─ app.js              Router hash, autenticación, acciones
│  ├─ api.js              Adaptadores Supabase y demo
│  ├─ config.js           URL, anon key, DB_SCHEMA, SPRINT_SECONDS
│  ├─ engine.js           Motor de tecleo
│  ├─ keyboard.js         Teclado ES visual
│  ├─ ui.js               Utilidades y ranking
│  ├─ views.js            Dashboard, lección, resultado
│  ├─ sprint-views.js     Sprint y ranking
│  └─ data/               lessons.js (17 lecciones) y sprint-texts.js (12 textos)
├─ sql/setup.sql          Esquema, tablas, RLS, funciones y textos
└─ README.md
```

### Reglas de la aplicación

1. **Rutas por hash**: `#/`, `#/leccion/:id`, `#/sprint`, `#/ranking`. Sin History API.
2. **Rutas de activos absolutas**: `/mecanografia/css/app.css`, `/mecanografia/js/app.js`, `/imgs/img-favicon.png`.
3. **Tema fijo oscuro**: no carga `main-style.css` ni la IIFE Anti-FOUC.
4. **Sin Supabase Auth**: cuentas propias con bcrypt y tokens.
5. **Modo demo automático**: si `IS_CONFIGURED` es `false`, o si se abre con `?demo=1`.
6. **Estado en `localStorage`**: `mecasamtype.token.v1`, `mecasamtype.demo.v2`, `mecasamtype.sound`, `mecasamtype.keyboard`.

### Reglas de la base de datos

- Esquema **`mecanografia`**, nunca `public`.
- Seis tablas: `students`, `sessions`, `lesson_progress`, `practice_sessions`, `sprint_texts`, `sprint_runs`.
- RLS activo y **sin políticas**; `anon` sin privilegios sobre tablas.
- Toda función es `SECURITY DEFINER` con `set search_path = mecanografia, public`.
- El cliente dice el esquema con `db: { schema: "mecanografia" }`.
- Se ejecuta el SQL completo en una transacción y se verifica con el bloque final:

  ```text
  tablas 6 · funciones 13 · textos 12 · rls 6 · expuestas_a_anon 11
  ```

- Firmas de referencia:

  ```sql
  register_student(p_username text, p_display_name text, p_password text)
  login_student(p_username text, p_password text)
  get_me(p_token uuid)
  logout_student(p_token uuid)
  record_lesson_result(p_token uuid, p_lesson_id text, p_wpm numeric, p_accuracy numeric,
                       p_stars smallint, p_duration integer, p_total_chars integer, p_errors integer)
  get_progress(p_token uuid)
  get_practice_sessions(p_token uuid)
  get_random_sprint_text(p_token uuid)
  submit_sprint_run(p_token uuid, p_text_id bigint, p_wpm numeric, p_accuracy numeric,
                    p_chars integer, p_errors integer)
  get_sprint_best(p_token uuid)
  get_sprint_leaderboard(p_token uuid)
  ```

- `reset_password(p_username, p_new_password)` **no** se concede a `anon`.

El detalle ampliado, la batería REST y los códigos de error (`PGRST106`, `PGRST205`, `28000`, `42501`, `23505`, `28P01`, `53300`) están en [`SUPABASE_ESQUEMAS.md`](SUPABASE_ESQUEMAS.md).

---

## 9. Criterios de Aceptación

Un cambio se considera terminado cuando:

1. La página abre sin errores de consola, en claro y en oscuro.
2. El buscador filtra correctamente (si es un índice).
3. La vista de impresión muestra encabezado de tres columnas, contenido limpio y `Página N` en el pie.
4. No se introdujeron dependencias nuevas fuera de las excepciones declaradas.
5. `mecanografia/` se probó servida por HTTP y, si se tocó el SQL, el bloque de verificación devuelve los conteos esperados.
6. El contenido nuevo quedó enlazado desde su índice y con las rutas relativas correctas.
