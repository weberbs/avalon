
import React from "react";
import { Player } from "../types/game";

type PlayerCardProps = {
	player: Player;
	isMe?: boolean;
	isEvilVisible?: boolean;
	isSelected?: boolean;
	onClick?: () => void;
	showLeader?: boolean;
	showVote?: string | null;
	showQuest?: string | null;
};

export default function PlayerCard({
	player,
	isMe,
	isEvilVisible,
	isSelected,
	onClick,
	showLeader = true,
	showVote,
	showQuest,
}: PlayerCardProps) {
	return (
		<div
			className={`flex flex-col items-center p-3 rounded-lg shadow border cursor-pointer transition-all
				${isSelected ? "bg-indigo-200 border-indigo-400" : "bg-white border-gray-200"}
				${isMe ? "ring-2 ring-indigo-500" : ""}
				${!player.isConnected ? "opacity-50" : ""}
			`}
			onClick={onClick}
		>
			<div className="font-semibold text-lg mb-1 flex items-center gap-1">
				{player.name}
				{showLeader && player.isLeader && (
					<span title="Leader" className="ml-1 text-yellow-500">👑</span>
				)}
				{isEvilVisible && player.alignment === "evil" && (
					<span title="Evil" className="ml-1 text-red-500">🕵️‍♂️</span>
				)}
			</div>
			{showVote && (
				<div className="text-xs mt-1">
					Vote: <span className={showVote === "approve" ? "text-green-600" : "text-red-600"}>{showVote}</span>
				</div>
			)}
			{showQuest && (
				<div className="text-xs mt-1">
					Quest: <span className={showQuest === "success" ? "text-green-600" : "text-red-600"}>{showQuest}</span>
				</div>
			)}
			{player.isReady && <div className="text-xs text-green-600 mt-1">Ready</div>}
			{!player.isConnected && <div className="text-xs text-red-500 mt-1">Disconnected</div>}
		</div>
	);
}