// Variables
var left = '';
var operator = '';
var right = '';
var memory = 0;
var history = [];

// Timer variables
var timerInterval = null;
var timerSeconds = 0;
var timerRunning = false;
var calculationCount = 0;

// Keyboard support
document.addEventListener('keydown', function(event) {
  const key = event.key;
  
  if (key >= '0' && key <= '9') {
    appendToResult(key);
  } else if (key === '.') {
    appendToResult('.');
  } else if (key === '+' || key === '-' || key === '*' || key === '/') {
    operatorToResult(key);
  } else if (key === 'Enter' || key === '=') {
    event.preventDefault();
    calculateResult();
  } else if (key === 'Backspace') {
    event.preventDefault();
    backspace();
  } else if (key === 'Escape') {
    clearResult();
  } else if (key === '%') {
    percentage();
  }
});

function appendToResult(value) {
  if (operator.length == 0) {
    left += value;
  } else {
    right += value;
  }
  updateResult();
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
  operator = '';
  right = '';
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

function percentage() {
  if (left && !operator) {
    left = (parseFloat(left) / 100).toString();
    updateResult();
  } else if (right) {
    right = (parseFloat(left) * parseFloat(right) / 100).toString();
    updateResult();
  }
}

function updateResult() {
  let displayValue = left;
  if (operator) displayValue += ' ' + operator;
  if (right) displayValue += ' ' + right;
  document.getElementById('result').value = displayValue || '0';
  
  // Update word result if number is valid
  const num = parseFloat(left);
  if (left && !isNaN(num) && !operator) {
    numberToWords(num);
  } else {
    document.getElementById('word-result').innerHTML = '';
  }
}

function calculateResult() {
  if (!left || !operator || !right) return;
  
  try {
    var leftNum = parseFloat(left);
    var rightNum = parseFloat(right);
    var result;
    
    switch(operator) {
      case '+': result = leftNum + rightNum; break;
      case '-': result = leftNum - rightNum; break;
      case '*': result = leftNum * rightNum; break;
      case '/': 
        if (rightNum === 0) {
          alert('Error: Division by zero!');
          return;
        }
        result = leftNum / rightNum; 
        break;
      default: return;
    }
    
    // Round to avoid floating point errors
    result = Math.round(result * 100000000) / 100000000;
    
    // Increment calculation count
    calculationCount++;
    updateCalculationCount();
    
    // Auto-start timer on first calculation
    if (!timerRunning && calculationCount === 1) {
      startTimer();
    }
    
    // Add to history
    addToHistory(left + ' ' + operator + ' ' + right + ' = ' + result);
    
    // Update display
    left = result.toString();
    operator = '';
    right = '';
    
    document.getElementById('result').value = result;
    numberToWords(result);
  } catch(e) {
    alert('Error calculating result');
  }
}

// Memory functions
function memoryClear() {
  memory = 0;
  updateMemoryIndicator();
}

function memoryRecall() {
  if (operator.length === 0) {
    left = memory.toString();
  } else {
    right = memory.toString();
  }
  updateResult();
}

function memoryAdd() {
  const currentValue = parseFloat(document.getElementById('result').value) || 0;
  memory += currentValue;
  updateMemoryIndicator();
}

function memorySubtract() {
  const currentValue = parseFloat(document.getElementById('result').value) || 0;
  memory -= currentValue;
  updateMemoryIndicator();
}

function updateMemoryIndicator() {
  const indicator = document.getElementById('memory-indicator');
  if (memory !== 0) {
    indicator.style.display = 'inline-block';
    indicator.textContent = 'M: ' + memory;
  } else {
    indicator.style.display = 'none';
  }
}

// History functions
function addToHistory(calculation) {
  history.unshift(calculation);
  if (history.length > 10) history.pop();
  updateHistoryDisplay();
}

function updateHistoryDisplay() {
  const panel = document.getElementById('history-panel');
  if (!panel) return;
  
  if (history.length === 0) {
    panel.innerHTML = '<p class="text-center text-muted py-3">No history yet</p>';
    return;
  }
  
  panel.innerHTML = history.map(item => 
    `<div class="history-item" onclick="useHistoryItem('${item.replace(/'/g, "\\'")}')">${item}</div>`
  ).join('');
}

function useHistoryItem(item) {
  const result = item.split('=')[1].trim();
  left = result;
  operator = '';
  right = '';
  updateResult();
  numberToWords(parseFloat(result));
}

function clearHistory() {
  if (confirm('Clear all history?')) {
    history = [];
    updateHistoryDisplay();
  }
}

// Copy function
function copyResult() {
  const result = document.getElementById('result').value;
  if (!result) return;
  
  navigator.clipboard.writeText(result).then(() => {
    const btn = document.querySelector('.copy-btn');
    if (btn) {
      const originalText = btn.textContent;
      btn.textContent = '✓';
      setTimeout(() => btn.textContent = originalText, 1000);
    }
  }).catch(() => {
    alert('Failed to copy');
  });
}

// Timer functions
function startTimer() {
  if (timerRunning) return;
  
  timerRunning = true;
  const startBtn = document.getElementById('start-btn');
  const pauseBtn = document.getElementById('pause-btn');
  if (startBtn) startBtn.disabled = true;
  if (pauseBtn) pauseBtn.disabled = false;
  
  const timerDisplay = document.getElementById('timer-display');
  if (timerDisplay) timerDisplay.classList.add('timer-running');
  
  timerInterval = setInterval(() => {
    timerSeconds++;
    updateTimerDisplay();
  }, 1000);
}

function pauseTimer() {
  if (!timerRunning) return;
  
  timerRunning = false;
  clearInterval(timerInterval);
  const startBtn = document.getElementById('start-btn');
  const pauseBtn = document.getElementById('pause-btn');
  if (startBtn) startBtn.disabled = false;
  if (pauseBtn) pauseBtn.disabled = true;
  
  const timerDisplay = document.getElementById('timer-display');
  if (timerDisplay) timerDisplay.classList.remove('timer-running');
}

function resetTimer() {
  pauseTimer();
  timerSeconds = 0;
  calculationCount = 0;
  updateTimerDisplay();
  updateCalculationCount();
  const startBtn = document.getElementById('start-btn');
  if (startBtn) startBtn.disabled = false;
}

function updateTimerDisplay() {
  const hours = Math.floor(timerSeconds / 3600);
  const minutes = Math.floor((timerSeconds % 3600) / 60);
  const seconds = timerSeconds % 60;
  
  const timeString = 
    String(hours).padStart(2, '0') + ':' +
    String(minutes).padStart(2, '0') + ':' +
    String(seconds).padStart(2, '0');
  
  const timerDisplay = document.getElementById('timer-display');
  if (timerDisplay) timerDisplay.textContent = timeString;
}

function updateCalculationCount() {
  const countDisplay = document.getElementById('calc-count');
  if (countDisplay) countDisplay.textContent = calculationCount;
}

// Theme toggle
function toggleTheme() {
  document.body.classList.toggle('dark-theme');
  const btn = document.getElementById('theme-btn');
  if (document.body.classList.contains('dark-theme')) {
    if (btn) btn.textContent = '☀️ Light';
    localStorage.setItem('theme', 'dark');
  } else {
    if (btn) btn.textContent = '🌙 Dark';
    localStorage.setItem('theme', 'light');
  }
}

// Load saved theme
window.addEventListener('load', () => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
    const themeBtn = document.getElementById('theme-btn');
    if (themeBtn) themeBtn.textContent = '☀️ Light';
  }
});

// Number to words function
function numberToWords(numVal) {
  const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
  const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  const teens = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  
  function convertLessThanOneThousand(num) {
    if (num === 0) return '';
    
    let words = '';
    
    if (num >= 100) {
      words += ones[Math.floor(num / 100)] + ' hundred ';
      num %= 100;
    }
    
    if (num >= 20) {
      words += tens[Math.floor(num / 10)] + ' ';
      num %= 10;
    } else if (num >= 10) {
      words += teens[num - 10] + ' ';
      return words.trim();
    }
    
    if (num > 0) {
      words += ones[num] + ' ';
    }
    
    return words.trim();
  }
  
  let words = '';
  const numStr = numVal.toString();
  const parts = numStr.split('.');
  const intPart = Math.floor(Math.abs(parseInt(parts[0])));
  
  if (intPart === 0 && (!parts[1] || parts[1] === '0')) {
    words = 'zero';
  } else {
    if (numVal < 0) words = 'negative ';
    
    if (intPart > 0) {
      const billion = Math.floor(intPart / 1000000000);
      const million = Math.floor((intPart % 1000000000) / 1000000);
      const thousand = Math.floor((intPart % 1000000) / 1000);
      const hundred = intPart % 1000;
      
      if (billion) words += convertLessThanOneThousand(billion) + ' billion ';
      if (million) words += convertLessThanOneThousand(million) + ' million ';
      if (thousand) words += convertLessThanOneThousand(thousand) + ' thousand ';
      if (hundred) words += convertLessThanOneThousand(hundred);
    }
  }
  
  if (parts[1]) {
    words += ' point';
    for (let digit of parts[1]) {
      words += ' ' + ones[parseInt(digit)];
    }
  }
  
  const wordResult = document.getElementById('word-result');
  if (wordResult) wordResult.innerHTML = words.trim() || '';
  return words.trim();
}

// Make functions globally available
window.appendToResult = appendToResult;
window.operatorToResult = operatorToResult;
window.clearResult = clearResult;
window.backspace = backspace;
window.percentage = percentage;
window.calculateResult = calculateResult;
window.memoryClear = memoryClear;
window.memoryRecall = memoryRecall;
window.memoryAdd = memoryAdd;
window.memorySubtract = memorySubtract;
window.copyResult = copyResult;
window.startTimer = startTimer;
window.pauseTimer = pauseTimer;
window.resetTimer = resetTimer;
window.toggleTheme = toggleTheme;
window.clearHistory = clearHistory;