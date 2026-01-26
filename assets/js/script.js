var left = '';
var operator = '';
var right = '';
let wordPlaceholder = document.getElementById('word-result');

// Variables to store last calculation for redo
let lastCalculation = {
    left: '',
    operator: '',
    right: '',
    result: '',
    wordResult: ''
};

function appendToResult(value) {
    // Disable redo when user starts typing new calculation
    disableRedo();
    
    if (operator.length == 0) {
        left += value;
    } else {
        right += value;
    }

    updateResult();
}

function bracketToResult(value) {
    disableRedo();
    document.getElementById('result').value += value;
}

function operatorToResult(value) {
    disableRedo();
    if (right.length) {
        calculateResult();
    }
    operator = value;
    updateResult();
}

function clearResult() {
    // Save current state before clearing (only if there's a completed calculation)
    if (left !== '' && lastCalculation.result !== '') {
        // The last calculation is already saved in calculateResult
        // Just enable the redo button
        enableRedo();
    }
    
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
    disableRedo();
    
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
            // Save the calculation BEFORE updating for redo feature
            lastCalculation = {
                left: left,
                operator: operator,
                right: right,
                result: result.toString(),
                wordResult: '' // Will be filled by numberToWords
            };
            
            left = result.toString();

            right = '';
            operator = '';
            updateResult();
            numberToWords(result.toString());
            
            // Save the word result too
            lastCalculation.wordResult = wordPlaceholder.innerHTML;
        }

    } catch (error) {
        document.getElementById('result').value = 'Error';
    }
}

function redoCalculation() {
    if (lastCalculation.result !== '') {
        // Restore the entire calculation with result
        left = lastCalculation.left;
        operator = lastCalculation.operator;
        right = lastCalculation.right;
        
        // Show the full expression first
        document.getElementById('result').value = left + operator + right + '=' + lastCalculation.result;
        
        // Then restore to just the result
        setTimeout(() => {
            left = lastCalculation.result;
            operator = '';
            right = '';
            updateResult();
            wordPlaceholder.innerHTML = lastCalculation.wordResult;
        }, 1000);
        
        // Disable redo button after use
        disableRedo();
    }
}

function enableRedo() {
    const redoBtn = document.getElementById('redoBtn');
    redoBtn.disabled = false;
}

function disableRedo() {
    const redoBtn = document.getElementById('redoBtn');
    redoBtn.disabled = true;
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
