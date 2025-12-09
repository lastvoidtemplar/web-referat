import hljs from "./highlight/highlight.min.js";
import wasm from "./highlight/languages/wasm.min.js";
import setupPrintAdd from "./setup_print_add.js";
import setupFibb from "./setup_fibb.js";
import setupGreet from "./setup_greet.js";

hljs.registerLanguage("wasm", wasm);

document.addEventListener("DOMContentLoaded", () => {
  hljs.highlightAll();
});

await setupPrintAdd();
await setupFibb();
await setupGreet()
