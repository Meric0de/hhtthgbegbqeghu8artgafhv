import os
import json
from flask import Flask, request, jsonify, abort
from flask_cors import CORS
import sympy as sp
import numpy as np
from wasm_solver import wasm_solver_module
from php_auth_proxy import auth_blueprint

app = Flask(__name__)
CORS(app)

# Register PHP Auth Proxy Blueprint
app.register_blueprint(auth_blueprint, url_prefix="/auth")

@app.route("/api/equation/solve", methods=["POST"])
def solve_equation():
    try:
        data = request.get_json(force=True)
        if not data or "equation" not in data:
            return jsonify({"error": "Missing 'equation' parameter"}), 400
        eq_str = data["equation"].strip()
        if len(eq_str) == 0:
            return jsonify({"error": "Equation string cannot be empty"}), 400
        
        # Parse equation safely using sympy
        try:
            expr = sp.sympify(eq_str, evaluate=False)
        except (sp.SympifyError, TypeError, ValueError) as e:
            return jsonify({"error": f"Invalid equation syntax: {str(e)}"}), 400
        
        # Extract symbols for numeric solving
        symbols = sorted(expr.free_symbols, key=lambda s: s.name)
        if not symbols:
            return jsonify({"error": "Equation must contain at least one variable"}), 400
        
        # For demo purposes, solve for first variable
        solve_for = symbols[0]
        
        # Use wasm solver for demonstration - assume wasm_solver_module has solve_equation function
        try:
            wasm_result = wasm_solver_module.solve_equation(eq_str)
        except Exception as e:
            # Fallback to sympy solver if wasm fails
            solutions = sp.solve(expr, solve_for)
            solutions_str = [str(sol) for sol in solutions]
            return jsonify({
                "warning": "WASM solver failed, fallback to sympy",
                "solutions": solutions_str
            })
        
        return jsonify({
            "equation": eq_str,
            "variable": str(solve_for),
            "solution": wasm_result
        })
    except Exception as e:
        return jsonify({"error": "Internal server error: " + str(e)}), 500

@app.route("/api/status", methods=["GET"])
def status():
    return jsonify({"status": "ok", "message": "Astrophysics equation solver server running"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
