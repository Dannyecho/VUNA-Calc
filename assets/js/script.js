var left = '';
var operator = '';
var right = '';
let wordPlaceholder = document.getElementById('word-result');

// Keyboard support
document.addEventListener('keydown', function(event) {
    const key = event.key;

    if (key >= '0' && key <= '9') {
        appendToResult(key);
        event.preventDefault();
    }
    else if (key === '.') {
        appendToResult('.');
        event.preventDefault();
    }
    else if (key === '+') {
        operatorToResult('+');
        event.preventDefault();
    }
    else if (key === '-') {
        operatorToResult('-');
        event.preventDefault();
    }
    else if (key === '*') {
        operatorToResult('*');
        event.preventDefault();
    }
    else if (key === '/') {
        operatorToResult('/');
        event.preventDefault();
    }
    // Enter or = for calculate
    else if (key === 'Enter' || key === '=') {
        calculateResult();
        event.preventDefault();
    }
    // Backspace for delete
    else if (key === 'Backspace') {
        backspace();
        event.preventDefault();
    }
    // Escape for clear
    else if (key === 'Escape') {
        clearResult();
        event.preventDefault();
    }
    // Brackets
    else if (key === '(') {
        bracketToResult('(');
        event.preventDefault();
    }
    else if (key === ')') {
        bracketToResult(')');
        event.preventDefault();
    }
});
