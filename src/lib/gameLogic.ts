
import { Player, GamePhase, Role, Alignment, Quest, QuestResult, Vote, GameSettings } from '../types/game';

export class AvalonGame {
	players: Player[] = [];
	phase: GamePhase = 'lobby';
	currentLeaderIndex: number = 0;
	quests: Quest[] = [];
	round: number = 1;
	currentTeam: string[] = [];
	votes: Vote[] = [];
	questVotes: { playerId: string; result: QuestResult }[] = [];
	settings: GameSettings;
	winner: Alignment | null = null;
	assassinationTarget?: string | null;

	constructor(settings: GameSettings) {
		this.settings = settings;
	}

	addPlayer(player: Player) {
		if (this.phase !== 'lobby') throw new Error('Cannot join after game has started');
		if (this.players.find(p => p.id === player.id)) throw new Error('Player already exists');
		this.players.push({ ...player, isLeader: false, isReady: false, isConnected: true, role: null, alignment: null });
	}

	startGame() {
		if (this.players.length !== this.settings.numPlayers) throw new Error('Not enough players');
		this.assignRoles();
		this.phase = 'role-reveal';
		this.currentLeaderIndex = 0;
		this.quests = [];
		this.round = 1;
		this.currentTeam = [];
		this.votes = [];
		this.questVotes = [];
		this.winner = null;
		this.players.forEach((p, i) => (p.isLeader = i === 0));
	}

	private assignRoles() {
		const roles = [...this.settings.roles];
		if (roles.length !== this.players.length) throw new Error('Role count mismatch');
		// Shuffle roles
		for (let i = roles.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[roles[i], roles[j]] = [roles[j], roles[i]];
		}
		this.players.forEach((p, i) => {
			p.role = roles[i];
			p.alignment = this.getAlignment(roles[i]);
		});
	}

	private getAlignment(role: Role): Alignment {
		switch (role) {
			case 'Merlin':
			case 'Percival':
			case 'Loyal Servant':
				return 'good';
			default:
				return 'evil';
		}
	}

	proposeTeam(leaderId: string, team: string[]) {
		if (this.phase !== 'team-building') throw new Error('Not in team-building phase');
		const leader = this.players[this.currentLeaderIndex];
		if (leader.id !== leaderId) throw new Error('Not current leader');
		this.currentTeam = team;
		this.phase = 'voting';
		this.votes = [];
	}

	voteOnProposal(playerId: string, approve: boolean) {
		if (this.phase !== 'voting') throw new Error('Not in voting phase');
		if (this.votes.find(v => v.playerId === playerId)) throw new Error('Already voted');
		this.votes.push({ playerId, approve });
		if (this.votes.length === this.players.length) {
			const approved = this.votes.filter(v => v.approve).length > this.players.length / 2;
			if (approved) {
				this.phase = 'questing';
				this.questVotes = [];
			} else {
				this.nextLeader();
				this.phase = 'team-building';
				this.currentTeam = [];
				this.votes = [];
			}
		}
	}

	voteOnQuest(playerId: string, result: QuestResult) {
		if (this.phase !== 'questing') throw new Error('Not in questing phase');
		if (!this.currentTeam.includes(playerId)) throw new Error('Not on quest team');
		if (this.questVotes.find(v => v.playerId === playerId)) throw new Error('Already voted');
		this.questVotes.push({ playerId, result });
		if (this.questVotes.length === this.currentTeam.length) {
			const fails = this.questVotes.filter(v => v.result === 'fail').length;
			const questResult: QuestResult = fails > 0 ? 'fail' : 'success';
			this.quests.push({
				team: [...this.currentTeam],
				votes: [...this.votes],
				questVotes: [...this.questVotes],
				result: questResult,
			});
			this.round++;
			if (this.quests.filter(q => q.result === 'success').length === 3) {
				this.phase = 'assassination';
			} else if (this.quests.filter(q => q.result === 'fail').length === 3) {
				this.phase = 'game-over';
				this.winner = 'evil';
			} else {
				this.nextLeader();
				this.phase = 'team-building';
				this.currentTeam = [];
				this.votes = [];
				this.questVotes = [];
			}
		}
	}

	assassinate(assassinId: string, targetId: string) {
		if (this.phase !== 'assassination') throw new Error('Not in assassination phase');
		const assassin = this.players.find(p => p.id === assassinId && p.role === 'Assassin');
		if (!assassin) throw new Error('Not the assassin');
		this.assassinationTarget = targetId;
		const target = this.players.find(p => p.id === targetId);
		if (target && target.role === 'Merlin') {
			this.winner = 'evil';
		} else {
			this.winner = 'good';
		}
		this.phase = 'game-over';
	}

	getVisibleRolesForPlayer(playerId: string): { [id: string]: Role | null } {
		const player = this.players.find(p => p.id === playerId);
		if (!player || !player.role) return {};
		const visible: { [id: string]: Role | null } = {};
		// Merlin sees all evil except Mordred
		if (player.role === 'Merlin') {
			this.players.forEach(p => {
				if (p.role && this.getAlignment(p.role) === 'evil' && p.role !== 'Mordred') {
					visible[p.id] = p.role;
				}
			});
		}
		// Percival sees Merlin and Morgana (but not which is which)
		else if (player.role === 'Percival') {
			this.players.forEach(p => {
				if (p.role === 'Merlin' || p.role === 'Morgana') {
					visible[p.id] = p.role;
				}
			});
		}
		// Evil (except Oberon) see each other
		else if (this.getAlignment(player.role) === 'evil' && player.role !== 'Oberon') {
			this.players.forEach(p => {
				if (p.role && this.getAlignment(p.role) === 'evil' && p.role !== 'Oberon') {
					visible[p.id] = p.role;
				}
			});
		}
		// Oberon sees no one
		// Good sees no one
		return visible;
	}

	determineWinner(): Alignment | null {
		if (this.phase !== 'game-over') return null;
		return this.winner;
	}

	private nextLeader() {
		this.players[this.currentLeaderIndex].isLeader = false;
		this.currentLeaderIndex = (this.currentLeaderIndex + 1) % this.players.length;
		this.players[this.currentLeaderIndex].isLeader = true;
	}
}