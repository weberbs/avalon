
import React from "react";
import { Quest } from "../types/game";

// Standard Avalon quest team sizes and fail requirements by player count
const QUEST_CONFIG: Record<number, { teamSizes: number[]; failsRequired: number[] }> = {
	5: { teamSizes: [2, 3, 2, 3, 3], failsRequired: [1, 1, 1, 2, 1] },
	6: { teamSizes: [2, 3, 4, 3, 4], failsRequired: [1, 1, 1, 2, 1] },
	7: { teamSizes: [2, 3, 3, 4, 4], failsRequired: [1, 1, 1, 2, 1] },
	8: { teamSizes: [3, 4, 4, 5, 5], failsRequired: [1, 1, 1, 2, 1] },
	9: { teamSizes: [3, 4, 4, 5, 5], failsRequired: [1, 1, 1, 2, 1] },
 10: { teamSizes: [3, 4, 4, 5, 5], failsRequired: [1, 1, 1, 2, 1] },
};

type QuestBoardProps = {
	quests: Quest[];
	numPlayers: number;
};

export default function QuestBoard({ quests, numPlayers }: QuestBoardProps) {
	const config = QUEST_CONFIG[numPlayers] || QUEST_CONFIG[5];
	const currentQuest = quests.length;
	return (
		<div className="flex gap-4 justify-center my-4">
			{Array.from({ length: 5 }).map((_, i) => {
				const quest = quests[i];
				const isCurrent = i === currentQuest;
				const result = quest?.result;
				const failsNeeded = config.failsRequired[i];
				return (
					<div
						key={i}
						className={`flex flex-col items-center w-16 p-2 rounded-lg border-2
							${result === "success" ? "border-green-500 bg-green-100" : result === "fail" ? "border-red-500 bg-red-100" : isCurrent ? "border-indigo-400 bg-indigo-50" : "border-gray-200 bg-white"}
						`}
					>
						<div className="font-bold text-lg">{i + 1}</div>
						<div className="text-xs mb-1">Team: {config.teamSizes[i]}</div>
						<div className="text-xs mb-1">Fails: {failsNeeded}</div>
						<div className="text-xl">
							{result === "success" && "✅"}
							{result === "fail" && "❌"}
							{!result && isCurrent && "⬤"}
						</div>
					</div>
				);
			})}
		</div>
	);
}