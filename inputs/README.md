Generating the SDK requires an intermediate representation (IR) file. Once obtained, the SDK can be built by placing the IR contents into `decodo.ir.json`.

`pnpm codegen` downloads the latest published IR. To generate from an IR that is not published yet, point `DECODO_IR_URL` at it, for example `DECODO_IR_URL=file:///path/to/decodo.ir.json pnpm codegen`.
