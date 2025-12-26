import { CompetenciaInterface } from 'lingapp-revisao-redacao';
import { Annotation, AnnotationMode, AnnotationRect, AnnotationType, Point } from './types';
import { v4 as uuidv4 } from 'uuid';

// Helper function to generate MongoDB-like ObjectId
const generateMongoLikeId = (): string => {
  // ObjectId format: 24 hex chars (12 bytes)
  // Format: 4 bytes timestamp + 5 bytes random + 3 bytes counter
  
  // Get current timestamp (4 bytes - 8 hex chars)
  const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
  
  // Generate random part (16 hex chars to make 24 total)
  const random = uuidv4().replace(/-/g, '').substring(0, 16);
  
  return timestamp + random;
};

export const createAnnotation = (
  type: AnnotationType,
  rect: { x: number; y: number; width: number; height: number; pageIndex: number },
  content: string = '',
  color: string = 'rgba(255, 0, 0, 0.5)',
  category?: CompetenciaInterface
): Annotation => {
  return {
    id: generateMongoLikeId(),
    type,
    rect,
    pageIndex: rect.pageIndex,
    color: color,
    content,
    createdAt: new Date(),
    category,
  };
};

export const getAnnotationColor = (
  type: AnnotationType,
  category?: CompetenciaInterface,
  categoryColors?: Record<string, string>
): string => {
  if (category) {
    return category.color;
  }

  switch (type) {
    case AnnotationType.HIGHLIGHT:
      return 'rgba(255, 255, 0, 0.3)';
    case AnnotationType.UNDERLINE:
      return 'rgba(0, 100, 255, 0.7)';
    case AnnotationType.STRIKEOUT:
      return 'rgba(255, 0, 0, 0.5)';
    case AnnotationType.RECTANGLE:
      return 'rgba(255, 0, 0, 0.3)';
    case AnnotationType.DRAWING:
    case AnnotationType.HIGHLIGHTING:
      return 'rgba(255, 0, 0, 0.7)';
    case AnnotationType.TEXT:
      return 'rgba(0, 0, 0, 1)';
    case AnnotationType.COMMENT:
      return 'rgba(255, 255, 0, 0.7)';
    case AnnotationType.PIN:
      return 'rgba(249, 115, 22, 0.7)'; // Default orange
    default:
      return 'rgba(0, 0, 0, 1)';
  }
};

export const annotationModeToType = (mode: AnnotationMode): AnnotationType => {
  switch (mode) {
    case AnnotationMode.HIGHLIGHT:
      return AnnotationType.HIGHLIGHT;
    case AnnotationMode.UNDERLINE:
      return AnnotationType.UNDERLINE;
    case AnnotationMode.STRIKEOUT:
      return AnnotationType.STRIKEOUT;
    case AnnotationMode.RECTANGLE:
      return AnnotationType.RECTANGLE;
    case AnnotationMode.DRAWING:
      return AnnotationType.DRAWING;
    case AnnotationMode.HIGHLIGHTING:
      return AnnotationType.HIGHLIGHTING;
    case AnnotationMode.TEXT:
      return AnnotationType.TEXT;
    case AnnotationMode.COMMENT:
      return AnnotationType.COMMENT;
    case AnnotationMode.PIN:
      return AnnotationType.PIN;
    default:
      return AnnotationType.HIGHLIGHT;
  }
};

export const calculateRectFromPoints = (
  startPoint: Point,
  endPoint: Point,
  pageIndex: number
): AnnotationRect => {
  const x = Math.min(startPoint.x, endPoint.x);
  const y = Math.min(startPoint.y, endPoint.y);
  const width = Math.abs(endPoint.x - startPoint.x);
  const height = Math.abs(endPoint.y - startPoint.y);

  return { x, y, width, height, pageIndex };
};

export const pointsToSvgPath = (points: Point[]): string => {
  if (points.length === 0) return '';
  
  let path = `M ${points[0].x} ${points[0].y}`;
  
  for (let i = 1; i < points.length; i++) {
    path += ` L ${points[i].x} ${points[i].y}`;
  }
  
  return path;
};

// Define default category colors with numeric keys
export const DEFAULT_CATEGORY_COLORS: Record<number, string> = {
  1: '#FF5733', // Competencia 1
  2: '#33FF57', // Competencia 2
  3: '#3357FF', // Competencia 3
  4: '#F333FF', // Competencia 4
  5: '#FF33F3', // Competencia 5
  0: '#777777', // Default/Other
};

// Get color for a category
export const getCategoryColor = (
  category?: CompetenciaInterface | null
): string => {
  if (!category) return DEFAULT_CATEGORY_COLORS[0]; // Default color
  
  // Use the color from the CompetenciaInterface
  if (category.color) {
    return category.color;
  }
  
  // Fallback to default colors if no color is specified
  return DEFAULT_CATEGORY_COLORS[category.competencia] || DEFAULT_CATEGORY_COLORS[0];
};

// Get the display name for a category
export const getCategoryDisplayName = (
  category?: CompetenciaInterface | null
): string => {
  if (!category) return 'Sem categoria';
  
  // If we have a display name, use it
  if (category.displayName) {
    return category.displayName;
  }
  
  // Default competency names if no display name is available
  switch (category.competencia) {
    case 1:
      return 'Competência 1';
    case 2:
      return 'Competência 2';
    case 3:
      return 'Competência 3';
    case 4:
      return 'Competência 4';
    case 5:
      return 'Competência 5';
    default:
      return `Competência ${category.competencia}`;
  }
};

// Convert annotations to JSON string
export const annotationsToJSON = (annotations: Annotation[]): string => {
  // Create a deep copy and serialize dates
  const serializable = annotations.map(annotation => ({
    ...annotation,
    createdAt: annotation.createdAt.toISOString(),
    updatedAt: annotation.updatedAt ? annotation.updatedAt.toISOString() : undefined
  }));
  
  return JSON.stringify(serializable);
};

// Calculate distance between two points
export const distance = (p1: Point, p2: Point): number => {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}; 