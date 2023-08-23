import {shuffle} from './util';
import {useReducer} from 'react';

type Config = {
    width: number;
    height: number;
    mines: number;
}

export type GameState = {
    config: Config;
    status: 'idle' | 'in_progress' | 'lost' | 'won';
    cells: Record<number, Cell>;
};

export type Coord = {
    x: number;
    y: number;
};

type CellValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type Cell = {
    coord: Coord;
    revealed: boolean;
    mine: true;
    flagged: boolean;
} | {
    coord: Coord;
    revealed: boolean;
    mine: false;
    flagged: boolean;
    value: CellValue;
}

export type GameAction = {
    type: 'reset_game';
} | {
    type: 'start_game';
    origin: Coord;
} | {
    type: 'uncover';
    clicked: Coord;
} | {
    type: 'flag';
    clicked: Coord;
};

function MinesReducer(state: GameState, action: GameAction): GameState {
    switch (action.type) {
        case 'reset_game':
            return {
                ...state, status: 'idle',
                cells: generateGrid(state.config, []),
            };
        case 'start_game':
            return {
                ...state, status: 'in_progress',
                cells: generateGrid(state.config, generateMines(state.config, action.origin)),
            };
        case 'uncover': {
            if (state.status === 'idle') {
                state = {
                    ...state, status: 'in_progress',
                    cells: generateGrid(state.config, generateMines(state.config, action.clicked)),
                };
            }

            if (state.status !== 'in_progress') {
                return state;
            }


            const cellIndex = action.clicked.y * state.config.width + action.clicked.x;
            const cell = state.cells[cellIndex];

            // Don't do anything if cell is already revealed or flagged
            if (cell.revealed || cell.flagged) {
                return state;
            }

            if (cell.mine) {
                return {...state, status: 'lost', cells: {...state.cells, [cellIndex]: {...cell, revealed: true}}};
            }

            return {...state, cells: {...state.cells, [cellIndex]: {...cell, revealed: true}}};
        }
        case 'flag': {
            if (state.status !== 'in_progress') {
                return state;
            }

            const cellIndex = action.clicked.y * state.config.width + action.clicked.x;
            const cell = state.cells[cellIndex];
            if (state.cells[cellIndex].revealed) {
                return state;
            }

            return {...state, cells: {...state.cells, [cellIndex]: {...cell, flagged: true}}};
        }
    }
};

export function useMines(config: Config) {
    return useReducer(
        MinesReducer,
        {config, status: 'idle', cells: generateGrid(config, [])},
    );
}

function generateMines(config: Config, origin: Coord): Coord[] {
    let mineLocations = [];

    for (let x = 0; x < config.width; x++) {
        for (let y = 0; y < config.height; y++) {
            if (Math.abs(x - origin.x) > 1 || Math.abs(y - origin.y) > 1) {
                mineLocations.push({x, y});
            }
        }
    }
    shuffle(mineLocations);

    return mineLocations.slice(0, config.mines);
}

function generateGrid(config: Config, mines: Coord[]): GameState['cells'] {
    let cells: GameState['cells'] = {};

    for (let x = 0; x < config.width; x++) {
        for (let y = 0; y < config.height; y++) {
            const coord = {x, y};

            const mine = !!mines.find((mine) => mine.x === coord.x && mine.y === coord.y);

            cells[y * config.width + x] = mine
                ? {coord, mine: true, revealed: false, flagged: false}
                : {coord, mine: false, revealed: false, flagged: false, value: 0};
        }
    }

    return cells;
}

function getNeighbouringCells(state: GameState, coord: Coord): Cell[] {
    let neighbours: Cell[] = [];

    for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
            // Skip if
            if (
                (dx === 0 && dy === 0) // same as `coord`
                || (coord.x + dx < 0 || coord.x + dx > state.config.width) // new x is out of bounds
                || (coord.y + dy < 0 || coord.y + dy > state.config.height) // new y is out of bounds
            ) {
                continue;
            }

            neighbours.push(state.cells[(coord.y + dy) * state.config.width + coord.x + dx]);
        }

    }

    return neighbours;
}

function countMines(state: GameState, coord: Coord): CellValue {
    let value: CellValue = 0;
    getNeighbouringCells(state, coord).forEach((cell) => {
        if (cell.mine) {
            value++;
        }
    });

    return value;
}

// function isValidValue(value: number): value is CellValue {
//     return value >= 0 && value <= 8;
// }
