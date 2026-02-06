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

function differentiateFunction(node) {
  const arg = node.arg;
  const dArg = differentiate(arg);

  switch (node.name) {
    case "sin":
      return { type: "binary", op: "*", left: { type: "func", name: "cos", arg }, right: dArg };
    case "cos":
      return {
        type: "binary",
        op: "*",
        left: { type: "unary", op: "-", value: { type: "func", name: "sin", arg } },
        right: dArg,
      };
    case "tan":
      return {
        type: "binary",
        op: "*",
        left: {
          type: "binary",
          op: "/",
          left: { type: "number", value: 1 },
          right: {
            type: "binary",
            op: "^",
            left: { type: "func", name: "cos", arg },
            right: { type: "number", value: 2 },
          },
        },
        right: dArg,
      };
    case "ln":
      return { type: "binary", op: "*", left: { type: "binary", op: "/", left: { type: "number", value: 1 }, right: arg }, right: dArg };
    case "log":
      return {
        type: "binary",
        op: "*",
        left: {
          type: "binary",
          op: "/",
          left: { type: "number", value: 1 },
          right: {
            type: "binary",
            op: "*",
            left: arg,
            right: { type: "func", name: "ln", arg: { type: "number", value: 10 } },
          },
        },
        right: dArg,
      };
    case "exp":
      return { type: "binary", op: "*", left: { type: "func", name: "exp", arg }, right: dArg };
    default:
      throw new Error(`Unsupported function: ${node.name}`);
  }
}

function simplify(node) {
  if (!node) return node;

  if (node.type === "unary") {
    const value = simplify(node.value);
    if (value.type === "number") {
      return { type: "number", value: -value.value };
    }
    return { type: "unary", op: node.op, value };
  }

  if (node.type === "binary") {
    const left = simplify(node.left);
    const right = simplify(node.right);

    if (left.type === "number" && right.type === "number") {
      return { type: "number", value: evaluateBinary(node.op, left.value, right.value) };
    }

    switch (node.op) {
      case "+":
        if (isZero(left)) return right;
        if (isZero(right)) return left;
        break;
      case "-":
        if (isZero(right)) return left;
        if (isZero(left)) return { type: "unary", op: "-", value: right };
        break;
      case "*":
        if (isZero(left) || isZero(right)) return { type: "number", value: 0 };
        if (isOne(left)) return right;
        if (isOne(right)) return left;
        break;
      case "/":
        if (isZero(left)) return { type: "number", value: 0 };
        if (isOne(right)) return left;
        break;
      case "^":
        if (isZero(right)) return { type: "number", value: 1 };
        if (isOne(right)) return left;
        if (isZero(left)) return { type: "number", value: 0 };
        if (isOne(left)) return { type: "number", value: 1 };
        break;
    }

    return { type: "binary", op: node.op, left, right };
  }

  if (node.type === "func") {
    return { type: "func", name: node.name, arg: simplify(node.arg) };
  }

  return node;
}

function evaluateBinary(op, left, right) {
  switch (op) {
    case "+":
      return left + right;
    case "-":
      return left - right;
    case "*":
      return left * right;
    case "/":
      return left / right;
    case "^":
      return Math.pow(left, right);
    default:
      return NaN;
  }
}

function isZero(node) {
  return node.type === "number" && Math.abs(node.value) < 1e-12;
}

function isOne(node) {
  return node.type === "number" && Math.abs(node.value - 1) < 1e-12;
}

function toString(node, parentPrecedence) {
  const precedence = getPrecedence(node);
  const needsParens = parentPrecedence && precedence < parentPrecedence;

  let result;
  switch (node.type) {
    case "number":
      result = formatNumber(node.value);
      break;
    case "variable":
      result = node.name;
      break;
    case "constant":
      result = node.name;
      break;
    case "unary":
      result = "-" + toString(node.value, precedence);
      break;
    case "func":
      result = `${node.name}(${toString(node.arg, 0)})`;
      break;
    case "binary":
      result = formatBinary(node, precedence);
      break;
    default:
      result = "";
  }

  return needsParens ? `(${result})` : result;
}

function formatBinary(node, precedence) {
  if (node.op === "*") {
    const left = toString(node.left, precedence);
    const right = toString(node.right, precedence);
    if (shouldOmitMultiply(node.left, node.right)) {
      return `${left}${right}`;
    }
    return `${left} * ${right}`;
  }

  const left = toString(node.left, precedence);
  const right = toString(node.right, precedence + (node.op === "^" ? 1 : 0));
  return `${left} ${node.op} ${right}`;
}

function shouldOmitMultiply(left, right) {
  if (left.type !== "number") return false;
  if (right.type === "variable" || right.type === "func") return true;
  if (right.type === "binary" && right.op === "^" && right.left.type === "variable") return true;
  return false;
}

function formatNumber(value) {
  if (!isFinite(value)) return "Error";
  if (Math.abs(value - Math.round(value)) < 1e-10) {
    return `${Math.round(value)}`;
  }
  return `${parseFloat(value.toFixed(6))}`;
}

function getPrecedence(node) {
  if (!node) return 0;
  if (node.type === "binary") {
    switch (node.op) {
      case "+":
      case "-":
        return 1;
      case "*":
      case "/":
        return 2;
      case "^":
        return 3;
      default:
        return 0;
    }
  }
  if (node.type === "unary") return 4;
  return 5;
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

// hausa language

function numberToHausa(num) {
  if (num === 'Error') return 'Kuskure';

  const ones = ['', 'Daya', 'Biyu', 'Uku', 'Hudu', 'Biyar', 'Shida', 'Bakwai', 'Takwas', 'Tara'];
  const tens = ['', '', 'Ashirin', 'Talatin', 'Arba’in', 'Hamsin', 'Sittin', 'Sab’in', 'Tamanin', 'Tis’in'];
  const teens = ['Goma', 'Sha daya', 'Sha biyu', 'Sha uku', 'Sha hudu', 'Sha biyar', 'Sha shida', 'Sha bakwai', 'Sha takwas', 'Sha tara'];
  const scales = ['', 'Dubu', 'Miliyan', 'Biliyan', 'Triliyan'];

  function convertGroup(val) {
    let res = '';
    if (val >= 100) {
      res += ones[Math.floor(val / 100)] + ' Dari ';
      val %= 100;
    }

    if (val >= 10 && val <= 19) {
      res += teens[val - 10] + ' ';
    }
    else if (val >= 20) {
      res += tens[Math.floor(val / 10)] + (val % 10 ? ' da ' + ones[val % 10] : '') + ' ';
    }
    else if (val > 0) {
      res += ones[val] + ' ';
    }

    return res.trim();
  }

  let n = parseFloat(num);
  if (isNaN(n)) return '';

  let sign = n < 0 ? 'Mara kyau ' : '';
  let absN = Math.abs(n);
  let parts = absN.toString().split('.');
  let integerPart = parseInt(parts[0]);
  let decimalPart = parts[1];

  let wordArr = [];

  if (integerPart === 0) {
    wordArr.push('Sifili');
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
    result += ' Nuni';
    for (let digit of decimalPart) {
      result += ' ' + (digit === '0' ? 'Sifili' : ones[parseInt(digit)]);
    }
  }

  return result.trim();
}
// translate to hausas 
function translateToHausa() {
  if (!left || operator || right) return;

  const hausa = numberToHausa(left);
  const wordResult = document.getElementById('word-result');

  wordResult.innerHTML =
    '<span class="small-label">Sakamako a Hausa</span><strong>' + hausa + '</strong>';
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


function backToEnglish() {
  if (!left || operator || right) return;

  const wordResult = document.getElementById('word-result');

  wordResult.innerHTML =
    '<span class="small-label">Result in words</span><strong>' + numberToWords(left) + '</strong>';
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

function updateStepsDisplay() {
  // This function might be used elsewhere in your code
  // Keeping it here for compatibility
}

fetchCurrencyRates()

function copyResult() {
  const text = document.getElementById('result').value;
  if (!text) return;

  navigator.clipboard.writeText(text)
    .then(() => alert('Result copied!'))
    .catch(() => alert('Failed to copy'));
}


function startVoiceInput() {
  clearResult()
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert("Speech recognition not supported in this browser.");
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = false;

  recognition.onresult = (event) => {
    const spokenText = event.results[0][0].transcript;
    handleSpokenMath(spokenText);
  };

  recognition.start();
}


function handleSpokenMath(text) {
  const tokens = normalizeSpeech(text);

  tokens.forEach(token => {
    if (["+", "-", "*", "x", "/"].includes(token)) {
      operatorToResult(token);

    } else {
      appendToResult(token);
    }
  });
}


function normalizeSpeech(text) {
  let normalized = text.toLowerCase();

  const replacements = {
    "multiplied by": "*",
    "divided by": "/",
    "times": "*",
    "x": "*",
    "multiply": "*",
    "plus": "+",
    "add": "+",
    "minus": "-",
    "subtract": "-"
  };


  for (let key in replacements) {
    normalized = normalized.replaceAll(key, replacements[key]);
  }

  const numbers = {
    "zero": "0",
    "one": "1",
    "two": "2",
    "three": "3",
    "four": "4",
    "five": "5",
    "six": "6",
    "seven": "7",
    "eight": "8",
    "nine": "9"
  };

  for (let word in numbers) {
    normalized = normalized.replaceAll(word, numbers[word]);
  }

  normalized = normalized.replace(/([\+\-\*\/])/g, ' $1 ');

  // Split into tokens
  return normalized
    .split(" ")
    .filter(t => t.trim() !== "");
}

function toggleHistory() {
  const historyCol = document.getElementById("history-column");
  const btn = document.getElementById("toggle-history-btn");

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
  const list = document.getElementById("history-list");
  if (!list) return;

  list.innerHTML = "";

  // Empty state
  if (calculationHistory.length === 0) {
    const emptyTemplate = document.getElementById("history-empty-template");
    if (emptyTemplate) {
      list.appendChild(emptyTemplate.content.cloneNode(true));
    }
    return;
  }
  // Render items latest first
  calculationHistory
    .slice()
    .reverse()
    .forEach((item, index) => {
      const tpl = document
        .getElementById("history-item-template")
        .content.cloneNode(true);

      const itemEl = tpl.querySelector(".history-item");
      tpl.querySelector(".history-item-expression").textContent =
        item.expression;
      tpl.querySelector(".history-item-words").textContent = item.words;
      tpl.querySelector(".history-item-time").textContent = item.time;
      const remarkText = tpl.querySelector(".remark-text");
      const remarkBox = tpl.querySelector(".remark-box");
      const remarkInput = remarkBox.querySelector("input");
      if (item.remark) {
        remarkText.textContent = item.remark;
      }
      // DELETE
      tpl.querySelector(".btn-delete").onclick = (e) => {
        e.stopPropagation();
        calculationHistory.splice(index, 1);
        saveHistoryToStorage();
        renderHistory();
      };
      // SHOW REMARK INPUT
      tpl.querySelector(".btn-remark").onclick = (e) => {
        e.stopPropagation();
        remarkBox.classList.remove("d-none");
        remarkInput.focus();
      };

      // SET REMARK
      remarkBox.querySelector(".btn-primary").onclick = (e) => {
        e.stopPropagation();
        item.remark = remarkInput.value.trim();
        saveHistoryToStorage();
        renderHistory();
      };

      // CANCEL REMARK
      remarkBox.querySelector(".btn-outline-secondary").onclick = (e) => {
        e.stopPropagation();
        remarkBox.classList.add("d-none");
      };
      // Click to restore calculation
      itemEl.addEventListener("click", () => {
        currentExpression = item.expression;
        updateResult();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });

      list.appendChild(tpl);

      // Trigger fade-in
      setTimeout(() => {
        itemEl.classList.add("show");
      }, index * 50); // staggered fade-in
    });
}
function loadHistoryFromStorage() {
  const stored = localStorage.getItem("calcHistory");
  if (stored) calculationHistory = JSON.parse(stored);
}
function clearHistory() {
  if (!confirm("Are you sure you want to clear all calculation history?")) return;
  calculationHistory = [];
  localStorage.removeItem("calcHistory");
  renderHistory();
}
document.addEventListener("DOMContentLoaded", function () {
  const scrollBtn = document.getElementById("scroll-to-calculator");
  if (scrollBtn) {
    scrollBtn.addEventListener("click", () => {
      const calculatorTop = document.querySelector(".calculator-card");

      if (calculatorTop) {
        calculatorTop.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  }
});
function openGeometry() {
  document.getElementById("geometryModal").style.display = "flex";
}

function closeGeometry() {
  document.getElementById("geometryModal").style.display = "none";
}

function calculateGeometry() {

  let shape = document.getElementById("shapeSelect").value;
  let v1 = parseFloat(document.getElementById("input1").value);
  let v2 = parseFloat(document.getElementById("input2").value);
  let result;

  if (isNaN(v1)) {
    alert("Enter Value 1");
    return;
  }

  switch (shape) {

    case "rectangle":
      if (isNaN(v2)) return alert("Enter Value 2");
      result = v1 * v2;
      break;

    case "triangle":
      if (isNaN(v2)) return alert("Enter Value 2");
      result = 0.5 * v1 * v2;
      break;

    case "circle":
      result = Math.PI * v1 * v1;
      break;

    case "square":
      result = v1 * v1;
      break;

    case "perimeterSquare":
      result = 4 * v1;
      break;

    case "perimeterRectangle":
      if (isNaN(v2)) return alert("Enter Value 2");
      result = 2 * (v1 + v2);
      break;

    case "cubeVolume":
      result = v1 * v1 * v1;
      break;

    case "cylinderVolume":
      if (isNaN(v2)) return alert("Enter Height");
      result = Math.PI * v1 * v1 * v2;
      break;

    default:
      alert("Select a shape");
      return;
  }

  left = result.toFixed(4).toString();
  operator = "";
  right = "";
  currentExpression = left
  updateResult();
  closeGeometry();
}

function updateGeometryInputs() {

  let shape = document.getElementById("shapeSelect").value;
  let input2 = document.getElementById("input2");

  if (shape === "circle" || shape === "square" || shape === "perimeterSquare" || shape === "cubeVolume") {
    input2.style.display = "none";
  } else {
    input2.style.display = "block";
  }
}