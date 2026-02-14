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

var inverseMode = false;
var currentExpression = '';
let calculationHistory = [];
document.addEventListener("DOMContentLoaded", function () {
  loadHistoryFromStorage();
  renderHistory();
});
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
    'F': { offset: 32, scale: 5 / 9 },
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
      celsius = (value - 32) * 5 / 9;
    } else if (fromUnit === 'K') {
      celsius = value - 273.15;
    }

    let result;
    if (toUnit === 'C') {
      result = celsius;
    } else if (toUnit === 'F') {
      result = celsius * 9 / 5 + 32;
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
window.addEventListener('DOMContentLoaded', function () {
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
  if (!currentExpression) return;

  try {
    let result = eval(currentExpression);

    if (isNaN(result) || !isFinite(result)) {
      throw new Error();
    }

    calculationHistory?.push({
      expression: currentExpression,
      words: numberToWords(result),
      time: new Date().toLocaleTimeString()
    });

    if (calculationHistory.length > 20) calculationHistory.shift();

    localStorage.setItem("calcHistory", JSON.stringify(calculationHistory));
    renderHistory();

    currentExpression = result.toString();
    updateResult();
    document.getElementById('word-result').innerHTML = numberToWords(result);

  } catch (e) {
    currentExpression = 'Error';
    updateResult();
  }
}
function tenPower() {
  if (!currentExpression) return;

  const x = parseFloat(currentExpression);
  if (isNaN(x)) {
    currentExpression = 'Error';
  } else {
    currentExpression = Math.pow(10, x).toString();
  }

  updateResult();
}


// ------------------------------
// HEXADECIMAL CONVERSION FEATURE
// ------------------------------
/**
 * Converts the current decimal number to hexadecimal format
 * Displays the result in the word-result area with proper formatting
 */
function convertToHex() {
  // Check if there's a value to convert
  if (currentExpression.length === 0 || currentExpression === '0') {
    alert('Please enter a number first');
    return;
  }

  // Parse the current expression as a number
  const num = parseFloat(currentExpression);

  // Validate the input
  if (isNaN(num)) {
    alert('Invalid number. Please enter a valid decimal number.');
    return;
  }

  // Check if the number is an integer (hexadecimal conversion works best with integers)
  if (!Number.isInteger(num)) {
    alert('Hexadecimal conversion works with whole numbers only. Your number will be rounded.');
  }

  // Convert to integer (rounds if decimal)
  const integerNum = Math.floor(Math.abs(num));

  // Perform the conversion to hexadecimal
  const hexValue = integerNum.toString(16).toUpperCase();

  // Get references to display elements
  const wordResult = document.getElementById('word-result');
  const wordArea = document.getElementById('word-area');

  // Create formatted display message
  let displayMessage = '<span class="small-label">Hexadecimal Conversion</span>';
  displayMessage += '<strong>';

  // Add negative sign if original number was negative
  if (num < 0) {
    displayMessage += 'Decimal: -' + integerNum + ' = Hex: -0x' + hexValue;
  } else {
    displayMessage += 'Decimal: ' + integerNum + ' = Hex: 0x' + hexValue;
  }

  displayMessage += '</strong>';

  // Display the result
  wordResult.innerHTML = displayMessage;
  wordArea.style.display = 'flex';

  // Update the main display to show the hex value
  currentExpression = hexValue;
  updateResult();

  // Enable the speak button for the result
  enableSpeakButton();

  console.log('HEX Conversion successful:', integerNum, '->', hexValue);
}


function applyLogarithm() {
  if (left.length === 0) return;

  const num = parseFloat(left);
  if (num <= 0) {
    left = "Error";
  } else {
    const result = Math.log10(num);
    if (steps.length < MAX_STEPS) {
      steps.push(`Step ${steps.length + 1}: log10(${num}) = ${result}`);
    }
    left = result.toString();
  }

  right = "";

  updateStepsDisplay();
  updateResult();
}

function toggleInverseMode() { inverseMode = !inverseMode; document.getElementById('sin-btn').textContent = inverseMode ? 'sin⁻¹' : 'sin'; document.getElementById('cos-btn').textContent = inverseMode ? 'cos⁻¹' : 'cos'; document.getElementById('tan-btn').textContent = inverseMode ? 'tan⁻¹' : 'tan'; document.getElementById('inv-btn').classList.toggle('active', inverseMode); }

function sinDeg(x) { return Math.sin(x * Math.PI / 180); }
function cosDeg(x) { return Math.cos(x * Math.PI / 180); }
function tanDeg(x) { return Math.tan(x * Math.PI / 180); }

function asinDeg(x) { return Math.asin(x) * 180 / Math.PI; }
function acosDeg(x) { return Math.acos(x) * 180 / Math.PI; }
function atanDeg(x) { return Math.atan(x) * 180 / Math.PI; }

function appendTrig(func) {
  currentExpression += func + '(';
  updateResult();
}


function trigButtonPressed(func) {
  const map = inverseMode
    ? { sin: 'asin', cos: 'acos', tan: 'atan' }
    : { sin: 'sin', cos: 'cos', tan: 'tan' };

  appendTrig(map[func]);
}

function normalizeExpression(expr) {
  return expr
    .replace(/asin\(/g, 'asinDeg(')
    .replace(/acos\(/g, 'acosDeg(')
    .replace(/atan\(/g, 'atanDeg(')
    .replace(/sin\(/g, 'sinDeg(')
    .replace(/cos\(/g, 'cosDeg(')
    .replace(/tan\(/g, 'tanDeg(');
}


function isPrime(num) {
  // Numbers less than 2 are not prime
  if (num <= 1) {
    return false;
  }

  return result;
}

function Parser(tokens) {
  this.tokens = tokens;
  this.index = 0;
}

Parser.prototype.peek = function () {
  return this.tokens[this.index];
};

Parser.prototype.advance = function () {
  this.index += 1;
  return this.tokens[this.index - 1];
};

Parser.prototype.isAtEnd = function () {
  return this.index >= this.tokens.length;
};

Parser.prototype.matchOperator = function (op) {
  const token = this.peek();
  if (token && token.type === "operator" && token.value === op) {
    this.advance();
    return true;
  }
  return false;
};

Parser.prototype.parseExpression = function () {
  let node = this.parseTerm();
  while (true) {
    if (this.matchOperator("+")) {
      node = { type: "binary", op: "+", left: node, right: this.parseTerm() };
      continue;
    }
    if (this.matchOperator("-")) {
      node = { type: "binary", op: "-", left: node, right: this.parseTerm() };
      continue;
    }
    break;
  }
  return node;
};

Parser.prototype.parseTerm = function () {
  let node = this.parsePower();
  while (true) {
    if (this.matchOperator("*")) {
      node = { type: "binary", op: "*", left: node, right: this.parsePower() };
      continue;
    }
    if (this.matchOperator("/")) {
      node = { type: "binary", op: "/", left: node, right: this.parsePower() };
      continue;
    }
    break;
  }
  return node;
};

Parser.prototype.parsePower = function () {
  let node = this.parseUnary();
  if (this.matchOperator("^")) {
    node = { type: "binary", op: "^", left: node, right: this.parsePower() };
  }
  return node;
};

Parser.prototype.parseUnary = function () {
  if (this.matchOperator("-")) {
    return { type: "unary", op: "-", value: this.parseUnary() };
  }
  return this.parsePrimary();
};

Parser.prototype.parsePrimary = function () {
  const token = this.peek();
  if (!token) throw new Error("Unexpected end of expression.");

  if (token.type === "number") {
    this.advance();
    return { type: "number", value: token.value };
  }

  if (token.type === "variable") {
    this.advance();
    return { type: "variable", name: token.name };
  }

  if (token.type === "constant") {
    this.advance();
    return { type: "constant", name: token.name, value: token.value };
  }

  if (token.type === "func") {
    const funcToken = this.advance();
    const next = this.peek();
    if (!next || next.type !== "lparen") {
      throw new Error(`Expected '(' after ${funcToken.name}.`);
    }
    this.advance();
    const arg = this.parseExpression();
    if (!this.peek() || this.peek().type !== "rparen") {
      throw new Error("Missing closing parenthesis for function.");
    }
    this.advance();
    return { type: "func", name: funcToken.name, arg };
  }

  if (token.type === "lparen") {
    this.advance();
    const node = this.parseExpression();
    if (!this.peek() || this.peek().type !== "rparen") {
      throw new Error("Missing closing parenthesis.");
    }
    this.advance();
    return node;
  }

  throw new Error("Invalid token in expression.");
};

function differentiate(node) {
  switch (node.type) {
    case "number":
      return { type: "number", value: 0 };
    case "constant":
      return { type: "number", value: 0 };
    case "variable":
      return { type: "number", value: 1 };
    case "unary":
      return { type: "unary", op: "-", value: differentiate(node.value) };
    case "binary":
      return differentiateBinary(node);
    case "func":
      return differentiateFunction(node);
    default:
      throw new Error("Unsupported expression.");
  }
}

function differentiateBinary(node) {
  const left = node.left;
  const right = node.right;
  const dLeft = differentiate(left);
  const dRight = differentiate(right);

  switch (node.op) {
    case "+":
      return { type: "binary", op: "+", left: dLeft, right: dRight };
    case "-":
      return { type: "binary", op: "-", left: dLeft, right: dRight };
    case "*":
      return {
        type: "binary",
        op: "+",
        left: { type: "binary", op: "*", left: dLeft, right: right },
        right: { type: "binary", op: "*", left: left, right: dRight },
      };
    case "/":
      return {
        type: "binary",
        op: "/",
        left: {
          type: "binary",
          op: "-",
          left: { type: "binary", op: "*", left: dLeft, right: right },
          right: { type: "binary", op: "*", left: left, right: dRight },
        },
        right: { type: "binary", op: "^", left: right, right: { type: "number", value: 2 } },
      };
    case "^":
      return differentiatePower(left, right);
    default:
      throw new Error("Unsupported operator.");
  }
}

function convertToFraction() {
    const display = document.getElementById('result');
    if (!display || !display.value) return;

    const value = Number(display.value);
    if (isNaN(value)) return;

    // Handle integers
    if (Number.isInteger(value)) {
        display.value = value + "/1";
        currentExpression = display.value;
        return;
    }

    let tolerance = 1.0E-6;
    let h1 = 1, h2 = 0, k1 = 0, k2 = 1;
    let b = value;

    do {
        let a = Math.floor(b);
        let aux = h1;
        h1 = a * h1 + h2;
        h2 = aux;
        aux = k1;
        k1 = a * k1 + k2;
        k2 = aux;
        b = 1 / (b - a);
    } while (Math.abs(value - h1 / k1) > value * tolerance);

    display.value = `${h1}/${k1}`;
    currentExpression = display.value;
}

function differentiatePower(base, exponent) {
  if (exponent.type === "number") {
    return {
      type: "binary",
      op: "*",
      left: {
        type: "binary",
        op: "*",
        left: { type: "number", value: exponent.value },
        right: { type: "binary", op: "^", left: base, right: { type: "number", value: exponent.value - 1 } },
      },
      right: differentiate(base),
    };
  }

  if (base.type === "constant" || base.type === "number") {
    return {
      type: "binary",
      op: "*",
      left: { type: "binary", op: "^", left: base, right: exponent },
      right: { type: "binary", op: "*", left: { type: "func", name: "ln", arg: base }, right: differentiate(exponent) },
    };
  }

  throw new Error("Unsupported exponent form for differentiation.");
}

function cubeRootResult() {
    if (left.length === 0) return;
    const num = parseFloat(left);
    const cbrt = num < 0 ? -Math.pow(Math.abs(num), 1/3) : Math.pow(num, 1/3);
    left = cbrt.toString();
    operator = '';
    right = '';
    updateResult();
}
