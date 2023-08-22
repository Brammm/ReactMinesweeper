import {shuffle} from './util';
import {useReducer} from 'react';
import {produce} from 'immer';

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
    mine: boolean;
    flagged: boolean;
} | {
    coord: Coord;
    revealed: true;
    mine: false;
    flagged: false;
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
    type: 'mark';
    clicked: Coord;
};

const MinesReducer = produce((draft: GameState, action: GameAction) => {
    switch (action.type) {
        case 'reset_game':
            draft.status = 'idle';
            draft.cells = generateGrid(draft.config, [])
            return;
        case 'start_game':
            draft.status = 'in_progress';
            draft.cells = generateGrid(draft.config, generateMines(draft.config, action.origin))
            return;
        case 'uncover': {
            const cellIndex = action.clicked.y * draft.config.width + action.clicked.x;
            const cell = draft.cells[cellIndex];

            // Don't do anything if cell is already revealed or flagged
            if (cell.revealed || cell.flagged) {
                return;
            }

            if (cell.mine) {
                draft.status = 'lost';
                draft.cells[cellIndex].revealed = true;

                return;
            }

            let value: CellValue = countMines(draft, action.clicked);
            draft.cells[cellIndex] = {...cell, mine: false, flagged: false, revealed: true, value};
            return;
        }
        case 'mark': {
            const cellIndex = action.clicked.y * draft.config.width + action.clicked.x;
            if (draft.cells[cellIndex].revealed) {
                return;
            }


            draft.cells[cellIndex].flagged = ! draft.cells[cellIndex].flagged;
            draft.cells[cellIndex].revealed = false;
            return;
        }
    }

    }
);

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

            cells[y * config.width + x] = {coord, mine, revealed: false, flagged: false};
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

            neighbours.push(state.cells[(coord.y+dy)*state.config.width+coord.x+dx]);
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
    })

    return value;
}

// function isValidValue(value: number): value is CellValue {
//     return value >= 0 && value <= 8;
// }
