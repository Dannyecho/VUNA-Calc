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

function appendToResult(value) {
    if (operator.length == 0) {
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

function clearResult() {
    left = '';
    right = '';
    operator = '';

    wordPlaceholder.innerHTML = '';
    updateResult();
}

function updateResult() {
    document.getElementById('result').value = left + operator + right;
}


function backspace() {
    if (right.length) {
        right = right.slice(0, -1);
        updateResult();
        return;
    }

    if (operator.length) {
        operator = '';
        updateResult();
        return;
    }

    if (left.length) {
        left = left.slice(0, -1);
        updateResult();
    }
}

function calculateResult() {
    try {
        let leftVal = parseFloat(left);
        let rightVal = parseFloat(right);
        let result = 0;

        /* SENDING TO THE SERVER
        let data = {
            left: leftVal,
            right: rightVal,
            operator: operator,
        };  

        
        let xhr = new XMLHttpRequest();
        // xhr.setRequestHeader( 'Content-Type', 'application/json' );
        xhr.open( 'POST', window.location.origin+'/server.php', true );
        xhr.onreadystatechange = function(){
            if( xhr.readyState == 4 ){
                result = xhr.response;
                console.log( 'result', result );
            }
        };
        
        xhr.send( JSON.stringify(data) );
        alert('Sending'); */

        switch (operator) {
            case '+':
                result = leftVal + rightVal;
                break;
            case '-':
                result = leftVal - rightVal;
                break;
            case '*':
                result = leftVal * rightVal;
                break;
            case '/':
                result = leftVal / rightVal;
                break;
        }

        if (!isNaN(result)) {
            left = result.toString();

            right = '';
            operator = '';
            updateResult();
            numberToWords(result.toString());
        }

    } catch (error) {
        document.getElementById('result').value = 'Error';
    }
}

function numberToWords(numVal) {
    const unitsMap = [
        "", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
        "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen",
        "seventeen", "eighteen", "nineteen"
    ];

    const tensMap = [
        "", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"
    ];

    const scales = ["", "thousand", "million", "billion", "trillion"];

    let words = "";
    let scaleIndex = 0;

    let wordArr = [];

    let splitedNum = numVal.split( '.' );
    for( let i=0; i<splitedNum.length; i++ ){
        let num = splitedNum[i];
        if (num === 0) {
            wordPlaceholder.innerHTML = 'Zero';
        }

        while (num > 0) {
            let currentNum = num % 1000;
            num = Math.floor(num / 1000);
    
            let currentWords = "";
    
            // console.log('current num', currentNum);
            // console.log('num', num);
            const hundreds = Math.floor(currentNum / 100);
            currentNum %= 100;
    
            // console.log('hundreds', hundreds);
            // console.log('current num', currentNum);
    
            if (hundreds > 0) {
                currentWords += unitsMap[hundreds] + " hundred ";
            }
    
            if (currentNum > 0) {
                if (currentNum < 20) {
                    currentWords += unitsMap[currentNum] + " ";
                } else {
                    const tens = Math.floor(currentNum / 10);
                    const units = currentNum % 10;
    
                    currentWords += tensMap[tens] + " ";
                    if (units > 0) {
                        currentWords += unitsMap[units] + " ";
                    }
                }
            }
    
            if (currentWords.trim() !== "") {
                // console.log('Words1', words);
                words = currentWords.trim() + ' ' + scales[scaleIndex] + " " + words;
                // console.log('Words2', words);
            }
    
            scaleIndex++;
        }

        // console.log(words.trim());
        wordArr.push(words.trim());
        scaleIndex = 0;
        words = '';
    }

    wordPlaceholder.innerHTML = wordArr.join(' point ');
    // return ;
}