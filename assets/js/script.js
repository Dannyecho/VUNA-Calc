// Theme toggle logic
function toggleTheme() {
    const body = document.body;
    const btn = document.getElementById('theme-toggle');
    body.classList.toggle('dark-mode');
    // Change icon
    if (body.classList.contains('dark-mode')) {
        btn.innerHTML = '☀️';
        btn.title = 'Switch to light mode';
        localStorage.setItem('theme', 'dark');
    } else {
        btn.innerHTML = '🌙';
        btn.title = 'Switch to dark mode';
        localStorage.setItem('theme', 'light');
    }
}

// On load, set theme from localStorage
window.addEventListener('DOMContentLoaded', function() {
    const theme = localStorage.getItem('theme');
    const body = document.body;
    const btn = document.getElementById('theme-toggle');
    if (btn) {
        if (theme === 'dark') {
            body.classList.add('dark-mode');
            btn.innerHTML = '☀️';
            btn.title = 'Switch to light mode';
        } else {
            btn.innerHTML = '🌙';
            btn.title = 'Switch to dark mode';
        }
    }
});
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
    // ...existing code...
    // This function should update the calculator display
    // If you need to call numberToWords, do so here
}

// If numberToWords is needed, define it properly here
// function numberToWords(numVal) {
//   // ...existing code...
// }

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