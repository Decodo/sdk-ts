import pluginJson from "@rollup/plugin-json";
import nodeResolve from "@rollup/plugin-node-resolve";
import { babel } from "@rollup/plugin-babel";
import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";
import pkg from "./package.json" with { type: "json" };

export default [
  {
    input: "./src/index.ts",
    output: [
      {
        file: pkg.module,
        format: "esm",
        sourcemap: true,
      },
      {
        file: pkg.main,
        format: "cjs",
        sourcemap: true,
      },
    ],
    plugins: [
      typescript({ tsconfig: "./tsconfig.json" }),
      nodeResolve(),
      pluginJson(),
      babel({
        babelHelpers: "bundled",
        extensions: [".js", ".mjs", ".ts", ".tsx"],
        presets: ["@babel/preset-typescript"],
      }),
    ],
  },
  {
    input: "./src/index.ts",
    output: [{ file: pkg.types, format: "esm" }],
    plugins: [dts()],
  },
];
