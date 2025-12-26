import type { CompetenciaInterface } from "lingapp-revisao-redacao";
import React, { useState, useCallback, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import {
	type Annotation,
	type AnnotationEventCallbacks,
	AnnotationMode,
	type AnnotationRect,
	type AnnotationSession,
	AnnotationType,
	type Point,
	type SessionControls,
} from "../types";
import {
	annotationModeToType,
	calculateRectFromPoints,
	getAnnotationColor,
	getCategoryColor,
} from "../utils";

interface UseAnnotationsProps extends AnnotationEventCallbacks {
	initialAnnotations?: Annotation[];
	annotationMode?: AnnotationMode;
	currentCategory?: CompetenciaInterface;
	highlightColor?: string;
	underlineColor?: string;
	strikeoutColor?: string;
	rectangleColor?: string;
	drawingColor?: string;
	textColor?: string;
	commentColor?: string;
	pinColor?: string;
	highlightingColor?: string;
	customCategories?: CompetenciaInterface[];
	thickness?: number;
}

// Helper function to generate MongoDB-like ObjectId
const generateMongoLikeId = (): string => {
	// ObjectId format: 24 hex chars (12 bytes)
	// Format: 4 bytes timestamp + 5 bytes random + 3 bytes counter

	// Get current timestamp (4 bytes - 8 hex chars)
	const timestamp = Math.floor(Date.now() / 1000)
		.toString(16)
		.padStart(8, "0");

	// Generate random part (16 hex chars to make 24 total)
	const random = uuidv4().replace(/-/g, "").substring(0, 16);

	return timestamp + random;
};

function calculateRectFromNormalizedPoints(
	start: Point,
	end: Point,
	pageIndex: number,
): AnnotationRect {
	const x = Math.min(start.x, end.x);
	const y = Math.min(start.y, end.y);
	const width = Math.abs(end.x - start.x);
	const height = Math.abs(end.y - start.y);
	return { x, y, width, height, pageIndex };
}

export const useAnnotations = ({
	initialAnnotations = [],
	annotationMode = AnnotationMode.NONE,
	currentCategory,
	onAnnotationCreate,
	onAnnotationUpdate,
	onAnnotationDelete,
	onAnnotationSelect,
	// highlightColor,
	// underlineColor,
	// strikeoutColor,
	// rectangleColor,
	// drawingColor,
	// textColor,
	// commentColor,
	// pinColor,
	// highlightingColor,
	// customCategories = [],
	thickness = 2,
}: UseAnnotationsProps) => {
	const [annotations, setAnnotations] =
		useState<Annotation[]>(initialAnnotations);
	const [selectedAnnotation, setSelectedAnnotation] =
		useState<Annotation | null>(null);
	const [currentMode, setCurrentMode] =
		useState<AnnotationMode>(annotationMode);
	const [drawingPoints, setDrawingPoints] = useState<Point[]>([]);
	const [drawingStrokes, setDrawingStrokes] = useState<Point[][]>([]);
	const [isDrawing, setIsDrawing] = useState(false);
	const [startPoint, setStartPoint] = useState<Point | null>(null);
	// Session state for multi-stroke drawing
	const [annotationSession, setAnnotationSession] = useState<AnnotationSession>(
		{
			isActive: false,
			strokes: [],
			currentStroke: [],
			boundingBox: null,
			pageIndex: 0,
			startTime: new Date(),
		},
	);
	const [sessionTimeout, setSessionTimeout] = useState<ReturnType<
		typeof setTimeout
	> | null>(null);

	const getColor = useCallback(
		(type: AnnotationType): string => {
			// If a category is provided, use its color
			if (currentCategory) {
				return currentCategory.color;
			}

			// Otherwise, fall back to the default color for the annotation type
			return getAnnotationColor(type);
		},
		[currentCategory],
	);

	const createAnnotation = useCallback(
		(
			type: AnnotationType,
			rect: AnnotationRect,
			content?: string,
			points?: Point[][],
		): Annotation => {
			const color = getColor(type);

			const newAnnotation: Annotation = {
				id: generateMongoLikeId(),
				type,
				rect,
				pageIndex: rect.pageIndex,
				color,
				content: content || "",
				points,
				createdAt: new Date(),
				updatedAt: new Date(),
				thickness: thickness,
				category: currentCategory,
			};

			setAnnotations((prev) => [...prev, newAnnotation]);

			if (onAnnotationCreate) {
				onAnnotationCreate(newAnnotation);
			}

			return newAnnotation;
		},
		[currentCategory, getColor, onAnnotationCreate, thickness],
	);

	const updateAnnotation = useCallback(
		(id: string, updates: Partial<Annotation>): void => {
			// console.log('useAnnotations updateAnnotation:', id, updates);
			setAnnotations((prev) => {
				const updated = prev.map((annotation) => {
					if (annotation.id === id) {
						// Ensure color is updated if category changes
						let updatedColor = updates.color;
						if (updates.category && !updatedColor) {
							updatedColor = updates.category.color;
						}

						const updatedAnnotation = {
							...annotation,
							...updates,
							color: updatedColor || annotation.color, // Ensure color is properly updated
							updatedAt: new Date(),
						};
						// console.log('Updated annotation with new color:', updatedAnnotation.color);
						// Call the callback if provided
						onAnnotationUpdate?.(updatedAnnotation);

						// If this is the currently selected annotation, update the selection too
						if (selectedAnnotation && selectedAnnotation.id === id) {
							setSelectedAnnotation(updatedAnnotation);
						}

						return updatedAnnotation;
					}
					return annotation;
				});
				return updated;
			});
		},
		[onAnnotationUpdate, selectedAnnotation],
	);

	const deleteAnnotation = useCallback(
		(id: string): void => {
			setAnnotations((prev) =>
				prev.filter((annotation) => annotation.id !== id),
			);
			if (selectedAnnotation?.id === id) {
				setSelectedAnnotation(null);
				onAnnotationSelect?.(null);
			}
			onAnnotationDelete?.(id);
		},
		[selectedAnnotation, onAnnotationDelete, onAnnotationSelect],
	);

	const selectAnnotation = useCallback(
		(annotation: Annotation | null): void => {
			setSelectedAnnotation(annotation);
			onAnnotationSelect?.(annotation);
		},
		[onAnnotationSelect],
	);

	const setMode = useCallback((mode: AnnotationMode): void => {
		setCurrentMode(mode);
		// Reset drawing state when changing modes
		setIsDrawing(false);
		setDrawingPoints([]);
		setDrawingStrokes([]);
		setStartPoint(null);
	}, []);

	const calculateSessionBoundingBox = useCallback(
		(strokes: Point[][], pageIndex: number): AnnotationRect => {
			const allPoints = strokes.flat();
			if (allPoints.length === 0) {
				return { x: 0, y: 0, width: 0, height: 0, pageIndex };
			}
			let minX = Number.MAX_VALUE;
			let minY = Number.MAX_VALUE;
			let maxX = Number.MIN_VALUE;
			let maxY = Number.MIN_VALUE;
			for (const point of allPoints) {
				minX = Math.min(minX, point.x);
				minY = Math.min(minY, point.y);
				maxX = Math.max(maxX, point.x);
				maxY = Math.max(maxY, point.y);
			}
			return {
				x: minX,
				y: minY,
				width: maxX - minX,
				height: maxY - minY,
				pageIndex,
			};
		},
		[],
	);

	const startAnnotationSession = useCallback((pageIndex: number) => {
		console.log("🎨 Starting annotation session on page:", pageIndex);
		setAnnotationSession({
			isActive: true,
			strokes: [],
			currentStroke: [],
			boundingBox: null,
			pageIndex,
			startTime: new Date(),
		});
	}, []);

	const finishCurrentStroke = useCallback(() => {
		setAnnotationSession((prev) => {
			if (!prev.isActive || prev.currentStroke.length < 2) return prev;
			const newStrokes = [...prev.strokes, prev.currentStroke];
			const newBoundingBox = calculateSessionBoundingBox(
				newStrokes,
				prev.pageIndex,
			);
			console.log(
				"✏️ Finished stroke. Total strokes:",
				newStrokes.length,
				"Points in stroke:",
				prev.currentStroke.length,
			);
			return {
				...prev,
				strokes: newStrokes,
				currentStroke: [],
				boundingBox: newBoundingBox,
			};
		});
		setIsDrawing(false);
	}, [calculateSessionBoundingBox]);

	const finalizeAnnotationSession = useCallback(() => {
		if (!annotationSession.isActive || annotationSession.strokes.length === 0)
			return;
		const allPoints = annotationSession.strokes.flat();
		console.log(
			"💾 Finalizing annotation session with",
			annotationSession.strokes.length,
			"strokes and",
			allPoints.length,
			"total points",
		);
		if (annotationSession.boundingBox && allPoints.length > 0) {
			const newAnnotation = createAnnotation(
				AnnotationType.DRAWING,
				annotationSession.boundingBox,
				undefined,
				annotationSession.strokes,
			);
			console.log("📝 Created annotation:", newAnnotation.id);
		}
		setAnnotationSession({
			isActive: false,
			strokes: [],
			currentStroke: [],
			boundingBox: null,
			pageIndex: 0,
			startTime: new Date(),
		});
		if (sessionTimeout) {
			clearTimeout(sessionTimeout);
			setSessionTimeout(null);
		}
	}, [annotationSession, createAnnotation, sessionTimeout]);

	const cancelAnnotationSession = useCallback(() => {
		setAnnotationSession({
			isActive: false,
			strokes: [],
			currentStroke: [],
			boundingBox: null,
			pageIndex: 0,
			startTime: new Date(),
		});
		setIsDrawing(false);
		if (sessionTimeout) {
			clearTimeout(sessionTimeout);
			setSessionTimeout(null);
		}
	}, [sessionTimeout]);

	const undoLastStroke = useCallback(() => {
		setAnnotationSession((prev) => {
			if (!prev.isActive || prev.strokes.length === 0) return prev;
			const newStrokes = prev.strokes.slice(0, -1);
			const newBoundingBox =
				newStrokes.length > 0
					? calculateSessionBoundingBox(newStrokes, prev.pageIndex)
					: null;
			return {
				...prev,
				strokes: newStrokes,
				boundingBox: newBoundingBox,
			};
		});
	}, [calculateSessionBoundingBox]);

	// Modified pointer handlers for session logic
	const handlePointerDown = useCallback(
		(point: Point, pageIndex: number): void => {
			if (currentMode === AnnotationMode.NONE) return;
			const annotationType = annotationModeToType(currentMode);
			if (!annotationType) return;
			if (annotationType === AnnotationType.DRAWING) {
				console.log("🖱️ Pointer down - starting drawing stroke at:", point);
				if (!annotationSession.isActive) {
					startAnnotationSession(pageIndex);
				}
				setIsDrawing(true);
				setAnnotationSession((prev) => ({
					...prev,
					currentStroke: [point],
				}));
				if (sessionTimeout) {
					clearTimeout(sessionTimeout);
				}
			} else {
				setStartPoint(point);
			}
		},
		[
			currentMode,
			annotationSession.isActive,
			startAnnotationSession,
			sessionTimeout,
		],
	);

	const handlePointerMove = useCallback(
		(point: Point, pageIndex: number): void => {
			if (
				currentMode === AnnotationMode.DRAWING &&
				isDrawing &&
				annotationSession.isActive
			) {
				setAnnotationSession((prev) => ({
					...prev,
					currentStroke: [...prev.currentStroke, point],
				}));
			} else if (currentMode === AnnotationMode.HIGHLIGHTING && isDrawing) {
				setDrawingPoints((prev) => [...prev, point]);
			}
		},
		[currentMode, isDrawing, annotationSession.isActive],
	);

	const handlePointerUp = useCallback(
		(point: Point, pageIndex: number): void => {
			if (
				currentMode === AnnotationMode.DRAWING &&
				isDrawing &&
				annotationSession.isActive
			) {
				setAnnotationSession((prev) => ({
					...prev,
					currentStroke: [...prev.currentStroke, point],
				}));
				setTimeout(() => {
					finishCurrentStroke();
				}, 10);
				const timeout = setTimeout(() => {
					finalizeAnnotationSession();
				}, 3000);
				setSessionTimeout(timeout);
			} else {
				// Existing logic for other types
				if (
					currentMode === AnnotationMode.HIGHLIGHTING &&
					isDrawing &&
					drawingPoints.length > 1
				) {
					setIsDrawing(false);
					setDrawingStrokes((prev) => [...prev, drawingPoints]);
					setDrawingPoints([]);
				} else if (startPoint) {
					const rect = calculateRectFromNormalizedPoints(
						startPoint,
						point,
						pageIndex,
					);
					if (rect.width > 0 && rect.height > 0) {
						createAnnotation(annotationModeToType(currentMode), rect);
					}
					setStartPoint(null);
				}
			}
		},
		[
			currentMode,
			isDrawing,
			annotationSession.isActive,
			finishCurrentStroke,
			finalizeAnnotationSession,
			drawingPoints,
			startPoint,
			createAnnotation,
		],
	);

	// Keyboard shortcuts for session
	useEffect(() => {
		const handleKeyPress = (event: KeyboardEvent) => {
			if (!annotationSession.isActive) return;
			if (event.key === "Enter") {
				event.preventDefault();
				finalizeAnnotationSession();
			} else if (event.key === "Escape") {
				event.preventDefault();
				cancelAnnotationSession();
			} else if (event.key === "z" && (event.ctrlKey || event.metaKey)) {
				event.preventDefault();
				undoLastStroke();
			}
		};
		if (annotationSession.isActive) {
			document.addEventListener("keydown", handleKeyPress);
		}
		return () => {
			document.removeEventListener("keydown", handleKeyPress);
		};
	}, [
		annotationSession.isActive,
		finalizeAnnotationSession,
		cancelAnnotationSession,
		undoLastStroke,
	]);

	const sessionControls: SessionControls = {
		finalize: finalizeAnnotationSession,
		cancel: cancelAnnotationSession,
		undoLastStroke,
		addStroke: (points: Point[]) => {
			setAnnotationSession((prev) => ({
				...prev,
				strokes: [...prev.strokes, points],
				boundingBox: calculateSessionBoundingBox(
					[...prev.strokes, points],
					prev.pageIndex,
				),
			}));
		},
	};

	return {
		annotations,
		selectedAnnotation,
		currentMode,
		drawingPoints: annotationSession.isActive
			? annotationSession.currentStroke
			: drawingPoints,
		drawingStrokes,
		isDrawing,
		startPoint,
		annotationSession,
		sessionControls,
		handlePointerDown,
		handlePointerMove,
		handlePointerUp,
		createAnnotation,
		updateAnnotation,
		deleteAnnotation,
		selectAnnotation,
		setMode,
		setDrawingStrokes,
		startAnnotationSession,
		finalizeAnnotationSession,
		cancelAnnotationSession,
		undoLastStroke,
	};
};
