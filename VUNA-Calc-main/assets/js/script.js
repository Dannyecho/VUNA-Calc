function CalculatorApp() {
    let left = '';
    let operator = '';
    let right = '';
    let history = [];

    const HISTORY_KEY = 'calculator_history';

    /* -------- LOAD HISTORY ON START -------- */
    function loadHistory() {
        const stored = localStorage.getItem(HISTORY_KEY);
        if (stored) {
            history = JSON.parse(stored);
            renderHistory();
        }
    }

    /* -------- SAVE HISTORY -------- */
    function persistHistory() {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    }

    function appendToResult(value) {
        if (operator.length === 0) {
            left += value.toString();
        } else {
            right += value.toString();
        }
        updateResult();
    }

    function bracketToResult(value) {
        if (operator.length === 0) {
            left += value;
        } else {
            right += value;
        }
        updateResult();
    }

    function backspace() {
        if (right.length > 0) {
            right = right.slice(0, -1);
        } else if (operator.length > 0) {
            operator = '';
        } else if (left.length > 0) {
            left = left.slice(0, -1);
        }
        updateResult();
    }

    function operatorToResult(value) {
        if (left.length === 0) return;
        if (right.length > 0) {
            calculateResult();
        }
        operator = value;
        updateResult();
    }

    function clearResult() {
        left = '';
        right = '';
        operator = '';
        document.getElementById('word-result').innerHTML = '';
        document.getElementById('word-area').style.display = 'none';
        updateResult();
    }

    function calculateResult() {
        if (!left || !operator || !right) return;

        const l = parseFloat(left);
        const r = parseFloat(right);
        let result;

        switch (operator) {
            case '+': result = l + r; break;
            case '-': result = l - r; break;
            case '*': result = l * r; break;
            case '/': result = r !== 0 ? l / r : 'Error'; break;
            default: return;
        }

        saveToHistory(`${left} ${operator} ${right}`, result);

        left = result.toString();
        operator = '';
        right = '';
        updateResult();
    }

    /* ---------------- HISTORY ---------------- */

    function saveToHistory(expression, result) {
        history.unshift({ expression, result });
        if (history.length > 10) history.pop();
        persistHistory();
        renderHistory();
    }

    function renderHistory() {
        const list = document.getElementById('history-list');
        if (!list) return;

        list.innerHTML = '';
        history.forEach(item => {
            const li = document.createElement('li');
            li.className = 'list-group-item list-group-item-action';
            li.innerHTML = `<small>${item.expression}</small><br><strong>= ${item.result}</strong>`;
            li.onclick = () => {
                left = item.result.toString();
                operator = '';
                right = '';
                updateResult();
            };
            list.appendChild(li);
        });
    }

    /* ---------------- WORDS ---------------- */

    function numberToWords(num) {
        if (num === 'Error') return 'Error';
        if (num === '') return '';

        const n = parseFloat(num);
        if (isNaN(n)) return '';
        if (n === 0) return 'Zero';

        const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
        const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
        const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
        const scales = ['', 'Thousand', 'Million', 'Billion', 'Trillion'];

        function convertGroup(val) {
            let res = '';
            if (val >= 100) {
                res += ones[Math.floor(val / 100)] + ' Hundred ';
                val %= 100;
            }
            if (val >= 10 && val <= 19) {
                res += teens[val - 10] + ' ';
            } else if (val >= 20) {
                res += tens[Math.floor(val / 10)] + (val % 10 ? '-' + ones[val % 10] : '') + ' ';
            } else if (val > 0) {
                res += ones[val] + ' ';
            }
            return res.trim();
        }

        let sign = n < 0 ? 'Negative ' : '';
        let absN = Math.abs(n);
        let parts = absN.toString().split('.');
        let integerPart = parseInt(parts[0]);
        let decimalPart = parts[1];

        let words = [];
        let scale = 0;

        while (integerPart > 0) {
            let chunk = integerPart % 1000;
            if (chunk) words.unshift(convertGroup(chunk) + (scales[scale] ? ' ' + scales[scale] : ''));
            integerPart = Math.floor(integerPart / 1000);
            scale++;
        }

        let result = sign + words.join(', ');

        if (decimalPart) {
            result += ' Point';
            for (let d of decimalPart) result += ' ' + ones[d];
        }

        return result.trim();
    }

    function updateResult() {
        const display = left + (operator ? ` ${operator} ` : '') + right;
        document.getElementById('result').value = display || '0';

        const wordResult = document.getElementById('word-result');
        const wordArea = document.getElementById('word-area');

        if (left && !operator && !right) {
            wordResult.innerHTML =
                `<span class="small-label">Result in words</span><strong>${numberToWords(left)}</strong>`;
            wordArea.style.display = 'flex';
        } else {
            wordArea.style.display = 'none';
        }

        enableSpeakButton();
    }

    function speakResult() {
        const words = document.querySelector('#word-result strong')?.innerText;
        if (!words) return;

        const utterance = new SpeechSynthesisUtterance(words);
        utterance.rate = 0.9;
        speechSynthesis.cancel();
        speechSynthesis.speak(utterance);
    }

    function enableSpeakButton() {
        const btn = document.getElementById('speak-btn');
        btn.disabled = !document.querySelector('#word-result strong');
    }

    /* --------- EXPOSE FUNCTIONS --------- */
    window.appendToResult = appendToResult;
    window.bracketToResult = bracketToResult;
    window.backspace = backspace;
    window.operatorToResult = operatorToResult;
    window.clearResult = clearResult;
    window.calculateResult = calculateResult;
    window.speakResult = speakResult;

    /* INIT */
    loadHistory();
}

/* START APP */
CalculatorApp();
