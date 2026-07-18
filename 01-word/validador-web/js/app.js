/**
 * app.js — Interfaz de usuario del validador web.
 * Drag & drop, orquestacion de validacion, render de resultados.
 */
(function () {
  'use strict';

  const VALIDADORES = {
    'caso-01': typeof ValidadorCaso01 !== 'undefined' ? ValidadorCaso01 : null,
    'caso-02': typeof ValidadorCaso02 !== 'undefined' ? ValidadorCaso02 : null,
    'caso-05': typeof ValidadorCaso05 !== 'undefined' ? ValidadorCaso05 : null,
    'caso-06': typeof ValidadorCaso06 !== 'undefined' ? ValidadorCaso06 : null,
    'caso-07': typeof ValidadorCaso07 !== 'undefined' ? ValidadorCaso07 : null,
    'caso-08': typeof ValidadorCaso08 !== 'undefined' ? ValidadorCaso08 : null
  };

  const CASOS = {
    'basico': {
      'caso-01': {
        nombre: 'Caso 01 — Newsletter',
        clase: 'PixelWorld News',
        tarea: 'RetroQuest News'
      },
      'caso-02': {
        nombre: 'Caso 02 — Recetario Nutrición',
        clase: 'Patatas Rellenas',
        tarea: 'Tarta de Manzana'
      }
    },
    'intermedio': {
      'caso-05': {
        nombre: 'Caso 05 — Artículo Periodístico',
        clase: 'La Economía Global',
        tarea: 'Avances en IA'
      },
      'caso-06': {
        nombre: 'Caso 06 — Conminatoria Control Social',
        clase: 'Carta Formal',
        tarea: 'Conminatoria'
      }
    },
    'avanzado': {
      'caso-07': {
        nombre: 'Caso 07 — Planilla Personal',
        clase: 'Sistemas Integrados S.A.',
        tarea: 'Comercializadora del Sur S.A.'
      }
    },
    'intermedio': {
      'caso-08': {
        nombre: 'Caso 08 — Evaluacion Conduccion',
        clase: 'SEGIP Caranavi',
        tarea: 'SEGIP Viacha'
      }
    }
  };

  let archivoSeleccionado = null;

  function init() {
    console.log('[Word-eSports] Inicializando validador...');

    var dropZone = document.getElementById('drop-zone');
    var fileInput = document.getElementById('file-input');
    var fileInfo = document.getElementById('file-info');
    var btnValidar = document.getElementById('btn-validar');

    if (!dropZone || !fileInput) {
      console.error('[Word-eSports] No se encontraron elementos del DOM');
      return;
    }

    // --- File input change (backup for direct click) ---
    fileInput.addEventListener('change', function (e) {
      console.log('[Word-eSports] fileInput change, files:', e.target.files.length);
      if (e.target.files.length > 0) {
        handleFile(e.target.files[0]);
      }
    });

    // --- Drop zone click: delegate to file input ---
    dropZone.addEventListener('click', function (e) {
      // Don't trigger if user clicked the browse-btn label (it handles itself)
      if (e.target.tagName === 'LABEL') return;
      e.preventDefault();
      e.stopPropagation();
      fileInput.click();
    });

    // --- Drag & Drop ---
    dropZone.addEventListener('dragover', function (e) {
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = 'copy';
      dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragenter', function (e) {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', function (e) {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', function (e) {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.remove('dragover');
      console.log('[Word-eSports] Drop event, files:', e.dataTransfer.files.length);
      var files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFile(files[0]);
      }
    });

    // --- Prevent default drag on document (stops browser from opening file) ---
    document.addEventListener('dragover', function (e) { e.preventDefault(); });
    document.addEventListener('drop', function (e) { e.preventDefault(); });

    // --- Validate button ---
    btnValidar.addEventListener('click', function () {
      validar();
    });

    console.log('[Word-eSports] Eventos configurados.');
  }

  function handleFile(file) {
    console.log('[Word-eSports] Archivo recibido:', file.name);

    if (!file.name.toLowerCase().endsWith('.docx')) {
      showError('Solo se aceptan archivos .docx');
      return;
    }

    archivoSeleccionado = file;
    var fileInfo = document.getElementById('file-info');
    var fileName = document.getElementById('file-name');
    var dropZone = document.getElementById('drop-zone');

    fileName.textContent = file.name;
    fileInfo.classList.remove('hidden');
    dropZone.classList.add('has-file');

    document.getElementById('btn-validar').disabled = false;
    hideResults();
  }

  async function validar() {
    if (!archivoSeleccionado) return;

    var btn = document.getElementById('btn-validar');
    var loading = document.getElementById('loading');
    btn.disabled = true;
    loading.classList.remove('hidden');
    hideResults();

    try {
      console.log('[Word-eSports] Leyendo archivo...');
      var arrayBuffer = await archivoSeleccionado.arrayBuffer();
      console.log('[Word-eSports] Abriendo ZIP...');
      var zip = await WordCore.loadDocx(arrayBuffer);

      var casoId = document.getElementById('caso-select').value;
      var validator = VALIDADORES[casoId];
      if (!validator) {
        showError('Este caso aun no esta disponible.');
        return;
      }

      var isHomework = archivoSeleccionado.name.toLowerCase().includes('tarea');
      console.log('[Word-eSports] Validando caso:', casoId, '| Modo:', isHomework ? 'Tarea' : 'Clase');
      var result = await validator.validarDocumento(zip, isHomework);

      console.log('[Word-eSports] Score:', result.score);
      renderResults(result.score, result.report, isHomework);
    } catch (err) {
      console.error('[Word-eSports] Error:', err);
      showError('Error al procesar el archivo: ' + err.message);
    } finally {
      btn.disabled = false;
      loading.classList.add('hidden');
    }
  }

  function renderResults(score, report, isHomework) {
    var container = document.getElementById('results');
    container.classList.remove('hidden');

    var modeLabel = isHomework ? 'TAREA' : 'CLASE';
    var pct = Math.round((score / 1000) * 100);

    var barClass = 'bar-low';
    if (pct >= 80) barClass = 'bar-high';
    else if (pct >= 50) barClass = 'bar-mid';

    var message = '';
    if (score === 1000) {
      message = '¡EXCELENTE! Has completado todos los requisitos a la perfección.';
    } else if (score >= 800) {
      message = '¡Muy bien! Estás cerca. Corrige los puntos indicados.';
    } else if (score >= 500) {
      message = 'Buen avance. Revisa los requisitos fallidos.';
    } else {
      message = 'Sigue practicando. Revisa cada pista cuidadosamente.';
    }

    var html = '<div class="result-header">' +
      '<div class="result-mode">' + modeLabel + '</div>' +
      '<div class="result-score">' + score + ' <span class="result-total">/ 1000 pts</span></div>' +
      '<div class="result-bar-container">' +
        '<div class="result-bar ' + barClass + '" style="width: ' + pct + '%"></div>' +
      '</div>' +
      '<div class="result-message">' + message + '</div>' +
    '</div>' +
    '<div class="result-requirements">';

    report.forEach(function (r) {
      var passed = r.status === 'Correcto';
      var icon = passed ? '&#10003;' : '&#10007;';
      var cls = passed ? 'req-pass' : 'req-fail';

      html += '<div class="req ' + cls + '">' +
        '<div class="req-header">' +
          '<span class="req-icon">' + icon + '</span>' +
          '<span class="req-id">' + r.id + '.</span>' +
          '<span class="req-desc">' + r.desc + '</span>' +
          '<span class="req-pts">' + r.pts + ' pts</span>' +
        '</div>' +
        (!passed ? '<div class="req-hint">' + r.hint + '</div>' : '') +
      '</div>';
    });

    html += '</div>';
    container.innerHTML = html;

    container.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function hideResults() {
    var container = document.getElementById('results');
    container.classList.add('hidden');
    container.innerHTML = '';
  }

  function showError(msg) {
    var container = document.getElementById('results');
    container.classList.remove('hidden');
    container.innerHTML = '<div class="error-msg">' + msg + '</div>';
  }

  // --- Bootstrap: try DOMContentLoaded, fallback to immediate ---
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // DOM already ready (script loaded late or synchronously)
    init();
  }

})();
