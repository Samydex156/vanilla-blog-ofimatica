# Contexto del Proyecto — Vanilla Blog Ofimática

## Arquitectura General del Proyecto

Sitio web **estático** (sin backend, sin base de datos, sin framework) que funciona como un **blog educativo** de contenido ofimático. La arquitectura sigue el modelo **cero-dependencias**: cada página es un archivo HTML independiente, los estilos globales se definen en una única hoja CSS, y la interactividad del lado del cliente se limita a scripts de búsqueda y modales de imágenes.

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
   (página principal)            (estilos globales)          (recursos visuales)
         |
         +---------+---------+---------+---------+---------+---------+
         |         |         |         |         |         |         |
   00-windows  01-word  02-powerpoint 03-excel  04-publisher 05-internet
   06-inteligencia-artificial
         |
         +----------+----------+----------+
         |          |          |          |
   index-Teoría  index-guias  index-practicas  busqueda.js
         |          |          |
    Teoría/     guias/     practicas/
    (contenido  (guias de  (ejercicios
     teórico)    atajos)    prácticos)
```

## Flujos o Pipelines Críticos

### 1. Ciclo de navegación del usuario

1. El usuario ingresa a `index.html` (página principal).
2. Visualiza 7 tarjetas con iconos y enlaces por módulo.
3. Selecciona un módulo (ej: "01 Word") y un tipo de contenido ("Teoría", "Guías" o "Prácticas").
4. La página índice carga una lista de enlaces con buscador en vivo.
5. Al hacer clic en un enlace, se carga la página de contenido individual.
6. En la página de contenido, el usuario puede:
   - Leer el texto formateado (serif para párrafos, sans-serif para títulos).
   - Hacer clic en una imagen para abrir el modal de zoom.
   - Descargar archivos de ejercicios adjuntos.

### 2. Flujo de búsqueda en vivo

1. El usuario escribe en el campo `<input id="buscador-*">` de una página índice.
2. `busqueda.js` escucha el evento `input` del campo.
3. Convierte el texto ingresado a minúsculas.
4. Itera sobre todos los `<li>` de la lista de ítems.
5. Si el texto del `<li>` coincide parcialmente, se muestra; si no, se oculta (`display: none`).

### 3. Flujo de modal de imagen

1. El usuario hace clic en una imagen con clase `shortcut-thumbnail`.
2. La función global `openModal(img)` se dispara.
3. El modal (div con `display: none`) cambia a `display: flex`.
4. La imagen ampliada se coloca dentro del modal.
5. El usuario hace clic en la `X` o en el fondo del modal para cerrarlo (`closeModal()`).

## Estructura de Directorios

```
vanilla-blog-ofimatica/
|
|-- index.html                        # [Entry Point] Página principal con grid de tarjetas a cada módulo
|-- main-style.css                    # [Estilos Globales] 702 líneas: variables CSS, reset, layout, cards, modales, responsive
|-- vercel.json                       # [Config] Despliegue en Vercel: cleanUrls + sin trailing slashes
|
|-- imgs/                             # [Assets] Iconos de módulos para la página principal
|   |-- img-excel.png
|   |-- img-favicon.png
|   |-- img-ia-internet.png
|   |-- img-powerpoint.png
|   |-- img-publisher.png
|   |-- img-windows.png
|   |-- img-word.png
|
|-- 00-windows/                       # [Módulo 1] Sistema Operativo Windows
|   |-- busqueda.js                   #   Búsqueda en vivo (selector .item-list-win li)
|   |-- index-teoria.html             #   Índice de Teoría teóricas
|   |-- index-guias.html              #   Índice de guías prácticas
|   |-- index-practicas.html          #   Índice de ejercicios
|   |-- Teoría/                       #   Contenido teórico sobre Windows
|   |   |-- conceptos-basicos.html
|   |   |-- gestion-carpetas.html
|   |-- guias/                        #   Guías paso a paso
|   |   |-- guia-uso-mouse.html
|   |   |-- guia-gestion-carpetas.html
|   |-- practicas/                    #   Ejercicios prácticos
|       |-- practica-carpetas.html
|       |-- practica-gestion-carpetas.html
|
|-- 01-word/                          # [Módulo 2] Microsoft Word
|   |-- busqueda.js                   #   Búsqueda en vivo (selector .item-list-doc li)
|   |-- index-teoria.html
|   |-- index-guias.html
|   |-- index-practicas.html
|   |-- lista/                        #   Planificación de contenido futuro
|   |   |-- lista-guias.txt
|   |-- Teoría/                       #   5 Teoría (introducción, documentos formales, etc.)
|   |-- guias/                        #   11 guías (atajos, formatos, estilos, smartart, etc.)
|   |-- practicas/                    #   6 prácticas (formato base, carta, recetario, etc.)
|       |-- ejercicios/               #   Archivos descargables .docx, .xlsx, .jpg
|       |-- imgs-practicas/           #   Imágenes de referencia
|
|-- 02-powerpoint/                    # [Módulo 3] Microsoft PowerPoint
|   |-- busqueda.js                   #   Búsqueda en vivo (selector .item-list-ppt li)
|   |-- teoria/clases.css             #   Estilos específicos: grids de color, timeline, charts
|   |-- guias/guias.css               #   Estilos para tablas de atajos y <kbd>
|   |-- practicas/practicas.css       #   Estilos para maquetas de diapositivas y soluciones
|   |-- index-teoria.html             #   6 Teoría (teoría del color, storytelling, datos, etc.)
|   |-- index-guias.html              #   6 guías (atajos, zoomit, audio, video, etc.)
|   |-- index-practicas.html          #   7 prácticas (presentación base, multimedia, etc.)
|
|-- 03-excel/                         # [Módulo 4] Microsoft Excel
|   |-- busqueda.js                   #   Búsqueda en vivo (selector .item-list-xls li)
|   |-- Teoría/                       #   4 Teoría (introducción, formato celdas, fórmulas, beneficio)
|   |-- guias/                        #   1 guía (atajos esenciales)
|   |-- practicas/                    #   5 prácticas (planilla notas, datos, funciones base, etc.)
|       |-- ejercicios/               #   Archivos descargables .xlsx, .docx, .pdf
|
|-- 04-publisher/                     # [Módulo 5] Microsoft Publisher
|   |-- index-teoria.html             #   1 clase (introducción)
|   |-- index-guias.html              #   1 guía (conceptos básicos)
|   |-- index-practicas.html          #   1 práctica (tarjeta)
|
|-- 05-internet/                      # [Módulo 6] Internet y Recursos Web
|   |-- busqueda.js                   #   Búsqueda en vivo (selector .item-list-net li)
|   |-- Teoría/                       #   3 Teoría (Pixabay: imágenes, música, videos)
|   |-- guias/                        #   3 guías de uso de Pixabay
|   |-- practicas/                    #   3 prácticas sobre Pixabay
|
|-- 06-inteligencia-artificial/       # [Módulo 7] Inteligencia Artificial
|   |-- busqueda.js                   #   Búsqueda en vivo (selector .item-list-ia li)
|   |-- Teoría/                       #   2 Teoría (Gemini texto, Nanobanana imágenes)
|   |-- guias/                        #   2 guías de herramientas AI
|   |-- practicas/                    #   3 prácticas (Gemini, diapositivas, Nanobanana)
|       |-- archivos/                 #   Documentos de apoyo descargables
```

### Convenciones de código

| Elemento | Convención |
|----------|-----------|
| **HTML** | `<!doctype html>`, UTF-8, viewport meta, sin frameworks |
| **CSS** | Metodología de Teoría planas (`.module-section-*`, `.item-list-*`), variantes de color por módulo, 1 breakpoint responsive (768px) |
| **JS** | Vanilla ES5/ES6, sin módulos ni imports, funciones globales para modales |
| **Navegación** | Breadcrumbs estáticos en cada página (Home > Módulo > Sección) |
| **Imágenes** | PNG para capturas de interfaz, `max-width: 100%`, bordes sutiles |
| **Archivos descargables** | Enlaces directos a `.docx`, `.xlsx`, `.pdf` |
