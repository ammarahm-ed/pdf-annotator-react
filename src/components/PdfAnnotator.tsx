import type {
	CompetenciaInterface,
	TagInterface,
} from "lingapp-revisao-redacao";
import * as pdfjsLib from "pdfjs-dist";
import type React from "react";
import {
	forwardRef,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from "react";
import { useAnnotations } from "../hooks/useAnnotations";
import {
	type Annotation,
	AnnotationMode,
	AnnotationRect,
	AnnotationType,
	type PDFAnnotatorProps,
	type Point,
} from "../types";
import { annotationsToJSON } from "../utils";
// CustomModal import removed - no longer needed for drawing modal
import { annotationModeToType } from "../utils";
import { AnnotationDetails } from "./AnnotationDetails";
import { CommentPopup } from "./CommentPopup";
import { PdfPage } from "./PdfPage";
import { TextInputPopup } from "./TextInputPopup";
import { ToolBar } from "./ToolBar";

// Define a ref type for exposing methods
export interface PdfAnnotatorRef {
	getAnnotationsJSON: () => string;
	selectAnnotationById: (annotationId: string) => boolean; // Returns true if the annotation was found and selected
}

export const PdfAnnotator = forwardRef<PdfAnnotatorRef, PDFAnnotatorProps>(
	(
		{
			url,
			annotations = [],
			scale: initialScale = 1.0,
			pageNumber = 1,
			onDocumentLoadSuccess,
			onPageChange,
			annotationMode = AnnotationMode.NONE,
			onAnnotationModeChange,
			currentCategory,
			onCategoryChange,
			onAnnotationCreate,
			onAnnotationUpdate,
			onAnnotationDelete,
			onAnnotationSelect,
			onAnnotationsChange,
			highlightColor,
			underlineColor,
			strikeoutColor,
			rectangleColor,
			drawingColor,
			textColor,
			commentColor,
			pinColor = "rgba(249, 115, 22, 0.7)", // Default orange
			customCategories = [],
			pdfWorkerSrc,
			fitToWidth = true, // New prop to control whether to fit to width
			defaultThickness,
			viewOnly = false, // New prop to control whether the component is in view-only mode
			annotationSession, // Session state for multi-stroke drawing
			sessionControls, // Controls for annotation sessions
		},
		ref,
	) => {
		const [pdfDocument, setPdfDocument] =
			useState<pdfjsLib.PDFDocumentProxy | null>(null);
		const [numPages, setNumPages] = useState<number>(0);
		const [currentPage, setCurrentPage] = useState<number>(pageNumber);
		const [scale, setScale] = useState<number>(initialScale);
		const [originalPageWidth, setOriginalPageWidth] = useState<number | null>(
			null,
		);
		const [originalPageHeight, setOriginalPageHeight] = useState<number | null>(
			null,
		);
		const [showCommentPopup, setShowCommentPopup] = useState<boolean>(false);
		const [commentPosition, setCommentPosition] = useState<{
			x: number;
			y: number;
		}>({ x: 0, y: 0 });
		const [showTextPopup, setShowTextPopup] = useState<boolean>(false);
		const [textPosition, setTextPosition] = useState<Point>({ x: 0, y: 0 });
		const [textPageIndex, setTextPageIndex] = useState<number>(0);
		const [showPinPopup, setShowPinPopup] = useState<boolean>(false);
		const [pinPosition, setPinPosition] = useState<Point>({ x: 0, y: 0 });
		const [pinPageIndex, setPinPageIndex] = useState<number>(0);
		const [selectedCategory, setSelectedCategory] = useState<
			CompetenciaInterface | undefined
		>(currentCategory);
		const containerRef = useRef<HTMLDivElement>(null);
		const [selectedAnnotationPosition, setSelectedAnnotationPosition] =
			useState<{ x: number; y: number } | null>(null);
		const [isNewAnnotation, setIsNewAnnotation] = useState(false);
		const [lastMousePosition, setLastMousePosition] = useState<{
			x: number;
			y: number;
		} | null>(null);
		const [annotationThickness, setAnnotationThickness] = useState<number>(
			typeof defaultThickness === "number" ? defaultThickness : 8,
		);
		const [selectedAnnotation, setSelectedAnnotation] =
			useState<Annotation | null>(null);
		const [showDetailsDialog, setShowDetailsDialog] = useState<boolean>(false);
		// Old drawing modal state removed - using session system instead

		// Configure the PDF worker
		useEffect(() => {
			try {
				// Use the provided worker source or default to a CDN with HTTPS
				const workerSrc =
					pdfWorkerSrc ||
					`https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
				pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

				// Ensure PDF.js cMapUrl is set for handling various PDF text encodings
				const params = new URL(document.location.href).searchParams;
				const cMapUrl =
					params.get("cmapurl") ||
					"https://unpkg.com/pdfjs-dist@4.0.189/cmaps/";

				// Set global PDF.js parameters for better stability
				(pdfjsLib as any).GlobalWorkerOptions.workerSrc = workerSrc;
				pdfjsLib.GlobalWorkerOptions.workerPort = null; // Force use of worker file

				console.log("PDF.js worker configured successfully:", {
					version: pdfjsLib.version,
					workerSrc,
					cMapUrl,
				});
			} catch (error) {
				console.error("Error configuring PDF.js worker:", error);
			}
		}, [pdfWorkerSrc]);

		// Calculate the scale factor needed to fit the PDF to the container width
		const calculateFitToWidthScale = async (
			pdfDoc: pdfjsLib.PDFDocumentProxy,
		) => {
			if (!containerRef.current) return initialScale;

			try {
				// Get the first page to determine dimensions
				const page = await pdfDoc.getPage(1);
				const viewport = page.getViewport({ scale: 1.0 }); // Get original size

				// Store the original page width and height
				setOriginalPageWidth(viewport.width);
				setOriginalPageHeight(viewport.height);

				// Calculate container width (accounting for padding)
				const containerWidth = containerRef.current.clientWidth - 40; // 40px for padding (20px on each side)

				// Calculate scale needed to fit the page width to the container
				const scaleFactor = containerWidth / viewport.width;

				return scaleFactor;
			} catch (error) {
				console.error("Error calculating fit-to-width scale:", error);
				return initialScale;
			}
		};

		// Modified onAnnotationCreate to capture the position when a new annotation is created
		const handleAnnotationCreate = (newAnnotation: Annotation) => {
			// Don't select annotation in view-only mode
			if (!viewOnly) {
				// Select the new annotation to display details
				selectAnnotation(newAnnotation);
				setShowDetailsDialog(true);

				// Set position for the details dialog to last mouse position
				if (lastMousePosition) {
					setSelectedAnnotationPosition(lastMousePosition);
				}

				// Set isNewAnnotation flag to true so details opens in edit mode
				setIsNewAnnotation(true);
			}

			// Call the original onAnnotationCreate callback
			if (onAnnotationCreate) {
				onAnnotationCreate(newAnnotation);
			}
		};

		// Extract the competencia property from each CustomCategory for the ToolBar
		const CompetenciaInterfaces: CompetenciaInterface[] = customCategories.map(
			(cat) => cat.competencia,
		);

		const {
			annotations: localAnnotations,
			selectedAnnotation: hookSelectedAnnotation,
			currentMode,
			drawingStrokes,
			isDrawing,
			handlePointerDown,
			handlePointerMove,
			handlePointerUp,
			createAnnotation,
			updateAnnotation,
			deleteAnnotation,
			selectAnnotation: hookSelectAnnotation,
			setMode,
			setDrawingStrokes,
			annotationSession: internalAnnotationSession,
			sessionControls: internalSessionControls,
		} = useAnnotations({
			initialAnnotations: annotations,
			annotationMode,
			currentCategory: selectedCategory,
			onAnnotationCreate: (newAnnotation) => {
				handleAnnotationCreate(newAnnotation);

				// Call the onAnnotationsChange callback with the updated annotations array
				if (onAnnotationsChange) {
					onAnnotationsChange([...localAnnotations, newAnnotation]);
				}
			},
			onAnnotationUpdate: (updatedAnnotation) => {
				if (onAnnotationUpdate) {
					onAnnotationUpdate(updatedAnnotation);
				}

				// Call the onAnnotationsChange callback with the updated annotations array
				if (onAnnotationsChange) {
					const updatedAnnotations = localAnnotations.map((ann) =>
						ann.id === updatedAnnotation.id ? updatedAnnotation : ann,
					);
					onAnnotationsChange(updatedAnnotations);
				}
			},
			onAnnotationDelete: (annotationId) => {
				if (onAnnotationDelete) {
					onAnnotationDelete(annotationId);
				}

				// Call the onAnnotationsChange callback with the updated annotations array
				if (onAnnotationsChange) {
					const updatedAnnotations = localAnnotations.filter(
						(ann) => ann.id !== annotationId,
					);
					onAnnotationsChange(updatedAnnotations);
				}
			},
			onAnnotationSelect,
			highlightColor,
			underlineColor,
			strikeoutColor,
			rectangleColor,
			drawingColor,
			textColor,
			commentColor,
			pinColor,
			customCategories: CompetenciaInterfaces,
			thickness: annotationThickness,
		});

		// Use external session props if provided, otherwise fall back to internal hook
		const activeAnnotationSession =
			annotationSession || internalAnnotationSession;
		const activeSessionControls = sessionControls || internalSessionControls;

		// Create wrapper for the selectAnnotation function to control when to show the dialog
		const selectAnnotation = (annotation: Annotation | null) => {
			hookSelectAnnotation(annotation);
			setSelectedAnnotation(annotation);
			// Don't set showDetailsDialog to false here - that will be handled elsewhere
		};

		// Track mouse position for all pointer events
		const trackMousePosition = (e: MouseEvent) => {
			setLastMousePosition({ x: e.clientX, y: e.clientY });
		};

		// Add event listener to track mouse position
		useEffect(() => {
			document.addEventListener("mousemove", trackMousePosition);
			return () => {
				document.removeEventListener("mousemove", trackMousePosition);
			};
		}, []);

		// Reset isNewAnnotation when selectedAnnotation changes
		useEffect(() => {
			if (!selectedAnnotation) {
				setIsNewAnnotation(false);
				// We don't want to automatically set showDetailsDialog to false here
				// as it may interfere with the annotation click flow
				// setShowDetailsDialog(false);
			}
		}, [selectedAnnotation]);

		// Add event listeners to handle closing the dialog on scroll and clicks outside annotations
		useEffect(() => {
			// Reference to the container element for scroll handling
			const container = containerRef.current;

			// Handler to close the annotation details when scrolling
			const handleScroll = () => {
				if (selectedAnnotation && showDetailsDialog) {
					selectAnnotation(null);
				}
			};

			// Handler to close annotation details when clicking outside annotations and the dialog
			const handleClickOutside = (event: MouseEvent) => {
				// Don't close if we're in any annotation mode other than selection
				if (currentMode !== AnnotationMode.NONE) return;

				// Check if click is inside the annotation details dialog
				const detailsDialog = document.querySelector(
					'.annotation-details, [data-testid="annotation-details-dialog"]',
				);
				if (
					detailsDialog &&
					(detailsDialog.contains(event.target as Node) ||
						event.target === detailsDialog)
				) {
					return; // Don't close if clicking inside the dialog
				}

				// Check if click target has class or ancestor with class that contains 'dialog'
				const targetElement = event.target as Element;
				if (
					targetElement &&
					(targetElement.closest(".annotation-details") ||
						targetElement.closest('[data-testid="annotation-details-dialog"]'))
				) {
					return; // Don't close if clicking on any element inside dialog or its children
				}

				// Check if click is on an annotation
				const isAnnotationClick =
					event.target &&
					((event.target as Element).closest(".annotation") ||
						(event.target as Element).classList.contains("annotation"));

				// If not clicking on annotation or dialog, close the details
				if (!isAnnotationClick && selectedAnnotation) {
					selectAnnotation(null);
				}
			};

			// We need a smaller timeout to let the selection events complete before we start listening for outside clicks
			// This prevents the click handler from immediately closing a newly opened dialog
			let clickListener: ((event: MouseEvent) => void) | null = null;

			if (selectedAnnotation) {
				// Only add click listener when there's a selected annotation
				// And do it after a small delay to prevent immediate closing
				const timeoutId = setTimeout(() => {
					document.addEventListener("click", handleClickOutside);
					clickListener = handleClickOutside;
				}, 300);

				// Add scroll listener immediately
				if (container) {
					container.addEventListener("scroll", handleScroll);
				}

				// Clean up both the timeout and any added listeners
				return () => {
					clearTimeout(timeoutId);
					if (container) {
						container.removeEventListener("scroll", handleScroll);
					}
					if (clickListener) {
						document.removeEventListener("click", clickListener);
					}
				};
			}
			// Clean up any existing listeners when there's no selected annotation
			if (container) {
				container.removeEventListener("scroll", handleScroll);
			}
			if (clickListener) {
				document.removeEventListener("click", clickListener);
			}
			return () => {};
		}, [selectedAnnotation, currentMode, showDetailsDialog]);

		// Extracted scrollToAnnotation function for better organization and reusability
		const scrollToAnnotation = (annotation: Annotation) => {
			const containerElement = containerRef.current;
			if (!containerElement) return;

			// Query for the page container using exact attribute value match
			const pageSelector = `[data-page-number="${annotation.pageIndex + 1}"]`;
			const pageContainer = document.querySelector(pageSelector) as HTMLElement;

			if (pageContainer) {
				// Force a layout calculation to ensure accurate positions
				const forceReflow = pageContainer.offsetHeight;

				// Get direct measurements from DOM
				const pageOffsetTop = pageContainer.offsetTop;

				// Calculate exact annotation position
				const annotationOffsetY = annotation.rect.y * scale;
				const totalOffsetTop = pageOffsetTop + annotationOffsetY;

				// Position the annotation at the top of the viewport with just a small margin
				const margin = 20; // 20px margin from the top
				const targetPosition = totalOffsetTop - margin;

				// Scroll directly using scrollTop for more reliable positioning
				containerElement.scrollTop = Math.max(0, targetPosition);
			} else {
				// Fallback to a more basic approach
				const pageHeight = originalPageHeight || 800;
				const totalOffsetTop =
					annotation.pageIndex * pageHeight + annotation.rect.y * scale;

				// Position with just a small margin from the top
				const margin = 20;
				const targetPosition = totalOffsetTop - margin;

				// Direct scroll
				containerElement.scrollTop = Math.max(0, targetPosition);
			}
		};

		// Expose the getAnnotationsJSON method via ref
		useImperativeHandle(ref, () => ({
			getAnnotationsJSON: () => annotationsToJSON(localAnnotations),
			selectAnnotationById: (annotationId: string) => {
				// Find the annotation by ID
				const annotation = localAnnotations.find(
					(ann) => ann.id === annotationId,
				);

				if (annotation) {
					console.log("Found annotation for selection:", annotation);

					// Select the annotation but don't show the dialog
					selectAnnotation(annotation);
					setShowDetailsDialog(false);

					// Track if we need to change page
					const needsPageChange = annotation.pageIndex + 1 !== currentPage;

					if (needsPageChange) {
						console.log(
							`Changing page from ${currentPage} to ${annotation.pageIndex + 1}`,
						);

						// Change the page first
						handlePageChange(annotation.pageIndex + 1);

						// Wait for the page to be fully rendered before scrolling
						setTimeout(() => {
							console.log(
								"Page should be rendered, attempting to scroll to annotation",
							);
							scrollToAnnotation(annotation);

							// If first attempt fails, try again
							setTimeout(() => {
								console.log(
									"Trying annotation scroll again to ensure it works",
								);
								scrollToAnnotation(annotation);
							}, 600);
						}, 400);
					} else {
						// Already on the correct page, scroll immediately
						console.log(
							"Already on correct page, scrolling to annotation position",
						);

						// Short delay to ensure DOM is ready
						scrollToAnnotation(annotation);
					}

					return true;
				}

				console.log("Annotation not found with id:", annotationId);
				return false;
			},
		}));

		useEffect(() => {
			let loadingTask: pdfjsLib.PDFDocumentLoadingTask | null = null;

			const loadDocument = async () => {
				try {
					// If there's an existing loading task, cancel it
					if (loadingTask) {
						await loadingTask.destroy();
					}

					console.log("Loading PDF document from URL:", url);
					loadingTask = pdfjsLib.getDocument({
						url: url,
						cMapUrl: "https://unpkg.com/pdfjs-dist@4.0.189/cmaps/",
						cMapPacked: true,
						disableRange: false,
						disableStream: false,
						disableAutoFetch: false,
						isEvalSupported: true,
						enableXfa: true,
						disableFontFace: false,
						useSystemFonts: true,
					});

					// Log when document loading starts
					loadingTask.onProgress = (progressData: {
						loaded: number;
						total?: number;
					}) => {
						console.log(
							"PDF loading progress:",
							progressData.loaded,
							"of",
							progressData.total || "unknown",
							"bytes loaded",
						);
					};

					const pdfDoc = await loadingTask.promise;

					console.log("PDF document loaded successfully:", {
						numPages: pdfDoc.numPages,
						fingerprint: pdfDoc.fingerprints[0],
						isPureXfa: pdfDoc.isPureXfa,
					});

					setPdfDocument(pdfDoc);
					setNumPages(pdfDoc.numPages);

					// If fitToWidth is enabled, calculate and set the appropriate scale
					if (fitToWidth) {
						const fitScale = await calculateFitToWidthScale(pdfDoc);
						setScale(fitScale);
					}

					if (onDocumentLoadSuccess) {
						onDocumentLoadSuccess(pdfDoc.numPages);
					}
				} catch (error) {
					console.error("Error loading PDF document:", error);

					// More detailed error information
					if (error instanceof Error) {
						console.error("Error details:", {
							name: error.name,
							message: error.message,
							stack: error.stack,
						});

						// Try loading with fallback options if the initial attempt failed
						if (!loadingTask || loadingTask.destroyed) {
							console.log("Attempting to load PDF with fallback options...");
							try {
								loadingTask = pdfjsLib.getDocument({
									url: url,
									cMapUrl: "https://unpkg.com/pdfjs-dist@4.0.189/cmaps/",
									cMapPacked: true,
									disableRange: true, // Try with range requests disabled
									disableStream: true, // Try with streaming disabled
									disableAutoFetch: true, // Disable auto-fetching
									isEvalSupported: false, // Disable eval
									enableXfa: false, // Disable XFA
									disableFontFace: true, // Disable font face
								});

								const pdfDoc = await loadingTask.promise;

								console.log(
									"PDF document loaded successfully with fallback options",
								);

								setPdfDocument(pdfDoc);
								setNumPages(pdfDoc.numPages);

								if (fitToWidth) {
									const fitScale = await calculateFitToWidthScale(pdfDoc);
									setScale(fitScale);
								}

								if (onDocumentLoadSuccess) {
									onDocumentLoadSuccess(pdfDoc.numPages);
								}
							} catch (fallbackError) {
								console.error(
									"Error loading PDF document with fallback options:",
									fallbackError,
								);
							}
						}
					}
				}
			};

			loadDocument();

			// Clean up loading task when component unmounts or URL changes
			return () => {
				if (loadingTask) {
					loadingTask.destroy().catch((err) => {
						console.error("Error destroying PDF loading task:", err);
					});
				}
			};
		}, [url, onDocumentLoadSuccess, fitToWidth, initialScale]);

		// Recalculate scale when window is resized
		useEffect(() => {
			const handleResize = async () => {
				if (
					fitToWidth &&
					pdfDocument &&
					originalPageWidth &&
					containerRef.current
				) {
					const containerWidth = containerRef.current.clientWidth - 40; // 40px for padding
					const newScale = containerWidth / originalPageWidth;

					// Set the new scale
					setScale(newScale);

					// Force a rerender of annotation positions
					if (selectedAnnotation) {
						// If there's a selected annotation, update its dialog position
						const pageContainer = document.querySelector(
							`[data-page-number="${selectedAnnotation.pageIndex + 1}"]`,
						);
						if (pageContainer) {
							const rect = pageContainer.getBoundingClientRect();
							const annotationX =
								rect.left + selectedAnnotation.rect.x * newScale;
							const annotationY =
								rect.top + selectedAnnotation.rect.y * newScale;

							setSelectedAnnotationPosition({
								x: annotationX + selectedAnnotation.rect.width * newScale * 0.2,
								y:
									annotationY + selectedAnnotation.rect.height * newScale * 0.2,
							});
						}
					}
				}
			};

			// Add a small debounce to avoid too many recalculations during resize
			let resizeTimeout: ReturnType<typeof setTimeout> | null = null;

			const debouncedResize = () => {
				if (resizeTimeout) {
					clearTimeout(resizeTimeout);
				}
				resizeTimeout = setTimeout(handleResize, 100);
			};

			window.addEventListener("resize", debouncedResize);
			return () => {
				window.removeEventListener("resize", debouncedResize);
				if (resizeTimeout) {
					clearTimeout(resizeTimeout);
				}
			};
		}, [fitToWidth, pdfDocument, originalPageWidth, selectedAnnotation]);

		useEffect(() => {
			setMode(annotationMode);
		}, [annotationMode, setMode]);

		useEffect(() => {
			setSelectedCategory(currentCategory);

			// If there are annotations and the category changes, update those without a category
			if (localAnnotations.length > 0 && currentCategory) {
				// Add the current category to annotations that don't have one
				const updatedAnnotations = localAnnotations.map((ann) => {
					if (!ann.category) {
						return {
							...ann,
							category: currentCategory,
							color: currentCategory.color,
						};
					}
					return ann;
				});

				// Call onAnnotationsChange if provided and if there are any changes
				if (
					onAnnotationsChange &&
					updatedAnnotations.some((a) => !a.category)
				) {
					onAnnotationsChange(updatedAnnotations);
				}
			}
		}, [currentCategory, localAnnotations, onAnnotationsChange]);

		// When the annotation mode changes or we deselect an annotation, reset the position
		useEffect(() => {
			if (currentMode !== AnnotationMode.NONE || !selectedAnnotation) {
				setSelectedAnnotationPosition(null);
			}
		}, [currentMode, selectedAnnotation]);

		const handlePageChange = (newPage: number) => {
			if (newPage >= 1 && newPage <= numPages) {
				setCurrentPage(newPage);

				if (onPageChange) {
					onPageChange(newPage);
				}
			}
		};

		const handleAnnotationModeChange = (mode: AnnotationMode) => {
			if (!viewOnly) {
				setMode(mode);

				if (onAnnotationModeChange) {
					onAnnotationModeChange(mode);
				}
			}
		};

		const handleCategoryChange = (
			category: CompetenciaInterface | undefined,
		) => {
			// Always allow changing the category for filtering purposes
			setSelectedCategory(category);

			// Call the onCategoryChange callback if provided
			if (onCategoryChange) {
				onCategoryChange(category);
			}
		};

		const handleAnnotationClick = (
			annotation: Annotation,
			event?: React.MouseEvent,
		) => {
			// Bail out if in any annotation mode other than NONE (selection mode)
			if (currentMode !== AnnotationMode.NONE) return;

			console.log("Annotation clicked:", annotation.id, annotation.type);

			// First, select the annotation
			selectAnnotation(annotation);

			// Then, explicitly set to show the dialog
			setShowDetailsDialog(true);

			// Position the details dialog near the mouse click
			if (event) {
				setSelectedAnnotationPosition({
					x: event.clientX,
					y: event.clientY,
				});
			} else {
				// If no click event (programmatic selection), position near the annotation
				const pageContainer = document.querySelector(
					`[data-page-number="${annotation.pageIndex + 1}"]`,
				);
				if (pageContainer) {
					const pageRect = pageContainer.getBoundingClientRect();
					const annotationX = pageRect.left + annotation.rect.x * scale;
					const annotationY = pageRect.top + annotation.rect.y * scale;

					setSelectedAnnotationPosition({
						x: annotationX + (annotation.rect.width * scale) / 2,
						y: annotationY - 20,
					});
				}
			}

			// Call the onAnnotationSelect callback if provided
			if (onAnnotationSelect) {
				onAnnotationSelect(annotation);
			}
		};

		const handleAnnotationUpdate = (
			id: string,
			updates: Partial<Annotation>,
		) => {
			if (!viewOnly) {
				updateAnnotation(id, updates);

				// Reset isNewAnnotation flag after an update
				setIsNewAnnotation(false);
			}
		};

		const handleCommentSubmit = (content: string) => {
			if (showCommentPopup && selectedAnnotation) {
				handleAnnotationUpdate(selectedAnnotation.id, { content });
				setShowCommentPopup(false);
			}
		};

		const handleAddComment = (point: Point, pageIndex: number) => {
			// point is already in unscaled coordinates thanks to the updated getRelativeCoordinates
			// but the popup needs to appear at the scaled position on screen
			setCommentPosition({
				x: point.x * scale,
				y: point.y * scale,
			});
			setShowCommentPopup(true);
		};

		// Handle adding text annotations
		const handleTextClick = (point: Point, pageIndex: number) => {
			if (currentMode === AnnotationMode.TEXT) {
				// Store the original unscaled position for annotation creation
				setTextPosition(point);
				setTextPageIndex(pageIndex);
				setShowTextPopup(true);
			}
		};

		const handleTextSubmit = (text: string) => {
			if (showTextPopup) {
				// Create a rectangle for the text - no need to adjust for scale here
				// since getRelativeCoordinates already adjusts for scale
				const rect = {
					x: textPosition.x,
					y: textPosition.y,
					width: 200, // Default width
					height: 100, // Default height
					pageIndex: textPageIndex,
				};

				// Get the color based on the current category
				const textAnnotationColor = getAnnotationTypeColor(AnnotationType.TEXT);

				// Create the text annotation with the appropriate color
				const newAnnotation = createAnnotation(AnnotationType.TEXT, rect, text);

				// Update the annotation with the correct color if needed
				if (newAnnotation.color !== textAnnotationColor) {
					updateAnnotation(newAnnotation.id, { color: textAnnotationColor });
				}

				// Set position for the details dialog
				if (lastMousePosition) {
					setSelectedAnnotationPosition(lastMousePosition);
				}

				// Set isNewAnnotation flag to true so details opens in edit mode
				setIsNewAnnotation(true);

				setShowTextPopup(false);
			}
		};

		const handleTextCancel = () => {
			setShowTextPopup(false);
		};

		// Handle adding pin annotations
		const handlePinClick = (point: Point, pageIndex: number) => {
			if (currentMode === AnnotationMode.PIN) {
				// Store the original unscaled position for annotation creation
				setPinPosition(point);
				setPinPageIndex(pageIndex);
				setShowPinPopup(true);
			}
		};

		const handlePinSubmit = (
			selectedTags: TagInterface[],
			content?: string,
		) => {
			if (showPinPopup) {
				// Create a rectangle for the pin (pins are just points)
				// No need to adjust for scale here since getRelativeCoordinates already adjusts for scale
				const rect = {
					x: pinPosition.x,
					y: pinPosition.y,
					width: 24, // Width for clickable area
					height: 24, // Height for clickable area
					pageIndex: pinPageIndex,
				};

				// Create the pin annotation
				const newAnnotation = createAnnotation(
					AnnotationType.PIN,
					rect,
					content || "",
				);

				// Update the annotation with tags and color
				updateAnnotation(newAnnotation.id, {
					tags: selectedTags,
				});

				// Set position for the details dialog
				if (lastMousePosition) {
					setSelectedAnnotationPosition(lastMousePosition);
				}

				// Set isNewAnnotation flag to true so details opens in edit mode
				setIsNewAnnotation(true);

				setShowPinPopup(false);
			}
		};

		const handlePinCancel = () => {
			setShowPinPopup(false);
		};

		const handleScaleChange = (newScale: number) => {
			setScale(newScale);
		};

		const handleFitToWidth = () => {
			if (pdfDocument && originalPageWidth && containerRef.current) {
				const containerWidth = containerRef.current.clientWidth - 40; // 40px for padding
				const newScale = containerWidth / originalPageWidth;
				setScale(newScale);
			}
		};

		const handleThicknessChange = (thickness: number) => {
			setAnnotationThickness(thickness);
		};

		// Remove old drawing strokes logic - now handled by session system

		// Old drawing modal handlers removed - using session system

		const renderPages = () => {
			if (!pdfDocument) return null;

			// Debug log all annotations to see their structure
			// console.log('All annotations:', localAnnotations);
			// console.log('Selected category:', selectedCategory);

			// First, try to normalize the category on annotations that might have invalid category structure
			const normalizedAnnotations = localAnnotations.map((ann) => {
				// Skip if the annotation doesn't have a category
				if (!ann.category) return ann;

				// Check if the category has a competencia property with the actual competencia id
				if (typeof ann.category.competencia === "undefined") {
					// console.warn('Found annotation with invalid category structure:', ann.id);

					// See if we can rebuild a valid category from what's available
					const fixedCategory = customCategories.find(
						(cc) =>
							cc.competencia.displayName === ann.category?.displayName ||
							cc.competencia.color === ann.category?.color,
					);

					if (fixedCategory) {
						// console.log('Fixed category for annotation:', ann.id, fixedCategory.competencia);
						return {
							...ann,
							category: fixedCategory.competencia,
						};
					}
				}

				return ann;
			});

			// Filter annotations by category if a category is selected
			const filteredAnnotations = selectedCategory
				? normalizedAnnotations.filter((a) => {
						// Skip annotations without category
						if (!a.category) {
							return false;
						}

						// Get the ID from the competencia for comparison
						let annotationCompetenciaId = null;

						// Handle different category structures
						if (typeof a.category.competencia === "number") {
							annotationCompetenciaId = a.category.competencia;
						} else if (
							a.category.competencia &&
							typeof a.category.competencia === "object"
						) {
							// Try to extract competencia from nested object if it exists
							annotationCompetenciaId = (
								a.category.competencia as unknown as CompetenciaInterface
							).competencia;
						}

						// Same for the selected category
						let selectedCompetenciaId = null;

						if (typeof selectedCategory.competencia === "number") {
							selectedCompetenciaId = selectedCategory.competencia;
						} else if (
							selectedCategory.competencia &&
							typeof selectedCategory.competencia === "object"
						) {
							selectedCompetenciaId = (
								selectedCategory.competencia as unknown as CompetenciaInterface
							).competencia;
						}

						// Log the comparison for debugging
						// console.log('Annotation comparison:', {
						//   annotationId: a.id,
						//   annotationCategory: a.category,
						//   annotationCompetenciaId,
						//   selectedCategory,
						//   selectedCompetenciaId,
						//   match: annotationCompetenciaId === selectedCompetenciaId
						// });

						return annotationCompetenciaId === selectedCompetenciaId;
					})
				: normalizedAnnotations;

			// console.log('Filtering annotations:', {
			//   totalAnnotations: localAnnotations.length,
			//   normalizedAnnotations: normalizedAnnotations.length,
			//   selectedCategory: selectedCategory?.competencia,
			//   filteredCount: filteredAnnotations.length
			// });

			const pages = [];
			for (let i = 1; i <= numPages; i++) {
				if (
					i === currentPage ||
					i === currentPage - 1 ||
					i === currentPage + 1
				) {
					pages.push(
						<PdfPage
							key={i}
							pdfDocument={pdfDocument}
							pageNumber={i}
							scale={scale}
							annotations={filteredAnnotations.filter(
								(a) => a.pageIndex === i - 1,
							)}
							onAnnotationClick={handleAnnotationClick}
							onPointerDown={handlePointerDown}
							onPointerMove={handlePointerMove}
							onPointerUp={handlePointerUp}
							onCommentAdd={handleAddComment}
							onTextClick={handleTextClick}
							activeDrawingPoints={
								drawingStrokes.length > 0 ? drawingStrokes[0] : []
							}
							isDrawing={isDrawing}
							drawingColor={drawingColor}
							drawingThickness={annotationThickness}
							selectedAnnotation={selectedAnnotation}
							currentMode={currentMode}
							startPoint={
								isDrawing &&
								drawingStrokes.length > 0 &&
								drawingStrokes[0].length > 0
									? drawingStrokes[0][0]
									: null
							}
							activeDrawingStrokes={drawingStrokes}
							annotationSession={activeAnnotationSession}
							sessionControls={activeSessionControls}
							showSessionControls={!viewOnly}
						/>,
					);
				}
			}
			return pages;
		};

		// Helper function to get the color for a specific annotation type
		const getAnnotationTypeColor = (type: AnnotationType): string => {
			// If we have a selected category, use its color
			if (selectedCategory) {
				return selectedCategory.color;
			}

			// Otherwise use the default color based on annotation type
			switch (type) {
				case AnnotationType.HIGHLIGHT:
					return highlightColor || "rgba(255, 255, 0, 0.3)";
				case AnnotationType.UNDERLINE:
					return underlineColor || "rgba(0, 100, 255, 0.7)";
				case AnnotationType.STRIKEOUT:
					return strikeoutColor || "rgba(255, 0, 0, 0.5)";
				case AnnotationType.RECTANGLE:
					return rectangleColor || "rgba(255, 0, 0, 0.3)";
				case AnnotationType.DRAWING:
					return drawingColor || "rgba(255, 0, 0, 0.7)";
				case AnnotationType.TEXT:
					return textColor || "rgba(0, 0, 0, 1)";
				case AnnotationType.COMMENT:
					return commentColor || "rgba(255, 255, 0, 0.7)";
				case AnnotationType.PIN:
					return pinColor;
				default:
					return "rgba(0, 0, 0, 1)";
			}
		};

		// Helper function to get the PDF page dimensions at current scale
		const getPageDimensions = (pageIndex: number) => {
			if (!pdfDocument) return { width: 0, height: 0 };

			// Use a fallback for pages that haven't been rendered yet
			return {
				width: originalPageWidth ? originalPageWidth * scale : 0,
				height: 0, // We don't need the height for horizontal boundaries
			};
		};

		// Helper function for smart dialog positioning
		const calculateSmartDialogPosition = (
			annotationRect: DOMRect,
			annotationX: number,
			annotationY: number,
		) => {
			// Dialog dimensions (estimate)
			const dialogWidth = 360; // Default width of annotation dialog
			const dialogHeight = 300; // Estimate average height

			// Viewport dimensions
			const viewportWidth = window.innerWidth;
			const viewportHeight = window.innerHeight;

			// First try: Position to the right of annotation
			let xPos = annotationX + annotationRect.width * scale + 20;
			let yPos = annotationY;

			// If too close to right edge, try left side
			if (xPos + dialogWidth > viewportWidth - 20) {
				xPos = annotationX - dialogWidth - 20;
			}

			// If too close to left edge, center horizontally over annotation
			if (xPos < 20) {
				xPos =
					annotationX + (annotationRect.width * scale) / 2 - dialogWidth / 2;
			}

			// Ensure y-position keeps dialog within viewport
			if (yPos + dialogHeight > viewportHeight - 20) {
				yPos = viewportHeight - dialogHeight - 20;
			}

			if (yPos < 20) {
				yPos = 20;
			}

			return { x: xPos, y: yPos };
		};

		return (
			<div className="flex flex-col w-full h-full overflow-hidden bg-gray-100 pdf-annotator">
				<div className="bg-white shadow-md">
					<ToolBar
						currentMode={currentMode}
						onModeChange={handleAnnotationModeChange}
						currentPage={currentPage}
						numPages={numPages}
						onPageChange={handlePageChange}
						currentCategory={selectedCategory}
						onCategoryChange={handleCategoryChange}
						customCategories={CompetenciaInterfaces}
						scale={scale}
						onScaleChange={handleScaleChange}
						onFitToWidth={handleFitToWidth}
						currentThickness={annotationThickness}
						onThicknessChange={handleThicknessChange}
						viewOnly={viewOnly}
					/>
				</div>

				<div
					className="relative flex-grow overflow-auto"
					ref={containerRef}
					style={{
						height: "calc(100vh - 60px)", // Adjust based on toolbar height
						backgroundColor: "#f5f5f5",
					}}
				>
					<div
						className="flex flex-col items-center min-h-full px-4 py-4"
						style={{
							width: "100%",
						}}
					>
						<div
							style={{
								display: "flex",
								flexDirection: "column",
								alignItems: "center",
								gap: "2rem",
								width: "fit-content",
								margin: "0 auto",
							}}
						>
							{renderPages()}
						</div>
					</div>
				</div>

				{/* Annotation Details Panel when an annotation is selected AND we should show the dialog */}
				{selectedAnnotation && showDetailsDialog && (
					<AnnotationDetails
						key={`annotation-details-${selectedAnnotation.id}`}
						annotation={selectedAnnotation}
						onClose={() => selectAnnotation(null)}
						onUpdate={handleAnnotationUpdate}
						onDelete={deleteAnnotation}
						position={selectedAnnotationPosition || undefined}
						isNew={isNewAnnotation}
						customCategories={customCategories}
						viewOnly={viewOnly}
						onAnnotationsChange={onAnnotationsChange}
					/>
				)}

				{/* Comment Popup */}
				{showCommentPopup && (
					<CommentPopup
						position={commentPosition}
						onSubmit={handleCommentSubmit}
						onCancel={() => setShowCommentPopup(false)}
					/>
				)}

				{/* Text Input Popup */}
				{showTextPopup && (
					<TextInputPopup
						position={{
							x: textPosition.x * scale,
							y: textPosition.y * scale,
						}}
						onSubmit={handleTextSubmit}
						onCancel={handleTextCancel}
					/>
				)}

				{/* Pin Popup */}
				{/* TODO: Add Pin Popup */}

				{/* Old drawing modal removed - using session system instead */}
			</div>
		);
	},
);

// Helper function to get annotations JSON without ref
export const getAnnotationsJSON = (annotations: Annotation[]): string => {
	return annotationsToJSON(annotations);
};
