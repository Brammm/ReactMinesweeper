import {useState} from 'react';
import {shuffle} from './util';

type Config = {
    width: number;
    height: number;
    mines: number;
}

type GameState = {
    status: 'idle' | 'in_progress';
    cells: Cell[];
};

type Coord = {
    x: number;
    y: number;
};

type Cell = {
    coord: Coord;
    status: 'covered' | 'bomb';
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

function generateCells(config: Config, mines: Coord[]): Cell[] {
    let cells: Cell[] = [];

    for (let x = 0; x < config.width; x++) {
        for (let y = 0; y < config.height; y++) {
            const coord = {x, y};

            const isMine = mines.find((mine) => mine.x === coord.x && mine.y === coord.y);

            cells.push({coord, status: isMine ? 'bomb' : 'covered'});
        }
    }

    return cells;
}

function Minesweeper() {
    const [config, setConfig] = useState<Config>({width: 16, height: 16, mines: 40});
    const [gameState, setGameState] = useState<GameState>({status: 'idle', cells: generateCells(config, [])});

    const handleNewGame = () => {
        setGameState({status: 'idle', cells: generateCells(config, [])});
    };

    const handleClick = (origin: Coord) => () => {
        if (gameState.status === 'idle') {
            setGameState({status: 'in_progress', cells: generateCells(config, generateMines(config, origin))});
        }
    };

    return (
        <div>
            <h1>
                Minesweeper
            </h1>
            <p>
                <button onClick={handleNewGame}>New game</button>
            </p>
            <div className={`grid border-l border-t border-gray-400 grid-cols-16`}>
                {gameState.cells.map(({status, coord: {x, y}}) => {
                        const isBomb = status === 'bomb';

                        let className = 'border-b border-r border-gray-400';
                        if (isBomb) {
                            className += ' bg-red-500';
                        }

                        return (
                            <button className={className} key={`${x}-${y}`} onClick={handleClick({x, y})}>
                                <CellContent cell={{coord: {x, y}, status}} />
                            </button>
                        );
                    },
                )}
            </div>
        </div>
    );
}

function CellContent({cell}: {cell: Cell}) {
    return 'i';
}

export default Minesweeper;
