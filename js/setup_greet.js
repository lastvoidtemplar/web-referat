const GREET_PATH = "../examples/wat/greet/greet.wasm";
const NAME_MEMORY_ADRR = 128;

let greet;
let memory;

async function init() {
  if (greet !== undefined && memory !== undefined) {
    return;
  }

  const url = new URL(GREET_PATH, import.meta.url);
  try {
    const module = fetch(url);
    const { instance } = await WebAssembly.instantiateStreaming(module, {
      js: {
        print,
      },
    });
    greet = instance.exports.greet;
    memory = instance.exports.memory;
  } catch (error) {
    console.error(error);
  }
}

const greetForm = document.getElementById("greet-form");
const resultP = greetForm.querySelector("p#result");
const greetBtn = greetForm.querySelector("button");

function print(greetingPtr) {
  const mem = new Uint8Array(memory.buffer)
  const greetingLen = mem.slice(greetingPtr).findIndex(b=>b===0);
  const arr = mem.slice(greetingPtr, greetingPtr + greetingLen);

  const greeting = new TextDecoder().decode(arr);

  resultP.innerText = greeting;
}

async function setup() {
  await init();

  greetBtn.addEventListener("click", (e) => {
    e.preventDefault();

    const name = greetForm.querySelector("input[name='name']").value;
    const nameArr = new TextEncoder().encode(name + "\0");
    new Uint8Array(memory.buffer).set(nameArr, NAME_MEMORY_ADRR);

    try {
      greet(NAME_MEMORY_ADRR, nameArr.length);
    } catch (err) {
      console.error(err);
    }
  });
}

export default setup;
