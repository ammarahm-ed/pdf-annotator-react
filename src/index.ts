// Import the Tailwind CSS styles
import "./styles/tailwind.css";

// Components
export { PdfAnnotator, getAnnotationsJSON } from "./PdfAnnotator";
export type { PdfAnnotatorRef } from "./PdfAnnotator";
export { PdfPage } from "./components/PdfPage";
export { AnnotationLayer } from "./components/AnnotationLayer";
export { ToolBar } from "./components/ToolBar";
export { AnnotationDetails } from "./components/AnnotationDetails";
export { CommentPopup } from "./components/CommentPopup";
export { SessionDebugger } from "./components/SessionDebugger";

// Hooks
export { useAnnotations } from "./hooks/useAnnotations";

// Types
export { AnnotationType, AnnotationMode } from "./types";
export type {
	Point,
	AnnotationRect,
	Annotation,
	AnnotationEventCallbacks,
	PDFAnnotatorProps,
	AnnotationSession,
	SessionControls,
} from "./types";

// Utils
export {
	createAnnotation,
	getAnnotationColor,
	annotationModeToType,
	calculateRectFromPoints,
	pointsToSvgPath,
	DEFAULT_CATEGORY_COLORS,
	getCategoryColor,
	getCategoryDisplayName,
	annotationsToJSON,
} from "./utils";
