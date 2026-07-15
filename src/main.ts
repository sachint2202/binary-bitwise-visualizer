import "./style.css";
import { toBinary32 } from "./core/binary.ts";
import {
  binaryOprations,
  unaryOperations,
  unaryOperationsList,
} from "./core/operations.ts";
import { createBitGrid } from "./ui/bit-grid.ts";

const app = document.querySelector<HTMLDivElement>("#app")!;
app.innerHTML = `
<main class="container">
  <section class="hero">
    <h1>Binary Bitwise Visualizer</h1>
    <p class="subtitle">
      Learn and visualize JavaScript bitwise operations with live 32-bit binary representation.
    </p>

    <div class="keywords">
      <span>Binary Representation</span>
      <span>Bitwise NOT (~)</span>
      <span>Bitwise AND (&)</span>
      <span>Bitwise OR (|)</span>
      <span>Bitwise XOR (^)</span>
      <span>Bit Masks</span>
      <span>Two's Complement</span>
      <span>Left Shift (<<)</span>
      <span>Right Shift (>>)</span>
      <span>Unsigned Right Shift (>>>)</span>
    </div>
  </section>

  <section class="tool-placeholder">
    <h2>Interactive Visualizer</h2>
    <p>Enter a number and see its 32-bit binary representation in real time.</p>

    <form class="grid-container" id="bitwiseForm">
      <div class="input-group">
        <label for="numberInput">Enter a number</label>
        <input
          type="number"
          id="numberInput"
          placeholder="Enter a number"
          value="2"
        />
      </div>

      <div class="input-group" id="numberInput2Container">
        <label for="numberInput2" id="numberInput2Label">
          Enter number (for binary operations)
        </label>
        <input
          type="number"
          id="numberInput2"
          placeholder="Enter another number"
          value="2"
        />
      </div>

      <div class="input-group">
        <label for="operationSelect">Select operation</label>
        <select id="operationSelect">
          <option value="not">Bitwise NOT (~)</option>
          <option value="and">Bitwise AND (&)</option>
          <option value="or">Bitwise OR (|)</option>
          <option value="xor">Bitwise XOR (^)</option>
          <option value="leftShift">Left Shift (<<)</option>
          <option value="rightShift">Right Shift (>>)</option>
          <option value="unsignedRightShift">Unsigned Right Shift (>>>)</option>
        </select>
      </div>

      <div class="input-group button-group">
        <label class="sr-only" for="operationButton">Run operation</label>
        <button type="button" id="operationButton">Perform Operation</button>
      </div>
    </form>
  </section>

  <section class="results-section">
    <div class="card">
      <h3>Input Binary Representation</h3>
      <div id="inputGrid" class="bit-grid"></div>
    </div>

    <div class="card" id="resultCard" hidden>
      <h3>Result of <span id="operationName">Operation</span></h3>
      <div id="resultGrid" class="bit-grid"></div>
    </div>

    <div class="card" id="explanation"></div>
  </section>

  <section class="info-section">
    <div class="card">
      <h2>What is this tool?</h2>
      <p>
        This tool is designed to help you understand how JavaScript performs
        bitwise operations on numbers. It provides a visual representation of
        the binary form of numbers and demonstrates how different bitwise
        operations affect them.
      </p>
    </div>

    <div class="card">
      <h2>Who is this for?</h2>
      <p>
        This tool is ideal for students, developers, and anyone interested in
        learning about binary numbers and bitwise operations in JavaScript.
        Whether you're preparing for coding interviews or just want to deepen
        your understanding of how computers process data, this visualizer can be
        a valuable resource.
      </p>
    </div>
  </section>
</main>
`;
const operationName =
  document.querySelector<HTMLHeadingElement>("#resultCard h3")!;
const numberInput = document.querySelector<HTMLInputElement>("#numberInput")!;
const numberInput2 = document.querySelector<HTMLInputElement>("#numberInput2")!;
const numberInput2Container = document.querySelector<HTMLDivElement>(
  "#numberInput2Container",
)!;
const numberInput2Label =
  document.querySelector<HTMLLabelElement>("#numberInput2Label")!;
const performOperationButton =
  document.querySelector<HTMLButtonElement>("#operationButton")!;
const inputGrid = document.querySelector<HTMLDivElement>("#inputGrid")!;
const resultGrid = document.querySelector<HTMLDivElement>("#resultGrid")!;
const explanation = document.querySelector<HTMLDivElement>("#explanation")!;
const resultCard = document.querySelector<HTMLDivElement>("#resultCard")!;
const operationSelect =
  document.querySelector<HTMLSelectElement>("#operationSelect")!;
function renderInputBinary() {
  const value = Number(numberInput.value);
  inputGrid.innerHTML = createBitGrid(toBinary32(value));
}
function onOperationChange() {
  const operationToPerform = operationSelect.value;
  let operation;
  numberInput2Container.hidden = false;
  if (unaryOperationsList.includes(operationToPerform)) {
    operation = unaryOperations.find((op) => op.id === operationToPerform);
    numberInput2Container.classList.add("hidden");
  } else {
    operation = binaryOprations.find((op) => op.id === operationToPerform);
    numberInput2Container.classList.remove("hidden");
  }
  numberInput2Label.textContent = `Enter number (for ${operation?.label ?? ""} operation):`;
  performOperationButton.textContent = `Perform ${operation?.label ?? ""} operation`;
}
function applyOperation() {
  const value = Number(numberInput.value);
  const value2 = Number(numberInput2.value);

  let isBinaryOperation = !unaryOperationsList.includes(operationSelect.value);

  //const result = bitwiseNot(value);
  resultCard.hidden = false;
  explanation.hidden = false;
  let selected, result;
  if (!isBinaryOperation) {
    selected = unaryOperations.find((op) => op.id === operationSelect.value)!;
    result = selected ? selected.execute(value) : value;
  } else {
    selected = selected = binaryOprations.find(
      (op) => op.id === operationSelect.value,
    )!;
    result = selected ? selected.execute(value, value2) : value;
  }
  operationName.textContent = selected.label;
  const beforeBinary = toBinary32(value);
  let beforeBinary2 = "";
  if (isBinaryOperation) {
    beforeBinary2 = toBinary32(Number(numberInput2.value));
  }
  const afterBinary = toBinary32(result);
  explanation.innerHTML = selected.explanation;
  if (!isBinaryOperation) {
    resultGrid.innerHTML = `<div>
  <h3>Before</h3>
  <span>Value: ${value}</span>
  <div class="bit-grid">
  ${createBitGrid(beforeBinary)}
  </div>
  <h3>After ${selected.label}</h3>
  <span>Result: ${result}</span>
  <div class="bit-grid">
  ${createBitGrid(afterBinary, beforeBinary)} 
  </div>
  </div>`;
  } else {
    resultGrid.innerHTML = `<div>
    <h3>Before</h3>
    <span>First Value: ${value}</span>
    <div class="bit-grid">
    ${createBitGrid(beforeBinary)}
    </div>
    <span>Second Value: ${value2}</span>
     <div class="bit-grid">
    ${createBitGrid(beforeBinary2)}
    </div>
    <h3>After ${selected.label}</h3>
    <span>Result: ${result}</span>
    <div class="bit-grid">
    ${createBitGrid(afterBinary, beforeBinary)} 
    </div>
    </div>`;
  }
}

numberInput.addEventListener("input", renderInputBinary);
numberInput2.addEventListener("input", applyOperation);
operationSelect.addEventListener("change", onOperationChange);
document
  .querySelector<HTMLButtonElement>("#operationButton")!
  .addEventListener("click", applyOperation.bind(null));

renderInputBinary(); // Initial render of the input binary representation
onOperationChange(); // Set initial state based on the default selected operation
//applyNotOperation(); // Initial render of the NOT operation result
