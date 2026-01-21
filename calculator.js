// calculator.js
// Simple calculator with English to French output conversion

// Language messages dictionary
const messages = {
  en: {
    result: "The result is",
    error: "Invalid input"
  },
  fr: {
    result: "Le résultat est",
    error: "Entrée invalide"
  }
};

// Calculator function
function calculate(a, b, operator, lang = "fr") {
  let result;

  if (isNaN(a) || isNaN(b)) {
    return messages[lang].error;
  }

  switch (operator) {
    case "+":
      result = a + b;
      break;
    case "-":
      result = a - b;
      break;
    case "*":
      result = a * b;
      break;
    case "/":
      if (b === 0) {
        return messages[lang].error;
      }
      result = a / b;
      break;
    default:
      return messages[lang].error;
  }

  return `${messages[lang].result} ${result}`;
}

// Example usage:
// calculate(5, 3, "+", "fr"); // Le résultat est 8
