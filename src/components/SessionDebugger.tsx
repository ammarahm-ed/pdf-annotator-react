import type React from "react";
import type { AnnotationSession, SessionControls } from "../types";

interface SessionDebuggerProps {
	annotationSession: AnnotationSession | null;
	sessionControls: SessionControls | null;
	position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

export const SessionDebugger: React.FC<SessionDebuggerProps> = ({
	annotationSession,
	sessionControls,
	position = "bottom-left",
}) => {
	const positionClasses = {
		"top-left": "top-4 left-4",
		"top-right": "top-4 right-4",
		"bottom-left": "bottom-4 left-4",
		"bottom-right": "bottom-4 right-4",
	};

	if (!annotationSession) return null;

	return (
		<div
			className={`fixed ${positionClasses[position]} z-50 bg-black bg-opacity-80 text-white p-4 rounded-lg font-mono text-xs max-w-sm`}
		>
			<div className="mb-2 font-bold text-yellow-300">
				🐛 Session Debug Info
			</div>

			<div className="space-y-1">
				<div>
					<span className="text-blue-300">Active:</span>
					<span
						className={
							annotationSession.isActive ? "text-green-400" : "text-red-400"
						}
					>
						{annotationSession.isActive ? "YES" : "NO"}
					</span>
				</div>

				<div>
					<span className="text-blue-300">Page:</span>
					<span className="text-yellow-400">{annotationSession.pageIndex}</span>
				</div>

				<div>
					<span className="text-blue-300">Strokes:</span>
					<span className="text-green-400">
						{annotationSession.strokes.length}
					</span>
				</div>

				<div>
					<span className="text-blue-300">Current Stroke:</span>
					<span className="text-purple-400">
						{annotationSession.currentStroke.length} points
					</span>
				</div>

				<div>
					<span className="text-blue-300">Bounding Box:</span>
					<span className="text-orange-400">
						{annotationSession.boundingBox ? "YES" : "NO"}
					</span>
				</div>

				{annotationSession.boundingBox && (
					<div className="pl-2 text-xs text-gray-300">
						x: {annotationSession.boundingBox.x.toFixed(3)}
						<br />
						y: {annotationSession.boundingBox.y.toFixed(3)}
						<br />
						w: {annotationSession.boundingBox.width.toFixed(3)}
						<br />
						h: {annotationSession.boundingBox.height.toFixed(3)}
					</div>
				)}

				<div>
					<span className="text-blue-300">Started:</span>
					<span className="text-gray-400">
						{annotationSession.startTime.toLocaleTimeString()}
					</span>
				</div>
			</div>

			{sessionControls && annotationSession.isActive && (
				<div className="mt-3 space-y-1">
					<div className="font-bold text-yellow-300">Controls Available:</div>
					<div className="grid grid-cols-2 gap-1">
						<button
							onClick={sessionControls.finalize}
							className="px-2 py-1 text-xs bg-green-600 rounded hover:bg-green-700"
						>
							✓ Save
						</button>
						<button
							onClick={sessionControls.cancel}
							className="px-2 py-1 text-xs bg-red-600 rounded hover:bg-red-700"
						>
							✗ Cancel
						</button>
						<button
							onClick={sessionControls.undoLastStroke}
							className="col-span-2 px-2 py-1 text-xs bg-blue-600 rounded hover:bg-blue-700"
							disabled={annotationSession.strokes.length === 0}
						>
							↶ Undo Last
						</button>
					</div>
				</div>
			)}
		</div>
	);
};
