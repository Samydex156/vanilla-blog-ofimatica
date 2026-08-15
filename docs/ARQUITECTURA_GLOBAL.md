# ðŸ—ï¸ Arquitectura Global del Sistema â€” Vanilla Blog OfimÃ¡tica

## 1. PatrÃ³n de Arquitectura

El proyecto adopta un patrÃ³n de **Arquitectura Jamstack EstÃ¡tica Cero-Dependencias (Vanilla Jamstack & Offline-First Client Architecture)**. Este enfoque desacopla completamente el contenido del servidor de aplicaciones, entregando Ãºnicamente activos estÃ¡ticos (HTML5, CSS3, JavaScript nativo sin frameworks e ilustraciones SVG) a travÃ©s de una red CDN global.

### ðŸ“ Principios de DiseÃ±o
1. **Ausencia de Capa Servidora Activa (Serverless & DB-less)**: La aplicaciÃ³n carece de backend dinÃ¡mico o base de datos relacional. El estado de la aplicaciÃ³n reside en el documento DOM y la memoria del navegador.
2. **Independencia Total de Transpiladores y Bundlers**: No existen procesos de compilaciÃ³n (npm, webpack, vite, babel). El cÃ³digo fuente escrito es exactamente el cÃ³digo ejecutado por el navegador del cliente.
3. **OptimizaciÃ³n Anti-FOUC (Flash of Unstyled Content)**: La inicializaciÃ³n de la configuraciÃ³n cromÃ¡tica se realiza de manera sÃ­ncrona mediante un script bloqueante en la cabecera `<head>`, garantizando estabilidad visual.
4. **PresentaciÃ³n HÃ­brida Pantalla/ImpresiÃ³n**: Las hojas de estilo integran reglas semÃ¡nticas `@media print` para transformar la interfaz web en documentos fÃ­sicos formateados profesionalmente.

> **Excepciones declaradas**: La herramienta `01-word/validador-web/` es un mÃ³dulo aislado que carga librerÃ­as externas (JSZip y fast-xml-parser) desde CDN y no sigue las reglas Anti-FOUC ni de cero-dependencias del sitio principal.

---

## 2. Diagrama de Arquitectura (ASCII Art)

```text
+---------------------------------------------------------------------------------------------------+
|                                     NAVEGADOR WEB DEL CLIENTE                                     |
|                                                                                                   |
|  +---------------------------------------------------------------------------------------------+  |
|  |                                  DOCUMENTO HTML (DOM TREE)                                  |  |
|  |  +---------------------------+  +--------------------------+  +--------------------------+  |  |
|  |  | <head> (Script SÃ­ncrono)  |  | <header> (#theme-toggle) |  | <main> (.item-list / h1) |  |  |
|  |  +-------------+-------------+  +------------+-------------+  +------------+-------------+  |  |
|  +----------------|----------------------------|-------------------------------|---------------+  |
|                   |                            |                               |                  |
|                   v                            v                               v                  |
|  +---------------------------------------------------------------------------------------------+  |
|  | MOTOR JAVASCRIPT DUAL: busqueda.js (índices) / scripts inline (contenido)                   |  |
|  | - Índices: toggle de tema, sync de ícono y búsqueda en vivo                                 |  |
|  | - Contenido: copia h1 a .print-header-center; modal #imageModal                             |  |
|  +----------------|------------------------------------------------------------|---------------+  |
|                   |                                                            |                  |
|                   v                                                            v                  |
|  +-------------------------------+                             +-------------------------------+  |
|  |     WEB STORAGE (localStorage) |                             |     MOTOR CSS (CSSOM ENGINE)  |  |
|  |  - Key: "theme"                |                             |  - Tokens Warm Paper / Dark   |  |
|  |  - Values: "dark" | "light"    |                             |  - Layout Grid / Flexbox      |  |
|  +-------------------------------+                             |  - @media print Rules         |  |
|                                                                +---------------+---------------+  |
+--------------------------------------------------------------------------------|------------------+
                                                                                 |
                                   PeticiÃ³n HTTP GET (Archivos EstÃ¡ticos)        |
                                                                                 v
+---------------------------------------------------------------------------------------------------+
|                                 VERCEL EDGE NETWORK (CDN GLOBAL)                                  |
|                                                                                                   |
|  +---------------------------------------------------------------------------------------------+  |
|  |                               ESTRUCTURA DE ARCHIVOS ESTÃTICOS                              |  |
|  |  index.html        main-style.css        busqueda.js        imgs/svg/*.svg        vercel.json  |  |
|  |  00-windows/*      01-word/*             02-powerpoint/*    03-excel/*            ...otros     |  |
|  +---------------------------------------------------------------------------------------------+  |
+---------------------------------------------------------------------------------------------------+
```

---

## 3. Flujos y Pipelines CrÃ­ticos

### ðŸ”„ Pipeline 1: Ciclo de Vida de Carga y Anti-FOUC (Script de Head)

```text
[Inicio Carga Documento] 
         â”‚
         â–¼
[Script SÃ­ncrono en <head>] â”€â”€> Lee localStorage.getItem("theme")
         â”‚
         â”œâ”€â–º Â¿Tiene valor "dark" O (Sin valor AND prefers-color-scheme es dark)?
         â”‚        â”‚
         â”‚        â”œâ”€â–º SÃ: Asigna data-theme="dark" a <html> de inmediato.
         â”‚        â””â”€â–º NO: No modifica data-theme (se aplica tema default Warm Paper).
         â–¼
[Renderizado DOM/CSSOM] â”€â”€> El CSS aplica variables [data-theme="dark"] antes del primer pintura.
         â”‚
         â–¼
[Evento DOMContentLoaded] â”€â”€> `busqueda.js` (Ã­ndices) o el script inline (contenido) sincroniza el botÃ³n #theme-toggle (â˜€ o â˜¾).
```

### ðŸ” Pipeline 2: Motor de BÃºsqueda en Vivo en Listas de MÃ³dulo

1. **Captura de Input**: El usuario escribe un tÃ©rmino en el campo `<input id="buscador-*">`.
2. **EvaluaciÃ³n de Evento**: Escuchador de evento `input` en `busqueda.js` se dispara.
3. **NormalizaciÃ³n de Texto**: Se obtiene `buscador.value.toLowerCase().trim()`.
4. **Recorrido de Elementos**: IteraciÃ³n sÃ­ncrona sobre los elementos `<li>` pertenecientes a la lista `.item-list`.
5. **Filtrado por Coincidencia**:
   - Si `item.textContent.toLowerCase().indexOf(filtro) !== -1`: Se establece `item.style.display = ""`.
   - Caso contrario: Se asigna `item.style.display = "none"`.

### ðŸŽ¨ Pipeline 3: Renderizado e InteracciÃ³n con Diagramas Vectoriales SVG

```text
[DefiniciÃ³n SVG en HTML] â”€â”€> CÃ³digo inline o <img src="imgs/svg/*.svg">
         â”‚
         â–¼
[InyecciÃ³n de Estilos CSS] â”€â”€> Propiedades stroke="currentColor" y fill="currentColor"
         â”‚
         â–¼
[EvaluaciÃ³n de Tema Ambient]
         â”œâ”€â–º En Tema Claro (Warm Paper): stroke responde a --text-color (#1A1A1A)
         â””â”€â–º En Tema Oscuro (Obsidian): stroke responde a --text-color (#E6E6E6)
```

### ðŸ–¨ï¸ Pipeline 4: Sistema de ImpresiÃ³n Adaptativa Institucional

1. **Disparo de ImpresiÃ³n**: El usuario presiona `Ctrl + P` o activa la impresiÃ³n desde el navegador.
2. **EjecuciÃ³n de Copia de TÃ­tulo**: Un script inline (pÃ¡ginas de contenido) o `busqueda.js` (Ã­ndices) localiza el elemento `<h1>` (`.lesson-header h1, .guide-header h1`) y transfiere su texto a `.print-header-center`.
3. **EvaluaciÃ³n de Rules `@media print`**:
   - Elementos globales como `nav`, `footer`, `.buscador-index`, `.modal`, `.links`, `.card-icon`, `.badge`, `.step-list` y `script` cambian a `display: none !important`. **Nota**: el botÃ³n `.theme-btn` solo se oculta cuando vive dentro de `<nav>` (no se oculta `button` genÃ©ricamente).
   - El bloque `.print-header` (oculto en pantalla) se fuerza a `display: flex !important` (3 columnas 30% | 40% | 30%: Profesor | TÃ­tulo DinÃ¡mico | InstituciÃ³n).
   - Se activa la regla `@page { size: letter; margin: 1.5cm 2cm; }`.
   - Existen reglas CSS para `.print-footer` con `counter(page)`, pero **ningÃºn HTML incluye ese elemento**, por lo que la numeraciÃ³n de pÃ¡ginas no se renderiza actualmente (feature pendiente).

---

## 4. Decisiones de DiseÃ±o (ADRs - Architecture Decision Records)

### ðŸ“„ ADR-001: AdopciÃ³n de Arquitectura Jamstack EstÃ¡tica Cero-Dependencias
- **Estado**: Aprobado.
- **Contexto**: Se necesitaba construir una plataforma educativa institucional que no dependiera de infraestructura de servidores dedicada, sin costos recurrentes de hosting y utilizable sin conocimientos avanzados de mantenimiento de software.
- **DecisiÃ³n**: Eliminar el uso de frameworks (React, Vue, Angular) y bundlers (Webpack, Vite). Construir el proyecto utilizando exclusivamente HTML5 semÃ¡ntico, CSS3 y JavaScript estÃ¡tico (ES5 en `busqueda.js`; las pÃ¡ginas de contenido usan scripts inline con sintaxis moderna ES2020).
- **Consecuencias**:
  - **Positivas**: Carga ultra-rÃ¡pida (puntuaciÃ³n Lighthouse 100/100), cero riesgo de vulnerabilidades backend, despliegue gratuito en Vercel.
  - **Negativas**: Mayor repetitividad en cÃ³digo HTML para componentes de navegaciÃ³n (resuelto mediante estructuras limpias de plantillas).

---

### ðŸŒ™ ADR-002: EjecuciÃ³n SÃ­ncrona Bloqueante en `<head>` para Anti-FOUC
- **Estado**: Aprobado.
- **Contexto**: El cambio entre el modo claro (*Warm Paper*) y oscuro (*Obsidian Terminal*) mediante JavaScript asÃ­ncrono producÃ­a un parpadeo visual blanco (*FOUC*) al navegar entre pÃ¡ginas en pantallas nocturnas.
- **DecisiÃ³n**: Inyectar una funciÃ³n autoejecutable (IIFE) minificada e in-line dentro de la etiqueta `<head>` de cada archivo HTML, antes de cargar la hoja de estilos externa `main-style.css`.
- **Consecuencias**:
  - **Positivas**: EliminaciÃ³n total del parpadeo visual. El tema correcto se aplica antes del primer renderizado de pantalla (*First Contentful Paint*).
  - **Negativas**: Bloqueo mÃ­nimo del parsing del `<head>` (< 1ms).
  - **ExcepciÃ³n conocida**: `01-word/validador-web/index.html` (herramienta independiente) no incluye la IIFE, por lo que sufre FOUC al cargar en modo oscuro.

---

### ðŸ–¼ï¸ ADR-003: DiagramaciÃ³n e IconografÃ­a 100% SVG Vectorial
- **Estado**: Aprobado.
- **Contexto**: Las capturas de pantalla PNG e Ã­conos rasterizados tradicionales aumentaban el peso del sitio, se distorsionaban en pantallas de alta densidad (Retina/4K) y no se adaptaban cromÃ¡ticamente al modo oscuro.
- **DecisiÃ³n**: Reemplazar todos los Ã­conos de mÃ³dulos y maquetas teÃ³ricas (ventanas de software, esquemas de color) por cÃ³digo y archivos SVG vectoriales limpios.
- **Consecuencias**:
  - **Positivas**: ReducciÃ³n masiva del peso del repositorio, nitidez absoluta en cualquier nivel de zoom, modificaciÃ³n dinÃ¡mica de colores mediante reglas CSS.
  - **Negativas**: Requiere maquetaciÃ³n cuidadosa de coordenadas e instrucciones XML en grÃ¡ficos complejos.
