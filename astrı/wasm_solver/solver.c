#include <stdio.h>
#include <stdlib.h>
#include <math.h>

// Example: Solve simple astrophysics ODE using Runge-Kutta 4th order method
// dy/dx = f(x,y), solve y at x+h given y(x)
// For demonstration: dy/dx = -k * y; exponential decay (e.g. radioactive decay or cooling)

double f(double x, double y, double k) {
    return -k * y;
}

// RK4 step
double rk4_step(double x, double y, double h, double k) {
    double k1 = h * f(x, y, k);
    double k2 = h * f(x + h/2.0, y + k1/2.0, k);
    double k3 = h * f(x + h/2.0, y + k2/2.0, k);
    double k4 = h * f(x + h, y + k3, k);
    return y + (k1 + 2*k2 + 2*k3 + k4) / 6.0;
}

// Exposed function: Solve equation given parameters
// Input: json string with keys: initial_x, initial_y, step_h, steps, decay_k
// Output: JSON string of results array with x,y pairs

#include <emscripten/emscripten.h>
#include <string.h>
#include <emscripten/val.h>
#include <stdio.h>

#include <emscripten/bind.h>
#include <emscripten.h>

#include <stdlib.h>

#include <ctype.h>

#include <emscripten/val.h>

#include <emscripten.h>

#include <string>

#include <emscripten/bind.h>

#include <emscripten.h>

#include <emscripten/val.h>

// For simplicity, expose only one function: solve_equation
// Input: string equation (only supports format: "dy/dx = -k*y" with params)
// We'll parse JSON input string and output JSON result string

#include <emscripten/emscripten.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>
#include <emscripten/bind.h>

#include <nlohmann/json.hpp>
using json = nlohmann::json;

extern "C" {

// Provide a simple cwrap-compatible API for JS and Python
EMSCRIPTEN_KEEPALIVE
char* solve_equation(const char* input_json_cstr) {
    // Parse input JSON:
    // { "initial_x":0, "initial_y":1, "step_h":0.1, "steps":100, "decay_k":0.1 }
    static char result_buf[65536];
    try {
        auto input_json = json::parse(input_json_cstr);
        double x = input_json.value("initial_x", 0.0);
        double y = input_json.value("initial_y", 1.0);
        double h = input_json.value("step_h", 0.1);
        int steps = input_json.value("steps", 100);
        double k = input_json.value("decay_k", 0.1);

        json output;
        output["results"] = json::array();

        for (int i = 0; i < steps; i++) {
            x = x + h;
            y = rk4_step(x, y, h, k);
            output["results"].push_back({{"x", x}, {"y", y}});
        }

        std::string output_str = output.dump();
        if (output_str.size() >= sizeof(result_buf)) {
            snprintf(result_buf, sizeof(result_buf), "{\"error\":\"Output too large\"}");
        } else {
            strcpy(result_buf, output_str.c_str());
        }
    } catch (...) {
        snprintf(result_buf, sizeof(result_buf), "{\"error\":\"Exception occurred in solver\"}");
    }
    return result_buf;
}
}
