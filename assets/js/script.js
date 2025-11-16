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

function numberToWords(value) {
    value = value.toString();

    // Split into whole + decimal parts
    let parts = value.split('.');
    let whole = parts[0];
    let decimal = parts[1] || '';

    let words = [];

    // Convert whole number
    words.push(convertWholeNumber(whole));

    // Convert decimal part (digit by digit)
    if (decimal.length > 0) {
        let decimalWords = decimal.split('').map(d => smallNumbers[d]);
        return [words.join(' '), "point " + decimalWords.join(' ')];

    }

    return [words.join(' ')];
}

// Word maps
const smallNumbers = [
    "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
    "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen",
    "seventeen", "eighteen", "nineteen"
];

const tens = [
    "", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"
];


function convertWholeNumber(numStr) {
    let num = parseInt(numStr);
    if (isNaN(num)) return "";

    if (num < 20) return smallNumbers[num];

    if (num < 100) {
        return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? " " + smallNumbers[num % 10] : "");
    }

    if (num < 1000) {
        return smallNumbers[Math.floor(num / 100)] + " hundred" +
            (num % 100 !== 0 ? " and " + convertWholeNumber(num % 100) : "");
    }

    if (num < 1000000) {
        return convertWholeNumber(Math.floor(num / 1000)) + " thousand" +
            (num % 1000 !== 0 ? " " + convertWholeNumber(num % 1000) : "");
    }

    if (num < 1000000000) {
        return convertWholeNumber(Math.floor(num / 1000000)) + " million" +
            (num % 1000000 !== 0 ? " " + convertWholeNumber(num % 1000000) : "");
    }

    return "number too large";
}

function updateResult() {

    const fullNumber = left + (operator ? operator : '') + right;


    const wordArr = numberToWords(fullNumber);

    // Show the words
    document.getElementById('word-text').innerHTML = wordArr.join(' point ');

    // Enable speech button
    enableSpeakButton();
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
    utterance.onstart = function () {
        speakBtn.classList.add('speaking');
    };

    // When speech ends
    utterance.onend = function () {
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
