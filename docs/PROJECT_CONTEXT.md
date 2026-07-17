# Contexto del Proyecto — Vanilla Blog Ofimática

## Arquitectura General del Proyecto

Sitio web **estático** (sin backend, sin base de datos, sin framework) que funciona como un **blog educativo** de contenido ofimático. La arquitectura sigue el modelo **cero-dependencias**: cada página es un archivo HTML independiente, los estilos globales se definen en una única hoja CSS, y la interactividad del lado del cliente se limita a scripts de búsqueda, toggle de modo oscuro y modales de imágenes.

No existe capa de servidor, enrutamiento dinámico ni lógica en backend. El despliegue se realiza sobre **Vercel**, que sirve los archivos estáticos con URLs limpias.

## Diagrama de Arquitectura

```
                          +---------------------------+
                          |     Navegador Web         |
                          |  (Chrome / Firefox / etc) |
                          +------------+--------------+
                                       |
                          HTTP GET (archivo .html)
                                       |
                          v v v v v v v v v v v
                    +-------------------------------+
                    |         Vercel CDN             |
                    |   cleanUrls: true              |
                    |   trailingSlash: false          |
                    +-------------------------------+
                                       |
                    +-------------------------------+
                    |    Sistema de Archivos         |
                    |   (repositorio estático)       |
                    +-------------------------------+
                                       |
         +-----------------------------+-----------------------------+
         |                             |                             |
   index.html                    main-style.css              imgs/*.png
   busqueda.js                   (variables, print,         (recursos
   (búsqueda + toggle             dark mode)                 visuales)
    modo oscuro)
         |
         +---------+---------+---------+---------+---------+---------+
         |         |         |         |         |         |         |
   00-windows  01-word  02-powerpoint 03-excel  04-publisher 05-internet
   06-inteligencia-artificial
         |
         +----------+----------+----------+
         |          |          |          |
   index-teoria  index-guias  index-practicas
         |          |          |
    teoria/     guias/     practicas/
    (contenido  (guias de  (ejercicios
     teórico)    atajos)    prácticos)
```

## Flujos o Pipelines Críticos

### 1. Ciclo de navegación del usuario

1. El usuario ingresa a `index.html` (página principal).
2. Visualiza 7 tarjetas con badge de color, icono y 3 botones (Teoría, Guías, Prácticas).
3. El modo oscuro se aplica automáticamente según la preferencia del sistema; puede cambiarse manualmente con el botón ☀/☾.
4. Selecciona un módulo y un tipo de contenido.
5. La página índice carga una lista de enlaces con buscador en vivo.
6. Al hacer clic en un enlace, se carga la página de contenido individual.
7. Desde la página de contenido se puede imprimir (Ctrl+P) con encabezado de 3 columnas, pie con número de página y formato carta.

### 2. Flujo de modo oscuro

1. Al cargar cualquier página, `busqueda.js` verifica `localStorage.getItem("theme")`.
2. Si hay valor guardado, aplica `data-theme="dark"` o `data-theme="light"` en el `<body>`.
3. Si no hay valor guardado, usa `prefers-color-scheme: dark` del sistema.
4. El botón toggle en el header alterna entre modos y persiste en `localStorage`.
5. Las páginas de contenido heredan el `data-theme` del body automáticamente.

### 3. Flujo de impresión

1. El usuario presiona Ctrl+P en cualquier página de contenido.
2. `@media print` activa: se ocultan nav, footer, buscador, modal, botones.
3. El `print-header` (oculto en pantalla) se muestra con 3 columnas: profesor | título del recurso | institución + módulo + año.
4. El `print-footer` muestra el número de página actual.
5. Formato tamaño carta, márgenes 1.5cm/2cm, fuente 11pt, sin sombras ni colores de fondo.

### 4. Flujo de búsqueda en vivo

1. El usuario escribe en el campo `<input id="buscador-*">` de una página índice.
2. `busqueda.js` (unificado en la raíz) escucha el evento `input`.
3. Convierte el texto ingresado a minúsculas.
4. Itera sobre todos los `<li>` de la lista con clase `.item-list`.
5. Si el texto del `<li>` coincide parcialmente, se muestra; si no, se oculta (`display: none`).

### 5. Flujo de modal de imagen

1. El usuario hace clic en una imagen con clase `shortcut-thumbnail`.
2. La función global `openModal(img)` se dispara.
3. El modal (div con `display: none`) cambia a `display: flex`.
4. La imagen ampliada se coloca dentro del modal.
5. El usuario hace clic en la `X` o en el fondo del modal para cerrarlo (`closeModal()`).

## Estructura de Directorios

```
vanilla-blog-ofimatica/
|
|-- index.html                        # [Entry Point] Página principal con grid de tarjetas, header con toggle dark mode
|-- main-style.css                    # [Estilos Globales] ~700 líneas: variables, layout, cards, dark mode, @media print, responsive
|-- busqueda.js                       # [JS Unificado] Búsqueda en vivo + toggle de modo oscuro con persistencia localStorage
|-- vercel.json                       # [Config] Despliegue en Vercel: cleanUrls + sin trailing slashes
|
|-- imgs/                             # [Assets] Iconos PNG de módulos para la página principal
|   |-- img-excel.png
|   |-- img-favicon.png
|   |-- img-ia-internet.png
|   |-- img-powerpoint.png
|   |-- img-publisher.png
|   |-- img-windows.png
|   |-- img-word.png
|
|-- 00-windows/                       # [Módulo 1] Sistema Operativo Windows
|   |-- index-teoria.html             #   Índice de teoría
|   |-- index-guias.html              #   Índice de guías
|   |-- index-practicas.html          #   Índice de prácticas
|   |-- teoria/                       #   Contenido teórico
|   |   |-- conceptos-basicos.html
|   |   |-- gestion-carpetas.html
|   |-- guias/                        #   Guías paso a paso
|   |   |-- guia-uso-mouse.html
|   |   |-- guia-gestion-carpetas.html
|   |   |-- atajos-esenciales.html    #   [NUEVA] Guía de atajos de teclado Windows 10
|   |-- practicas/                    #   Ejercicios prácticos
|       |-- practica-carpetas.html
|       |-- practica-gestion-carpetas.html
|
|-- 01-word/                          # [Módulo 2] Microsoft Word (5 teoría, 11 guías, 6 prácticas)
|   |-- index-teoria.html
|   |-- index-guias.html
|   |-- index-practicas.html
|   |-- teoria/
|   |-- guias/
|   |-- practicas/
|       |-- ejercicios/               #   Archivos descargables .docx, .xlsx, .jpg
|
|-- 02-powerpoint/                    # [Módulo 3] Microsoft PowerPoint (6 teoría, 6 guías, 7 prácticas)
|   |-- teoria/clases.css             #   Estilos específicos de teoría PPT
|   |-- guias/guias.css               #   Estilos para tablas de atajos
|   |-- practicas/practicas.css       #   Estilos para maquetas de diapositivas
|
|-- 03-excel/                         # [Módulo 4] Microsoft Excel (4 teoría, 1 guía, 5 prácticas)
|-- 04-publisher/                     # [Módulo 5] Microsoft Publisher (1 teoría, 1 guía, 1 práctica)
|-- 05-internet/                      # [Módulo 6] Internet y Pixabay (3 teoría, 3 guías, 3 prácticas)
|-- 06-inteligencia-artificial/       # [Módulo 7] IA (2 teoría, 2 guías, 3 prácticas)
|
|-- docs/                             # Documentación del proyecto
    |-- README.md
    |-- PROJECT_CONTEXT.md
    |-- DEVELOPMENT.md
    |-- PROPUESTA_COMERCIAL.md
    |-- MASTER_PROMPT_AGENT.md
```

## Convenciones de código

| Elemento | Convención |
|----------|-----------|
| **HTML** | `<!doctype html>`, UTF-8, viewport meta, sin frameworks. Breadcrumbs estáticos. |
| **CSS** | Variables CSS, clases planas, colores por módulo vía `data-module`. Dark mode con `[data-theme="dark"]`. Print con `@media print`. |
| **JS** | Un solo archivo `busqueda.js` en raíz. Vanilla ES5. Funciones globales para modales. |
| **Rutas** | Las carpetas de contenido se nombran `teoria/`, `guias/`, `practicas/`. |
| **Imágenes** | PNG para capturas, `max-width: 100%`, bordes sutiles. En dark mode se invierten con filter. |
| **Archivos descargables** | Enlaces directos a `.docx`, `.xlsx`, `.pdf`. |
