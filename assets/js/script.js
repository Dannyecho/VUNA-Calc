var left = '';
var operator = '';
var right = '';
var steps = [];
var MAX_STEPS = 6;


// Using expression-based approach instead of left/operator/right
var currentExpression = "";
var calculationHistory = [];

// Load history from localStorage on page load
document.addEventListener("DOMContentLoaded", function () {
  loadHistoryFromStorage();
  renderHistory();
});

/**
 * Append a digit or decimal point to the expression
 */
function appendToResult(value) {
  currentExpression += value.toString();
  updateResult();
}

/**
 * Add brackets to the expression (now fully functional!)
 */
function bracketToResult(value) {
  currentExpression += value;
  updateResult();
}

/**
 * Remove last character from expression (backspace)
 */
function backspace() {
  currentExpression = currentExpression.slice(0, -1);
  updateResult();
}

/**
 * Add an operator to the expression
 */
function operatorToResult(value) {
  if (currentExpression.length === 0) return;

  // Convert display symbols to actual operators
  const actualOperator = value === "×" ? "*" : value === "÷" ? "/" : value;
  currentExpression += actualOperator;
  updateResult();
}

/**
 * Clear all - reset calculator
 */
function clearResult() {
  left = "";
  right = "";
  operator = "";
  steps = [];

  document.getElementById("word-result").innerHTML = "";
  document.getElementById("word-area").style.display = "none";
  document.getElementById("steps").innerText = "";

  updateResult();
}



function calculateResult() {
  if (left.length === 0 || operator.length === 0 || right.length === 0) return;

  const l = parseFloat(left);
  const r = parseFloat(right);
  let result;

  switch (operator) {
    case "+":
      result = l + r;
      break;
    case "-":
      result = l - r;
      break;
    case "*":
      result = l * r;
      break;
    case "/":
      result = r !== 0 ? l / r : "Error";
      break;
    default:
      return;
  }

  if (steps.length < MAX_STEPS) {
    steps.push(`Step ${steps.length + 1}: ${l} ${operator} ${r} = ${result}`);
  }

  left = result.toString();
  operator = "";
  right = "";

  updateStepsDisplay();
  updateResult();
}



function numberToWords(num) {
  if (num === "Error") return "Error";
  if (num === "") return "";

  const n = parseFloat(num);
  if (isNaN(n)) return "";
  if (n === 0) return "Zero";

  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];
  const teens = [
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const scales = ["", "Thousand", "Million", "Billion", "Trillion"];

  function convertGroup(val) {
    let res = "";
    if (val >= 100) {
      res += ones[Math.floor(val / 100)] + " Hundred ";
      val %= 100;
    }
    if (val >= 10 && val <= 19) {
      res += teens[val - 10] + " ";
    } else if (val >= 20) {
      res +=
        tens[Math.floor(val / 10)] +
        (val % 10 !== 0 ? "-" + ones[val % 10] : "") +
        " ";
    } else if (val > 0) {
      res += ones[val] + " ";
    }
    return res.trim();
  }

  let sign = n < 0 ? "Negative " : "";
  let absN = Math.abs(n);
  let parts = absN.toString().split(".");
  let integerPart = parseInt(parts[0]);
  let decimalPart = parts[1];

  let wordArr = [];
  if (integerPart === 0) {
    wordArr.push("Zero");
  } else {
    let scaleIdx = 0;
    while (integerPart > 0) {
      let chunk = integerPart % 1000;
      if (chunk > 0) {
        let chunkWords = convertGroup(chunk);
        wordArr.unshift(
          chunkWords + (scales[scaleIdx] ? " " + scales[scaleIdx] : ""),
        );
      }
      integerPart = Math.floor(integerPart / 1000);
      scaleIdx++;
    }
  }

  let result = sign + wordArr.join(", ").trim();

  if (decimalPart) {
    result += " Point";
    for (let digit of decimalPart) {
      result += " " + (digit === "0" ? "Zero" : ones[parseInt(digit)]);
    }
  }

  return result.trim();
}

// ============================================
// DISPLAY UPDATE
// ============================================

/**
 * Update the calculator display and word result
 */
function updateResult() {
  const display = currentExpression.replace(/\*/g, "×").replace(/\//g, "÷");

  document.getElementById("result").value = display || "0";

  const wordResult = document.getElementById("word-result");
  const wordArea = document.getElementById("word-area");

  // Show word result only when we have a single number (result after calculation)
  const isSimpleNumber = /^-?\d+\.?\d*$/.test(currentExpression);
  const wordResultText = document.getElementById("word-result-text");

  if (isSimpleNumber && currentExpression && currentExpression !== "Error") {
    const words = numberToWords(currentExpression);
    wordResultText.textContent = words;
    wordArea.style.display = "flex";
  } else {
    wordResultText.textContent = "";
    wordArea.style.display = "none";
  }

  enableSpeakButton();
}

// ============================================
// TEXT-TO-SPEECH FUNCTIONALITY
// ============================================

/**
 * Speak the current result using Web Speech API
 */
function speakResult() {
  const speakBtn = document.getElementById("speak-btn");
  const words = document.getElementById("word-result-text")?.textContent || "";

  if (!words) return;

  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
    speakBtn.classList.remove("speaking");
    return;
  }

  const utterance = new SpeechSynthesisUtterance(words);
  utterance.rate = 0.9;
  utterance.onstart = () => speakBtn.classList.add("speaking");
  utterance.onend = () => speakBtn.classList.remove("speaking");
  window.speechSynthesis.speak(utterance);
}

/**
 * Enable/disable speak button based on whether there's content to speak
 */
function enableSpeakButton() {
  const speakBtn = document.getElementById("speak-btn");
  if (!speakBtn) return;
  const wordResultText = document.getElementById("word-result-text");
  const hasContent =
    wordResultText && wordResultText.textContent.trim().length > 0;
  speakBtn.disabled = !hasContent;
}

/**
 * Toggle history visibility
 */
function toggleHistory() {
  const historyCol = document.getElementById("history-column");
  const btn = document.getElementById("toggle-history-btn");

  if (historyCol.classList.contains("d-none")) {
    historyCol.classList.remove("d-none");
    btn.textContent = "Hide History";
    btn.classList.replace("btn-primary", "btn-outline-primary");
  } else {
    historyCol.classList.add("d-none");
    btn.textContent = "Show History";
    btn.classList.replace("btn-outline-primary", "btn-primary");
  }
}

function updateStepsDisplay() {
  const stepsDiv = document.getElementById("steps");
  if (!stepsDiv) return;

  stepsDiv.innerText = steps.join("\n");
}
