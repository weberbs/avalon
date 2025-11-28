
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

function generateGameId() {
  return Math.random().toString(36).slice(2, 10);
}

export default function HomePage() {
  const router = useRouter();
  const [joinGameId, setJoinGameId] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [createName, setCreateName] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createName) return;
    const gameId = generateGameId();
    router.push(`/game/${gameId}?hostName=${encodeURIComponent(createName)}`);
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinGameId || !playerName) return;
    router.push(`/game/${joinGameId}?playerName=${encodeURIComponent(playerName)}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200 p-4">
      <div className="flex flex-col md:flex-row gap-8 w-full max-w-3xl">
        {/* Create Game Card */}
        <form
          onSubmit={handleCreate}
          className="bg-white rounded-xl shadow-lg p-8 flex-1 flex flex-col items-center"
        >
          <h2 className="text-2xl font-bold mb-4">Create New Game</h2>
          <input
            type="text"
            placeholder="Your Name"
            className="input input-bordered w-full max-w-xs mb-4 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
            value={createName}
            onChange={e => setCreateName(e.target.value)}
            required
          />
          <button
            type="submit"
            className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 transition font-semibold"
          >
            Create Game
          </button>
        </form>

        {/* Join Game Card */}
        <form
          onSubmit={handleJoin}
          className="bg-white rounded-xl shadow-lg p-8 flex-1 flex flex-col items-center"
        >
          <h2 className="text-2xl font-bold mb-4">Join Existing Game</h2>
          <input
            type="text"
            placeholder="Game ID"
            className="input input-bordered w-full max-w-xs mb-4 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
            value={joinGameId}
            onChange={e => setJoinGameId(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Your Name"
            className="input input-bordered w-full max-w-xs mb-4 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
            value={playerName}
            onChange={e => setPlayerName(e.target.value)}
            required
          />
          <button
            type="submit"
            className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 transition font-semibold"
          >
            Join Game
          </button>
        </form>
      </div>
    </div>
  );
}
