# VUNA-Calc

A sophisticated web-based calculator that performs mathematical computations and displays results in plain English language. Perfect for users who want to see their calculations explained in natural language format.

## ✨ Features

- **Mathematical Operations**: Supports addition (+), subtraction (-), multiplication (\*), and division (/)
- **English Language Output**: All calculation results are displayed in readable English text
- **Parentheses Support**: Perform complex calculations with proper bracket usage
- **User-Friendly Interface**: Clean, intuitive design built with Bootstrap
- **Decimal Support**: Handle calculations with decimal numbers
- **Backspace Function**: Easily correct input errors with the backspace button
- **Real-Time Display**: See your input and results instantly

## 🛠️ Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript
- **Framework**: Bootstrap 5 (for responsive UI)
- **Calculation Engine**: JavaScript-based number-to-words conversion

## 📋 Getting Started

### Prerequisites

- Any modern web browser (Chrome, Firefox, Safari, Edge, etc.)
- No installation required!

### Installation

1. Clone the repository:

```bash
git clone https://github.com/Olivia-Anigbogu/VUNA-Calc.git
```

2. Navigate to the project directory:

```bash
cd VUNA-Calc
```

3. Open `index.html` in your web browser

## 🎮 How to Use

1. **Enter numbers** by clicking the number buttons (0-9)
2. **Select an operation** by clicking +, -, \*, or /
3. **Use parentheses** for complex calculations
4. **Press the = button** to calculate the result
5. **View the result** in both numeric and English word formats
6. **Use ← (backspace)** to delete the last character
7. **Press AC** to clear all entries and start over

### Example Calculations

- `5 + 3 = 8` → "eight"
- `100 * 2 = 200` → "two hundred"
- `1000 + 500 = 1500` → "one thousand five hundred"

## 📁 Project Structure

```
VUNA-Calc/
├── index.html              # Main calculator interface
├── assets/
│   ├── css/
│   │   └── bootstrap.min.css   # Bootstrap styling
│   └── js/
│       ├── bootstrap.min.js    # Bootstrap functionality
│       └── script.js           # Calculator logic
├── README.md               # This file
├── CONTRIBUTING.md         # Contribution guidelines
└── LICENSE                 # Project license
```

## 🔄 How It Works

The calculator uses a simple three-variable system to track calculations:

- **left**: The first number
- **operator**: The operation to perform
- **right**: The second number

After calculation, the result is converted to English words using a sophisticated algorithm that handles:

- Units (one through nineteen)
- Tens (twenty, thirty, etc.)
- Scales (thousand, million, billion, trillion)
- Decimal numbers (displayed with "point" between whole and decimal parts)

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to contribute to this project.

## 📄 License

This project is licensed under the GNU v2.0 License - see the [LICENSE](LICENSE) file for details.

## 👥 Credits

Created by **GROUP 2** as a collaborative project to demonstrate calculator functionality with natural language output.

## 📞 Support

For bug reports and feature requests, please open an issue on the [GitHub repository](https://github.com/Olivia-Anigbogu/VUNA-Calc/issues).

## 🚀 Future Enhancements

Potential features for future versions:

- Additional mathematical operations (square root, exponents, etc.)
- Support for more languages
- Calculation history
- Dark/Light theme toggle
- Mobile app version
