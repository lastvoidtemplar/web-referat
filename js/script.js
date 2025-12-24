import hljs from "./highlight/highlight.min.js";
import wasm from "./highlight/languages/wasm.min.js";
import shell from "./highlight/languages/shell.min.js";
import setupPrintAdd from "./setup_print_add.js";
import setupFibb from "./setup_fibb.js";
import setupGreet from "./setup_greet.js";
import setup8Puzzle from "./setup_8_puzzle.js";

hljs.registerLanguage("wasm", wasm);
hljs.registerLanguage("shell", shell);

document.addEventListener("DOMContentLoaded", () => {
  hljs.highlightAll();
});

await setupPrintAdd();
await setupFibb();
await setupGreet()
await setup8Puzzle()

