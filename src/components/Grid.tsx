import {Coord, Cell, GameState} from '../UseMines';
import {cx} from '../util';

type Props = {
    gameState: GameState
    onClick: (coord: Coord) => void;
}

const Grid = ({gameState, onClick}: Props) => {
    const rows: Cell[][] = Object.values(gameState.cells).reduce((resultArray: Cell[][], cell: Cell, index: number) => {
        const chunkIndex = Math.floor(index/gameState.config.width)

        if(!resultArray[chunkIndex]) {
            resultArray[chunkIndex] = [] // start a new chunk
        }

        resultArray[chunkIndex].push(cell)

        return resultArray
    }, []);

    return (
        <div className="flex flex-col gap-px">
            {rows.map((row, index) => (
                <div className="flex gap-px justify-center" key={index}>
                    {row.map((cell) => <Grid.Cell
                        cell={cell}
                        key={`${cell.coord.x}-${cell.coord.y}`}
                        onClick={() => onClick(cell.coord)}
                    />)}
                </div>
            ))}
        </div>
    );
};

type GridCellProps = {
    cell: Cell;
    onClick: () => void;
}

Grid.Cell = ({cell, onClick}: GridCellProps) => {
    const isBomb = cell.status === 'bomb';

    let content = '';
    if (!cell.isCovered) {
        switch (cell.status) {
            case 'cell':
                content = cell.value > 0 ? cell.value.toString() : '';
        }
    }

    return (
        <button
            className={cx(
                'block w-8 aspect-square rounded-sm',
                isBomb ? (cell.isCovered ? 'bg-red-500' : 'bg-red-300'): (cell.isCovered ? 'bg-gray-600' : 'bg-gray-300'),
            )}
            onClick={() => {onClick()}}
        >
            {content}
        </button>
    );
};

export default Grid;
