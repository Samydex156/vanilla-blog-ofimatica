/**
 * validador-caso-05.js — Validador del Caso 05: Artículo Periodístico
 * Port exacto de 02_Nivel_Intermedio/Caso_05_Articulo_Periodistico/validar_caso.js
 */
const ValidadorCaso05 = (function () {
  'use strict';

  const C = WordCore;

  async function validarDocumento(zip, isHomework) {
    const report = [];
    let score = 0;

    const xmlText = await zip.file("word/document.xml").async("string");
    const docObj = await C.getXmlAsObject(zip, 'word/document.xml');
    if (!docObj) {
      throw new Error("No se pudo leer la estructura del documento.");
    }

    const paragraphs = C.getParagraphs(docObj);

    const config = {
      paperWidth: 12240,
      paperHeight: 18720,
      marginVal: isHomework ? 680 : 567,
      marginName: isHomework ? "1.2 cm" : "1.0 cm",
      titleSize: isHomework ? 72 : 96,
      titleText: isHomework ? "avances en inteligencia artificial" : "la economía global ha sido muy volátil",
      subtitleSize: isHomework ? 24 : 28,
      dropCapCount: isHomework ? 2 : 3
    };

    const isMarginNear = function (val, target) {
      return Math.abs(parseInt(val, 10) - target) <= 10;
    };

    // 1. Tamaño de página Oficio (100 pts)
    var body = docObj?.['w:document']?.['w:body'] || docObj?.['document']?.['body'];
    var sectPr = body?.['w:sectPr'] || body?.['sectPr'];
    var pgSz = sectPr?.['w:pgSz'] || sectPr?.['pgSz'];
    var width = pgSz ? parseInt(pgSz['w:w'] || pgSz['w'] || '0', 10) : 0;
    var height = pgSz ? parseInt(pgSz['w:h'] || pgSz['h'] || '0', 10) : 0;

    var paperOk = Math.abs(width - config.paperWidth) <= 50 && Math.abs(height - config.paperHeight) <= 50;

    if (paperOk) {
      score += 100;
      report.push({ id: 1, desc: "Tamaño de página Oficio (Bolivia)", pts: 100, status: "Correcto", hint: "Página configurada en formato Oficio." });
    } else {
      report.push({
        id: 1, desc: "Tamaño de página Oficio (Bolivia)", pts: 100, status: "Fallo",
        hint: "Tamaño de papel incorrecto (" + width + "x" + height + " dxa). Debe ser Oficio (21.59 x 33.02 cm / 12240x18720 dxa)."
      });
    }

    // 2. Márgenes de página (100 pts)
    var margins = C.getMargins(docObj);
    var top = margins ? parseInt(margins.top, 10) : 0;
    var bottom = margins ? parseInt(margins.bottom, 10) : 0;
    var left = margins ? parseInt(margins.left, 10) : 0;
    var right = margins ? parseInt(margins.right, 10) : 0;

    var marginsOk = margins &&
      isMarginNear(top, config.marginVal) &&
      isMarginNear(bottom, config.marginVal) &&
      isMarginNear(left, config.marginVal) &&
      isMarginNear(right, config.marginVal);

    if (marginsOk) {
      score += 100;
      report.push({ id: 2, desc: "Márgenes de página (" + config.marginName + ")", pts: 100, status: "Correcto", hint: "Márgenes establecidos en " + config.marginName + "." });
    } else {
      report.push({
        id: 2, desc: "Márgenes de página (" + config.marginName + ")", pts: 100, status: "Fallo",
        hint: "Márgenes incorrectos (Top: " + top + ", Left: " + left + " dxa). Configura márgenes de " + config.marginName + " en todos los lados."
      });
    }

    // 3. Título Principal (100 pts)
    var p1 = paragraphs[0];
    var p1Text = C.getParagraphText(p1).toLowerCase();
    var p1Size = C.getParagraphFontSize(p1);
    var titleOk = p1Text.indexOf(config.titleText) !== -1 && p1Size === config.titleSize;

    if (titleOk) {
      score += 100;
      report.push({ id: 3, desc: "Título Principal Destacado (" + (config.titleSize / 2) + " pt)", pts: 100, status: "Correcto", hint: "El título principal tiene el formato correcto." });
    } else {
      report.push({
        id: 3, desc: "Título Principal Destacado (" + (config.titleSize / 2) + " pt)", pts: 100, status: "Fallo",
        hint: "El título principal debe tener un tamaño de " + (config.titleSize / 2) + " pt (Valor XML: " + p1Size + ")."
      });
    }

    // 4. Subtítulo o Copete Editorial (100 pts)
    var p2 = paragraphs[1];
    var p2Size = C.getParagraphFontSize(p2);
    var p2Spacing = C.getParagraphSpacing(p2);
    var p2Line = p2Spacing ? parseInt(p2Spacing.line, 10) : 0;
    var subtitleOk = p2Size === config.subtitleSize && (p2Line >= 240 && p2Line <= 280);

    if (subtitleOk) {
      score += 100;
      report.push({ id: 4, desc: "Subtítulo o Copete Editorial (" + (config.subtitleSize / 2) + " pt, 1.15 interlineado)", pts: 100, status: "Correcto", hint: "El subtítulo está correctamente configurado." });
    } else {
      report.push({
        id: 4, desc: "Subtítulo o Copete Editorial (" + (config.subtitleSize / 2) + " pt, 1.15 interlineado)", pts: 100, status: "Fallo",
        hint: "El subtítulo debe tener un tamaño de " + (config.subtitleSize / 2) + " pt e interlineado de 1.15 líneas."
      });
    }

    // 5. Diseño de Cuerpo en 3 Columnas (100 pts)
    var has3Cols = /<w:cols[^>]+w:num="3"[^>]*>/.test(xmlText) || /<w:cols[^>]+num="3"[^>]*>/.test(xmlText);
    var hasSep = /w:sep="1"/.test(xmlText);
    var colsOk = has3Cols && hasSep;

    if (colsOk) {
      score += 100;
      report.push({ id: 5, desc: "Diseño de Cuerpo en 3 Columnas con Separador", pts: 100, status: "Correcto", hint: "El cuerpo está estructurado en 3 columnas con línea divisoria." });
    } else {
      report.push({
        id: 5, desc: "Diseño de Cuerpo en 3 Columnas con Separador", pts: 100, status: "Fallo",
        hint: "Configura el cuerpo en 3 columnas y activa la opción 'Línea entre columnas' en Disposición > Columnas."
      });
    }

    // 6. Alineación Justificada del Cuerpo (100 pts)
    var bodyParas = paragraphs.filter(function (p, index) {
      var text = C.getParagraphText(p).trim();
      if (index <= 1 || text.length === 0) return false;
      var isHeading = text === text.toUpperCase() && text.length < 50;
      return !isHeading;
    });

    var allJustified = bodyParas.length > 0 && bodyParas.every(function (p) { return C.getParagraphAlignment(p) === 'both'; });

    if (allJustified) {
      score += 100;
      report.push({ id: 6, desc: "Alineación Justificada del Cuerpo", pts: 100, status: "Correcto", hint: "Los párrafos de las columnas están justificados." });
    } else {
      report.push({
        id: 6, desc: "Alineación Justificada del Cuerpo", pts: 100, status: "Fallo",
        hint: "Uno o más párrafos del cuerpo del artículo no están justificados. Selecciona el texto y justifica."
      });
    }

    // 7. Letras Capitales (Drop Caps) (100 pts)
    var dropCapCount = 0;
    paragraphs.forEach(function (p) {
      var framePr = p['w:pPr']?.['w:framePr'] || p['pPr']?.['framePr'];
      var dropCap = framePr?.['w:dropCap'] || framePr?.['dropCap'];
      if (dropCap === 'drop') {
        dropCapCount++;
      }
    });

    var dropCapsOk = dropCapCount >= config.dropCapCount;

    if (dropCapsOk) {
      score += 100;
      report.push({ id: 7, desc: "Letras Capitales (Drop Caps) de 3 líneas", pts: 100, status: "Correcto", hint: "Se detectaron " + dropCapCount + " letras capitales insertadas." });
    } else {
      report.push({
        id: 7, desc: "Letras Capitales (Drop Caps) de 3 líneas", pts: 100, status: "Fallo",
        hint: "Debes insertar al menos " + config.dropCapCount + " letras capitales al inicio de las secciones del artículo."
      });
    }

    // 8. Subtítulos de Sección en Negrita (100 pts)
    var sectionKeywords = isHomework
      ? ["resurgir", "revolución", "desafío", "unión"]
      : ["pandemia", "guerra", "cambio", "política"];

    var boldHeadingsCount = 0;
    paragraphs.forEach(function (p) {
      var text = C.getParagraphText(p).toLowerCase();
      var isHeading = sectionKeywords.some(function (keyword) { return text.indexOf(keyword) !== -1; }) && text.length < 50;
      if (isHeading) {
        var boldText = C.getParagraphBoldText(p);
        var isCentered = C.getParagraphAlignment(p) === 'center';
        if (boldText.length > 0 && isCentered) {
          boldHeadingsCount++;
        }
      }
    });

    var headingsOk = boldHeadingsCount >= 2;

    if (headingsOk) {
      score += 100;
      report.push({ id: 8, desc: "Subtítulos de Sección en Negrita y Centrados", pts: 100, status: "Correcto", hint: "Los subtítulos secundarios están en negrita y centrados." });
    } else {
      report.push({
        id: 8, desc: "Subtítulos de Sección en Negrita y Centrados", pts: 100, status: "Fallo",
        hint: "Los subtítulos secundarios de sección deben estar en Negrita y alineados al Centro."
      });
    }

    // 9. Forma Flotante con Ajuste Cuadrado (100 pts)
    var hasFloatingShape = xmlText.indexOf("<wp:anchor") !== -1 || xmlText.indexOf("wp:anchor") !== -1;
    var hasSquareWrap = xmlText.indexOf("<wp:wrapSquare") !== -1 || xmlText.indexOf("wp:wrapSquare") !== -1;
    var shapeOk = hasFloatingShape && hasSquareWrap;

    if (shapeOk) {
      score += 100;
      report.push({ id: 9, desc: "Forma con Ajuste de Texto Cuadrado", pts: 100, status: "Correcto", hint: "Forma insertada y configurada con ajuste cuadrado." });
    } else {
      report.push({
        id: 9, desc: "Forma con Ajuste de Texto Cuadrado", pts: 100, status: "Fallo",
        hint: "Inserta una forma y configura su diseño con Ajuste de Texto Cuadrado (para que el texto fluya a su alrededor)."
      });
    }

    // 10. Limpieza de Dobles Espacios (100 pts)
    var hasDouble = paragraphs.some(function (p) {
      var text = C.getParagraphText(p);
      return text.indexOf("  ") !== -1;
    });

    if (!hasDouble) {
      score += 100;
      report.push({ id: 10, desc: "Limpieza de Dobles Espacios", pts: 100, status: "Correcto", hint: "No hay dobles espacios en el documento." });
    } else {
      report.push({ id: 10, desc: "Limpieza de Dobles Espacios", pts: 100, status: "Fallo", hint: "Se detectaron dobles espacios consecutivos. Utiliza la herramienta Buscar y Reemplazar." });
    }

    return { score, report };
  }

  return { validarDocumento };
})();
