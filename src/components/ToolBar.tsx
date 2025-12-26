import type { CompetenciaInterface } from "lingapp-revisao-redacao";
import type React from "react";
import { useState } from "react";
import {
	FaMarker,
	FaPencilAlt,
	FaSquare,
	// FaHighlighter,
	// FaUnderline,
	FaStrikethrough,
	// FaSlidersH
} from "react-icons/fa";
import {
	IoAddOutline,
	IoChevronBack,
	IoChevronForward,
	IoHandRightOutline,
	// IoCaretDown,
	// IoResize,
	IoMenuOutline,
	// IoTextOutline,
	// IoChatbubbleOutline,
	// IoPinOutline,
	IoRemoveOutline,
} from "react-icons/io5";
import { AnnotationMode } from "../types";
import ThicknessDropdown from "./ThicknessDropdown";

interface ToolBarProps {
	currentMode: AnnotationMode;
	onModeChange: (mode: AnnotationMode) => void;
	currentPage: number;
	numPages: number;
	onPageChange: (page: number) => void;
	currentCategory?: CompetenciaInterface;
	onCategoryChange?: (category: CompetenciaInterface | undefined) => void;
	customCategories?: CompetenciaInterface[];
	scale: number;
	onScaleChange: (scale: number) => void;
	onFitToWidth?: () => void;
	currentThickness?: number;
	onThicknessChange?: (thickness: number) => void;
	viewOnly?: boolean;
}

export const ToolBar: React.FC<ToolBarProps> = ({
	currentMode,
	onModeChange,
	currentPage,
	numPages,
	onPageChange,
	currentCategory,
	onCategoryChange,
	customCategories = [],
	scale,
	onScaleChange,
	onFitToWidth,
	currentThickness = 8,
	onThicknessChange,
	viewOnly = false,
}) => {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	const handleZoomIn = () => {
		onScaleChange(Math.min(scale + 0.2, 3.0));
	};

	const handleZoomOut = () => {
		onScaleChange(Math.max(scale - 0.2, 0.5));
	};

	const handleZoomReset = () => {
		if (onFitToWidth) {
			onFitToWidth();
		} else {
			onScaleChange(1.0);
		}
	};

	const zoomPercentage = Math.round(scale * 100);

	// Handle category change
	const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const categoryId = Number.parseInt(e.target.value, 10);
		// Find the category item that matches the selected ID
		const selectedCategory = customCategories.find(
			(cat) => cat.competencia === categoryId,
		);
		// console.log('selectedCategory', selectedCategory);
		if (onCategoryChange) {
			// Pass undefined when no category is selected (empty value)
			onCategoryChange(selectedCategory || undefined);
		}
	};

	// Handle thickness change
	const handleThicknessChange = (thickness: number) => {
		if (onThicknessChange) {
			onThicknessChange(thickness);
		}
	};

	// Show thickness selector only for relevant modes
	const shouldShowThicknessSelector = [
		AnnotationMode.DRAWING,
		AnnotationMode.HIGHLIGHTING,
		AnnotationMode.RECTANGLE,
	].includes(currentMode);

	// Rendering sections based on screen size
	const renderDrawingTools = () => (
		<div className="flex items-center space-x-2">
			<button
				type="button"
				className={`p-2 rounded-md border border-gray-300 ${
					currentMode === AnnotationMode.NONE
						? "bg-blue-100 border-blue-400"
						: "bg-white hover:bg-gray-50"
				}`}
				onClick={() => onModeChange(AnnotationMode.NONE)}
				title="Ferramenta de Seleção"
			>
				<IoHandRightOutline size={18} />
			</button>

			<div className="hidden h-8 mx-1 border-r border-gray-300 sm:block" />

			<button
				type="button"
				className={`p-2 rounded-md border border-gray-300 ${
					currentMode === AnnotationMode.STRIKEOUT
						? "bg-blue-100 border-blue-400"
						: "bg-white hover:bg-gray-50"
				}`}
				onClick={() => onModeChange(AnnotationMode.STRIKEOUT)}
				title="Riscar Texto"
			>
				<FaStrikethrough size={16} />
			</button>

			<div className="hidden h-8 mx-1 border-r border-gray-300 sm:block" />

			<button
				type="button"
				className={`p-2 rounded-md border border-gray-300 ${
					currentMode === AnnotationMode.RECTANGLE
						? "bg-blue-100 border-blue-400"
						: "bg-white hover:bg-gray-50"
				}`}
				onClick={() => onModeChange(AnnotationMode.RECTANGLE)}
				title="Desenhar Retângulo"
			>
				<FaSquare size={16} />
			</button>

			<button
				type="button"
				className={`p-2 rounded-md border border-gray-300 ${
					currentMode === AnnotationMode.DRAWING
						? "bg-blue-100 border-blue-400"
						: "bg-white hover:bg-gray-50"
				}`}
				onClick={() => onModeChange(AnnotationMode.DRAWING)}
				title="Desenho Livre"
			>
				<FaPencilAlt size={16} />
			</button>

			<button
				type="button"
				className={`p-2 rounded-md border border-gray-300 ${
					currentMode === AnnotationMode.HIGHLIGHTING
						? "bg-blue-100 border-blue-400"
						: "bg-white hover:bg-gray-50"
				}`}
				onClick={() => onModeChange(AnnotationMode.HIGHLIGHTING)}
				title="Marcador"
			>
				<FaMarker size={16} />
			</button>
		</div>
	);

	const renderCategorySelector = () => (
		<div className="relative flex items-center">
			<select
				value={currentCategory?.competencia.toString() || ""}
				onChange={handleCategoryChange}
				className="appearance-none bg-white border border-gray-300 rounded-md py-1.5 pl-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
				style={{
					borderBottom: currentCategory
						? `3px solid ${currentCategory.color || "transparent"}`
						: undefined,
				}}
			>
				<option value="">Filtrar por Categoria</option>
				{customCategories.map((category) => (
					<option key={category.competencia} value={category.competencia}>
						{category.displayName}
					</option>
				))}
			</select>

			{currentCategory && (
				<button
					type="button"
					onClick={() => onCategoryChange?.(undefined)}
					className="p-2 ml-2 border border-gray-300 rounded-md"
					title="Limpar filtro"
				>
					<IoRemoveOutline size={14} className="mr-1" />
					<span className="hidden sm:inline">Limpar</span>
				</button>
			)}
		</div>
	);

	const renderZoomControls = () => (
		<div className="flex items-center bg-white border border-gray-300 rounded-md">
			<button
				type="button"
				onClick={handleZoomOut}
				className="flex items-center justify-center px-2 py-1 border-r border-gray-300 hover:bg-gray-100"
				title="Diminuir Zoom"
			>
				<IoRemoveOutline size={16} />
			</button>
			<button
				type="button"
				onClick={handleZoomReset}
				className="px-2 py-1 text-xs border-r border-gray-300 hover:bg-gray-100 sm:text-sm"
				title="Redefinir Zoom"
			>
				{zoomPercentage}%
			</button>
			<button
				type="button"
				onClick={handleZoomIn}
				className="flex items-center justify-center px-2 py-1 hover:bg-gray-100"
				title="Aumentar Zoom"
			>
				<IoAddOutline size={16} />
			</button>
		</div>
	);

	const renderPageNavigation = () => (
		<div className="flex items-center bg-white border border-gray-300 rounded-md">
			<button
				type="button"
				onClick={() => onPageChange(currentPage - 1)}
				disabled={currentPage <= 1}
				className={`px-2 py-1 border-r border-gray-300 flex items-center justify-center ${
					currentPage <= 1
						? "opacity-50 cursor-not-allowed"
						: "hover:bg-gray-100"
				}`}
				title="Página Anterior"
			>
				<IoChevronBack size={16} />
			</button>
			<span className="px-3 py-1 text-xs sm:text-sm">
				{currentPage}/{numPages}
			</span>
			<button
				type="button"
				onClick={() => onPageChange(currentPage + 1)}
				disabled={currentPage >= numPages}
				className={`px-2 py-1 flex items-center justify-center ${
					currentPage >= numPages
						? "opacity-50 cursor-not-allowed"
						: "hover:bg-gray-100"
				}`}
				title="Próxima Página"
			>
				<IoChevronForward size={16} />
			</button>
		</div>
	);

	return (
		<div className="transition-shadow duration-200 bg-white toolbar">
			{/* Main toolbar with essential tools */}
			<div className="flex flex-col items-center justify-between px-2 py-2 border-b border-gray-200 md:flex-row md:flex-wrap sm:px-4">
				{/* Mobile menu toggle - visible only on small screens */}
				<div className="flex items-center justify-between w-full mb-2 md:hidden">
					<button
						type="button"
						onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
						className="p-2 bg-gray-100 rounded-md"
					>
						<IoMenuOutline size={20} />
					</button>

					<div className="flex space-x-2">
						{renderZoomControls()}
						{renderPageNavigation()}
					</div>
				</div>

				{/* Mobile expanded menu */}
				{mobileMenuOpen && (
					<div className="flex flex-col w-full mb-2 space-y-2 md:hidden">
						{!viewOnly && (
							<>
								<div className="flex items-center justify-between">
									{renderDrawingTools()}
								</div>

								<div className="flex flex-col space-y-2">
									{renderCategorySelector()}
									{!viewOnly && shouldShowThicknessSelector && (
										<div className="w-full mt-2">
											<ThicknessDropdown
												currentThickness={currentThickness}
												handleThicknessChange={handleThicknessChange}
											/>
										</div>
									)}
								</div>
							</>
						)}
					</div>
				)}

						<span>teste</span>
				{/* Desktop layout - hidden on small screens */}
				<div className="hidden md:flex md:items-center md:space-x-4">
					{/* Category selector dropdown */}
					<div className="flex items-center space-x-4">
						{renderCategorySelector()}
						{/* Thickness selector - only show when in drawing, highlighting or rectangle mode */}
						{!viewOnly && shouldShowThicknessSelector && (
							<ThicknessDropdown
								currentThickness={currentThickness}
								handleThicknessChange={handleThicknessChange}
							/>
						)}
					</div>
				</div>

				{!viewOnly && (
					<div className="hidden md:flex md:items-center md:space-x-2">
						{renderDrawingTools()}
					</div>
				)}

				{/* Page navigation and zoom controls - always visible on desktop */}
				<div className="hidden md:flex md:items-center md:space-x-4">
					<div className="flex items-center space-x-4">
						{renderZoomControls()}
						{renderPageNavigation()}
					</div>
				</div>
			</div>
		</div>
	);
};
