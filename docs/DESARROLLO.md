# 💻 Manual de Desarrollo y Mantenimiento — Vanilla Blog Ofimática

## 1. Entorno de Desarrollo

El portal es **Jamstack estático**: no requiere Node.js, npm, bundlers ni gestores de dependencias para funcionar. Solo el módulo 09 necesita un servidor HTTP local y credenciales de Supabase opcionales.

### 🛠️ Requisitos mínimos

- **Sistema operativo**: Windows 10/11, macOS o Linux.
- **Navegador**: Chrome, Edge, Firefox o Safari con DevTools.
- **Editor**: Visual Studio Code (recomendado), Sublime Text o Neovim.
- **Python 3** o **Node.js** para servir el sitio por HTTP.

### 🧩 Extensiones sugeridas en VS Code

- *Live Server* (`ritwickdey.liveserver`): recarga automática al guardar.
- *HTML CSS Support* (`ecmel.vscode-html-css`): autocompletado de clases.

### 🔑 Configuración y variables de entorno

No hay `.env`: todo el sitio es cliente y no existen secretos de servidor.

| Configuración | Archivo | Contenido |
| :--- | :--- | :--- |
| Despliegue | `vercel.json` | `cleanUrls: true`, `trailingSlash: false` |
| Supabase (módulo 09) | `mecanografia/js/config.js` | `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `DB_SCHEMA`, `SPRINT_SECONDS` |
| Tema y tokens | `main-style.css` (`:root` y `[data-theme="dark"]`) | Colores, tipografías, anchos y radios |

> La *anon public key* es pública por diseño y está versionada en `config.js`. **Nunca** se coloca la `service_role` key en el navegador. `.gitignore` excluye `.env`, `.env.*`, `.vercel/` y `supabase/.temp/`.

`IS_CONFIGURED` se calcula validando la forma de la URL y la longitud de la clave. Si falla, la aplicación arranca en modo demo sin tocar la red.

---

## 2. Comandos de Terminal Clave

### 📥 Clonado

```bash
git clone https://github.com/Samydex156/vanilla-blog-ofimatica.git
cd vanilla-blog-ofimatica
```

### 🚀 Servidor de desarrollo local

```bash
# Recomendado: sirve todo el portal, incluida la app de mecanografía
python -m http.server 8123
# http://localhost:8123

# Alternativas
npx serve .
php -S localhost:8123
```

> ⚠️ `mecanografia/` **no funciona con `file://`**: usa módulos ES y rutas absolutas (`/mecanografia/...`). Abrirla con doble clic deja la pantalla sin estilos y sin lógica.

### 🧹 Formateo opcional

```bash
npx prettier --write "**/*.{html,css,js,json,md}"
```

No hay configuración de Prettier en el repositorio: se usa para normalizar un archivo puntual, no como paso obligatorio.

### 🚢 Despliegue en Vercel

```bash
npx vercel login
npx vercel          # entorno de preview
npx vercel --prod   # producción
```

### 🗄️ Base de datos del módulo 09

El SQL se ejecuta **a mano** en el panel de Supabase:

1. `SQL Editor → New query` → pegar `mecanografia/sql/setup.sql` → `Run`.
2. `Project Settings → API → Exposed schemas` → añadir `mecanografia` → `Save`.
3. Comprobar el bloque de verificación del final del script (6 tablas, 13 funciones, 12 textos, 6 con RLS, 11 expuestas a `anon`).

---

## 3. Convenciones del Código

### 📁 Estructura

- Módulos: `NN-nombre-modulo/` con tres subcarpetas (`teoria/`, `guias/`, `practicas/`) y tres índices (`index-teoria.html`, `index-guias.html`, `index-practicas.html`).
- Páginas de contenido: nombres en `kebab-case` descriptivo; las clases de Excel, Publisher y Access llevan prefijo de fecha (`2026-01-17-introduccion.html`).
- Activos: imágenes junto a su sección (`word-guias-imgs/`, `atajos-excel-imgs/`) o en `practicas/ejercicios/` cuando son descargables.

### 🔗 Rutas

- El portal usa **rutas relativas** (`../../main-style.css`, `../index-teoria.html`, `word-clases-imgs/*.png`).
- `mecanografia/` usa **rutas absolutas** desde la raíz del dominio (`/mecanografia/css/app.css`, `/imgs/img-favicon.png`).

### 🎨 CSS

- No se crean colores sueltos: se usan las variables de `:root` (`var(--color-word)`, `var(--border-light)`, `var(--font-heading)`).
- Los colores por módulo se aplican con `data-module` y `--module-color`.
- Los estilos de impresión **no** se escriben en páginas sueltas: viven en el bloque `@media print` de `main-style.css`.

### ⚙️ JavaScript

- `busqueda.js` es ES5 (`var`, `function`) y **solo se carga en páginas índice**.
- Las páginas de contenido llevan scripts inline con sintaxis moderna (`?.`) y no cargan `busqueda.js`.
- `mecanografia/js/*.js` son módulos ES (`export`/`import`), sin `var` y con funciones pequeñas por responsabilidad.

---

## 4. Plantilla de una Página de Contenido

Estructura mínima que deben respetar todas las lecciones, guías y prácticas:

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

Los dos scripts del final y el `.print-footer` son imprescindibles: sin el primero el encabezado de impresión queda vacío, y sin el segundo no se imprime la numeración de página.

---

## 5. Solución de Problemas (Troubleshooting)

| Síntoma | Causa raíz | Solución |
| :--- | :--- | :--- |
| **Parpadeo blanco al cargar en modo oscuro (FOUC)** | Falta la IIFE en el `<head>`. | Insertar el script Anti-FOUC antes de `main-style.css`. Única excepción deliberada: `mecanografia/index.html`. |
| **El buscador no filtra** | El input no tiene un ID admitido o la lista no es `.item-list`. | Usar `buscador-clases`, `buscador-guias`, `buscador-practicas`, `buscador-evaluaciones` o `buscador-index`, y `<ul class="item-list">`. |
| **El encabezado de impresión sale vacío** | Falta el script que copia el `<h1>`. | En contenido, añadir la IIFE de copia antes de `</body>`; en índices lo hace `busqueda.js`. |
| **No se imprime el número de página** | Falta `<div class="print-footer"></div>`. | Añadirlo al final del `<body>`; el contenido lo genera la regla `counter(page)`. |
| **El toggle de tema no responde en una página de contenido** | La página no carga `busqueda.js` (correcto) ni tiene el script inline de toggle. | Copiar el bloque de toggle de la plantilla. No agregar `busqueda.js` al contenido. |
| **Los SVG no cambian de color en modo oscuro** | El archivo tiene colores fijos (`fill="#000"`). | Usar `currentColor` en `stroke`/`fill`. |
| **Imágenes o rutas rotas en carpetas profundas** | Nivel incorrecto de `../`. | Desde `01-word/teoria/` se usa `../../` para llegar a la raíz. |
| **Mecanografía se ve sin estilos o sin lógica** | Se abrió con `file://`. | Servir por HTTP (`python -m http.server 8123`). |
| **Mecanografía: «El esquema `mecanografia` no está en Exposed schemas»** | Falta exponerlo en el panel. | `Project Settings → API → Exposed schemas` y guardar. Se refleja como `PGRST106`. |
| **Mecanografía: «Falta ejecutar sql/setup.sql»** | El esquema existe pero no las tablas o funciones. | Reejecutar el archivo completo y revisar el bloque de verificación. |
| **Mecanografía: «Tu sesión ha caducado»** | Pasaron más de 60 días sin uso o se restableció la contraseña. | Volver a entrar; el docente puede usar `mecanografia.reset_password(...)`. |
| **Mecanografía: «Demasiados intentos fallidos»** | Cinco fallos consecutivos bloquean 5 minutos. | Esperar o ejecutar `reset_password`. |
| **Mecanografía: el teclado no responde** | El campo de tecleo no tiene el foco. | Hacer clic en el área de texto o pulsar *Empezar a escribir* (`data-action="focus-input"`). |
| **Mecanografía: error al cargar el SDK** | jsDelivr bloqueado o sin red. | Comprobar la conexión; sin SDK no hay modo Supabase y conviene activar el demo. |
| **Vercel sirve la app en una ruta rara** | `cleanUrls` y `trailingSlash` combinados con rutas relativas. | Mantener las rutas absolutas de `mecanografia/index.html` y publicar en la raíz del dominio. |

---

## 6. Guía de Extensión (Recetas Paso a Paso)

### 🥑 Receta 1: Añadir un nuevo módulo

1. Crear la estructura:

   ```text
   08-nuevo-modulo/
   ├── index-teoria.html
   ├── index-guias.html
   ├── index-practicas.html
   ├── teoria/
   ├── guias/
   └── practicas/
   ```

2. Declarar el color en `main-style.css` (`:root` y `[data-theme="dark"]` si aplica):

   ```css
   :root { --color-nuevo: #8E44AD; }

   .card[data-module="nuevo"]        { border-top: 2px solid var(--color-nuevo); }
   .card[data-module="nuevo"]:hover  { background: #F6F2FA; }
   .card[data-module="nuevo"] .module-badge { background: var(--color-nuevo); }
   [data-module="nuevo"]             { --module-color: var(--color-nuevo); }
   [data-theme="dark"] .card[data-module="nuevo"]:hover { background: #231B28; }
   ```

3. Crear el ícono en `imgs/svg/icon-nuevo.svg` usando `stroke="currentColor"`.
4. Añadir la tarjeta en `index.html` antes de la tarjeta de herramientas:

   ```html
   <article class="card" data-module="nuevo">
     <img src="imgs/svg/icon-nuevo.svg" alt="Nuevo Módulo" class="card-icon" loading="lazy" />
     <h2><span class="module-badge"></span> 08 Nuevo Módulo</h2>
     <div class="links">
       <a href="08-nuevo-modulo/index-teoria.html">Teor&iacute;a</a>
       <a href="08-nuevo-modulo/index-guias.html">Guías</a>
       <a href="08-nuevo-modulo/index-practicas.html">Prácticas</a>
     </div>
   </article>
   ```

5. Renumerar las tarjetas posteriores (herramientas y mecanografía) si el módulo se inserta en medio.

> Los cinco pasos de color son fáciles de olvidar: si falta el bloque `.card[data-module="nuevo"]`, la tarjeta aparece sin borde superior ni badge, exactamente como le ocurre hoy a la tarjeta `meca`.

---

### 📝 Receta 2: Añadir una lección de teoría o una guía

1. Copiar una página existente de `teoria/` o `guias/` y renombrarla.
2. Actualizar `<title>`, migas de pan, `.date`, `<h1>` y `.subtitle`.
3. Escribir el contenido dentro de `<section class="lesson-body">`.
4. Verificar que permanecen el encabezado `.print-header`, los dos scripts finales y `.print-footer`.
5. Registrar el archivo en el índice correspondiente:

   ```html
   <li>
     <a href="teoria/nueva-leccion.html">
       <span class="item-title">Título de la lección</span>
       <span class="item-meta">Clase 03 &middot; 24 de enero</span>
     </a>
   </li>
   ```

6. Añadir las capturas en la carpeta de imágenes de la sección y referenciarlas con ruta relativa.

> **Atención al índice de Word**: hoy existen 11 guías pero el índice enlaza 7. Si agregas una guía, comprueba que el `<li>` no queda dentro de un comentario `<!-- -->`.

---

### 🎨 Receta 3: Añadir un diagrama SVG

```html
<div class="svg-chart-preview">
  <svg viewBox="0 0 600 200" xmlns="http://www.w3.org/2000/svg" class="svg-chart">
    <rect x="10" y="10" width="580" height="180" rx="8"
          fill="var(--bg-content)" stroke="currentColor" stroke-width="2" />
    <text x="30" y="50" fill="currentColor" font-family="sans-serif" font-weight="bold">
      Título del diagrama
    </text>
  </svg>
</div>
```

Usar siempre `currentColor` o variables CSS: así el gráfico se adapta al modo oscuro sin duplicar el marcado.

---

### 📝 Receta 4: Añadir una evaluación (solo Word por ahora)

1. Copiar `01-word/evaluaciones/test-fundamentos-word.html` como `test-nuevo.html`.
2. Conservar los IDs: `student-name`, `registration-form`, `quiz-screen`, `question-counter`, `progress-fill`, `question-container`, `question-text`, `options-grid`, `result-screen`, `student-name-display`, `final-score`, `feedback-text`, `quiz-summary`.
3. Editar el arreglo de 10 preguntas con su `explicacion`:

   ```js
   { pregunta: "…", opciones: ["A","B","C","D"], respuesta: 0, tipo: "multiple", explicacion: "…" }
   { pregunta: "…", opciones: [], respuesta: 0, tipo: "vf", explicacion: "…" }
   ```

4. Registrar el test en `01-word/index-evaluaciones.html` dentro de `<ul class="item-list">`.
5. No modificar `evaluaciones/js/quiz-core.js` salvo para cambiar reglas de nota o el texto de `feedback-text`.

---

### ⌨️ Receta 5: Añadir o cambiar textos del sprint

- **En producción**: editar la tabla `mecanografia.sprint_texts` desde el Table Editor. `body` debe tener entre 120 y 1200 caracteres y `title` es único. Para desactivar un texto sin borrarlo, poner `active = false`.
- **En modo demo**: editar `mecanografia/js/data/sprint-texts.js`, que funciona como respaldo local.

### ⌨️ Receta 6: Añadir una lección de mecanografía

1. Añadir el objeto en `mecanografia/js/data/lessons.js`, dentro de la unidad correspondiente:

   ```js
   {
     id: "u3-l4",                 // estable: es la clave en lesson_progress
     title: "…",
     focus: ["a", "s", "d"],
     goalWpm: 22,
     goalAccuracy: 96,
     tip: "…",
     text: "…",
   }
   ```

2. Mantener el patrón de `id`: `u{unidad}-l{lección}`.
3. No hace falta tocar el SQL: `lesson_progress` acepta cualquier `lesson_id` de texto.

### 🔌 Receta 7: Añadir una operación de datos a mecanografía

1. Crear la función en `mecanografia/sql/setup.sql` con `security definer` y `set search_path = mecanografia, public`.
2. Empezar siempre resolviendo la sesión:

   ```sql
   v_student := mecanografia.touch_session(p_token);
   ```

3. Conceder ejecución solo a esa firma: `grant execute on function … to anon, authenticated;`
4. Reejecutar el script completo y comprobar el bloque de verificación (los conteos cambian si se añade una función).
5. Exponerla en `mecanografia/js/api.js` (adaptador Supabase **y** adaptador demo) para que ambas rutas mantengan la misma interfaz.

---

## 7. Checklist Antes de Publicar

- [ ] La página nueva tiene la IIFE Anti-FOUC, `#theme-toggle`, `.print-header`, `.print-footer` y los dos scripts finales.
- [ ] El nuevo contenido está enlazado desde su índice (y el `<li>` no está comentado).
- [ ] Las rutas de CSS, JS e imágenes resuelven con el número correcto de `../`.
- [ ] El modo oscuro y el modo impresión se revisaron visualmente.
- [ ] Si se tocó el esquema de Supabase, el bloque de verificación devuelve los números esperados.
- [ ] No se añadieron claves privadas ni la `service_role`.
- [ ] `mecanografia/` se probó servida por HTTP, no con `file://`.

---

## 8. Deuda Técnica Conocida

Estos puntos están documentados, no resueltos:

1. Cuatro guías de Word existen pero no se enlazan desde su índice.
2. La tarjeta `meca` no tiene color de módulo en `main-style.css`.
3. El validador de Word sigue oculto con `hidden` y carga dos librerías de CDN.
4. Hay tres carpetas de imágenes vacías reservadas para contenido futuro.
5. Las capturas de solución están duplicadas entre `ejercicios/` e `imgs-practicas/`.
6. El registro de mecanografía está abierto y no hay panel docente.
7. El portal no tiene pruebas automatizadas: la verificación es manual, apoyada en el checklist anterior y en la batería REST de [`SUPABASE_ESQUEMAS.md`](SUPABASE_ESQUEMAS.md) para la parte de datos.
