var left = '';
var operator = '';
var right = '';
var steps = [];
var MAX_STEPS = 6;


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
  left = "";
  right = "";
  operator = "";
  steps = [];

  document.getElementById("word-result").innerHTML = "";
  document.getElementById("word-area").style.display = "none";
  document.getElementById("steps").innerText = "";

  updateResult();
}



function calculateResult() {
  if (left.length === 0 || operator.length === 0 || right.length === 0) return;

  const l = parseFloat(left);
  const r = parseFloat(right);
  let result;

  switch (operator) {
    case "+":
      result = l + r;
      break;
    case "-":
      result = l - r;
      break;
    case "*":
      result = l * r;
      break;
    case "/":
      result = r !== 0 ? l / r : "Error";
      break;
    default:
      return;
  }

  if (steps.length < MAX_STEPS) {
    steps.push(`Step ${steps.length + 1}: ${l} ${operator} ${r} = ${result}`);
  }

  left = result.toString();
  operator = "";
  right = "";

  updateStepsDisplay();
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

// Updated the updateStepsDisplay function to enable/disable the save button
function updateStepsDisplay() {
  const stepsDiv = document.getElementById("steps");
  const saveBtn = document.getElementById("save-steps-btn");
  
  if (!stepsDiv) return;
  
  stepsDiv.innerText = steps.join("\n");
  
  // Enable/disable save button based on steps
  if (saveBtn) {
    saveBtn.disabled = steps.length === 0;
  }
}


function saveStepsAsImage() {
  if (steps.length === 0) return;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // Set canvas size
  canvas.width = 600;
  const lineHeight = 40;
  const padding = 40;
  const headerHeight = 60;
  canvas.height = headerHeight + (steps.length * lineHeight) + padding * 2;
  
  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Header
  ctx.fillStyle = '#0d6efd';
  ctx.font = 'bold 24px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Calculation Steps', canvas.width / 2, padding + 30);
  
  // Steps
  ctx.fillStyle = '#212529';
  ctx.font = '18px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'left';
  
  steps.forEach((step, index) => {
    const y = headerHeight + padding + (index * lineHeight) + 20;
    ctx.fillText(step, padding, y);
  });
  
  // Convert to blob and download
  canvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `calculation-steps-${Date.now()}.png`;
    a.click();
    URL.revokeObjectURL(url);
  });
}

