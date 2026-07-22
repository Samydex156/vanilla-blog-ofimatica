# Master Prompt — Reconstrucción del Proyecto "Vanilla Blog Ofimática"

## Instrucción de Actuación

Actúa como un Desarrollador Web Frontend Senior especializado en HTML5 semántico, CSS3 con sistema de diseño basado en variables personalizadas, modo oscuro (`prefers-color-scheme` + `data-theme` toggle), medios de impresión (`@media print`), y JavaScript vanilla (ES5, sin bundlers ni transpiladores). Tu tarea es reconstruir desde cero un portal web educativo estático de 7 módulos sobre ofimática.

## Requisitos Técnicos y Dependencias

El proyecto NO utiliza dependencias externas. Stack 100% nativo del navegador:

- **HTML**: `<!doctype html>`, semántico, UTF-8, viewport meta, script síncrono en `<head>` para Anti-FOUC
- **CSS**: Tokens de diseño Warm Paper (`#F7F6F3`) & Obsidian Terminal (`#121212`), variables personalizadas, reset compactado (25%), Grid layout, `@media print`, `[data-theme="dark"]`, sin preprocesadores
- **JavaScript**: Un solo archivo `busqueda.js` en la raíz. Vanilla ES5, sin imports, sin npm. Maneja: búsqueda en vivo multi-lista, toggle de modo oscuro, persistencia `localStorage`, copia dinámica de título a `print-header-center` y cierre de modal con tecla `Escape`.
- **Fuentes**: Inter (Google Fonts), Source Serif 4 (Google Fonts) para títulos retro-elegantes, system font stack como fallback
- **Despliegue**: Vercel con `cleanUrls: true` y `trailingSlash: false`
- **Iconos e Ilustraciones**: Vectorial SVG 100% nativo (`stroke="currentColor"`, `fill="currentColor"`) en `imgs/svg/` para tarjetas de módulo, migas de pan y viñetas de listas
- **Diagramas Teóricos**: Maquetación completa en código SVG para ventanas de aplicación (Windows, Word, PowerPoint, Excel, Publisher), esquemas de color, composición visual y gráficos de datos
- **Archivos descargables**: .docx, .xlsx, .pdf con enlaces directos

## Modificaciones Nativas o de Configuración

### `vercel.json` (raíz del proyecto)

```json
{
  "cleanUrls": true,
  "trailingSlash": false
}
```

## Especificación de Modelos de Datos

No existen modelos de datos formales. La información se modela exclusivamente en HTML estático siguiendo estos patrones:

### Página de Contenido (Teoría/Guía/Práctica)

| Campo | Tipo HTML | Descripción |
|---|---|---|
| breadcrumb | `<nav class="breadcrumb-nav">` | Ruta: Home > Módulo > Sección |
| título | `<h1>` dentro de `.lesson-header` o `.guide-header` | Nombre de la lección |
| fecha | `<span class="date">` opcional | Fecha de publicación |
| subtítulo | `<p class="subtitle">` opcional | Descripción breve |
| cuerpo | `<div class="lesson-body">` | Contenido principal |
| cajas informativas | `<div class="box box-*">` | Tips, notas, advertencias |
| modal de imagen | `<div class="modal">` | Overlay para zoom |
| print-header | `<div class="print-header">` (oculto en pantalla) | Encabezado de 3 columnas para impresión |

### Página Índice de Módulo

| Elemento | Descripción |
|---|---|
| breadcrumb | `<nav class="breadcrumb-nav">` |
| buscador | `<input class="buscador-index" id="buscador-*">` |
| sección | `<section class="module-section" data-module="xx">` |
| lista | `<ul class="item-list" data-module="xx">` |
| script | `<script src="../busqueda.js"></script>` |

## Capa de Servicios y Lógica

### `busqueda.js` — Archivo único en la raíz

**Funciones:**

1. **Búsqueda en vivo** — Escucha `input` en `#buscador-*`, filtra `.item-list li` por texto.
2. **Modo oscuro** — Al cargar, lee `localStorage.getItem("theme")`. Si existe, aplica `data-theme="dark/light"`. Si no existe, usa `prefers-color-scheme: dark`. Escucha clic en `#theme-toggle` para alternar y guardar en localStorage.
3. **Print header** — Busca `.lesson-header h1` o `.guide-header h1` y copia su texto a `.print-header-center`.

**Código esperado:**

```javascript
document.addEventListener("DOMContentLoaded", function () {
    // Toggle modo oscuro
    var toggle = document.getElementById("theme-toggle");
    var stored = localStorage.getItem("theme");
    if (stored) {
        document.body.setAttribute("data-theme", stored);
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        document.body.setAttribute("data-theme", "dark");
    }
    if (toggle) {
        toggle.textContent = document.body.getAttribute("data-theme") === "dark" ? "☀" : "☾";
        toggle.addEventListener("click", function () {
            var current = document.body.getAttribute("data-theme");
            var next = current === "dark" ? "light" : "dark";
            document.body.setAttribute("data-theme", next);
            localStorage.setItem("theme", next);
            toggle.textContent = next === "dark" ? "☀" : "☾";
        });
    }

    // Print header: copiar h1 al centro
    var h1 = document.querySelector(".lesson-header h1, .guide-header h1");
    var center = document.querySelector(".print-header-center");
    if (h1 && center) center.textContent = h1.textContent;

    // Búsqueda en vivo
    var buscador = document.getElementById("buscador-clases") || document.getElementById("buscador-guias") || document.getElementById("buscador-practicas");
    if (!buscador) return;
    var lista = document.querySelector(".item-list");
    if (!lista) return;
    var items = lista.querySelectorAll("li");
    buscador.addEventListener("input", function () {
        var filtro = buscador.value.toLowerCase();
        for (var i = 0; i < items.length; i++) {
            items[i].style.display = items[i].textContent.toLowerCase().indexOf(filtro) !== -1 ? "" : "none";
        }
    });
});
```

### Modal de imagen — Lógica inline en páginas de contenido

```javascript
function openModal(img) {
    document.getElementById("modal-img").src = img.src;
    document.getElementById("img-modal").style.display = "flex";
}
function closeModal() {
    document.getElementById("img-modal").style.display = "none";
}
```

## Diseño de Interfaz de Usuario (UI) y Componentes

### Sistema de Diseño (Variables CSS en `:root`)

```css
--bg-body: #f6f8fa;
--bg-content: #ffffff;
--text-color: #333333;
--text-muted: #666666;
--title-main: #111111;
--border-light: #e5e5e5;
--shadow-sm: 0 1px 3px rgba(0,0,0,0.04);
--shadow-md: 0 4px 12px rgba(0,0,0,0.08);
--transition: all 0.3s ease-in-out;
--radius: 6px;
--font-heading: 'Inter', ...sans-serif;
--font-sans: 'Inter', ...sans-serif;
--font-serif: 'Source Serif 4', Georgia, serif;
```

### Modo oscuro (`[data-theme="dark"]`)

```css
[data-theme="dark"] {
    --bg-body: #121212;
    --bg-content: #1e1e1e;
    --text-color: #e0e0e0;
    --text-muted: #999;
    --title-main: #f0f0f0;
    --border-light: #333;
    --shadow-sm: 0 1px 3px rgba(0,0,0,0.2);
    --shadow-md: 0 4px 12px rgba(0,0,0,0.3);
}
[data-theme="dark"] img { filter: invert(0.9) hue-rotate(180deg); }
[data-theme="dark"] .box { background: #252525; }
[data-theme="dark"] .buscador-index:focus { background: #2a2a2a; }
```

### Componentes Visuales

| Componente | Clase(s) | Descripción |
|---|---|---|
| Tarjeta de módulo | `.card`, `data-module="xx"`, `.module-badge` | Grid item con badge circular de color, icono, título y 3 botones |
| Grid de tarjetas | `.grid` | `repeat(auto-fit, minmax(260px, 1fr))` |
| Breadcrumb | `.breadcrumb-nav` | Barra superior, fondo blanco |
| Sección de módulo | `.module-section` | Color vía `--module-color` con `data-module` |
| Lista de ítems | `.item-list` | Enlaces con hover translateX(3px) |
| Input de búsqueda | `.buscador-index` | Focus con box-shadow |
| Contenido de lección | `.content`, `.content.is-wide` | Max-width 800px/950px, box-shadow |
| Caja informativa | `.box`, `.box-tip`, `.box-*` | Borde izquierdo de color |
| Modal de zoom | `.modal`, `.modal-content`, `.close` | Overlay blanco, rotación 90deg en hover del close |
| Encabezado impresión | `.print-header` (3 columnas) | Solo visible en `@media print` |
| Pie impresión | `.print-footer` | Número de página con `counter(page)` |
| Toggle dark mode | `#theme-toggle` | Botón ☀/☾ en header |

### Estructura del Stylesheet Global (`main-style.css`)

1. `@import url(...)` Google Fonts (Inter + Source Serif 4)
2. `:root` — variables light + colores por módulo
3. `[data-theme="dark"]` — variables dark
4. Reset básico
5. Header y Footer (header con gradiente, título con `background-clip: text`)
6. Layout (container, grid)
7. Tarjetas (card con badge, wash hover, shadow-md, translateY)
8. Enlaces (hover scale, active scale(0.97), visited muted)
9. Breadcrumb
10. Secciones de módulo (module-section, item-list con hover translateX)
11. Buscador
12. Modal de imágenes
13. Contenido de lecciones
14. Cajas informativas
15. Tablas
16. Código y atajos
17. Botón de descarga
18. Modo oscuro (imágenes invertidas, boxes oscuros, inputs)
19. **Impresión** (`@page`, `.print-header`, `.print-footer`, ocultar nav/footer/modal)
20. **Responsive** (tablet 481-768px, móvil <768px)

### Convenciones de Nombres

- Módulos: `NN-nombre-modulo/` (00-windows, 01-word, etc.)
- Subcarpetas: `teoria/`, `guias/`, `practicas/`
- Subcarpetas de imágenes: `*-imgs/`
- Archivos: `nombre-con-guiones.html`
- Prácticas: `practica-NN-nombre.html`
- Módulos por data attribute: `data-module="win|word|ppt|xls|pub|net|ia"`

### Páginas por módulo

| Módulo | Teoría | Guías | Prácticas |
|---|---|---|---|
| 00-windows | 2 | 3 | 2 |
| 01-word | 5 | 11 | 7 |
| 02-powerpoint | 6 | 6 | 7 |
| 03-excel | 4 | 1 | 5 |
| 04-publisher | 1 | 1 | 1 |
| 05-internet | 3 | 3 | 3 |
| 06-inteligencia-artificial | 2 | 2 | 3 |
