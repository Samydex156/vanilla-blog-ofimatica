# 🤖 Master Prompt de Replicación — Agente de Inteligencia Artificial

> **Propósito**: Este documento contiene las instrucciones maestras autocontenidas para que un Agente de IA, Modelo de Lenguaje (LLM) o herramienta CLI (OpenCode, Aider, Gemini CLI, Claude Engineer) pueda reconstruir o extender el proyecto **Vanilla Blog Ofimática** de forma idéntica y sin ambigüedades desde cero.

---

## 1. Rol e Instrucción de Actuación

```text
Actúa como un Desarrollador Frontend Principal y Arquitecto Web Senior experto en Vanilla Jamstack, HTML5 semántico, CSS3 avanzado (Variables CSS, Grid Layout, Flexbox, Media Queries de impresión @media print) y JavaScript nativo (ECMAScript 5, sin frameworks ni dependencias).

Tu objetivo es construir, mantener o replicar un Portal Web Educativo Estático de 7 Módulos de Ofimática con soporte de temas Claro (Warm Paper) y Oscuro (Obsidian Terminal), búsqueda en vivo en tiempo real, modales de imágenes con control de teclado, maquetación de impresión institucional y gráficos 100% vectoriales SVG.
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
4. **Compatibilidad Retrospectiva**:
   - El código JavaScript debe ser compatible con ES5 (usar `var`, `function`, `document.getElementById`, `querySelectorAll`).
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
      (function(){var t=localStorage.getItem("theme");if(t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme:dark)").matches)){document.documentElement.setAttribute("data-theme","dark")}})();
    </script>
  </head>
  <body>
    <!-- Encabezado exclusivo para vista previa de impresión -->
    <div class="print-header">
      <div class="print-header-left">Prof. Samuel Durán</div>
      <div class="print-header-center"><!-- Copiado dinámicamente por JS --></div>
      <div class="print-header-right">Instituto Nueva Tecnología</div>
    </div>

    <!-- Navegación Breadcrumb -->
    <nav class="breadcrumb-nav">
      <a href="../../index.html">Inicio</a> &gt;
      <a href="../index-teoria.html">Módulo</a> &gt;
      <span>Título Lección</span>
      <button id="theme-toggle" class="theme-btn">☾</button>
    </nav>

    <!-- Contenido Principal -->
    <main class="container">
      <article class="content">
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
      </article>
    </main>

    <!-- Modal de Zoom de Imagen -->
    <div id="img-modal" class="modal" onclick="closeModal()">
      <span class="close">&times;</span>
      <img class="modal-content" id="modal-img" alt="Zoom" />
    </div>

    <!-- Pie de página para impresión -->
    <div class="print-footer">Página <span class="page-number"></span></div>

    <!-- Script único desacoplado -->
    <script src="../../busqueda.js"></script>
    <script>
      function openModal(img) {
        document.getElementById("modal-img").src = img.src;
        document.getElementById("img-modal").style.display = "flex";
      }
      function closeModal() {
        document.getElementById("img-modal").style.display = "none";
      }
    </script>
  </body>
</html>
```

---

## 4. Especificación de Servicios y Lógica JavaScript (`busqueda.js`)

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

---

## 5. Diseño de Interfaz de Usuario (UI) y Sistema de Estilos (`main-style.css`)

### 🎨 Tokens Globales de Diseño (`:root` y `[data-theme="dark"]`)

```css
:root {
  /* Warm Paper Theme (Light Mode Default) */
  --bg-body: #F7F6F3;
  --bg-content: #FFFFFF;
  --text-color: #1A1A1A;
  --text-muted: #555555;
  --border-color: #E2E0D8;
  --card-bg: #FFFFFF;
  --font-serif: 'Source Serif 4', Georgia, serif;
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  
  /* Módulo Colors */
  --color-win: #0078D4;
  --color-word: #1B5E20;
  --color-ppt: #D84315;
  --color-xls: #2E7D32;
  --color-pub: #00838F;
  --color-net: #1565C0;
  --color-ia: #6A1B9A;
}

[data-theme="dark"] {
  /* Obsidian Terminal Theme (Dark Mode) */
  --bg-body: #121212;
  --bg-content: #1C1C1C;
  --text-color: #E6E6E6;
  --text-muted: #AAAAAA;
  --border-color: #333333;
  --card-bg: #1E1E1E;
}
```

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
  }
  
  /* Ocultar elementos no imprimibles */
  nav, button, .theme-btn, .modal, .buscador-index, footer {
    display: none !important;
  }
  
  /* Activar encabezado institucional */
  .print-header {
    display: grid !important;
    grid-template-columns: 1fr auto 1fr;
    border-bottom: 2px solid #000;
    padding-bottom: 8px;
    margin-bottom: 20px;
    font-size: 9pt;
    font-weight: bold;
  }
}
```
