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
