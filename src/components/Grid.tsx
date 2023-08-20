import {Config, Coord, Cell} from '../UseMines';
import {cx} from '../util';

type Props = {
    cells: Cell[];
    config: Config;
    onClick: (coord: Coord) => void;
}

const Grid = ({cells, config, onClick}: Props) => {
    const rows: Cell[][] = cells.reduce((resultArray: Cell[][], cell: Cell, index: number) => {
        const chunkIndex = Math.floor(index/config.width)

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


    return (
        <button
            className={cx(
                'block w-8 aspect-square rounded-sm',
                isBomb ? 'bg-red-500' : 'bg-gray-600',
            )}
            onClick={() => {onClick()}}
        >
            {''}
        </button>
    );
};

export default Grid;
