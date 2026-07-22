# Guía de Desarrollo — Vanilla Blog Ofimática

## Requisitos de Desarrollo

- **Editor**: Cualquier editor de texto (VS Code recomendado)
- **Navegador**: Chrome/Edge DevTools para depuración, vista de modo oscuro y simulación de impresión
- **Git** para control de versiones
- **Cuenta en Vercel** para despliegue (opcional)
- **No requiere**: Node.js, npm, compiladores, bundlers ni transpiladores

No hay variables de entorno ni SDKs específicos.

## Arquitectura del Código

### CSS — `main-style.css`

El archivo está organizado con tokens del sistema de diseño **Warm Paper & Obsidian Terminal**:

1. Variables globales (`:root`: tono papel marfil `#F7F6F3`, tarjetas `#FFFFFF`, texto `#1A1A1A`, tipografía Serif `Source Serif 4`)
2. Modo oscuro (`[data-theme="dark"]`: tono obsidiana `#121212`, tarjetas `#1C1C1C`, texto `#E6E6E6`, overlays oscurecidos)
3. Reset básico y compacidad global (~25% más denso)
4. Header y Footer (`.header-row`, `.theme-btn` badge retro `[ ☀ ]` / `[ ☾ ]`)
5. Layout (`.container`, `.grid`)
6. Tarjetas (`.card`, con íconos vectoriales SVG por `data-module`)
7. Enlaces de navegación
8. Breadcrumb (`.breadcrumb-nav`, con ícono `icon-home.svg` e `#theme-toggle` interno)
9. Secciones de módulo (`.module-section`)
10. Listas de ítems (`.item-list`, selección multilínea `li` en buscador)
11. Buscador
12. Modal de imágenes (`.modal` adaptado a modo oscuro y soporte para tecla `Escape`)
13. Contenido de lecciones (`.content`, `.lesson-header`, `.lesson-body`)
14. Cajas informativas (`.box-*`)
15. Tablas y **Diagramas Vectoriales SVG** (`.svg-chart-preview`, `.svg-window-container`)
16. Código y atajos
17. **Tabla de atajos esenciales** (`.essentials-table`, `.essentials-note`)
18. Botón de descarga
19. Responsive (tablet y móvil)
20. **Impresión** (`@media print`)

### JS — `busqueda.js` (raíz)

Un único archivo que maneja:
- Búsqueda en vivo en todas las páginas índice (`document.querySelectorAll(".item-list li")`)
- Toggle de modo oscuro (botón `[ ☀ ]` / `[ ☾ ]`)
- Persistencia del modo oscuro en `localStorage`
- Copia dinámica del `<h1>` al `print-header-center` en páginas de contenido
- Manejador del evento `keydown` (tecla `Escape`) para cerrar el modal de imagen `#img-modal`

## Solución de problemas comunes

### El modo oscuro no se persiste entre páginas

Verifica que `busqueda.js` esté cargado en la página. Todas las páginas de contenido deben incluir:

```html
<script src="../../busqueda.js"></script>
```

Si falta, el modo oscuro no se restaurará al navegar.

### El encabezado de impresión aparece vacío

El `print-header-center` se llena mediante JavaScript. Si el script no se ejecuta (por ejemplo, si no hay `<h1>` en la página), la columna central quedará vacía. Verifica que la página tenga un `<h1>` dentro de `.lesson-header` o `.guide-header`.

### La vista de impresión no se ve correctamente

Asegúrate de usar `Ctrl+P` y revisar la vista previa. El formato carta (`size: letter`) y los márgenes se aplican automáticamente. Si el navegador tiene márgenes personalizados, pueden solaparse.

## Comandos de Terminal Clave

```bash
# Clonar el repositorio
git clone <repo-url>
cd vanilla-blog-ofimatica

# Iniciar servidor local de desarrollo (cualquiera de estos):
npx serve .                    # Node.js — http://localhost:3000
python -m http.server 8000     # Python 3 — http://localhost:8000
php -S localhost:8000          # PHP — http://localhost:8000

# Ver cambios en vivo (opcional: Live Server en VS Code)
#   Click derecho en index.html > "Open with Live Server"
```

No hay comandos de build, test, lint ni release.

## Guía de Extensión

### Cómo añadir un nuevo módulo

1. Crea la carpeta: `07-nuevo-modulo/`
2. Crea la estructura base:
   ```
   07-nuevo-modulo/
   |-- index-teoria.html      # Copia de otro módulo, ajusta breadcrumb y título
   |-- index-guias.html       # Ídem
   |-- index-practicas.html   # Ídem
   |-- teoria/
   |-- guias/
   |-- practicas/
   ```
3. En `main-style.css`:
   ```css
   /* Variable en :root */
   --color-nuevo: #hexcolor;
   
   /* Borde de tarjeta en homepage */
   .card[data-module="nuevo"] { border-top: 3px solid var(--color-nuevo); }
   
   /* Badge de color */
   .card[data-module="nuevo"] .module-badge { background: var(--color-nuevo); }
   
   /* Wash en hover */
   .card[data-module="nuevo"]:hover { background: linear-gradient(135deg, #ffffff 0%, #f4f9fc 100%); }
   ```
4. Crea un icono en `imgs/img-nuevo-modulo.png`.
5. Añade la tarjeta en `index.html` con `data-module="nuevo"`.

### Cómo añadir una nueva página de contenido

1. Copia una página existente del mismo tipo (teoría/guía/práctica).
2. Actualiza el breadcrumb con la ruta correcta:
   ```html
   <a href="../../index.html">Inicio</a> >
   <a href="../index-teoria.html">Módulo</a> >
   <span>Título</span>
   ```
3. Cambia el `<h1>` y la fecha si aplica.
4. Escribe el contenido en `.lesson-body`.
5. Agrega el script de modo oscuro e impresión al final del `<body>`:
   ```html
   <script src="../../busqueda.js"></script>
   ```
6. Registra la página en el `index-*.html` correspondiente.

### Cómo modificar el modo oscuro

Los colores oscuros se definen en `main-style.css` bajo `[data-theme="dark"]`. Para agregar un nuevo elemento al modo oscuro:

```css
[data-theme="dark"] .mi-clase {
    background: #2a2a2a;
    color: #e0e0e0;
    border-color: #444;
}
```

### Cómo modificar la vista de impresión

Toda la configuración de impresión está bajo `@media print` al final de `main-style.css`. Para cambiar el formato de página:

```css
@page {
    size: letter;       /* Cambiar a A4: size: A4 */
    margin: 1.5cm 2cm;  /* Ajustar márgenes */
}
```

### Cómo modificar el buscador en vivo

El script `busqueda.js` en la raíz es auto-contenido. Para modificar su comportamiento de búsqueda:

```javascript
// Ejemplo: filtrar también por fecha
buscador.addEventListener("input", function () {
    const filtro = buscador.value.toLowerCase();
    listaItems.forEach(item => {
        const titulo = item.querySelector(".item-title").textContent.toLowerCase();
        const fecha = item.querySelector(".item-date")?.textContent.toLowerCase() || "";
        item.style.display = titulo.includes(filtro) || fecha.includes(filtro) ? "" : "none";
    });
});
```

### Cómo añadir una nueva caja informativa

```css
.box-mimodulo {
    border-left-color: var(--color-nuevo);
}
```

Luego en HTML: `<div class="box box-mimodulo">`.
