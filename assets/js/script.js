// ------------------------------
// LANGUAGE STATE
// ------------------------------
let currentLanguage = "en"; // en | ha | ig

// ------------------------------
// Theme Toggle Logic
// ------------------------------
function toggleTheme() {
    const body = document.body;
    const btn = document.getElementById('theme-toggle');

    body.classList.toggle('dark-mode');

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

var inverseMode = false;
var currentExpression = '';
let calculationHistory = [];

// ------------------------------
// NUMBER TO WORDS (ENGLISH)
// ------------------------------
function numberToWords(num) {
    if (num === 'Error') return 'Error';
    if (!num) return '';

    const n = parseFloat(num);
    if (isNaN(n)) return '';
    if (n === 0) return 'Zero';

    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen',
        'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const scales = ['', 'Thousand', 'Million', 'Billion'];

    function convertGroup(val) {
        let res = '';
        if (val >= 100) {
            res += ones[Math.floor(val / 100)] + ' Hundred ';
            val %= 100;
        }
        if (val >= 10 && val <= 19) {
            res += teens[val - 10] + ' ';
        } else if (val >= 20) {
            res += tens[Math.floor(val / 10)];
            if (val % 10) res += '-' + ones[val % 10];
            res += ' ';
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
    let words = [];

    let scaleIdx = 0;
    while (integerPart > 0) {
        let chunk = integerPart % 1000;
        if (chunk) {
            words.unshift(convertGroup(chunk) + (scales[scaleIdx] ? ' ' + scales[scaleIdx] : ''));
        }
        integerPart = Math.floor(integerPart / 1000);
        scaleIdx++;
    }

    let result = sign + words.join(', ');

    if (decimalPart) {
        result += ' Point';
        for (let d of decimalPart) {
            result += ' ' + ones[parseInt(d)];
        }
    }

    return result.trim();
}

// ------------------------------
// NUMBER TO WORDS (HAUSA)
// ------------------------------
function numberToHausa(num) {
    if (num === 'Error') return 'Kuskure';

    const ones = ['', 'Daya', 'Biyu', 'Uku', 'Hudu', 'Biyar', 'Shida', 'Bakwai', 'Takwas', 'Tara'];
    const tens = ['', '', 'Ashirin', 'Talatin', 'Arba’in', 'Hamsin', 'Sittin', 'Sab’in', 'Tamanin', 'Tis’in'];
    const teens = ['Goma', 'Sha daya', 'Sha biyu', 'Sha uku', 'Sha hudu', 'Sha biyar', 'Sha shida', 'Sha bakwai', 'Sha takwas', 'Sha tara'];
    const scales = ['', 'Dubu', 'Miliyan', 'Biliyan'];

    function convertGroup(val) {
        let res = '';
        if (val >= 100) {
            res += ones[Math.floor(val / 100)] + ' Dari ';
            val %= 100;
        }
        if (val >= 10 && val <= 19) {
            res += teens[val - 10] + ' ';
        } else if (val >= 20) {
            res += tens[Math.floor(val / 10)];
            if (val % 10) res += ' da ' + ones[val % 10];
            res += ' ';
        } else if (val > 0) {
            res += ones[val] + ' ';
        }
        return res.trim();
    }

    let n = Math.abs(parseFloat(num));
    let parts = n.toString().split('.');
    let integerPart = parseInt(parts[0]);
    let decimalPart = parts[1];
    let words = [];

    let scaleIdx = 0;
    while (integerPart > 0) {
        let chunk = integerPart % 1000;
        if (chunk) {
            words.unshift(convertGroup(chunk) + (scales[scaleIdx] ? ' ' + scales[scaleIdx] : ''));
        }
        integerPart = Math.floor(integerPart / 1000);
        scaleIdx++;
    }

    let result = words.join(', ');

    if (decimalPart) {
        result += ' Nuni';
        for (let d of decimalPart) {
            result += ' ' + ones[parseInt(d)];
        }
    }

    return result.trim();
}

// ------------------------------
// NUMBER TO WORDS (IGBO) 🟢 NEW
// ------------------------------
function numberToIgbo(num) {
    if (num === 'Error') return 'Njehie';

    const ones = ['', 'Otu', 'Abụọ', 'Atọ', 'Anọ', 'Ise', 'Isii', 'Asaa', 'Asatọ', 'Itoolu'];
    const tens = ['', '', 'Iri Abụọ', 'Iri Atọ', 'Iri Anọ', 'Iri Ise', 'Iri Isii', 'Iri Asaa', 'Iri Asatọ', 'Iri Itoolu'];
    const teens = ['Iri', 'Iri na Otu', 'Iri na Abụọ', 'Iri na Atọ', 'Iri na Anọ', 'Iri na Ise', 'Iri na Isii', 'Iri na Asaa', 'Iri na Asatọ', 'Iri na Itoolu'];
    const scales = ['', 'Puku', 'Nde', 'Ijeri'];

    function convertGroup(val) {
        let res = '';
        if (val >= 100) {
            res += ones[Math.floor(val / 100)] + ' Nari ';
            val %= 100;
        }
        if (val >= 10 && val <= 19) {
            res += teens[val - 10] + ' ';
        } else if (val >= 20) {
            res += tens[Math.floor(val / 10)];
            if (val % 10) res += ' na ' + ones[val % 10];
            res += ' ';
        } else if (val > 0) {
            res += ones[val] + ' ';
        }
        return res.trim();
    }

    let n = Math.abs(parseFloat(num));
    let parts = n.toString().split('.');
    let integerPart = parseInt(parts[0]);
    let decimalPart = parts[1];
    let words = [];

    let scaleIdx = 0;
    while (integerPart > 0) {
        let chunk = integerPart % 1000;
        if (chunk) {
            words.unshift(convertGroup(chunk) + (scales[scaleIdx] ? ' ' + scales[scaleIdx] : ''));
        }
        integerPart = Math.floor(integerPart / 1000);
        scaleIdx++;
    }

    let result = words.join(', ');

    if (decimalPart) {
        result += ' Nkpụrụ';
        for (let d of decimalPart) {
            result += ' ' + ones[parseInt(d)];
        }
    }

    return result.trim();
}

// ------------------------------
// TRANSLATION CONTROLS
// ------------------------------
function translateToHausa() {
    currentLanguage = "ha";
    updateResult();
}

function translateToIgbo() {
    currentLanguage = "ig";
    updateResult();
}

function backToEnglish() {
    currentLanguage = "en";
    updateResult();
}

// ------------------------------
// RESULT UPDATE (LANGUAGE AWARE)
// ------------------------------
function updateResult() {
    document.getElementById('result').value = currentExpression || '0';

    const wordResult = document.getElementById('word-result');
    const wordArea = document.getElementById('word-area');
    const num = parseFloat(currentExpression);

    if (!isNaN(num) && isFinite(num)) {
        let text = '';

        if (currentLanguage === 'en') {
            text = numberToWords(currentExpression);
        } else if (currentLanguage === 'ha') {
            text = numberToHausa(currentExpression);
        } else if (currentLanguage === 'ig') {
            text = numberToIgbo(currentExpression);
        }

        wordResult.innerHTML =
            `<span class="small-label">Result</span><strong>${text}</strong>`;
        wordArea.style.display = 'flex';
    } else {
        wordArea.style.display = 'none';
    }

    enableSpeakButton();
}
