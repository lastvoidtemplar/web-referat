import init, { solve } from "../examples/rust/8-puzzle/pkg/eight_puzzle.js";

const N = 3;
const boardDiv = document.getElementById("board");
const cells = new Array(9);
let holeInd;
const shuffleBtn = document.getElementById("shuffle-board-btn");
const solveBtn = document.getElementById("solve-board-btn");

function swap(newHoleInd) {
  cells[holeInd].innerText = cells[newHoleInd].innerText;
  cells[newHoleInd].innerText = "";
  holeInd = newHoleInd;
}

function moveUp() {
  const holeRow = Math.floor(holeInd / N);
  const holeColm = holeInd % N;

  if (holeRow != 0) {
    const newHoleInd = N * (holeRow - 1) + holeColm;
    swap(newHoleInd);
  }
}

function moveDown() {
  const holeRow = Math.floor(holeInd / N);
  const holeColm = holeInd % N;

  if (holeRow != N - 1) {
    const newHoleInd = N * (holeRow + 1) + holeColm;
    swap(newHoleInd);
  }
}

function moveLeft() {
  const holeRow = Math.floor(holeInd / N);
  const holeColm = holeInd % N;

  if (holeColm != 0) {
    const newHoleInd = N * holeRow + holeColm - 1;
    swap(newHoleInd);
  }
}

function moveRight() {
  const holeRow = Math.floor(holeInd / N);
  const holeColm = holeInd % N;

  if (holeColm != N - 1) {
    const newHoleInd = N * holeRow + holeColm + 1;
    swap(newHoleInd);
  }
}

function shuffle(iter) {
  const moves = [moveUp, moveDown, moveLeft, moveRight];
  for (let ind = 0; ind < iter; ind++) {
    const move = Math.floor(4 * Math.random());
    moves[move]();
  }
}

function animateSolution(moves) {
  let moveInd = 0;
  const intervalId = setInterval(() => {
    if (moveInd !== moves.length) {
      switch (moves[moveInd]) {
        case "up":
          moveUp();
          break;
        case "down":
          moveDown();
          break;
        case "left":
          moveLeft();
          break;
        case "right":
          moveRight();
          break;
        default:
          break;
      }
      moveInd++;
    }

    if (moveInd === moves.length) {
      clearInterval(intervalId);
      unlock();
    }
  }, 300);
}

function lock() {
  solveBtn.disabled = true;
  shuffleBtn.disabled = true;
}

function unlock() {
  solveBtn.disabled = false;
  shuffleBtn.disabled = false;
}

async function setup() {
  await init();

  for (let ind = 0; ind < N * N; ind++) {
    cells[ind] = boardDiv.querySelector(`div#cell-${ind + 1}`);
    cells[ind].innerText = `${ind + 1}`;
  }
  cells[N * N - 1].innerText = "";
  holeInd = N * N - 1;

  shuffleBtn.addEventListener("click", () => {
    lock();
    shuffle(400);
    unlock();
  });

  solveBtn.addEventListener("click", () => {
    lock();
    const arr = new Array(N * N);
    for (let ind = 0; ind < N * N; ind++) {
      const num =
        cells[ind].innerText !== "" ? parseInt(cells[ind].innerText) : 0;
      arr[ind] = parseInt(num);
    }
    animateSolution(solve(arr));
  });
}

export default setup;
