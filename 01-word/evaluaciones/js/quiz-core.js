// quiz-core.js — Motor de evaluaciones estático para Ofimática (Word)
// Adaptado de vanilla-blog-excel. Soporta tipo "multiple" y "vf" + campo opcional "explicacion" para retroalimentación en clase.

var questions = [];
var currentIndex = 0;
var userAnswers = [];
var studentName = '';

document.addEventListener('DOMContentLoaded', function () {
  var css = document.createElement('style');
  css.innerHTML = [
    '.option-btn.selected{background:var(--color-word,#254875)!important;color:#fff!important;border-color:var(--color-word,#254875)!important;}',
    '.option-btn.selected:hover{opacity:.92;}',
    '.option-btn.selected span{background:#fff!important;color:var(--color-word,#254875)!important;}',
    '.nav-buttons{display:flex;justify-content:space-between;margin-top:2rem;gap:1rem;}',
    '.btn-secondary{background:var(--bg-body,#F7F6F3);color:var(--text-main,#1A1A1A);border:1px solid var(--border-light,#D9D7CE);padding:1rem 2rem;border-radius:4px;font-weight:600;cursor:pointer;}',
    '.btn-secondary:hover{background:var(--border-light,#D9D7CE);}',
    '.summary-container{margin-top:2rem;text-align:left;}',
    '.summary-item{padding:1rem;border-radius:4px;margin-bottom:1rem;border:1px solid var(--border-light,#D9D7CE);background:var(--bg-content,#fff);}',
    '.summary-item.correct{border-left:5px solid #1E5E3A;}',
    '.summary-item.incorrect{border-left:5px solid #9E3B2B;}',
    '.summary-expl{margin-top:.5rem;font-size:.88rem;color:var(--text-muted,#5C5955);background:var(--bg-body,#F7F6F3);border:1px dashed var(--border-light,#D9D7CE);border-radius:4px;padding:.5rem .75rem;}'
  ].join('\n');
  document.head.appendChild(css);
});

function shuffleArray(arr) {
  for (var i = arr.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
  }
  return arr;
}

function initQuiz(preguntasArray) {
  questions = shuffleArray(preguntasArray.slice());
  userAnswers = new Array(questions.length).fill(null);
  currentIndex = 0;
}

function startQuiz() {
  var nameInput = document.getElementById('student-name');
  if (!nameInput || !nameInput.value.trim()) {
    alert('Por favor, ingresa tu nombre completo.');
    return;
  }
  studentName = nameInput.value.trim();
  var regForm = document.getElementById('registration-form');
  var quizScreen = document.getElementById('quiz-screen');
  if (!regForm || !quizScreen) {
    alert('Error: no se encontraron los elementos del quiz.');
    return;
  }
  regForm.classList.add('hidden');
  quizScreen.classList.remove('hidden');
  renderQuestion();
}

function renderQuestion() {
  var question = questions[currentIndex];
  if (!question) return;

  var questionText = document.getElementById('question-text');
  var counter = document.getElementById('question-counter');
  var progressFill = document.getElementById('progress-fill');
  var optionsGrid = document.getElementById('options-grid');

  if (questionText) questionText.innerText = question.pregunta;
  if (counter) counter.innerText = 'Pregunta ' + (currentIndex + 1) + ' de ' + questions.length;
  if (progressFill) progressFill.style.width = ((currentIndex / questions.length) * 100) + '%';
  if (!optionsGrid) return;
  optionsGrid.innerHTML = '';

  if (question.tipo === 'vf') {
    optionsGrid.style.gridTemplateColumns = '1fr 1fr';
    ['Verdadero', 'Falso'].forEach(function (opcion, index) {
      var btn = document.createElement('button');
      var isSelected = userAnswers[currentIndex] === index;
      btn.className = 'option-btn animate-fade' + (isSelected ? ' selected' : '');
      btn.innerHTML = '<span>' + String.fromCharCode(65 + index) + '</span> ' + opcion;
      btn.onclick = (function (idx) { return function () { handleAnswer(idx); }; })(index);
      optionsGrid.appendChild(btn);
    });
  } else {
    optionsGrid.style.gridTemplateColumns = '1fr';
    question.opciones.forEach(function (opcion, index) {
      var btn = document.createElement('button');
      var isSelected = userAnswers[currentIndex] === index;
      btn.className = 'option-btn animate-fade' + (isSelected ? ' selected' : '');
      btn.innerHTML = '<span>' + String.fromCharCode(65 + index) + '</span> ' + opcion;
      btn.onclick = (function (idx) { return function () { handleAnswer(idx); }; })(index);
      optionsGrid.appendChild(btn);
    });
  }

  renderNavButtons();
  window.scrollTo(0, 0);
}

function renderNavButtons() {
  var navContainer = document.getElementById('quiz-nav-buttons');
  if (!navContainer) {
    navContainer = document.createElement('div');
    navContainer.id = 'quiz-nav-buttons';
    navContainer.className = 'nav-buttons';
    document.getElementById('question-container').appendChild(navContainer);
  }
  navContainer.innerHTML = '';

  var prevBtn = document.createElement('button');
  prevBtn.className = 'btn-secondary';
  prevBtn.innerText = '← Anterior';
  prevBtn.style.visibility = currentIndex > 0 ? 'visible' : 'hidden';
  prevBtn.onclick = function () {
    if (currentIndex > 0) { currentIndex--; renderQuestion(); }
  };

  var nextBtn = document.createElement('button');
  nextBtn.className = 'btn-primary';
  nextBtn.style.width = 'auto';

  if (currentIndex < questions.length - 1) {
    nextBtn.innerText = 'Siguiente →';
    nextBtn.onclick = function () {
      if (userAnswers[currentIndex] === null) {
        alert('Por favor, selecciona una opción antes de continuar.');
        return;
      }
      currentIndex++;
      renderQuestion();
    };
  } else {
    nextBtn.innerText = 'Finalizar Evaluación';
    nextBtn.onclick = function () {
      if (userAnswers[currentIndex] === null) {
        alert('Por favor, selecciona una opción antes de finalizar.');
        return;
      }
      finishQuiz();
    };
  }

  navContainer.appendChild(prevBtn);
  navContainer.appendChild(nextBtn);
}

function handleAnswer(selectedIndex) {
  userAnswers[currentIndex] = selectedIndex;
  renderQuestion();
}

function finishQuiz() {
  document.getElementById('quiz-screen').classList.add('hidden');
  document.getElementById('result-screen').classList.remove('hidden');
  var pf = document.getElementById('progress-fill');
  if (pf) pf.style.width = '100%';

  var score = 0;
  questions.forEach(function (q, index) {
    if (q.respuesta === userAnswers[index]) score += 10;
  });

  document.getElementById('final-score').innerText = score;

  var nameDisplay = document.getElementById('student-name-display');
  if (nameDisplay) nameDisplay.innerText = 'Estudiante: ' + studentName;

  var feedback = document.getElementById('feedback-text');
  if (feedback) {
    if (score >= 90) feedback.innerText = '¡Excelente trabajo! Dominas el tema.';
    else if (score >= 70) feedback.innerText = '¡Muy bien! Repasa el resumen inferior y participa con tus dudas en clase.';
    else if (score >= 50) feedback.innerText = 'Aprobado. Lee cada explicación del resumen y vuelve a intentarlo.';
    else feedback.innerText = 'Sigue estudiando: lee las explicaciones del resumen y repasa la teoría con el profesor.';
  }

  renderSummary();
}

function renderSummary() {
  var summaryContainer = document.getElementById('quiz-summary');
  if (!summaryContainer) {
    summaryContainer = document.createElement('div');
    summaryContainer.id = 'quiz-summary';
    summaryContainer.className = 'summary-container';
    var resultScreen = document.getElementById('result-screen');
    resultScreen.insertBefore(summaryContainer, resultScreen.lastElementChild);
  }

  summaryContainer.innerHTML = '<h3 style="margin-bottom:1.5rem;text-align:center;">Resumen para retroalimentación en clase:</h3>';

  questions.forEach(function (q, index) {
    var userAnswerIndex = userAnswers[index];
    var isCorrect = userAnswerIndex === q.respuesta;

    var item = document.createElement('div');
    item.className = 'summary-item ' + (isCorrect ? 'correct' : 'incorrect');

    var textoRespuesta;
    if (q.tipo === 'vf') {
      textoRespuesta = userAnswerIndex === 0 ? 'Verdadero' : (userAnswerIndex === 1 ? 'Falso' : 'Sin responder');
    } else {
      textoRespuesta = (q.opciones && q.opciones[userAnswerIndex]) || 'Sin responder';
    }

    var textoCorrecta;
    if (q.tipo === 'vf') {
      textoCorrecta = q.respuesta === 0 ? 'Verdadero' : 'Falso';
    } else {
      textoCorrecta = q.opciones[q.respuesta];
    }

    var html = '<p style="font-weight:600;margin-bottom:.5rem;">' + (index + 1) + '. ' + q.pregunta + '</p>';
    html += '<p style="margin-bottom:.25rem;color:' + (isCorrect ? '#1E5E3A' : '#9E3B2B') + '">';
    html += '<strong>Tu respuesta:</strong> ' + textoRespuesta + '</p>';

    if (!isCorrect) {
      html += '<p style="color:#1E5E3A"><strong>Respuesta correcta:</strong> ' + textoCorrecta + '</p>';
    }
    if (q.explicacion) {
      html += '<div class="summary-expl"><strong>💡 Explicación:</strong> ' + q.explicacion + '</div>';
    }

    item.innerHTML = html;
    summaryContainer.appendChild(item);
  });
}
