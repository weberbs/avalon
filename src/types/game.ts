
// --- Core Types ---

export type Alignment = 'good' | 'evil';

export type Role =
	| 'Merlin'
	| 'Percival'
	| 'Loyal Servant'
	| 'Morgana'
	| 'Mordred'
	| 'Assassin'
	| 'Oberon'
	| 'Minion of Mordred';

export interface Player {
	id: string;
	name: string;
	role: Role | null;
	alignment: Alignment | null;
	isLeader: boolean;
	isReady: boolean;
	isConnected: boolean;
}

export type GamePhase =
	| 'lobby'
	| 'role-reveal'
	| 'team-building'
	| 'voting'
	| 'questing'
	| 'assassination'
	| 'game-over';

export type QuestResult = 'success' | 'fail';

export interface Vote {
	playerId: string;
	approve: boolean;
}

export interface QuestVote {
	playerId: string;
	result: QuestResult;
}

export interface Quest {
	team: string[]; // array of playerIds
	votes: Vote[];
	questVotes: QuestVote[];
	result: QuestResult | null;
}

export interface GameState {
	id: string;
	hostId: string;
	players: Player[];
	phase: GamePhase;
	round: number;
	leaderId: string;
	quests: Quest[];
	currentTeam: string[]; // playerIds
	votes: Vote[];
	questVotes: QuestVote[];
	settings: GameSettings;
	winner: Alignment | null;
	assassinationTarget?: string | null; // playerId
}

export interface GameSettings {
	roles: Role[];
	numPlayers: number;
}

// --- Socket Events ---

// Client → Server
export interface ClientToServerEvents {
	'create-game': (payload: { hostName: string; settings: GameSettings }) => void;
	'join-game': (payload: { gameId: string; playerName: string }) => void;
	'start-game': (payload: { gameId: string }) => void;
	'set-ready': (payload: { gameId: string; playerId: string; ready: boolean }) => void;
	'propose-team': (payload: { gameId: string; leaderId: string; team: string[] }) => void;
	'vote-team': (payload: { gameId: string; playerId: string; approve: boolean }) => void;
	'quest-vote': (payload: { gameId: string; playerId: string; result: QuestResult }) => void;
	'assassinate': (payload: { gameId: string; assassinId: string; targetId: string }) => void;
	'leave-game': (payload: { gameId: string; playerId: string }) => void;
}

// Server → Client
export interface ServerToClientEvents {
	'game-updated': (payload: { game: GameState }) => void;
	'player-joined': (payload: { player: Player }) => void;
	'player-left': (payload: { playerId: string }) => void;
	'error': (payload: { message: string }) => void;
}