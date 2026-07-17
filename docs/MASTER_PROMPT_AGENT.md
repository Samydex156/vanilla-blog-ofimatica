# Master Prompt — Reconstrucción del Proyecto "Vanilla Blog Ofimática"

## Instrucción de Actuación

Actúa como un Desarrollador Web Frontend Senior especializado en HTML5 semántico, CSS3 con sistema de diseño basado en variables personalizadas y JavaScript vanilla (ES5/ES6 sin bundlers ni transpiladores). Tu tarea es reconstruir desde cero un portal web educativo estático de 7 módulos sobre ofimática, con aproximadamente 98 páginas HTML, un stylesheet global único de ~702 líneas y scripts de búsqueda en vivo por módulo.

## Requisitos Técnicos y Dependencias

El proyecto NO utiliza dependencias externas. Ninguna librería, framework, package manager o build tool. Stack 100% nativo del navegador:

-   **HTML**: `<!doctype html>`, semántico (header, main, section, article, nav, footer), UTF-8, viewport meta
-   **CSS**: Variables personalizadas, reset básico, Grid layout, sin preprocesadores (ni Sass, ni PostCSS)
-   **JavaScript**: Vanilla, funciones globales, sin módulos ES6, sin imports, sin npm
-   **Fuentes**: System font stack (Inter, Segoe UI, Arial, Georgia, monospace system fonts)
-   **Despliegue**: Vercel con `cleanUrls: true` y `trailingSlash: false`
-   **Iconos**: PNG de 32x32 px por módulo
-   **Imágenes**: PNG, `max-width: 100%`, bordes de 1px solid, border-radius 4px
-   **Archivos descargables**: .docx, .xlsx, .pdf con enlaces directos

## Modificaciones Nativas o de Configuración

### `vercel.json` (raíz del proyecto)

```json
{
  "cleanUrls": true,
  "trailingSlash": false
}
```

No se requieren otros archivos de configuración. No hay `.gitignore` obligatorio, pero se recomienda excluir `*.local`, `node_modules/` (por si se agregan herramientas en el futuro) y `*.log`.

## Especificación de Modelos de Datos

No existen modelos de datos formales (sin backend, sin API, sin base de datos). La información se modela exclusivamente en HTML estático. Sin embargo, se reconocen estos patrones de datos:

### Página de Contenido (Clase/Guía/Práctica)

| Campo | Tipo HTML | Descripción |
|-------|-----------|-------------|
| breadcrumb | `<nav class="breadcrumb-nav">` | Ruta: Home > Módulo > Sección |
| título | `<h1>` dentro de `.lesson-header` | Nombre de la lección |
| fecha | `<span class="date">` opcional | Fecha de publicación |
| subtítulo | `<p class="subtitle">` opcional | Descripción breve |
| cuerpo | `<div class="lesson-body">` | Contenido principal (párrafos, imágenes, tablas) |
| bloques de información | `<div class="box box-tip/practice/...">` | Tips, notas, advertencias |
| modal de imagen | `<div class="modal">` | Overlay para zoom de capturas |

### Página Índice de Módulo (Teoría/Guias/Prácticas)

| Elemento | Descripción |
|----------|-------------|
| breadcrumb | `<nav class="breadcrumb-nav">` |
| buscador | `<input class="buscador-index" id="buscador-*">` |
| lista | `<ul class="item-list-*">` con `<li>` |
| enlace por ítem | `<a href="...">` con `.item-title` y `.item-date` opcional |

## Capa de Servicios y Lógica

No existe capa de servicios ni consumo de APIs. Toda la lógica es del lado del cliente:

### `busqueda.js` — Lógica de búsqueda en vivo

**Ubicación**: Una copia por módulo en la raíz del módulo (ej: `00-windows/busqueda.js`).

**Comportamiento esperado**:

```javascript
document.addEventListener("DOMContentLoaded", function () {
    const buscador = document.getElementById("buscador-guias") ||
                     document.getElementById("buscador-clases") ||
                     document.getElementById("buscador-practicas");
    const listaItems = document.querySelectorAll(".item-list-<modulo> li");

    if (!buscador) return;

    buscador.addEventListener("input", function () {
        const filtro = buscador.value.toLowerCase();
        listaItems.forEach(item => {
            const texto = item.textContent.toLowerCase();
            item.style.display = texto.includes(filtro) ? "" : "none";
        });
    });
});
```

La única diferencia entre módulos es el selector CSS (`.item-list-win li`, `.item-list-doc li`, `.item-list-ppt li`, `.item-list-xls li`, `.item-list-net li`, `.item-list-ia li`).

### Modal de imagen — Lógica inline en páginas de contenido

**Comportamiento esperado**:

```javascript
function openModal(img) {
    document.getElementById("modal-img").src = img.src;
    document.getElementById("img-modal").style.display = "flex";
}
function closeModal() {
    document.getElementById("img-modal").style.display = "none";
}
```

### Sin otras funciones JS. Sin AJAX, Fetch, almacenamiento local, routing, ni Service Workers.

## Diseño de Interfaz de Usuario (UI) y Componentes

### Sistema de Diseño (Variables CSS en `:root`)

```css
--bg-color: #fafafa;
--bg-body: #fafafa;
--bg-content: #ffffff;
--text-color: #333333;
--text-main: #333333;
--text-muted: #666666;
--title-main: #111111;
--white: #ffffff;
--border-light: #e5e5e5;
--shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
--transition: all 0.2s ease-in-out;
--font-heading: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-serif: 'Georgia', 'Times New Roman', serif;
--radius: 4px;
--width-reading: 800px;
--width-wide: 950px;
```

### Colores por Módulo

```css
--color-win: #2b78a1;
--color-word: #315180;
--color-excel: #296843;
--color-ppt: #b34a36;
--color-pub: #1d695f;
--color-net: #b38b22;
--color-ia: #6b4c80;
```

### Componentes Visuales (Teoría CSS)

| Componente | Clase(s) | Descripción |
|------------|----------|-------------|
| Tarjeta de módulo | `.card`, `.card-icon`, `.links` | Grid item con ícono, título y 3 botones |
| Grid de tarjetas | `.grid` | `grid-template-columns: repeat(auto-fit, minmax(250px, 1fr))` |
| Breadcrumb | `.breadcrumb-nav` | Barra de navegación superior, fondo blanco, borde inferior |
| Sección de módulo | `.module-section-*` | Contenedor de lista con título de color |
| Lista de ítems | `.item-list-*` | Lista de enlaces con hover (borde izquierdo de color) |
| Input de búsqueda | `.buscador-index` | Input ancho con border sutil y focus |
| Contenido de lección | `.content`, `.content.is-wide` | Ancho máximo 800px/950px, padding 3rem |
| Header de lección | `.lesson-header` | Título, fecha, subtítulo |
| Cuerpo de lección | `.lesson-body` | Párrafos en serif, títulos en sans-serif |
| Caja informativa | `.box`, `.box-tip`, `.box-practice`, `.box-*` | Bloque con borde izquierdo de color |
| Imagen de guía | `.guide-img`, `.shortcut-thumbnail` | Imagen responsiva, clicable para modal |
| Modal de zoom | `.modal`, `.modal-content`, `.close` | Overlay blanco semitransparente, flex centrado |
| Tabla de datos | `.wiki-table` o table nativa | Bordes, cabecera con fondo gris claro |
| Atajo de teclado | `.shortcut`, `<kbd>` | Fondo gris, borde, monospace |
| Badge/etiqueta | `.badge` | Texto pequeño uppercase |

### Tipos de Página (HTML Templates)

#### 1. Homepage (`index.html`)

```
<header>
  <h1>Recursos Ofimática</h1>
  <h2>Prof. Samuel Durán</h2>
  <p>Descripción del proyecto</p>
</header>
<main class="container">
  <section class="grid">
    <article class="card"> (x7, uno por módulo)
      <img class="card-icon" src="/imgs/img-*.png" />
      <h2>NN Nombre</h2>
      <div class="links">
        <a href="NN-modulo/index-teoria.html">Teoría</a>
        <a href="NN-modulo/index-guias.html">Guías</a>
        <a href="NN-modulo/index-practicas.html">Prácticas</a>
      </div>
    </article>
  </section>
</main>
<footer>
  <p>&copy; 2026 - Instituto Nueva Tecnología | Prof. Samuel Durán | Ofimática</p>
</footer>
```

#### 2. Página Índice de Módulo (`index-teoria.html`, `index-guias.html`, `index-practicas.html`)

```
<body>
  <nav class="breadcrumb-nav">
    <a href="../../index.html">Home</a> > Nombre Módulo > <span>Sección</span>
  </nav>
  <main class="container">
    <section class="module-section-*">
      <h2>Teoría / Guías / Prácticas de [Módulo]</h2>
      <input type="search" class="buscador-index" id="buscador-clases" placeholder="Buscar...">
      <ul class="item-list-*">
        <li><a href="ruta-a-contenido.html"><span class="item-title">Título</span><span class="item-date">Fecha</span></a></li>
      </ul>
    </section>
  </main>
  <script src="busqueda.js"></script>
</body>
```

#### 3. Página de Contenido Individual

```
<body>
  <nav class="breadcrumb-nav">Home > Módulo > <span>Página</span></nav>
  <article class="content">
    <div class="lesson-header">
      <span class="date">Fecha</span>
      <h1>Título de la Lección</h1>
      <p class="subtitle">Subtítulo o descripción</p>
    </div>
    <div class="lesson-body">
      <!-- Contenido: párrafos, imágenes, tablas, boxes -->
    </div>
  </article>
  <!-- Modal de imagen (opcional, si la página incluye imágenes clicables) -->
  <div id="img-modal" class="modal" onclick="closeModal()">
    <span class="close">&times;</span>
    <img class="modal-content" id="modal-img" alt="Vista ampliada">
  </div>
  <script>
    function openModal(img) { ... }
    function closeModal() { ... }
  </script>
</body>
```

### Estructura del Stylesheet Global (`main-style.css`)

1.  **Variables globales** (`:root`) — colores, tipografías, dimensiones, colores por módulo
2.  **Reset básico** — margin 0, padding 0, box-sizing border-box
3.  **Header y Footer** — centrados, fondo blanco, bordes sutiles
4.  **Layout con Grid** — `.container` (flex column), `.grid` (auto-fit minmax)
5.  **Tarjetas (Cards)** — `.card`, `.card-icon`, `.card:hover`, `.links`, `.links a`
6.  **Colores por módulo** — `:nth-child(1)` a `:nth-child(7)` con border-top
7.  **Breadcrumb** — `.breadcrumb-nav`
8.  **Secciones de módulo** — `.module-section-*` con h2 colorizado
9.  **Listas de ítems** — `.item-list-*` con hover effects
10. **Buscador** — `.buscador-index`
11. **Modal de imágenes** — `.modal`, `.modal-content`, `.close`
12. **Contenido de lecciones** — `.content`, `.lesson-header`, `.lesson-body` (párrafos serif, títulos sans-serif)
13. **Cajas informativas** — `.box`, `.box-tip`, `.box-practice`
14. **Tablas** — `.wiki-table`
15. **Responsive** — `@media (max-width: 768px)`

### Convenciones de Nombres

- Módulos: `NN-nombre-modulo/` (00-windows, 01-word, 02-powerpoint, etc.)
- Subcarpetas de contenido: `teoria/`, `guias/`, `practicas/`
- Subcarpetas de imágenes del módulo: `*-imgs/` (ej: `word-Teoría-imgs/`, `word-guias-imgs/`)
- Archivos de contenido: `nombre-con-guiones.html` (ej: `conceptos-basicos.html`)
- Archivos de práctica: `practica-NN-nombre.html`
- Nombres de clase CSS: prefijo por propósito (`.module-section-*`, `.item-list-*`, `.box-*`)

### Páginas requeridas por módulo

| Módulo | Teoría | Guías | Prácticas |
|--------|--------|-------|-----------|
| 00-windows | 2 | 2 | 2 |
| 01-word | 5 | 11 | 6 |
| 02-powerpoint | 6 | 6 | 7 |
| 03-excel | 4 | 1 | 5 |
| 04-publisher | 1 | 1 | 1 |
| 05-internet | 3 | 3 | 3 |
| 06-inteligencia-artificial | 2 | 2 | 3 |

Total: **98 páginas HTML** sin contar índices y homepage.
