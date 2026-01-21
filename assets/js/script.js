var left = '';
var operator = '';
var right = '';
let wordPlaceholder = document.getElementById('word-result');

// Theme toggle functionality
const themeToggle = document.getElementById('theme-toggle');
const htmlElement = document.documentElement;

// Load saved theme
const savedTheme = localStorage.getItem('theme') || 'light';
if (savedTheme === 'dark') {
    htmlElement.setAttribute('data-bs-theme', 'dark');
    themeToggle.checked = true;
} else {
    htmlElement.setAttribute('data-bs-theme', 'light');
    themeToggle.checked = false;
}

// Toggle theme on change
themeToggle.addEventListener('change', () => {
    if (themeToggle.checked) {
        htmlElement.setAttribute('data-bs-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    } else {
        htmlElement.setAttribute('data-bs-theme', 'light');
        localStorage.setItem('theme', 'light');
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

function applyFunction(func) {
    let value = parseFloat(left);
    if (isNaN(value)) {
        document.getElementById('result').value = 'Error';
        return;
    }

    let result;
    try {
        switch (func) {
            case 'sin':
                result = Math.sin(value * Math.PI / 180); // Assuming degrees
                break;
            case 'cos':
                result = Math.cos(value * Math.PI / 180);
                break;
            case 'tan':
                result = Math.tan(value * Math.PI / 180);
                break;
            case 'sqrt':
                if (value < 0) throw new Error('Invalid input');
                result = Math.sqrt(value);
                break;
            default:
                throw new Error('Unknown function');
        }

        left = result.toString();
        right = '';
        operator = '';
        updateResult();
        numberToWords(result.toString());
    } catch (error) {
        document.getElementById('result').value = 'Error';
        wordPlaceholder.innerHTML = '';
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
