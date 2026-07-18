/**
 * validador-caso-02.js — Validador del Caso 02: Recetario de Nutrición
 * Port exacto de 01_Nivel_Basico/Caso_02_Recetario_Nutricion/validar_caso.js
 */
const ValidadorCaso02 = (function () {
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
      topMin: isHomework ? 1010 : 1124,
      topMax: isHomework ? 1030 : 1144,
      leftMin: isHomework ? 1237 : 1407,
      leftMax: isHomework ? 1257 : 1427,
      marginDesc: isHomework ? "Sup/Inf 1.8cm, Izq/Der 2.2cm" : "Sup/Inf 2.0cm, Izq/Der 2.5cm",

      paperWidth: isHomework ? 11906 : 12240,
      paperHeight: isHomework ? 16838 : 15840,
      paperName: isHomework ? "A4" : "Carta",

      titleKeyword: isHomework ? "tarta de manzana" : "patatas rellenas",
      titleTextExact: isHomework ? "TARTA DE MANZANA CASERA" : "PATATAS RELLENAS DE CARNE",

      boldWords: isHomework ? ["tarta", "manzana", "masa"] : ["patatas", "relleno", "carne"],
      italicWords: isHomework ? ["azúcar", "canela", "mantequilla"] : ["cebolla", "pimienta", "queso"],

      headersSubrayado: isHomework ? ["ingredientes", "cómo preparar"] : ["ingredientes", "cómo hacer"],
      strikeWord: isHomework ? "margarina" : "cerdo",

      headerColorHex: isHomework ? "E65100" : "2E7D32",
      headerColorDesc: isHomework ? "Naranja oscuro (#E65100)" : "Verde oscuro (#2E7D32)",

      boundaryStart: "ingredientes",
      boundaryEnd: isHomework ? "cómo preparar" : "cómo hacer",
      minBullets: 8,
      minNumbered: 6,

      spaceBeforeDxa: isHomework ? 160 : 120,
      spaceAfterDxa: isHomework ? 320 : 240,
      spaceDesc: isHomework ? "8pt antes, 16pt después" : "6pt antes, 12pt después",

      sigKeyword: isHomework ? "horneada por" : "elaborada por"
    };

    // 1. Márgenes Personalizados (100 pts)
    var margins = C.getMargins(docObj);
    var top = margins ? parseInt(margins.top, 10) : 0;
    var bottom = margins ? parseInt(margins.bottom, 10) : 0;
    var left = margins ? parseInt(margins.left, 10) : 0;
    var right = margins ? parseInt(margins.right, 10) : 0;

    var marginsOk = margins &&
      (top >= config.topMin && top <= config.topMax) &&
      (bottom >= config.topMin && bottom <= config.topMax) &&
      (left >= config.leftMin && left <= config.leftMax) &&
      (right >= config.leftMin && right <= config.leftMax);

    if (marginsOk) {
      score += 100;
      report.push({ id: 1, desc: "Márgenes personalizados (" + config.marginDesc + ")", pts: 100, status: "Correcto", hint: "Márgenes configurados correctamente." });
    } else {
      report.push({
        id: 1, desc: "Márgenes personalizados (" + config.marginDesc + ")", pts: 100, status: "Fallo",
        hint: "Se detectaron márgenes incorrectos (Top: " + top + ", Bottom: " + bottom + ", Left: " + left + ", Right: " + right + " en dxa). Configura márgenes de " + (isHomework ? '1.8 cm y 2.2 cm' : '2.0 cm y 2.5 cm') + " en Disposición > Márgenes personalizados."
      });
    }

    // 2. Tamaño de hoja y Fuente General (100 pts)
    var body = docObj['w:document']?.['w:body'] || docObj['document']?.['body'];
    var sectPr = body?.['w:sectPr'] || body?.['sectPr'];
    var pgSz = sectPr?.['w:pgSz'] || sectPr?.['pgSz'];
    var width = pgSz ? parseInt(pgSz['w:w'] || pgSz['w'], 10) : 0;
    var height = pgSz ? parseInt(pgSz['w:h'] || pgSz['h'], 10) : 0;

    var sizeOk = pgSz && (Math.abs(width - config.paperWidth) <= 20) && (Math.abs(height - config.paperHeight) <= 20);
    var unapproved = C.hasUnapprovedFonts(docObj, ['Arial', 'Calibri']);
    var sizeAndFontOk = sizeOk && !unapproved;

    if (sizeAndFontOk) {
      score += 100;
      report.push({ id: 2, desc: "Tamaño de papel " + config.paperName + " y tipografía Arial / Calibri", pts: 100, status: "Correcto", hint: "Tamaño de hoja " + config.paperName + " y fuente general configurados correctamente." });
    } else {
      report.push({
        id: 2, desc: "Tamaño de papel " + config.paperName + " y tipografía Arial / Calibri", pts: 100, status: "Fallo",
        hint: "Se detectaron errores. Tamaño: " + width + "x" + height + " dxa (esperado " + config.paperName + "). Tipografías no permitidas: " + (unapproved ? 'Sí' : 'No') + ". Configura la página como " + config.paperName + " y aplica la fuente Arial o Calibri."
      });
    }

    // Identificar el párrafo del título principal
    var titleParaIdx = -1;
    for (var i = 0; i < paragraphs.length; i++) {
      var txt = C.getParagraphText(paragraphs[i]).toLowerCase();
      if (txt.indexOf(config.titleKeyword) !== -1) { titleParaIdx = i; break; }
    }
    var titlePara = titleParaIdx !== -1 ? paragraphs[titleParaIdx] : null;
    var titleText = titlePara ? C.getParagraphText(titlePara).trim() : "";

    // 3. Título principal (MAYÚSCULAS, Centrado, Arial 20pt Negrita) (100 pts)
    var isUpper = titleText.length > 0 && titleText === titleText.toUpperCase();
    var titleAlign = titlePara ? C.getParagraphAlignment(titlePara) : null;
    var titleSize = titlePara ? C.getParagraphFontSize(titlePara) : null;
    var titleBoldText = titlePara ? C.getParagraphBoldText(titlePara) : [];
    var titleBold = titlePara ? titleBoldText.join("").trim().length > 0 : false;
    var titleOk = isUpper && titleAlign === 'center' && titleSize === 40 && titleBold;

    if (titleOk) {
      score += 100;
      report.push({ id: 3, desc: "Título principal (MAYÚSCULAS, Centrado, Arial 20pt Negrita)", pts: 100, status: "Correcto", hint: "El título principal está configurado correctamente." });
    } else {
      report.push({
        id: 3, desc: "Título principal (MAYÚSCULAS, Centrado, Arial 20pt Negrita)", pts: 100, status: "Fallo",
        hint: "Se detectaron errores en el título principal. Centrado: " + (titleAlign === 'center' ? 'Sí' : 'No') + ". Mayúsculas: " + (isUpper ? 'Sí' : 'No') + ". Tamaño: " + (titleSize ? titleSize / 2 : 'No definido') + " pt (debe ser 20 pt). Negrita: " + (titleBold ? 'Sí' : 'No') + "."
      });
    }

    // 4. Negrita y Cursiva (100 pts)
    var allBoldPhrases = [];
    var allItalicPhrases = [];
    paragraphs.forEach(function (p) {
      var bold = C.getParagraphBoldText(p).map(function (t) { return t.replace(/\s+/g, ' ').toLowerCase(); });
      var italic = C.getParagraphItalicText(p).map(function (t) { return t.replace(/\s+/g, ' ').toLowerCase(); });
      allBoldPhrases = allBoldPhrases.concat(bold);
      allItalicPhrases = allItalicPhrases.concat(italic);
    });

    var hasBoldKeywords = allBoldPhrases.some(function (p) { return p.indexOf(config.boldWords[0]) !== -1; }) &&
                          allBoldPhrases.some(function (p) { return p.indexOf(config.boldWords[1]) !== -1; }) &&
                          allBoldPhrases.some(function (p) { return p.indexOf(config.boldWords[2]) !== -1; });

    var hasItalicKeywords = allItalicPhrases.some(function (p) { return p.indexOf(config.italicWords[0]) !== -1; }) &&
                            allItalicPhrases.some(function (p) { return p.indexOf(config.italicWords[1]) !== -1; }) &&
                            allItalicPhrases.some(function (p) { return p.indexOf(config.italicWords[2]) !== -1; });

    if (hasBoldKeywords && hasItalicKeywords) {
      score += 100;
      report.push({ id: 4, desc: "Negrita y Cursiva en palabras clave", pts: 100, status: "Correcto", hint: "Formatos de negrita y cursiva aplicados correctamente." });
    } else {
      report.push({
        id: 4, desc: "Negrita y Cursiva en palabras clave", pts: 100, status: "Fallo",
        hint: "Asegúrate de aplicar negrita a ('" + config.boldWords.join("', '") + "') y cursiva a ('" + config.italicWords.join("', '") + "') en el texto."
      });
    }

    // 5. Subrayado y Tachado (100 pts)
    var allUnderlinedPhrases = [];
    var allStrikePhrases = [];
    paragraphs.forEach(function (p) {
      var u = C.getParagraphUnderlinedText(p).map(function (t) { return t.replace(/\s+/g, ' ').toLowerCase(); });
      var s = C.getParagraphStrikeText(p).map(function (t) { return t.replace(/\s+/g, ' ').toLowerCase(); });
      allUnderlinedPhrases = allUnderlinedPhrases.concat(u);
      allStrikePhrases = allStrikePhrases.concat(s);
    });

    var hasUnderlinedHeaders = allUnderlinedPhrases.some(function (p) { return p.indexOf(config.headersSubrayado[0]) !== -1; }) &&
                               allUnderlinedPhrases.some(function (p) { return p.indexOf(config.headersSubrayado[1]) !== -1; });

    var hasStrikeKeywords = allStrikePhrases.some(function (p) { return p.indexOf(config.strikeWord) !== -1; });

    if (hasUnderlinedHeaders && hasStrikeKeywords) {
      score += 100;
      report.push({ id: 5, desc: "Subrayado en títulos de sección y Tachado en '" + config.strikeWord + "'", pts: 100, status: "Correcto", hint: "Subrayados y tachados configurados correctamente." });
    } else {
      report.push({
        id: 5, desc: "Subrayado en títulos de sección y Tachado en '" + config.strikeWord + "'", pts: 100, status: "Fallo",
        hint: "Asegúrate de subrayar los títulos de sección ('Ingredientes', '" + (isHomework ? 'Cómo preparar...' : 'Cómo hacer...') + "') y aplicar tachado a la palabra '" + config.strikeWord + "' en los ingredientes."
      });
    }

    // 6. Color de Fuente en Títulos de Sección (100 pts)
    var headerParas = paragraphs.filter(function (p) {
      var text = C.getParagraphText(p).trim().toLowerCase();
      return text === "ingredientes" || text.indexOf(config.boundaryEnd) !== -1;
    });

    var colorOk = headerParas.length >= 2 && headerParas.every(function (p) {
      var colors = C.getParagraphColors(p);
      return colors.some(function (c) { return c === config.headerColorHex || c.indexOf(config.headerColorHex.substring(0, 5)) === 0; });
    });

    if (colorOk) {
      score += 100;
      report.push({ id: 6, desc: "Color de fuente " + config.headerColorDesc + " en títulos de sección", pts: 100, status: "Correcto", hint: "Títulos de sección configurados en color correcto." });
    } else {
      report.push({ id: 6, desc: "Color de fuente " + config.headerColorDesc + " en títulos de sección", pts: 100, status: "Fallo", hint: "Aplica el color " + config.headerColorDesc + " a los títulos de sección." });
    }

    // Identificar secciones de listas
    var ingredientsStartIdx = -1;
    var prepStartIdx = -1;
    for (var ii = 0; ii < paragraphs.length; ii++) {
      var txt = C.getParagraphText(paragraphs[ii]).toLowerCase();
      if (txt.indexOf(config.boundaryStart) !== -1) ingredientsStartIdx = ii;
      if (txt.indexOf(config.boundaryEnd) !== -1) prepStartIdx = ii;
    }

    // 7. Viñetas Estructuradas en Ingredientes (100 pts)
    var ingredientsSection = paragraphs.slice(ingredientsStartIdx + 1, prepStartIdx);
    var bulletParas = ingredientsSection.filter(function (p) { return C.isListParagraph(p); });

    var noManualDashes = ingredientsSection.every(function (p) {
      var text = C.getParagraphText(p).trim();
      return text.indexOf('- ') !== 0 && text.indexOf('* ') !== 0 && text.indexOf('▪ ') !== 0;
    });

    var bulletsOk = bulletParas.length >= config.minBullets && noManualDashes;

    if (bulletsOk) {
      score += 100;
      report.push({ id: 7, desc: "Uso de Viñetas Estructuradas en Ingredientes", pts: 100, status: "Correcto", hint: "Lista de ingredientes estructurada con viñetas de Word." });
    } else {
      report.push({
        id: 7, desc: "Uso de Viñetas Estructuradas en Ingredientes", pts: 100, status: "Fallo",
        hint: "La lista de ingredientes debe usar las viñetas automáticas de Word (mínimo " + config.minBullets + " elementos, elimina guiones manuales)."
      });
    }

    // 8. Lista Numerada Automática en Preparación (100 pts)
    var prepSection = paragraphs.slice(prepStartIdx + 1);
    var prepNumberedParas = prepSection.filter(function (p) { return C.isListParagraph(p); });

    var noManualNumbers = prepSection.every(function (p) {
      var text = C.getParagraphText(p).trim();
      return !/^\d+\.\s/.test(text);
    });

    var prepOk = prepNumberedParas.length >= config.minNumbered && noManualNumbers;

    if (prepOk) {
      score += 100;
      report.push({ id: 8, desc: "Uso de Lista Numerada Automática en Preparación", pts: 100, status: "Correcto", hint: "Los pasos de preparación utilizan numeración automática de Word." });
    } else {
      report.push({
        id: 8, desc: "Uso de Lista Numerada Automática en Preparación", pts: 100, status: "Fallo",
        hint: "La sección de preparación debe usar la numeración automática de Word (mínimo " + config.minNumbered + " pasos, elimina números manuales)."
      });
    }

    // 9. Espaciado de Párrafos (Antes/Después) (100 pts)
    var bodyTextParas = paragraphs.filter(function (p) {
      var text = C.getParagraphText(p).trim();
      var style = C.getParagraphStyle(p);
      var isList = C.isListParagraph(p);
      var align = C.getParagraphAlignment(p);

      var isTitle = text.toLowerCase().indexOf(config.titleKeyword) !== -1 || (style && style.toLowerCase().indexOf("title") !== -1);
      var isHeader = text.toLowerCase().indexOf(config.boundaryStart) !== -1 || text.toLowerCase().indexOf(config.boundaryEnd) !== -1;
      var isSig = text.toLowerCase().indexOf("elaborada por") !== -1 || text.toLowerCase().indexOf("elaborado por") !== -1 || text.toLowerCase().indexOf("horneada por") !== -1 || text.toLowerCase().indexOf("horneado por") !== -1 || align === 'right';

      return text.length > 0 && !isTitle && !isHeader && !isSig && !isList;
    });

    var spacingOk = bodyTextParas.length > 0 && bodyTextParas.every(function (p) {
      var sp = C.getParagraphSpacing(p);
      var before = sp ? parseInt(sp.before, 10) : 0;
      var after = sp ? parseInt(sp.after, 10) : 0;
      return before === config.spaceBeforeDxa && after === config.spaceAfterDxa;
    });

    if (spacingOk) {
      score += 100;
      report.push({ id: 9, desc: "Espaciado de párrafos (" + config.spaceDesc + ")", pts: 100, status: "Correcto", hint: "Espaciados de párrafos configurados correctamente." });
    } else {
      report.push({
        id: 9, desc: "Espaciado de párrafos (" + config.spaceDesc + ")", pts: 100, status: "Fallo",
        hint: "Configura el espaciado en todos los párrafos de texto (excluyendo títulos y listas) a: " + config.spaceDesc + "."
      });
    }

    // 10. Firma del Chef (Alineación Derecha, Arial Negrita) (100 pts)
    var sigPara = null;
    for (var si = 0; si < paragraphs.length; si++) {
      var st = C.getParagraphText(paragraphs[si]).toLowerCase();
      if (st.indexOf(config.sigKeyword) !== -1) { sigPara = paragraphs[si]; break; }
    }

    var sigAlign = sigPara ? C.getParagraphAlignment(sigPara) : null;
    var sigBoldArr = sigPara ? C.getParagraphBoldText(sigPara) : [];
    var sigBold = sigPara ? sigBoldArr.join("").trim().length > 0 : false;
    var sigOk = sigAlign === 'right' && sigBold;

    if (sigOk) {
      score += 100;
      report.push({ id: 10, desc: "Firma del Chef (Alineación Derecha, Arial Negrita)", pts: 100, status: "Correcto", hint: "Firma del chef configurada correctamente con alineación derecha y negrita." });
    } else {
      report.push({
        id: 10, desc: "Firma del Chef (Alineación Derecha, Arial Negrita)", pts: 100, status: "Fallo",
        hint: "Se detectaron errores en la firma. Alineación derecha: " + (sigAlign === 'right' ? 'Sí' : 'No') + ". Negrita: " + (sigBold ? 'Sí' : 'No') + "."
      });
    }

    return { score, report };
  }

  return { validarDocumento };
})();
