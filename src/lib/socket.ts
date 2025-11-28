
import { useEffect, useRef, useState } from 'react';
import socketIOClient from 'socket.io-client';
import { ClientToServerEvents, ServerToClientEvents, GameState, Player } from '../types/game';

const URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

type UseSocketResult = {
	socket: ReturnType<typeof socketIOClient>;
	gameState: GameState | null;
	players: Player[];
	myPlayerId: string | null;
	error: string | null;
};

export function useSocket(gameId: string, playerName: string, create?: boolean, settings?: any): UseSocketResult {
	const [gameState, setGameState] = useState<GameState | null>(null);
	const [players, setPlayers] = useState<Player[]>([]);
	const [myPlayerId, setMyPlayerId] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const socketRef = useRef<any>(null);

	useEffect(() => {
		const socket = socketIOClient(URL, { autoConnect: true });
		socketRef.current = socket;
		setMyPlayerId(socket.id);

		const handleGameUpdated = (payload: { game: GameState }) => {
			setGameState(payload.game);
			setPlayers(payload.game.players);
		};
		const handlePlayerJoined = (payload: { player: Player }) => {
			setPlayers(prev => [...prev, payload.player]);
		};
		const handlePlayerLeft = (payload: { playerId: string }) => {
			setPlayers(prev => prev.filter(p => p.id !== payload.playerId));
		};
		const handleError = (payload: { message: string }) => {
			setError(payload.message);
		};

		socket.on('game-updated', handleGameUpdated);
		socket.on('player-joined', handlePlayerJoined);
		socket.on('player-left', handlePlayerLeft);
		socket.on('error', handleError);

		if (create) {
			socket.emit('create-game', { hostName: playerName, settings });
		} else {
			socket.emit('join-game', { gameId, playerName });
		}

		return () => {
			socket.disconnect();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [gameId, playerName, create]);

	return {
		socket: socketRef.current!,
		gameState,
		players,
		myPlayerId,
		error,
	};
}