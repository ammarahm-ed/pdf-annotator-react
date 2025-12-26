import type {
	CompetenciaInterface,
	CompetenciaWithTags,
	TagInterface,
} from "lingapp-revisao-redacao";

export type Point = {
	x: number;
	y: number;
};

export type AnnotationRect = {
	x: number;
	y: number;
	width: number;
	height: number;
	pageIndex: number;
};

export enum AnnotationType {
	HIGHLIGHT = "highlight",
	UNDERLINE = "underline",
	STRIKEOUT = "strikeout",
	RECTANGLE = "rectangle",
	DRAWING = "drawing",
	HIGHLIGHTING = "highlighting",
	TEXT = "text",
	COMMENT = "comment",
	PIN = "pin",
}

export interface Annotation {
	id: string;
	type: AnnotationType;
	rect: AnnotationRect;
	pageIndex: number;
	color: string;
	content: string;
	points?: Point[][];
	tags?: TagInterface[];
	createdAt: Date;
	updatedAt?: Date;
	category?: CompetenciaInterface;
	thickness?: number; // Add thickness property to store stroke width
}

export type AnnotationEventCallbacks = {
	onAnnotationCreate?: (annotation: Annotation) => void;
	onAnnotationUpdate?: (annotation: Annotation) => void;
	onAnnotationDelete?: (annotationId: string) => void;
	onAnnotationSelect?: (annotation: Annotation | null) => void;
};

export enum AnnotationMode {
	NONE = "none",
	HIGHLIGHT = "highlight",
	UNDERLINE = "underline",
	STRIKEOUT = "strikeout",
	RECTANGLE = "rectangle",
	DRAWING = "drawing",
	HIGHLIGHTING = "highlighting",
	TEXT = "text",
	COMMENT = "comment",
	PIN = "pin",
}

export type PDFAnnotatorProps = {
	url: string;
	annotations?: Annotation[];
	scale?: number;
	pageNumber?: number;
	onDocumentLoadSuccess?: (numPages: number) => void;
	onPageChange?: (pageNumber: number) => void;
	annotationMode?: AnnotationMode;
	onAnnotationModeChange?: (mode: AnnotationMode) => void;
	currentCategory?: CompetenciaInterface; // Current selected category
	onCategoryChange?: (category: CompetenciaInterface | undefined) => void; // Callback when category changes
	onAnnotationsChange?: (annotations: Annotation[]) => void; // Callback when annotations array changes
	customCategories?: CompetenciaWithTags[]; // Categories with their associated tags
	highlightColor?: string;
	underlineColor?: string;
	strikeoutColor?: string;
	rectangleColor?: string;
	drawingColor?: string;
	textColor?: string;
	commentColor?: string;
	pinColor?: string;
	highlightingColor?: string; // Prop for the highlighting marker color
	pdfWorkerSrc?: string;
	fitToWidth?: boolean;
	defaultThickness?: number; // Default thickness for annotations
	viewOnly?: boolean; // Whether the component is in view-only mode (cannot edit annotations)
	annotationSession?: AnnotationSession; // Session state for multi-stroke drawing
	sessionControls?: SessionControls; // Controls for annotation sessions
} & AnnotationEventCallbacks;

export interface AnnotationSession {
	isActive: boolean;
	strokes: Point[][];
	currentStroke: Point[];
	boundingBox: AnnotationRect | null;
	pageIndex: number;
	startTime: Date;
}

export interface SessionControls {
	finalize: () => void;
	cancel: () => void;
	undoLastStroke: () => void;
	addStroke: (points: Point[]) => void;
}
