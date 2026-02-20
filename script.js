var left = '';
var operator = '';
var right = '';

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
    left = '';
    right = '';
    operator = '';
    document.getElementById('word-result').innerHTML = '';
    document.getElementById('word-area').style.display = 'none';
    updateResult();
}

function convertToHex() {
    // Check if there's a value to convert
    if (currentExpression.length === 0) {
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
}

function calculateResult() {
    if (left.length === 0 || operator.length === 0 || right.length === 0) return;

    let result;
    const l = parseFloat(left);
    const r = parseFloat(right);

    switch (operator) {
        case '+': result = l + r; break;
        case '-': result = l - r; break;
        case '*': result = l * r; break;
        case '/': result = r !== 0 ? l / r : 'Error'; break;
        case '^': result = Math.pow(l, r); break;
        default: return;
    }

    left = result.toString();
    operator = '';
    right = '';
    updateResult();
}



// Calculate square root (√)
function calculateSquareRoot() {
    let currentValue;
    
    // If we have a complete expression, calculate it first
    if (left && operator && right) {
        calculateResult();
        currentValue = left;
    } else if (left) {
        currentValue = left;
    } else {
        return; // Nothing to calculate
    }
    
    // Convert to number and calculate square root
    let num = parseFloat(currentValue);
    
    if (num < 0) {
        alert('Cannot calculate square root of negative number');
        return;
    }
    
    let result = Math.sqrt(num);
    
    // Update the calculator
    left = result.toString();
    operator = '';
    right = '';
    
    updateResult();
}

// Calculate square (x²)
function calculateSquare() {
    let currentValue;
    
    // If we have a complete expression, calculate it first
    if (left && operator && right) {
        calculateResult();
        currentValue = left;
    } else if (left) {
        currentValue = left;
    } else {
        return; // Nothing to calculate
    }
    
    // Convert to number and calculate square
    let num = parseFloat(currentValue);
    let result = num * num;
    
    // Update the calculator
    left = result.toString();
    operator = '';
    right = '';
    
    updateResult();
}

// Calculate cube (x³)
function calculateCube() {
    let currentValue;
    
    // If we have a complete expression, calculate it first
    if (left && operator && right) {
        calculateResult();
        currentValue = left;
    } else if (left) {
        currentValue = left;
    } else {
        return; // Nothing to calculate
    }
    
    // Convert to number and calculate cube
    let num = parseFloat(currentValue);
    let result = num * num * num;
    
    // Update the calculator
    left = result.toString();
    operator = '';
    right = '';
    
    updateResult();
}

// Calculate power (x^y)
function calculatePower() {
    // Only proceed if left exists
    if (!left) return;
    
    // If we already have a complete expression, calculate it first
    if (operator && right) {
        calculateResult();
    }
    
    // Set operator to power (^)
    operator = '^';
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

// Copy numeric result to clipboard
function copyResult() {
    const text = document.getElementById('result').value;
    if (!text) return;

    navigator.clipboard.writeText(text)
    .then(() => alert('Result copied!'))
    .catch(() => alert('Failed to copy'));
}

function percentToResult() {
    // Only proceed if left exists
    if (!left) return;

    // If no operator, just divide left by 100
    if (!operator) {
        left = (parseFloat(left) / 100).toString();
        updateResult();
        convertToWords(left);
        return;
    }

    // If operator exists but right is empty, wait for user input
    if (!right) return;

    // If both operator and right exist, calculate percentage of left
    let result = (parseFloat(right) / 100) * parseFloat(left);

    // Move result to left, clear operator and right
    left = result.toString();
    operator = '';
    right = '';

    updateResult();
    convertToWords(left);
}
function showSolution() {
    // Get current expression
    if (!left || !operator || !right) {
        // If incomplete expression, show message
        alert('Please enter a complete expression (e.g., 2 + 3) to see step-by-step solution');
        return;
    }

    const steps = [];
    const l = parseFloat(left);
    const r = parseFloat(right);
    
    // Add initial step
    steps.push({
        number: 1,
        expression: `${left} ${operator} ${right}`,
        explanation: `Starting with the expression: ${left} ${operator} ${right}`,
        runningTotal: null
    });

    let result;
    let intermediateSteps = [];

    // Break down based on operator
    switch(operator) {
        case '+':
            result = l + r;
            intermediateSteps = [
                {
                    number: 2,
                    expression: `${l} + ${r}`,
                    explanation: `Add ${l} and ${r}`,
                    runningTotal: `${l} + ${r} = ${result}`
                }
            ];
            break;
            
        case '-':
            result = l - r;
            intermediateSteps = [
                {
                    number: 2,
                    expression: `${l} - ${r}`,
                    explanation: `Subtract ${r} from ${l}`,
                    runningTotal: `${l} - ${r} = ${result}`
                }
            ];
            break;
            
        case '*':
            result = l * r;
            intermediateSteps = [
                {
                    number: 2,
                    expression: `${l} × ${r}`,
                    explanation: `Multiply ${l} by ${r}`,
                    runningTotal: `${l} × ${r} = ${result}`
                }
            ];
            break;
            
        case '/':
            if (r === 0) {
                alert('Cannot divide by zero');
                return;
            }
            result = l / r;
            intermediateSteps = [
                {
                    number: 2,
                    expression: `${l} ÷ ${r}`,
                    explanation: `Divide ${l} by ${r}`,
                    runningTotal: `${l} ÷ ${r} = ${result.toFixed(4)}`
                }
            ];
            break;
            
        case '^':
            result = Math.pow(l, r);
            
            // Show repeated multiplication for integer exponents
            if (Number.isInteger(r) && r > 0) {
                let multiplication = l;
                for (let i = 1; i < r; i++) {
                    multiplication += ` × ${l}`;
                }
                intermediateSteps = [
                    {
                        number: 2,
                        expression: `${l}^${r} = ${l} × ${l} (${r} times)`,
                        explanation: `${l} raised to power ${r} means multiplying ${l} by itself ${r} times`,
                        runningTotal: `${multiplication} = ${result}`
                    }
                ];
            } else {
                intermediateSteps = [
                    {
                        number: 2,
                        expression: `${l}^${r}`,
                        explanation: `Calculate ${l} raised to the power of ${r}`,
                        runningTotal: `${l}^${r} = ${result.toFixed(6)}`
                    }
                ];
            }
            break;
    }

    // Add intermediate steps
    steps.push(...intermediateSteps);

    // Add final result step
    steps.push({
        number: steps.length + 1,
        expression: `Final Result`,
        explanation: `The result of ${left} ${operator} ${right} is:`,
        runningTotal: result.toString(),
        isFinal: true
    });

    // Display steps
    displaySteps(steps);
}
// Step-by-Step Solution Function
function showSolution() {
    // Get current expression
    if (!left || !operator || !right) {
        // If incomplete expression, show message
        alert('Please enter a complete expression (e.g., 2 + 3) to see step-by-step solution');
        return;
    }

    const steps = [];
    const l = parseFloat(left);
    const r = parseFloat(right);
    
    // Add initial step
    steps.push({
        number: 1,
        expression: `${left} ${operator} ${right}`,
        explanation: `Starting with the expression: ${left} ${operator} ${right}`,
        runningTotal: null
    });

    let result;
    let intermediateSteps = [];

    // Break down based on operator
    switch(operator) {
        case '+':
            result = l + r;
            intermediateSteps = [
                {
                    number: 2,
                    expression: `${l} + ${r}`,
                    explanation: `Add ${l} and ${r}`,
                    runningTotal: `${l} + ${r} = ${result}`
                }
            ];
            break;
            
        case '-':
            result = l - r;
            intermediateSteps = [
                {
                    number: 2,
                    expression: `${l} - ${r}`,
                    explanation: `Subtract ${r} from ${l}`,
                    runningTotal: `${l} - ${r} = ${result}`
                }
            ];
            break;
            
        case '*':
            result = l * r;
            intermediateSteps = [
                {
                    number: 2,
                    expression: `${l} × ${r}`,
                    explanation: `Multiply ${l} by ${r}`,
                    runningTotal: `${l} × ${r} = ${result}`
                }
            ];
            break;
            
        case '/':
            if (r === 0) {
                alert('Cannot divide by zero');
                return;
            }
            result = l / r;
            intermediateSteps = [
                {
                    number: 2,
                    expression: `${l} ÷ ${r}`,
                    explanation: `Divide ${l} by ${r}`,
                    runningTotal: `${l} ÷ ${r} = ${result.toFixed(4)}`
                }
            ];
            break;
            
        case '^':
            result = Math.pow(l, r);
            
            // Show repeated multiplication for integer exponents
            if (Number.isInteger(r) && r > 0) {
                let multiplication = l;
                for (let i = 1; i < r; i++) {
                    multiplication += ` × ${l}`;
                }
                intermediateSteps = [
                    {
                        number: 2,
                        expression: `${l}^${r} = ${l} × ${l} (${r} times)`,
                        explanation: `${l} raised to power ${r} means multiplying ${l} by itself ${r} times`,
                        runningTotal: `${multiplication} = ${result}`
                    }
                ];
            } else {
                intermediateSteps = [
                    {
                        number: 2,
                        expression: `${l}^${r}`,
                        explanation: `Calculate ${l} raised to the power of ${r}`,
                        runningTotal: `${l}^${r} = ${result.toFixed(6)}`
                    }
                ];
            }
            break;
    }

    // Add intermediate steps
    steps.push(...intermediateSteps);

    // Add final result step
    steps.push({
        number: steps.length + 1,
        expression: `Final Result`,
        explanation: `The result of ${left} ${operator} ${right} is:`,
        runningTotal: result.toString(),
        isFinal: true
    });

    // Display steps
    displaySteps(steps);
}

function displaySteps(steps) {
    const stepsArea = document.getElementById('steps-area');
    const stepsContent = document.getElementById('steps-content');
    
    // Clear previous content
    stepsContent.innerHTML = '';
    
    // Add each step
    steps.forEach(step => {
        const stepDiv = document.createElement('div');
        stepDiv.className = `step-item ${step.isFinal ? 'final-result' : (step.runningTotal ? 'running-total' : '')}`;
        
        let html = `<div class="step-number">Step ${step.number}:</div>`;
        html += `<div class="step-expression">${step.expression}</div>`;
        html += `<div class="step-explanation">${step.explanation}</div>`;
        
        if (step.runningTotal) {
            html += `<div style="margin-top: 8px; padding-top: 5px; border-top: 1px dashed #ccc;">
                <strong>Result: </strong>${step.runningTotal}
            </div>`;
        }
        
        stepDiv.innerHTML = html;
        stepsContent.appendChild(stepDiv);
    });
    
    // Add a note about the result
    const noteDiv = document.createElement('div');
    noteDiv.style.marginTop = '15px';
    noteDiv.style.padding = '10px';
    noteDiv.style.background = '#fff3e0';
    noteDiv.style.borderRadius = '8px';
    noteDiv.style.fontSize = '0.9rem';
    noteDiv.innerHTML = '💡 <strong>Tip:</strong> You can also see this result in words above!';
    stepsContent.appendChild(noteDiv);
    
    // Show the steps area
    stepsArea.style.display = 'block';
    
    // Scroll to steps
    stepsArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function closeSteps() {
    document.getElementById('steps-area').style.display = 'none';
}

// Modify your calculateResult function to clear steps when new calculation starts
function calculateResult() {
    // Your existing calculateResult code...
    
    // Hide steps area when new calculation is performed
    document.getElementById('steps-area').style.display = 'none';
}