# 🏗️ Arquitectura Global del Sistema — Vanilla Blog Ofimática

## 1. Patrón de Arquitectura

El proyecto es un **portal estático con dos subsistemas** que comparten dominio y diseño, pero no la misma estrategia de datos:

1. **Portal de contenido (módulos 00–08)**: Jamstack estático, cero dependencias de ejecución, contenido pre-renderizado en HTML y estado únicamente en el DOM y en `localStorage`.
2. **Aplicación de mecanografía (módulo 09)**: SPA con módulos ES, router por hash y persistencia en PostgreSQL a través de Supabase.

Esta separación es deliberada: el material didáctico debe funcionar aunque no haya red, base de datos ni credenciales; el entrenamiento de tecleo, en cambio, necesita registrar progreso por alumno y comparar marcas entre estudiantes.

### 📐 Principios de Diseño

1. **Contenido sin capa servidora.** El portal no tiene backend ni base de datos: el estado de la interfaz reside en el DOM y en `localStorage`.
2. **Independencia de transpiladores y bundlers.** No hay `npm install`, webpack, vite ni babel. El código escrito es el código que ejecuta el navegador.
3. **Optimización Anti-FOUC.** La configuración cromática se resuelve con un script bloqueante en el `<head>` antes del primer pintado.
4. **Presentación híbrida pantalla/impresión.** Las hojas de estilo incluyen `@media print` que convierten la interfaz en un documento carta con encabezado y pie institucionales.
5. **Degradación elegante del módulo 09.** Si faltan credenciales de Supabase, la aplicación arranca en modo demo y sigue siendo completamente utilizable.

> **Excepciones declaradas a la política cero-dependencias:**
> - `mecanografia/` importa `@supabase/supabase-js@2` desde jsDelivr mediante `import()` dinámico, solo cuando `IS_CONFIGURED` es `true`.
> - `01-word/validador-web/` carga **JSZip** y **fast-xml-parser** desde CDN. La herramienta está oculta en `01-word/index-practicas.html`.
> - Las tipografías se solicitan a Google Fonts en todas las páginas.

---

## 2. Diagrama de Arquitectura

```text
+--------------------------------------------------------------------------+
|                     VERCEL EDGE NETWORK · CDN GLOBAL                     |
+--------------------------------------------------------------------------+
|  · index.html · main-style.css · busqueda.js · imgs/svg/*                |
|  · 00-windows/ … 07-Access/ · instaladores-herramientas/                 |
|  · mecanografia/ · cleanUrls: true · trailingSlash: false                |
+--------------------------------------------------------------------------+
                                     |
                                      HTTP GET de activos estáticos
                                     v
+--------------------------------------------------------------------------+
|                        NAVEGADOR WEB DEL CLIENTE                         |
+--------------------------------------------------------------------------+
|   A · PORTAL 00..08             | B · MECANOGRAFÍA 09                    |
|   HTML5 + main-style.css        | SPA + módulos ES + css/app.css         |
|   IIFE Anti-FOUC en <head>      | Router hash: #/ · #/leccion/:id        |
|   busqueda.js (solo índices)    | #/sprint · #/ranking                   |
|   Estado: data-theme + theme    | Estado: token · demo · sonido          |
+--------------------------------------------------------------------------+
                                     |
                                      PostgREST (solo el subsistema B)
                                     v
+--------------------------------------------------------------------------+
|                     SUPABASE · esquema mecanografia                      |
+--------------------------------------------------------------------------+
|  · proyecto ehscdeiexsedaslxoezw                                         |
|  · 6 tablas · RLS activo sin políticas                                   |
|  · 13 funciones SECURITY DEFINER                                         |
|  · anon sin permisos de tabla: solo RPC con token                        |
+--------------------------------------------------------------------------+
```

---

## 3. Flujos y Pipelines Críticos

### 🔄 Pipeline 1: Ciclo de vida de carga y Anti-FOUC

```text
[Inicio de carga del documento]
             │
             ▼
[Script síncrono en <head>] ──> Lee localStorage.getItem("theme")
             │
             ├──> ¿"dark"  O  (sin valor Y prefers-color-scheme = dark)?
             │         │
             │         ├──> SÍ: asigna data-theme="dark" a <html> de inmediato.
             │         └──> NO: no toca data-theme (queda el tema Warm Paper por defecto).
             ▼
[Renderizado DOM/CSSOM] ──> El CSS aplica las variables [data-theme="dark"] antes del primer pintado.
             │
             ▼
[DOMContentLoaded] ──> busqueda.js (índices) o el script inline (contenido) sincroniza el ícono
                       del botón #theme-toggle: ☀ en oscuro, ☾ en claro.
```

Aplica a **133 de las 134 páginas**. La excepción es `mecanografia/index.html`, que no usa `main-style.css` ni el tema del portal: su interfaz es oscura de forma permanente.

### 🔍 Pipeline 2: Motor de búsqueda en vivo

1. **Captura de entrada**: el usuario escribe en `<input id="buscador-*">`.
2. **Selección del motor**: `busqueda.js` resuelve el campo en este orden: `buscador-clases` → `buscador-guias` → `buscador-practicas` → `buscador-evaluaciones` → `buscador-index`.
3. **Recolección O(N)**: al cargar la página se guarda `document.querySelectorAll(".item-list li")` — una sola consulta para todas las listas del documento.
4. **Normalización**: `buscador.value.toLowerCase().trim()`.
5. **Filtrado síncrono**: si `item.textContent.toLowerCase().indexOf(filtro) !== -1` se asigna `display = ""`; en caso contrario, `display = "none"`.

Sin índice invertido ni *debounce*: con las listas actuales (máximo 9 ítems por índice) el coste es despreciable y el comportamiento es instantáneo.

### 📝 Pipeline 3: Evaluación interactiva (módulos 01 y 02)

```text
[Formulario #registration-form] ──> nombre del alumno (#student-name)
             │
             ▼
[quiz-core.js] ──> shuffleArray() (Fisher-Yates) sobre las 10 preguntas
             │
             ▼
[#quiz-screen] ──> renderQuestion() + barra #progress-fill + botones #options-grid
             │        (10 preguntas, tipo "multiple" o "vf")
             ▼
[#result-screen] ──> puntaje /100 (#final-score) + feedback (#feedback-text)
             │
             ▼
[#quiz-summary] ──> una entrada por pregunta: acierto/error + `explicacion`
```

Todo el estado (`questions`, `userAnswers`, `studentName`) vive en memoria del documento. Recargar la página reinicia el test; no hay `localStorage` ni envío al servidor.

Word y PowerPoint usan el mismo motor con una copia por módulo: `01-word/evaluaciones/js/quiz-core.js` (tema azul `--color-word`) y `02-powerpoint/evaluaciones/js/quiz-core.js` (tema terracota `--color-ppt`). Así cada módulo conserva su paleta sin compartir dependencias entre carpetas.

### 🖨️ Pipeline 4: Impresión institucional

1. **Disparo**: `Ctrl + P` o menú del navegador.
2. **Copia del título**: un script inline (páginas de contenido) o `busqueda.js` (índices) copia el texto de `.lesson-header h1` / `.guide-header h1` a `.print-header-center`.
3. **Reglas `@media print`**:
   - Se ocultan `nav`, `footer`, `.buscador-index`, `.theme-btn`, `.modal`, `.links`, `.card-icon`, `.badge`, `.step-list` y `script`.
   - `.print-header` pasa a `display: flex` con tres columnas de 30 % / 40 % / 30 %.
   - `.print-footer` se fija al pie y añade `content: "Página " counter(page)`.
   - `@page { size: letter; margin: 1.5cm 2cm; }`.
4. **Marcado requerido**: las 98 páginas de contenido incluyen tanto `.print-header` (con `.print-header-left`, `.print-header-center` y `.print-header-right`) como `<div class="print-footer"></div>` al final del `<body>`.

### 🔐 Pipeline 5: Sesión y progreso de mecanografía

```text
[Registro]  register_student(username, display_name, password)
              ├─> valida formato ^[a-z0-9._-]{3,24}$ y contraseña ≥ 8 caracteres
              ├─> password_hash = crypt(password, gen_salt('bf', 10))
              └─> devuelve token de sesión

[Acceso]    login_student(username, password)
              ├─> si failed_attempts ≥ 5 y locked_until > now() → 53300 (bloqueo de 5 min)
              ├─> compara con bcrypt (hace trabajo de hash aunque el usuario no exista)
              └─> emite token y lo guarda en localStorage["mecasamtype.token.v1"]

[Petición]  callRpc(nombre, { p_token, ... })
              ├─> touch_session(p_token): valida, renueva expires_at +60 días y devuelve student_id
              └─> la función devuelve solo las filas de ese alumno

[Cierre]    logout_student(p_token) → borra la fila de `sessions` y el token local
```

El cliente nunca lee tablas: `anon` no tiene privilegios sobre ellas y RLS está activo sin políticas. La API expone 11 funciones a `anon`; `reset_password` queda reservada al SQL Editor.

### 🏁 Pipeline 6: Sprint competitivo

1. `openSprint()` solicita `get_random_sprint_text(p_token)`: un texto activo al azar de `sprint_texts`.
2. `engine.js` cronometra 60 segundos (`SPRINT_SECONDS`) sin detenerse al perder el foco.
3. Al terminar, `submit_sprint_run` valida los rangos (`wpm` ≤ 300, `accuracy` ≤ 100, `chars` ≤ 4000) y registra la marca.
4. `get_sprint_leaderboard` devuelve el Top 10 con nombre visible, WPM, precisión, caracteres y fecha.
5. Si la escritura falla, la interfaz ofrece `retry-sprint-save` sin perder el resultado.

---

## 4. Decisiones de Diseño (ADRs — Architecture Decision Records)

### 📄 ADR-001: Adopción de arquitectura Jamstack estática cero-dependencias

- **Estado**: Aprobado.
- **Contexto**: se necesitaba una plataforma educativa institucional sin servidores dedicados, sin costos recurrentes y mantenible sin conocimientos avanzados de operación.
- **Decisión**: eliminar frameworks (React, Vue, Angular) y bundlers. Construir el portal con HTML5 semántico, CSS3 y JavaScript nativo.
- **Consecuencias**:
  - **Positivas**: carga casi instantánea, superficie de ataque mínima, despliegue gratuito en Vercel y mantenimiento por edición directa de archivos.
  - **Negativas**: alta repetición de marcado (encabezado, migas, pie y scripts inline se replican en cada página).

---

### 🌙 ADR-002: Ejecución síncrona bloqueante en `<head>` para Anti-FOUC

- **Estado**: Aprobado.
- **Contexto**: aplicar el tema de forma asíncrona producía un destello blanco al navegar entre páginas en modo oscuro.
- **Decisión**: inyectar una IIFE minificada e inline en el `<head>` de cada documento, antes de la hoja de estilos externa.
- **Consecuencias**:
  - **Positivas**: el tema correcto se aplica antes del *First Contentful Paint*.
  - **Negativas**: bloqueo mínimo del parser (< 1 ms) y duplicación del snippet en 133 archivos.
  - **Excepción**: `mecanografia/index.html` no lo necesita porque su tema es fijo.

---

### 🖼️ ADR-003: Diagramación e iconografía 100 % SVG

- **Estado**: Aprobado.
- **Contexto**: las capturas PNG e íconos rasterizados pesaban más, se distorsionaban en pantallas de alta densidad y no respondían al cambio de tema.
- **Decisión**: usar SVG inline y archivos `imgs/svg/*.svg` con `stroke`/`fill` en `currentColor`, además de maquetas teóricas dibujadas en SVG.
- **Consecuencias**:
  - **Positivas**: nitidez a cualquier zoom, recoloreado automático y menos peticiones.
  - **Negativas**: la maquetación de coordenadas es más laboriosa que insertar una imagen.

---

### 🗄️ ADR-004: Supabase con esquema propio para el módulo 09

- **Estado**: Aprobado (octubre de 2026).
- **Contexto**: el progreso de mecanografía debía sobrevivir al cambio de equipo y permitir un ranking del grupo. El proyecto de Supabase ya alojaba otras aplicaciones cuyas tablas vivían en `public`.
- **Decisión**: crear el esquema `mecanografia` dentro del mismo proyecto, exponerlo en *Exposed schemas* y apuntar el cliente con `db: { schema: "mecanografia" }`.
- **Consecuencias**:
  - **Positivas**: aislamiento lógico sin gastar un proyecto nuevo; `public` queda intacto para las demás aplicaciones; el cambio en el cliente es de una línea.
  - **Negativas**: depende de un ajuste manual en el panel (si se olvida, todo responde `406 PGRST106`) y PostgREST no puede hacer *joins* entre esquemas.
  - **Detalle completo**: ver [`SUPABASE_ESQUEMAS.md`](SUPABASE_ESQUEMAS.md).

---

### 🧩 ADR-005: SPA con router por hash y módulos ES

- **Estado**: Aprobado.
- **Contexto**: la aplicación necesitaba cuatro vistas (dashboard, lección, sprint, ranking) sobre un alojamiento que solo sirve archivos estáticos.
- **Decisión**: una única página con enrutador propio sobre `location.hash`, sin History API ni framework, y separación del código en módulos ES (`app`, `api`, `engine`, `keyboard`, `ui`, `views`, `sprint-views`).
- **Consecuencias**:
  - **Positivas**: el enrutador funciona en cualquier servidor estático, incluso al recargar; los módulos delimitan responsabilidades y se cargan una sola vez.
  - **Negativas**: los módulos ES exigen HTTP (`file://` no sirve) y las rutas absolutas obligan a publicar desde la raíz del dominio.

---

### 👤 ADR-006: Cuentas propias en lugar de Supabase Auth

- **Estado**: Aprobado.
- **Contexto**: los alumnos no tienen correo institucional, y Supabase Auth está pensado para identidades con correo o proveedor externo.
- **Decisión**: gestionar altas y accesos con funciones `SECURITY DEFINER`: usuario + contraseña con bcrypt, tabla `sessions` y token UUID renovable.
- **Consecuencias**:
  - **Positivas**: alta en dos campos, sin dependencia de un proveedor de correo; el modelo se explica en una sola pantalla.
  - **Negativas**: no hay recuperación automática de contraseña (la restablece el docente con `reset_password`), el registro está abierto y el token vive en `localStorage`, por lo que un XSS podría robarlo.

---

### 📁 ADR-007: Rutas absolutas en la aplicación de mecanografía

- **Estado**: Aprobado (corrección posterior).
- **Contexto**: con `cleanUrls: true` y rutas relativas, recargar en `#/leccion/u1-l1` o servir desde un subdirectorio rompía la carga de CSS y JS.
- **Decisión**: referenciar `/mecanografia/css/app.css`, `/mecanografia/js/app.js` e `/imgs/img-favicon.png` desde la raíz del dominio.
- **Consecuencias**:
  - **Positivas**: funciona con URLs limpias y desde cualquier profundidad de ruta.
  - **Negativas**: el sitio debe publicarse en la raíz del dominio; mover el proyecto a un subdirectorio exige reescribir esas tres referencias. El resto del portal conserva rutas relativas.

---

## 5. Matriz de Responsabilidades

| Artefacto | Responsabilidad | Lo usan |
| :--- | :--- | :--- |
| `main-style.css` | Tokens de color, tipografía, tarjetas, tablas, cajas, modal y reglas de impresión del portal. | Todas las páginas 00–08 y el catálogo. |
| `busqueda.js` | Filtrado de listas y toggle de tema en páginas índice; copia del `<h1>` al encabezado de impresión. | Portada, 26 índices, catálogo y 6 tests. |
| Scripts inline | Toggle de tema, copia del título y modal de zoom en páginas de contenido. | 98 páginas de contenido. |
| `01-word/evaluaciones/js/quiz-core.js` | Motor de evaluación: orden aleatorio, progreso, nota y resumen. | 3 tests de Word. |
| `02-powerpoint/evaluaciones/js/quiz-core.js` | Motor de evaluación: orden aleatorio, progreso, nota y resumen. | 3 tests de PowerPoint. |
| `mecanografia/js/app.js` | Arranque, rutas, autenticación y acciones de la aplicación. | `mecanografia/index.html`. |
| `mecanografia/js/api.js` | Contrato de datos con dos adaptadores (Supabase y demo). | `app.js`, `views.js`, `sprint-views.js`. |
| `mecanografia/sql/setup.sql` | Esquema, tablas, RLS, permisos, funciones y textos iniciales. | Supabase (ejecución manual). |
| `vercel.json` | URLs limpias sin extensión ni barra final. | Despliegue. |

---

## 6. Riesgos Arquitectónicos y Mitigaciones

| Riesgo | Impacto | Mitigación actual |
| :--- | :--- | :--- |
| Editar el encabezado o el pie obliga a tocar 98 archivos | Alto coste de mantenimiento | Convención documentada en [`DESARROLLO.md`](DESARROLLO.md); el `@media print` centraliza el estilo. |
| Olvidar exponer el esquema `mecanografia` | La app no conecta (`PGRST106`) | El mensaje de error de la interfaz lo explica y se advierte en `mecanografia/README.md`. |
| Fuga de la `service_role` key | Compromiso total de la base | Solo se usa la `anon` key en `config.js`; `.env*` está en `.gitignore`. |
| Registro abierto en mecanografía | Cualquiera crea cuentas | Aceptado para uso en aula; se documenta el borrado de cuentas `prueba.*`. |
| Publicación en subdirectorio | Mecanografía pierde CSS/JS | Rutas absolutas documentadas como ADR-007. |
| Dependencia de Google Fonts y jsDelivr | Degradación tipográfica o del SDK sin red | El portal funciona con fuentes de respaldo del sistema; sin SDK, mecanografía cae en modo demo. |
