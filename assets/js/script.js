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
    document.getElementById('word-chinese').innerHTML = '';
    document.getElementById('word-area').style.display = 'none';
    updateResult();
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
        default: return;
    }

    left = result.toString();
    operator = '';
    right = '';
    updateResult();
}

// English number converter (existing)
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

// New: Chinese number converter
function numberToChinese(num) {
    if (num === 'Error') return '错误';
    if (num === '') return '';

    const chNums = ['零','一','二','三','四','五','六','七','八','九'];
    const chUnits = ['', '十', '百', '千'];
    const chSections = ['', '万', '亿', '兆'];

    let n = parseFloat(num);
    if (isNaN(n)) return '';
    let sign = n < 0 ? '负' : '';
    n = Math.abs(n);
    let parts = n.toString().split('.');
    let integerPart = parts[0];
    let decimalPart = parts[1] || '';

    // Convert integer part
    function intToChinese(str) {
        let result = '';
        let len = str.length;
        let zeroFlag = false;
        let sectionCount = 0;
        while (len > 0) {
            let section = str.slice(Math.max(0, len-4), len);
            let sectionStr = '';
            for (let i=0; i<section.length; i++) {
                let digit = parseInt(section[i]);
                let pos = section.length - i -1;
                if (digit === 0) {
                    zeroFlag = true;
                } else {
                    if (zeroFlag) {
                        sectionStr += '零';
                        zeroFlag = false;
                    }
                    sectionStr += chNums[digit] + chUnits[pos];
                }
            }
            if (sectionStr !== '') {
                sectionStr += chSections[sectionCount];
            }
            result = sectionStr + result;
            sectionCount++;
            len -= 4;
        }
        return result || '零';
    }

    // Convert decimal part
    let decimalStr = '';
    if (decimalPart) {
        decimalStr = '点';
        for (let d of decimalPart) {
            decimalStr += chNums[parseInt(d)];
        }
    }

    return sign + intToChinese(integerPart) + decimalStr;
}

function updateResult() {
    const display = left + (operator ? ' ' + operator + ' ' : '') + right;
    document.getElementById('result').value = display || '0';

    const wordResult = document.getElementById('word-result');
    const wordChinese = document.getElementById('word-chinese');
    const wordArea = document.getElementById('word-area');

    if (left && !operator && !right) {
        wordResult.innerHTML = '<span class="small-label">Result in words</span><strong>' + numberToWords(left) + '</strong>';
        wordChinese.innerHTML = '<span class="small-label">结果 (中文)</span><strong>' + numberToChinese(left) + '</strong>';
        wordArea.style.display = 'flex';
    } else {
        wordResult.innerHTML = '';
        wordChinese.innerHTML = '';
        wordArea.style.display = 'none';
    }
    enableSpeakButton();
    enableSpeakButtonChinese();
}

function speakResult(lang='en') {
    let text = '';
    let speakBtn;
    if(lang === 'zh-CN'){
        text = document.getElementById('word-chinese').querySelector('strong')?.innerText || '';
        speakBtn = document.getElementById('speak-btn-zh');
    } else {
        text = document.getElementById('word-result').querySelector('strong')?.innerText || '';
        speakBtn = document.getElementById('speak-btn');
    }

    if (!text) return;

    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        speakBtn.classList.remove('speaking');
        return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
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

function enableSpeakButtonChinese() {
    const speakBtn = document.getElementById('speak-btn-zh');
    if (!speakBtn) return;
    const hasContent = document.getElementById('word-chinese').innerHTML.trim().length > 0;
    speakBtn.disabled = !hasContent;
    }
