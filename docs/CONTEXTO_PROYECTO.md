# 🏢 Contexto del Proyecto — Vanilla Blog Ofimática

## 1. Propósito del Negocio y Alcance

El **Portal Educativo de Ofimática** es una plataforma web estática desarrollada para el **Instituto Nueva Tecnología**, bajo la dirección docente del **Prof. Samuel Durán**. Su objetivo principal es resolver la fragmentación del material pedagógico y la falta de estandarización en la enseñanza de herramientas de ofimática y productividad digital.

### 🎯 Problema de Negocio Atendido

- 📄 **Dispersión de contenidos**: anteriormente los estudiantes dependían de archivos PDF aislados, guías impresas en papel y enlaces externos inconsistentes.
- ⏳ **Pérdida de tiempo en soporte**: exceso de consultas repetitivas sobre procedimientos básicos de configuración en aplicaciones Office.
- 🖨️ **Costos de impresión impredecibles**: falta de un formato estandarizado que permitiera imprimir guías de clase de forma limpia y legible sin desperdiciar papel ni tinta.
- 🌐 **Incompatibilidad de dispositivos**: dificultades para consultar el material pedagógico desde teléfonos móviles o tabletas durante sesiones de estudio nocturno.
- 🧮 **Progreso invisible en mecanografía**: el entrenamiento de tecleo se hacía en un programa de escritorio sin registro centralizado, de modo que el docente no podía saber quién practicaba ni cuánto mejoraba.

### 🛡️ Alcance y Límites del Sistema

**Dentro del alcance:**

- Presentación interactiva de **10 tarjetas** en la portada: ocho módulos temáticos (00 Windows, 01 Word, 02 PowerPoint, 03 Excel, 04 Publisher, 05 Internet, 06 Inteligencia Artificial, 07 Access), un catálogo de herramientas (08 Programas y Herramientas) y una aplicación independiente (09 Mecanografía).
- Índices dinámicos de clases teóricas, guías metodológicas y ejercicios prácticos, más un índice de evaluaciones exclusivo de Word.
- Motor de búsqueda síncrono client-side en todas las listas (`.item-list`) mediante cinco identificadores de entrada.
- Sistema de temas visuales (Claro / Oscuro) con persistencia en `localStorage` y ejecución Anti-FOUC.
- Enlaces de descarga directa de archivos base (`.docx`, `.xlsx`, `.pptx`, `.pdf`, `.exe`).
- Maquetación especial de impresión con encabezado institucional de tres columnas y pie con numeración de página.
- Evaluaciones estáticas de Word (`01-word/evaluaciones/`): 3 tests de 10 preguntas con nota sobre 100 y resumen con explicaciones para retroalimentación en clase. Estado en memoria, sin backend.
- **MecaSamType Web** (`mecanografia/`): entrenador de mecanografía con cuentas propias, progreso privado por alumno, sprint competitivo y ranking, persistido en el esquema `mecanografia` de Supabase.
- **Modo demo** de la aplicación de mecanografía, que funciona sin credenciales y guarda en `localStorage`.

**Fuera del alcance:**

- Autenticación de usuarios para el portal: los módulos 00–08 se consultan sin registro.
- Calificación en línea de tareas o ejercicios: los archivos se descargan y se entregan por canales institucionales externos.
- Panel de administración docente: el progreso de mecanografía se consulta desde el *Table Editor* o el *SQL Editor* de Supabase.
- Envío de correo electrónico, recuperación de contraseña por correo o verificación de identidad real (las cuentas de mecanografía no tienen correo).
- Aplicación móvil nativa, notificaciones push o integración con un LMS institucional.

---

## 📂 Estructura de Directorios

Árbol del repositorio con la responsabilidad técnica de cada carpeta. Los conteos corresponden al estado de octubre de 2026.

```text
vanilla-blog-ofimatica/
│
├── index.html                        # [Portada] Cuadrícula de 10 tarjetas, badges SVG y toggle de tema.
├── main-style.css                    # [Estilos globales] 1 165 líneas: tokens Warm Paper / Obsidian, tarjetas,
│                                     #   tablas, cajas, diagramas SVG, modal y bloque @media print.
├── busqueda.js                       # [Lógica client-side] Búsqueda en vivo multi-lista + toggle de tema.
│                                     #   Se carga en 30 páginas índice (no en páginas de contenido).
├── vercel.json                       # [Despliegue] cleanUrls: true, trailingSlash: false.
├── .gitignore                        # Ignora node_modules, .vercel, .env*, supabase/.temp, *.log, *.bak.
│
├── imgs/                             # [Recursos visuales del portal]
│   ├── img-favicon.png               # Favicon de la pestaña.
│   ├── img-windows.png               # Banner del módulo Windows.
│   ├── img-word.png                  # Banner del módulo Word.
│   ├── img-powerpoint.png            # Banner del módulo PowerPoint.
│   ├── img-excel.png                 # Banner del módulo Excel.
│   ├── img-publisher.png             # Banner del módulo Publisher.
│   ├── img-ia-internet.png           # Banner compartido de IA e Internet.
│   └── svg/                          # [11 íconos vectoriales] icon-{windows,word,powerpoint,excel,
│                                     #   publisher,internet,ia,access,herramientas,mecanografia,home}.svg
│
├── 00-windows/                       # [Módulo 00] Sistema operativo Windows — 2 teoría · 3 guías · 2 prácticas
│   ├── index-teoria.html             # Índice teórico con buscador-clases.
│   ├── index-guias.html              # Índice de guías con buscador-guias.
│   ├── index-practicas.html          # Índice de prácticas con buscador-practicas.
│   ├── teoria/
│   │   ├── conceptos-basicos.html    # Clase 01: computadora, hardware, software y escritorio.
│   │   └── gestion-carpetas.html     # Clase 02: jerarquía de carpetas, nombres y papelera.
│   ├── guias/
│   │   ├── atajos-esenciales.html    # Tabla de atajos de teclado de Windows 10/11.
│   │   ├── guia-gestion-carpetas.html# Creación y organización de estructuras de carpetas.
│   │   └── guia-uso-mouse.html       # Operaciones fundamentales del ratón.
│   └── practicas/
│       ├── practica-carpetas.html    # Práctica 01: escritorio y creación de carpetas.
│       └── practica-gestion-carpetas.html # Práctica 02: limpieza, nombres y atajos.
│
├── 01-word/                          # [Módulo 01] Microsoft Word — 5 teoría · 11 guías · 8 prácticas · 3 tests
│   ├── index-teoria.html             # Índice teórico (buscador-clases).
│   ├── index-guias.html              # Índice de guías (buscador-guias). Enlaza 7 de las 11 existentes.
│   ├── index-practicas.html          # Índice de prácticas 01-08 + sección Validador oculta (hidden).
│   ├── index-evaluaciones.html       # Índice de evaluaciones (buscador-evaluaciones).
│   ├── evaluaciones/                 # [Evaluaciones interactivas]
│   │   ├── test-fundamentos-word.html# Test 01: interfaz, documentos y archivos (10 preguntas).
│   │   ├── test-formato-texto.html   # Test 02: fuente, estilos, alineación, interlineado (10 preguntas).
│   │   ├── test-documentos-apa.html  # Test 03: documentos formales y APA 7.ª ed. (10 preguntas).
│   │   └── js/quiz-core.js           # Motor: shuffle, progreso, nota /100 y resumen con explicaciones.
│   ├── teoria/                       # 5 clases + word-clases-imgs/ (6 infografías)
│   ├── guias/                        # 11 guías + word-guias-imgs/ (18 capturas)
│   │   ├── alineaciones-de-texto.html
│   │   ├── atajos-esenciales.html    # Incluye modal #imageModal.
│   │   ├── como-corregir-errores.html
│   │   ├── copiar-cortar-pegar.html  # Sin enlace desde el índice.
│   │   ├── espaciado-interlineado.html # Sin enlace desde el índice.
│   │   ├── estilos-de-texto.html
│   │   ├── fuente-y-tamano.html
│   │   ├── mayusculas-minusculas.html
│   │   ├── saltos.html               # Sin enlace desde el índice.
│   │   ├── smartart-jerarquia.html
│   │   ├── vinetas-y-numeracion.html # Enlazada solo en un bloque comentado.
│   │   └── atajos-word-imgs/         # Carpeta vacía (reservada).
│   ├── practicas/                    # 8 prácticas
│   │   ├── practica-01-formato-base.html
│   │   ├── practica-02-modelo-carta.html
│   │   ├── practica-03-articulo-periodistico-clase.html
│   │   ├── practica-04-conminatoria-tarea.html
│   │   ├── practica-05-recetario-nutricion.html
│   │   ├── practica-06-registro-personal.html
│   │   ├── practica-07-informe-evaluacion.html
│   │   ├── practica-08-monografia-china-apa.html # Monografía APA: Times 12, doble espacio, sangría 1.27 cm.
│   │   ├── ejercicios/               # 19 archivos: plantillas .docx, soluciones .jpg y guías de resolución.
│   │   └── imgs-practicas/           # 8 previsualizaciones de soluciones.
│   ├── lista/lista-guias.txt         # Borrador de temas de guías pendientes.
│   └── validador-web/                # [Herramienta aislada] Word-eSports: validador de .docx en el navegador.
│       ├── index.html                # Interfaz propia; no usa busqueda.js.
│       ├── css/styles.css
│       └── js/                       # core.js, app.js y validador-caso-{01,02,05,06,07,08}.js.
│                                     #   Depende de JSZip y fast-xml-parser por CDN.
│
├── 02-powerpoint/                    # [Módulo 02] PowerPoint — 6 teoría · 9 guías · 7 prácticas
│   ├── index-teoria.html · index-guias.html · index-practicas.html
│   ├── teoria/                       # 6 clases + clases.css + ppt-clases-imgs/ (vacía)
│   ├── guias/                        # 9 guías + guias.css + ppt-guias-imgs/ (vacía)
│   ├── practicas/                    # 7 prácticas + practicas.css
│   └── archivos/                     # 2 .pptx, 2 .pdf de apoyo y skill-pptxgenjs-decks-portable.md.
│
├── 03-excel/                         # [Módulo 03] Excel — 4 teoría · 1 guía · 5 prácticas
│   ├── index-teoria.html · index-guias.html · index-practicas.html
│   ├── teoria/                       # 4 clases fechadas + excel-imgs/ + excel-calculo-beneficio/
│   ├── guias/atajos-esenciales.html  # Atajos de navegación (modal #imageModal) + atajos-excel-imgs/ (15 capturas).
│   └── practicas/                    # 5 prácticas + ejercicios/ (14 archivos .xlsx, .docx y .pdf).
│
├── 04-publisher/                     # [Módulo 04] Publisher — 1 teoría · 1 guía · 1 práctica
│   ├── index-teoria.html · index-guias.html · index-practicas.html
│   ├── teoria/2026-02-07-introduccion.html
│   ├── guias/conceptos-basicos.html
│   └── practicas/practica-01-tarjeta.html
│
├── 05-internet/                      # [Módulo 05] Internet — 6 teoría · 5 guías · 5 prácticas
│   ├── index-teoria.html · index-guias.html · index-practicas.html
│   ├── teoria/                       # Navegadores, uBlock Origin, Pixabay (imagen, música, video) y Photopea.
│   ├── guias/                        # 3 guías de Pixabay + 2 de Photopea + img-guias/guia-pixabay/ (8 capturas).
│   └── practicas/                    # pixabay, musica-pixabay, videos-pixabay, photopea-basica, photopea-montaje.
│
├── 06-inteligencia-artificial/       # [Módulo 06] IA — 3 teoría · 3 guías · 7 prácticas
│   ├── index-teoria.html · index-guias.html · index-practicas.html
│   ├── teoria/                       # gemini-texto, nanobanana-imagenes, opencode-introduccion.
│   ├── guias/                        # guia-gemini-texto, guia-nanobanana-imagenes, guia-opencode-instalacion-windows.
│   └── practicas/                    # 3 de Gemini/Nano Banana + 4 guiadas con OpenCode
│       └── archivos/                 # System Prompt Generar Diapositivas.docx
│
├── 07-Access/                        # [Módulo 07] Access — 1 teoría · 1 guía · 1 práctica
│   ├── index-teoria.html · index-guias.html · index-practicas.html
│   ├── teoria/2026-03-01-introduccion-access.html  # Base de datos, entorno y objetos de Access.
│   ├── guias/crear-tabla.html        # Vista Diseño, tipos de datos y clave principal.
│   └── practicas/
│       ├── practica-01-base-clientes.html # Migración Excel → Access con bdTienda y bdFarmacia.
│       ├── archivos/                 # bdTienda-v1.xlsx y bdFarmacia-v1.xlsx (orígenes de datos).
│       └── ejercicios/               # README.txt con las convenciones de descarga (.accdb/.xlsx/.pdf).
│
├── instaladores-herramientas/        # [Módulo 08] Catálogo de software
│   ├── index.html                    # Catálogo: Cavalry (enlaces oficiales) y MecaSamType.
│   └── MecaSamType_Installer.exe     # Instalador de escritorio (11,4 MB).
│
├── mecanografia/                     # [Módulo 09] MecaSamType Web — SPA con Supabase
│   ├── index.html                    # Pantallas de acceso y de aplicación; rutas absolutas a CSS/JS.
│   ├── css/app.css                   # Sistema visual propio (fondo #06090e, teal #32e6c4, Space Grotesk).
│   ├── js/
│   │   ├── app.js                    # Arranque, router por hash, autenticación y acciones.
│   │   ├── api.js                    # Adaptadores Supabase y demo; carga el SDK por import dinámico.
│   │   ├── config.js                 # URL, anon key, esquema y constantes (SPRINT_SECONDS = 60).
│   │   ├── engine.js                 # Motor de tecleo: WPM, precisión, pausa y Backspace.
│   │   ├── keyboard.js               # Teclado virtual español ES por dedos.
│   │   ├── ui.js                     # Utilidades, avatares y ranking.
│   │   ├── views.js                  # Dashboard, lección y resultado.
│   │   ├── sprint-views.js           # Sprint y ranking.
│   │   └── data/
│   │       ├── lessons.js            # 17 lecciones en 5 unidades.
│   │       └── sprint-texts.js       # 12 textos locales de respaldo.
│   ├── sql/setup.sql                 # Esquema `mecanografia`: 6 tablas, 13 funciones y 12 textos.
│   └── README.md                     # Puesta en marcha, seguridad y uso docente.
│
├── docs/                             # [Documentación técnica y comercial]
│   ├── README.md                     # Manual principal e inventario documental.
│   ├── CONTEXTO_PROYECTO.md          # Este documento: negocio, alcance y árbol comentado.
│   ├── ARQUITECTURA_GLOBAL.md        # Patrones, diagramas de los dos subsistemas y ADRs.
│   ├── ESQUEMA_BD.md                 # localStorage, atributos del DOM y esquema Postgres.
│   ├── DESARROLLO.md                 # Guía operativa, troubleshooting y recetas.
│   ├── PROMPT_AGENTE.md              # Master prompt autocontenido para replicar con IA.
│   ├── SUPABASE_ESQUEMAS.md          # Guía reutilizable de Supabase con esquemas.
│   └── PROPUESTA_COMERCIAL.md        # Análisis de ROI y propuesta de valor.
│
└── .commandcode/                     # [Configuración de agentes del editor] Permisos y preferencias.
```

---

## 📖 Glosario de Dominio

- **Anti-FOUC (*Flash of Unstyled Content*)**: técnica de optimización que ejecuta un script bloqueante e inline en el `<head>` antes del renderizado inicial para aplicar el tema de color desde el primer frame.
- **Warm Paper**: paleta del modo claro, con tonos crema marfil (`#F7F6F3`) y tipografía serif, que imita la textura del papel editorial.
- **Obsidian Terminal**: paleta del modo oscuro inspirada en consolas (`#121212`), con contrastes atenuados para reducir el cansancio visual.
- **Jamstack Estático**: enfoque basado en HTML desacoplado, servido desde una CDN sin servidores de aplicación dinámicos.
- **Iconografía SVG nativa**: uso de gráficos vectoriales cuyas propiedades cromáticas se controlan con `currentColor` y variables CSS, sin peticiones adicionales.
- **Print-Header-Center**: columna central del encabezado de impresión que recibe por JavaScript el texto del `<h1>` de la lección.
- **Print-Footer**: pie fijo de impresión que imprime `Página N` mediante `counter(page)`; está presente en las 98 páginas de contenido.
- **Data Attribute (`data-module` / `data-theme`)**: atributo HTML5 que habilita reglas CSS por módulo o tema sin ensuciar los nombres de clase.
- **SPA con router por hash**: aplicación de una sola página que cambia de vista leyendo `location.hash` (`#/`, `#/leccion/:id`, `#/sprint`, `#/ranking`) sin recargar el documento.
- **Esquema de Postgres**: contenedor de objetos dentro de una base; aquí `mecanografia` aísla las tablas del módulo 09 del resto del proyecto de Supabase.
- **`SECURITY DEFINER`**: función que se ejecuta con los privilegios de quien la creó; permite cerrar las tablas a `anon` y exponer solo las RPC controladas.
- **RLS (*Row Level Security*)**: política de filas de Postgres. Las tablas del módulo la tienen activa **y sin políticas**, de modo que solo las funciones `SECURITY DEFINER` pueden leerlas.
- **Token de sesión**: UUID de 122 bits emitido por `login_student`, guardado en `localStorage` bajo `mecasamtype.token.v1` y renovado a 60 días en cada uso.
- **bcrypt**: función de derivación de claves usada por `pgcrypto` (`gen_salt('bf', 10)`) para no almacenar contraseñas en texto plano.
- **Modo demo**: adaptador de `api.js` que sustituye a Supabase cuando no hay credenciales, con datos en `localStorage` bajo `mecasamtype.demo.v2`.

---

## 🛠️ Stack Tecnológico Detallado

| Capa / Componente | Tecnología | Versión / Estándar | Razón de Selección |
| :--- | :--- | :--- | :--- |
| **Estructura web** | HTML5 semántico | W3C | Accesibilidad nativa, SEO y compatibilidad sin compilación. |
| **Diseño y estilos** | CSS3 Vanilla | Grid / Flexbox / Custom Properties | Control fino de tokens, rendimiento GPU y `@media print`. |
| **Lógica client-side del portal** | JavaScript Vanilla | ES5 en `busqueda.js`; ES2020 en scripts inline | Compatibilidad amplia en el motor de búsqueda; sintaxis moderna en las páginas de contenido. |
| **Motor de evaluaciones** | JS Vanilla sin CDN | `01-word/evaluaciones/js/quiz-core.js` | 3 tests de 10 preguntas con estado en memoria; sin backend ni persistencia. |
| **Aplicación de mecanografía** | JavaScript ES Modules | `type="module"` | Organización por responsabilidades (motor, teclado, vistas, API) sin bundler. |
| **Persistencia del módulo 09** | PostgreSQL + PostgREST (Supabase) | Esquema `mecanografia` | Progreso compartido entre dispositivos y ranking del grupo sin servidor propio. |
| **Seguridad del módulo 09** | pgcrypto + RPC `SECURITY DEFINER` + RLS | bcrypt coste 10, tokens de 60 días | Las tablas quedan cerradas a `anon`; la API expone únicamente funciones validadas. |
| **SDK de datos** | `@supabase/supabase-js@2` vía jsDelivr | Import dinámico ESM | Se descarga solo cuando hay credenciales; el modo demo no toca la red. |
| **Tipografía** | Google Fonts API | Source Serif 4, Inter, JetBrains Mono (portal); Space Grotesk (mecanografía) | Elegancia editorial en títulos, legibilidad sans en cuerpos y monoespaciada para código. |
| **Iconografía** | SVG nativos | XML/SVG 1.1 | Cero latencia extra, nitidez en Retina/4K y adaptación al modo oscuro. |
| **Persistencia de preferencias** | Web Storage API | `localStorage` | Key-value local, síncrono y sin cookies. |
| **Distribución** | Vercel Static Hosting | CDN global | URLs limpias, caché de borde y cero costo de infraestructura. |

---

## 📊 Inventario de Contenidos

| Métrica | Valor |
| :--- | :--- |
| Tarjetas en la portada | 10 |
| Módulos con estructura `teoria/` · `guias/` · `practicas/` | 8 |
| Páginas de teoría | 28 |
| Páginas de guía | 34 (30 enlazadas desde índices) |
| Páginas de práctica | 36 |
| Evaluaciones interactivas | 3 (30 preguntas en total) |
| Páginas de contenido | 98 |
| Índices de módulo | 25 (8 módulos × 3 + `index-evaluaciones.html`) |
| Archivos HTML totales | 130 |
| Hojas de estilo | 6 |
| Archivos JavaScript | 20 |
| Descargables (`.docx`, `.xlsx`, `.pptx`, `.pdf`, `.exe`) | 34 (18 `.docx`, 9 `.xlsx`, 4 `.pdf`, 2 `.pptx`, 1 `.exe`) |
| Lecciones de mecanografía | 17 en 5 unidades |

---

## ⚠️ Estado Conocido y Deuda Técnica

Observaciones del inventario que **no** implican un fallo funcional, pero conviene tener presentes:

1. **Cuatro guías de Word sin enlace en el índice.** `copiar-cortar-pegar.html`, `espaciado-interlineado.html` y `saltos.html` no se referencian desde ningún punto del sitio; `vinetas-y-numeracion.html` solo aparece dentro de un bloque comentado en `01-word/index-guias.html`. El contenido existe y es accesible por URL directa.
2. **La tarjeta 09 no tiene color de módulo.** No existe `--color-meca` ni reglas `.card[data-module="meca"]` en `main-style.css`, a diferencia de las otras nueve tarjetas, que sí llevan borde superior y badge con su color. La tarjeta se renderiza con el estilo base.
3. **Validador de Word oculto.** La sección está marcada con `hidden` y `style="display:none"` en `01-word/index-practicas.html`; sigue cargando JSZip y fast-xml-parser desde CDN al abrir la página.
4. **Carpetas vacías.** `01-word/guias/atajos-word-imgs/`, `02-powerpoint/guias/ppt-guias-imgs/` y `02-powerpoint/teoria/ppt-clases-imgs/` están reservadas pero sin contenido.
5. **Duplicación de imágenes de solución.** Las capturas `Caso_*_Solucion_page-*.jpg` existen en `practicas/ejercicios/` y en `practicas/imgs-practicas/`.
6. **Registro abierto en mecanografía.** Cualquiera con la URL puede crear cuenta; no hay verificación docente.
7. **La `anon public key` está en el repositorio** (`mecanografia/js/config.js`). Es pública por diseño; la seguridad depende de las RPC y de que la `service_role` nunca se exponga.
