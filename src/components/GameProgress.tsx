import {GameState} from '../UseMines';
import {ClockIcon, FlagIcon} from '@heroicons/react/24/outline';
import {useEffect, useMemo, useState} from 'react';

type Props = {
    gameState: GameState;
}

const GameProgress = ({gameState}: Props) => {
    const [gameTime, setGameTime] = useState<number>(0);

    useEffect(() => {
        let interval: number|undefined;
        if (gameState.status === 'in_progress') {
            interval = setInterval(() => {
                setGameTime((prevState) => prevState + 1);
            }, 1000);
        }

        if (gameState.status === 'won' || gameState.status === 'lost') {
            clearInterval(interval);
        }

        return () => clearInterval(interval);
    }, [gameState.status]);

    const flagCount = Object.values(gameState.cells).reduce((count, cell) => count + (cell.flagged ? 1 : 0), 0);
    const minutes = Math.floor(gameTime / 60);
    const seconds = (gameTime % 60);

    const humanReadableTime = useMemo(() => {
        let timeString = '';
        if (minutes > 0) {
            timeString += minutes + ' minute' + (minutes > 1 ? 's' : '') + ', ';
        }
        if (seconds > 0) {
            timeString += seconds + ' second' + (seconds > 1 ? 's' : '');
        }

        return timeString;
    }, [gameTime]);

    switch (gameState.status) {
        case 'idle':
            return 'Reveal your first square.';
        case 'in_progress':
            return (
                <>
                    <FlagIcon className="w-4 mr-1" />{flagCount}
                    <ClockIcon className="w-4 ml-4 mr-1" />{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
                </>
            );
        case 'won':
            return `You have won the game in ${humanReadableTime}!`;
        case 'lost':
            return `You lost the game after ${humanReadableTime}.`;
    }
};

export default GameProgress;
