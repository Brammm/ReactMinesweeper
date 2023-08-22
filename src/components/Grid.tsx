import {Coord, Cell, GameState} from '../UseMines';
import {cx} from '../util';
import {FireIcon, FlagIcon} from '@heroicons/react/24/outline';
import {ReactNode} from 'react';

type Props = {
    gameState: GameState
    onUncover: (coord: Coord) => void;
    onMark: (coord: Coord) => void;
}

const Grid = ({gameState, onUncover, onMark}: Props) => {
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
                        onMark={() => onMark(cell.coord)}
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
                'block w-8 aspect-square rounded-sm',
                cell.mine ? (cell.revealed ? 'bg-red-300' : 'bg-red-500') : (cell.revealed ? 'bg-gray-300' : 'bg-gray-600'),
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
