// ------------------------------
// Theme Toggle Logic
// ------------------------------
function toggleTheme() {
    const body = document.body;
    const btn = document.getElementById('theme-toggle');

    body.classList.toggle('dark-mode');

    if (body.classList.contains('dark-mode')) {
        btn.innerHTML = '☀️';
        btn.title = 'Switch to light mode';
        localStorage.setItem('theme', 'dark');
    } else {
        btn.innerHTML = '🌙';
        btn.title = 'Switch to dark mode';
        localStorage.setItem('theme', 'light');
    }
}

// Set theme on page load from localStorage
window.addEventListener('DOMContentLoaded', function () {
    const theme = localStorage.getItem('theme');
    const body = document.body;
    const btn = document.getElementById('theme-toggle');

    if (btn) {
        if (theme === 'dark') {
            body.classList.add('dark-mode');
            btn.innerHTML = '☀️';
            btn.title = 'Switch to light mode';
        } else {
            btn.innerHTML = '🌙';
            btn.title = 'Switch to dark mode';
        }
    }
});

// ------------------------------
// Calculator State
// ------------------------------
let left = '';
let operator = '';
let right = '';
let steps = [];
const MAX_STEPS = 6;

// ------------------------------
// Basic Calculator Functions
// ------------------------------
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
    steps = [];

    document.getElementById('word-result').innerHTML = '';
    document.getElementById('word-area').style.display = 'none';
    document.getElementById('steps').innerText = '';

    updateResult();
}

// ------------------------------
// Calculate Result
// ------------------------------
function calculateResult() {
    if (!left || !operator || !right) return;

    const l = parseFloat(left);
    const r = parseFloat(right);
    let result;

    switch (operator) {
        case '+':
            result = l + r;
            break;
        case '-':
            result = l - r;
            break;
        case '*':
            result = l * r;
            break;
        case '/':
            result = r !== 0 ? l / r : 'Error';
            break;
        default:
            return;
    }

    if (steps.length < MAX_STEPS) {
        steps.push(`Step ${steps.length + 1}: ${l} ${operator} ${r} = ${result}`);
    }

    left = result.toString();
    operator = '';
    right = '';

    updateStepsDisplay();
    updateResult();
}

// ------------------------------
// Convert Number to Words
// ------------------------------
function numberToWords(num) {
    if (num === 'Error') return 'Error';
    if (!num) return '';

    const n = parseFloat(num);
    if (isNaN(n)) return '';
    if (n === 0) return 'Zero';

    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 
                   'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
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
            res += tens[Math.floor(val / 10)];
            if (val % 10 !== 0) res += '-' + ones[val % 10];
            res += ' ';
        } else if (val > 0) {
            res += ones[val] + ' ';
        }
        return res.trim();
    }

    let sign = n < 0 ? 'Negative ' : '';
    let absN = Math.abs(n);
    const parts = absN.toString().split('.');
    let integerPart = parseInt(parts[0]);
    const decimalPart = parts[1];
    let wordArr = [];

    if (integerPart === 0) {
        wordArr.push('Zero');
    } else {
        let scaleIdx = 0;
        while (integerPart > 0) {
            const chunk = integerPart % 1000;
            if (chunk > 0) {
                const chunkWords = convertGroup(chunk);
                wordArr.unshift(chunkWords + (scales[scaleIdx] ? ' ' + scales[scaleIdx] : ''));
            }
            integerPart = Math.floor(integerPart / 1000);
            scaleIdx++;
        }
    }

    let result = sign + wordArr.join(', ').trim();

    if (decimalPart) {
        result += ' Point';
        for (let digit of decimalPart) {
            result += ' ' + (digit === '0' ? 'Zero' : ones[parseInt(digit)]);
        }
    }

    return result.trim();
}

// ------------------------------
// Update Display
// ------------------------------
function updateResult() {
    const display = left + (operator ? ' ' + operator + ' ' : '') + right;
    document.getElementById('result').value = display || '0';

    const wordResult = document.getElementById('word-result');
    const wordArea = document.getElementById('word-area');

    if (left && !operator && !right) {
        wordResult.innerHTML = '<span class="small-label">Result in words</span><strong>' + numberToWords(left) + '</strong>';
        wordArea.style.display = 'flex';
    } else {
        wordResult.innerHTML = '';
        wordArea.style.display = 'none';
    }

    enableSpeakButton();
}

// ------------------------------
// Text-to-Speech
// ------------------------------
function speakResult() {
    const speakBtn = document.getElementById('speak-btn');
    const wordResultEl = document.getElementById('word-result');
    const words = wordResultEl.querySelector('strong')?.innerText || '';

    if (!words) return;

    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        speakBtn.classList.remove('speaking');
        return;
    }

    const utterance = new SpeechSynthesisUtterance(words);
    utterance.rate = 0.9;
    utterance.onstart = () => speakBtn.classList.add('speaking');
    utterance.onend = () => speakBtn.classList.remove('speaking');

    window.speechSynthesis.speak(utterance);
}

// ------------------------------
// Speak Button Enable/Disable
// ------------------------------
function enableSpeakButton() {
    const speakBtn = document.getElementById('speak-btn');
    if (!speakBtn) return;
    const hasContent = document.getElementById('word-result').innerHTML.trim().length > 0;
    speakBtn.disabled = !hasContent;
}

// ------------------------------
// Update Steps Display
// ------------------------------
function updateStepsDisplay() {
    const stepsDiv = document.getElementById('steps');
    if (!stepsDiv) return;
    stepsDiv.innerText = steps.join('\n');
}


// Factor Finder & Prime Checker
// Get factors of a number
function factors(num) {
    let result = [];
    for (let i = 1; i <= num; i++) {
        if (num % i === 0) result.push(i);
    }
    return result;
}
// Check if a number is prime
function isPrime(num) {
    if (num <= 1) return false;
    for (let i = 2; i <= Math.sqrt(num); i++) {
        if (num % i === 0) return false;
    }
    return true;
}

// Main function to handle factor finding and prime checking
function factorPrimeCheck() {
    const numStr = left || right; // use current number or result
    const num = parseInt(numStr);
    
    if (isNaN(num)) {
        alert("Please enter a valid number first!");
        return;
    }

    const factorList = factors(num);
    const primeCheck = isPrime(num);
// Prepare message
    let message = `Factors of ${num}: ${factorList.join(', ')}\n`;
    message += `Is ${num} prime? ${primeCheck ? 'Yes' : 'No'}`;

    // Push to steps and keep max 6
    steps.push(message);
    if (steps.length > 6) steps.shift();

    updateStepsDisplay();
}
