# 📚 Recursos de Ofimática — Portal Educativo

[![Plataforma Estática](https://img.shields.io/badge/Stack-Vanilla%20HTML%2FCSS%2FJS-blue.svg)](https://github.com/Samydex156/vanilla-blog-ofimatica)
[![Licencia](https://img.shields.io/badge/Licencia-Educativa-green.svg)](#licencia)
[![Despliegue Vercel](https://img.shields.io/badge/Despliegue-Vercel-black.svg)](https://vercel.com)

> Portal web educativo de alto rendimiento diseñado para centralizar el material de enseñanza del curso de **Ofimática** en el **Instituto Nueva Tecnología**, impartido por el **Prof. Samuel Durán**. Proporciona un entorno estructurado con clases de teoría, guías metodológicas paso a paso, diagramas técnicos vectoriales y ejercicios descargables de aplicación real.

---

## 🚀 Características Principales

### 📖 Módulos Educativos Especializados
- 🖥️ **00 Windows**: Conceptos fundamentales del sistema operativo, gestión eficiente de archivos y carpetas, y atajos de teclado esenciales.
- 📝 **01 Word**: Anatomía de documentos formales, formato avanzado, estilos, saltos de página/sección, recetarios y modelos de cartas.
- 📊 **02 PowerPoint**: Arte de la exposición, teoría del color (regla 60-30-10), composición tipográfica, transiciones, animaciones y storytelling visual.
- 📈 **03 Excel**: Estructura de celdas, operaciones y fórmulas matemáticas, funciones financieras y planillas de cálculo automatizadas.
- 📰 **04 Publisher**: Maquetación editorial, diseño de publicaciones impresas, tarjetas formales y piezas publicitarias.
- 🌐 **05 Internet**: Navegación web profesional, banco de recursos multimedia (imágenes, audio y video con Pixabay) y licencias digitales.
- 🤖 **06 Inteligencia Artificial**: Prompts efectivos para generación de texto con Google Gemini, creación de imágenes y diapositivas asistidas.

### 🎨 Sistema de Diseño y UI/UX
- 📜 **Warm Paper & Obsidian Terminal**: Estilo visual retro-elegante inspirado en publicaciones editoriales clásicas y consolas modernas, respaldado por la tipografía Serif `Source Serif 4` e `Inter`.
- 🖼️ **Iconografía e Ilustración 100% SVG**: Gráficos e íconos vectoriales nativos escalables que se adaptan automáticamente a cualquier resolución y esquema de color.
- 📊 **Diagramas Teóricos en SVG**: Maquetación interactiva de interfaces de usuario (ventanas de aplicaciones Office, esquemas de color y gráficos de datos) renderizados completamente en código SVG.
- 🔍 **Buscador en Vivo Unificado**: Motor de búsqueda síncrono del lado del cliente para filtrar contenidos e índices en tiempo real de forma instantánea.
- 🌙 **Modo Oscuro Anti-FOUC**: Cambio cromático fluido entre temas Claro y Oscuro con persistencia en `localStorage` y ejecución síncrona en `<head>` para evitar parpadeos visuales (*Flash of Unstyled Content*).
- 🖨️ **Modo Impresión Institucional**: Hojas de estilo dedicadas (`@media print`) que generan un encabezado institucional de 3 columnas, numeración de páginas y formato carta limpio sin elementos superfluos.
- ⚡ **Arquitectura Cero-Dependencias**: Desarrollado con tecnología nativa (Vanilla HTML5, CSS3 y JS ES5), garantizando tiempo de carga instantáneo y cero costo de mantenimiento.

---

## ⌨️ Atajos de Teclado y Flujos Rápidos

| Acción / Flujo | Atajo / Interacción | Descripción |
| :--- | :--- | :--- |
| **Alternar Tema Visual** | Clic en el botón `[ ☀ ]` / `[ ☾ ]` | Cambia instantáneamente entre el modo *Warm Paper* (Claro) y *Obsidian Terminal* (Oscuro). |
| **Búsqueda Rápida** | Tipear en `<input id="buscador-*">` | Filtra dinámicamente las lecciones y ejercicios en las páginas índice. |
| **Ampliar Imagen** | Clic en imagen `.shortcut-thumbnail` | Abre el modal de zoom a pantalla completa para examinar capturas e interfaces. |
| **Cerrar Zoom** | Tecla `Escape` o clic fuera del modal | Oculta el modal de zoom de imagen de forma inmediata. |
| **Imprimir / Exportar PDF** | `Ctrl + P` / `Cmd + P` | Genera una vista de impresión optimizada en formato carta con encabezado institucional. |

---

## 📋 Requisitos Previos

Dado que el proyecto utiliza una arquitectura **Vanilla Static Jamstack**, no se requieren entornos de ejecución complejos, gestores de paquetes ni herramientas de compilación.

- 🌐 **Navegador Web Moderno**: Google Chrome (v90+), Microsoft Edge (v90+), Mozilla Firefox (v88+), o Safari (v14+).
- 💻 **Editor de Código (Opcional para desarrollo)**: VS Code, Sublime Text o Neovim.
- 🐍 **Servidor HTTP Local (Opcional)**: Python 3.x, Node.js (`npx serve`), o extensión *Live Server*.

---

## 🛠️ Instalación y Configuración Rápida

Sigue estos sencillos pasos para ejecutar el proyecto en tu entorno local:

```bash
# 1. Clonar el repositorio oficial
git clone https://github.com/Samydex156/vanilla-blog-ofimatica.git

# 2. Acceder al directorio del proyecto
cd vanilla-blog-ofimatica

# 3. Abrir la aplicación localmente (opción directa)
# En Windows:
start index.html

# En macOS:
open index.html

# En Linux:
xdg-open index.html
```

### 🐍 Servidor Local Recomendado (Opción para Desarrolladores)

Para probar funcionalidades como modales y scripts locales con el comportamiento idéntico a producción:

```bash
# Opción A: Usando Python 3
python -m http.server 8000
# Abrir en el navegador: http://localhost:8000

# Opción B: Usando Node.js (npx serve)
npx serve .
# Abrir en el navegador: http://localhost:3000
```

---

## 🚀 Despliegue

El proyecto está optimizado para su despliegue inmediato en **Vercel** mediante la configuración definida en `vercel.json`:

```json
{
  "cleanUrls": true,
  "trailingSlash": false
}
```

Esto garantiza URLs limpias sin extensiones `.html` (ejemplo: `/01-word/index-teoria`).

---

## 📜 Licencia

&copy; 2026 **Instituto Nueva Tecnología** | Prof. Samuel Durán.  
Todos los derechos reservados. Material educativo de uso institucional y público.
