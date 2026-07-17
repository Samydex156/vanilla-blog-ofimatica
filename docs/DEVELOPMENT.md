# Guía de Desarrollo — Vanilla Blog Ofimática

## Requisitos de Desarrollo

- **Editor**: Cualquier editor de texto (VS Code recomendado)
- **Navegador**: Chrome/Edge DevTools para depuración
- **Git** para control de versiones
- **Cuenta en Vercel** para despliegue (opcional)
- **No requiere**: Node.js, npm, compiladores, bundlers ni transpiladores

No hay variables de entorno ni SDKs específicos.

## Solución de problemas comunes

### Páginas que referencian `modules-style.css`

Algunas páginas antiguas incluyen:
```html
<link rel="stylesheet" href="../../modules-style.css" />
```

Este archivo **no existe** en el repositorio. El CSS fue migrado a `main-style.css`. Si una página se ve sin estilos, actualiza la referencia o elimina el `<link>` obsoleto.

### Duplicación de `busqueda.js`

Existen **6 copias** idénticas de `busqueda.js`, una por módulo. Cada copia difiere únicamente en el selector CSS:

| Archivo | Selector |
|---------|----------|
| `00-windows/busqueda.js` | `.item-list-win li` |
| `01-word/busqueda.js` | `.item-list-doc li` |
| `02-powerpoint/busqueda.js` | `.item-list-ppt li` |
| `03-excel/busqueda.js` | `.item-list-xls li` |
| `05-internet/busqueda.js` | `.item-list-net li` |
| `06-inteligencia-artificial/busqueda.js` | `.item-list-ia li` |

Al crear un nuevo módulo, copia `busqueda.js` y cambia el selector CSS.

### Imágenes no cargadas

Usa rutas relativas. Para páginas en subdirectorios profundos, verifica la ruta de la imagen respecto al archivo HTML actual. Ejemplo:

```
Archivo: 01-word/teoria/introduccion-word.html
Imagen:  ../../imgs/img-word.png
```

## Comandos de Terminal Clave

```bash
# Clonar el repositorio
git clone <repo-url>
cd vanilla-blog-ofimatica

# Iniciar servidor local de desarrollo (cualquiera de estos):
npx serve .                    # Node.js — sirve en http://localhost:3000
python -m http.server 8000     # Python 3 — sirve en http://localhost:8000
php -S localhost:8000          # PHP — sirve en http://localhost:8000

# Ver cambios en vivo (opcional: Live Server en VS Code)
#   - Click derecho en index.html > "Open with Live Server"
```

No hay comandos de build, test, lint ni release. El proyecto se despliega simplemente subiendo los archivos.

## Guía de Extensión

### Cómo añadir un nuevo módulo

1. Crea una carpeta numerada: `07-nuevo-modulo/`
2. Dentro, crea la estructura base:
   ```
   07-nuevo-modulo/
   |-- busqueda.js             # Copia de busqueda.js existente, cambia selector a .item-list-nuevo li
   |-- index-teoria.html       # Copia de index-teoria.html de otro módulo, ajusta título y breadcrumb
   |-- index-guias.html        # Ídem
   |-- index-practicas.html    # Ídem
   |-- Teoría/
   |-- guias/
   |-- practicas/
   ```
3. En `main-style.css`, añade:
   ```css
   --color-nuevo: #hexcolor;              /* en :root */
   .card:nth-child(8) { border-top: 3px solid var(--color-nuevo); }  /* en .card:nth-child */
   ```
4. Añade las Teoría para el nuevo módulo en las secciones de `.module-section-*`, `.item-list-*` y efectos hover.
5. Crea un icono en `imgs/img-nuevo-modulo.png`.
6. Añade la tarjeta en `index.html` siguiendo el patrón de las existentes.

### Cómo añadir una nueva clase/guía/práctica

1. Copia una página de contenido existente del mismo módulo.
2. Actualiza el breadcrumb (`<nav class="breadcrumb-nav">`) con la ruta correcta.
3. Cambia el título en `<h1>` y la fecha en `<span class="date">`.
4. Escribe el contenido dentro de `<div class="lesson-body">`.
5. Si necesitas imágenes, colócalas en la carpeta `*-imgs/` del módulo y referencia con ruta relativa.
6. Agrega un enlace `<a>` en el `index-*.html` correspondiente, dentro de la lista `<ul class="item-list-*">`.

### Cómo añadir un nuevo estilo de módulo en main-style.css

El sistema de colores se basa en **variables CSS** y **Teoría paralelas**. Para cada módulo se requieren estas definiciones:

```css
/* 1. Variable en :root */
--color-nuevo: #hexcolor;

/* 2. Borde superior de tarjeta en homepage */
.card:nth-child(N) { border-top: 3px solid var(--color-nuevo); }

/* 3. Clase de sección */
.module-section-nuevo h2 {
    border-bottom-color: var(--color-nuevo);
    color: var(--color-nuevo);
}

/* 4. Clase de lista */
.item-list-nuevo a:hover {
    background: var(--bg-body);
    border-left: 3px solid var(--color-nuevo);
}
```

### Cómo modificar el buscador en vivo

El script `busqueda.js` es auto-contenido. Para modificar su comportamiento:

```javascript
// Ejemplo: filtrar también por fecha o categoría
buscador.addEventListener("input", function () {
    const filtro = buscador.value.toLowerCase();
    listaItems.forEach(item => {
        const titulo = item.querySelector(".item-title").textContent.toLowerCase();
        const fecha = item.querySelector(".item-date")?.textContent.toLowerCase() || "";
        const coincide = titulo.includes(filtro) || fecha.includes(filtro);
        item.style.display = coincide ? "" : "none";
    });
});
```

### Cómo añadir un nuevo tipo de página de contenido

Si necesitas un layout distinto al existente (`.content`, `.guide-container`):

1. Define la nueva clase en `main-style.css`.
2. Añade una clase de caja informativa (`.box-*`) con su color de borde izquierdo.
3. Crea una página HTML ejemplo y prueba en navegador.
