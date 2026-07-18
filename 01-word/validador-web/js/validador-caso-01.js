/**
 * validador-caso-01.js — Validador del Caso 01: PixelWorld / RetroQuest Newsletter
 * Port exacto de 01_Nivel_Basico/Caso_01_PixelWorld_Newsletter/validar_caso.js
 */
const ValidadorCaso01 = (function () {
  'use strict';

  const C = WordCore;

  async function validarDocumento(zip, isHomework) {
    const report = [];
    let score = 0;

    const docObj = await C.getXmlAsObject(zip, 'word/document.xml');
    if (!docObj) {
      throw new Error("No se pudo leer la estructura del documento.");
    }

    const paragraphs = C.getParagraphs(docObj);

    const config = {
      topMin: isHomework ? 1124 : 1237,
      topMax: isHomework ? 1144 : 1257,
      leftMin: isHomework ? 1407 : 1577,
      leftMax: isHomework ? 1427 : 1597,
      marginDesc: isHomework ? "Sup/Inf 2.0cm, Izq/Der 2.5cm" : "Sup/Inf 2.2cm, Izq/Der 2.8cm",
      keywords: isHomework ? ["retroquest", "alpha", "lanzamiento"] : ["pixelworld", "beta", "lanzamiento"],
      footerText: isHomework ? "retroquest studio - boletín informativo" : "pixelworld studio - boletín informativo"
    };

    // 1. Márgenes de página (100 pts)
    const margins = C.getMargins(docObj);
    const top = margins ? parseInt(margins.top, 10) : 0;
    const bottom = margins ? parseInt(margins.bottom, 10) : 0;
    const left = margins ? parseInt(margins.left, 10) : 0;
    const right = margins ? parseInt(margins.right, 10) : 0;

    const marginsOk = margins &&
      (top >= config.topMin && top <= config.topMax) &&
      (bottom >= config.topMin && bottom <= config.topMax) &&
      (left >= config.leftMin && left <= config.leftMax) &&
      (right >= config.leftMin && right <= config.leftMax);

    if (marginsOk) {
      score += 100;
      report.push({ id: 1, desc: `Márgenes de página (${config.marginDesc})`, pts: 100, status: "Correcto", hint: "Márgenes configurados correctamente." });
    } else {
      report.push({
        id: 1, desc: `Márgenes de página (${config.marginDesc})`, pts: 100, status: "Fallo",
        hint: `Se detectaron márgenes incorrectos (Top: ${top}, Bottom: ${bottom}, Left: ${left}, Right: ${right} en dxa). Configura márgenes de ${isHomework ? '2.0 cm y 2.5 cm' : '2.2 cm y 2.8 cm'} en la pestaña de Disposición.`
      });
    }

    // 2. Estilo del Título (100 pts)
    const hasHeading1 = paragraphs.some(p => {
      const style = C.getParagraphStyle(p);
      return C.isHeading1Style(style);
    });

    if (hasHeading1) {
      score += 100;
      report.push({ id: 2, desc: "Estilo del Título Principal (Título 1)", pts: 100, status: "Correcto", hint: "El título principal está configurado como Título 1." });
    } else {
      report.push({ id: 2, desc: "Estilo del Título Principal (Título 1)", pts: 100, status: "Fallo", hint: "No se encontró ningún párrafo con el estilo 'Título 1' (Heading1) aplicado." });
    }

    // 3. Fuente del Documento (100 pts)
    const unapproved = C.hasUnapprovedFonts(docObj, ['Arial', 'Calibri']);
    if (!unapproved) {
      score += 100;
      report.push({ id: 3, desc: "Tipografías permitidas (Arial / Calibri)", pts: 100, status: "Correcto", hint: "Uso exclusivo de fuentes permitidas." });
    } else {
      report.push({ id: 3, desc: "Tipografías permitidas (Arial / Calibri)", pts: 100, status: "Fallo", hint: "Se encontraron tipografías no permitidas (ej. Courier New, Times New Roman). Cambia la fuente del texto." });
    }

    // 4. Tamaño del Título (100 pts)
    const stylesObj = await C.getXmlAsObject(zip, 'word/styles.xml');
    const heading1Para = paragraphs.find(p => {
      const style = C.getParagraphStyle(p);
      return C.isHeading1Style(style);
    });

    let heading1Size = heading1Para ? C.getParagraphFontSize(heading1Para) : null;
    if (heading1Size === null && heading1Para) {
      const styleId = C.getParagraphStyle(heading1Para);
      if (styleId) {
        heading1Size = C.getStyleFontSize(stylesObj, styleId);
      }
    }

    const sizeOk = heading1Size === 48 || (heading1Para && heading1Size === null);

    if (sizeOk) {
      score += 100;
      report.push({ id: 4, desc: "Tamaño de Fuente del Título (24 pt / 48)", pts: 100, status: "Correcto", hint: "El tamaño del título es de 24 pt." });
    } else {
      report.push({ id: 4, desc: "Tamaño de Fuente del Título (24 pt / 48)", pts: 100, status: "Fallo", hint: `El tamaño del título es incorrecto (${heading1Size ? heading1Size / 2 : 'No definido'} pt). Debe ser 24 pt.` });
    }

    // Filtrar párrafos de cuerpo
    const bodyParas = paragraphs.filter(p => {
      const text = C.getParagraphText(p).trim();
      const style = C.getParagraphStyle(p);
      const isTitle = C.isHeading1Style(style);
      const isList = C.isListParagraph(p);
      return text.length > 0 && !isTitle && !isList;
    });

    // 5. Alineación Justificada (100 pts)
    const allJustified = bodyParas.length > 0 && bodyParas.every(p => C.getParagraphAlignment(p) === 'both');
    if (allJustified) {
      score += 100;
      report.push({ id: 5, desc: "Alineación Justificada del Cuerpo", pts: 100, status: "Correcto", hint: "Todos los párrafos del cuerpo están justificados." });
    } else {
      report.push({ id: 5, desc: "Alineación Justificada del Cuerpo", pts: 100, status: "Fallo", hint: "Uno o más párrafos del cuerpo no están justificados. Selecciona el texto y justifica." });
    }

    // 6. Espaciado Interlineal (100 pts)
    const spacingOk = bodyParas.length > 0 && bodyParas.every(p => {
      const spacing = C.getParagraphSpacing(p);
      const line = spacing ? parseInt(spacing.line, 10) : 0;
      return line >= 270 && line <= 280;
    });

    if (spacingOk) {
      score += 100;
      report.push({ id: 6, desc: "Espaciado Interlineal de 1.15 líneas (276)", pts: 100, status: "Correcto", hint: "El interlineado del cuerpo es de 1.15." });
    } else {
      report.push({ id: 6, desc: "Espaciado Interlineal de 1.15 líneas (276)", pts: 100, status: "Fallo", hint: "El interlineado del cuerpo no es de 1.15 líneas. Configúralo en la pestaña Inicio > Párrafo." });
    }

    // 7. Eliminación de Dobles Espacios (100 pts)
    const hasDouble = paragraphs.some(p => {
      const text = C.getParagraphText(p);
      return text.includes("  ");
    });

    if (!hasDouble) {
      score += 100;
      report.push({ id: 7, desc: "Limpieza de Dobles Espacios", pts: 100, status: "Correcto", hint: "No hay dobles espacios consecutivos en el documento." });
    } else {
      report.push({ id: 7, desc: "Limpieza de Dobles Espacios", pts: 100, status: "Fallo", hint: "Se detectaron dobles espacios consecutivos. Utiliza la función Buscar y Reemplazar para eliminarlos." });
    }

    // 8. Viñetas Estándar (100 pts)
    const listParasCount = paragraphs.filter(p => C.isListParagraph(p)).length;
    const noManualDashes = paragraphs.every(p => {
      const text = C.getParagraphText(p).trim();
      return !text.startsWith('- ') && !text.startsWith('* ');
    });

    if (listParasCount >= 5 && noManualDashes) {
      score += 100;
      report.push({ id: 8, desc: "Uso de Viñetas Estructuradas", pts: 100, status: "Correcto", hint: "Lista con viñetas estructuradas correctamente." });
    } else {
      report.push({
        id: 8, desc: "Uso de Viñetas Estructuradas", pts: 100, status: "Fallo",
        hint: "Debes usar la función de Viñetas de Word en la sección de características (no guiones '-' manuales)."
      });
    }

    // 9. Negritas en palabras clave (100 pts)
    let allBoldPhrases = [];
    paragraphs.forEach(p => {
      const boldPhrases = C.getParagraphBoldText(p);
      allBoldPhrases = allBoldPhrases.concat(boldPhrases.map(t => t.toLowerCase()));
    });

    const hasK1Bold = allBoldPhrases.some(phrase => phrase.replace(/\s+/g, ' ').includes(config.keywords[0]));
    const hasK2Bold = allBoldPhrases.some(phrase => phrase.replace(/\s+/g, ' ').includes(config.keywords[1]));
    const hasK3Bold = allBoldPhrases.some(phrase => phrase.replace(/\s+/g, ' ').includes(config.keywords[2]));
    const boldOk = hasK1Bold && hasK2Bold && hasK3Bold;

    if (boldOk) {
      score += 100;
      report.push({ id: 9, desc: `Negritas en palabras clave (${config.keywords.join(", ")})`, pts: 100, status: "Correcto", hint: "Palabras clave destacadas correctamente." });
    } else {
      report.push({ id: 9, desc: `Negritas en palabras clave (${config.keywords.join(", ")})`, pts: 100, status: "Fallo", hint: `Asegúrate de aplicar negrita a las palabras clave: '${config.keywords.join("', '")}'.` });
    }

    // 10. Pie de Página (100 pts)
    const footerText = await C.getAllFootersText(zip);
    const normalizedFooter = footerText.replace(/\s+/g, ' ').toLowerCase();
    const footerOk = normalizedFooter.includes(config.footerText);

    if (footerOk) {
      score += 100;
      report.push({ id: 10, desc: "Configuración del Pie de Página", pts: 100, status: "Correcto", hint: "Pie de página configurado correctamente." });
    } else {
      report.push({ id: 10, desc: "Configuración del Pie de Página", pts: 100, status: "Fallo", hint: "No se encontró el pie de página con el texto exacto del boletín." });
    }

    return { score, report };
  }

  return { validarDocumento };
})();
