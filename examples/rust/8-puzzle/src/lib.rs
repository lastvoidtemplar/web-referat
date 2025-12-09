use std::{cmp::min, i32};

use wasm_bindgen::prelude::*;

use js_sys::Array;

const N: usize = 3;
const TARGET_POSITION: [(i32, i32); 9] = [
    (2, 2),
    (0, 0),
    (0, 1),
    (0, 2),
    (1, 0),
    (1, 1),
    (1, 2),
    (2, 0),
    (2, 1),
];

#[wasm_bindgen]
pub fn solve(arr: &[i32]) -> Array {
    let mut pos = build_position(arr);
    calculate_heuristic(&mut pos);

    let path = iterative_deepening_a_star(&pos);
    convert_move_vector_to_js_string_array(&path)
}

#[derive(Clone)]
struct Position {
    elements: [i32; N * N],
    hole_row: usize,
    hole_colm: usize,
    dist: i32,
    heuristic: i32,
}

fn build_position(arr: &[i32]) -> Position {
    if arr.len() != N * N {
        panic!("expected array with size {}", N * N);
    }

    let mut elements = [0; N * N];
    let mut hole_ind = 0;
    for ind in 0..(N * N) {
        elements[ind] = arr[ind];
        if arr[ind] == 0 {
            hole_ind = ind;
        }
    }

    Position {
        elements,
        hole_row: hole_ind / N,
        hole_colm: hole_ind % N,
        dist: 0,
        heuristic: -1,
    }
}

fn calculate_heuristic(pos: & mut Position) {
    let n = N as i32;

    let mut sum = 0;
    let elements = &pos.elements;

    for curr_row in 0..n {
        let ind = n * curr_row;
        for curr_colm in 0..n {
            let ind = ind + curr_colm;

            let el = elements[ind as usize];
            if el == 0 {
                continue;
            }

            let (exp_row, exp_colm) = TARGET_POSITION[el as usize];
            sum += (curr_row - exp_row).abs() + (curr_colm - exp_colm).abs();
        }
    }

    pos.heuristic = sum
}

#[derive(Clone, Debug)]
enum Move {
    Left,
    Right,
    Up,
    Down,
}

const NONE_MOVE_ARR: [Move; 4] = [Move::Left, Move::Right, Move::Up, Move::Down];
const LEFT_MOVE_ARR: [Move; 3] = [Move::Left, Move::Up, Move::Down];
const RIGHT_MOVE_ARR: [Move; 3] = [Move::Right, Move::Up, Move::Down];
const UP_MOVE_ARR: [Move; 3] = [Move::Left, Move::Right, Move::Up];
const DOWN_MOVE_ARR: [Move; 3] = [Move::Left, Move::Right, Move::Down];

fn generate_moves(mov: Option<&Move>) -> &'static [Move] {
    match mov {
        None => &NONE_MOVE_ARR,
        Some(mov) => match mov {
            Move::Left => &LEFT_MOVE_ARR,
            Move::Right => &RIGHT_MOVE_ARR,
            Move::Up => &UP_MOVE_ARR,
            Move::Down => &DOWN_MOVE_ARR,
        },
    }
}

fn generate_position(pos: &Position, mov: &Move) -> Option<Position> {
    let (hole_row, hole_colm) = (pos.hole_row, pos.hole_colm);
    let (new_hole_row, new_hole_colm) = match mov {
        Move::Left if hole_colm != 0 => (hole_row, hole_colm - 1),
        Move::Right if hole_colm != N - 1 => (hole_row, hole_colm + 1),
        Move::Up if hole_row != 0 => (hole_row - 1, hole_colm),
        Move::Down if hole_row != N - 1 => (hole_row + 1, hole_colm),
        _ => return None,
    };

    let hole_ind = N * hole_row + hole_colm;
    let new_hole_ind = N * new_hole_row + new_hole_colm;
    let mut new_elements = pos.elements.clone();
    new_elements.swap(hole_ind, new_hole_ind);
    Some(Position {
        elements: new_elements,
        hole_row: new_hole_row,
        hole_colm: new_hole_colm,
        dist: pos.dist + 1,
        heuristic: -1,
    })
}

fn generate_ordered_successors(
    pos: &Position,
    last_move: Option<&Move>,
) -> Vec<(Move, Position)> {
    let moves = generate_moves(last_move);
    let mut successors = Vec::with_capacity(moves.len());
    for mov in moves {
        if let Some(mut new_pos) = generate_position(pos, &mov) {
            calculate_heuristic(&mut new_pos);
            let heuristic = new_pos.heuristic;

            successors.push((mov.clone(), new_pos));

            let mut i = successors.len();
            while i > 0 && successors[i - 1].1.heuristic > heuristic {
                successors.swap(i, i - 1);
                i -= 1;
            }
        }
    }

    successors
}

enum SearchResult {
    Min(i32),
    Found(Vec<Move>),
}

fn search(
    pos: &Position,
    bound: i32,
    last_move: Option<&Move>,
) -> SearchResult {
    let dist = pos.dist;
    let heuristic = pos.heuristic;
    let total_dist = dist + heuristic;

    if total_dist > bound {
        return SearchResult::Min(total_dist);
    }

    if heuristic == 0 {
        return SearchResult::Found(Vec::new());
    }

    let mut min_depth = i32::MAX;
    let successors = generate_ordered_successors(pos, last_move);
    for (mov, new_pos) in successors {
        let res = search(&new_pos, bound, Some(&mov));
        match res {
            SearchResult::Min(result) => min_depth = min(min_depth, result),
            SearchResult::Found(mut path) => {
                path.push(mov);
                return SearchResult::Found(path);
            }
        }
    }

    SearchResult::Min(min_depth)
}

fn iterative_deepening_a_star(pos: &Position) -> Vec<Move> {
    let mut bound = pos.heuristic;
    loop {
        let res = search(pos, bound, None);
        match res {
            SearchResult::Min(min) => bound = min,
            SearchResult::Found(path) => return path,
        }
    }
}

fn convert_move_vector_to_js_string_array(path: &Vec<Move>) -> Array {
    let res  = js_sys::Array::new();

    for mov in path.iter().rev() {
        let mov_str = format!("{:?}", mov).to_lowercase();
        res.push(&JsValue::from_str(mov_str.as_str()));
    }

    res
}