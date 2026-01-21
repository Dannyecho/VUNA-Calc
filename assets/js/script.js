var currentExpression = '';

function appendToResult(value) {
    currentExpression += value.toString();
    updateResult();
}

function bracketToResult(value) {
    currentExpression += value;
    updateResult();
}

function backspace() {
    currentExpression = currentExpression.slice(0, -1);
    updateResult();
}

function operatorToResult(value) {
    if (value === '^') {
        currentExpression += '**';
    } else {
        currentExpression += value;
    }
    updateResult();
}

function clearResult() {
    currentExpression = '';
    document.getElementById('word-result').innerHTML = '';
    document.getElementById('word-area').style.display = 'none';
    updateResult();
}

function calculateResult() {
    if (currentExpression.length === 0) return;

    try {
        let result = eval(currentExpression);
        if (isNaN(result) || !isFinite(result)) {
            result = 'Error';
        }
        currentExpression = result.toString();
        updateResult();
    } catch (e) {
        currentExpression = 'Error';
        updateResult();
    }
}

function isPrime(num) {
    if (num <= 1) return false;
    if (num <= 3) return true;
    if (num % 2 === 0 || num % 3 === 0) return false;
    
    for (let i = 5; i * i <= num; i += 6) {
        if (num % i === 0 || num % (i + 2) === 0) return false;
    }
    return true;
}

function checkPrime() {
    const num = parseFloat(currentExpression);
    
    if (isNaN(num) || !Number.isInteger(num) || num < 0 || currentExpression.includes(' ') || currentExpression.includes('+') || currentExpression.includes('-') || currentExpression.includes('*') || currentExpression.includes('/') || currentExpression.includes('^') || currentExpression.includes('(') || currentExpression.includes(')')) {
        alert('Please enter a single positive whole number to check if it\'s prime');
        return;
    }
    
    const wordResult = document.getElementById('word-result');
    const wordArea = document.getElementById('word-area');
    
    if (isPrime(num)) {
        wordResult.innerHTML = '<span class="small-label">Prime Check</span><strong>' + num + ' is a PRIME number! ✓</strong>';
    } else {
        wordResult.innerHTML = '<span class="small-label">Prime Check</span><strong>' + num + ' is NOT a prime number ✗</strong>';
    }
    
    wordArea.style.display = 'flex';
    enableSpeakButton();
}

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
            res += tens[Math.floor(val / 10)] + (val % 10 !== 0 ? '-' + ones[val % 10] : '') + ' ';
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

    let wordArr = [];
    if (integerPart === 0) {
        wordArr.push('Zero');
    } else {
        let scaleIdx = 0;
        while (integerPart > 0) {
            let chunk = integerPart % 1000;
            if (chunk > 0) {
                let chunkWords = convertGroup(chunk);
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

function updateResult() {
    document.getElementById('result').value = currentExpression || '0';

    const wordResult = document.getElementById('word-result');
    const wordArea = document.getElementById('word-area');

    // Check if currentExpression is a valid number
    const num = parseFloat(currentExpression);
    if (!isNaN(num) && isFinite(num) && currentExpression.trim() === num.toString()) {
        wordResult.innerHTML = '<span class="small-label">Result in words</span><strong>' + numberToWords(currentExpression) + '</strong>';
        wordArea.style.display = 'flex';
    } else {
        wordResult.innerHTML = '';
        wordArea.style.display = 'none';
    }
    enableSpeakButton();
}

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

function enableSpeakButton() {
    const speakBtn = document.getElementById('speak-btn');
    if (!speakBtn) return;
    const hasContent = document.getElementById('word-result').innerHTML.trim().length > 0;
    speakBtn.disabled = !hasContent;
}

function copyResult() {
    const text = document.getElementById('result').value;
    if (!text) return;

    navigator.clipboard.writeText(text)
    .then(() => alert('Result copied!'))
    .catch(() => alert('Failed to copy'));
}

function percentToResult() {
    const num = parseFloat(currentExpression);
    if (!isNaN(num) && currentExpression.trim() === num.toString()) {
        currentExpression = (num / 100).toString();
        updateResult();
    }
}
  