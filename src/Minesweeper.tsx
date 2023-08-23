import Grid from './components/Grid';
import {Coord, useMines} from './UseMines';


function Minesweeper() {
    const [gameState, dispatch] = useMines({width: 16, height: 16, mines: 40});

    const handleNewGame = () => {
        dispatch({type: 'reset_game'});
    };

    const handleUncover = (origin: Coord) => {
        dispatch({type: 'uncover', clicked: origin});
    };

    const handleFlag = (origin: Coord) => {
        if (gameState.status === 'idle') {
            return;
        }

        dispatch({type: 'flag', clicked: origin});
    };

    return (
        <div>
            <h1>
                Minesweeper
            </h1>
            <p>
                {gameState.status === 'lost' && 'You lost the game!'}
                <button onClick={handleNewGame}>New game</button>
            </p>
            <Grid gameState={gameState} onUncover={handleUncover} onFlag={handleFlag} />
        </div>
    );
}

export default Minesweeper;
