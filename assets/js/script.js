let expression = "";
let speechEnabled = true;
let language = "pt";
let history = [];
let showHistory = false;

/* ===== SPEECH ===== */
function speak(text) {
  if (!speechEnabled) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = language === "pt" ? "pt-PT" : "en-US";
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
}

/* ===== TOGGLES ===== */
function toggleSpeech() {
  speechEnabled = !speechEnabled;
}

function toggleLanguage() {
  language = language === "pt" ? "en" : "pt";
  speak(language === "pt" ? "português" : "english");
}

function toggleHistory() {
  showHistory = !showHistory;
  const area = document.getElementById("word-area");

  if (showHistory) {
    area.innerHTML = history.length
      ? history.join("<br>")
      : "No history";
  } else {
    area.innerHTML = "";
  }
}

/* ===== INPUT ===== */
function inputValue(val) {
  expression += val;
  document.getElementById("result").value = expression;
  speak(val);
}

function backspace() {
  expression = expression.slice(0, -1);
  document.getElementById("result").value = expression;
}

/* ===== CALCULATE ===== */
function calculate() {
  try {
    const res = eval(expression);
    history.unshift(expression + " = " + res);
    document.getElementById("result").value = res;
    expression = res.toString();
    speak(language === "pt" ? "resultado " + res : "result " + res);
  } catch {
    speak(language === "pt" ? "erro" : "error");
  }
}

/* ===== INTEGRAL ===== */
function integrate() {
  const a = parseFloat(prompt("Lower limit (a):"));
  const b = parseFloat(prompt("Upper limit (b):"));
  if (isNaN(a) || isNaN(b)) return;

  let expr = expression.replace(/dx/g, "").trim();

  let result;

  if (expr === "") {
    // ∫dx = b - a
    result = (b - a).toFixed(4);
  } else {
    // Numerical integration using trapezoid rule
    let n = 1000;
    let h = (b - a) / n;
    let sum = 0;

    for (let i = 0; i <= n; i++) {
      let x = a + i * h;
      // Support powers like x^2
      let fxExpression = expr.replace(/\^/g, "**");
      let fx = eval(fxExpression.replace(/x/g, `(${x})`));
      sum += fx;
    }

    result = (sum * h).toFixed(4);
  }

  history.unshift(`∫(${expression}) = ${result}`);
  document.getElementById("result").value = result;
  expression = result.toString();

  speak(language === "pt" ? "integral " + result : "integral result " + result);
}

/* ===== CLEAR ===== */
function clearAll() {
  expression = "";
  document.getElementById("result").value = "";
  speak(language === "pt" ? "limpo" : "cleared");
}
