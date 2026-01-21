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

    document.getElementById('word-text').innerHTML = '';
    updateResult();
    enableSpeakButton();
}

function updateResult() {
	@@ -187,47 +186,6 @@ function numberToWords(numVal) {
        words = '';
    }

    document.getElementById('word-text').innerHTML = wordArr.join(' point ');
    enableSpeakButton();
    // return ;
}

// Text-to-Speech Magic - Makes numbers talk!
function speakResult() {
    const speakBtn = document.getElementById('speak-btn');
    const textToSpeak = document.getElementById('word-text').innerHTML;

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
    const hasContent = document.getElementById('word-text').innerHTML.trim().length > 0;
    speakBtn.disabled = !hasContent;
}

//Function to find square roots
function squareRoot() {
    const current = resultInput.value.trim();
    
    if (!current) return;
    
    try {
        // We use the already-calculated number if it looks like a result
        // or we try to evaluate the current expression first
        let num;
        
        if (/^[+-]?\d*\.?\d+$/.test(current)) {
            // already looks like a number
            num = parseFloat(current);
        } else {
            // try to evaluate the expression first (like 16+9 → 25 → √25)
            num = eval(current.replace(/×/g, "*").replace(/÷/g, "/"));
        }
        
        if (isNaN(num) || !isFinite(num)) {
            resultInput.value = "Error";
            wordResult.textContent = "error";
            return;
        }
        
        if (num < 0) {
            resultInput.value = "Error";
            wordResult.textContent = "cannot take square root of negative number";
            return;
        }
        
        const root = Math.sqrt(num);
        resultInput.value = Number(root.toFixed(8)); // clean display
        updateWordResult(); // updates the word version if needed
        
    } catch (err) {
        resultInput.value = "Error";
        wordResult.textContent = "invalid expression";
    }
}