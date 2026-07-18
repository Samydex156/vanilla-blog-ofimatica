# Caso 07 - Hoja de Vida y Planilla de Personal (Soluciones Clase)

---

### Estructura del documento

- **Tamaño**: A4 (21,0 × 29,7 cm)
- **Márgenes**: 2,0 cm (1134 dxa) en los 4 lados
- **Fuente**: Calibri (predeterminada y en todos los textos)

---

### Título principal
"**Sistemas Integrados S.A.**" — Calibri 26 pts, azul oscuro (#1F4E79), negrita, centrado.

---

### Tabla 1 — Información de la empresa

**Propiedades**
| Propiedad | Valor |
|-----------|-------|
| Ancho | 100% |
| Diseño | Fijo |
| Columnas | 2 |
| Combinaciones | Ninguna |
| Número de filas | 6 filas (1 encabezado + 5 datos) |

**Encabezados**
| Texto | Sombreado | Texto |
|-------|-----------|-------|
| "Atributo" | #4472C4 | Blanco, negrita |
| "Valor" | #4472C4 | Blanco, negrita |

**Datos**
| Atributo | Valor |
|----------|-------|
| Nombre | Sistemas Integrados S.A. |
| RUT | 76.123.456-7 |
| Dirección | Av. Providencia 1234, Santiago |
| Teléfono | +56 2 2345 6789 |
| Email | contacto@sistemasintegrados.com |

---

### Tabla 2 — Planilla de personal

**Propiedades**
| Propiedad | Valor |
|-----------|-------|
| Ancho | 100% |
| Diseño | Fijo |
| Columnas | 6 |
| Altura encabezado | 500 (mínimo) |
| Altura filas datos | 340 (mínimo) |
| Alineación vertical | Centrada |

**Encabezados**
| Columna | Ancho | Sombreado | Texto |
|---------|-------|-----------|-------|
| Cód. | 9,5% | #4472C4 | Blanco, negrita, centrado |
| Nombre Completo | 30% | #4472C4 | Blanco, negrita, centrado |
| Cargo | 27,5% | #4472C4 | Blanco, negrita, centrado |
| Ingreso | 11% | #4472C4 | Blanco, negrita, centrado |
| Salario | 11% | #4472C4 | Blanco, negrita, centrado |
| Nivel | 11% | #4472C4 | Blanco, negrita, centrado |

**Filas de datos (efecto cebra)**
| # | Cód. | Nombre | Cargo | Ingreso | Salario | Nivel | Sombreado |
|---|------|--------|-------|---------|---------|-------|-----------|
| 1 | 001 | Ana García López | Analista de Sistemas | 15/03/2020 | $55,000 | A2 | #FFFFFF |
| 2 | 002 | Carlos Mendoza Ruiz | Desarrollador Senior | 01/07/2018 | $62,000 | A1 | #DEEAF6 |
| 3 | 003 | María Fernández Torres | Técnico de Soporte | 10/11/2021 | $38,000 | B1 | #FFFFFF |
| 4 | 004 | José Hernández Paredes | Administrador de Redes | 22/04/2019 | $58,000 | A2 | #DEEAF6 |
| 5 | 005 | Laura Castillo Vega | Ingeniera de Software | 05/09/2022 | $49,000 | B1 | #FFFFFF |
| 6 | 006 | Pedro Ramírez Solís | Soporte Técnico N2 | 18/01/2023 | $32,000 | C1 | #DEEAF6 |
| 7 | 007 | Sofía Morales Rivas | Analista de Calidad | 30/06/2020 | $45,000 | B2 | #FFFFFF |

**Alineación de contenido por columna**
| Cód. | Nombre | Cargo | Ingreso | Salario | Nivel |
|------|--------|-------|---------|---------|-------|
| Centro | Izquierda | Izquierda | Centro | Centro | Centro |

**Bordes**
- Todas las celdas: borde sencillo, color #CCCCCC (datos)
- Celdas de encabezado: borde más grueso, color #2E5090

**Márgenes de celda**
- Superior/inferior: 20
- Izquierdo/derecho: 60

---

### Pie de página

Texto: "Sistemas Integrados S.A. - Registro Confidencial"

---

### Validación

Ejecuta: `node validar_caso.js Caso_07_Clase.docx`
El resultado esperado es **1000/1000** con todos los requisitos en ✅.
