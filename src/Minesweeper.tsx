import Grid from './components/Grid';
import {Coord, useMines} from './UseMines';


function Minesweeper() {
    const [gameState, dispatch] = useMines({width: 16, height: 16, mines: 40});

    const handleNewGame = () => {
        dispatch({type: 'reset_game'});
    };

    const handleUncover = (origin: Coord) => {
        if (gameState.status === 'lost') {
            return;
        }

        if (gameState.status === 'idle') {
            dispatch({type: 'start_game', origin})
        }

        dispatch({type: 'uncover', clicked: origin});
    };

    const handleMark = (origin: Coord) => {
        if (gameState.status === 'idle') {
            return;
        }

        dispatch({type: 'mark', clicked: origin});
    };

    return (
        <div>
            <h1>
                Minesweeper
            </h1>
            <p>
                <button onClick={handleNewGame}>New game</button>
            </p>
            <Grid gameState={gameState} onUncover={handleUncover} onMark={handleMark} />
        </div>
    );
}

export default Minesweeper;
