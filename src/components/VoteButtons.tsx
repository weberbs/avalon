
import React from "react";

type VoteButtonsProps = {
	onVote: (approve: boolean) => void;
	disabled?: boolean;
	voted?: boolean | null;
	approveLabel?: string;
	rejectLabel?: string;
};

export default function VoteButtons({ onVote, disabled, voted, approveLabel = "Approve", rejectLabel = "Reject" }: VoteButtonsProps) {
	return (
		<div className="flex gap-4 justify-center mt-4">
			<button
				className={`px-6 py-2 rounded font-semibold transition
					${voted === true ? "bg-green-600 text-white" : "bg-gray-200"}
				`}
				disabled={disabled}
				onClick={() => onVote(true)}
			>
				{approveLabel}
			</button>
			<button
				className={`px-6 py-2 rounded font-semibold transition
					${voted === false ? "bg-red-600 text-white" : "bg-gray-200"}
				`}
				disabled={disabled}
				onClick={() => onVote(false)}
			>
				{rejectLabel}
			</button>
		</div>
	);
}