class Calculator {
  constructor(previousOperandTextElement, currentOperandTextElement) {
    this.previousOperandTextElement = previousOperandTextElement;
    this.currentOperandTextElement = currentOperandTextElement;
    this.clear();
  }

  clear() {
    this.currentOperand = '0';
    this.previousOperand = '';
    this.operation = undefined;
    this.updateDisplay();
  }

  appendNumber(number) {
    if (number === '.' && this.currentOperand.includes('.')) return;
    if (this.currentOperand === '0' && number !== '.') {
      this.currentOperand = number;
    } else {
      this.currentOperand += number;
    }
    this.updateDisplay();
  }

  chooseOperation(operation) {
    if (this.currentOperand === '') return;
    if (this.previousOperand !== '') {
      this.compute();
    }
    this.operation = operation;
    this.previousOperand = this.currentOperand;
    this.currentOperand = '';
    this.updateDisplay();
  }

  compute() {
    const prev = parseFloat(this.previousOperand);
    const current = parseFloat(this.currentOperand);
    if (isNaN(prev) || isNaN(current)) return;

    let result;
    switch (this.operation) {
      case '+': result = prev + current; break;
      case '-': result = prev - current; break;
      case '×': result = prev * current; break;
      case '÷': result = prev / current; break;
      default: return;
    }

    this.currentOperand = result.toString();
    this.operation = undefined;
    this.previousOperand = '';
    this.updateDisplay();
  }

  toggleSign() {
    if (!this.currentOperand || this.currentOperand === '0') return;
    this.currentOperand = (-parseFloat(this.currentOperand)).toString();
    this.updateDisplay();
  }

  percentage() {
    const current = parseFloat(this.currentOperand);
    if (isNaN(current)) return;
    this.currentOperand = (current / 100).toString();
    this.updateDisplay();
  }

  getDisplayNumber(number) {
    const [intPart, decPart] = number.toString().split('.');
    const intDisplay = isNaN(parseFloat(intPart)) ? '' : parseFloat(intPart).toLocaleString('en');
    return decPart != null ? `${intDisplay}.${decPart}` : intDisplay;
  }

  updateDisplay() {
    this.currentOperandTextElement.innerText = this.getDisplayNumber(this.currentOperand);
    this.previousOperandTextElement.innerText = this.operation
      ? `${this.getDisplayNumber(this.previousOperand)} ${this.operation}`
      : '';
  }
}

function initCalculator() {
  const numberButtons = document.querySelectorAll('.number-btn');
  const operatorButtons = document.querySelectorAll('.operator-btn');
  const functionButtons = document.querySelectorAll('.function-btn');
  const previousOperandTextElement = document.getElementById('previous-operand');
  const currentOperandTextElement = document.getElementById('current-operand');

  if (!previousOperandTextElement || !currentOperandTextElement) return; // Don't run if calculator not on page

  const calculator = new Calculator(previousOperandTextElement, currentOperandTextElement);

  numberButtons.forEach(button => {
    button.addEventListener('click', () => calculator.appendNumber(button.innerText));
  });

  operatorButtons.forEach(button => {
    button.addEventListener('click', () => {
      const action = button.dataset.action;
      if (action === 'equals') {
        calculator.compute();
      } else {
        calculator.chooseOperation(button.innerText);
      }
    });
  });

  functionButtons.forEach(button => {
    button.addEventListener('click', () => {
      switch (button.dataset.action) {
        case 'clear': calculator.clear(); break;
        case 'plus-minus': calculator.toggleSign(); break;
        case 'percent': calculator.percentage(); break;
      }
    });
  });

  document.addEventListener('keydown', e => {
    const key = e.key;
    if (!isNaN(key) || key === '.') {
      calculator.appendNumber(key);
    } else if (['+', '-', '*', '/'].includes(key)) {
      calculator.chooseOperation(key === '*' ? '×' : key === '/' ? '÷' : key);
    } else if (key === '=' || key === 'Enter') {
      calculator.compute();
    } else if (key === 'Escape') {
      calculator.clear();
    }
  });
}

// Run on load if embedded
window.addEventListener('DOMContentLoaded', initCalculator);
