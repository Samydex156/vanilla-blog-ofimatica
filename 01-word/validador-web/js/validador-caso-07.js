let ValidadorCaso07 = {};

(function () {
  'use strict';

  // Hacer las funciones core disponibles como locales
  var getXmlAsObject = WordCore.getXmlAsObject;
  var getParagraphText = WordCore.getParagraphText;
  var getParagraphAlignment = WordCore.getParagraphAlignment;
  var getParagraphBoldText = WordCore.getParagraphBoldText;
  var getParagraphs = WordCore.getParagraphs;
  var getMargins = WordCore.getMargins;
  var getDocumentFonts = WordCore.getDocumentFonts;
  var getAllFootersText = WordCore.getAllFootersText;
  var getTables = WordCore.getTables;
  var getTableRows = WordCore.getTableRows;
  var getTableCells = WordCore.getTableCells;
  var getCellShading = WordCore.getCellShading;
  var getCellBorders = WordCore.getCellBorders;
  var getCellMargins = WordCore.getCellMargins;
  var getCellVerticalAlign = WordCore.getCellVerticalAlign;
  var getCellGridSpan = WordCore.getCellGridSpan;
  var getRowHeight = WordCore.getRowHeight;
  var getTableBorders = WordCore.getTableBorders;

  ValidadorCaso07.validarDocumento = async (zip, isHomework) => {
    const report = [];
    let score = 0;

    const docObj = await getXmlAsObject(zip, 'word/document.xml');
    if (!docObj) {
      throw new Error("No se pudo leer la estructura del documento.");
    }

    const tables = getTables(docObj);
    const paragraphs = getParagraphs(docObj);

    const config = {
      paperWidth: 11906,
      paperHeight: 16838,
      marginVal: 1134,
      fontName: "Calibri",
      badFontName: "Times New Roman",
      tableCount: 2,
      minRows: 8,
      colCount: 6,
      colWidths: ['9.5%', '30%', '27.5%', '11%', '11%', '11%'],
      cellShadingColors: ['FFFFFF', 'DEEAF6'],
      headerShadingColor: '4472C4',
      footerText: isHomework ? "Comercializadora del Sur S.A. - Documento Interno" : "Sistemas Integrados S.A. - Registro Confidencial"
    };

    // 1. Tamaño A4 (100 pts)
    const body = docObj['w:document'] ? (docObj['w:document']['w:body'] || docObj['w:document']['body']) : null;
    const sectPr = body ? (body['w:sectPr'] || body['sectPr']) : null;
    const pgSz = sectPr ? (sectPr['w:pgSz'] || sectPr['pgSz']) : null;
    const width = pgSz ? parseInt(pgSz['w:w'] || pgSz['w'] || '0', 10) : 0;
    const height = pgSz ? parseInt(pgSz['w:h'] || pgSz['h'] || '0', 10) : 0;
    const paperOk = Math.abs(width - config.paperWidth) <= 50 && Math.abs(height - config.paperHeight) <= 50;

    if (paperOk) {
      score += 100;
      report.push({ id: 1, desc: "Tamaño de página A4", pts: 100, status: "Correcto", hint: "El documento está configurado en tamaño A4." });
    } else {
      report.push({ id: 1, desc: "Tamaño de página A4", pts: 100, status: "Fallo", hint: "Tamaño de papel incorrecto. Debe ser A4 (21.0 x 29.7 cm)." });
    }

    // 2. Márgenes + fuente (100 pts)
    const margins = getMargins(docObj);
    const top = margins ? parseInt(margins.top, 10) : 0;
    const left = margins ? parseInt(margins.left, 10) : 0;
    const marginOk = margins && Math.abs(top - config.marginVal) <= 15 && Math.abs(left - config.marginVal) <= 15;
    const fonts = getDocumentFonts(docObj);
    const hasBadFont = fonts.some(f => f.toLowerCase().includes(config.badFontName.toLowerCase()));
    const hasGoodFont = fonts.some(f => f.toLowerCase().includes(config.fontName.toLowerCase()));

    if (marginOk && hasGoodFont && !hasBadFont) {
      score += 100;
      report.push({ id: 2, desc: "Márgenes 2.0 cm y tipografía Calibri", pts: 100, status: "Correcto", hint: "Márgenes y fuente Calibri configurados correctamente." });
    } else {
      report.push({ id: 2, desc: "Márgenes 2.0 cm y tipografía Calibri", pts: 100, status: "Fallo", hint: "Verifica que los márgenes sean 2.0 cm y la fuente Calibri (no Times New Roman)." });
    }

    // 3. Presencia 2 tablas (100 pts)
    if (tables.length >= 2) {
      score += 100;
      report.push({ id: 3, desc: "Inserción de dos tablas en el documento", pts: 100, status: "Correcto", hint: "Se detectaron " + tables.length + " tablas en el documento." });
    } else {
      report.push({ id: 3, desc: "Inserción de dos tablas en el documento", pts: 100, status: "Fallo", hint: "El documento debe contener 2 tablas. Se detectaron " + tables.length + "." });
    }

    const planillaTable = tables.length > 1 ? tables[1] : null;

    // 4. Ancho 100% + diseño fijo (100 pts)
    let tableWidthOk = false;
    let tableLayoutOk = false;
    if (planillaTable) {
      const tblPr = planillaTable['w:tblPr'] || planillaTable['tblPr'];
      const tblW = tblPr ? (tblPr['w:tblW'] || tblPr['tblW']) : null;
      const wSize = tblW ? (tblW['w:w'] || tblW['w']) : null;
      const wType = tblW ? (tblW['w:type'] || tblW['type']) : null;
      tableWidthOk = (wSize === '100' || wSize === '100%') && wType === 'pct';

      const tblLayout = tblPr ? (tblPr['w:tblLayout'] || tblPr['tblLayout']) : null;
      const layoutType = tblLayout ? (tblLayout['w:type'] || tblLayout['type']) : null;
      tableLayoutOk = layoutType === 'fixed';
    }

    if (tableWidthOk && tableLayoutOk) {
      score += 100;
      report.push({ id: 4, desc: "Ancho de tabla 100% y diseño fijo", pts: 100, status: "Correcto", hint: "Tabla configurada con ancho 100% y diseño fijo." });
    } else {
      report.push({ id: 4, desc: "Ancho de tabla 100% y diseño fijo", pts: 100, status: "Fallo", hint: "Establece ancho 100% y diseño fijo en las propiedades de la tabla." });
    }

    // 5. Encabezados (sombreado, bordes, altura) (100 pts)
    if (planillaTable) {
      const rows = getTableRows(planillaTable);
      const firstRow = rows.length > 0 ? rows[0] : null;
      const firstRowCells = firstRow ? getTableCells(firstRow) : [];

      const allShaded = firstRowCells.length > 0 && firstRowCells.every(cell => {
        const s = getCellShading(cell);
        return s && s.toUpperCase() === config.headerShadingColor;
      });
      const allBordered = firstRowCells.length > 0 && firstRowCells.every(cell => {
        const b = getCellBorders(cell);
        return b && b.top && b.bottom && b.left && b.right;
      });
      const headerHeightOk = firstRow ? (getRowHeight(firstRow) || {}).val >= 450 : false;

      if (allShaded && allBordered && headerHeightOk) {
        score += 100;
        report.push({ id: 5, desc: "Encabezado con sombreado (#4472C4), bordes y altura", pts: 100, status: "Correcto", hint: "Fila de encabezados correctamente formateada." });
      } else {
        report.push({ id: 5, desc: "Encabezado con sombreado (#4472C4), bordes y altura", pts: 100, status: "Fallo", hint: "Aplica sombreado azul #4472C4, bordes y altura >=500 a la fila de encabezados." });
      }
    } else {
      report.push({ id: 5, desc: "Encabezado con sombreado (#4472C4), bordes y altura", pts: 100, status: "Fallo", hint: "No se encontró la tabla de planilla." });
    }

    // 6. Alineación vertical y márgenes celda (100 pts)
    if (planillaTable) {
      const rows = getTableRows(planillaTable);
      const allCells = [];
      rows.forEach(row => getTableCells(row).forEach(cell => allCells.push(cell)));

      const allVert = allCells.length > 0 && allCells.every(c => getCellVerticalAlign(c) === 'center');
      const someMargins = allCells.length > 0 && allCells.some(c => {
        const m = getCellMargins(c);
        return m && (m.top || m.bottom || m.left || m.right);
      });

      if (allVert && someMargins) {
        score += 100;
        report.push({ id: 6, desc: "Alineación vertical centrada y márgenes de celda", pts: 100, status: "Correcto", hint: "Contenido centrado verticalmente y márgenes interiores." });
      } else {
        report.push({ id: 6, desc: "Alineación vertical centrada y márgenes de celda", pts: 100, status: "Fallo", hint: "Centra verticalmente el texto y aplica márgenes interiores a las celdas." });
      }
    } else {
      report.push({ id: 6, desc: "Alineación vertical centrada y márgenes de celda", pts: 100, status: "Fallo", hint: "No se encontró la tabla de planilla." });
    }

    // 7. 6 columnas sin combinación (100 pts)
    if (planillaTable) {
      const rows = getTableRows(planillaTable);
      const firstRowCells = rows.length > 0 ? getTableCells(rows[0]) : [];
      const colOk = firstRowCells.length === config.colCount;
      const noSpan = firstRowCells.every(c => getCellGridSpan(c) === null || getCellGridSpan(c) === undefined || getCellGridSpan(c) === 1);

      if (colOk && noSpan) {
        score += 100;
        report.push({ id: 7, desc: "6 columnas con anchos diferenciados", pts: 100, status: "Correcto", hint: "Se detectaron 6 columnas sin combinaciones en el encabezado." });
      } else {
        report.push({ id: 7, desc: "6 columnas con anchos diferenciados", pts: 100, status: "Fallo", hint: "Debe tener exactamente 6 columnas sin celdas combinadas en el encabezado." });
      }
    } else {
      report.push({ id: 7, desc: "6 columnas con anchos diferenciados", pts: 100, status: "Fallo", hint: "No se encontró la tabla de planilla." });
    }

    // 8. Altura filas + número mínimo (100 pts)
    if (planillaTable) {
      const rows = getTableRows(planillaTable);
      const rowCountOk = rows.length >= config.minRows;
      const dataRows = rows.slice(1);
      const allDataHeight = dataRows.length > 0 && dataRows.every(r => {
        const h = getRowHeight(r);
        return h && h.val >= 300 && h.val <= 380;
      });

      if (rowCountOk && allDataHeight) {
        score += 100;
        report.push({ id: 8, desc: "Altura mínima en filas de datos + 8 filas mínimo", pts: 100, status: "Correcto", hint: "Filas de datos con altura mínima y número suficiente de filas." });
      } else {
        report.push({ id: 8, desc: "Altura mínima en filas de datos + 8 filas mínimo", pts: 100, status: "Fallo", hint: "Aplica altura mínima 340 a filas datos y asegura 8 filas total (1 encab + 7 datos)." });
      }
    } else {
      report.push({ id: 8, desc: "Altura mínima en filas de datos + 8 filas mínimo", pts: 100, status: "Fallo", hint: "No se encontró la tabla de planilla." });
    }

    // 9. Efecto cebra (100 pts)
    if (planillaTable) {
      const rows = getTableRows(planillaTable);
      const data = rows.slice(1);
      if (data.length >= 2) {
        const fills = data.map(r => {
          const c = getTableCells(r)[0];
          return c ? getCellShading(c) : null;
        }).filter(Boolean);
        const unique = fills.filter((v, i, a) => a.indexOf(v) === i);

        if (unique.length >= 2) {
          score += 100;
          report.push({ id: 9, desc: "Sombreado alternado en filas (efecto cebra)", pts: 100, status: "Correcto", hint: "Se detectaron al menos 2 colores de sombreado alternados." });
        } else {
          report.push({ id: 9, desc: "Sombreado alternado en filas (efecto cebra)", pts: 100, status: "Fallo", hint: "Aplica sombreado alternado (blanco y azul claro #DEEAF6) en filas de datos." });
        }
      } else {
        report.push({ id: 9, desc: "Sombreado alternado en filas (efecto cebra)", pts: 100, status: "Fallo", hint: "No hay suficientes filas de datos para verificar el efecto cebra." });
      }
    } else {
      report.push({ id: 9, desc: "Sombreado alternado en filas (efecto cebra)", pts: 100, status: "Fallo", hint: "No se encontró la tabla de planilla." });
    }

    // 10. Pie de página + títulos en negrita (100 pts)
    const footerText = await getAllFootersText(zip);
    const footerOk = footerText.toLowerCase().includes(config.footerText.toLowerCase());
    const secParas = paragraphs.filter(p => {
      const t = getParagraphText(p).trim();
      return t.startsWith("INFORMACIÓN") || t.startsWith("DATOS") || t.startsWith("PLANILLA") || t.startsWith("LISTADO");
    });
    const titlesOk = secParas.length >= 1 && secParas.some(p => {
      const align = getParagraphAlignment(p);
      const bold = getParagraphBoldText(p).join("").length > 0;
      return (align === 'left' || align === null || align === 'both') && bold;
    });

    if (footerOk && titlesOk) {
      score += 100;
      report.push({ id: 10, desc: "Pie de página y títulos de sección en negrita", pts: 100, status: "Correcto", hint: "Pie de página presente y títulos en negrita." });
    } else {
      report.push({ id: 10, desc: "Pie de página y títulos de sección en negrita", pts: 100, status: "Fallo", hint: "Verifica el pie de página y que los títulos de sección estén en negrita." });
    }

    return { score, report };
  };
})();