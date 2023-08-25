import {Coord, useMines} from './UseMines';
import Grid from './components/Grid';
import {Menu} from '@headlessui/react';
import {EllipsisVerticalIcon, SparklesIcon} from '@heroicons/react/24/outline';
import {cx} from './util';
import GameProgress from './components/GameProgress';

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
        <div className="flex flex-col w-fit m-auto">
            <div className="flex justify-between lg:mt-12 mb-8">
                <h1 className="text-xl text-gray-600 font-extrabold">
                    Minesweeper
                </h1>
                <Menu as="div" className="relative inline-block text-left">
                    <Menu.Button className="text-gray-500 hover:text-gray-900"><EllipsisVerticalIcon className="w-5 h-5" /></Menu.Button>
                    <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <Menu.Item>
                            {({active}) => (
                                <button className={cx(active ? 'bg-blue-500 text-white' : 'text-gray-900', 'group' +
                                    ' flex w-full items-center rounded-md px-2 py-2 text-sm')} onClick={handleNewGame}>
                                    <SparklesIcon className="mr-2 h-5 w-5 text-blue-300" />
                                    New game</button>
                            )}
                        </Menu.Item>
                    </Menu.Items>
                </Menu>
            </div>
            <Grid gameState={gameState} onUncover={handleUncover} onFlag={handleFlag} />
            <p className="flex justify-center mt-2">
                <GameProgress gameState={gameState} />
            </p>
        </div>
    );
}

export default Minesweeper;
