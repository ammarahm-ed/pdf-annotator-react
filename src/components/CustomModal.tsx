import type * as React from "react";

interface CustomModalProps {
	open: boolean;
	handleClose: () => void;
	children: React.ReactNode;
}

const CustomModal: React.FC<CustomModalProps> = ({
	open,
	handleClose,
	children,
}) => {
	if (!open) return null;

	return (
		<div className="fixed inset-0 z-50 overflow-y-auto">
			<div
				className="fixed inset-0 transition-opacity bg-black bg-opacity-50"
				onClick={handleClose}
				onKeyUp={(e: React.KeyboardEvent<HTMLDivElement>) => {
					if (e.key === "Enter" || e.key === " ") {
						handleClose();
					}
				}}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						handleClose();
					}
				}}
				onKeyPress={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						handleClose();
					}
				}}
			/>
			<div className="flex items-center justify-center min-h-full p-4">
				<div className="relative p-6 overflow-hidden transition-all transform bg-white rounded-md shadow-xl sm:rounded-md">
					<button
						type="button"
						onClick={handleClose}
						className="absolute p-1 text-gray-500 bg-gray-100 border border-gray-100 rounded-full -right-5 -top-5 hover:border-gray-200 hover:bg-gray-200"
						aria-label="close"
					>
						<svg
							className="w-5 h-5"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
					{children}
				</div>
			</div>
		</div>
	);
};

export default CustomModal;
