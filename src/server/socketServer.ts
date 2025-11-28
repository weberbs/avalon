// Helper to ensure GameState shape for emission
function getGameState(game: any) {
	return {
		id: game.id,
		hostId: game.hostId,
		leaderId: game.players[game.currentLeaderIndex]?.id || game.leaderId,
		players: game.players,
		phase: game.phase,
		round: game.round,
		quests: game.quests,
		currentTeam: game.currentTeam,
		votes: game.votes,
		questVotes: game.questVotes,
		settings: game.settings,
		winner: game.winner,
		assassinationTarget: game.assassinationTarget,
	};
}
import { Server } from 'socket.io';
import { AvalonGame } from '../lib/gameLogic';
import { ClientToServerEvents, ServerToClientEvents, GameSettings, Player } from '../types/game';

const io = new Server<ClientToServerEvents, ServerToClientEvents>({
	cors: { origin: '*' },
});

const games: Record<string, AvalonGame> = {};

io.on('connection', (socket) => {
	let currentGameId: string | null = null;
	let currentPlayerId: string | null = null;

	socket.on('create-game', ({ hostName, settings }) => {
		const gameId = Math.random().toString(36).slice(2, 10);
		const host: Player = {
			id: socket.id,
			name: hostName,
			role: null,
			alignment: null,
			isLeader: false,
			isReady: false,
			isConnected: true,
		};
		const game = new AvalonGame(settings);
		// Patch: add id, hostId, leaderId to game instance
		(game as any).id = gameId;
		(game as any).hostId = socket.id;
		(game as any).leaderId = socket.id;
		game.addPlayer(host);
		games[gameId] = game;
		currentGameId = gameId;
		currentPlayerId = socket.id;
		socket.join(gameId);
		socket.emit('game-updated', { game: getGameState(game) });
	});

	socket.on('join-game', ({ gameId, playerName }) => {
		const game = games[gameId];
		if (!game) return socket.emit('error', { message: 'Game not found' });
		const player: Player = {
			id: socket.id,
			name: playerName,
			role: null,
			alignment: null,
			isLeader: false,
			isReady: false,
			isConnected: true,
		};
		try {
			game.addPlayer(player);
			currentGameId = gameId;
			currentPlayerId = socket.id;
			socket.join(gameId);
			io.to(gameId).emit('player-joined', { player });
			io.to(gameId).emit('game-updated', { game: getGameState(game) });
		} catch (e: any) {
			socket.emit('error', { message: e.message });
		}
	});

	socket.on('start-game', ({ gameId }) => {
		const game = games[gameId];
		if (!game) return socket.emit('error', { message: 'Game not found' });
		try {
			game.startGame();
			io.to(gameId).emit('game-updated', { game: getGameState(game) });
		} catch (e: any) {
			socket.emit('error', { message: e.message });
		}
	});

	socket.on('set-ready', ({ gameId, playerId, ready }) => {
		const game = games[gameId];
		if (!game) return socket.emit('error', { message: 'Game not found' });
		const player = game.players.find(p => p.id === playerId);
		if (player) player.isReady = ready;
		io.to(gameId).emit('game-updated', { game: getGameState(game) });
	});

	socket.on('propose-team', ({ gameId, leaderId, team }) => {
		const game = games[gameId];
		if (!game) return socket.emit('error', { message: 'Game not found' });
		try {
			game.proposeTeam(leaderId, team);
			io.to(gameId).emit('game-updated', { game: getGameState(game) });
		} catch (e: any) {
			socket.emit('error', { message: e.message });
		}
	});

	socket.on('vote-team', ({ gameId, playerId, approve }) => {
		const game = games[gameId];
		if (!game) return socket.emit('error', { message: 'Game not found' });
		try {
			game.voteOnProposal(playerId, approve);
			io.to(gameId).emit('game-updated', { game: getGameState(game) });
		} catch (e: any) {
			socket.emit('error', { message: e.message });
		}
	});

	socket.on('quest-vote', ({ gameId, playerId, result }) => {
		const game = games[gameId];
		if (!game) return socket.emit('error', { message: 'Game not found' });
		try {
			game.voteOnQuest(playerId, result);
			io.to(gameId).emit('game-updated', { game: getGameState(game) });
		} catch (e: any) {
			socket.emit('error', { message: e.message });
		}
	});

	socket.on('assassinate', ({ gameId, assassinId, targetId }) => {
		const game = games[gameId];
		if (!game) return socket.emit('error', { message: 'Game not found' });
		try {
			game.assassinate(assassinId, targetId);
			io.to(gameId).emit('game-updated', { game: getGameState(game) });
		} catch (e: any) {
			socket.emit('error', { message: e.message });
		}
	});

	socket.on('leave-game', ({ gameId, playerId }) => {
		const game = games[gameId];
		if (!game) return;
		game.players = game.players.filter(p => p.id !== playerId);
		io.to(gameId).emit('player-left', { playerId });
		io.to(gameId).emit('game-updated', { game: getGameState(game) });
		socket.leave(gameId);
	});

	socket.on('disconnect', () => {
		if (currentGameId && currentPlayerId) {
			const game = games[currentGameId];
			if (game) {
				const player = game.players.find(p => p.id === currentPlayerId);
				if (player) player.isConnected = false;
				io.to(currentGameId).emit('game-updated', { game: getGameState(game) });
			}
		}
	// Helper to ensure GameState shape for emission
	function getGameState(game: any) {
		return {
			id: game.id,
			hostId: game.hostId,
			leaderId: game.players[game.currentLeaderIndex]?.id || game.leaderId,
			players: game.players,
			phase: game.phase,
			round: game.round,
			quests: game.quests,
			currentTeam: game.currentTeam,
			votes: game.votes,
			questVotes: game.questVotes,
			settings: game.settings,
			winner: game.winner,
			assassinationTarget: game.assassinationTarget,
		};
	}
	});
});

export default io;