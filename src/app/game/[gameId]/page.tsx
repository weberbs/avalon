
"use client";
import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useSocket } from "../../../lib/socket";

// Placeholder components (replace with real ones as needed)
const PlayerList = ({ players, leaderId }: any) => (
	<div className="mb-4">
		<h3 className="font-bold mb-2">Players</h3>
		<ul className="flex flex-wrap gap-2">
			{players.map((p: any) => (
				<li key={p.id} className={`px-3 py-1 rounded ${p.id === leaderId ? "bg-indigo-200" : "bg-gray-100"}`}>{p.name}</li>
			))}
		</ul>
	</div>
);
const QuestBoard = ({ quests }: any) => (
	<div className="mb-4">
		<h3 className="font-bold mb-2">Quests</h3>
		<div className="flex gap-2">
			{quests.map((q: any, i: number) => (
				<div key={i} className={`w-8 h-8 flex items-center justify-center rounded-full ${q.result === "success" ? "bg-green-300" : q.result === "fail" ? "bg-red-300" : "bg-gray-200"}`}>{i + 1}</div>
			))}
		</div>
	</div>
);
const ProposalTeam = ({ team, setTeam, players, max }: any) => (
	<div className="mb-4">
		<h3 className="font-bold mb-2">Select Team</h3>
		<div className="flex flex-wrap gap-2">
			{players.map((p: any) => (
				<button
					key={p.id}
					className={`px-3 py-1 rounded border ${team.includes(p.id) ? "bg-indigo-400 text-white" : "bg-gray-100"}`}
					onClick={() => {
						if (team.includes(p.id)) setTeam(team.filter((id: string) => id !== p.id));
						else if (team.length < max) setTeam([...team, p.id]);
					}}
				>
					{p.name}
				</button>
			))}
		</div>
	</div>
);
const RoleCard = ({ role, visibleRoles }: any) => (
	<div className="p-4 bg-white rounded shadow text-center">
		<div className="text-lg font-bold mb-2">Your Role: {role}</div>
		{visibleRoles && Object.keys(visibleRoles).length > 0 && (
			<div>
				<div className="font-semibold">You see:</div>
				<ul>
					{Object.entries(visibleRoles).map(([id, r]: any) => (
						<li key={id}>{r}</li>
					))}
				</ul>
			</div>
		)}
	</div>
);

export default function GamePage() {
	const params = useParams();
	const searchParams = useSearchParams();
	const router = useRouter();
	const gameId = params?.gameId as string;
	const playerName = searchParams.get("playerName") || searchParams.get("hostName") || "";
	const [showRole, setShowRole] = useState(true);
	const [proposalTeam, setProposalTeam] = useState<string[]>([]);
	const [vote, setVote] = useState<null | boolean>(null);
	const [questVote, setQuestVote] = useState<null | string>(null);
	const [assassinateTarget, setAssassinateTarget] = useState<string>("");

	// Use the custom useSocket hook
	const { socket, gameState, players, myPlayerId, error } = useSocket(gameId, playerName);

	useEffect(() => {
		if (!playerName) {
			// Prompt for name if not in URL
			const name = prompt("Enter your name:") || "Player";
			router.replace(`/game/${gameId}?playerName=${encodeURIComponent(name)}`);
		}
	}, [playerName, gameId, router]);

	if (!gameState) return <div className="p-8 text-center">Loading game...</div>;
	if (error) return <div className="p-8 text-center text-red-600">{error}</div>;

	const isHost = myPlayerId === gameState.hostId;
	const isLeader = myPlayerId === gameState.leaderId;
	const myPlayer = players.find((p: any) => p.id === myPlayerId);

	// Helper: get visible roles for player (stub, replace with real logic)
	const getVisibleRolesForPlayer = () => {
		// This should call the real logic from ganeLogic.ts, but for now just show empty
		return {};
	};

	// PHASES
	if (gameState.phase === "lobby") {
		return (
			<div className="max-w-2xl mx-auto p-6">
				<h1 className="text-2xl font-bold mb-2">Avalon Lobby</h1>
				<div className="mb-2">Game ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{gameId}</span></div>
				<PlayerList players={players} leaderId={gameState.leaderId} />
				{isHost && (
					<button
						className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
						onClick={() => socket.emit("start-game", { gameId })}
					>
						Start Game
					</button>
				)}
			</div>
		);
	}

	if (gameState.phase === "role-reveal" && myPlayer?.role) {
		return showRole ? (
			<div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
				<div>
					<RoleCard role={myPlayer.role} visibleRoles={getVisibleRolesForPlayer()} />
					<button className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded" onClick={() => setShowRole(false)}>
						Hide Role
					</button>
				</div>
			</div>
		) : null;
	}

	if (gameState.phase === "team-building" && isLeader) {
		// Assume team size = 3 for demo; replace with real logic
		const teamSize = 3;
		return (
			<div className="max-w-2xl mx-auto p-6">
				<h2 className="text-xl font-bold mb-2">Propose a Team</h2>
				<ProposalTeam team={proposalTeam} setTeam={setProposalTeam} players={players} max={teamSize} />
				<button
					className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded disabled:opacity-50"
					disabled={proposalTeam.length !== teamSize}
					onClick={() => socket.emit("propose-team", { gameId, leaderId: myPlayerId, team: proposalTeam })}
				>
					Propose Team
				</button>
			</div>
		);
	}

	if (gameState.phase === "voting") {
		return (
			<div className="max-w-2xl mx-auto p-6">
				<h2 className="text-xl font-bold mb-2">Vote on Team Proposal</h2>
				<div className="flex gap-4">
					<button
						className={`px-6 py-2 rounded ${vote === true ? "bg-green-600 text-white" : "bg-gray-200"}`}
						onClick={() => { setVote(true); socket.emit("vote-team", { gameId, playerId: myPlayerId, approve: true }); }}
					>
						Approve
					</button>
					<button
						className={`px-6 py-2 rounded ${vote === false ? "bg-red-600 text-white" : "bg-gray-200"}`}
						onClick={() => { setVote(false); socket.emit("vote-team", { gameId, playerId: myPlayerId, approve: false }); }}
					>
						Reject
					</button>
				</div>
			</div>
		);
	}

	if (gameState.phase === "questing" && myPlayerId && gameState.currentTeam.includes(myPlayerId)) {
		const isEvil = myPlayer?.alignment === "evil";
		return (
			<div className="max-w-2xl mx-auto p-6">
				<h2 className="text-xl font-bold mb-2">Quest Vote</h2>
				<div className="flex gap-4">
					<button
						className={`px-6 py-2 rounded ${questVote === "success" ? "bg-green-600 text-white" : "bg-gray-200"}`}
						onClick={() => { setQuestVote("success"); socket.emit("quest-vote", { gameId, playerId: myPlayerId, result: "success" }); }}
					>
						Success
					</button>
					{isEvil && (
						<button
							className={`px-6 py-2 rounded ${questVote === "fail" ? "bg-red-600 text-white" : "bg-gray-200"}`}
							onClick={() => { setQuestVote("fail"); socket.emit("quest-vote", { gameId, playerId: myPlayerId, result: "fail" }); }}
						>
							Fail
						</button>
					)}
				</div>
			</div>
		);
	}

	if (gameState.phase === "assassination" && myPlayer?.alignment === "evil") {
		return (
			<div className="max-w-2xl mx-auto p-6">
				<h2 className="text-xl font-bold mb-2">Assassinate Merlin</h2>
				<div className="flex flex-wrap gap-2 mb-4">
					{players.filter((p: any) => p.alignment === "good").map((p: any) => (
						<button
							key={p.id}
							className={`px-3 py-1 rounded border ${assassinateTarget === p.id ? "bg-indigo-400 text-white" : "bg-gray-100"}`}
							onClick={() => setAssassinateTarget(p.id)}
						>
							{p.name}
						</button>
					))}
				</div>
				<button
					className="px-6 py-2 bg-indigo-600 text-white rounded disabled:opacity-50"
					disabled={!assassinateTarget}
					onClick={() => socket.emit("assassinate", { gameId, assassinId: myPlayerId, targetId: assassinateTarget })}
				>
					Assassinate
				</button>
			</div>
		);
	}

	if (gameState.phase === "game-over") {
		return (
			<div className="max-w-2xl mx-auto p-6 text-center">
				<h2 className="text-2xl font-bold mb-4">Game Over</h2>
				<div className="mb-2">Winner: <span className="font-bold text-lg">{gameState.winner?.toUpperCase()}</span></div>
				<div className="mb-4">Roles:</div>
				<ul className="flex flex-wrap gap-2 justify-center">
					{players.map((p: any) => (
						<li key={p.id} className="px-3 py-1 rounded bg-gray-100">
							{p.name}: <span className="font-mono">{p.role}</span>
						</li>
					))}
				</ul>
			</div>
		);
	}

	// Default: show quest board and player list
	return (
		<div className="max-w-2xl mx-auto p-6">
			<PlayerList players={players} leaderId={gameState.leaderId} />
			<QuestBoard quests={gameState.quests} />
			<div className="mt-8 text-center text-gray-500">Waiting for next phase...</div>
		</div>
	);
}