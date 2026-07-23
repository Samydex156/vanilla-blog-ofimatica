# 🏢 Contexto del Proyecto — Vanilla Blog Ofimática

## 1. Propósito del Negocio y Alcance

El **Portal Educativo de Ofimática** es una plataforma web estática desarrollada para el **Instituto Nueva Tecnología**, bajo la dirección docente del **Prof. Samuel Durán**. Su objetivo principal es resolver la fragmentación del material pedagógico y la falta de estandarización en la enseñanza de herramientas de ofimática y productividad digital.

### 🎯 Problema de Negocio Atendido
- 📄 **Dispersión de Contenidos**: Anteriormente, los estudiantes dependían de archivos PDF aislados, guías impresas en papel y enlaces externos inconsistentes.
- ⏳ **Pérdida de Tiempo en Soporte**: Exceso de consultas repetitivas sobre procedimientos básicos de configuración en aplicaciones Office.
- 🖨️ **Costos de Impresión Impredecibles**: Falta de un formato estandarizado que permitiera imprimir guías de clase de forma limpia y legible sin desperdiciar papel ni tinta.
- 🌐 **Incompatibilidad de Dispositivos**: Dificultades para consultar el material pedagógico desde teléfonos móviles o tabletas durante sesiones de estudio nocturno.

### 🛡️ Alcance y Límites del Sistema
- **Dentro del Alcance**:
  - Presentación interactiva de 7 módulos temáticos (Windows, Word, PowerPoint, Excel, Publisher, Internet e Inteligencia Artificial).
  - Índices dinámicos de clases teóricas, guías metodológicas y ejercicios prácticos.
  - Motor de búsqueda síncrono client-side en tiempo real para todas las listas.
  - Sistema de temas visuales (Claro / Oscuro) con persistencia y ejecución Anti-FOUC.
  - Enlaces de descarga directa de archivos base (`.docx`, `.xlsx`, `.pdf`).
  - Maquetación especial de impresión con encabezado y pie de página institucionales.
- **Fuera del Alcance**:
  - Autenticación de usuarios o gestión de sesiones.
  - Base de datos relacional o persistencia en servidor backend.
  - Envío o calificación en línea de tareas/ejercicios (los archivos se descargan y se entregan por canales institucionales externos).

---

## 📂 Estructura de Directorios

Árbol jerárquico exhaustivo del repositorio con la responsabilidad técnica detallada de cada archivo y carpeta:

```text
vanilla-blog-ofimatica/
│
├── index.html                        # [Entry Point] Portal principal con cuadrícula de tarjetas de módulos, badges SVG y toggle de tema.
├── main-style.css                    # [Estilos Globales] Tokens Warm Paper & Obsidian Terminal, reset compactado (25%), tipografía Serif, diagramas SVG y @media print.
├── busqueda.js                       # [Lógica Client-Side] Búsqueda en vivo multi-lista, toggle e inicialización de tema oscuro, sync de print-header y modal listener.
├── vercel.json                       # [Configuración CDN] Parámetros de despliegue en Vercel (cleanUrls y trailingSlash).
│
├── imgs/                             # [Recursos Visuales] Íconos vectoriales SVG e ilustraciones estáticas del sistema.
│   ├── img-favicon.png               # Ícono de pestaña del navegador (Favicon).
│   ├── img-excel.png                 # Banner/imagen de presentación para el módulo Excel.
│   ├── img-ia-internet.png           # Banner ilustrativo para Inteligencia Artificial e Internet.
│   ├── img-powerpoint.png            # Banner de presentación para PowerPoint.
│   ├── img-publisher.png             # Banner de presentación para Publisher.
│   ├── img-windows.png               # Banner ilustrativo para Windows.
│   ├── img-word.png                  # Banner ilustrativo para Word.
│   └── svg/                          # [Íconos Vectoriales SVG Nativo]
│       ├── icon-excel.svg            # Ícono vectorial del módulo Excel.
│       ├── icon-home.svg             # Ícono de miga de pan (Breadcrumb Home).
│       ├── icon-ia.svg               # Ícono vectorial del módulo Inteligencia Artificial.
│       ├── icon-internet.svg         # Ícono vectorial del módulo Internet.
│       ├── icon-powerpoint.svg       # Ícono vectorial del módulo PowerPoint.
│       ├── icon-publisher.svg        # Ícono vectorial del módulo Publisher.
│       ├── icon-windows.svg          # Ícono vectorial del módulo Windows.
│       └── icon-word.svg             # Ícono vectorial del módulo Word.
│
├── 00-windows/                       # [Módulo 00] Sistema Operativo Windows
│   ├── index-teoria.html             # Índice de clases teóricas de Windows con buscador.
│   ├── index-guias.html              # Índice de guías metodológicas de Windows.
│   ├── index-practicas.html          # Índice de actividades prácticas de Windows.
│   ├── teoria/                       # [Lecciones Teóricas]
│   │   ├── conceptos-basicos.html    # Lección: Hardware, Software y Escritorio de Windows.
│   │   └── gestion-carpetas.html     # Lección: Estructura jerárquica de archivos y directorios.
│   ├── guias/                        # [Guías de Procedimiento]
│   │   ├── atajos-esenciales.html    # Guía: Tabla de atajos de teclado Windows 10/11.
│   │   ├── guia-gestion-carpetas.html# Guía paso a paso de creación de estructuras.
│   │   └── guia-uso-mouse.html       # Guía de operaciones fundamentales del ratón.
│   └── practicas/                    # [Ejercicios Prácticos]
│       ├── practica-carpetas.html    # Práctica: Creación de árbol de carpetas institucional.
│       └── practica-gestion-carpetas.html # Práctica avanzada de organización de archivos.
│
├── 01-word/                          # [Módulo 01] Microsoft Word
│   ├── index-teoria.html             # Índice teórico del módulo Word.
│   ├── index-guias.html              # Índice de guías paso a paso del módulo Word.
│   ├── index-practicas.html          # Índice de ejercicios prácticos del módulo Word.
│   ├── teoria/                       # [5 Clases Teóricas]
│   │   ├── anatomia-documento-formal.html # Estructura y márgenes de documentos institucionales.
│   │   ├── espacio-en-blanco.html    # Principios de composición y legibilidad.
│   │   ├── formatos-de-papel.html    # Dimensiones estándar (Carta, A4, Oficio).
│   │   ├── formatos-docx-vs-pdf.html # Diferencias operativas y casos de uso.
│   │   └── introduccion-word.html   # Interfaz de cinta de opciones y entorno.
│   ├── guias/                        # [11 Guías Metodológicas]
│   │   ├── alineaciones-de-texto.html# Configuración de alineación y justificación.
│   │   ├── atajos-esenciales.html    # Atajos de teclado en Microsoft Word.
│   │   ├── como-corregir-errores.html# Ortografía, gramática y diccionario.
│   │   ├── copiar-cortar-pegar.html  # Portapapeles y pegado especial.
│   │   ├── espaciado-interlineado.html# Párrafo, interlineado y sangrías.
│   │   ├── estilos-de-texto.html     # Aplicación de estilos de título y jerarquía.
│   │   ├── fuente-y-tamano.html      # Tipografía y atributos de texto.
│   │   ├── mayusculas-minusculas.html# Cambio de caja y capitalización.
│   │   ├── saltos.html               # Saltos de página y de sección.
│   │   ├── smartart-jerarquia.html   # Gráficos SmartArt y organigramas.
│   │   └── vinetas-y-numeracion.html # Listas multinivel y viñetas custom.
│   └── practicas/                    # [7 Prácticas y Ejercicios]
│       ├── practica-01-formato-base.html
│       ├── practica-02-modelo-carta.html
│       ├── practica-03-articulo-periodistico-clase.html
│       ├── practica-04-conminatoria-tarea.html
│       ├── practica-05-recetario-nutricion.html
│       ├── practica-06-registro-personal.html
│       ├── practica-07-informe-evaluacion.html
│       └── ejercicios/               # [Recursos Descargables] Plantillas .docx, .xlsx e imágenes base.
│
├── 02-powerpoint/                    # [Módulo 02] Microsoft PowerPoint
│   ├── index-teoria.html             # Índice teórico de presentaciones efectivas.
│   ├── index-guias.html              # Índice de guías teatrales, multimedia y de diseño.
│   ├── index-practicas.html          # Índice de prácticas de diapositivas.
│   ├── teoria/                       # [6 Clases Teóricas]
│   │   ├── diseno-maquetacion-tipografia.html # Regla 60-30-10 y jerarquía tipográfica.
│   │   ├── el-arte-de-exponer.html   # Técnicas de oratoria y apoyo visual.
│   │   ├── introduccion-powerpoint.html # Interfaz y vistas de la aplicación.
│   │   ├── storytelling.html         # Narrativa visual aplicada a datos.
│   │   ├── teoria-del-color.html     # Paletas cromáticas y contraste accesible.
│   │   └── visualizacion-de-datos.html# Transformación de datos en gráficos claros.
│   ├── guias/                        # [9 Guías Metodológicas]
│   │   ├── album-de-fotografias.html
│   │   ├── atajos-esenciales.html
│   │   ├── exportar-a-video.html
│   │   ├── insertar-audio-fondo.html
│   │   ├── insertar-cuadro-de-texto.html # Guía interactiva SVG de cajas de texto.
│   │   ├── insertar-formas.html          # Guía interactiva SVG de formas vectoriales.
│   │   ├── insertar-imagenes.html        # Guía interactiva SVG de inserción y marco de imágenes.
│   │   ├── transiciones-y-animaciones.html
│   │   └── uso-de-zoomit.html
│   └── practicas/                    # [7 Ejercicios Prácticos]
│       ├── practica-01-presentacion-base.html
│       ├── practica-02-multimedia-animacion.html
│       ├── practica-03-hipervinculos-interaccion.html
│       ├── practica-04-storytelling-datos.html
│       ├── practica-05-storytelling-casa.html
│       ├── practica-06-storytelling-coca-cola.html
│       └── practica-06-storytelling-coca-cola-solucion.html
│
├── 03-excel/                         # [Módulo 03] Microsoft Excel
│   ├── index-teoria.html             # Índice de hojas de cálculo y fórmulas.
│   ├── index-guias.html              # Índice de guías de procedimientos Excel.
│   ├── index-practicas.html          # Índice de ejercicios de planillas.
│   ├── teoria/                       # [4 Clases Teóricas]
│   │   ├── 2026-01-17-introduccion.html       # Filas, columnas, celdas y referencias.
│   │   ├── 2026-01-24-formato-celdas.html     # Tipos de datos y formato numérico.
│   │   ├── 2026-01-31-operaciones-formulas.html # Sintaxis de fórmulas y operadores.
│   │   └── 2026-02-07-calculo-beneficio.html  # Fórmulas de aplicación financiera.
│   ├── guias/                        # [1 Guía]
│   │   └── atajos-esenciales.html    # Atajos de navegación en cuadrículas de Excel.
│   └── practicas/                    # [5 Prácticas]
│       ├── practica-01-planilla-notas.html
│       ├── practica-02-ejercicios-datos-base.html
│       ├── practica-03-miscelaneas.html
│       ├── practica-04-combinar-correspondencia.html
│       └── practica-05-funciones-basicas.html
│
├── 04-publisher/                     # [Módulo 04] Microsoft Publisher
│   ├── index-teoria.html             # Índice de publicaciones y maquetación.
│   ├── index-guias.html              # Índice de guías teatrales de Publisher.
│   ├── index-practicas.html          # Índice de ejercicios de diseño impreso.
│   ├── teoria/                       # [1 Clase]
│   │   └── 2026-02-07-introduccion.html # Lienzo de trabajo y guías de impresión.
│   ├── guias/                        # [1 Guía]
│   │   └── conceptos-basicos.html    # Operación de objetos y cajas de texto.
│   └── practicas/                    # [1 Práctica]
│       └── practica-01-tarjeta.html  # Diseños de tarjetas institucionales.
│
├── 05-internet/                      # [Módulo 05] Internet y Recursos Digitales
│   ├── index-teoria.html             # Índice de tecnología de red y medios.
│   ├── index-guias.html              # Índice de guías de bancos de recursos.
│   ├── index-practicas.html          # Índice de actividades en línea.
│   ├── teoria/                       # [3 Clases]
│   │   ├── herramienta-pixabay.html  # Exploración de recursos Creative Commons / Pixabay.
│   │   ├── musica-pixabay.html       # Descarga y licencias de audio.
│   │   └── videos-pixabay.html       # Uso de recursos de video stock.
│   ├── guias/                        # [3 Guías]
│   │   ├── guia-pixabay.html
│   │   ├── guia-musica-pixabay.html
│   │   └── guia-videos-pixabay.html
│   └── practicas/                    # [3 Prácticas]
│       ├── practica-pixabay.html
│       ├── practica-musica-pixabay.html
│       └── practica-videos-pixabay.html
│
├── 06-inteligencia-artificial/       # [Módulo 06] Inteligencia Artificial
│   ├── index-teoria.html             # Índice de modelos de lenguaje e IA.
│   ├── index-guias.html              # Índice de guías de prompting técnico.
│   ├── index-practicas.html          # Índice de actividades con Gemini y herramientas.
│   ├── teoria/                       # [2 Clases]
│   │   ├── gemini-texto.html         # Fundamentos de LLMs y Google Gemini.
│   │   └── nanobanana-imagenes.html  # Generación asistida de imágenes.
│   ├── guias/                        # [2 Guías]
│   │   ├── guia-gemini-texto.html
│   │   └── guia-nanobanana-imagenes.html
│   └── practicas/                    # [3 Prácticas]
│       ├── practica-gemini-texto.html
│       ├── practica-generar-diapositivas.html
│       └── practica-nanobanana-imagenes.html
│
└── docs/                             # [Documentación Técnica y Comercial]
    ├── README.md                     # Manual principal e introducción pública.
    ├── CONTEXTO_PROYECTO.md         # Contexto de negocio, alcance y árbol comentado.
    ├── ARQUITECTURA_GLOBAL.md        # Patrones conceptuales, diagramas ASCII y ADRs.
    ├── ESQUEMA_BD.md                 # Estrategia de persistencia en cliente y esquema DOM.
    ├── DESARROLLO.md                 # Guía operativa de mantenimiento y recetas.
    ├── PROPUESTA_COMERCIAL.md        # Análisis de ROI y propuesta de valor de negocio.
    └── PROMPT_AGENTE.md              # Master prompt autocontenido para réplica con IA.
```

---

## 📖 Glosario de Dominio

- **Anti-FOUC (*Flash of Unstyled Content*)**: Técnica de optimización que ejecuta un script bloqueante e in-line en el `<head>` antes del renderizado inicial de la página para aplicar el tema de color deseado desde el primer frame, evitando destellos blancos en modo oscuro.
- **Warm Paper**: Palette de colores en modo claro caracterizada por tonos crema marfil (`#F7F6F3`) y tipografía Serif, imitando la textura de libros y publicaciones de alta calidad.
- **Obsidian Terminal**: Palette cromática de modo oscuro inspirada en consolas de código (`#121212`), con contrastes atenuados para reducir el cansancio visual durante sesiones nocturnas.
- **Jamstack Estático**: Enfoque de desarrollo basado en HTML desacoplado, cargado directamente desde una red de distribución de contenidos (CDN) sin depender de servidores de aplicaciones dinámicos.
- **Iconografía SVG Nativa**: Uso de etiquetas de gráficos vectoriales donde las propiedades cromáticas se controlan dinámicamente con `currentColor` y variables CSS sin solicitar activos adicionales por red.
- **Print-Header-Center**: Elemento estructural dinámico en el DOM que extrae el título de la lección (`<h1>`) mediante JavaScript al momento de imprimir y lo posiciona en la columna central del encabezado de hoja carta.
- **Data Attribute (`data-module` / `data-theme`)**: Atributo HTML5 personalizado que habilita la selección de reglas CSS específicas por módulo ofimático o tema cromático sin contaminar el nombre de las clases.

---

## 🛠️ Stack Tecnológico Detallado

| Capa / Componente | Tecnología Seleccionada | Versión / Estándar | Razón de Selección |
| :--- | :--- | :--- | :--- |
| **Estructura Web** | HTML5 Semántico | W3C Standard | Garantiza accesibilidad nativa, SEO optimizado y compatibilidad universal con navegadores sin compilación. |
| **Diseño y Estilos** | CSS3 Vanilla | CSS Grid / Flexbox | Control fino sobre variables de diseño (`:root`), rendimiento acelerado por GPU y media queries de impresión (`@media print`). |
| **Lógica Client-Side** | JavaScript Vanilla | ECMAScript 5 (ES5) | Compatibilidad retrospectiva total sin requerir transpiladores (Babel) ni empaquetadores (Webpack/Vite). |
| **Tipografía Digital** | Google Fonts API | Source Serif 4 & Inter | Combinación perfecta entre elegancia editorial para títulos y máxima legibilidad sans-serif para cuerpos de texto. |
| **Iconografía Vectorial** | SVG Nativos | XML/SVG 1.1 | Cero latencia de red adicional, escalabilidad infinita en pantallas Retina/4K y adaptación automática al modo oscuro. |
| **Persistencia de Tema** | Web Storage API | `localStorage` | Almacenamiento key-value local sin cookies, liviano y accesible de manera síncrona en la carga del sitio. |
| **Distribución / CDN** | Vercel Static Hosting | Global Edge Network | Enrutamiento estático de alta velocidad con reescritura de URLs limpias sin costo de infraestructura. |
