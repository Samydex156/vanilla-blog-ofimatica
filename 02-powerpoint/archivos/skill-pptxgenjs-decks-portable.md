# Skill: pptxgenjs-decks (portable)

Skill para Command Code — genera presentaciones PowerPoint con Node.js + pptxgenjs
sin la alerta de "reparar" de PowerPoint. Este archivo único agrupa todo el skill:
el `SKILL.md`, el script de post-proceso y el template de generador.

**Instalación en otra PC:** copia las secciones siguientes a sus archivos dentro de
`~/.commandcode/skills/pptxgenjs-decks/` (o `.commandcode/skills/` a nivel proyecto):

```
~/.commandcode/skills/pptxgenjs-decks/
├── SKILL.md
├── scripts/fix-charset.js
├── scripts/extract-pdf.js
└── references/template-generator.md
```

---

## 1. SKILL.md

Guarda este contenido como `SKILL.md`:

```markdown
---
name: pptxgenjs-decks
description: Build polished PowerPoint presentations with Node.js and pptxgenjs, avoiding the PowerPoint "repair" prompt. Use when the user asks to create, generate, or script a .pptx deck (any topic) with Node from a description or a reference PDF, or to fix a generated pptx that PowerPoint says is corrupted or missing content.
argument-hint: "<tema o archivo .pdf de referencia> [número de diapositivas]"
---

# Presentaciones PowerPoint con pptxgenjs

Genera decks .pptx modernos y sin errores de reparación de PowerPoint. Este skill
recopila las correcciones técnicas aprendidas en la práctica (formas válidas,
charset, layout, post-proceso) para no repetir los conflictos.

## 1. Setup del proyecto

```bash
npm init -y
npm install pptxgenjs jszip pdf-parse   # jszip para post-proceso, pdf-parse para PDFs
```

Recomendado (opcional): usar ESM con `"type": "module"` en package.json y archivo `.mjs`:

```js
import PptxGenJS from "pptxgenjs";
```

El flujo de guardado SIEMPRE es con post-proceso (ver sección 4). Nunca usar
`writeFile` directo sin corregir el charset.

## 1b. Entrada: descripción o archivo PDF de referencia

La presentación puede basarse en:
- **Una descripción** (tema, nº de diapositivas, tono) dada por el usuario, o
- **Un archivo PDF** (por ejemplo un libro o documento en la carpeta del proyecto).

Si el usuario indica un PDF (o hay uno en la carpeta del proyecto que le
corresponde), extraer su texto con `pdf-parse` **antes de diseñar** para estructurar
el contenido con fidelidad. Script listo: `scripts/extract-pdf.js`
(`node extract-pdf.js archivo.pdf`).

Uso de `pdf-parse` (versión >= 1.3, API actual):

```js
const fs = require("fs");
const { PDFParse } = require("pdf-parse");

async function extract(pdfPath) {
  const parser = new PDFParse({ data: fs.readFileSync(pdfPath) });
  const result = await parser.getText();
  return result.pages;   // [{ text: "..." }, ...]
}
```

Flujo con PDF: extraer texto → leer las páginas → identificar los ejes temáticos
→ estructurar las N diapositivas (carátula, introducción, desarrollo con 2–3
secciones, conclusión, agradecimiento) → generar.

**Aviso:** el texto extraído puede ser extenso (libros de cientos de páginas).
Sintetizar en ideas-fuerza, datos concretos (cifras, fórmulas, ejemplos) y
conceptos clave por sección; no transcribir párrafos completos.

## 2. Configuración base (obligatoria)

```js
const pptx = new PptxGenJS();
pptx.layout = "LAYOUT_WIDE";   // 13.33 x 7.5 in (16:9 REAL)
pptx.author = "...";
pptx.title = "...";
```

**CRÍTICO — proporción:** `LAYOUT_WIDE` mide 13.33 x 7.5 in y es el 16:9 real.
`LAYOUT_16x9` NO es 13.33 x 7.5 (es 10 x 5.625 in) — usarlo hace que todo el
contenido calculado para 13.33 desborde la diapositiva. Si se diseñan coordenadas,
hacerlo SIEMPRE para el lienzo 13.33 x 7.5.

## 3. Shapes y Charts: valores válidos (CRÍTICO)

PowerPoint muestra "reparar" y descarta contenido si el archivo contiene valores
`prst` de forma que no existen en el esquema OOXML. Usar SOLO estos:

| Intención | `addShape` (string) | Equivalente enum |
|-----------|---------------------|------------------|
| Rectángulo | `"rect"` | `pres.ShapeType.rect` |
| Rectángulo redondeado | `"roundRect"` | `pres.ShapeType.roundRect` |
| Elipse / círculo | `"ellipse"` | `pres.ShapeType.ellipse` |
| Línea | `"line"` | `pres.ShapeType.line` |

**PROHIBIDO:** `"oval"`, `"roundedRectangle"`, `"rectangle"` — no existen como
`prst` válidos y causan la alerta de reparación (PowerPoint elimina esas formas).

Chart types válidos: `"bar" | "doughnut" | "line" | "pie"` (o `pres.ChartType.*`).

## 4. Post-proceso obligatorio: charset inválido

pptxgenjs escribe en cada texto con `fontFace` definido los atributos
`charset="-122"` y `charset="-120"` (East Asian / Complex Script). Son valores
**negativos inválidos** según el esquema `CT_TextFont` (rango 0–255). PowerPoint
los detecta al abrir y ofrece reparar, eliminando el contenido de fuente asociado.

Solución: reempaquetar el .pptx reemplazando `charset="-122"` / `charset="-120"`
por `charset="0"`. Guardar SIEMPRE con este flujo:

```js
const JSZip = require("jszip");
const fs = require("fs");

const OUTPUT = "presentacion.pptx";

async function generate() {
  const buf = await pptx.write({ outputType: "nodebuffer" });
  const zip = await JSZip.loadAsync(buf);
  let fixed = 0;
  for (const name of Object.keys(zip.files)) {
    if (zip.files[name].dir || !/\.xml$/.test(name)) continue;
    const content = await zip.files[name].async("string");
    const next = content.replace(/charset="-12[02]"/g, 'charset="0"');
    if (next !== content) {
      fixed += (content.match(/charset="-12[02]"/g) || []).length;
      zip.file(name, next);
    }
  }
  if (fixed > 0) console.log(`Post-proceso: corregidos ${fixed} charset inválidos.`);
  const outBuf = await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 9 },
  });
  fs.writeFileSync(OUTPUT, outBuf);
  console.log(`Presentación generada: ${OUTPUT}`);
}

generate().catch((err) => { console.error(err); process.exit(1); });
```

Una copia lista para usar está en `scripts/fix-charset.js` (usa como post-proceso
o standalone: `node fix-charset.js entrada.pptx salida.pptx`).

## 5. Verificación post-generación

Antes de entregar, validar el .pptx escaneando sus XML:

```js
// node verify-pptx.js presentacion.pptx
const JSZip = require("jszip");
const fs = require("fs");

async function main() {
  const file = process.argv[2];
  const zip = await JSZip.loadAsync(fs.readFileSync(file));
  let bad = 0;
  for (const name of Object.keys(zip.files)) {
    if (zip.files[name].dir || !/\.xml$/.test(name)) continue;
    const c = await zip.files[name].async("string");
    if (/charset="-12[02]"/.test(c)) { bad++; console.log("charset negativo:", name); }
    if (/prst="oval"/.test(c)) { bad++; console.log("prst=oval:", name); }
  }
  console.log(bad === 0 ? "OK: sin valores inválidos" : `PROBLEMAS: ${bad}`);
}
main();
```

Salida esperada: `OK: sin valores inválidos`.

## 6. Diseño: variar el estilo por tema (NO calcar)

**Regla de oro: cada presentación debe verse visualmente distinta.** El template de
referencia es un punto de partida, NO el diseño por defecto. Si dos decks seguidos
usan el mismo layout, cambiar el diseño.

### 6a. Componentes de diseño

Antes de escribir el generador, decidir 4 cosas (y reflejarlas en la paleta y
estructura):

1. **Paleta** — derivar del tema y del tono. Definir constantes `C = { ... }`
   (hex de 6 dígitos). Un tema corporativo → azules/grises; salud/naturaleza →
   verdes/tierras; energía → naranjas/amarillos; lujo → negro/dorado, etc.
2. **Tipografía** — una sans-serif limpia (Montserrat, Arial, Calibri, Lato,
   Roboto, Poppins...). Variar la elección por tema. Si se usa `fontFace`, el
   post-proceso de charset es obligatorio.
3. **Estructura de layout** — NO fija. Se puede elegir entre (al menos):
   - Portada con bloques de color y elipses decorativas
   - Portada con banda superior de color / tipografía gigante / imagen de fondo
   - Tarjetas numeradas / columnas de iconos / tablas / listas verticales
   - Gráficos (barras, dona, línea) como protagonistas en la diapositiva de datos
   - Banda inferior de "dato clave" **o** cita destacada **o** línea de cierre
4. **Elementos de coherencia** — dentro de UN deck, repetir con consistencia:
   kicker de sección, número de página, esquinas redondeadas, sombras suaves.

### 6b. Anti-patrones (evitar que todo se vea igual)

- NO reutilizar el mismo script de otro tema cambiando solo colores y textos.
- NO usar los mismos helpers (mismos nombres/posiciones de tarjetas) siempre.
- NO repetir exactamente la portada (elipses + banda) entre decks.
- Ajustar también: tipografía, proporciones de tarjetas, posición de la banda,
  estilo de la agenda, tratamiento de los gráficos.

### 6c. Referencia de diseño

El template en `references/template-generator.md` es UN ejemplo verificable
(sirve para validar que el código funciona). Al usarlo, **modificar al menos la
portada, la disposición de tarjetas y la banda de cierre** para que el resultado
no sea calcado.

## 7. Flujo de trabajo

1. Preguntar/confirmar tema, nº de diapositivas y tono (si no están dados).
2. Crear package.json, instalar `pptxgenjs`, `jszip` (y `pdf-parse` si hay PDF).
3. Decidir el diseño (sección 6): paleta, tipografía, estructura de layout y
   coherencia — distintos de los decks anteriores. Escribir el generador con esa
   decisión (helpers propios del tema, no calcados).
4. Guardar con post-proceso (sección 4).
5. Verificar (sección 5) y entregar el .pptx.

**Nota:** si el usuario abre el archivo en PowerPoint y reporta la alerta de
reparación, revisar primero `prst="oval"` y luego `charset="-12x"` en el XML.
```

---

## 2. scripts/fix-charset.js

Guarda este contenido como `scripts/fix-charset.js`:

```js
// Post-procesador de .pptx generados con pptxgenjs
// Corrige charset="-122"/"-120" (inválidos en OOXML, causan la alerta de
// reparación de PowerPoint) -> charset="0", y reempaqueta.
//
// Uso:
//   node fix-charset.js entrada.pptx [salida.pptx]
//   (sin salida, sobreescribe la entrada)
const JSZip = require("jszip");
const fs = require("fs");

const SRC = process.argv[2];
const OUT = process.argv[3] || SRC;

if (!SRC) {
  console.error("Uso: node fix-charset.js entrada.pptx [salida.pptx]");
  process.exit(1);
}

async function main() {
  const zip = await JSZip.loadAsync(fs.readFileSync(SRC));
  let total = 0;

  for (const name of Object.keys(zip.files)) {
    if (zip.files[name].dir || !/\.xml$/.test(name)) continue;
    const content = await zip.files[name].async("string");
    const next = content.replace(/charset="-12[02]"/g, 'charset="0"');
    if (next !== content) {
      total += (content.match(/charset="-12[02]"/g) || []).length;
      zip.file(name, next);
    }
  }

  const outBuf = await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 9 },
  });
  fs.writeFileSync(OUT, outBuf);
  console.log(`Corregidos ${total} charset inválidos -> ${OUT}`);
}

main().catch((e) => {
  console.error("ERROR:", e);
  process.exit(1);
});
```

---

## 3. scripts/extract-pdf.js

Guarda este contenido como `scripts/extract-pdf.js`:

```js
// Extrae el texto de un PDF usando pdf-parse (API >= 1.3: clase PDFParse).
//
// Uso:
//   node extract-pdf.js archivo.pdf [archivo-salida.txt]
//   (sin salida, imprime por consola)
//
// Requiere: npm install pdf-parse
const fs = require("fs");
const { PDFParse } = require("pdf-parse");

const SRC = process.argv[2];
const OUT = process.argv[3];

if (!SRC) {
  console.error("Uso: node extract-pdf.js archivo.pdf [salida.txt]");
  process.exit(1);
}

async function main() {
  const parser = new PDFParse({ data: fs.readFileSync(SRC) });
  const result = await parser.getText();

  let out = `=== ${SRC} | ${result.pages.length} páginas ===\n\n`;
  result.pages.forEach((p, i) => {
    out += `----- PÁGINA ${i + 1} -----\n${p.text}\n\n`;
  });

  if (OUT) {
    fs.writeFileSync(OUT, out, "utf8");
    console.log(`Texto extraído (${result.pages.length} páginas) -> ${OUT}`);
  } else {
    console.log(out);
  }
}

main().catch((e) => {
  console.error("ERROR:", e);
  process.exit(1);
});
```

---

## 4. references/template-generator.md

Guarda este contenido como `references/template-generator.md`:

```markdown
# Plantilla de generador pptxgenjs

Estructura base verificada (evita los conflictos de reparación de PowerPoint).
Copia y adapta. Guardar SIEMPRE con el post-proceso de charset (ver SKILL.md §4).

## Cabecera y paleta

```js
const PptxGenJS = require("pptxgenjs");
const pptx = new PptxGenJS();
pptx.layout = "LAYOUT_WIDE";            // 13.33 x 7.5 in — 16:9 real
pptx.author = "Nombre";
pptx.title = "Título";

const C = {
  primary: "C8102E",   // color principal del tema
  primaryDark: "8A0D20",
  bg: "FFF6EE",        // fondo
  ink: "231F20",       // texto principal
  gray: "6B6B6B",      // texto secundario
  accent: "2E7D32",    // acento secundario (alternativas, positivo)
  soft: "FBEAEC",      // fondo tarjeta suave del color principal
  line: "EAD9D3",      // líneas decorativas
  white: "FFFFFF",
};

const FONT = "Montserrat";
const SLIDE_W = 13.33;
const SLIDE_H = 7.5;
const MARGIN = 0.6;
```

## Helpers de layout

```js
function headerBar(slide, title, kicker) {
  slide.background = { color: C.bg };
  slide.addShape("rect", { x: 0, y: 0, w: 0.14, h: SLIDE_H, fill: { color: C.primary } });
  slide.addText(kicker || "TÍTULO", {
    x: MARGIN, y: 0.55, w: 9, h: 0.3, fontFace: FONT, fontSize: 11,
    color: C.primary, charSpacing: 3, bold: true,
  });
  slide.addText(title, {
    x: MARGIN, y: 0.9, w: 12, h: 0.85, fontFace: FONT, fontSize: 30,
    color: C.ink, bold: true,
  });
  slide.addShape("line", { x: MARGIN, y: 1.85, w: 12.13, h: 0, line: { color: C.line, width: 1.5 } });
}

function footerSlide(slide, n) {
  slide.addText(String(n), {
    x: SLIDE_W - 1.1, y: SLIDE_H - 0.55, w: 0.5, h: 0.3,
    fontFace: FONT, fontSize: 10, color: C.gray, align: "right",
  });
}

function bulletCard(slide, x, y, w, h, bullet, title, body, accent) {
  slide.addShape("roundRect", {
    x, y, w, h, rectRadius: 0.1, fill: { color: C.white },
    line: { color: C.line, width: 1 },
    shadow: { type: "outer", blur: 5, offset: 2, angle: 90, color: "C9B8B2", opacity: 0.3 },
  });
  // CÍRCULO: usar "ellipse" SIEMPRE ("oval" causa reparación)
  slide.addShape("ellipse", { x: x + 0.22, y: y + 0.22, w: 0.42, h: 0.42, fill: { color: accent } });
  slide.addText(bullet, {
    x: x + 0.22, y: y + 0.22, w: 0.42, h: 0.42, fontFace: FONT, fontSize: 16,
    bold: true, color: C.white, align: "center", valign: "middle",
  });
  slide.addText(title, { x: x + 0.85, y: y + 0.2, w: w - 1.0, h: 0.4, fontFace: FONT, fontSize: 14, bold: true, color: C.ink, valign: "middle" });
  slide.addText(body, { x: x + 0.85, y: y + 0.68, w: w - 1.05, h: h - 0.85, fontFace: FONT, fontSize: 10.5, color: C.gray, valign: "top", lineSpacing: 13 });
}
```

## Gráficos (barras y dona) — ejemplo verificado

```js
// Gráfico de barras
slide.addChart("bar", [
  { name: "Serie", labels: ["A", "B", "C"], values: [35, 30, 14] },
], {
  x: MARGIN, y: 2.65, w: 6.1, h: 3.2,
  barDir: "bar", barGrouping: "clustered",
  showValue: true,
  chartColors: [C.primary],
  catAxisLabelColor: C.ink, catAxisLabelFontFace: FONT, catAxisLabelFontSize: 10,
  valAxisLabelColor: C.gray, valAxisLabelFontFace: FONT, valAxisLabelFontSize: 9,
  dataLabelColor: C.ink, dataLabelFontFace: FONT, dataLabelFontSize: 9, dataLabelPosition: "outEnd",
  catGridLine: { style: "none" }, valGridLine: { style: "solid", color: C.line },
  chartArea: { fill: { color: C.white }, border: { color: C.line, pt: 0.5 } },
  plotArea: { fill: { color: C.white } },
  showLegend: false,
  showTitle: true, title: "Título", titleColor: C.ink, titleFontFace: FONT, titleFontSize: 13, titleBold: true,
});

// Gráfico de dona
slide.addChart("doughnut", [
  { name: "Composición", labels: ["Parte 1", "Parte 2", "Parte 3"], values: [35, 4, 291] },
], {
  x: 6.9, y: 2.65, w: 5.83, h: 3.2,
  holeSize: 55,
  chartColors: [C.primary, "F2B3BE", "E8E1DA"],
  showLegend: true, legendPos: "b", legendColor: C.ink, legendFontFace: FONT, legendFontSize: 10,
  dataLabelColor: C.ink, dataLabelFontFace: FONT, dataLabelFontSize: 9, dataLabelPosition: "ctr",
  chartArea: { fill: { color: C.white }, border: { color: C.line, pt: 0.5 } },
  plotArea: { fill: { color: C.white } },
  showTitle: true, title: "Título", titleColor: C.ink, titleFontFace: FONT, titleFontSize: 13, titleBold: true,
});
```

## Recordatorio final

- Formas válidas: `rect`, `roundRect`, `ellipse`, `line`. **Nunca** `oval`.
- Charts válidos: `bar`, `doughnut`, `line`, `pie`.
- Guardar con post-proceso de charset (nunca `writeFile` directo).
- Verificar antes de entregar: `OK: sin valores inválidos`.
```

---

## Cheat sheet rápido

| Concepto | Valor correcto | Valor problemático |
|----------|----------------|--------------------|
| Layout | `LAYOUT_WIDE` (13.33 x 7.5) | `LAYOUT_16x9` (10 x 5.625) |
| Círculo | `"ellipse"` | `"oval"` |
| Rectángulo | `"rect"` | `"rectangle"` |
| Rect redondeado | `"roundRect"` | `"roundedRectangle"` |
| Chart | `bar` / `doughnut` / `line` / `pie` | otros strings |
| Charset en XML | `0` | `-122` / `-120` |
| PDF de referencia | `scripts/extract-pdf.js` + sintetizar | transcribir todo |
| API pdf-parse | `const { PDFParse } = require("pdf-parse")` | `require("pdf-parse")` como función |
