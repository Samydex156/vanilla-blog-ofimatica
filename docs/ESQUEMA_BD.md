# 🗄️ Esquema de Persistencia y Modelo de Datos — Vanilla Blog Ofimática

## 1. Motor y Estrategia de Persistencia

El proyecto **Vanilla Blog Ofimática** opera bajo una arquitectura **Serverless & DB-less (Sin Base de Datos Relacional ni Backend)**. La información no requiere almacenamiento en motores como PostgreSQL, MySQL o MongoDB; en su lugar, se estructura mediante dos capas de persistencia y modelado client-side:

1. **Persistencia Local en Navegador (Client-Side Storage)**: Manejada a través de la **Web Storage API (`localStorage`)**. Se utiliza para almacenar las preferencias de interfaz del usuario (tema claro/oscuro) entre sesiones de navegación.
2. **Modelo de Datos Estático Pre-renderizado (DOM-Based Model)**: La información pedagógica (módulos, clases, guías, prácticas, descargables) está modelada en documentos HTML5 estáticos enriquecidos con **Data Attributes (`data-module`, `data-theme`)** y micro-clases semánticas.

---

## 2. Diagrama de Entidad-Relación Conceptual (ASCII Art)

Aunque no existe una base de datos relacional activa, el modelo conceptual de datos del sistema y sus relaciones jerárquicas en el DOM se representa en el siguiente diagrama:

```text
+-----------------------+          1:N          +-----------------------+
|        MÓDULO         | --------------------> |        SECCIÓN        |
|  (data-module="win")  |                       | (Teoría/Guías/Práct.) |
+-----------+-----------+                       +-----------+-----------+
            |                                               |
            |                                               | 1:N
            | 1:1                                           v
            v                                   +-----------------------+
+-----------------------+                       |       LECCIÓN /       |
|    RECURSOS SVG /     |                       |       CONTENIDO       |
|    ICONOGRAFÍA        |                       |   (HTML Document)     |
+-----------------------+                       +-----------+-----------+
                                                            |
                                           +----------------+----------------+
                                           | 1:N                             | 1:1
                                           v                                 v
                                +-----------------------+        +-----------------------+
                                |  RECURSO DESCARGABLE  |        | METADATOS DE IMPRESIÓN|
                                |  (.docx / .xlsx /.pdf)|        | (print-header-center) |
                                +-----------------------+        +-----------------------+
```

---

## 3. Diccionario de Datos

### 💾 Tabla 1: Esquema de Almacenamiento Local (`localStorage`)

Almacenamiento key-value en el navegador web del usuario.

| Clave (*Key*) | Tipo de Dato | Valores Permitidos | Descripción / Regla de Negocio |
| :--- | :--- | :--- | :--- |
| `theme` | `String` | `"dark"` \| `"light"` | Guarda la preferencia cromática del usuario. Si es `"dark"`, se asigna el atributo `data-theme="dark"` a `<html>`. Si no existe, se consulta `prefers-color-scheme`. |

---

### 🏷️ Tabla 2: Estructura de Atributos de Estado DOM (`Data Attributes`)

Atributos personalizados utilizados en el DOM para la selección cromática y lógica de módulos.

| Atributo | Elemento Target | Valores Permitidos | Descripción |
| :--- | :--- | :--- | :--- |
| `data-theme` | `<html>` | `"dark"` \| `"light"` | Controla las variables CSS globales para el tema *Warm Paper* (light) o *Obsidian Terminal* (dark). |
| `data-module` | `.card`, `.module-section` | `"win"`, `"word"`, `"ppt"`, `"xls"`, `"pub"`, `"net"`, `"ia"` | Identifica el módulo activo para aplicar el color distintivo en bordes, badges y acentos visuales. |

---

### 📄 Tabla 3: Esquema Virtual de Contenido Lección/Guía (`DOM Content Structure`)

Campos requeridos en la maquetación HTML de cualquier lección o guía pedagógica:

| Nombre del Campo / Elemento | Selector / Clase CSS | Tipo HTML | Restricción | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| **ID de Tema Toggle** | `#theme-toggle` | `<button>` | Obligatorio | Botón interactivo que conmuta el estado de `localStorage`. |
| **Buscador de Índice** | `#buscador-*` | `<input>` | Requerido en Índices | Campo de texto que activa la búsqueda en vivo. |
| **Lista de Contenidos** | `.item-list` | `<ul>` / `<ol>` | Requerido en Índices | Contenedor principal de los enlaces a clases. |
| **Ítem de Lista** | `.item-list li` | `<li>` | Multiplicidad N | Elemento evaluado dinámicamente por la búsqueda en vivo. |
| **Título de Lección** | `.lesson-header h1` | `<h1>` | Unico por Página | Título principal copiado síncronamente al encabezado de impresión. |
| **Cabecera Impresión Centro** | `.print-header-center` | `<div>` | Requerido para Impresión | Recibe el contenido textual del `<h1>` mediante `busqueda.js`. |
| **Modal de Imagen** | `#img-modal` | `<div>` | Requerido en Contenidos | Contenedor overlay para ampliación de capturas e imágenes. |

---

## 4. Índices y Estrategia de Rendimiento

Al no existir un motor de base de datos relacional, la **estrategia de indexación** se traslada al procesamiento en memoria del navegador:

1. **Búsqueda DOM Directa O(N)**: El script `busqueda.js` ejecuta un selector masivo `document.querySelectorAll(".item-list li")` al cargar la página. Al filtrar, realiza búsquedas de subcadenas (`indexOf`) en memoria sobre el arreglo cargado, logrando tiempos de respuesta de **< 2 milisegundos**.
2. **Caché Estático en CDN (Vercel)**: Los archivos estáticos cuentan con cabeceras HTTP de caché optimizadas para minimizar la latencia de red en cargas consecutivas.
3. **Optimización de Assets Vectoriales**: El uso de íconos en formato `.svg` elimina la necesidad de tablas de metadatos de imágenes pesadas y llamadas adicionales a bases de datos.
