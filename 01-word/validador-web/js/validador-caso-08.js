let ValidadorCaso08 = {};

(function () {
  'use strict';

  var getXmlAsObject = WordCore.getXmlAsObject;
  var getParagraphText = WordCore.getParagraphText;
  var getParagraphAlignment = WordCore.getParagraphAlignment;
  var getParagraphBoldText = WordCore.getParagraphBoldText;
  var getParagraphFontSize = WordCore.getParagraphFontSize;
  var getParagraphs = WordCore.getParagraphs;
  var getMargins = WordCore.getMargins;
  var getDocumentFonts = WordCore.getDocumentFonts;
  var getTables = WordCore.getTables;
  var getTableRows = WordCore.getTableRows;
  var getTableCells = WordCore.getTableCells;
  var getCellShading = WordCore.getCellShading;
  var getCellBorders = WordCore.getCellBorders;
  var getCellMargins = WordCore.getCellMargins;
  var getCellVerticalAlign = WordCore.getCellVerticalAlign;
  var getCellGridSpan = WordCore.getCellGridSpan;
  var getCellTextDirection = WordCore.getCellTextDirection;
  var getCellVMerge = WordCore.getCellVMerge;
  var getRowHeight = WordCore.getRowHeight;
  var getTableBorders = WordCore.getTableBorders;

  ValidadorCaso08.validarDocumento = async function (zip, isHomework) {
    var report = [];
    var score = 0;

    var docObj = await getXmlAsObject(zip, 'word/document.xml');
    if (!docObj) throw new Error("No se pudo leer la estructura del documento.");

    var tables = getTables(docObj);
    var paragraphs = getParagraphs(docObj);
    var body = docObj['w:document'] ? (docObj['w:document']['w:body'] || docObj['w:document']['body']) : null;

    var config = {
      fontName: "Arial",
      pageWidth: 12242,
      pageHeight: 15842,
      marginTop: 1418,
      marginLeft: 1701,
      marginRight: 1701,
      marginBottom: 1418
    };

    // 1. Tamano Carta (100 pts)
    var sectPr = body ? (body['w:sectPr'] || body['sectPr']) : null;
    var pgSz = sectPr ? (sectPr['w:pgSz'] || sectPr['pgSz']) : null;
    var width = pgSz ? parseInt(pgSz['w:w'] || pgSz['w'] || '0', 10) : 0;
    var height = pgSz ? parseInt(pgSz['w:h'] || pgSz['h'] || '0', 10) : 0;
    var paperOk = Math.abs(width - config.pageWidth) <= 50 && Math.abs(height - config.pageHeight) <= 50;

    if (paperOk) {
      score += 100;
      report.push({ id: 1, desc: "Tamano de pagina Carta", pts: 100, status: "Correcto", hint: "Documento en tamano Carta." });
    } else {
      report.push({ id: 1, desc: "Tamano de pagina Carta", pts: 100, status: "Fallo", hint: "Debe ser Carta (12242x15842 dxa)." });
    }

    // 2. Fuente Arial (100 pts)
    var fonts = getDocumentFonts(docObj);
    var hasArial = fonts.some(function (f) { return f.toLowerCase().includes('arial'); });
    if (hasArial) {
      score += 100;
      report.push({ id: 2, desc: "Fuente Arial uniforme", pts: 100, status: "Correcto", hint: "Fuente Arial detectada." });
    } else {
      report.push({ id: 2, desc: "Fuente Arial uniforme", pts: 100, status: "Fallo", hint: "Usa Arial en todo el documento." });
    }

    // 3. Dos tablas (100 pts)
    if (tables.length >= 2) {
      score += 100;
      report.push({ id: 3, desc: "Dos tablas en el documento", pts: 100, status: "Correcto", hint: tables.length + " tablas detectadas." });
    } else {
      report.push({ id: 3, desc: "Dos tablas en el documento", pts: 100, status: "Fallo", hint: "Debe contener 2 tablas." });
    }

    var planillaTable = tables.length > 1 ? tables[1] : null;
    var itinerarioTable = tables.length > 0 ? tables[0] : null;

    // 4. vMerge y gridSpan en Tabla 1 (100 pts)
    if (itinerarioTable) {
      var rows = getTableRows(itinerarioTable);
      var row2 = rows.length > 1 ? rows[1] : null;
      var row2Cells = row2 ? getTableCells(row2) : [];
      var hasVMerge = false;
      var hasGridSpan = false;
      row2Cells.forEach(function (cell) {
        var vm = getCellVMerge(cell);
        if (vm === 'restart') hasVMerge = true;
        var gs = getCellGridSpan(cell);
        if (gs > 1) hasGridSpan = true;
      });
      if (hasVMerge && hasGridSpan) {
        score += 100;
        report.push({ id: 4, desc: "vMerge y gridSpan en Tabla 1", pts: 100, status: "Correcto", hint: "Combinacion vertical y horizontal detectada." });
      } else {
        report.push({ id: 4, desc: "vMerge y gridSpan en Tabla 1", pts: 100, status: "Fallo", hint: "Aplica vMerge en LUGAR y gridSpan en SALIDA/RETORNO." });
      }
    } else {
      report.push({ id: 4, desc: "vMerge y gridSpan en Tabla 1", pts: 100, status: "Fallo", hint: "No se encontro la tabla de itinerario." });
    }

    // 5. Fila titulo combinada + sombreado (100 pts)
    if (itinerarioTable) {
      var rows = getTableRows(itinerarioTable);
      var row0 = rows.length > 0 ? rows[0] : null;
      var row0Cells = row0 ? getTableCells(row0) : [];
      var firstCell = row0Cells.length > 0 ? row0Cells[0] : null;
      var titleGs = firstCell ? getCellGridSpan(firstCell) : null;
      var titleShading = firstCell ? getCellShading(firstCell) : null;
      var sepRow = rows.length > 2 ? rows[2] : null;
      var sepCells = sepRow ? getTableCells(sepRow) : [];
      var headerShadingOk = sepCells.length > 0 && sepCells.every(function (c) {
        var s = getCellShading(c);
        return s && s.toUpperCase() === 'D1D1D1';
      });
      if (titleGs === 5 && titleShading && titleShading.toUpperCase() === 'D1D1D1' && headerShadingOk) {
        score += 100;
        report.push({ id: 5, desc: "Titulo combinado y sombreado en Tabla 1", pts: 100, status: "Correcto", hint: "gridSpan=5 y sombreado #D1D1D1." });
      } else {
        report.push({ id: 5, desc: "Titulo combinado y sombreado en Tabla 1", pts: 100, status: "Fallo", hint: "gridSpan=5 y sombreado #D1D1D1 en encabezados." });
      }
    } else {
      report.push({ id: 5, desc: "Titulo combinado y sombreado en Tabla 1", pts: 100, status: "Fallo", hint: "No se encontro la tabla de itinerario." });
    }

    // 6. vMerge, gridSpan 6 y texto vertical en Tabla 2 (100 pts)
    if (planillaTable) {
      var rows = getTableRows(planillaTable);
      var row1 = rows.length > 1 ? rows[1] : null;
      var row1Cells = row1 ? getTableCells(row1) : [];
      var vMergeCells = row1Cells.filter(function (c) { return getCellVMerge(c) === 'restart'; });
      var gsCells = row1Cells.filter(function (c) {
        var gs = getCellGridSpan(c);
        return gs > 1;
      });
      var hasTextDir = row1Cells.some(function (c) {
        var td = getCellTextDirection(c);
        return td && td.toLowerCase() === 'btlr';
      });
      if (vMergeCells.length >= 2 && gsCells.length >= 1 && gsCells[0] >= 6 && hasTextDir) {
        score += 100;
        report.push({ id: 6, desc: "vMerge, gridSpan 6 y texto vertical en Tabla 2", pts: 100, status: "Correcto", hint: "vMerge y texto vertical detectados." });
      } else {
        report.push({ id: 6, desc: "vMerge, gridSpan 6 y texto vertical en Tabla 2", pts: 100, status: "Fallo", hint: "vMerge en FECHA/TOTAL, gridSpan=6 en CATEGORIAS y direccion btLr en TOTAL." });
      }
    } else {
      report.push({ id: 6, desc: "vMerge, gridSpan 6 y texto vertical en Tabla 2", pts: 100, status: "Fallo", hint: "No se encontro la tabla de postulantes." });
    }

    // 7. Titulo Tabla 2 gridSpan 8 + subencabezados sombreados (100 pts)
    if (planillaTable) {
      var rows = getTableRows(planillaTable);
      var row0 = rows.length > 0 ? rows[0] : null;
      var row0Cells = row0 ? getTableCells(row0) : [];
      var firstCell = row0Cells.length > 0 ? row0Cells[0] : null;
      var titleGs = firstCell ? getCellGridSpan(firstCell) : null;
      var row3 = rows.length > 3 ? rows[3] : null;
      var row3Cells = row3 ? getTableCells(row3) : [];
      var subShaded = row3Cells.length > 0 && row3Cells.every(function (c) {
        var s = getCellShading(c);
        return s && s.toUpperCase() === 'D1D1D1';
      });
      if (titleGs === 8 && subShaded) {
        score += 100;
        report.push({ id: 7, desc: "Titulo gridSpan 8 + subencabezados sombreados", pts: 100, status: "Correcto", hint: "gridSpan=8 y sombreado en subencabezados." });
      } else {
        report.push({ id: 7, desc: "Titulo gridSpan 8 + subencabezados sombreados", pts: 100, status: "Fallo", hint: "Titulo con gridSpan=8 y subencabezados con sombreado #D1D1D1." });
      }
    } else {
      report.push({ id: 7, desc: "Titulo gridSpan 8 + subencabezados sombreados", pts: 100, status: "Fallo", hint: "No se encontro la tabla de postulantes." });
    }

    // 8. INFORME centrado negrita 18pt + CITE/Hoja de Ruta (100 pts)
    var titleParas = paragraphs.filter(function (p) { return getParagraphText(p).trim() === "INFORME"; });
    var citeParas = paragraphs.filter(function (p) { return getParagraphText(p).trim().indexOf("CITE") === 0; });
    var rutaParas = paragraphs.filter(function (p) { return getParagraphText(p).trim().indexOf("HOJA DE RUTA") === 0; });
    var titleOk = titleParas.length > 0 && titleParas.every(function (p) {
      var bold = getParagraphBoldText(p).join("").length > 0;
      var sz = getParagraphFontSize(p);
      return bold && (sz === 36 || sz === 35 || sz === 37);
    });
    if (titleOk && citeParas.length >= 1 && rutaParas.length >= 1) {
      score += 100;
      report.push({ id: 8, desc: "INFORME centrado, negrita 18pt + CITE/Hoja de Ruta", pts: 100, status: "Correcto", hint: "Formato correcto." });
    } else {
      report.push({ id: 8, desc: "INFORME centrado, negrita 18pt + CITE/Hoja de Ruta", pts: 100, status: "Fallo", hint: "INFORME 18pt negrita centrado, CITE y HOJA DE RUTA presentes." });
    }

    // 9. Parrafo introductorio justificado (100 pts)
    var introParas = paragraphs.filter(function (p) {
      var t = getParagraphText(p).trim();
      return t.indexOf("En atencion") === 0 || t.indexOf("En atenci") === 0 ||
             t.indexOf("Por disposicion") === 0 || t.indexOf("Por disposici") === 0;
    });
    var introJustified = introParas.length > 0 && introParas.some(function (p) {
      return getParagraphAlignment(p) === 'both';
    });
    if (introJustified) {
      score += 100;
      report.push({ id: 9, desc: "Parrafo introductorio justificado", pts: 100, status: "Correcto", hint: "Justificado detectado." });
    } else {
      report.push({ id: 9, desc: "Parrafo introductorio justificado", pts: 100, status: "Fallo", hint: "Justifica el parrafo introductorio." });
    }

    // 10. Margenes pagina + 5 filas en tabla postulantes (100 pts)
    var margins = getMargins(docObj);
    var top = margins ? parseInt(margins.top, 10) : 0;
    var left = margins ? parseInt(margins.left, 10) : 0;
    var right = margins ? parseInt(margins.right, 10) : 0;
    var bottom = margins ? parseInt(margins.bottom, 10) : 0;
    var marginOk = margins &&
      Math.abs(top - config.marginTop) <= 15 &&
      Math.abs(left - config.marginLeft) <= 15 &&
      Math.abs(right - config.marginRight) <= 15 &&
      Math.abs(bottom - config.marginBottom) <= 15;
    var postRows = planillaTable ? getTableRows(planillaTable) : [];
    var rowCountOk = postRows.length >= 5;
    if (marginOk && rowCountOk) {
      score += 100;
      report.push({ id: 10, desc: "Margenes pagina + 5 filas en tabla postulantes", pts: 100, status: "Correcto", hint: "Margenes correctos y 5 filas." });
    } else {
      report.push({ id: 10, desc: "Margenes pagina + 5 filas en tabla postulantes", pts: 100, status: "Fallo", hint: "Margenes: sup/inf=1418, izq/der=1701. Filas detectadas: " + postRows.length + "." });
    }

    return { score: score, report: report };
  };
})();