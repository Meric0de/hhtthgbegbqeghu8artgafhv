let wasmModule = null;

async function loadWasm() {
  if (wasmModule) return wasmModule;

  // Load the wasm module compiled by emscripten
  const response = await fetch('/static/wasm_solver/solver.wasm');
  if (!response.ok) {
    throw new Error('Failed to load wasm module');
  }
  const bytes = await response.arrayBuffer();

  const wasmInstance = await WebAssembly.instantiate(bytes, {});
  const exports = wasmInstance.instance.exports;

  // cwrap equivalent in JS
  function cwrap(funcName, returnType, argTypes) {
    const func = exports[funcName];
    if (!func) throw new Error(`Function ${funcName} not found in wasm exports`);
    return function(...args) {
      // For simplicity, only string argument and return string pointer supported
      // We'll manage memory manually here
      // Allocate memory for input string
      const encoder = new TextEncoder();
      const decoder = new TextDecoder();

      // Allocate input string
      const inputStr = args[0];
      const buf = new Uint8Array(encoder.encode(inputStr + '\0'));
      const len = buf.length;
      const ptr = exports._malloc(len);
      const memory = new Uint8Array(exports.memory.buffer, ptr, len);
      memory.set(buf);

      const retPtr = func(ptr);

      // Read null-terminated string from retPtr
      let outStr = '';
      const mem = new Uint8Array(exports.memory.buffer);
      for (let i = retPtr; mem[i] !== 0; i++) {
        outStr += String.fromCharCode(mem[i]);
      }

      exports._free(ptr);
      // No free of retPtr since static buffer in wasm C code

      return outStr;
    };
  }

  const solve_equation = cwrap('solve_equation', 'string', ['string']);

  wasmModule = {
    solve_equation
  };

  return wasmModule;
}

async function solveEquationWasm(inputEquation) {
  try {
    const wasm = await loadWasm();

    // Prepare input JSON for wasm solver
    // For demo, parse equation string and extract parameters or use defaults
    // We expect format like: "dy/dx = -k*y", parse k value from inputEquation string

    let k = 0.1; // default decay constant
    const kMatch = inputEquation.match(/-([0-9.]+)\s*\*\s*y/);
    if (kMatch) {
      k = parseFloat(kMatch[1]) || k;
    }

    const inputJson = JSON.stringify({
      initial_x: 0,
      initial_y: 1,
      step_h: 0.1,
      steps: 100,
      decay_k: k
    });

    const resultStr = wasm.solve_equation(inputJson);
    const resultObj = JSON.parse(resultStr);

    if (resultObj.error) {
      throw new Error(resultObj.error);
    }

    return resultObj;
  } catch (err) {
    throw new Error('WASM solver error: ' + err.message);
  }
}

export { solveEquationWasm };
