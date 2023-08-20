import {shuffle} from './util';
import {useReducer} from 'react';

export type Config = {
    width: number;
    height: number;
    mines: number;
}

export type GameState = {
    config: Config;
    status: 'idle' | 'in_progress';
    cells: Cell[];
};

export type Coord = {
    x: number;
    y: number;
};

export type Cell = {
    coord: Coord;
    isCovered: boolean;
    status: 'bomb' | 'cell' | 'flag';
} | {
    coord: Coord;
    isCovered: false;
    status: 'cell';
    value: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
}

export type GameAction = {
    type: 'reset_game';
} | {
    type: 'start_game';
    origin: Coord;
}

function MinesReducer (state: GameState, action: GameAction): GameState {
    switch (action.type) {
        case 'reset_game':
            return {...state, status: 'idle', cells: generateGrid(state.config, [])};
        case 'start_game':
            return {...state, status: 'idle', cells: generateGrid(state.config, generateMines(state.config, action.origin))};
    }
}

export function useMines(config: Config) {
    return useReducer(
        MinesReducer,
        {config, status: 'idle', cells: generateGrid(config, [])}
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

function generateGrid(config: Config, mines: Coord[]): Cell[] {
    let cells: Cell[] = [];

    for (let x = 0; x < config.width; x++) {
        for (let y = 0; y < config.height; y++) {
            const coord = {x, y};

            const isMine = mines.find((mine) => mine.x === coord.x && mine.y === coord.y);

            cells.push({coord, status: isMine ? 'bomb' : 'cell', isCovered: true});
        }
    }

    return cells;
}
