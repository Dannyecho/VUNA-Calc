var left = '';
var operator = '';
var right = '';
var steps = [];
var MAX_STEPS = 6;


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
  left = "";
  right = "";
  operator = "";
  steps = [];

  document.getElementById("word-result").innerHTML = "";
  document.getElementById("word-area").style.display = "none";
  document.getElementById("steps").innerText = "";

  updateResult();
}



function calculateResult() {
  if (left.length === 0 || operator.length === 0 || right.length === 0) return;

  const l = parseFloat(left);
  const r = parseFloat(right);
  let result;

  switch (operator) {
    case "+":
      result = l + r;
      break;
    case "-":
      result = l - r;
      break;
    case "*":
      result = l * r;
      break;
    case "/":
      result = r !== 0 ? l / r : "Error";
      break;
    default:
      return;
  }

  if (steps.length < MAX_STEPS) {
    steps.push(`Step ${steps.length + 1}: ${l} ${operator} ${r} = ${result}`);
  }

  left = result.toString();
  operator = "";
  right = "";

  updateStepsDisplay();
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

function updateStepsDisplay() {
  const stepsDiv = document.getElementById("steps");
  if (!stepsDiv) return;

  stepsDiv.innerText = steps.join("\n");
}

function toggleLimitMode() {
  const panel = document.getElementById("limit-panel");
  const button = document.getElementById("limit-toggle");
  if (!panel || !button) return;

  const isVisible = panel.style.display === "block";
  panel.style.display = isVisible ? "none" : "block";
  button.classList.toggle("mode-active", !isVisible);
}

function insertLimitTemplate(type) {
  const input = document.getElementById("limit-function");
  if (!input) return;
  if (type === "sinx") {
    input.value = "sin(x)/x";
  } else if (type === "rational") {
    input.value = "(x^2-1)/(x-1)";
  }
}

function clearLimitInputs() {
  const functionInput = document.getElementById("limit-function");
  const limitPoint = document.getElementById("limit-point");
  const errorEl = document.getElementById("limit-error");
  const resultEl = document.getElementById("limit-result");
  const methodEl = document.getElementById("limit-method");
  if (functionInput) functionInput.value = "";
  if (limitPoint) limitPoint.value = "";
  if (errorEl) errorEl.innerText = "";
  if (resultEl) resultEl.innerText = "";
  if (methodEl) methodEl.innerText = "";
}

function updateLimitPointState() {
  const typeSelect = document.getElementById("limit-type");
  const pointInput = document.getElementById("limit-point");
  if (!typeSelect || !pointInput) return;
  const isFinite = typeSelect.value.startsWith("finite");
  pointInput.disabled = !isFinite;
  pointInput.placeholder = isFinite ? "a" : "";
}

function computeLimit() {
  const functionInput = document.getElementById("limit-function");
  const typeSelect = document.getElementById("limit-type");
  const pointInput = document.getElementById("limit-point");
  const errorEl = document.getElementById("limit-error");
  const resultEl = document.getElementById("limit-result");
  const methodEl = document.getElementById("limit-method");
  if (!functionInput || !typeSelect || !pointInput || !errorEl || !resultEl || !methodEl) return;

  errorEl.innerText = "";
  resultEl.innerText = "";
  methodEl.innerText = "";

  const expr = functionInput.value.trim();
  if (!expr) {
    errorEl.innerText = "Enter a function to evaluate.";
    return;
  }

  const limitType = typeSelect.value;
  let point = null;
  if (limitType.startsWith("finite")) {
    if (!pointInput.value.trim()) {
      errorEl.innerText = "Enter a limit point a.";
      return;
    }
    point = parseFloat(pointInput.value);
    if (isNaN(point)) {
      errorEl.innerText = "Invalid limit point.";
      return;
    }
  }

  try {
    const ast = parseLimitExpression(expr);
    const result = evaluateLimit(ast, limitType, point);
    resultEl.innerText = result.value;
    methodEl.innerText = result.method;
  } catch (error) {
    errorEl.innerText = error.message || "Unable to compute limit.";
  }
}

function parseLimitExpression(expression) {
  const tokens = tokenizeLimit(expression);
  const parser = new LimitParser(tokens);
  const ast = parser.parseExpression();
  if (!parser.isAtEnd()) {
    throw new Error("Unexpected token near the end of the expression.");
  }
  return ast;
}

function tokenizeLimit(expression) {
  const tokens = [];
  let i = 0;
  const input = expression.replace(/\s+/g, "");

  while (i < input.length) {
    const ch = input[i];
    if ((ch >= "0" && ch <= "9") || ch === ".") {
      let num = ch;
      i += 1;
      while (i < input.length && ((input[i] >= "0" && input[i] <= "9") || input[i] === ".")) {
        num += input[i];
        i += 1;
      }
      if (num === ".") throw new Error("Invalid number format.");
      tokens.push({ type: "number", value: parseFloat(num) });
      continue;
    }

    if ((ch >= "a" && ch <= "z") || (ch >= "A" && ch <= "Z")) {
      let ident = ch;
      i += 1;
      while (i < input.length && /[a-zA-Z]/.test(input[i])) {
        ident += input[i];
        i += 1;
      }
      const lower = ident.toLowerCase();
      if (lower === "x") {
        tokens.push({ type: "variable", name: "x" });
      } else if (["sin", "cos", "tan", "ln", "log", "exp", "abs"].includes(lower)) {
        tokens.push({ type: "func", name: lower });
      } else if (lower === "e") {
        tokens.push({ type: "constant", name: "e", value: Math.E });
      } else if (lower === "pi") {
        tokens.push({ type: "constant", name: "pi", value: Math.PI });
      } else {
        throw new Error(`Unknown identifier: ${ident}`);
      }
      continue;
    }

    if ("+-*/^()".includes(ch)) {
      if (ch === "(") tokens.push({ type: "lparen", value: ch });
      else if (ch === ")") tokens.push({ type: "rparen", value: ch });
      else tokens.push({ type: "operator", value: ch });
      i += 1;
      continue;
    }

    throw new Error(`Unsupported character: ${ch}`);
  }

  return insertLimitImplicitMultiplication(tokens);
}

function insertLimitImplicitMultiplication(tokens) {
  const result = [];
  const leftTypes = ["number", "variable", "constant", "rparen"];
  const rightTypes = ["number", "variable", "constant", "func", "lparen"];
  for (let i = 0; i < tokens.length; i += 1) {
    const current = tokens[i];
    const next = tokens[i + 1];
    result.push(current);
    if (!next) continue;
    if (leftTypes.includes(current.type) && rightTypes.includes(next.type)) {
      result.push({ type: "operator", value: "*" });
    }
  }
  return result;
}

function LimitParser(tokens) {
  this.tokens = tokens;
  this.index = 0;
}

LimitParser.prototype.peek = function () {
  return this.tokens[this.index];
};

LimitParser.prototype.advance = function () {
  this.index += 1;
  return this.tokens[this.index - 1];
};

LimitParser.prototype.isAtEnd = function () {
  return this.index >= this.tokens.length;
};

LimitParser.prototype.matchOperator = function (op) {
  const token = this.peek();
  if (token && token.type === "operator" && token.value === op) {
    this.advance();
    return true;
  }
  return false;
};

LimitParser.prototype.parseExpression = function () {
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

LimitParser.prototype.parseTerm = function () {
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

LimitParser.prototype.parsePower = function () {
  let node = this.parseUnary();
  if (this.matchOperator("^")) {
    node = { type: "binary", op: "^", left: node, right: this.parsePower() };
  }
  return node;
};

LimitParser.prototype.parseUnary = function () {
  if (this.matchOperator("-")) {
    return { type: "unary", op: "-", value: this.parseUnary() };
  }
  return this.parsePrimary();
};

LimitParser.prototype.parsePrimary = function () {
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

function evaluateLimit(ast, limitType, point) {
  if (limitType === "pos-inf") {
    return limitAtInfinity(ast, 1);
  }
  if (limitType === "neg-inf") {
    return limitAtInfinity(ast, -1);
  }

  const side = limitType === "finite-plus" ? 1 : limitType === "finite-minus" ? -1 : 0;
  return limitAtPoint(ast, point, side);
}

function limitAtPoint(ast, point, side) {
  const direct = evaluateAst(ast, point);
  if (isFinite(direct)) {
    return { value: formatLimitValue(direct), method: "Symbolic simplification" };
  }

  const result = numericLimitAtPoint(ast, point, side);
  return result;
}

function numericLimitAtPoint(ast, point, side) {
  const sampleValues = [];
  const steps = [1e-1, 1e-2, 1e-3, 1e-4, 1e-5];
  const useBoth = side === 0;
  let leftValues = [];
  let rightValues = [];

  steps.forEach((step) => {
    if (side <= 0) {
      leftValues.push(evaluateAst(ast, point - step));
    }
    if (side >= 0) {
      rightValues.push(evaluateAst(ast, point + step));
    }
  });

  if (useBoth) {
    const left = reduceLimitSamples(leftValues);
    const right = reduceLimitSamples(rightValues);
    if (left.type === "none" || right.type === "none") {
      return { value: "Undefined", method: "Numeric approximation" };
    }
    if (left.type === "infinite" || right.type === "infinite") {
      if (left.type === right.type && left.sign === right.sign) {
        return { value: left.sign > 0 ? "∞" : "-∞", method: "Numeric approximation" };
      }
      return { value: "Does not exist (DNE)", method: "Numeric approximation" };
    }
    if (Math.abs(left.value - right.value) < 1e-4) {
      return { value: formatLimitValue((left.value + right.value) / 2), method: "Numeric approximation" };
    }
    return { value: "Does not exist (DNE)", method: "Numeric approximation" };
  }

  sampleValues.push(...leftValues, ...rightValues);
  const reduced = reduceLimitSamples(sampleValues);
  if (reduced.type === "none") {
    return { value: "Undefined", method: "Numeric approximation" };
  }
  if (reduced.type === "infinite") {
    return { value: reduced.sign > 0 ? "∞" : "-∞", method: "Numeric approximation" };
  }
  return { value: formatLimitValue(reduced.value), method: "Numeric approximation" };
}

function limitAtInfinity(ast, direction) {
  const magnitudes = [10, 100, 1000, 10000, 100000];
  const values = magnitudes.map((m) => evaluateAst(ast, m * direction));
  const reduced = reduceLimitSamples(values);
  if (reduced.type === "none") {
    return { value: "Undefined", method: "Numeric approximation" };
  }
  if (reduced.type === "infinite") {
    return { value: reduced.sign > 0 ? "∞" : "-∞", method: "Numeric approximation" };
  }
  return { value: formatLimitValue(reduced.value), method: "Numeric approximation" };
}

function reduceLimitSamples(values) {
  const finite = values.filter((val) => isFinite(val));
  if (!finite.length) {
    const infiniteCount = values.filter((val) => val === Infinity || val === -Infinity).length;
    if (infiniteCount) {
      const sign = values.some((val) => val === Infinity) ? 1 : -1;
      return { type: "infinite", sign };
    }
    return { type: "none" };
  }

  const avg = finite.reduce((sum, val) => sum + val, 0) / finite.length;
  const variance = finite.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / finite.length;
  if (variance < 1e-6) {
    return { type: "finite", value: avg };
  }

  const last = finite[finite.length - 1];
  const nearLast = finite.slice(-2)[0];
  if (Math.abs(last - nearLast) < 1e-4) {
    return { type: "finite", value: last };
  }

  const large = finite.filter((val) => Math.abs(val) > 1e6);
  if (large.length) {
    const sign = large.some((val) => val > 0) ? 1 : -1;
    return { type: "infinite", sign };
  }

  return { type: "none" };
}

function evaluateAst(node, xValue) {
  switch (node.type) {
    case "number":
      return node.value;
    case "variable":
      return xValue;
    case "constant":
      return node.value;
    case "unary":
      return -evaluateAst(node.value, xValue);
    case "binary":
      return evaluateBinaryAst(node, xValue);
    case "func":
      return evaluateFunctionAst(node, xValue);
    default:
      return NaN;
  }
}

function evaluateBinaryAst(node, xValue) {
  const left = evaluateAst(node.left, xValue);
  const right = evaluateAst(node.right, xValue);
  switch (node.op) {
    case "+":
      return left + right;
    case "-":
      return left - right;
    case "*":
      return left * right;
    case "/":
      return right === 0 ? NaN : left / right;
    case "^":
      return Math.pow(left, right);
    default:
      return NaN;
  }
}

function evaluateFunctionAst(node, xValue) {
  const arg = evaluateAst(node.arg, xValue);
  switch (node.name) {
    case "sin":
      return Math.sin(arg);
    case "cos":
      return Math.cos(arg);
    case "tan":
      return Math.tan(arg);
    case "ln":
      return arg <= 0 ? NaN : Math.log(arg);
    case "log":
      return arg <= 0 ? NaN : Math.log(arg) / Math.log(10);
    case "exp":
      return Math.exp(arg);
    case "abs":
      return Math.abs(arg);
    default:
      return NaN;
  }
}

function formatLimitValue(value) {
  if (!isFinite(value)) return "Undefined";
  if (Math.abs(value - Math.round(value)) < 1e-10) {
    return `${Math.round(value)}`;
  }
  return `${parseFloat(value.toFixed(6))}`;
}

document.addEventListener("DOMContentLoaded", () => {
  const typeSelect = document.getElementById("limit-type");
  if (typeSelect) {
    typeSelect.addEventListener("change", updateLimitPointState);
    updateLimitPointState();
  }
});

const CurrencyService = (() => {
  const CACHE_KEY = "vuna_currency_cache_v1";
  const CACHE_TTL_MS = 1000 * 60 * 60 * 6;
  const DEFAULT_BASE = "USD";
  const SUPPORTED = ["NGN", "USD", "EUR", "GBP", "CAD", "AUD", "GHS", "ZAR"];
  const STATIC_RATES = {
    USD: 1,
    NGN: 1500,
    EUR: 0.92,
    GBP: 0.79,
    CAD: 1.36,
    AUD: 1.53,
    GHS: 13.2,
    ZAR: 18.9,
  };

  function loadCache() {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (!data || !data.rates || !data.timestamp) return null;
      return data;
    } catch (error) {
      return null;
    }
  }

  function saveCache(payload) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
    } catch (error) {
      // ignore cache write failures
    }
  }

  async function fetchRates() {
    const response = await fetch(
      `https://api.exchangerate.host/latest?base=${DEFAULT_BASE}`,
      { cache: "no-store" }
    );
    if (!response.ok) {
      throw new Error("Rates unavailable—check internet.");
    }
    const data = await response.json();
    if (!data || !data.rates) {
      throw new Error("Invalid rates response.");
    }
    return {
      base: DEFAULT_BASE,
      rates: data.rates,
      timestamp: Date.now(),
    };
  }

  function isCacheFresh(cache) {
    if (!cache) return false;
    return Date.now() - cache.timestamp <= CACHE_TTL_MS;
  }

  async function getRates() {
    try {
      const live = await fetchRates();
      saveCache(live);
      return { ...live, source: "live" };
    } catch (error) {
      const cached = loadCache();
      if (cached) {
        return { ...cached, source: "cache", stale: !isCacheFresh(cached) };
      }
      return {
        base: DEFAULT_BASE,
        rates: STATIC_RATES,
        timestamp: null,
        source: "static",
      };
    }
  }

  function convert(amount, from, to, rates) {
    if (!rates[from] || !rates[to]) return NaN;
    const rate = rates[to] / rates[from];
    return amount * rate;
  }

  function formatNumber(value) {
    if (!isFinite(value)) return "Error";
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }).format(value);
  }

  function formatTimestamp(timestamp) {
    if (!timestamp) return "Static rates";
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(timestamp));
  }

  function formatRate(from, to, rates) {
    if (!rates[from] || !rates[to]) return "";
    const rate = rates[to] / rates[from];
    return `1 ${from} = ${formatNumber(rate)} ${to}`;
  }

  return {
    SUPPORTED,
    getRates,
    convert,
    formatNumber,
    formatTimestamp,
    formatRate,
  };
})();

function toggleCurrencyMode() {
  const panel = document.getElementById("currency-panel");
  const button = document.getElementById("currency-toggle");
  if (!panel || !button) return;

  const isVisible = panel.style.display === "block";
  panel.style.display = isVisible ? "none" : "block";
  button.classList.toggle("mode-active", !isVisible);
}

function swapCurrencies() {
  const fromSelect = document.getElementById("currency-from");
  const toSelect = document.getElementById("currency-to");
  if (!fromSelect || !toSelect) return;

  const temp = fromSelect.value;
  fromSelect.value = toSelect.value;
  toSelect.value = temp;

  convertCurrency();
}

async function convertCurrency() {
  const amountInput = document.getElementById("currency-amount");
  const fromSelect = document.getElementById("currency-from");
  const toSelect = document.getElementById("currency-to");
  const errorEl = document.getElementById("currency-error");
  const resultEl = document.getElementById("currency-result");
  const metaEl = document.getElementById("currency-meta");

  if (!amountInput || !fromSelect || !toSelect || !errorEl || !resultEl || !metaEl) return;

  errorEl.innerText = "";
  resultEl.innerText = "";
  metaEl.innerText = "";

  const rawAmount = amountInput.value.trim();
  if (!rawAmount) {
    errorEl.innerText = "Enter an amount to convert.";
    return;
  }

  const amount = parseFloat(rawAmount);
  if (isNaN(amount)) {
    errorEl.innerText = "Invalid amount.";
    return;
  }

  try {
    const { rates, timestamp, source, stale } = await CurrencyService.getRates();
    const from = fromSelect.value;
    const to = toSelect.value;
    const converted = CurrencyService.convert(amount, from, to, rates);

    if (!isFinite(converted)) {
      errorEl.innerText = "Unable to convert with the selected currencies.";
      return;
    }

    resultEl.innerText = `${CurrencyService.formatNumber(converted)} ${to}`;
    const rateLine = CurrencyService.formatRate(from, to, rates);
    const timeLabel = CurrencyService.formatTimestamp(timestamp);
    let meta = `${rateLine} • Updated: ${timeLabel}`;
    if (source === "cache") {
      meta += stale ? " (cached, stale)" : " (cached)";
    }
    if (source === "static") {
      meta += " (offline rates)";
    }
    metaEl.innerText = meta;
  } catch (error) {
    errorEl.innerText = error.message || "Rates unavailable—check internet.";
  }
}

function initCurrencyUI() {
  const amountInput = document.getElementById("currency-amount");
  const fromSelect = document.getElementById("currency-from");
  const toSelect = document.getElementById("currency-to");

  if (!amountInput || !fromSelect || !toSelect) return;

  amountInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      convertCurrency();
    }
  });

  fromSelect.addEventListener("change", convertCurrency);
  toSelect.addEventListener("change", convertCurrency);
}

initCurrencyUI();
