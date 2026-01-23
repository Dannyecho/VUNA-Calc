// ========== ORIGINAL CALCULATOR VARIABLES ==========
var left = '';
var operator = '';
var right = '';
let wordPlaceholder = document.getElementById('word-result');

// ========== NEW FUNCTIONALITY 2: CALCULATION TIMER VARIABLES ==========
// Tracks time elapsed since last calculation for performance monitoring
var lastCalculationTime = null;
var timerInterval = null;

// ========== ORIGINAL FUNCTION: Append numbers to the display ==========
function appendToResult(value) {
    if (operator.length == 0) {
        left += value;
    } else {
        right += value;  
    }
    updateResult();
    
    // NEW FUNCTIONALITY 4: Validate expression as user types
    validateExpression();
}

// ========== ORIGINAL FUNCTION: Add brackets to result ==========
function bracketToResult(value) {
    document.getElementById('result').value += value;
    
    // NEW FUNCTIONALITY 4: Validate expression after adding bracket
    validateExpression();
}

// ========== ORIGINAL FUNCTION: Add operator to calculation ==========
function operatorToResult(value) {    
    if (right.length) { 
        calculateResult(); 
    }   
    operator = value; 
    updateResult();
    
    // NEW FUNCTIONALITY 4: Validate expression after adding operator
    validateExpression();
}

// ========== ORIGINAL FUNCTION: Clear all values ==========
function clearResult() {
    left = '';  
    right = '';
    operator = '';

    document.getElementById('result').value = '';
    document.getElementById('word-result').innerHTML = '';
    
    // NEW FUNCTIONALITY 1: Clear the number base converter displays
    document.getElementById('binary-display').textContent = '-';
    document.getElementById('hex-display').textContent = '-';
    
    // NEW FUNCTIONALITY 4: Clear the expression validator
    document.getElementById('expression-validator').innerHTML = '';
    
    updateResult();
}

// ========== ENHANCED ORIGINAL FUNCTION: Update display with current calculation ==========
function updateResult() {
    // Build the display string showing current calculation
    let displayValue = left + operator + right;
    document.getElementById('result').value = displayValue;
    
    // Update word result display
    if (displayValue) {
        document.getElementById('word-result').innerHTML = 'Expression: ' + displayValue;
    } else {
        document.getElementById('word-result').innerHTML = '';
    }
    
    // NEW FUNCTIONALITY 1: Update number base converter in real-time
    updateNumberSystemDisplay();
}

// ========== NEW FUNCTIONALITY 1: NUMBER BASE CONVERTER ==========
// Converts the current number to Binary and Hexadecimal formats automatically
function updateNumberSystemDisplay() {
    let currentNum = getCurrentNumber();
    
    // Only convert if we have a valid positive integer
    if (currentNum !== null && !isNaN(currentNum) && Number.isInteger(currentNum) && currentNum >= 0) {
        // Convert to binary (base 2)
        document.getElementById('binary-display').textContent = currentNum.toString(2);
        
        // Convert to hexadecimal (base 16) and make uppercase
        document.getElementById('hex-display').textContent = currentNum.toString(16).toUpperCase();
    } else {
        // Show dash if number is not valid for conversion
        document.getElementById('binary-display').textContent = '-';
        document.getElementById('hex-display').textContent = '-';
    }
}

// ========== HELPER FUNCTION: Get current number from calculator ==========
// Returns the active number (right operand if exists, otherwise left operand)
function getCurrentNumber() {
    if (right.length > 0) {
        return parseFloat(right);
    } else if (left.length > 0) {
        return parseFloat(left);
    }
    return null;
}

// ========== ENHANCED ORIGINAL FUNCTION: Calculate and display final result ==========
function calculateResult() {
    if (left === '' || operator === '' || right === '') {
        return; // Don't calculate if incomplete
    }
    
    // NEW FUNCTIONALITY 2: Start calculation timer
    startCalculationTimer();
    
    try {
        // Perform the calculation
        let result = eval(left + operator + right);
        
        // Handle division by zero
        if (!isFinite(result)) {
            document.getElementById('word-result').innerHTML = 'Error: Cannot divide by zero';
            return;
        }
        
        // Round to 10 decimal places to avoid floating point errors
        result = Math.round(result * 10000000000) / 10000000000;
        
        // Update display with result
        document.getElementById('result').value = result;
        document.getElementById('word-result').innerHTML = 'Result: ' + result;
        
        // Set left to result for chain calculations
        left = result.toString();
        operator = '';
        right = '';
        
        updateResult();
        
    } catch (error) {
        document.getElementById('word-result').innerHTML = 'Error: Invalid calculation';
    }
}

// ========== NEW FUNCTIONALITY 2: CALCULATION TIMER ==========
// Shows elapsed time since last calculation to track solving time
function startCalculationTimer() {
    lastCalculationTime = new Date();
    
    // Clear any existing timer interval
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    // Update timer display every second
    timerInterval = setInterval(function() {
        let elapsed = Math.floor((new Date() - lastCalculationTime) / 1000);
        document.getElementById('calc-timer').textContent = 
            'Time since last calc: ' + elapsed + 's';
    }, 1000);
}

// ========== NEW FUNCTIONALITY 3: SMART RANDOM NUMBER GENERATOR ==========
// Generates a random number. If a number is entered, uses it as max; otherwise uses 1-100
function generateRandom() {
    let max;
    
    // Check if user has entered a number to use as maximum
    if (left !== '' && operator === '' && right === '') {
        max = parseInt(left);
        
        if (isNaN(max) || max < 1) {
            alert('Please enter a positive integer as the maximum value, or leave empty for random 1-100');
            return;
        }
        
        if (max > 1000000) {
            alert('Maximum value too large (max: 1,000,000)');
            return;
        }
    } else {
        // Default range: 1 to 100
        max = 100;
    }
    
    // Generate random number between 1 and max (inclusive)
    let randomNum = Math.floor(Math.random() * max) + 1;
    
    // Display the result
    document.getElementById('result').value = randomNum;
    document.getElementById('word-result').innerHTML = 'Random (1-' + max + '): ' + randomNum;
    
    // Set as left operand for further calculations
    left = randomNum.toString();
    operator = '';
    right = '';
    
    // Update displays
    updateResult();
}

// ========== NEW FUNCTIONALITY 4: REAL-TIME EXPRESSION VALIDATOR ==========
// Checks if the current mathematical expression is valid and shows status
function validateExpression() {
    let expression = left + operator + right;
    let validator = document.getElementById('expression-validator');
    
    // If nothing entered yet, don't show anything
    if (expression === '') {
        validator.innerHTML = '';
        return;
    }
    
    // Check for complete valid expression (has both operands and operator)
    if (left !== '' && operator !== '' && right !== '') {
        validator.innerHTML = '<span class="valid-icon">✓ Valid Expression</span>';
    } 
    // Check for incomplete expression (has operator but missing right operand)
    else if (left !== '' && operator !== '' && right === '') {
        validator.innerHTML = '<span class="invalid-icon">⚠ Incomplete (enter second number)</span>';
    } 
    // Only left operand entered (ready for operator)
    else if (left !== '') {
        validator.innerHTML = '<span class="valid-icon">✓ Ready (enter operator)</span>';
    }
}

// ========== ENHANCED BACKSPACE FUNCTION ==========
// Removes the last character from the current input
function backspace() {
    if (right.length > 0) {
        right = right.slice(0, -1);
    } else if (operator.length > 0) {
        operator = '';
    } else if (left.length > 0) {
        left = left.slice(0, -1);
    }
    updateResult();
    
    // NEW FUNCTIONALITY 4: Revalidate expression after backspace
    validateExpression();
}

// ========== ORIGINAL PLACEHOLDER FUNCTIONS ==========
// These were in the original code
function numberToWords(numVal) {
    words = '';
}

// Text-to-Speech Magic - Makes numbers talk!
function speakResult() {
    const speakBtn = document.getElementById('speak-btn');
    const textToSpeak = document.getElementById('word-result').innerHTML;

    // Stop any ongoing speech
    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        if (speakBtn) speakBtn.classList.remove('speaking');
        return;
    }

    // Create and configure speech
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 0.9;  // Slightly slower for clarity
    utterance.pitch = 1;
    utterance.volume = 1;

    // When speech starts
    utterance.onstart = function() {
        if (speakBtn) speakBtn.classList.add('speaking');
    };

    // When speech ends
    utterance.onend = function() {
        if (speakBtn) speakBtn.classList.remove('speaking');
    };

    // Launch the speech!
    window.speechSynthesis.speak(utterance);
}

// Enable speak button when result is ready
function enableSpeakButton() {
    const speakBtn = document.getElementById('speak-btn');
    if (speakBtn) {
        const hasContent = document.getElementById('word-result').innerHTML.trim().length > 0;
        speakBtn.disabled = !hasContent;
    }
}