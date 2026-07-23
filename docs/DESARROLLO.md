# 💻 Manual de Desarrollo y Mantenimiento — Vanilla Blog Ofimática

## 1. Entorno de Desarrollo

El proyecto utiliza una arquitectura **Vanilla Static Jamstack**, lo que significa que **no requiere la instalación de Node.js, npm, bundlers, compilers ni gestores de dependencias para su correcto funcionamiento**.

### 🛠️ Requisitos Mínimos del Sistema
- **Sistema Operativo**: Windows 10/11, macOS, o Linux.
- **Navegador Web**: Google Chrome, Microsoft Edge, Firefox, o Safari con herramientas de desarrollo (DevTools) habilitadas.
- **Editor de Código**: Visual Studio Code (recomendado), Sublime Text o Neovim.
- **Extensiones Sugeridas en VS Code**:
  - *Live Server* (ritwickdey.liveserver): Para recarga automática en el navegador al guardar cambios.
  - *HTML CSS Support* (ecmel.vscode-html-css): Autocompletado de clases CSS.

### 🔑 Variables de Entorno (`.env`)
Debido a que es una aplicación 100% estática client-side, **no existen variables de entorno secretas ni configuraciones de servidor `.env`**. Toda la configuración pública se gestiona en `vercel.json` o mediante variables CSS globales en `main-style.css`.

---

## 2. Comandos de Terminal Clave

### 📥 Clonado del Repositorio
```bash
git clone https://github.com/Samydex156/vanilla-blog-ofimatica.git
cd vanilla-blog-ofimatica
```

### 🚀 Ejecución y Servidor de Desarrollo Local
Para visualizar los cambios localmente y simular el entorno de producción:

```bash
# Opción 1: Servidor HTTP con Python 3 (Sin instalar paquetes)
python -m http.server 8000
# Acceder a: http://localhost:8000

# Opción 2: Servidor liviano con Node.js (npx serve)
npx serve .
# Acceder a: http://localhost:3000

# Opción 3: Servidor interno con PHP
php -S localhost:8000
# Acceder a: http://localhost:8000
```

### 🧹 Linting y Formateo de Código (Opcional con Prettier)
```bash
# Formatear todos los archivos HTML, CSS y JS si se tiene Prettier instalado globalmente:
npx prettier --write "**/*.{html,css,js,json,md}"
```

### 🚢 Despliegue a Producción (Vercel CLI)
```bash
# Iniciar sesión en Vercel
npx vercel login

# Despliegue a entorno de Preview
npx vercel

# Despliegue directo a Producción
npx vercel --prod
```

---

## 3. Solución de Problemas Comunes (Troubleshooting)

| Síntoma / Problema | Causa Raíz | Solución Paso a Paso |
| :--- | :--- | :--- |
| **Parpadeo blanco al cargar en Modo Oscuro (FOUC)** | Falta el script bloqueante en la cabecera `<head>` del HTML. | Copiar e inyectar en el `<head>` del HTML la IIFE síncrona: `<script>(function(){var t=localStorage.getItem("theme");if(t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme:dark)").matches)){document.documentElement.setAttribute("data-theme","dark")}})();</script>`. |
| **El buscador no filtra los elementos** | El ID del input no coincide o la estructura `<li>` no tiene la clase `.item-list`. | Verificar que el `<input>` tenga alguno de los IDs válidos (`buscador-clases`, `buscador-guias`, `buscador-practicas`, `buscador-index`) y que la lista `<ul>` tenga la clase `.item-list`. |
| **El encabezado de impresión aparece en blanco en la columna central** | No se encuentra el elemento `<h1>` dentro de la cabecera de la lección o `busqueda.js` no cargó. | Asegurarse de que el título esté maquetado dentro de `.lesson-header h1` o `.guide-header h1`, y que `<script src="../../busqueda.js"></script>` esté presente antes de cerrar el `</body>`. |
| **Los íconos SVG no cambian de color en modo oscuro** | El archivo SVG tiene colores codificados de forma fija (`fill="#000000"`). | Abrir el archivo `.svg` en `imgs/svg/` y reemplazar los valores hexadecimales de `stroke` o `fill` por `currentColor`. |
| **Imágenes o rutas rotas al navegar en carpetas profundas** | La ruta relativa en el atributo `href` o `src` tiene un nivel incorrecto de `../`. | Verificar el nivel del directorio: desde `01-word/teoria/` se debe usar `../../` para regresar a la raíz. |

---

## 4. Guía de Extensión (Recetas Paso a Paso)

### 🥑 Receta 1: Cómo Añadir un Nuevo Módulo (Ejemplo: 07-nuevo-modulo)

1. **Crear la estructura de carpetas**:
   ```text
   07-nuevo-modulo/
   ├── index-teoria.html
   ├── index-guias.html
   ├── index-practicas.html
   ├── teoria/
   ├── guias/
   └── practicas/
   ```
2. **Definir el color del módulo en `main-style.css`**:
   ```css
   /* En :root */
   --color-nuevo: #8e44ad;

   /* Borde y Badge en homepage */
   .card[data-module="nuevo"] { border-top: 3px solid var(--color-nuevo); }
   .card[data-module="nuevo"] .module-badge { background: var(--color-nuevo); }
   ```
3. **Agregar la tarjeta en `index.html`**:
   ```html
   <article class="card" data-module="nuevo">
     <img src="imgs/svg/icon-nuevo.svg" alt="Nuevo Módulo" class="card-icon" loading="lazy" />
     <h2><span class="module-badge"></span> 07 Nuevo Módulo</h2>
     <div class="links">
       <a href="07-nuevo-modulo/index-teoria.html">Teoría</a>
       <a href="07-nuevo-modulo/index-guias.html">Guías</a>
       <a href="07-nuevo-modulo/index-practicas.html">Prácticas</a>
     </div>
   </article>
   ```

---

### 📝 Receta 2: Cómo Añadir una Nueva Lección de Teoría o Guía

1. Copiar un archivo HTML existente dentro de la carpeta `teoria/` o `guias/` correspondiente.
2. Actualizar las migas de pan (`.breadcrumb-nav`):
   ```html
   <nav class="breadcrumb-nav">
     <a href="../../index.html">Inicio</a> &gt;
     <a href="../index-teoria.html">Módulo</a> &gt;
     <span>Título de la Lección</span>
   </nav>
   ```
3. Escribir el contenido dentro del contenedor `<div class="lesson-body">`.
4. Incluir el script de JS al final del documento:
   ```html
   <script src="../../busqueda.js"></script>
   ```
5. Registrar el nuevo archivo en el `index-teoria.html` o `index-guias.html` del módulo correspondiente dentro de la lista `<ul class="item-list">`.

---

### 🎨 Receta 3: Cómo Agregar un Nuevo Diagrama Vectorial SVG

Para incluir un diagrama técnico que se adapte al modo oscuro automáticamente:

```html
<div class="svg-chart-preview">
  <svg viewBox="0 0 600 200" xmlns="http://www.w3.org/2000/svg" class="svg-chart">
    <!-- Usar var(--text-color) o currentColor para bordes y texto -->
    <rect x="10" y="10" width="580" height="180" rx="8" fill="var(--bg-content)" stroke="currentColor" stroke-width="2"/>
    <text x="30" y="50" fill="currentColor" font-family="sans-serif" font-weight="bold">Título del Diagrama</text>
  </svg>
</div>
```
