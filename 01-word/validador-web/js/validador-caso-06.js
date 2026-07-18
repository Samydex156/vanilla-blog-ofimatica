/**
 * validador-caso-06.js — Validador del Caso 06: Conminatoria Control Social
 * Port exacto de 02_Nivel_Intermedio/Caso_06_Conminatoria_Control_Social/validar_caso.js
 */
const ValidadorCaso06 = (function () {
  'use strict';

  const C = WordCore;

  async function validarDocumento(zip, isHomework) {
    const report = [];
    let score = 0;

    const docObj = await C.getXmlAsObject(zip, 'word/document.xml');
    if (!docObj) {
      throw new Error("No se pudo leer la estructura del documento principal.");
    }

    const paragraphs = C.getParagraphs(docObj);

    var config = {
      paperWidth: 12240,
      paperHeight: 15840,
      marginVal: isHomework ? 1134 : 1417,
      marginName: isHomework ? "2.0 cm (1134 dxa)" : "2.5 cm (1417 dxa)",
      fontName: isHomework ? "Calibri" : "Arial",
      bodyFontSize: isHomework ? 24 : 22,
      metaFontSize: isHomework ? 18 : 16,

      dateIndentMin: isHomework ? 6150 : 5600,
      dateIndentMax: isHomework ? 6300 : 5750,
      dateIndentTarget: isHomework ? "11.0 cm (~6230 dxa)" : "10.0 cm (~5660 dxa)",
      dateKeyword: isHomework ? "Cochabamba" : "La Paz",

      citeIndentLeftMin: isHomework ? 5420 : 4850,
      citeIndentLeftMax: isHomework ? 5620 : 5050,
      citeIndentTarget: isHomework ? "9.75 cm (~5520 dxa)" : "8.75 cm (~4950 dxa)",
      citeKeyword: "CITE:",

      bodyLineSpacingMin: isHomework ? 290 : 270,
      bodyLineSpacingMax: isHomework ? 310 : 285,
      bodySpacingAfterMin: isHomework ? 110 : 150,
      bodySpacingAfterMax: isHomework ? 130 : 170,
      bodySpacingDesc: isHomework ? "Interlineado 1.25, espaciado posterior 6 pt" : "Interlineado 1.15, espaciado posterior 8 pt",

      listKeywords: isHomework ? [
        "ESTADO DE EJECUCIÓN", "ARCHIVO DE ACTAS", "INFORME DE MODIFICACIONES",
        "HISTORIAL DE AUDITORÍAS", "HISTORIAL DE FISCALIZACIÓN",
        "INFORME SOBRE PROYECTOS ESTRUCTURANTES", "REGISTRO DE IMPUGNACIONES"
      ] : [
        "INVENTARIO DE ACTIVOS", "ARCHIVO CENTRAL", "INFORME DE SITUACIÓN",
        "INFORME DE MODIFICACIONES", "INFORME FINANCIAL",
        "HISTORIAL DE ACTAS", "INFORME SOBRE PROYECTOS", "REGISTRO DE OBSERVACIONES"
      ],
      conminoText: "CONMINO",

      recipientName: isHomework ? "Mario Pinto" : "Elena Vargas",
      senderName: isHomework ? "Roxana Valdivia" : "Patricia Medina"
    };

    var isMarginNear = function (val, target) {
      return Math.abs(parseInt(val, 10) - target) <= 15;
    };

    // REQUISITO 1: Tamaño de página Carta (100 pts)
    var bodyXml = docObj?.['w:document']?.['w:body'] || docObj?.['document']?.['body'];
    var sectPr = bodyXml?.['w:sectPr'] || bodyXml?.['sectPr'];
    var pgSz = sectPr?.['w:pgSz'] || sectPr?.['pgSz'];
    var width = pgSz ? parseInt(pgSz['w:w'] || pgSz['w'] || '0', 10) : 0;
    var height = pgSz ? parseInt(pgSz['w:h'] || pgSz['h'] || '0', 10) : 0;

    var paperOk = Math.abs(width - config.paperWidth) <= 50 && Math.abs(height - config.paperHeight) <= 50;

    if (paperOk) {
      score += 100;
      report.push({ id: 1, desc: "Tamaño de página Carta", pts: 100, status: "Correcto", hint: "El documento está configurado en tamaño Carta." });
    } else {
      report.push({
        id: 1, desc: "Tamaño de página Carta", pts: 100, status: "Fallo",
        hint: "Tamaño de papel incorrecto (" + width + "x" + height + " dxa). Debe ser Carta (Letter: 21.59 x 27.94 cm / 12240x15840 dxa)."
      });
    }

    // REQUISITO 2: Márgenes de página (100 pts)
    var margins = C.getMargins(docObj);
    var topMar = margins ? parseInt(margins.top, 10) : 0;
    var bottomMar = margins ? parseInt(margins.bottom, 10) : 0;
    var leftMar = margins ? parseInt(margins.left, 10) : 0;
    var rightMar = margins ? parseInt(margins.right, 10) : 0;

    var marginsOk = margins &&
      isMarginNear(topMar, config.marginVal) &&
      isMarginNear(bottomMar, config.marginVal) &&
      isMarginNear(leftMar, config.marginVal) &&
      isMarginNear(rightMar, config.marginVal);

    if (marginsOk) {
      score += 100;
      report.push({ id: 2, desc: "Márgenes de página (" + config.marginName + ")", pts: 100, status: "Correcto", hint: "Márgenes establecidos correctamente en " + config.marginName + "." });
    } else {
      report.push({
        id: 2, desc: "Márgenes de página (" + config.marginName + ")", pts: 100, status: "Fallo",
        hint: "Márgenes incorrectos. Esperado: " + config.marginName + ". Detectado: Sup/Inf: " + topMar + ", Izq/Der: " + leftMar + " dxa."
      });
    }

    // Helper: find paragraph by text matcher
    var findPara = function (predicate) {
      for (var i = 0; i < paragraphs.length; i++) {
        if (predicate(C.getParagraphText(paragraphs[i]))) return paragraphs[i];
      }
      return null;
    };

    var findParaIdx = function (predicate) {
      for (var i = 0; i < paragraphs.length; i++) {
        if (predicate(C.getParagraphText(paragraphs[i]))) return i;
      }
      return -1;
    };

    // Locate structural paragraphs
    var datePara = findPara(function (t) {
      var txt = t.trim();
      return txt.indexOf("2026") !== -1 && (txt.indexOf("La Paz") !== -1 || txt.indexOf("Cochabamba") !== -1);
    });

    var citePara = findPara(function (t) { return t.trim().indexOf("CITE:") === 0; });
    var refPara = findPara(function (t) { return t.trim().toUpperCase().indexOf("REF.:") === 0; });
    var atentamentePara = findPara(function (t) { return t.trim().toLowerCase().indexOf("atentamente") === 0; });

    var atentamenteIdx = atentamentePara ? paragraphs.indexOf(atentamentePara) : -1;
    var postAtentamenteParas = atentamenteIdx !== -1 ? paragraphs.slice(atentamenteIdx + 1) : [];

    var findInPost = function (pred) {
      for (var i = 0; i < postAtentamenteParas.length; i++) {
        if (pred(C.getParagraphText(postAtentamenteParas[i]))) return postAtentamenteParas[i];
      }
      return null;
    };

    var sigDotsPara = findInPost(function (t) {
      var txt = t.trim();
      return txt.indexOf("……") === 0 || txt.indexOf("___") === 0 || txt.indexOf("…") === 0;
    });
    var sigNamePara = findInPost(function (t) {
      var txt = t.trim().toLowerCase();
      return txt.indexOf(config.senderName.toLowerCase()) !== -1 && txt.indexOf("c.c.") === -1;
    });
    var sigTitlePara = findInPost(function (t) {
      var txt = t.trim().toLowerCase();
      return txt.indexOf("control social") !== -1 || txt.indexOf("coordinadora") !== -1 || txt.indexOf("titular") !== -1;
    });
    var copyParas = postAtentamenteParas.filter(function (p) {
      return C.getParagraphText(p).trim().indexOf("C.c./") === 0;
    });

    // REQUISITO 3: Jerarquía y Unificación de Fuentes (100 pts)
    var docFonts = C.getDocumentFonts(docObj);
    var hasExpectedFont = docFonts.some(function (f) { return f.toLowerCase().indexOf(config.fontName.toLowerCase()) !== -1; });
    var unapproved = C.hasUnapprovedFonts(docObj, [config.fontName]);

    var dateSize = datePara ? C.getParagraphFontSize(datePara) : null;
    var citeSize = citePara ? C.getParagraphFontSize(citePara) : null;
    var refSize = refPara ? C.getParagraphFontSize(refPara) : null;

    var bodyFontSizeOk = dateSize === config.bodyFontSize && (citeSize === config.bodyFontSize || citeSize === null) && refSize === config.bodyFontSize;

    var sigDotsSize = sigDotsPara ? C.getParagraphFontSize(sigDotsPara) : null;
    var sigNameSize = sigNamePara ? C.getParagraphFontSize(sigNamePara) : null;
    var sigTitleSize = sigTitlePara ? C.getParagraphFontSize(sigTitlePara) : null;
    var copiesSizeOk = copyParas.length > 0 && copyParas.every(function (p) { return C.getParagraphFontSize(p) === config.metaFontSize; });

    var sigSizeOk = sigDotsSize === config.metaFontSize && sigNameSize === config.metaFontSize && sigTitleSize === config.metaFontSize;
    var fontHierarchyOk = hasExpectedFont && !unapproved && bodyFontSizeOk && sigSizeOk && copiesSizeOk;

    if (fontHierarchyOk) {
      score += 100;
      report.push({ id: 3, desc: "Jerarquía de Fuentes (" + config.fontName + ")", pts: 100, status: "Correcto", hint: "Fuente " + config.fontName + " configurada correctamente con cuerpo en " + (config.bodyFontSize / 2) + " pt y firmas/copias en " + (config.metaFontSize / 2) + " pt." });
    } else {
      report.push({
        id: 3, desc: "Jerarquía de Fuentes (" + config.fontName + ")", pts: 100, status: "Fallo",
        hint: "Todo el documento debe usar la fuente " + config.fontName + ". Cuerpo debe ser de " + (config.bodyFontSize / 2) + " pt, firmas y copias secundarias de " + (config.metaFontSize / 2) + " pt."
      });
    }

    // REQUISITO 4: Sangría Izquierda de la Fecha (100 pts)
    var datePr = datePara ? (datePara['w:pPr'] || datePara['pPr']) : null;
    var dateInd = datePr?.['w:ind'] || datePr?.['ind'];
    var dateLeftIndent = dateInd ? parseInt(dateInd['w:left'] || dateInd['left'] || '0', 10) : 0;
    var dateAlign = datePara ? (C.getParagraphAlignment(datePara) || 'left') : 'none';

    var dateIndentOk = datePara &&
      dateLeftIndent >= config.dateIndentMin &&
      dateLeftIndent <= config.dateIndentMax &&
      (dateAlign === 'left' || dateAlign === 'both');

    if (dateIndentOk) {
      score += 100;
      report.push({ id: 4, desc: "Sangría Izquierda de Fecha (" + config.dateIndentTarget + ")", pts: 100, status: "Correcto", hint: "La fecha tiene la sangría izquierda y alineación requeridas." });
    } else {
      report.push({
        id: 4, desc: "Sangría Izquierda de Fecha (" + config.dateIndentTarget + ")", pts: 100, status: "Fallo",
        hint: "El párrafo de la fecha debe tener una sangría izquierda de exactamente " + config.dateIndentTarget + " (" + config.dateIndentMin + "-" + config.dateIndentMax + " dxa) y alineación izquierda."
      });
    }

    // REQUISITO 5: Sangría Izquierda y de Primera Línea en CITE (100 pts)
    var citePr = citePara ? (citePara['w:pPr'] || citePara['pPr']) : null;
    var citeInd = citePr?.['w:ind'] || citePr?.['ind'];
    var citeLeftIndent = citeInd ? parseInt(citeInd['w:left'] || citeInd['left'] || '0', 10) : 0;
    var citeFirstLineIndent = citeInd ? parseInt(citeInd['w:firstLine'] || citeInd['firstLine'] || '0', 10) : 0;
    var citeAlign = citePara ? (C.getParagraphAlignment(citePara) || 'left') : 'none';

    var citeIndentOk = citePara &&
      citeLeftIndent >= config.citeIndentLeftMin &&
      citeLeftIndent <= config.citeIndentLeftMax &&
      citeFirstLineIndent >= 650 &&
      citeFirstLineIndent <= 750 &&
      (citeAlign === 'left' || citeAlign === 'both');

    if (citeIndentOk) {
      score += 100;
      report.push({ id: 5, desc: "Sangría Izquierda y de Primera Línea en CITE", pts: 100, status: "Correcto", hint: "El CITE tiene la sangría izquierda de " + config.citeIndentTarget + " y de primera línea de 1.25 cm (710 dxa)." });
    } else {
      report.push({
        id: 5, desc: "Sangría Izquierda y de Primera Línea en CITE", pts: 100, status: "Fallo",
        hint: "El CITE debe tener una sangría izquierda de " + config.citeIndentTarget + " (" + config.citeIndentLeftMin + "-" + config.citeIndentLeftMax + " dxa), y una sangría de primera línea de exactamente 1.25 cm (710 dxa)."
      });
    }

    // REQUISITO 6: Formato del Bloque del Destinatario (100 pts)
    var señoraIdx = findParaIdx(function (t) {
      var txt = t.trim().toLowerCase();
      return txt.indexOf("señora") === 0 || txt.indexOf("señor") === 0;
    });

    var recipientParas = [];
    if (señoraIdx !== -1) {
      for (var ri = señoraIdx; ri < paragraphs.length; ri++) {
        var txt = C.getParagraphText(paragraphs[ri]).trim();
        if (txt.length === 0 || txt.toUpperCase().indexOf("REF.:") === 0 || txt.toUpperCase().indexOf("CITE:") === 0) {
          break;
        }
        recipientParas.push(paragraphs[ri]);
        if (txt.toLowerCase().indexOf("presente") === 0) {
          break;
        }
      }
    }

    var recipientOk = recipientParas.length >= 3;
    if (recipientOk) {
      for (var ri2 = 0; ri2 < recipientParas.length; ri2++) {
        var align = C.getParagraphAlignment(recipientParas[ri2]) || 'left';
        var spacing = C.getParagraphSpacing(recipientParas[ri2]);
        var line = spacing ? parseInt(spacing.line || '240', 10) : 240;
        var after = spacing ? parseInt(spacing.after || '0', 10) : 0;

        if (align !== 'left') recipientOk = false;
        if (line > 250) recipientOk = false;

        if (ri2 === recipientParas.length - 1) {
          if (after < 200 || after > 250) recipientOk = false;
        } else {
          if (after > 40) recipientOk = false;
        }
      }
    }

    if (recipientOk) {
      score += 100;
      report.push({ id: 6, desc: "Formato del Bloque del Destinatario (Interlineado sencillo, 12pt posterior al final)", pts: 100, status: "Correcto", hint: "Bloque del destinatario configurado correctamente." });
    } else {
      report.push({
        id: 6, desc: "Formato del Bloque del Destinatario (Interlineado sencillo, 12pt posterior al final)", pts: 100, status: "Fallo",
        hint: "Las líneas de dirección del destinatario deben estar a la izquierda, con interlineado sencillo, espaciado posterior de 0 pt en intermedias y 12 pt en la última línea."
      });
    }

    // REQUISITO 7: Línea de Referencia Destacada (100 pts)
    var refAlign = refPara ? C.getParagraphAlignment(refPara) : null;
    var refBold = refPara ? C.getParagraphBoldText(refPara) : [];
    var refUnderline = refPara ? C.getParagraphUnderlinedText(refPara) : [];
    var refOk = refPara && refAlign === 'center' && refBold.length > 0 && refUnderline.length > 0;

    if (refOk) {
      score += 100;
      report.push({ id: 7, desc: "Línea de Referencia destacada (Centrada, Negrita, Subrayado)", pts: 100, status: "Correcto", hint: "Línea de referencia correctamente destacada en el centro." });
    } else {
      report.push({
        id: 7, desc: "Línea de Referencia destacada (Centrada, Negrita, Subrayado)", pts: 100, status: "Fallo",
        hint: "La línea de referencia (REF.) debe estar alineada al Centro, con formato Negrita y Subrayado completo."
      });
    }

    // REQUISITO 8: Formato del Cuerpo (Justificación y Espaciados) (100 pts)
    var startIdx = señoraIdx !== -1 ? señoraIdx + recipientParas.length : -1;
    var endIdx = atentamentePara ? paragraphs.indexOf(atentamentePara) : -1;

    var bodyParas = [];
    if (startIdx !== -1 && endIdx !== -1) {
      for (var bi = startIdx; bi < endIdx; bi++) {
        var t = C.getParagraphText(paragraphs[bi]).trim();
        if (paragraphs[bi] === refPara) continue;
        if (t.length > 0) {
          bodyParas.push(paragraphs[bi]);
        }
      }
    }

    var bodyFormattingOk = bodyParas.length > 5;
    for (var bj = 0; bj < bodyParas.length; bj++) {
      var pAlign = C.getParagraphAlignment(bodyParas[bj]);
      var pSpacing = C.getParagraphSpacing(bodyParas[bj]);
      var pLine = pSpacing ? parseInt(pSpacing.line || '240', 10) : 240;
      var pAfter = pSpacing ? parseInt(pSpacing.after || '0', 10) : 0;

      if (pAlign !== 'both') bodyFormattingOk = false;
      if (pLine < config.bodyLineSpacingMin || pLine > config.bodyLineSpacingMax) bodyFormattingOk = false;
      if (pAfter < config.bodySpacingAfterMin || pAfter > config.bodySpacingAfterMax) bodyFormattingOk = false;
    }

    if (bodyFormattingOk) {
      score += 100;
      report.push({ id: 8, desc: "Formato de Párrafos del Cuerpo (" + config.bodySpacingDesc + ")", pts: 100, status: "Correcto", hint: "Alineación justificada y espaciados correctos en el cuerpo." });
    } else {
      report.push({
        id: 8, desc: "Formato de Párrafos del Cuerpo (" + config.bodySpacingDesc + ")", pts: 100, status: "Fallo",
        hint: "Todos los párrafos del cuerpo de la carta deben estar Justificados, con " + config.bodySpacingDesc + "."
      });
    }

    // REQUISITO 9: Negrita en Títulos de Listas y Conminatorias (100 pts)
    var conminoPara = findPara(function (t) { return t.indexOf(config.conminoText) !== -1; });
    var conminoBold = conminoPara ? C.getParagraphBoldText(conminoPara).join("") : "";
    var conminoOk = conminoBold.indexOf(config.conminoText) !== -1;

    var listPrefixesOk = true;
    for (var li = 0; li < config.listKeywords.length; li++) {
      var keyword = config.listKeywords[li];
      var listPara = findPara(function (t) { return t.indexOf(keyword) !== -1; });
      if (!listPara) {
        listPrefixesOk = false;
        break;
      }
      var boldText = C.getParagraphBoldText(listPara).join("");
      var cleanKeyword = keyword.replace(/[()"]/g, "");
      var hasBold = boldText.toLowerCase().indexOf(cleanKeyword.toLowerCase().substring(0, 15)) !== -1;
      if (!hasBold) {
        listPrefixesOk = false;
      }
    }

    var listEmphasisOk = conminoOk && listPrefixesOk;

    if (listEmphasisOk) {
      score += 100;
      report.push({ id: 9, desc: "Negrita en Títulos de Listas y Conminatorias", pts: 100, status: "Correcto", hint: "Títulos de listas y la palabra 'CONMINO' correctamente formateados en negrita." });
    } else {
      report.push({
        id: 9, desc: "Negrita en Títulos de Listas y Conminatorias", pts: 100, status: "Fallo",
        hint: "Asegúrate de que la palabra '" + config.conminoText + "' y los títulos de los requisitos de la lista (ej. '" + config.listKeywords[0] + "') tengan formato de Negrita."
      });
    }

    // REQUISITO 10: Bloque de Firma, Copias y Limpieza de Dobles Espacios (100 pts)
    var dotsAlign = sigDotsPara ? C.getParagraphAlignment(sigDotsPara) : null;
    var nameAlign = sigNamePara ? C.getParagraphAlignment(sigNamePara) : null;
    var titleAlign2 = sigTitlePara ? C.getParagraphAlignment(sigTitlePara) : null;
    var nameBold = sigNamePara ? C.getParagraphBoldText(sigNamePara).join("") : "";
    var sigOk = dotsAlign === 'center' && nameAlign === 'center' && titleAlign2 === 'center' && nameBold.indexOf(config.senderName) !== -1;

    var copiesAlignOk = copyParas.length > 0 && copyParas.every(function (p) {
      var align = C.getParagraphAlignment(p) || 'left';
      return align === 'left';
    });

    var hasDouble = paragraphs.some(function (p) {
      var text = C.getParagraphText(p);
      return text.indexOf("  ") !== -1;
    });

    var finalCheckOk = sigOk && copiesAlignOk && !hasDouble;

    if (finalCheckOk) {
      score += 100;
      report.push({ id: 10, desc: "Firma Centrada, Copias a la Izquierda y Limpieza de Dobles Espacios", pts: 100, status: "Correcto", hint: "Firma y copias secundarias con alineación correcta y cero dobles espacios." });
    } else {
      report.push({
        id: 10, desc: "Firma Centrada, Copias a la Izquierda y Limpieza de Dobles Espacios", pts: 100, status: "Fallo",
        hint: "El bloque de firma debe estar Centrado (con el nombre en Negrita), las líneas de copias (C.c./...) alineadas a la izquierda, y debes eliminar todos los dobles espacios del documento."
      });
    }

    return { score, report };
  }

  return { validarDocumento };
})();
