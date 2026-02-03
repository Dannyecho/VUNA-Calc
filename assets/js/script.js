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

var currentExpression = '';

var currencyRates = {
  'USD': 1,
  'EUR': 0.92,
  'GBP': 0.79,
  'JPY': 149.50,
  'CAD': 1.37,
  'AUD': 1.52,
  'NGN': 1500.00
};

const unitConversions = {
  'length': {
    'km': 1000,
    'm': 1,
    'mile': 1609.34,
    'yard': 0.9144,
    'ft': 0.3048,
    'inch': 0.0254
  },
  'weight': {
    'kg': 1,
    'g': 0.001,
    'lb': 0.453592,
    'oz': 0.0283495
  },
  'temperature': {
    'C': { offset: 0, scale: 1 },
    'F': { offset: 32, scale: 5/9 },
    'K': { offset: -273.15, scale: 1 }
  }
};

function convertUnit(type) {
  if (type === 'length') {
    const value = parseFloat(document.getElementById('length-value').value) || 0;
    const fromUnit = document.getElementById('from-length').value;
    const toUnit = document.getElementById('to-length').value;
    
    if (value === 0) {
      document.getElementById('length-result').textContent = '0';
      return;
    }
    
    const meters = value * unitConversions['length'][fromUnit];
    const result = meters / unitConversions['length'][toUnit];
    document.getElementById('length-result').textContent = formatResult(result);
    updateExampleConversion(result);
  } 
  else if (type === 'weight') {
    const value = parseFloat(document.getElementById('weight-value').value) || 0;
    const fromUnit = document.getElementById('from-weight').value;
    const toUnit = document.getElementById('to-weight').value;
    
    if (value === 0) {
      document.getElementById('weight-result').textContent = '0';
      return;
    }
    
    const kg = value * unitConversions['weight'][fromUnit];
    const result = kg / unitConversions['weight'][toUnit];
    document.getElementById('weight-result').textContent = formatResult(result);
  } 
  else if (type === 'temperature') {
    const value = parseFloat(document.getElementById('temp-value').value) || 0;
    const fromUnit = document.getElementById('from-temp').value;
    const toUnit = document.getElementById('to-temp').value;
    
    let celsius;
    if (fromUnit === 'C') {
      celsius = value;
    } else if (fromUnit === 'F') {
      celsius = (value - 32) * 5/9;
    } else if (fromUnit === 'K') {
      celsius = value - 273.15;
    }
    
    let result;
    if (toUnit === 'C') {
      result = celsius;
    } else if (toUnit === 'F') {
      result = celsius * 9/5 + 32;
    } else if (toUnit === 'K') {
      result = celsius + 273.15;
    }
    
    document.getElementById('temp-result').textContent = formatResult(result);
  }
  else if (type === 'currency') {
    const value = parseFloat(document.getElementById('currency-value').value) || 0;
    const fromCurrency = document.getElementById('from-currency').value;
    const toCurrency = document.getElementById('to-currency').value;
    
    if (value === 0 || !currencyRates[fromCurrency] || !currencyRates[toCurrency]) {
      document.getElementById('currency-result').textContent = '0';
      return;
    }
    
    const usd = value / currencyRates[fromCurrency];
    const result = usd * currencyRates[toCurrency];
    document.getElementById('currency-result').textContent = formatResult(result);
  }
}

// Initialize converter displays on load
window.addEventListener('DOMContentLoaded', function() {
  try {
    convertUnit('length');
    convertUnit('weight');
    convertUnit('temperature');
    convertUnit('currency');
  } catch (e) {
    console.warn('Converter init error:', e);
  }
});

function formatResult(value) {
  return value.toFixed(4);
}

function updateExampleConversion(value) {
  document.getElementById('example-result').textContent = formatResult(value);
  document.getElementById('example-add').textContent = formatResult(value + 10);
}

function fetchCurrencyRates() {
  const btn = document.getElementById('currency-refresh-btn');
  if (btn) {
    btn.disabled = true;
    btn.textContent = '⏳';
  }
  
  fetch('https://api.exchangerate-api.com/v4/latest/USD')
    .then(response => response.json())
    .then(data => {
      if (data.rates) {
        alert('Currency rates fetched successfully.');
        console.log('Fetched currency rates:', data);    
        // API returns rates relative to USD (1 USD = data.rates[currency])
        currencyRates['EUR'] = data.rates.EUR || currencyRates['EUR'];
        currencyRates['GBP'] = data.rates.GBP || currencyRates['GBP'];
        currencyRates['JPY'] = data.rates.JPY || currencyRates['JPY'];
        currencyRates['CAD'] = data.rates.CAD || currencyRates['CAD'];
        currencyRates['AUD'] = data.rates.AUD || currencyRates['AUD'];
        currencyRates['NGN'] = data.rates.NGN || currencyRates['NGN'];

        const timestamp = new Date().toLocaleTimeString();
        document.getElementById('currency-timestamp').textContent = `Last updated: ${timestamp}`;

        convertUnit('currency');
        if (btn) {
          btn.textContent = '🔄';
          btn.disabled = false;
        }
      }
    })
    .catch(error => {
      console.error('Error fetching currency rates:', error);
      document.getElementById('currency-timestamp').textContent = 'Unable to fetch live rates';
      if (btn) {
        btn.textContent = '🔄';
        btn.disabled = false;
      }
    });
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

// ------------------------------
// Calculate Result
// ------------------------------
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


// Factor Finder & Prime Checker
// Get factors of a number
function factors(num) {
    let result = [];
    for (let i = 1; i <= num; i++) {
        if (num % i === 0) result.push(i);
    }
    return result;
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

fetchCurrencyRates()

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
  
