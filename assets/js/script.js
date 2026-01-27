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

function differentiateExpression() {
  const input = document.getElementById("diff-input");
  const output = document.getElementById("diff-output");
  if (!input || !output) return;

  const raw = input.value.trim();
  if (!raw) {
    output.innerText = "Enter an expression to differentiate.";
    return;
  }

  try {
    const normalized = normalizeInput(raw);
    const expr = stripDerivativePrefix(normalized);
    const tokens = tokenize(expr);
    const parser = new Parser(tokens);
    const ast = parser.parseExpression();
    if (!parser.isAtEnd()) {
      throw new Error("Unexpected token near the end of the expression.");
    }
    const derivative = simplify(differentiate(ast));
    output.innerText = toString(derivative);
  } catch (error) {
    output.innerText = error.message || "Invalid expression.";
  }
}

function normalizeInput(value) {
  return value.replace(/−/g, "-").replace(/\s+/g, " ");
}

function stripDerivativePrefix(value) {
  const trimmed = value.trim();
  if (/^d\/dx/i.test(trimmed)) {
    let rest = trimmed.replace(/^d\/dx/i, "").trim();
    if (rest.startsWith("(") && rest.endsWith(")")) {
      rest = rest.slice(1, -1).trim();
    }
    return rest;
  }
  return trimmed;
}

function tokenize(value) {
  const tokens = [];
  let i = 0;

  while (i < value.length) {
    const ch = value[i];

    if (ch === " ") {
      i += 1;
      continue;
    }

    if ((ch >= "0" && ch <= "9") || ch === ".") {
      let num = ch;
      i += 1;
      while (i < value.length && ((value[i] >= "0" && value[i] <= "9") || value[i] === ".")) {
        num += value[i];
        i += 1;
      }
      if (num === ".") throw new Error("Invalid number format.");
      tokens.push({ type: "number", value: parseFloat(num) });
      continue;
    }

    if ((ch >= "a" && ch <= "z") || (ch >= "A" && ch <= "Z")) {
      let ident = ch;
      i += 1;
      while (i < value.length && /[a-zA-Z]/.test(value[i])) {
        ident += value[i];
        i += 1;
      }
      const lower = ident.toLowerCase();
      if (lower === "x") {
        tokens.push({ type: "variable", name: "x" });
      } else if (["sin", "cos", "tan", "ln", "log", "exp"].includes(lower)) {
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

  return insertImplicitMultiplication(tokens);
}

function insertImplicitMultiplication(tokens) {
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
