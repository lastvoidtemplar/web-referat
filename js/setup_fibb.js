const FIBB_PATH = "../examples/wat/fibb/fibb.wasm";

let nfibb;

async function init() {
  if (nfibb !== undefined) {
    return;
  }

  const url = new URL(FIBB_PATH, import.meta.url);
  try {
    const module = await fetch(url);
    const bytes = await module.arrayBuffer();
    const { instance } = await WebAssembly.instantiate(bytes, {
      js: {
        clear,
        print,
      },
    });
    nfibb = instance.exports.nfibb;
  } catch (error) {
    console.error(error);
  }
}

const fibbForm = document.getElementById("fibb-form");
const resultOl = fibbForm.querySelector("ol#result");
const fibbBtn = fibbForm.querySelector("button");

function clear() {
  resultOl.replaceChildren();
}

function print(fibb) {
  const li = document.createElement("li");
  li.innerText = `${fibb}`;
  resultOl.appendChild(li);
}

async function setup() {
  await init();

  fibbBtn.addEventListener("click", (e) => {
    e.preventDefault();

    const n = fibbForm.querySelector("input[name='n']").value;

    try {
      nfibb(parseInt(n));
    } catch (err) {
      console.error(err);
    }
  });
}

export default setup;
