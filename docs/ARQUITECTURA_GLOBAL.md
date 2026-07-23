# 🏗️ Arquitectura Global del Sistema — Vanilla Blog Ofimática

## 1. Patrón de Arquitectura

El proyecto adopta un patrón de **Arquitectura Jamstack Estática Cero-Dependencias (Vanilla Jamstack & Offline-First Client Architecture)**. Este enfoque desacopla completamente el contenido del servidor de aplicaciones, entregando únicamente activos estáticos (HTML5, CSS3, JavaScript ES5 e ilustraciones SVG) a través de una red CDN global.

### 📐 Principios de Diseño
1. **Ausencia de Capa Servidora Activa (Serverless & DB-less)**: La aplicación carece de backend dinámico o base de datos relacional. El estado de la aplicación reside en el documento DOM y la memoria del navegador.
2. **Independencia Total de Transpiladores y Bundlers**: No existen procesos de compilación (npm, webpack, vite, babel). El código fuente escrito es exactamente el código ejecutado por el navegador del cliente.
3. **Optimización Anti-FOUC (Flash of Unstyled Content)**: La inicialización de la configuración cromática se realiza de manera síncrona mediante un script bloqueante en la cabecera `<head>`, garantizando estabilidad visual.
4. **Presentación Híbrida Pantalla/Impresión**: Las hojas de estilo integran reglas semánticas `@media print` para transformar la interfaz web en documentos físicos formateados profesionalmente.

---

## 2. Diagrama de Arquitectura (ASCII Art)

```text
+---------------------------------------------------------------------------------------------------+
|                                     NAVEGADOR WEB DEL CLIENTE                                     |
|                                                                                                   |
|  +---------------------------------------------------------------------------------------------+  |
|  |                                  DOCUMENTO HTML (DOM TREE)                                  |  |
|  |  +---------------------------+  +--------------------------+  +--------------------------+  |  |
|  |  | <head> (Script Síncrono)  |  | <header> (#theme-toggle) |  | <main> (.item-list / h1) |  |  |
|  |  +-------------+-------------+  +------------+-------------+  +------------+-------------+  |  |
|  +----------------|----------------------------|-------------------------------|---------------+  |
|                   |                            |                               |                  |
|                   v                            v                               v                  |
|  +---------------------------------------------------------------------------------------------+  |
|  |                                   MOTOR JAVASCRIPT (busqueda.js)                             |  |
|  |  - Inicializa Theme State       - Búsqueda Filtro en Vivo       - Copia h1 a Print Header    |  |
|  |  - Listener Escape (Modal)      - Event Handlers                - Direct DOM Mutation          |  |
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
                                   Petición HTTP GET (Archivos Estáticos)        |
                                                                                 v
+---------------------------------------------------------------------------------------------------+
|                                 VERCEL EDGE NETWORK (CDN GLOBAL)                                  |
|                                                                                                   |
|  +---------------------------------------------------------------------------------------------+  |
|  |                               ESTRUCTURA DE ARCHIVOS ESTÁTICOS                              |  |
|  |  index.html        main-style.css        busqueda.js        imgs/svg/*.svg        vercel.json  |  |
|  |  00-windows/*      01-word/*             02-powerpoint/*    03-excel/*            ...otros     |  |
|  +---------------------------------------------------------------------------------------------+  |
+---------------------------------------------------------------------------------------------------+
```

---

## 3. Flujos y Pipelines Críticos

### 🔄 Pipeline 1: Ciclo de Vida de Carga y Anti-FOUC (Script de Head)

```text
[Inicio Carga Documento] 
         │
         ▼
[Script Síncrono en <head>] ──> Lee localStorage.getItem("theme")
         │
         ├─► ¿Tiene valor "dark" O (Sin valor AND prefers-color-scheme es dark)?
         │        │
         │        ├─► SÍ: Asigna data-theme="dark" a <html> de inmediato.
         │        └─► NO: No modifica data-theme (se aplica tema default Warm Paper).
         ▼
[Renderizado DOM/CSSOM] ──> El CSS aplica variables [data-theme="dark"] antes del primer pintura.
         │
         ▼
[Evento DOMContentLoaded] ──> busqueda.js sincroniza el botón #theme-toggle (☀ o ☾).
```

### 🔍 Pipeline 2: Motor de Búsqueda en Vivo en Listas de Módulo

1. **Captura de Input**: El usuario escribe un término en el campo `<input id="buscador-*">`.
2. **Evaluación de Evento**: Escuchador de evento `input` en `busqueda.js` se dispara.
3. **Normalización de Texto**: Se obtiene `buscador.value.toLowerCase().trim()`.
4. **Recorrido de Elementos**: Iteración síncrona sobre los elementos `<li>` pertenecientes a la lista `.item-list`.
5. **Filtrado por Coincidencia**:
   - Si `item.textContent.toLowerCase().indexOf(filtro) !== -1`: Se establece `item.style.display = ""`.
   - Caso contrario: Se asigna `item.style.display = "none"`.

### 🎨 Pipeline 3: Renderizado e Interacción con Diagramas Vectoriales SVG

```text
[Definición SVG en HTML] ──> Código inline o <img src="imgs/svg/*.svg">
         │
         ▼
[Inyección de Estilos CSS] ──> Propiedades stroke="currentColor" y fill="currentColor"
         │
         ▼
[Evaluación de Tema Ambient]
         ├─► En Tema Claro (Warm Paper): stroke responde a --text-color (#1A1A1A)
         └─► En Tema Oscuro (Obsidian): stroke responde a --text-color (#E6E6E6)
```

### 🖨️ Pipeline 4: Sistema de Impresión Adaptativa Institucional

1. **Disparo de Impresión**: El usuario presiona `Ctrl + P` o activa la impresión desde el navegador.
2. **Ejecución de Copia de Título**: `busqueda.js` localiza el elemento `<h1>` (`.lesson-header h1, .guide-header h1, header h1`) y transfiere su texto a `.print-header-center`.
3. **Evaluación de Rules `@media print`**:
   - Elementos globales como `<nav>`, `<button>`, `.modal`, `.buscador-index` cambian a `display: none !important`.
   - El bloque `.print-header` (oculto en pantalla) se fuerza a `display: grid !important` (3 columnas: Profesor | Título Dinámico | Institución).
   - Se activa la regla `@page { size: letter; margin: 1.5cm 2cm; }`.
   - `.print-footer` calcula la numeración mediante la función CSS `counter(page)`.

---

## 4. Decisiones de Diseño (ADRs - Architecture Decision Records)

### 📄 ADR-001: Adopción de Arquitectura Jamstack Estática Cero-Dependencias
- **Estado**: Aprobado.
- **Contexto**: Se necesitaba construir una plataforma educativa institucional que no dependiera de infraestructura de servidores dedicada, sin costos recurrentes de hosting y utilizable sin conocimientos avanzados de mantenimiento de software.
- **Decisión**: Eliminar el uso de frameworks (React, Vue, Angular) y bundlers (Webpack, Vite). Construir el proyecto utilizando exclusivamente HTML5 semántico, CSS3 y JavaScript ES5 estático.
- **Consecuencias**:
  - **Positivas**: Carga ultra-rápida (puntuación Lighthouse 100/100), cero riesgo de vulnerabilidades backend, despliegue gratuito en Vercel.
  - **Negativas**: Mayor repetitividad en código HTML para componentes de navegación (resuelto mediante estructuras limpias de plantillas).

---

### 🌙 ADR-002: Ejecución Síncrona Bloqueante en `<head>` para Anti-FOUC
- **Estado**: Aprobado.
- **Contexto**: El cambio entre el modo claro (*Warm Paper*) y oscuro (*Obsidian Terminal*) mediante JavaScript asíncrono producía un parpadeo visual blanco (*FOUC*) al navegar entre páginas en pantallas nocturnas.
- **Decisión**: Inyectar una función autoejecutable (IIFE) minificada e in-line dentro de la etiqueta `<head>` de cada archivo HTML, antes de cargar la hoja de estilos externa `main-style.css`.
- **Consecuencias**:
  - **Positivas**: Eliminación total del parpadeo visual. El tema correcto se aplica antes del primer renderizado de pantalla (*First Contentful Paint*).
  - **Negativas**: Bloqueo mínimo del parsing del `<head>` (< 1ms).

---

### 🖼️ ADR-003: Diagramación e Iconografía 100% SVG Vectorial
- **Estado**: Aprobado.
- **Contexto**: Las capturas de pantalla PNG e íconos rasterizados tradicionales aumentaban el peso del sitio, se distorsionaban en pantallas de alta densidad (Retina/4K) y no se adaptaban cromáticamente al modo oscuro.
- **Decisión**: Reemplazar todos los íconos de módulos y maquetas teóricas (ventanas de software, esquemas de color) por código y archivos SVG vectoriales limpios.
- **Consecuencias**:
  - **Positivas**: Reducción masiva del peso del repositorio, nitidez absoluta en cualquier nivel de zoom, modificación dinámica de colores mediante reglas CSS.
  - **Negativas**: Requiere maquetación cuidadosa de coordenadas e instrucciones XML en gráficos complejos.
