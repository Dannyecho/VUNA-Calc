var currentExpression = "";
var currentLanguage = "english";
let calculationHistory = [];

document.addEventListener("DOMContentLoaded", function () {
  loadHistoryFromStorage();
  renderHistory();
});

function appendToResult(value) {
  currentExpression += value.toString();
  updateResult();
}

function backspace() {
  currentExpression = currentExpression.slice(0, -1);
  updateResult();
}

function operatorToResult(value) {
  currentExpression += value;
  updateResult();
}

function clearResult() {
  currentExpression = "";
  document.getElementById("word-result").innerHTML = "";
  document.getElementById("word-area").style.display = "none";
  updateResult();
}

function calculateResult() {
  if (!currentExpression) return;

  try {
    var result = eval(currentExpression);

    if (isNaN(result) || !isFinite(result)) {
      throw new Error();
    }

    calculationHistory.push({
      expression: currentExpression,
      words: numberToWords(result),
      answer: result,
      time: new Date().toLocaleTimeString(),
    });

    if (calculationHistory.length > 20) calculationHistory.shift();

    localStorage.setItem("calcHistory", JSON.stringify(calculationHistory));
    renderHistory();

    currentExpression = result.toString();
    updateResult();
    showEnglish();
  } catch (e) {
    currentExpression = "Error";
    updateResult();
  }
}

function updateResult() {
  document.getElementById("result").value = currentExpression || "0";

  var wordResult = document.getElementById("word-result");
  var wordArea = document.getElementById("word-area");

  var num = parseFloat(currentExpression);
  if (!isNaN(num) && isFinite(num) && currentExpression.trim() === num.toString()) {
    if (currentLanguage === "german") {
      wordResult.innerHTML =
        '<span class="small-label">Ergebnis in Worten</span><strong>' +
        numberToGerman(currentExpression) +
        "</strong>";
    } else {
      wordResult.innerHTML =
        '<span class="small-label">Result in words</span><strong>' +
        numberToWords(currentExpression) +
        "</strong>";
    }
    wordArea.style.display = "flex";
  } else {
    wordResult.innerHTML = "";
    wordArea.style.display = "none";
  }

  enableSpeakButton();
}

function showEnglish() {
  currentLanguage = "english";
  if (!currentExpression) return;
  updateResult();
}

function showGerman() {
  currentLanguage = "german";
  if (!currentExpression) return;
  updateResult();
}

function speakResult() {
  var speakBtn = document.getElementById("speak-btn");
  var wordResultEl = document.getElementById("word-result");
  var words = wordResultEl.querySelector("strong")?.innerText || "";

  if (!words) return;

  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
    speakBtn.classList.remove("speaking");
    return;
  }

  var utterance = new SpeechSynthesisUtterance(words);
  utterance.rate = 0.9;

  if (currentLanguage === "german") {
    utterance.lang = "de-DE";
  } else {
    utterance.lang = "en-US";
  }

  utterance.onstart = function () { speakBtn.classList.add("speaking"); };
  utterance.onend = function () { speakBtn.classList.remove("speaking"); };

  window.speechSynthesis.speak(utterance);
}

function enableSpeakButton() {
  var speakBtn = document.getElementById("speak-btn");
  if (!speakBtn) return;
  var hasContent = document.getElementById("word-result").innerHTML.trim().length > 0;
  speakBtn.disabled = !hasContent;
}

function copyResult() {
  var text = document.getElementById("result").value;
  if (!text) return;

  navigator.clipboard
    .writeText(text)
    .then(function () { alert("Result copied!"); })
    .catch(function () { alert("Failed to copy"); });
}

function numberToWords(num) {
  if (num === "Error") return "Error";
  if (!num) return "";

  var n = parseFloat(num);
  if (isNaN(n)) return "";
  if (n === 0) return "Zero";

  var ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
  var tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  var teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  var scales = ["", "Thousand", "Million", "Billion", "Trillion"];

  function convertGroup(val) {
    var res = "";
    if (val >= 100) {
      res += ones[Math.floor(val / 100)] + " Hundred ";
      val %= 100;
    }
    if (val >= 10 && val <= 19) {
      res += teens[val - 10] + " ";
    } else if (val >= 20) {
      res += tens[Math.floor(val / 10)];
      if (val % 10 !== 0) res += "-" + ones[val % 10];
      res += " ";
    } else if (val > 0) {
      res += ones[val] + " ";
    }
    return res.trim();
  }

  var sign = n < 0 ? "Negative " : "";
  var absN = Math.abs(n);
  var parts = absN.toString().split(".");
  var integerPart = parseInt(parts[0]);
  var decimalPart = parts[1];
  var wordArr = [];

  if (integerPart === 0) {
    wordArr.push("Zero");
  } else {
    var scaleIdx = 0;
    while (integerPart > 0) {
      var chunk = integerPart % 1000;
      if (chunk > 0) {
        var chunkWords = convertGroup(chunk);
        wordArr.unshift(chunkWords + (scales[scaleIdx] ? " " + scales[scaleIdx] : ""));
      }
      integerPart = Math.floor(integerPart / 1000);
      scaleIdx++;
    }
  }

  var result = sign + wordArr.join(", ").trim();

  if (decimalPart) {
    result += " Point";
    for (var i = 0; i < decimalPart.length; i++) {
      result += " " + (decimalPart[i] === "0" ? "Zero" : ones[parseInt(decimalPart[i])]);
    }
  }
  return result.trim();
}

function numberToGerman(num) {
  if (num === "Error") return "Fehler";
  if (!num) return "";

  var n = parseFloat(num);
  if (isNaN(n)) return "";
  if (n === 0) return "Null";

  var ones = ["", "ein", "zwei", "drei", "vier", "fünf", "sechs", "sieben", "acht", "neun"];
  var tens = ["", "", "zwanzig", "dreißig", "vierzig", "fünfzig", "sechzig", "siebzig", "achtzig", "neunzig"];
  var teens = ["zehn", "elf", "zwölf", "dreizehn", "vierzehn", "fünfzehn", "sechzehn", "siebzehn", "achtzehn", "neunzehn"];

  function convertGroup(val, isLastGroup) {
    var res = "";
    var hundreds = Math.floor(val / 100);
    var remainder = val % 100;

    if (hundreds > 0) {
      if (hundreds === 1) {
        res += "einhundert";
      } else {
        res += ones[hundreds] + "hundert";
      }
    }

    if (remainder === 1 && !isLastGroup) {
      res += "ein";
    } else if (remainder === 1 && isLastGroup) {
      res += "eins";
    } else if (remainder === 0) {
    } else if (remainder >= 1 && remainder <= 9) {
      res += ones[remainder];
    } else if (remainder >= 10 && remainder <= 19) {
      res += teens[remainder - 10];
    } else {
      var one = remainder % 10;
      var ten = Math.floor(remainder / 10);
      if (one === 0) {
        res += tens[ten];
      } else if (one === 1) {
        res += "einund" + tens[ten];
      } else {
        res += ones[one] + "und" + tens[ten];
      }
    }

    return res;
  }

  var sign = n < 0 ? "Minus " : "";
  var absN = Math.abs(n);
  var parts = absN.toString().split(".");
  var integerPart = parseInt(parts[0]);
  var decimalPart = parts[1];
  var wordArr = [];

  if (integerPart === 0) {
    wordArr.push("Null");
  } else {
    var scaleIdx = 0;
    var scales = ["", "tausend", "Million", "Milliarde", "Billion", "Billiarde"];
    var isFirst = true;

    while (integerPart > 0) {
      var chunk = integerPart % 1000;
      if (chunk > 0) {
        var isLastGroup = isFirst;
        var chunkWords = convertGroup(chunk, isLastGroup);
        if (scaleIdx > 0) {
          if (scaleIdx === 1) {
            chunkWords += chunkWords ? scales[scaleIdx] : "tausend";
          } else {
            if (chunk === 1) {
              chunkWords = "eine " + scales[scaleIdx];
            } else {
              chunkWords += " " + scales[scaleIdx] + "en";
            }
          }
        }
        wordArr.unshift(chunkWords);
      }
      integerPart = Math.floor(integerPart / 1000);
      scaleIdx++;
      isFirst = false;
    }
  }

  var result = sign + wordArr.join(" ").trim();

  if (decimalPart) {
    result += " Komma";
    for (var j = 0; j < decimalPart.length; j++) {
      result += " " + (decimalPart[j] === "0" ? "Null" : ones[parseInt(decimalPart[j])]);
    }
  }
  return result.trim();
}

function toggleHistory() {
  var historyCol = document.getElementById("history-column");
  var btn = document.getElementById("toggle-history-btn");

  if (!historyCol) return;

  historyCol.classList.toggle("d-none");

  if (historyCol.classList.contains("d-none")) {
    btn.textContent = "Show History";
    btn.classList.replace("btn-outline-primary", "btn-primary");
  } else {
    btn.textContent = "Hide History";
    btn.classList.replace("btn-primary", "btn-outline-primary");
  }
}

function saveHistoryToStorage() {
  localStorage.setItem("calcHistory", JSON.stringify(calculationHistory));
}

function renderHistory() {
  var list = document.getElementById("history-list");
  if (!list) return;

  list.innerHTML = "";

  if (calculationHistory.length === 0) {
    var emptyTemplate = document.getElementById("history-empty-template");
    if (emptyTemplate) {
      list.appendChild(emptyTemplate.content.cloneNode(true));
    }
    return;
  }

  calculationHistory
    .slice()
    .reverse()
    .forEach(function (item, index) {
      var tpl = document.getElementById("history-item-template").content.cloneNode(true);

      var itemEl = tpl.querySelector(".history-item");
      tpl.querySelector(".history-item-expression").textContent = item.expression;
      tpl.querySelector(".history-item-words").textContent = item.words;
      tpl.querySelector(".history-item-time").textContent = item.time;
      var remarkText = tpl.querySelector(".remark-text");
      var remarkBox = tpl.querySelector(".remark-box");
      var remarkInput = remarkBox.querySelector("input");
      if (item.remark) {
        remarkText.textContent = item.remark;
      }

      var actualIndex = calculationHistory.length - 1 - index;
      tpl.querySelector(".btn-delete").onclick = function (e) {
        e.stopPropagation();
        calculationHistory.splice(actualIndex, 1);
        saveHistoryToStorage();
        renderHistory();
      };

      tpl.querySelector(".btn-remark").onclick = function (e) {
        e.stopPropagation();
        remarkBox.classList.remove("d-none");
        remarkInput.focus();
      };

      remarkBox.querySelector(".btn-primary").onclick = function (e) {
        e.stopPropagation();
        item.remark = remarkInput.value.trim();
        saveHistoryToStorage();
        renderHistory();
      };

      remarkBox.querySelector(".btn-outline-secondary").onclick = function (e) {
        e.stopPropagation();
        remarkBox.classList.add("d-none");
      };

      itemEl.addEventListener("click", function () {
        currentExpression = item.expression;
        updateResult();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });

      list.appendChild(tpl);

      setTimeout(function () {
        itemEl.classList.add("show");
      }, index * 50);
    });
}

function loadHistoryFromStorage() {
  var stored = localStorage.getItem("calcHistory");
  if (stored) calculationHistory = JSON.parse(stored);
}

function clearHistory() {
  if (!confirm("Are you sure you want to clear all calculation history?")) return;
  calculationHistory = [];
  localStorage.removeItem("calcHistory");
  renderHistory();
}

document.addEventListener("keydown", function (event) {
  var key = event.key;

  if (!isNaN(key)) {
    appendToResult(key);
  } else if (key === "+" || key === "-" || key === "*" || key === "/") {
    operatorToResult(key);
  } else if (key === "Enter") {
    calculateResult();
  } else if (key === "Backspace") {
    backspace();
  } else if (key === "Escape") {
    clearResult();
  } else if (key === ".") {
    appendToResult(key);
  }
});
