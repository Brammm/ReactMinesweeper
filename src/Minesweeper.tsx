import {useState} from 'react';
import Grid from './components/Grid';
import {Config, Coord, useMines} from './UseMines';


function Minesweeper() {
    const [config, setConfig] = useState<Config>({width: 16, height: 16, mines: 40});
    const [gameState, dispatch] = useMines(config);

    const handleNewGame = () => {
        dispatch({type: 'reset_game'});
    };

    const handleClick = (origin: Coord) => {
        if (gameState.status === 'idle') {
            dispatch({type: 'start_game', origin})
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
            <Grid cells={gameState.cells} config={config} onClick={handleClick} />
        </div>
    );
}

export default Minesweeper;
