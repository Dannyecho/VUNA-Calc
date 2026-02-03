var left = '';
var operator = '';
var right = '';

const resultInput = document.getElementById('result');
const wordResult = document.getElementById('word-result');

/* ---------------input---------------- */

function appendToResult(value) {
    if (operator === '') {
        left += value;
    } else {
        right += value;
    }
    updateResult();
}

function operatorToResult(value) {
    if (left === '') return;
    if (right !== '') {
        calculateResult();
    }
    operator = value;
    updateResult();
}

function clearResult() {
    left = '';
    right = '';
    operator = '';
    resultInput.value = '';
    wordResult.innerHTML = '';
}

function backspace() {
    if (right !== '') {
        right = right.slice(0, -1);
    } else if (operator !== '') {
        operator = '';
    } else {
        left = left.slice(0, -1);
    }
    updateResult();
}

/* ----------------display---------------- */

function updateResult() {
    resultInput.value = left + operator + right;
}

/* ----------------calculation---------------- */

function calculateResult() {
    if (left === '' || operator === '' || right === '') return;

    let expression = left + operator + right;

    try {
        let result = eval(expression);
        resultInput.value = result;

        left = result.toString();
        right = '';
        operator = '';
    } catch (e) {
        resultInput.value = 'Error';
        left = '';
        right = '';
        operator = '';
    }
}

/* ----------------fraction function---------------- */

function convertToFraction() {
    let decimal = parseFloat(resultInput.value);
    if (isNaN(decimal)) return;

    if (Number.isInteger(decimal)) {
        resultInput.value = decimal + "/1";
        left = '';
        right = '';
        operator = '';
        return;
    }

    let tolerance = 1.0E-6;
    let h1 = 1, h2 = 0, k1 = 0, k2 = 1;
    let b = decimal;

    do {
        let a = Math.floor(b);
        let aux = h1;
        h1 = a * h1 + h2;
        h2 = aux;
        aux = k1;
        k1 = a * k1 + k2;
        k2 = aux;
        b = 1 / (b - a);
    } while (Math.abs(decimal - h1 / k1) > decimal * tolerance);

    resultInput.value = h1 + "/" + k1;

    left = '';
    right = '';
    operator = '';
}
