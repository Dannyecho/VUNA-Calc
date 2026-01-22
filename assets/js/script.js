// ==================== CORE CALCULATOR STATE ====================
var left = '';
var operator = '';
var right = '';

// ==================== SCIENTIFIC NOTATION & PRECISION ====================
var scientificNotationEnabled = false;
var decimalPlaces = 2;
var currencyRates = {
  'USD': 1,
  'EUR': 0.92,
  'GBP': 0.79,
  'JPY': 149.50,
  'CAD': 1.37,
  'AUD': 1.52
};

// ==================== UNIT CONVERSION FUNCTIONS ====================

// Unit conversion factors to base units
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
    
    // Convert to meters first
    const meters = value * unitConversions['length'][fromUnit];
    // Convert to target unit
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
    
    // Convert to kg first
    const kg = value * unitConversions['weight'][fromUnit];
    // Convert to target unit
    const result = kg / unitConversions['weight'][toUnit];
    document.getElementById('weight-result').textContent = formatResult(result);
  } 
  else if (type === 'temperature') {
    const value = parseFloat(document.getElementById('temp-value').value) || 0;
    const fromUnit = document.getElementById('from-temp').value;
    const toUnit = document.getElementById('to-temp').value;
    
    // Convert to Celsius first
    let celsius;
    if (fromUnit === 'C') {
      celsius = value;
    } else if (fromUnit === 'F') {
      celsius = (value - 32) * 5/9;
    } else if (fromUnit === 'K') {
      celsius = value - 273.15;
    }
    
    // Convert to target unit
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
    
    // Convert to USD first, then to target currency
    const usd = value / currencyRates[fromCurrency];
    const result = usd * currencyRates[toCurrency];
    document.getElementById('currency-result').textContent = formatResult(result);
  }
}

function formatResult(value) {
  if (scientificNotationEnabled && Math.abs(value) >= 1e6) {
    return value.toExponential(decimalPlaces);
  }
  return parseFloat(value.toFixed(decimalPlaces));
}

function updateExampleConversion(value) {
  document.getElementById('example-result').textContent = formatResult(value);
  document.getElementById('example-add').textContent = formatResult(value + 10);
}

function fetchCurrencyRates() {
  // Using a free currency API endpoint
  const btn = event.target;
  btn.disabled = true;
  btn.textContent = '⏳ Loading...';
  
  // Using exchangerate-api.com free tier (no key needed for basic requests)
  fetch('https://api.exchangerate-api.com/v4/latest/USD')
    .then(response => response.json())
    .then(data => {
      if (data.rates) {
        currencyRates['EUR'] = 1 / data.rates.EUR;
        currencyRates['GBP'] = 1 / data.rates.GBP;
        currencyRates['JPY'] = 1 / data.rates.JPY;
        currencyRates['CAD'] = 1 / data.rates.CAD;
        currencyRates['AUD'] = 1 / data.rates.AUD;
        
        const timestamp = new Date().toLocaleTimeString();
        document.getElementById('currency-timestamp').textContent = `Last updated: ${timestamp}`;
        
        // Recalculate current conversion
        convertUnit('currency');
        btn.textContent = '🔄';
        btn.disabled = false;
      }
    })
    .catch(error => {
      console.error('Error fetching currency rates:', error);
      document.getElementById('currency-timestamp').textContent = 'Unable to fetch live rates';
      btn.textContent = '🔄';
      btn.disabled = false;
    });
}

// ==================== SCIENTIFIC NOTATION & PRECISION CONTROL ====================

function toggleScientificNotation() {
  scientificNotationEnabled = !scientificNotationEnabled;
  const btn = document.getElementById('sci-notation-btn');
  btn.textContent = scientificNotationEnabled ? 'Sci Notation: ON' : 'Sci Notation: OFF';
  btn.classList.toggle('active');
  updateResult();
}

function updateDecimalPlaces() {
  decimalPlaces = parseInt(document.getElementById('decimal-places').value);
  updateResult();
}

// ==================== ENHANCED CALCULATOR FUNCTIONS ====================

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
    if (left.length === 0 || operator.length === 0 || right.length === 0) return;

    let result;
    const l = parseFloat(left);
    const r = parseFloat(right);

    switch (operator) {
        case '+': result = l + r; break;
        case '-': result = l - r; break;
        case '*': result = l * r; break;
        case '/': result = r !== 0 ? l / r : 'Error'; break;
        default: return;
    }

    // Apply precision formatting
    if (result !== 'Error') {
        if (scientificNotationEnabled && Math.abs(result) >= 1e6) {
            result = parseFloat(result.toExponential(decimalPlaces));
        } else {
            result = parseFloat(result.toFixed(decimalPlaces));
        }
    }

    left = result.toString();
    operator = '';
    right = '';
    updateResult();
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
    const display = left + (operator ? ' ' + operator + ' ' : '') + right;
    
    // Apply scientific notation if enabled
    let displayValue = display;
    if (left && !operator && !right) {
        const num = parseFloat(left);
        if (!isNaN(num) && scientificNotationEnabled && Math.abs(num) >= 1e6) {
            displayValue = num.toExponential(decimalPlaces);
        } else if (!isNaN(num)) {
            displayValue = parseFloat(num.toFixed(decimalPlaces));
        }
    }
    
    document.getElementById('result').value = displayValue || '0';

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

function speakResult() {
    const speakBtn = document.getElementById('speak-btn');
    const wordResultEl = document.getElementById('word-result');

    // Get text content only (strips the <span class="small-label"> part if needed)
    // Actually we just want the number part
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

      // Copy numeric result to clipboard
      function copyResult() {
        const text = document.getElementById('result').value;
        if (!text) return;

        navigator.clipboard.writeText(text)
        .then(() => alert('Result copied!'))
        .catch(() => alert('Failed to copy'));
      }

function percentToResult() {
  // Only proceed if left exists
  if (!left) return;

  // If no operator, just divide left by 100
  if (!operator) {
    left = (parseFloat(left) / 100).toString();
    updateResult();
    convertToWords(left);
    return;
  }

  // If operator exists but right is empty, wait for user input
  if (!right) return;

  // If both operator and right exist, calculate percentage of left

  let result = (parseFloat(right) / 100) * parseFloat(left);

  // Move result to left, clear operator and right
  left = result.toString();
  operator = '';
  right = '';

  updateResult();
  convertToWords(left);
}

