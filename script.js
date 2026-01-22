
var left = "";
var operator = "";
var right = "";
var steps = [];
var MAX_STEPS = 6;

var currentLanguage = "en";


document.addEventListener("DOMContentLoaded", function () {
  const langSelect = document.getElementById("languageSelect");
  if (!langSelect) return;

  langSelect.addEventListener("change", function () {
    currentLanguage = this.value;
    const stepsTitle = document.querySelector("h6");
    if (stepsTitle) {
      stepsTitle.textContent = currentLanguage === "de" ? "Schritte" : "Steps";
    }
    if (left && !operator && !right) updateResult();
  });
});


function appendToResult(value) {
  operator ? (right += value) : (left += value);
  updateResult();
}

function bracketToResult(value) {
  operator ? (right += value) : (left += value);
  updateResult();
}

function backspace() {
  if (right) right = right.slice(0, -1);
  else if (operator) operator = "";
  else left = left.slice(0, -1);
  updateResult();
}

function operatorToResult(value) {
  if (!left) return;
  if (right) calculateResult();
  operator = value;
  updateResult();
}

function clearResult() {
  left = right = operator = "";
  steps = [];
  document.getElementById("word-area").style.display = "none";
  document.getElementById("steps").innerText = "";
  updateResult();
}


function calculateResult() {
  if (!left || !operator || !right) return;

  const l = parseFloat(left);
  const r = parseFloat(right);
  let result;

  switch (operator) {
    case "+": result = l + r; break;
    case "-": result = l - r; break;
    case "*": result = l * r; break;
    case "/": result = r !== 0 ? l / r : "Error"; break;
    default: return;
  }

  if (steps.length < MAX_STEPS) {
    steps.push(
      (currentLanguage === "de" ? "Schritt " : "Step ") +
      (steps.length + 1) + `: ${l} ${operator} ${r} = ${result}`
    );
  }

  left = result.toString();
  operator = right = "";
  updateStepsDisplay();
  updateResult();
}


function numberToWords(num) {
  return currentLanguage === "de"
    ? numberToWordsDE(num)
    : numberToWordsEN(num);
}


function numberToWordsEN(num) {
  if (num === "Error") return "Error";
  const n = parseFloat(num);
  if (isNaN(n)) return "";
  if (n === 0) return "Zero";

  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
  const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const scales = ["", "Thousand", "Million", "Billion", "Trillion", "Quadrillion"];

  function convertBelow1000(n) {
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    if (n < 100)
      return tens[Math.floor(n / 10)] + (n % 10 ? "-" + ones[n % 10] : "");
    return ones[Math.floor(n / 100)] + " Hundred" +
      (n % 100 ? " " + convertBelow1000(n % 100) : "");
  }

  function convertNumber(n) {
    let words = "";
    let scaleIndex = 0;

    while (n > 0) {
      const chunk = n % 1000;
      if (chunk) {
        words = convertBelow1000(chunk) +
          (scales[scaleIndex] ? " " + scales[scaleIndex] : "") +
          (words ? " " + words : "");
      }
      n = Math.floor(n / 1000);
      scaleIndex++;
    }
    return words;
  }

  const sign = n < 0 ? "Negative " : "";
  const [intPart, decPart] = Math.abs(n).toString().split(".");
  let result = convertNumber(parseInt(intPart, 10));

  if (decPart) {
    result += " Point";
    for (let d of decPart) result += " " + ones[parseInt(d)];
  }

  return (sign + result).trim();
}


function numberToWordsDE(num) {
  if (num === "Error") return "Fehler";
  const n = parseFloat(num);
  if (isNaN(n)) return "";
  if (n === 0) return "null";

  const ones = ["", "eins", "zwei", "drei", "vier", "fünf", "sechs", "sieben", "acht", "neun"];
  const onesC = ["", "ein", "zwei", "drei", "vier", "fünf", "sechs", "sieben", "acht", "neun"];
  const teens = ["zehn", "elf", "zwölf", "dreizehn", "vierzehn", "fünfzehn", "sechzehn", "siebzehn", "achtzehn", "neunzehn"];
  const tens = ["", "", "zwanzig", "dreißig", "vierzig", "fünfzig", "sechzig", "siebzig", "achtzig", "neunzig"];
  const scales = ["", "tausend", "Million", "Milliarde", "Billion", "Billiarde"];

  function convertBelow1000(n) {
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    if (n < 100)
      return (n % 10 ? onesC[n % 10] + "und" : "") + tens[Math.floor(n / 10)];
    return onesC[Math.floor(n / 100)] + "hundert" +
      (n % 100 ? convertBelow1000(n % 100) : "");
  }

  function convertNumber(n) {
    let words = "";
    let scaleIndex = 0;

    while (n > 0) {
      const chunk = n % 1000;
      if (chunk) {
        let part = convertBelow1000(chunk);
        if (scaleIndex === 1 && chunk === 1) part = "eintausend";
        else if (scaleIndex > 0) part += scales[scaleIndex];
        words = part + (words ? " " + words : "");
      }
      n = Math.floor(n / 1000);
      scaleIndex++;
    }
    return words;
  }

  const sign = n < 0 ? "minus " : "";
  const [intPart, decPart] = Math.abs(n).toString().split(".");
  let result = convertNumber(parseInt(intPart, 10));

  if (decPart) {
    result += " Komma";
    for (let d of decPart) result += " " + ones[parseInt(d)];
  }

  return (sign + result).trim();
}


function updateResult() {
  const display = left + (operator ? " " + operator + " " : "") + right;
  document.getElementById("result").value = display || "0";

  const wordArea = document.getElementById("word-area");
  const wordResult = document.getElementById("word-result");

  if (left && !operator && !right) {
    wordResult.innerHTML =
      `<span class="small-label">${currentLanguage === "de" ? "Ergebnis in Worten" : "Result in words"}</span><strong>` +
      numberToWords(left) +
      "</strong>";
    wordArea.style.display = "flex";
  } else {
    wordArea.style.display = "none";
  }
  enableSpeakButton();
}

function speakResult() {
  const words = document.querySelector("#word-result strong")?.innerText;
  if (!words) return;
  const u = new SpeechSynthesisUtterance(words);
  u.lang = currentLanguage === "de" ? "de-DE" : "en-US";
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

function enableSpeakButton() {
  const btn = document.getElementById("speak-btn");
  if (btn) btn.disabled = !document.getElementById("word-result").innerText.trim();
}

function updateStepsDisplay() {
  document.getElementById("steps").innerText = steps.join("\n");
}
