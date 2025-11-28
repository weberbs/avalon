
import React from "react";

type RoleRevealModalProps = {
	role: string;
	visibleRoles?: { [id: string]: string | null };
	onClose: () => void;
};

export default function RoleRevealModal({ role, visibleRoles, onClose }: RoleRevealModalProps) {
	return (
		<div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
			<div className="bg-white rounded-lg shadow-lg p-8 min-w-[300px] text-center">
				<h2 className="text-2xl font-bold mb-4">Your Role</h2>
				<div className="text-xl font-semibold mb-2">{role}</div>
				{visibleRoles && Object.keys(visibleRoles).length > 0 && (
					<div className="mb-4">
						<div className="font-semibold mb-1">You see:</div>
						<ul className="flex flex-col gap-1">
							{Object.entries(visibleRoles).map(([id, r]) => (
								<li key={id} className="text-base">{r}</li>
							))}
						</ul>
					</div>
				)}
				<button
					className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
					onClick={onClose}
				>
					Close
				</button>
			</div>
		</div>
	);
}