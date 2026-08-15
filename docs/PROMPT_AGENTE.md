# 🤖 Master Prompt de Replicación — Agente de Inteligencia Artificial

> **Propósito**: Este documento contiene las instrucciones maestras autocontenidas para que un Agente de IA, Modelo de Lenguaje (LLM) o herramienta CLI (OpenCode, Aider, Gemini CLI, Claude Engineer) pueda reconstruir o extender el proyecto **Vanilla Blog Ofimática** de forma idéntica y sin ambigüedades desde cero.

---

## 1. Rol e Instrucción de Actuación

```text
Actúa como un Desarrollador Frontend Principal y Arquitecto Web Senior experto en Vanilla Jamstack, HTML5 semántico, CSS3 avanzado (Variables CSS, Grid Layout, Flexbox, Media Queries de impresión @media print) y JavaScript nativo (sin frameworks ni dependencias; ES5 en `busqueda.js` para índices y scripts inline modernos en las páginas de contenido).

Tu objetivo es construir, mantener o replicar un Portal Web Educativo Estático de 7 Módulos de Ofimática más un catálogo de herramientas (8 tarjetas en la portada) con soporte de temas Claro (Warm Paper) y Oscuro (Obsidian Terminal), búsqueda en vivo en tiempo real en índices, modal de ampliación de imágenes en guías de atajos, maquetación de impresión institucional y gráficos 100% vectoriales SVG.
```

---

## 2. Instrucciones de Contexto y Reglas de Codificación

1. **Cero Dependencias Externa (Zero-Dependency Policy)**:
   - NO utilices Node.js, npm, React, Vue, Tailwind CSS, Bootstrap, jQuery ni bundlers (Vite/Webpack).
   - Todo el código debe ser ejecutable de forma nativa por el navegador.
2. **Prevención Estricta de FOUC (Flash of Unstyled Content)**:
   - En cada archivo HTML debes incluir una IIFE bloqueante e in-line dentro del `<head>` ANTES de las hojas de estilo externas.
3. **Estructura Estricta de Nombres y Directorios**:
   - Los módulos se deben nombrar siguiendo la regla: `NN-nombre-modulo/` (`00-windows/`, `01-word/`, `02-powerpoint/`, `03-excel/`, `04-publisher/`, `05-internet/`, `06-inteligencia-artificial/`).
   - Cada módulo contiene exactamente tres subcarpetas: `teoria/`, `guias/`, `practicas/`.
   - Cada módulo posee 3 páginas índice en su raíz: `index-teoria.html`, `index-guias.html`, `index-practicas.html`.
4. **Compatibilidad Retrospectiva (Dual)**:
   - El archivo `busqueda.js` (solo se carga en páginas índice) debe ser compatible con ES5 (usar `var`, `function`, `document.getElementById`, `querySelectorAll`).
   - Las páginas de contenido (`teoria/`, `guias/`, `practicas/`) NO cargan `busqueda.js`; llevan scripts inline propios que pueden usar sintaxis moderna (optional chaining `?.`).
5. **Rutas Relativas Limpias**:
   - Todas las referencias a archivos CSS, JS e imágenes deben ser estrictamente relativas (`../`, `../../`).

---

## 3. Especificación de Modelos e Interfaces (DOM & HTML Templates)

### 📄 Plantilla Base para Páginas de Lección (`teoria/*.html` o `guias/*.html`)

```html
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Título de la Lección - Prof. Samuel Durán</title>
    <link rel="stylesheet" href="../../main-style.css" />
    <script>
      (function(){var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.setAttribute('data-theme','dark')}})();
    </script>
  </head>
  <body>
    <!-- Encabezado exclusivo para vista previa de impresión -->
    <div class="print-header">
      <div class="print-header-left">Prof. Samuel Durán</div>
      <div class="print-header-center"><!-- Copiado dinámicamente por JS --></div>
      <div class="print-header-right">Instituto Nueva Tecnología &mdash; Ofimática</div>
    </div>

    <!-- Navegación Breadcrumb -->
    <nav class="breadcrumb-nav">
      <a href="../../index.html">Inicio</a> &gt;
      <a href="../index-teoria.html">Módulo</a> &gt;
      <span>Título Lección</span>
      <button id="theme-toggle" aria-label="Cambiar modo oscuro/claro" class="theme-btn">☾</button>
    </nav>

    <!-- Contenido Principal -->
    <main class="content">
      <header class="lesson-header">
        <h1>Nombre Completo de la Lección</h1>
        <p class="subtitle">Descripción breve del contenido pedagógico</p>
      </header>

      <section class="lesson-body">
        <!-- Párrafos, tablas, cajas informativas y diagramas SVG -->
        <div class="box box-tip">
          <strong>Consejo:</strong> Contenido informativo relevante.
        </div>
      </section>
    </main>

    <footer>
      <p>&copy; 2026 - Instituto Nueva Tecnología | Prof. Samuel Durán | Ofimática</p>
    </footer>

    <!-- Scripts inline (las páginas de contenido NO usan busqueda.js) -->
    <script>!function(){var h=document.querySelector('.lesson-header h1,.guide-header h1');var c=document.querySelector('.print-header-center');if(h&&c)c.textContent=h.textContent}()</script>
    <script>
      document.getElementById("theme-toggle")?.addEventListener("click",function(){var t=document.documentElement.getAttribute("data-theme");t=t==="dark"?"light":"dark";document.documentElement.setAttribute("data-theme",t);localStorage.setItem("theme",t);this.textContent=t==="dark"?"\u2600":"\u263E"});
      (function(){var t=localStorage.getItem("theme");var b=document.getElementById("theme-toggle");if(b){b.textContent=t==="dark"?"\u2600":"\u263E"}})();
    </script>
  </body>
</html>
```

> **Modal de ampliación de imágenes**: solo se incluye en las guías de atajos de Word (`01-word/guias/atajos-esenciales.html`) y Excel (`03-excel/guias/atajos-esenciales.html`), mediante un `<div id="imageModal">` y funciones inline `openModal`/`closeModal` con cierre por tecla `Escape`. Las demás páginas de contenido no lo incorporan.

---

## 4. Especificación de Servicios y Lógica JavaScript (`busqueda.js`)

> **Nota de carga**: `busqueda.js` se incluye únicamente en las páginas índice (portada, los 21 índices `index-{teoria,guias,practicas}.html` y el catálogo de herramientas). Las páginas de contenido llevan scripts inline (ver Sección 3) y no lo cargan.

Crea o mantiene el archivo `busqueda.js` en la raíz del proyecto con la siguiente implementación exacta:

```javascript
document.addEventListener("DOMContentLoaded", function () {
    // 1. Buscador en vivo (soporta múltiples listas .item-list)
    var buscador = document.getElementById("buscador-clases") || 
                   document.getElementById("buscador-guias") || 
                   document.getElementById("buscador-practicas") || 
                   document.getElementById("buscador-index");
                   
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

> **Observación**: El bloque 4 (listener `Escape` sobre `#img-modal`) está presente en el archivo real, pero **ninguna página usa el id `img-modal`**, por lo que es código inerte. El modal real de ampliación de imágenes vive en las guías de atajos de Word y Excel con el id `#imageModal` y funciones inline `openModal`/`closeModal` (ver Sección 3). Mantener el bloque de `busqueda.js` tal cual para preservar compatibilidad con el archivo desplegado.

---

## 5. Diseño de Interfaz de Usuario (UI) y Sistema de Estilos (`main-style.css`)

### 🎨 Tokens Globales de Diseño (`:root` y `[data-theme="dark"]`)

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;0,8..60,700;1,8..60,400&family=JetBrains+Mono:wght@400;500&display=swap');

:root {
  /* Warm Paper Theme (Light Mode Default) */
  --bg-color: #F7F6F3;
  --bg-body: #F7F6F3;
  --bg-content: #FFFFFF;

  --text-color: #1A1A1A;
  --text-main: #1A1A1A;
  --text-muted: #5C5955;

  --title-main: #111111;
  --white: #FFFFFF;
  --border-light: #D9D7CE;

  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 2px 3px 0px rgba(0, 0, 0, 0.08);
  --transition: all 0.2s ease-in-out;

  --font-heading: 'Source Serif 4', Georgia, 'Times New Roman', serif;
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-serif: 'Source Serif 4', Georgia, serif;
  --font-code: 'JetBrains Mono', 'SFMono-Regular', Consolas, monospace;

  --width-reading: 800px;
  --width-wide: 950px;
  --radius: 4px;

  /* Muted Retro Color Palette por Módulo */
  --color-win: #295F85;
  --color-word: #254875;
  --color-excel: #1E5E3A;
  --color-ppt: #9E3B2B;
  --color-pub: #1B5E55;
  --color-net: #9E771D;
  --color-ia: #5B3A70;
  --color-herramientas: #D96B27;

  --primary-color: #2B2B2B;
  --accent-color: #5C5955;

  --color-success: #1E5E3A;
  --color-warning: #9E771D;
  --color-danger: #9E3B2B;
  --color-code-bg: #F0EEE9;
}

[data-theme="dark"] {
  /* Obsidian Terminal Theme (Dark Mode) */
  --bg-color: #121212;
  --bg-body: #121212;
  --bg-content: #1C1C1C;

  --text-color: #E6E6E6;
  --text-main: #E6E6E6;
  --text-muted: #9E9E9E;

  --title-main: #F0F0F0;
  --white: #1C1C1C;
  --border-light: #2E2E2E;

  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 2px 3px 0px rgba(0, 0, 0, 0.4);

  --color-code-bg: #262626;

  --primary-color: #E6E6E6;
  --accent-color: #9E9E9E;
}
```

> **Nota de colores**: el módulo Excel usa la variable `--color-excel` (no `--color-xls`), y el módulo 07 Programas y Herramientas usa `data-module="herramientas"` con `--color-herramientas`. La tipografía monoespaciada `JetBrains Mono` se usa en atajos, código y breadcrumbs.

### 🖨️ Configuración del Modo Impresión (`@media print`)

```css
@media print {
  @page {
    size: letter;
    margin: 1.5cm 2cm;
  }

  body {
    background: #FFFFFF !important;
    color: #000000 !important;
    font-size: 11pt;
    line-height: 1.6;
  }

  /* Ocultar elementos no imprimibles */
  nav, footer, .buscador-index, .modal, .links, .card-icon, .badge, .step-list, script {
    display: none !important;
  }

  /* Contenido principal sin bordes ni sombras */
  .content, .content.is-wide, .guide-container {
    margin: 0;
    padding: 0;
    border: none;
    border-radius: 0;
    box-shadow: none;
    max-width: 100%;
  }

  .lesson-header { border-bottom: 1px solid #ccc; }
  .lesson-header h1 { font-size: 18pt; }
  .lesson-body p { font-size: 11pt; line-height: 1.7; }
  .lesson-body h2 { font-size: 15pt; }
  .lesson-body h3 { font-size: 12pt; }
  .lesson-body img { max-width: 80% !important; margin: 1.5rem auto; border: 0.5px solid #ddd; }
  table.wiki-table, .guide-container table, .content table { font-size: 9.5pt; }

  /* Encabezado institucional (3 columnas flex 30% | 40% | 30%) */
  .print-header {
    display: flex !important;
    justify-content: space-between;
    align-items: center;
    font-size: 9pt;
    color: #444;
    border-bottom: 1px solid #999;
    padding-bottom: 0.3cm;
    margin-bottom: 1cm;
  }

  .print-header-left  { text-align: left;   width: 30%; }
  .print-header-center { text-align: center; width: 40%; font-weight: 600; font-size: 10pt; }
  .print-header-right { text-align: right;  width: 30%; font-size: 8.5pt; }

  /* Pie de página con número de página (el elemento .print-footer aún no existe en el HTML) */
  .print-footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    text-align: center;
    font-size: 8pt;
    color: #888;
    border-top: 1px solid #ccc;
    padding-top: 0.2cm;
  }

  .print-footer::after {
    content: "Página " counter(page);
  }
}
```
