# 📚 Recursos de Ofimática — Portal Educativo

[![Plataforma Estática](https://img.shields.io/badge/Stack-Vanilla%20HTML%2FCSS%2FJS-blue.svg)](https://github.com/Samydex156/vanilla-blog-ofimatica)
[![Licencia](https://img.shields.io/badge/Licencia-Educativa-green.svg)](#licencia)
[![Despliegue Vercel](https://img.shields.io/badge/Despliegue-Vercel-black.svg)](https://vercel.com)
[![Módulos](https://img.shields.io/badge/M%C3%B3dulos-10-orange.svg)](#-módulos-disponibles)

> Portal web educativo de alto rendimiento diseñado para centralizar el material de enseñanza del curso de **Ofimática** en el **Instituto Nueva Tecnología**, impartido por el **Prof. Samuel Durán**. Reúne clases de teoría, guías metodológicas paso a paso, diagramas técnicos vectoriales, ejercicios descargables de aplicación real y evaluaciones interactivas con retroalimentación en clase.
>
> Desde octubre de 2026 el portal incorpora además **MecaSamType Web**, un entrenador de mecanografía completo que funciona como aplicación dentro del sitio y guarda el progreso de los alumnos en **Supabase**.

---

## 🚀 Características Principales

### 📖 Módulos Disponibles

La portada (`index.html`) presenta **10 tarjetas**: ocho módulos temáticos con estructura `teoria/` · `guias/` · `practicas/`, un catálogo de software y una aplicación independiente.

| # | Módulo | Carpeta | `data-module` | Teoría | Guías | Prácticas | Extra |
| :-: | :--- | :--- | :--- | :-: | :-: | :-: | :--- |
| 00 | 🖥️ Windows | `00-windows/` | `win` | 2 | 3 | 2 | — |
| 01 | 📝 Word | `01-word/` | `word` | 5 | 11 | 8 | 3 evaluaciones interactivas + validador oculto |
| 02 | 📊 PowerPoint | `02-powerpoint/` | `ppt` | 6 | 9 | 7 | 3 evaluaciones interactivas |
| 03 | 📈 Excel | `03-excel/` | `xls` | 4 | 1 | 5 | — |
| 04 | 📰 Publisher | `04-publisher/` | `pub` | 1 | 1 | 1 | — |
| 05 | 🌐 Internet | `05-internet/` | `net` | 6 | 5 | 5 | Pixabay, Photopea y uBlock Origin |
| 06 | 🤖 Inteligencia Artificial | `06-inteligencia-artificial/` | `ia` | 3 | 3 | 7 | Gemini, Nano Banana y OpenCode |
| 07 | 🗃️ Access | `07-Access/` | `access` | 1 | 1 | 1 | Migración desde Excel |
| 08 | 🧰 Programas y Herramientas | `instaladores-herramientas/` | `herramientas` | — | — | — | Catálogo + `MecaSamType_Installer.exe` |
| 09 | ⌨️ Mecanografía | `mecanografia/` | `meca` | — | — | — | Aplicación SPA + Supabase |
| | **Totales** | | | **28** | **34** | **36** | **98 páginas de contenido + 6 tests** |

- 🖥️ **00 Windows**: sistema operativo, escritorio, gestión de archivos y carpetas, atajos de teclado.
- 📝 **01 Word**: anatomía del documento formal, formatos de papel, estilos, saltos de página y sección; 8 prácticas que culminan en la monografía con norma APA 7.ª edición.
- 📊 **02 PowerPoint**: oratoria, teoría del color, regla 60-30-10, composición tipográfica, storytelling, transiciones y animación; 3 evaluaciones interactivas.
- 📈 **03 Excel**: estructura de celdas, formato numérico, operadores, fórmulas y un caso financiero de cálculo de beneficio.
- 📰 **04 Publisher**: maquetación editorial y diseño de piezas impresas.
- 🌐 **05 Internet**: navegadores, extensiones, bancos de recursos libres (Pixabay) y edición de imagen en línea con Photopea.
- 🤖 **06 IA**: prompts efectivos con Google Gemini, generación de imágenes con Nano Banana y trabajo con OpenCode como agente de código.
- 🗃️ **07 Access**: bases de datos, objetos de Access y migración de libros de Excel a un modelo relacional.
- 🧰 **08 Programas y Herramientas**: catálogo de utilidades descargables (Cavalry y MecaSamType).
- ⌨️ **09 Mecanografía**: 17 lecciones guiadas, teclado virtual en español ES y sprint competitivo de 60 segundos.

### ⌨️ MecaSamType Web (módulo 09)

Aplicación de una sola página con enrutador por hash (`#/`, `#/leccion/:id`, `#/sprint`, `#/ranking`) que vive en `mecanografia/`:

- 🎯 **17 lecciones** repartidas en **5 unidades** progresivas, con objetivos de velocidad y precisión por lección.
- ⌨️ **Teclado virtual español ES** con colores por dedo, pista de la siguiente tecla y soporte de `Shift`, `AltGr` y tildes.
- 🏁 **Sprint de 60 segundos** con textos aleatorios y Top 10 público del grupo.
- 👤 **Cuentas propias** con usuario y contraseña (sin correo y sin Supabase Auth), contraseñas con **bcrypt** y tokens de sesión de 60 días.
- 💾 **Progreso privado** por alumno en el esquema `mecanografia` de Supabase: 6 tablas y 13 funciones `SECURITY DEFINER`.
- 🧪 **Modo demo** automático (o con `?demo=1`) cuando no hay credenciales: guarda en `localStorage` bajo `mecasamtype.demo.v2`.

El detalle de puesta en marcha vive en [`mecanografia/README.md`](../mecanografia/README.md); los criterios de seguridad y la batería de pruebas, en [`SUPABASE_ESQUEMAS.md`](SUPABASE_ESQUEMAS.md).

### 🎨 Sistema de Diseño y UI/UX

- 📜 **Warm Paper & Obsidian Terminal**: estilo visual retro-elegante inspirado en publicaciones editoriales clásicas y consolas modernas, con `Source Serif 4`, `Inter` y `JetBrains Mono`.
- 🖼️ **Iconografía 100% SVG**: 11 íconos en `imgs/svg/` que heredan el color con `currentColor` y se adaptan al modo oscuro sin activos adicionales.
- 📊 **Diagramas teóricos en SVG**: ventanas de aplicaciones Office, esquemas de color y gráficos de datos dibujados en código.
- 🔍 **Buscador en vivo unificado**: motor síncrono client-side sobre las listas `.item-list`, con cinco identificadores admitidos (`buscador-clases`, `buscador-guias`, `buscador-practicas`, `buscador-evaluaciones`, `buscador-index`). Se carga en **34 páginas**: portada, 26 índices de módulo, catálogo de herramientas y los 6 tests.
- 📝 **Evaluaciones interactivas**: 3 tests de 10 preguntas en `01-word/evaluaciones/` y 3 en `02-powerpoint/evaluaciones/`, con registro de nombre, orden aleatorio, barra de progreso, nota sobre 100 y resumen con explicaciones para debate en clase. Cada módulo tiene su propio `quiz-core.js` sin backend ni `localStorage`.
- 🌙 **Modo oscuro Anti-FOUC**: IIFE bloqueante en el `<head>` de las 133 páginas del portal (la única excepción es `mecanografia/index.html`, que tiene su propio tema oscuro fijo).
- 🖨️ **Modo impresión institucional**: `@media print` genera un encabezado de 3 columnas (profesor · título · institución) y un pie con numeración `Página N`. El marcado `.print-header` y `.print-footer` está presente en las **98** páginas de contenido.
- ⚡ **Arquitectura cero-dependencias (con excepciones declaradas)**:
  - El portal no usa frameworks, bundlers ni `npm install`.
  - `mecanografia/` carga `@supabase/supabase-js@2` desde jsDelivr **solo** cuando hay credenciales.
  - `01-word/validador-web/` carga JSZip y fast-xml-parser desde CDN y permanece **oculto** (`hidden`) en `01-word/index-practicas.html`.
  - Las tipografías se piden a Google Fonts.

---

## ⌨️ Atajos de Teclado y Flujos Rápidos

| Acción / Flujo | Atajo / Interacción | Descripción |
| :--- | :--- | :--- |
| **Alternar Tema Visual** | Clic en el botón `[ ☀ ]` / `[ ☾ ]` | Cambia entre *Warm Paper* (claro) y *Obsidian Terminal* (oscuro) y lo guarda en `localStorage`. |
| **Búsqueda Rápida** | Tipear en `<input id="buscador-*">` | Filtra en tiempo real las lecciones y ejercicios de las páginas índice. |
| **Ampliar Imagen** | Clic en imagen `.shortcut-thumbnail` | Abre el modal de zoom (`#imageModal`) en las guías de atajos de Word y Excel. |
| **Cerrar Zoom** | Tecla `Escape` o clic fuera del modal | Oculta el modal de zoom de imagen. |
| **Responder evaluación** | Clic en opción `A/B/C…` o `Verdadero/Falso` | Registra la respuesta y avanza con `Siguiente →` / `Finalizar Evaluación`. |
| **Escribir en mecanografía** | Clic en el área de texto o `Empezar a escribir` | Enfoca el `input` oculto que captura las pulsaciones y tolera tildes compuestas. |
| **Iniciar sprint** | Botón `Empezar sprint` (ruta `#/sprint`) | Arranca la prueba de 60 segundos con texto aleatorio. |
| **Imprimir / Exportar PDF** | `Ctrl + P` / `Cmd + P` | Genera la vista de impresión en carta con encabezado institucional y pie numerado. |

---

## 📋 Requisitos Previos

El portal es **Jamstack estático**: no requiere entornos de ejecución ni compilación.

- 🌐 **Navegador moderno**: Chrome 90+, Edge 90+, Firefox 88+ o Safari 14+.
- 💻 **Editor de código** (opcional): VS Code, Sublime Text o Neovim.
- 🐍 **Servidor HTTP local**: necesario para `mecanografia/`, que usa módulos ES y rutas absolutas.

---

## 🛠️ Instalación y Configuración Rápida

```bash
# 1. Clonar el repositorio
git clone https://github.com/Samydex156/vanilla-blog-ofimatica.git

# 2. Entrar al directorio
cd vanilla-blog-ofimatica

# 3. Servir el sitio (recomendado para todo el portal)
python -m http.server 8123
# Abrir: http://localhost:8123
```

> ⚠️ **No abrir `mecanografia/index.html` con doble clic.** Sus rutas son absolutas (`/mecanografia/...`) y sus módulos ES no se cargan desde `file://`. El resto del portal sí funciona con doble clic, aunque el servidor local reproduce mejor el comportamiento de producción.

### 🐍 Servidor local

```bash
# Opción A: Python 3
python -m http.server 8123

# Opción B: Node.js
npx serve .

# Opción C: PHP
php -S localhost:8123
```

### 🔐 Configurar Supabase (solo para el módulo 09)

`mecanografia/js/config.js` ya apunta al proyecto `ehscdeiexsedaslxoezw`. Para usar otro proyecto:

1. Ejecutar `mecanografia/sql/setup.sql` en el SQL Editor.
2. Añadir `mecanografia` a **Exposed schemas** (`Project Settings → API`).
3. Copiar la *Project URL* y la *anon public key* en `js/config.js`.

Sin credenciales válidas la aplicación arranca en **modo demo** y no envía nada a la red. Nunca se coloca la `service_role` key en el navegador.

---

## 🚀 Despliegue

El despliegue está pensado para **Vercel** con la configuración de `vercel.json`:

```json
{
  "cleanUrls": true,
  "trailingSlash": false
}
```

Esto habilita URLs limpias sin `.html` (por ejemplo `/01-word/index-teoria`) y sin barra final.

> **Nota sobre `mecanografia/`**: sus recursos se referencian con rutas absolutas (`/mecanografia/css/app.css`, `/mecanografia/js/app.js`, `/imgs/img-favicon.png`) para que funcionen con `cleanUrls` y desde cualquier profundidad de ruta. Si el sitio se publica en un subdirectorio en lugar de la raíz del dominio, estas rutas deben ajustarse.

---

## 🗺️ Mapa del Repositorio

```text
vanilla-blog-ofimatica/
├── index.html                    Portada con las 10 tarjetas
├── main-style.css                Sistema de diseño global (1 165 líneas)
├── busqueda.js                   Búsqueda en vivo + toggle de tema
├── vercel.json                   cleanUrls / trailingSlash
├── imgs/                         7 banners PNG + 11 íconos SVG
├── 00-windows/ … 07-Access/      Ocho módulos con teoria/ · guias/ · practicas/ (+ evaluaciones en Word y PowerPoint)
├── instaladores-herramientas/    Catálogo 08 + instalador MecaSamType
├── mecanografia/                 App 09 (SPA + Supabase)
└── docs/                         Documentación técnica y comercial
```

Estado del inventario: **134 archivos HTML, 6 hojas de estilo y 21 archivos JavaScript**. El árbol comentado completo está en [`CONTEXTO_PROYECTO.md`](CONTEXTO_PROYECTO.md).

---

## 📚 Documentación del Proyecto

| Documento | Contenido | Última revisión |
| :--- | :--- | :--- |
| [`README.md`](README.md) | Este manual: características, requisitos, instalación y despliegue. | Octubre 2026 |
| [`CONTEXTO_PROYECTO.md`](CONTEXTO_PROYECTO.md) | Contexto de negocio, alcance, árbol de directorios comentado, glosario y stack. | Octubre 2026 |
| [`ARQUITECTURA_GLOBAL.md`](ARQUITECTURA_GLOBAL.md) | Patrón arquitectónico de los dos subsistemas, diagramas, pipelines y ADRs. | Octubre 2026 |
| [`ESQUEMA_BD.md`](ESQUEMA_BD.md) | Modelo de datos: `localStorage`, atributos del DOM y esquema `mecanografia` en Postgres. | Octubre 2026 |
| [`DESARROLLO.md`](DESARROLLO.md) | Guía operativa: comandos, solución de problemas y recetas de extensión. | Octubre 2026 |
| [`PROMPT_AGENTE.md`](PROMPT_AGENTE.md) | Master prompt autocontenido para replicar el proyecto con un agente de IA. | Octubre 2026 |
| [`SUPABASE_ESQUEMAS.md`](SUPABASE_ESQUEMAS.md) | Guía reutilizable de Supabase con esquemas, seguridad y batería de pruebas REST. | Octubre 2026 |
| [`PROPUESTA_COMERCIAL.md`](PROPUESTA_COMERCIAL.md) | Análisis de ROI, traducción técnica a beneficio y casos de uso. | Agosto 2026 |

> ⚠️ **Nota de coherencia**: `PROPUESTA_COMERCIAL.md` conserva a propósito las cifras de agosto de 2026 (7 módulos; «23 de teoría, 30 guías y 28 ejercicios»). El inventario vigente —10 tarjetas, 28 teoría, 34 guías y 36 prácticas— es el de este documento y el de [`CONTEXTO_PROYECTO.md`](CONTEXTO_PROYECTO.md). Ese archivo se actualizará cuando se revise la propuesta comercial.

---

## 📜 Licencia

&copy; 2026 **Instituto Nueva Tecnología** | Prof. Samuel Durán.
Todos los derechos reservados. Material educativo de uso institucional y público.
