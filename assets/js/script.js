var left = '';
var operator = '';
var right = '';

let history = [];

let wordPlaceholder = document.getElementById('word-result');

function appendToResult(value) {
    if (operator.length == 0) {
        left += value;
    } else {
        right += value;
    }
    updateResult();
}

function bracketToResult(value) {
    document.getElementById('result').value += value;
}

function operatorToResult(value) {
    if (right.length) {
        calculateResult();
    }
    operator = value;
    updateResult();
}

function clearResult() {
    left = '';
    right = '';
    operator = '';

    document.getElementById('word-text').innerHTML = '';
    updateResult();
    enableSpeakButton();
}

function calculateResult() {
    if (!left || !operator || !right) return;

    let expression = left + " " + operator + " " + right;
    let result;

    try {
        result = eval(expression);
    } catch {
        return;
    }

    addToHistory(expression, result);

    left = result.toString();
    right = '';
    operator = '';

    updateResult();
}

function updateResult() {
    // your existing update logic here
    // (leaving this untouched)
}

/* ---------- NUMBER TO WORDS ----------
------------------------------------- */

// Text-to-Speech
function speakResult() {
    const speakBtn = document.getElementById('speak-btn');
    const textToSpeak = document.getElementById('word-text').innerHTML;

    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        speakBtn.classList.remove('speaking');
        return;
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = function () {
        speakBtn.classList.add('speaking');
    };

    utterance.onend = function () {
        speakBtn.classList.remove('speaking');
    };

    window.speechSynthesis.speak(utterance);
}

function enableSpeakButton() {
    const speakBtn = document.getElementById('speak-btn');
    const hasContent =
        document.getElementById('word-text').innerHTML.trim().length > 0;
    speakBtn.disabled = !hasContent;
}

// ================= HISTORY FUNCTIONS =================

function addToHistory(expression, result) {
    history.unshift({ expression, result });

    if (history.length > 10) {
        history.pop();
    }

    renderHistory();
}

function renderHistory() {
    const historyList = document.getElementById('history-list');
    historyList.innerHTML = '';

    history.forEach(item => {
        const li = document.createElement('li');
        li.className = 'list-group-item list-group-item-action';
        li.innerHTML = `${item.expression} = <strong>${item.result}</strong>`;

        li.onclick = () => {
            left = item.result.toString();
            right = '';
            operator = '';
            updateResult();
        };

        historyList.appendChild(li);
    });
}

function clearHistory() {
    history = [];
    renderHistory();
}
