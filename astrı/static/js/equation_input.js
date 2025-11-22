import { solveEquationWasm } from './wasm_loader.js';
import { renderGraph } from './graph_renderer.js';

const form = document.getElementById('equation-form');
const equationInput = document.getElementById('equation-input');
const outputArea = document.getElementById('equation-output');
const canvas = document.getElementById('result-canvas');

function validateEquation(eq) {
  // Basic validation: not empty, contains 'y' or variables, allowed chars
  if (!eq || eq.trim().length === 0) return false;
  const allowed = /^[0-9xy\s\+\-\*\/\^\=\.\(\)d\/]+$/i;
  return allowed.test(eq);
}

async function solveEquation(equation) {
  try {
    // Call backend API first
    const response = await fetch('/api/equation/solve', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({equation})
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'API error');
    }
    const data = await response.json();

    // Optionally, run wasm solver client-side for faster display
    const wasmData = await solveEquationWasm(equation);

    outputArea.textContent = JSON.stringify(data, null, 2);

    // Render graph from wasmData
    if (wasmData && wasmData.results) {
      renderGraph(wasmData.results, canvas);
    }

  } catch (error) {
    outputArea.textContent = `Error: ${error.message}`;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const eq = equationInput.value;
  if (!validateEquation(eq)) {
    outputArea.textContent = 'Invalid equation format. Please check syntax.';
    return;
  }
  outputArea.textContent = 'Solving equation...';
  solveEquation(eq);
});
