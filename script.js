const expressionDisplay = document.getElementById("expression");
const resultDisplay = document.getElementById("result");
const buttons = document.querySelector(".buttons");

let expression = "";
let justCalculated = false;

function formatNumber(number) {
  if (!Number.isFinite(number)) {
    throw new Error("Invalid result");
  }

  return String(Number(number.toPrecision(12)));
}

// Calculate without using eval()
function calculate(input) {
  const tokens = input.match(/\d*\.?\d+|[+\-*/%]/g);

  if (!tokens || tokens.join("") !== input.replace(/\s/g, "")) {
    throw new Error("Invalid expression");
  }

  let position = 0;

  function factor() {
    const token = tokens[position];

    if (token === "+" || token === "-") {
      position++;
      const value = factor();
      return token === "-" ? -value : value;
    }

    if (!token || !/^\d*\.?\d+$/.test(token)) {
      throw new Error("Expected number");
    }

    position++;
    let value = Number(token);

    if (!Number.isFinite(value)) {
      throw new Error("Invalid number");
    }

    if (tokens[position] === "%") {
      value /= 100;
      position++;
    }

    return value;
  }

  function term() {
    let value = factor();

    while (
      tokens[position] === "*" ||
      tokens[position] === "/"
    ) {
      const operator = tokens[position++];
      const next = factor();

      if (operator === "/" && next === 0) {
        throw new Error("Cannot divide by zero");
      }

      value = operator === "*" ? value * next : value / next;
    }

    return value;
  }

  function sum() {
    let value = term();

    while (
      tokens[position] === "+" ||
      tokens[position] === "-"
    ) {
      const operator = tokens[position++];
      const next = term();

      value = operator === "+" ? value + next : value - next;
    }

    return value;
  }

  const answer = sum();

  if (position !== tokens.length) {
    throw new Error("Invalid expression");
  }

  return answer;
}

function updateDisplay() {
  expressionDisplay.textContent = expression
    ? expression.replace(/\*/g, "×").replace(/\//g, "÷")
    : "Ready to calculate";

  if (!expression || /[+\-*/.]$/.test(expression)) {
    resultDisplay.textContent = expression ? "…" : "0";
    return;
  }

  try {
    resultDisplay.textContent = formatNumber(calculate(expression));
  } catch {
    resultDisplay.textContent = "…";
  }
}

function addValue(value) {
  const operators = ["+", "-", "*", "/"];

  if (justCalculated) {
    if (!operators.includes(value) && value !== "%") {
      expression = "";
    }
    justCalculated = false;
  }

  const last = expression.slice(-1);

  if (operators.includes(value)) {
    if (!expression && value !== "-") return;

    if (operators.includes(last)) {
      expression = expression.slice(0, -1);
    }

    expression += value;
  } else if (value === "%") {
    if (/\d$/.test(expression)) {
      expression += "%";
    }
  } else if (value === ".") {
    const currentNumber = expression.split(/[+\-*/%]/).pop();

    if (!currentNumber.includes(".")) {
      expression += currentNumber ? "." : "0.";
    }
  } else {
    expression += value;
  }

  updateDisplay();
}

function clearCalculator() {
  expression = "";
  justCalculated = false;
  updateDisplay();
}

function deleteLast() {
  if (justCalculated) {
    clearCalculator();
    return;
  }

  expression = expression.slice(0, -1);
  updateDisplay();
}

function calculateResult() {
  try {
    if (!expression || /[+\-*/.]$/.test(expression)) return;

    const answer = formatNumber(calculate(expression));

    expressionDisplay.textContent =
      expression.replace(/\*/g, "×").replace(/\//g, "÷") + " =";

    resultDisplay.textContent = answer;
    expression = answer;
    justCalculated = true;
  } catch {
    resultDisplay.textContent = "Error";
    justCalculated = true;
  }
}

function toggleSign() {
  if (!expression) {
    expression = "-";
  } else if (expression.startsWith("-")) {
    expression = expression.slice(1);
  } else {
    expression = "-" + expression;
  }

  justCalculated = false;
  updateDisplay();
}

buttons.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  if (button.dataset.value !== undefined) {
    addValue(button.dataset.value);
    return;
  }

  switch (button.dataset.action) {
    case "clear":
      clearCalculator();
      break;
    case "delete":
      deleteLast();
      break;
    case "equals":
      calculateResult();
      break;
    case "sign":
      toggleSign();
      break;
  }
});

// Keyboard support
document.addEventListener("keydown", (event) => {
  const key = event.key;

  if (/^\d$/.test(key) || [".", "+", "-", "*", "/", "%"].includes(key)) {
    event.preventDefault();
    addValue(key);
  } else if (key === "Enter" || key === "=") {
    event.preventDefault();
    calculateResult();
  } else if (key === "Backspace") {
    deleteLast();
  } else if (key === "Escape" || key === "Delete") {
    clearCalculator();
  }
});

updateDisplay();