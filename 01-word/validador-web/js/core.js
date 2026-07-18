/**
 * core.js — Port de validador_openxml.js para navegador.
 * Funciones compartidas de parseo XML para validacion de documentos Word.
 *
 * Dependencias CDN: JSZip, fast-xml-parser (fxparser)
 */
const WordCore = (function () {
  'use strict';

  var ParserClass = (typeof XMLParser === 'function') ? XMLParser : XMLParser.default;
  var parser = new ParserClass({
    ignoreAttributes: false,
    attributeNamePrefix: '',
    allowBooleanAttributes: true,
    trimValues: false
  });

  function ensureArray(val) {
    if (val === undefined || val === null) return [];
    if (Array.isArray(val)) return val;
    return [val];
  }

  async function loadDocx(arrayBuffer) {
    return await JSZip.loadAsync(arrayBuffer);
  }

  async function getXmlAsObject(zip, innerPath) {
    const file = zip.file(innerPath);
    if (!file) return null;
    const xmlText = await file.async('string');
    return parser.parse(xmlText);
  }

  function getRunText(rNode) {
    if (!rNode) return '';
    const tNodes = ensureArray(rNode['w:t'] || rNode['t']);
    return tNodes.map(tNode => {
      if (tNode === undefined || tNode === null) return '';
      if (typeof tNode === 'string') return tNode;
      if (typeof tNode === 'number') return String(tNode);
      if (typeof tNode === 'object') {
        if (tNode['#text'] !== undefined) return String(tNode['#text']);
        return '';
      }
      return '';
    }).join('');
  }

  function isRunBold(rNode) {
    const rPr = rNode?.['w:rPr'] || rNode?.['rPr'];
    if (!rPr) return false;
    const b = rPr['w:b'] !== undefined ? rPr['w:b'] : rPr['b'];
    if (b === undefined) return false;
    if (b && typeof b === 'object') {
      const val = b['val'] || b['w:val'];
      if (val === 'false' || val === '0' || val === 'none') return false;
    }
    return true;
  }

  function isRunItalic(rNode) {
    const rPr = rNode?.['w:rPr'] || rNode?.['rPr'];
    if (!rPr) return false;
    const i = rPr['w:i'] !== undefined ? rPr['w:i'] : rPr['i'];
    if (i === undefined) return false;
    if (i && typeof i === 'object') {
      const val = i['val'] || i['w:val'];
      if (val === 'false' || val === '0' || val === 'none') return false;
    }
    return true;
  }

  function isRunUnderlined(rNode) {
    const rPr = rNode?.['w:rPr'] || rNode?.['rPr'];
    if (!rPr) return false;
    const u = rPr['w:u'] !== undefined ? rPr['w:u'] : rPr['u'];
    if (u === undefined) return false;
    if (u && typeof u === 'object') {
      const val = u['val'] || u['w:val'];
      if (val === 'false' || val === '0' || val === 'none') return false;
    }
    return true;
  }

  function isRunStrike(rNode) {
    const rPr = rNode?.['w:rPr'] || rNode?.['rPr'];
    if (!rPr) return false;
    const strike = rPr['w:strike'] !== undefined ? rPr['w:strike'] : rPr['strike'];
    if (strike === undefined) return false;
    if (strike && typeof strike === 'object') {
      const val = strike['val'] || strike['w:val'];
      if (val === 'false' || val === '0' || val === 'none') return false;
    }
    return true;
  }

  function getRunColor(rNode) {
    const rPr = rNode?.['w:rPr'] || rNode?.['rPr'];
    const colorObj = rPr?.['w:color'] || rPr?.['color'];
    if (!colorObj) return null;
    return colorObj['val'] || colorObj['w:val'] || null;
  }

  function _traverseFormatted(pNode, checkFn) {
    const results = [];
    let current = '';

    function traverse(node) {
      if (!node) return;
      if (Array.isArray(node)) { node.forEach(traverse); return; }
      if (typeof node === 'object') {
        if (node['w:r'] || node['r']) {
          const runs = ensureArray(node['w:r'] || node['r']);
          runs.forEach(r => {
            if (checkFn(r)) {
              current += getRunText(r);
            } else {
              if (current.trim().length > 0) results.push(current.trim());
              current = '';
            }
          });
        } else {
          for (const key in node) {
            if (key !== 'w:pPr' && key !== 'pPr' && key !== 'w:rPr' && key !== 'rPr') {
              traverse(node[key]);
            }
          }
        }
      }
    }

    traverse(pNode);
    if (current.trim().length > 0) results.push(current.trim());
    return results;
  }

  function getParagraphText(pNode) {
    if (!pNode) return '';
    let text = '';
    function traverse(node) {
      if (!node) return;
      if (typeof node === 'string' || typeof node === 'number') return;
      if (Array.isArray(node)) { node.forEach(traverse); return; }
      if (typeof node === 'object') {
        if (node['w:r'] || node['r']) {
          const runs = ensureArray(node['w:r'] || node['r']);
          runs.forEach(r => { text += getRunText(r); });
        } else {
          for (const key in node) {
            if (key !== 'w:pPr' && key !== 'pPr' && key !== 'w:rPr' && key !== 'rPr') {
              traverse(node[key]);
            }
          }
        }
      }
    }
    traverse(pNode);
    return text;
  }

  function getParagraphs(docObj) {
    const body = docObj?.['w:document']?.['w:body'] || docObj?.['document']?.['body'];
    if (!body) return [];
    return ensureArray(body['w:p'] || body['p']);
  }

  function getMargins(docObj) {
    const body = docObj?.['w:document']?.['w:body'] || docObj?.['document']?.['body'];
    if (!body) return null;
    let sectPr = body['w:sectPr'] || body['sectPr'];
    if (!sectPr) {
      const paragraphs = getParagraphs(docObj);
      for (const p of paragraphs) {
        const pSect = p['w:pPr']?.['w:sectPr'] || p['pPr']?.['sectPr'];
        if (pSect) { sectPr = pSect; break; }
      }
    }
    if (!sectPr) return null;
    const pgMar = sectPr['w:pgMar'] || sectPr['pgMar'];
    if (!pgMar) return null;
    return {
      top: pgMar['top'] || pgMar['w:top'],
      bottom: pgMar['bottom'] || pgMar['w:bottom'],
      left: pgMar['left'] || pgMar['w:left'],
      right: pgMar['right'] || pgMar['w:right'],
      header: pgMar['header'] || pgMar['w:header'],
      footer: pgMar['footer'] || pgMar['w:footer'],
      gutter: pgMar['gutter'] || pgMar['w:gutter']
    };
  }

  function getParagraphStyle(pNode) {
    const pPr = pNode?.['w:pPr'] || pNode?.['pPr'];
    const styleObj = pPr?.['w:pStyle'] || pPr?.['pStyle'];
    if (!styleObj) return null;
    return styleObj['val'] || styleObj['w:val'] || null;
  }

  function getParagraphAlignment(pNode) {
    const pPr = pNode?.['w:pPr'] || pNode?.['pPr'];
    const jc = pPr?.['w:jc'] || pPr?.['jc'];
    if (!jc) return null;
    return jc['val'] || jc['w:val'] || null;
  }

  function getParagraphSpacing(pNode) {
    const pPr = pNode?.['w:pPr'] || pNode?.['pPr'];
    const spacing = pPr?.['w:spacing'] || pPr?.['spacing'];
    if (!spacing) return null;
    return {
      line: spacing['line'] || spacing['w:line'],
      lineRule: spacing['lineRule'] || spacing['w:lineRule'],
      before: spacing['before'] || spacing['w:before'],
      after: spacing['after'] || spacing['w:after']
    };
  }

  function isListParagraph(pNode) {
    const pPr = pNode?.['w:pPr'] || pNode?.['pPr'];
    return (pPr?.['w:numPr'] !== undefined) || (pPr?.['numPr'] !== undefined);
  }

  function getParagraphBoldText(pNode) {
    return _traverseFormatted(pNode, isRunBold);
  }

  function getParagraphItalicText(pNode) {
    return _traverseFormatted(pNode, isRunItalic);
  }

  function getParagraphUnderlinedText(pNode) {
    return _traverseFormatted(pNode, isRunUnderlined);
  }

  function getParagraphStrikeText(pNode) {
    return _traverseFormatted(pNode, isRunStrike);
  }

  function getParagraphColors(pNode) {
    const colors = new Set();
    const runs = ensureArray(pNode['w:r'] || pNode['r']);
    runs.forEach(r => {
      const c = getRunColor(r);
      if (c) colors.add(c.toUpperCase());
    });
    return Array.from(colors);
  }

  function getDocumentFonts(docObj) {
    const fonts = new Set();
    const paragraphs = getParagraphs(docObj);
    paragraphs.forEach(p => {
      const pRFonts = p['w:pPr']?.['w:rPr']?.['w:rFonts'] || p['pPr']?.['rPr']?.['rFonts'];
      if (pRFonts) {
        const f = pRFonts['ascii'] || pRFonts['w:ascii'] || pRFonts['hAnsi'] || pRFonts['w:hAnsi'];
        if (f) fonts.add(f);
      }
      const runs = ensureArray(p['w:r'] || p['r']);
      runs.forEach(r => {
        const rFonts = r['w:rPr']?.['w:rFonts'] || r['rPr']?.['rFonts'];
        if (rFonts) {
          const f = rFonts['ascii'] || rFonts['w:ascii'] || rFonts['hAnsi'] || rFonts['w:hAnsi'];
          if (f) fonts.add(f);
        }
      });
      const hyperlinks = ensureArray(p['w:hyperlink'] || p['hyperlink']);
      hyperlinks.forEach(hl => {
        const hlRuns = ensureArray(hl['w:r'] || hl['r']);
        hlRuns.forEach(r => {
          const rFonts = r['w:rPr']?.['w:rFonts'] || r['rPr']?.['rFonts'];
          if (rFonts) {
            const f = rFonts['ascii'] || rFonts['w:ascii'] || rFonts['hAnsi'] || rFonts['w:hAnsi'];
            if (f) fonts.add(f);
          }
        });
      });
    });
    return Array.from(fonts);
  }

  function hasUnapprovedFonts(docObj, approvedList) {
    const list = approvedList || ['Arial', 'Calibri'];
    const fonts = getDocumentFonts(docObj);
    return fonts.some(f => !list.includes(f));
  }

  async function getAllFootersText(zip) {
    const files = zip.file(/^word\/footer\d+\.xml$/);
    let combinedText = '';
    for (const file of files) {
      const xmlText = await file.async('string');
      const footerObj = parser.parse(xmlText);
      const footer = footerObj['w:ftr'] || footerObj['ftr'];
      if (footer) {
        const paragraphs = ensureArray(footer['w:p'] || footer['p']);
        const text = paragraphs.map(getParagraphText).join('\n').trim();
        combinedText += text + '\n';
      }
    }
    return combinedText.trim();
  }

  function getParagraphFontSize(pNode) {
    const runs = ensureArray(pNode['w:r'] || pNode['r']);
    for (const r of runs) {
      const szObj = r['w:rPr']?.['w:sz'] || r['rPr']?.['sz'];
      if (szObj) return parseInt(szObj['val'] || szObj['w:val'] || '0', 10);
    }
    const pRPr = pNode['w:pPr']?.['w:rPr'] || pNode['pPr']?.['rPr'];
    const szObj = pRPr?.['w:sz'] || pRPr?.['sz'];
    if (szObj) return parseInt(szObj['val'] || szObj['w:val'] || '0', 10);
    return null;
  }

  function isHeading1Style(styleId) {
    if (!styleId) return false;
    const s = styleId.toLowerCase();
    return s.includes('heading1') || s.includes('heading 1') ||
           s.includes('ttulo1') || s.includes('tulo1') || s.includes('titulo1');
  }

  function getStyleFontSize(stylesObj, styleId) {
    if (!stylesObj) return null;
    const styles = stylesObj['w:styles'] || stylesObj['styles'];
    if (!styles) return null;
    const styleList = ensureArray(styles['w:style'] || styles['style']);
    const styleNode = styleList.find(s => {
      if (!s) return false;
      const id = s['w:styleId'] || s['styleId'];
      return id === styleId;
    });
    const rPr = styleNode?.['w:rPr'] || styleNode?.['rPr'];
    const sz = rPr?.['w:sz'] || rPr?.['sz'];
    if (sz) return parseInt(sz['val'] || sz['w:val'] || '0', 10);
    return null;
  }

  function getTables(docObj) {
    var body = docObj?.['w:document']?.['w:body'] || docObj?.['document']?.['body'];
    if (!body) return [];
    var tblNodes = body['w:tbl'] || body['tbl'];
    return ensureArray(tblNodes);
  }

  function getTableRows(tblNode) {
    return ensureArray(tblNode['w:tr'] || tblNode['tr']);
  }

  function getTableCells(trNode) {
    return ensureArray(trNode['w:tc'] || trNode['tc']);
  }

  function getCellShading(tcNode) {
    var tcPr = tcNode['w:tcPr'] || tcNode['tcPr'];
    if (!tcPr) return null;
    var shading = tcPr['w:shd'] || tcPr['shd'];
    if (!shading) return null;
    return shading['w:fill'] || shading['fill'] || null;
  }

  function getCellBorders(tcNode) {
    var tcPr = tcNode['w:tcPr'] || tcNode['tcPr'];
    if (!tcPr) return null;
    var borders = tcPr['w:tcBorders'] || tcPr['tcBorders'];
    if (!borders) return null;
    var result = {};
    ['top', 'bottom', 'left', 'right'].forEach(function (side) {
      var b = borders['w:' + side] || borders[side];
      if (b) result[side] = { val: b['val'] || b['w:val'] };
    });
    return Object.keys(result).length > 0 ? result : null;
  }

  function getCellMargins(tcNode) {
    var tcPr = tcNode['w:tcPr'] || tcNode['tcPr'];
    if (!tcPr) return null;
    var mar = tcPr['w:tcMar'] || tcPr['tcMar'];
    if (!mar) return null;
    var result = {};
    ['top', 'bottom', 'left', 'right'].forEach(function (side) {
      var m = mar['w:' + side] || mar[side];
      if (m) result[side] = m['w:w'] || m['w'];
    });
    return Object.keys(result).length > 0 ? result : null;
  }

  function getCellGridSpan(tcNode) {
    var tcPr = tcNode['w:tcPr'] || tcNode['tcPr'];
    if (!tcPr) return null;
    var span = tcPr['w:gridSpan'] || tcPr['gridSpan'];
    if (!span) return null;
    return parseInt(span['val'] || span['w:val'] || '1', 10);
  }

  function getCellVerticalAlign(tcNode) {
    var tcPr = tcNode['w:tcPr'] || tcNode['tcPr'];
    if (!tcPr) return null;
    var vAlign = tcPr['w:vAlign'] || tcPr['vAlign'];
    if (!vAlign) return null;
    return vAlign['val'] || vAlign['w:val'] || null;
  }

  function getCellTextDirection(tcNode) {
    var tcPr = tcNode['w:tcPr'] || tcNode['tcPr'];
    if (!tcPr) return null;
    var textDir = tcPr['w:textDirection'] || tcPr['textDirection'];
    if (!textDir) return null;
    return textDir['val'] || textDir['w:val'] || null;
  }

  function getCellVMerge(tcNode) {
    var tcPr = tcNode['w:tcPr'] || tcNode['tcPr'];
    if (!tcPr) return null;
    var vMerge = tcPr['w:vMerge'] || tcPr['vMerge'];
    if (!vMerge) return null;
    return vMerge['val'] || vMerge['w:val'] || 'continue';
  }

  function getRowHeight(trNode) {
    var trPr = trNode['w:trPr'] || trNode['trPr'];
    if (!trPr) return null;
    var height = trPr['w:trHeight'] || trPr['trHeight'];
    if (!height) return null;
    return { val: parseInt(height['val'] || height['w:val'] || '0', 10), rule: height['ruleType'] || height['w:ruleType'] || null };
  }

  function getTableBorders(tblNode) {
    var tblPr = tblNode['w:tblPr'] || tblNode['tblPr'];
    if (!tblPr) return null;
    var borders = tblPr['w:tblBorders'] || tblPr['tblBorders'];
    if (!borders) return null;
    var result = {};
    ['top', 'bottom', 'left', 'right', 'insideH', 'insideV'].forEach(function (side) {
      var searchKey = (side === 'insideH' || side === 'insideV') ? 'w:' + side : 'w:' + side;
      var b = borders[searchKey] || borders[side];
      if (b) result[side] = { val: b['val'] || b['w:val'] };
    });
    return Object.keys(result).length > 0 ? result : null;
  }

  return {
    loadDocx,
    getXmlAsObject,
    ensureArray,
    getParagraphText,
    getParagraphs,
    getMargins,
    getParagraphStyle,
    getParagraphAlignment,
    getParagraphSpacing,
    isListParagraph,
    getParagraphBoldText,
    getParagraphItalicText,
    getParagraphUnderlinedText,
    getParagraphStrikeText,
    getParagraphColors,
    getDocumentFonts,
    hasUnapprovedFonts,
    getAllFootersText,
    getParagraphFontSize,
    isRunBold,
    isRunItalic,
    isRunUnderlined,
    isRunStrike,
    getRunColor,
    isHeading1Style,
    getStyleFontSize,
    getTables,
    getTableRows,
    getTableCells,
    getCellShading,
    getCellBorders,
    getCellMargins,
    getCellGridSpan,
    getCellVerticalAlign,
    getCellTextDirection,
    getCellVMerge,
    getRowHeight,
    getTableBorders
  };
})();
