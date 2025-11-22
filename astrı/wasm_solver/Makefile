EMCC=emcc
CFLAGS=-O3 -s WASM=1 -s EXPORTED_FUNCTIONS="['_solve_equation']" -s EXTRA_EXPORTED_RUNTIME_METHODS="['cwrap']" -s MODULARIZE=1 -s ENVIRONMENT='web,node'
TARGET=solver.wasm
SRC=solver.c

all:
	$(EMCC) $(SRC) $(CFLAGS) -o solver.js

clean:
	rm -f solver.js solver.wasm solver.js.map
