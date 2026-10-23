/**
 * MecaSamType Web — Motor de tecleo
 *
 * Responsabilidades:
 *  - Pintar el texto objetivo carácter a carácter.
 *  - Comparar la entrada real (incluye acentos compuestos y ñ).
 *  - Calcular WPM, precisión, errores y tiempo activo.
 *  - Gestionar pausa, reanudación, backspace y finalización.
 *
 * La entrada de teclado se hace con un <input> oculto para que el navegador
 * componga correctamente á, é, í, ó, ú, ü y ñ con el teclado español.
 */

const normalizeChar = (char) => {
  const normalized = String(char ?? "").normalize("NFC");
  return normalized === "\u00A0" ? " " : normalized;
};

export class TypingEngine {
  constructor({
    text,
    container,
    onUpdate = () => {},
    onComplete = () => {},
    onKey = () => {},
  }) {
    this.text = Array.from(String(text ?? ""));
    this.container = container;
    this.onUpdate = onUpdate;
    this.onComplete = onComplete;
    this.onKey = onKey;

    this.spans = [];
    this.index = 0;
    this.results = [];
    this.totalKeystrokes = 0;
    this.correctKeystrokes = 0;
    this.mistakes = 0;

    this.started = false;
    this.finished = false;
    this.paused = false;
    this.accumulated = 0;
    this.lastResume = 0;
    this.ticker = null;

    this.build();
    this.emit();
  }

  build() {
    this.container.innerHTML = "";
    const fragment = document.createDocumentFragment();

    this.spans = this.text.map((char) => {
      const span = document.createElement("span");
      span.className = "char" + (char === " " ? " is-space" : "");
      span.textContent = char;
      fragment.appendChild(span);
      return span;
    });

    this.container.appendChild(fragment);
    if (this.spans[0]) this.spans[0].classList.add("is-current");
  }

  start() {
    if (this.started || this.finished) return;
    this.started = true;
    this.lastResume = performance.now();
    this.ticker = window.setInterval(() => this.emit(), 100);
  }

  elapsedMs() {
    if (!this.started) return 0;
    if (this.paused || this.finished) return this.accumulated;
    return this.accumulated + (performance.now() - this.lastResume);
  }

  stats() {
    const elapsed = this.elapsedMs();
    const minutes = elapsed / 60000;
    const wpm = minutes > 0 ? (this.correctKeystrokes / 5 / minutes) : 0;
    const accuracy = this.totalKeystrokes
      ? (this.correctKeystrokes / this.totalKeystrokes) * 100
      : 100;

    return {
      wpm: Math.round(wpm * 10) / 10,
      accuracy: Math.round(accuracy * 10) / 10,
      errors: this.mistakes,
      correctKeystrokes: this.correctKeystrokes,
      totalKeystrokes: this.totalKeystrokes,
      duration: Math.round(elapsed / 1000),
      elapsedMs: elapsed,
      index: this.index,
      length: this.text.length,
      progress: this.text.length ? this.index / this.text.length : 0,
      nextChar: this.index < this.text.length ? this.text[this.index] : null,
      started: this.started,
      finished: this.finished,
      paused: this.paused,
    };
  }

  emit() {
    if (this.finished && !this.started) return;
    this.onUpdate(this.stats());
  }

  handleChar(rawChar) {
    if (this.finished || this.paused) return false;
    if (this.index >= this.text.length) return false;

    const char = normalizeChar(rawChar);
    if (!char || char === "\n" || char === "\r" || char === "\t") return false;

    if (!this.started) this.start();

    const expected = this.text[this.index];
    const correct = char === expected;

    this.totalKeystrokes += 1;
    if (correct) {
      this.correctKeystrokes += 1;
    } else {
      this.mistakes += 1;
    }
    this.results.push(correct);

    const span = this.spans[this.index];
    if (span) {
      span.classList.remove("is-current");
      span.classList.add(correct ? "is-correct" : "is-wrong");
    }
    this.index += 1;

    if (this.index < this.text.length) {
      this.spans[this.index].classList.add("is-current");
    }

    this.onKey({ char, expected, correct });
    this.scrollToCurrent();
    this.emit();

    if (this.index >= this.text.length) this.finish();
    return correct;
  }

  backspace() {
    if (this.finished || this.paused || this.index === 0) return;

    this.index -= 1;
    this.results.pop();

    const span = this.spans[this.index];
    if (span) {
      span.classList.remove("is-correct", "is-wrong", "is-current");
      span.classList.add("is-current");
    }
    if (this.spans[this.index + 1]) {
      this.spans[this.index + 1].classList.remove("is-current");
    }

    this.onKey({ char: null, expected: this.text[this.index], correct: true, backspace: true });
    this.scrollToCurrent();
    this.emit();
  }

  scrollToCurrent() {
    const box = this.container?.closest(".stream-box");
    const span = this.spans[this.index];
    if (!box || !span || box.scrollHeight <= box.clientHeight + 2) return;

    const boxRect = box.getBoundingClientRect();
    const spanRect = span.getBoundingClientRect();
    if (spanRect.bottom > boxRect.bottom - 14 || spanRect.top < boxRect.top + 14) {
      box.scrollTop += spanRect.top - boxRect.top - box.clientHeight / 2 + spanRect.height / 2;
    }
  }

  pause() {
    if (!this.started || this.finished || this.paused) return;
    this.accumulated += performance.now() - this.lastResume;
    this.paused = true;
    this.stopTicker();
    this.emit();
  }

  resume() {
    if (!this.paused || this.finished) return;
    this.paused = false;
    this.lastResume = performance.now();
    this.ticker = window.setInterval(() => this.emit(), 100);
    this.emit();
  }

  stopTicker() {
    if (this.ticker) {
      window.clearInterval(this.ticker);
      this.ticker = null;
    }
  }

  finish() {
    if (this.finished) return;
    if (this.started && !this.paused) {
      this.accumulated += performance.now() - this.lastResume;
    }
    this.finished = true;
    this.paused = false;
    this.stopTicker();
    this.emit();
    this.onComplete(this.stats());
  }

  /** Detiene el motor (sprint por tiempo) aunque no se haya terminado el texto. */
  stop() {
    if (!this.finished) this.finish();
    return this.stats();
  }

  destroy() {
    this.stopTicker();
    if (this.container) this.container.innerHTML = "";
    this.spans = [];
  }
}
