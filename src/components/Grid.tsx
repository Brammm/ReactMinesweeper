import {Coord, Cell, GameState} from '../UseMines';
import {cx} from '../util';
import {FireIcon, FlagIcon} from '@heroicons/react/24/outline';
import {ReactNode} from 'react';

type Props = {
    gameState: GameState
    onUncover: (coord: Coord) => void;
    onFlag: (coord: Coord) => void;
}

const Grid = ({gameState, onUncover, onFlag}: Props) => {
    const rows: Cell[][] = Object.values(gameState.cells).reduce((resultArray: Cell[][], cell: Cell, index: number) => {
        const chunkIndex = Math.floor(index / gameState.config.width);

        if (!resultArray[chunkIndex]) {
            resultArray[chunkIndex] = []; // start a new chunk
        }

        resultArray[chunkIndex].push(cell);

        return resultArray;
    }, []);

    return (
        <div className="flex flex-col gap-px">
            {rows.map((row, index) => (
                <div className="flex gap-px justify-center" key={index}>
                    {row.map((cell) => <Grid.Cell
                        cell={cell}
                        key={`${cell.coord.x}-${cell.coord.y}`}
                        onUncover={() => onUncover(cell.coord)}
                        onMark={() => onFlag(cell.coord)}
                    />)}
                </div>
            ))}
        </div>
    );
};

type GridCellProps = {
    cell: Cell;
    onUncover: () => void;
    onMark: () => void;
}

Grid.Cell = ({cell, onUncover, onMark}: GridCellProps) => {
    let content: ReactNode = '';
    if (cell.flagged) {
        content = <FlagIcon className="w-5 text-white m-auto" />;
    } else if (cell.revealed) {
        if (cell.mine) {
            content = <FireIcon className="w-5 text-red-900 m-auto" />;
        } else {
            content = cell.value > 0 ? cell.value : '';
        }

    }

    return (
        <button
            className={cx(
                'block w-8 aspect-square rounded-sm font-bold',
                !cell.revealed ? 'bg-gray-600' : (cell.mine ? 'bg-red-300' : 'bg-gray-300'),
                !cell.mine && cell.value === 1 && 'text-blue-600',
                !cell.mine && cell.value === 2 && 'text-green-600',
                !cell.mine && cell.value === 3 && 'text-orange-600',
                !cell.mine && cell.value === 4 && 'text-indigo-600',
                !cell.mine && cell.value === 5 && 'text-red-600',
                !cell.mine && cell.value === 6 && 'text-teal-600',
                !cell.mine && cell.value === 7 && 'text-black',
                !cell.mine && cell.value === 8 && 'text-gray-600',
                // cell.mine ? (cell.revealed ? 'bg-red-300' : 'bg-red-500') : (cell.revealed ? 'bg-gray-300' : 'bg-gray-600'),
            )}
            onClick={() => {
                onUncover();
            }}
            onContextMenu={(e) => {
                e.preventDefault();
                onMark();
            }}
        >
            {content}
        </button>
    );
};

export default Grid;
