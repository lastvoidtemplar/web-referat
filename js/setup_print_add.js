const PRINT_ADD_PATH = "../examples/wat/print_add/print_add.wasm";

let add;

async function init() {
  if (add !== undefined) {
    return;
  }

  const url = new URL(PRINT_ADD_PATH, import.meta.url);
  try {
    const module = fetch(url);
    const { instance } = await WebAssembly.instantiateStreaming(module, {
      js: {
        print,
      },
    });
    add = instance.exports.add;
  } catch (error) {
    console.error(error);
  }
}

const printAddForm = document.getElementById("print-add-form");
const resultP = printAddForm.querySelector("p#result");
const printAddBtn = printAddForm.querySelector("button")

function print(sum) {
  resultP.innerText = `Result: ${sum}`;
}

async function setup() {
  await init();

  printAddBtn.addEventListener("click", (e) => {
    e.preventDefault();

    const a = printAddForm.querySelector("input[name='a']").value;
    const b = printAddForm.querySelector("input[name='b']").value;

    try {
      add(parseInt(a), parseInt(b));
    } catch (err) {
      console.error(err);
    }
  });
}

export default setup;
