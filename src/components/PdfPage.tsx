import type * as pdfjsLib from "pdfjs-dist";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
	type Annotation,
	AnnotationMode,
	type AnnotationSession,
	type Point,
	type SessionControls,
} from "../types";
import { AnnotationLayer } from "./AnnotationLayer";

interface PdfPageProps {
	pdfDocument: pdfjsLib.PDFDocumentProxy;
	pageNumber: number;
	scale: number;
	annotations: Annotation[];
	onAnnotationClick?: (
		annotation: Annotation,
		event?: React.MouseEvent,
	) => void;
	onPointerDown?: (point: Point, pageIndex: number) => void;
	onPointerMove?: (point: Point, pageIndex: number) => void;
	onPointerUp?: (point: Point, pageIndex: number) => void;
	onCommentAdd?: (point: Point, pageIndex: number) => void;
	onTextClick?: (point: Point, pageIndex: number) => void;
	activeDrawingPoints?: Point[];
	isDrawing?: boolean;
	drawingColor?: string;
	drawingThickness?: number;
	selectedAnnotation?: Annotation | null;
	currentMode?: AnnotationMode;
	startPoint?: Point | null;
	forceRotation?: number;
	activeDrawingStrokes?: Point[][];
	annotationSession?: AnnotationSession;
	sessionControls?: SessionControls;
	showSessionControls?: boolean;
}

export const PdfPage: React.FC<PdfPageProps> = ({
	pdfDocument,
	pageNumber,
	scale,
	annotations,
	onAnnotationClick,
	onPointerDown,
	onPointerMove,
	onPointerUp,
	onCommentAdd,
	onTextClick,
	activeDrawingPoints = [],
	isDrawing = false,
	drawingColor,
	drawingThickness,
	selectedAnnotation = null,
	currentMode = AnnotationMode.NONE,
	startPoint = null,
	forceRotation = null,
	activeDrawingStrokes = [],
	annotationSession,
	sessionControls,
	showSessionControls = true,
}) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const [pageHeight, setPageHeight] = useState<number>(0);
	const [pageWidth, setPageWidth] = useState<number>(0);
	const [isRendered, setIsRendered] = useState<boolean>(false);
	const renderTaskRef = useRef<pdfjsLib.RenderTask | null>(null);
	const [viewportDimensions, setViewportDimensions] = useState<{
		width: number;
		height: number;
	}>({ width: 0, height: 0 });
	// Track actual canvas dimensions to handle window resizing
	const [canvasDimensions, setCanvasDimensions] = useState<{
		width: number;
		height: number;
	}>({ width: 0, height: 0 });
	// Reference to most recent viewport for coordinate calculations
	const viewportRef = useRef<pdfjsLib.PageViewport | null>(null);
	// Add state to track original PDF page dimensions at scale 1.0
	const [originalDimensions, setOriginalDimensions] = useState<{
		width: number;
		height: number;
	}>({ width: 0, height: 0 });
	const [renderError, setRenderError] = useState<string | null>(null);
	const [renderAttempts, setRenderAttempts] = useState<number>(0);
	const maxRenderAttempts = 3;

	// Function to get canvas dimensions - used for coordinate calculations
	const updateCanvasDimensions = useCallback(() => {
		if (canvasRef.current) {
			const { width, height } = canvasRef.current.getBoundingClientRect();
			setCanvasDimensions({ width, height });
		}
	}, []);

	useEffect(() => {
		let isMounted = true;

		const renderPage = async () => {
			if (!canvasRef.current || !isMounted) return;

			try {
				// Reset render error on each attempt
				setRenderError(null);

				// Cancel any existing render tasks
				if (renderTaskRef.current) {
					await renderTaskRef.current.cancel();
					renderTaskRef.current = null;
				}

				// Set rendered state to false to hide annotation layer during re-render
				setIsRendered(false);

				// Get the page
				const page = await pdfDocument.getPage(pageNumber);

				// Log detailed page information for debugging
				console.log(`Rendering PDF page ${pageNumber}:`, {
					rotate: page.rotate,
					pageIndex: page._pageIndex,
					pageNumber: pageNumber,
					ref: page.ref ? `${page.ref.num}R${page.ref.gen}` : "none",
					userUnit: page.userUnit,
					attempt: renderAttempts + 1,
					totalAttempts: maxRenderAttempts,
				});

				// Store the original dimensions at scale 1.0
				const originalViewport = page.getViewport({ scale: 1.0 });
				setOriginalDimensions({
					width: originalViewport.width,
					height: originalViewport.height,
				});

				const viewport = page.getViewport({
					scale,
					rotation: forceRotation !== null ? forceRotation : undefined,
				});

				// Store viewport reference for coordinate calculations
				viewportRef.current = viewport;

				// Store viewport dimensions for coordinate calculations
				setViewportDimensions({
					width: viewport.width,
					height: viewport.height,
				});

				// Ensure we're still mounted
				if (!isMounted || !canvasRef.current) return;

				const canvas = canvasRef.current;
				const context = canvas.getContext("2d", { alpha: false });

				if (!context) return;

				// Set a white background before rendering to prevent the black screen issue
				context.fillStyle = "white";
				context.fillRect(0, 0, canvas.width, canvas.height);

				// Clear the canvas before rendering
				context.clearRect(0, 0, canvas.width, canvas.height);

				// Set canvas dimensions
				canvas.height = viewport.height;
				canvas.width = viewport.width;

				// Fill with white again after resetting dimensions
				context.fillStyle = "white";
				context.fillRect(0, 0, canvas.width, canvas.height);

				setPageHeight(viewport.height);
				setPageWidth(viewport.width);

				// Update canvas dimensions after setting canvas width/height
				updateCanvasDimensions();

				// Get different rendering options based on the retry attempt
				const getRenderOptions = (attempt: number) => {
					if (attempt === 0) {
						// First attempt: use WebGL and default settings
						return {
							enableWebGL: true,
							background: "rgba(255, 255, 255, 1)",
							renderInteractiveForms: true,
						};
					}
					if (attempt === 1) {
						// Second attempt: disable WebGL
						return {
							enableWebGL: false,
							background: "rgba(255, 255, 255, 1)",
							renderInteractiveForms: true,
						};
					}
					// Third attempt: simplest render with no special features
					return {
						enableWebGL: false,
						background: "rgba(255, 255, 255, 1)",
						renderInteractiveForms: false,
					};
				};

				const renderOptions = getRenderOptions(renderAttempts);
				const renderContext = {
					canvasContext: context,
					viewport,
					...renderOptions,
				};

				// Store the render task reference
				renderTaskRef.current = page.render(renderContext);

				// Wait for the render to complete
				await renderTaskRef.current.promise;

				// If still mounted, mark as rendered
				if (isMounted) {
					// Verify that content was actually rendered by checking canvas pixels
					const hasContent = checkCanvasHasContent(canvas);

					if (hasContent) {
						setIsRendered(true);
						renderTaskRef.current = null;
						// Reset render attempts on success
						setRenderAttempts(0);
					} else {
						console.warn(
							"Canvas appears to be blank after rendering, retrying...",
						);
						if (renderAttempts < maxRenderAttempts) {
							setRenderAttempts((prev) => prev + 1);
							// Wait a brief moment before retrying
							setTimeout(() => {
								if (isMounted) {
									renderPage();
								}
							}, 500);
						} else {
							console.error(
								"Max render attempts reached, canvas still appears blank",
							);
							setIsRendered(true); // Show annotations layer anyway
							setRenderError("PDF may not be rendering correctly");
						}
					}
				}
			} catch (error) {
				// Handle rendering errors
				if (error instanceof Error) {
					console.warn("PDF rendering error:", error.message);
					setRenderError(error.message);

					// If it's not a cancelled render and we haven't exceeded max attempts, retry
					if (
						error.message !== "Rendering cancelled" &&
						renderAttempts < maxRenderAttempts
					) {
						if (isMounted) {
							// Increment attempts count
							setRenderAttempts((prev) => prev + 1);

							// Wait a brief moment before retrying
							setTimeout(() => {
								if (isMounted) {
									console.log(
										`Retrying PDF page render (attempt ${renderAttempts + 1}/${maxRenderAttempts})`,
									);
									// Retry rendering
									renderPage();
								}
							}, 500);
						}
					} else if (renderAttempts >= maxRenderAttempts) {
						console.error("Max render attempts reached:", error);
					}
				}
			}
		};

		renderPage();

		// Cleanup function
		return () => {
			isMounted = false;

			// Cancel any pending render tasks
			if (renderTaskRef.current) {
				renderTaskRef.current.cancel();
				renderTaskRef.current = null;
			}
		};
	}, [
		pdfDocument,
		pageNumber,
		scale,
		forceRotation,
		updateCanvasDimensions,
		renderAttempts,
		maxRenderAttempts,
	]);

	// Add a useEffect to update coordinates on window resize
	useEffect(() => {
		const handleResize = () => {
			// Update canvas dimensions on resize
			updateCanvasDimensions();

			// Force canvas redraw with updated coordinates
			if (canvasRef.current) {
				// Signal that dimensions may have changed
				setIsRendered(false);
				// Trigger re-render after a small delay
				setTimeout(() => {
					setIsRendered(true);
				}, 100);
			}
		};

		window.addEventListener("resize", handleResize);

		// Also run resize handler on initial mount to ensure dimensions are correct
		handleResize();

		return () => {
			window.removeEventListener("resize", handleResize);
		};
	}, [updateCanvasDimensions]);

	// Enhance the coordinate conversion functions to use normalized coordinates (0-1 range)
	// This ensures annotations work at any zoom level or screen size
	const getRelativeCoordinates = (
		event: React.MouseEvent | React.PointerEvent,
	): Point => {
		if (!canvasRef.current || originalDimensions.width === 0) {
			return { x: 0, y: 0 };
		}

		const rect = canvasRef.current.getBoundingClientRect();

		// Calculate coordinates in the current viewport
		const viewportX = event.clientX - rect.left;
		const viewportY = event.clientY - rect.top;

		// Convert to normalized coordinates (0-1 range) relative to original PDF dimensions
		// First convert viewport coordinates to PDF coordinates by dividing by scale
		const pdfX = viewportX / scale;
		const pdfY = viewportY / scale;

		// Then normalize to 0-1 range based on original page dimensions
		const normalizedX = pdfX / originalDimensions.width;
		const normalizedY = pdfY / originalDimensions.height;

		// Apply bounds checking to ensure coordinates are within the page (0-1 range)
		const boundedX = Math.max(0, Math.min(normalizedX, 1));
		const boundedY = Math.max(0, Math.min(normalizedY, 1));

		return {
			x: boundedX,
			y: boundedY,
		};
	};

	// This function converts normalized coordinates (0-1) back to viewport coordinates for rendering
	const normalizedToViewportCoordinates = useCallback(
		(normalizedX: number, normalizedY: number): Point => {
			if (!viewportRef.current) {
				return { x: normalizedX, y: normalizedY };
			}

			// Convert from normalized (0-1) to PDF coordinates
			const pdfX = normalizedX * originalDimensions.width;
			const pdfY = normalizedY * originalDimensions.height;

			// Convert from PDF coordinates to viewport coordinates
			const viewportX = pdfX * scale;
			const viewportY = pdfY * scale;

			return { x: viewportX, y: viewportY };
		},
		[scale, originalDimensions],
	);

	// Function to convert screen coordinates to PDF coordinates
	const screenToPdfCoordinates = useCallback(
		(x: number, y: number): Point => {
			if (!canvasRef.current || !viewportRef.current) {
				return { x, y };
			}

			const rect = canvasRef.current.getBoundingClientRect();
			// Calculate relative position within the canvas element
			const relativeX = x - rect.left;
			const relativeY = y - rect.top;

			// Convert to PDF coordinates (which are in the original PDF coordinate system)
			const pdfX = relativeX / scale;
			const pdfY = relativeY / scale;

			// Bound the coordinates to the page dimensions
			const viewport = viewportRef.current;
			const boundedX = Math.max(0, Math.min(pdfX, viewport.width / scale));
			const boundedY = Math.max(0, Math.min(pdfY, viewport.height / scale));

			return { x: boundedX, y: boundedY };
		},
		[scale],
	);

	const handlePointerDown = (event: React.PointerEvent) => {
		if (!onPointerDown) return;

		const point = getRelativeCoordinates(event);
		onPointerDown(point, pageNumber - 1);
	};

	const handlePointerMove = (event: React.PointerEvent) => {
		if (!onPointerMove) return;

		const point = getRelativeCoordinates(event);
		onPointerMove(point, pageNumber - 1);
	};

	const handlePointerUp = (event: React.PointerEvent) => {
		if (!onPointerUp) return;

		const point = getRelativeCoordinates(event);
		onPointerUp(point, pageNumber - 1);

		// Handle text click if in text mode
		if (onTextClick && currentMode === AnnotationMode.TEXT) {
			onTextClick(point, pageNumber - 1);
		}
	};

	// Handle right-click for comment adding
	const handleContextMenu = (event: React.MouseEvent) => {
		if (!onCommentAdd) return;

		event.preventDefault();

		// Use the getRelativeCoordinates function for consistency
		const point = getRelativeCoordinates(event);
		onCommentAdd(point, pageNumber - 1);
	};

	// Function to check if canvas has content (not just a blank/black screen)
	const checkCanvasHasContent = (canvas: HTMLCanvasElement): boolean => {
		try {
			const context = canvas.getContext("2d");
			if (!context) return false;

			// Sample pixels from different areas of the canvas
			const samplePoints = [
				{
					x: Math.floor(canvas.width * 0.25),
					y: Math.floor(canvas.height * 0.25),
				},
				{
					x: Math.floor(canvas.width * 0.75),
					y: Math.floor(canvas.height * 0.25),
				},
				{
					x: Math.floor(canvas.width * 0.5),
					y: Math.floor(canvas.height * 0.5),
				},
				{
					x: Math.floor(canvas.width * 0.25),
					y: Math.floor(canvas.height * 0.75),
				},
				{
					x: Math.floor(canvas.width * 0.75),
					y: Math.floor(canvas.height * 0.75),
				},
			];

			// Count non-white and non-black pixels
			let nonBlankCount = 0;

			for (const point of samplePoints) {
				if (
					point.x <= 0 ||
					point.y <= 0 ||
					point.x >= canvas.width ||
					point.y >= canvas.height
				) {
					continue; // Skip invalid points
				}

				const pixel = context.getImageData(point.x, point.y, 1, 1).data;

				// Check if pixel is not white (255,255,255) and not black (0,0,0)
				// Allow some tolerance for near-white and near-black
				const isWhite = pixel[0] > 250 && pixel[1] > 250 && pixel[2] > 250;
				const isBlack = pixel[0] < 5 && pixel[1] < 5 && pixel[2] < 5;

				if (!isWhite && !isBlack) {
					nonBlankCount++;
				}
			}

			// If we have at least 1 non-blank pixel in our sample, consider the canvas to have content
			return nonBlankCount > 0;
		} catch (error) {
			console.error("Error checking canvas content:", error);
			return true; // Default to assuming content exists if check fails
		}
	};

	return (
		<div
			className="relative mb-8 bg-white border border-gray-300 rounded-sm shadow-xl"
			ref={containerRef}
			onPointerDown={handlePointerDown}
			onPointerMove={handlePointerMove}
			onPointerUp={handlePointerUp}
			onContextMenu={handleContextMenu}
			style={{
				// Add a subtle page curl effect with box-shadow
				boxShadow:
					"0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24), 0 10px 20px rgba(0,0,0,0.15)",
				minHeight: pageHeight || 300,
				minWidth: pageWidth || 200,
			}}
			data-page-number={pageNumber}
		>
			<div className="absolute top-0 right-0 px-2 py-1 text-xs text-gray-600 bg-gray-100 border-b border-l border-gray-300 rounded-bl-md">
				Page {pageNumber}
			</div>

			{/* Loading indicator */}
			{!isRendered && (
				<div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-100 bg-opacity-80">
					<div className="text-center">
						{renderError && renderAttempts >= maxRenderAttempts ? (
							<div>
								<svg
									className="w-12 h-12 mx-auto text-red-500"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<title>Erro ao renderizar página</title>
									<desc>Erro ao renderizar página</desc>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
									/>
								</svg>
								<p className="mt-2 font-medium text-red-600">
									Failed to render PDF page
								</p>
								<p className="mt-1 text-sm text-gray-600">
									Try refreshing the page or using a different browser.
								</p>
							</div>
						) : (
							<>
								<div className="inline-block w-8 h-8 mb-2 border-4 border-gray-300 rounded-full border-t-gray-600 animate-spin" />
								<p className="text-sm text-gray-600">
									Loading page {pageNumber}...
								</p>
								{renderAttempts > 0 && (
									<p className="mt-1 text-xs text-gray-500">
										Retry attempt {renderAttempts}/{maxRenderAttempts}
									</p>
								)}
							</>
						)}
					</div>
				</div>
			)}

			<canvas
				ref={canvasRef}
				className="block"
				width={pageWidth || 1}
				height={pageHeight || 1}
			/>
			{isRendered && (
				<AnnotationLayer
					annotations={annotations}
					pageIndex={pageNumber - 1}
					scale={scale}
					onAnnotationClick={onAnnotationClick}
					activeDrawingPoints={activeDrawingPoints}
					isDrawing={isDrawing}
					drawingColor={drawingColor}
					drawingThickness={drawingThickness}
					selectedAnnotation={selectedAnnotation}
					currentMode={currentMode}
					startPoint={startPoint}
					originalWidth={originalDimensions.width}
					originalHeight={originalDimensions.height}
					activeDrawingStrokes={activeDrawingStrokes}
					annotationSession={annotationSession}
					sessionControls={sessionControls}
					showSessionControls={showSessionControls}
				/>
			)}
		</div>
	);
};
