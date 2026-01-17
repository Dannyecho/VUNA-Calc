var left = '';
var operator = '';
var right = '';

let wordPlaceholder = document.getElementById('word-result');

function appendToResult(value) {
    if (operator.length === 0) {
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

function backspace() {
    if (right.length > 0) {
        right = right.slice(0, -1);
    } else if (operator.length > 0) {
        operator = '';
    } else {
        left = left.slice(0, -1);
    }
    updateResult();
}

function clearResult() {
    left = '';
    right = '';
    operator = '';
    document.getElementById('result').value = '';
    wordPlaceholder.innerHTML = '';
}

function updateResult() {
    document.getElementById('result').value = left + operator + right;
}

function calculateResult() {
    if (!left || !operator || !right) return;

    let expression = left + operator + right;

    try {
        let result = eval(expression);
        document.getElementById('result').value = result;
        left = result.toString();
        operator = '';
        right = '';
    } catch (e) {
        document.getElementById('result').value = 'Error';
    }
}

/* ================================
   KEYBOARD INTERACTION SUPPORT
   ================================ */
document.addEventListener('keydown', function (event) {
    const key = event.key;

    // Numbers
    if (!isNaN(key)) {
        appendToResult(key);
        return;
    }

    // Operators
    if (['+', '-', '*', '/'].includes(key)) {
        operatorToResult(key);
        return;
    }

    // Decimal point
    if (key === '.') {
        appendToResult('.');
        return;
    }

    // Brackets
    if (key === '(' || key === ')') {
        bracketToResult(key);
        return;
    }

    // Calculate
    if (key === 'Enter' || key === '=') {
        event.preventDefault();
        calculateResult();
        return;
    }

    // Backspace
    if (key === 'Backspace') {
        backspace();
        return;
    }

    // Clear (AC)
    if (key === 'Escape') {
        clearResult();
    }
});
