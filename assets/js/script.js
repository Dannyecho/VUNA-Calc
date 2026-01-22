// ============================================
// CALCULATOR STATE & CORE LOGIC
// ============================================

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
  currentExpression = "";
  document.getElementById("word-result-text").textContent = "";
  document.getElementById("word-area").style.display = "none";
  updateResult();
}

/**
 * Evaluate the expression using advanced math engine
 * Supports PEMDAS, parentheses, and chained operations
 */
function calculateResult() {
  if (currentExpression.length === 0) return;

  try {
    // Evaluate the expression using safe eval with Function constructor
    // This properly handles parentheses and order of operations
    const result = evaluateExpression(currentExpression);

    if (result === "Error" || isNaN(result) || !isFinite(result)) {
      currentExpression = "Error";
    } else {
      // Save to history before updating
      saveToHistory(currentExpression, result);

      // Update current expression with result
      currentExpression = result.toString();
    }
  } catch (error) {
    currentExpression = "Error";
  }

  updateResult();
}

/**
 * Safe expression evaluator with PEMDAS support
 * Uses Function constructor for safe evaluation
 */
function evaluateExpression(expr) {
  // Replace division by zero check
  if (expr.includes("/0")) {
    return "Error";
  }

  // Clean the expression
  const cleanExpr = expr.replace(/[^0-9+\-*/.()]/g, "");

  // Use Function constructor for safe evaluation (supports PEMDAS)
  try {
    const result = new Function("return " + cleanExpr)();
    return parseFloat(result.toFixed(10)); // Round to avoid floating point errors
  } catch (e) {
    return "Error";
  }
}

// ============================================
// HISTORY MANAGEMENT
// ============================================

/**
 * Save calculation to history
 */
function saveToHistory(expression, result) {
  const historyItem = {
    expression: expression,
    result: result,
    expressionWords: expressionToWords(expression, result),
    timestamp: new Date().toISOString(),
  };

  calculationHistory.unshift(historyItem); // Add to beginning

  // Keep only last 50 items
  if (calculationHistory.length > 50) {
    calculationHistory.pop();
  }

  saveHistoryToStorage();
  renderHistory();
}

/**
 * Convert expression to English words
 * This preserves the unique number-to-words feature!
 */
function expressionToWords(expression, result) {
  // Parse the expression to extract operands and operators
  let words = expression
    .replace(/\*/g, " times ")
    .replace(/\//g, " divided by ")
    .replace(/\+/g, " plus ")
    .replace(/\-/g, " minus ")
    .replace(/\(/g, "open bracket ")
    .replace(/\)/g, " close bracket");

  // Replace numbers with words (simplified version for history)
  words = words.replace(/(\d+\.?\d*)/g, (match) => {
    const num = parseFloat(match);
    return numberToWords(num);
  });

  words += " equals " + numberToWords(result);

  return words.trim();
}

/**
 * Clear all history
 */
function clearHistory() {
  if (calculationHistory.length === 0) return;

  if (confirm("Clear all calculation history?")) {
    calculationHistory = [];
    saveHistoryToStorage();
    renderHistory();
  }
}

/**
 * Render history items to the DOM
 */
function renderHistory() {
  const historyList = document.getElementById("history-list");
  const clearBtn = document.getElementById("clear-history-btn");

  historyList.innerHTML = "";

  if (calculationHistory.length === 0) {
    const template = document.getElementById("history-empty-template");
    const clone = template.content.cloneNode(true);
    historyList.appendChild(clone);
    clearBtn.disabled = true;
    return;
  }

  clearBtn.disabled = false;
  const template = document.getElementById("history-item-template");

  calculationHistory.forEach((item, index) => {
    const clone = template.content.cloneNode(true);
    const time = formatTimestamp(item.timestamp);
    const displayExpr = item.expression.replace(/\*/g, "×").replace(/\//g, "÷");

    const historyItem = clone.querySelector(".history-item");
    historyItem.onclick = () => loadFromHistory(index);

    clone.querySelector(".history-item-expression").textContent =
      `${displayExpr} = ${item.result}`;
    clone.querySelector(".history-item-words").textContent =
      item.expressionWords;
    clone.querySelector(".history-item-time").textContent = time;

    historyList.appendChild(clone);
  });
}

/**
 * Load a calculation from history
 */
function loadFromHistory(index) {
  const item = calculationHistory[index];
  if (item) {
    currentExpression = item.result.toString();
    updateResult();
  }
}

/**
 * Format timestamp for display
 */
function formatTimestamp(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;

  return date.toLocaleDateString() + " " + date.toLocaleTimeString();
}

/**
 * Save history to localStorage
 */
function saveHistoryToStorage() {
  try {
    localStorage.setItem(
      "vuna_calc_history",
      JSON.stringify(calculationHistory),
    );
  } catch (e) {
    console.error("Failed to save history:", e);
  }
}

/**
 * Load history from localStorage
 */
function loadHistoryFromStorage() {
  try {
    const stored = localStorage.getItem("vuna_calc_history");
    if (stored) {
      calculationHistory = JSON.parse(stored);
    }
  } catch (e) {
    console.error("Failed to load history:", e);
    calculationHistory = [];
  }
}

// ============================================
// NUMBER TO WORDS CONVERTER
// ============================================

// ============================================
// NUMBER TO WORDS CONVERTER
// ============================================

/**
 * Convert a number to English words
 * Handles integers, decimals, and negative numbers
 */
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
