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
  document.getElementById('result').value = left + ' ' + operator + ' ' + right;
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
  if (history.length === 0) {
    panel.innerHTML = '<p class="text-center text-muted py-3">No history yet</p>';
    return;
  }
  
  panel.innerHTML = history.map(item => 
    `<div class="history-item" onclick="useHistoryItem('${item}')">${item}</div>`
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
    const originalText = btn.textContent;
    btn.textContent = '✓';
    setTimeout(() => btn.textContent = originalText, 1000);
  }).catch(() => {
    alert('Failed to copy');
  });
}

// Timer functions
function startTimer() {
  if (timerRunning) return;
  
  timerRunning = true;
  document.getElementById('start-btn').disabled = true;
  document.getElementById('pause-btn').disabled = false;
  document.getElementById('timer-display').classList.add('timer-running');
  
  timerInterval = setInterval(() => {
    timerSeconds++;
    updateTimerDisplay();
  }, 1000);
}

function pauseTimer() {
  if (!timerRunning) return;
  
  timerRunning = false;
  clearInterval(timerInterval);
  document.getElementById('start-btn').disabled = false;
  document.getElementById('pause-btn').disabled = true;
  document.getElementById('timer-display').classList.remove('timer-running');
}

function resetTimer() {
  pauseTimer();
  timerSeconds = 0;
  calculationCount = 0;
  updateTimerDisplay();
  updateCalculationCount();
  document.getElementById('start-btn').disabled = false;
}

function updateTimerDisplay() {
  const hours = Math.floor(timerSeconds / 3600);
  const minutes = Math.floor((timerSeconds % 3600) / 60);
  const seconds = timerSeconds % 60;
  
  const timeString = 
    String(hours).padStart(2, '0') + ':' +
    String(minutes).padStart(2, '0') + ':' +
    String(seconds).padStart(2, '0');
  
  document.getElementById('timer-display').textContent = timeString;
}

function updateCalculationCount() {
  document.getElementById('calc-count').textContent = calculationCount;
}

// Theme toggle
function toggleTheme() {
  document.body.classList.toggle('dark-theme');
  const btn = document.getElementById('theme-btn');
  if (document.body.classList.contains('dark-theme')) {
    btn.textContent = '☀️ Light';
    localStorage.setItem('theme', 'dark');
  } else {
    btn.textContent = '🌙 Dark';
    localStorage.setItem('theme', 'light');
  }
}

// Load saved theme
window.addEventListener('load', () => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
    document.getElementById('theme-btn').textContent = '☀️ Light';
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
  const intPart = parseInt(parts[0]);
  
  if (intPart === 0) {
    words = 'zero';
  } else {
    const billion = Math.floor(intPart / 1000000000);
    const million = Math.floor((intPart % 1000000000) / 1000000);
    const thousand = Math.floor((intPart % 1000000) / 1000);
    const hundred = intPart % 1000;
    
    if (billion) words += convertLessThanOneThousand(billion) + ' billion ';
    if (million) words += convertLessThanOneThousand(million) + ' million ';
    if (thousand) words += convertLessThanOneThousand(thousand) + ' thousand ';
    if (hundred) words += convertLessThanOneThousand(hundred);
  }
  
  if (parts[1]) {
    words += ' point';
    for (let digit of parts[1]) {
      words += ' ' + ones[parseInt(digit)];
    }
  }
  
  document.getElementById('word-result').innerHTML = words.trim() || '';
}