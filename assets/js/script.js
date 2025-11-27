var left = '';
var operator = '';
var right = '';
let wordPlaceholder = document.getElementById('word-result');
function appendToResult(value) {
    if (operator.length == 0) {
        left += value;
    } else {
        right += value;
    }
    updateResult();
}
//Defined a backspace button for removing last character from the input
function backspace() {
    if (right.length > 0) {
        // Remove last character from right operand
        right = right.slice(0, -1);
    } else if (operator.length > 0) {
        // Remove operator
        operator = '';
    } else if (left.length > 0) {
        // Remove last character from left operand
        left = left.slice(0, -1);
    }

    updateResult();
}
// FUNCTION: Convert integers to words (0–999)
// 
function numberToWords(numVal) {

    numVal = Number(numVal);

    if (isNaN(numVal)) return "";

    const ones = [
        "zero","one","two","three","four","five","six",
        "seven","eight","nine"
    ];

    const teens = [
        "ten","eleven","twelve","thirteen","fourteen",
        "fifteen","sixteen","seventeen","eighteen","nineteen"
    ];

    const tens = [
        "","","twenty","thirty","forty","fifty",
        "sixty","seventy","eighty","ninety"
    ];

    // Decimal numbers
    if (numVal % 1 !== 0) {
        let parts = String(numVal).split(".");
        let left = numberToWords(parseInt(parts[0]));
        let rightDigits = parts[1].split("").map(d => ones[d]).join(" ");
        return left + " point " + rightDigits;
    }

    // Whole numbers
    if (numVal < 10) return ones[numVal];
    if (numVal < 20) return teens[numVal - 10];
    if (numVal < 100) {
        return tens[Math.floor(numVal / 10)] +
               (numVal % 10 !== 0 ? " " + ones[numVal % 10] : "");
    }
    if (numVal < 1000) {
        let h = Math.floor(numVal / 100);
        let rest = numVal % 100;
        return ones[h] + " hundred" +
               (rest !== 0 ? " " + numberToWords(rest) : "");
    }

    return String(numVal);
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

    document.getElementById('word-result').innerHTML = '';
    updateResult();
    enableSpeakButton();
}
// Updated the updateResult function to use the new numberToWord function
function updateResult() {
    // Update the numeric display (if present)
    const display = left + operator + right;
    const resultEl = document.getElementById('result');
    if (resultEl) {
        resultEl.value = display;
    }

    // Build a safe word array so we don't reference an undefined variable.
    const wordArr = [];
    if (left && left.length) {
        // If left contains a decimal part, you may want to split and convert each part.
        wordArr.push(numberToWords(left));
    }
    if (operator && operator.length) {
        wordArr.push(operator);
    }
    if (right && right.length) {
        wordArr.push(numberToWords(right));
    }

    // Join parts for display; use a space between parts.
    document.getElementById('word-result').innerHTML = wordArr.join(' ');
    enableSpeakButton();
    // return ;
}

function calculateResult() {
    let expression = document.getElementById("result").value;

    let result;
    try {
        // Safe mathematical evaluation using Function()
        result = Function(`return (${expression})`)();

        if (result === undefined || isNaN(result)) {
            result = "Invalid Expression";
        }
    } catch (e) {
        result = "Error";
    }

    // Update the numeric display with the final result
    document.getElementById("result").value = result;

    // Convert ONLY the final numeric result to words
    if (!isNaN(result)) {
        document.getElementById("word-result").innerHTML = numberToWords(result);
    } else {
        document.getElementById("word-result").innerHTML = "";
    }

    enableSpeakButton();
}



// Text-to-Speech Magic - Makes numbers talk!
function speakResult() {
    const speakBtn = document.getElementById('speak-btn');
    const textToSpeak = document.getElementById('word-result').innerHTML;

    // Stop any ongoing speech
    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        speakBtn.classList.remove('speaking');
        return;
    }

    // Create and configure speech
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 0.9;  // Slightly slower for clarity
    utterance.pitch = 1;
    utterance.volume = 1;

    // When speech starts
    utterance.onstart = function() {
        speakBtn.classList.add('speaking');
    };

    // When speech ends
    utterance.onend = function() {
        speakBtn.classList.remove('speaking');
    };

    // Launch the speech!
    window.speechSynthesis.speak(utterance);
}

// Enable speak button when result is ready
function enableSpeakButton() {
    const speakBtn = document.getElementById('speak-btn');
    const hasContent = document.getElementById('word-result').innerHTML.trim().length > 0;
    speakBtn.disabled = !hasContent;
}
