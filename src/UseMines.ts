import {useReducer} from 'react';
import {shuffle} from './util';

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
        case 'flag': {
            if (state.status !== 'in_progress') {
                return state;
            }

            const cellIndex = action.clicked.y * state.config.width + action.clicked.x;
            const cell = state.cells[cellIndex];
            if (state.cells[cellIndex].revealed) {
                return state;
            }

            return {...state, cells: {...state.cells, [cellIndex]: {...cell, flagged: !cell.flagged}}};
        }
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

            // Kablooey - busted
            if (cell.mine) {
                return {...state, status: 'lost', cells: {...state.cells, [cellIndex]: {...cell, revealed: true}}};
            }

            // Recursively reveal cells
            const cellValues: Record<number, CellValue> = {};
            getCellIndexValues(cellValues, state, cell.coord);
            let newCells = {...state.cells};
            Object.entries(cellValues).forEach(([cellIndex, value]) => {
                newCells[parseInt(cellIndex)] = {...newCells[parseInt(cellIndex)], mine: false, revealed: true, value};
            });

            // If we only have bombs remaining, reveal them and consider player won
            const unrevealedCells = Object.values(newCells).filter((cell) => !cell.revealed);
            if (unrevealedCells.every((cell) => cell.mine)) {
                unrevealedCells.forEach((cell) => {
                    const cellIndex = cell.coord.y * state.config.width + cell.coord.x;
                    newCells[cellIndex] = {...cell, flagged: true}
                })
            }

            // Check if player has won
            const correctFlags = Object.values(newCells).filter((cell) => cell.mine && cell.flagged);
            const revealedCells = Object.values(newCells).filter((cell) => cell.revealed);

            let status: GameState['status'] = state.status;
            if (revealedCells.length + correctFlags.length === state.config.width * state.config.height) {
                status = 'won';
            }

            return {...state, status, cells: newCells};
        }
    }
}

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
                || (coord.x + dx < 0 || coord.x + dx >= state.config.width) // new x is out of bounds
                || (coord.y + dy < 0 || coord.y + dy >= state.config.height) // new y is out of bounds
            ) {
                continue;
            }

            neighbours.push(state.cells[((coord.y + dy) * state.config.width) + (coord.x + dx)]);
        }
    }

    return neighbours.filter(Boolean);
}

function getCellIndexValues(values: Record<number, CellValue>, state: GameState, coord: Coord) {
    const value     = countMines(state, coord);
    const cellIndex = coord.y * state.config.width + coord.x;

    values[cellIndex] = value;

    if (value === 0) {
        const neighbours = getNeighbouringCells(state, coord);
        const unrevealedUnprocessedNeighbours = neighbours.filter((cell) => {
            const cellIndex = cell.coord.y * state.config.width + cell.coord.x;
            return !cell.revealed && !values.hasOwnProperty(cellIndex);
        });

        unrevealedUnprocessedNeighbours.forEach((cell) => {
            getCellIndexValues(values, state, cell.coord);
        });
    }
}

function countMines(state: GameState, coord: Coord): CellValue {
    let value: CellValue = 0;
    const neighbours = getNeighbouringCells(state, coord);

    neighbours.forEach((cell) => {
        if (cell.mine) {
            value++;
        }
    });

    return value;
}
