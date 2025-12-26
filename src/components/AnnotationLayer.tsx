import React, { useMemo } from "react";
import {
  Annotation,
  AnnotationType,
  Point,
  AnnotationMode,
  AnnotationSession,
  SessionControls,
} from "../types";
import { pointsToSvgPath, calculateRectFromPoints } from "../utils";
import { IoInformationCircle } from "react-icons/io5";
import { FaExclamationCircle } from "react-icons/fa";
import { AnnotationSessionControls } from "./AnnotationSessionControls";

interface AnnotationLayerProps {
  annotations: Annotation[];
  pageIndex: number;
  scale: number;
  onAnnotationClick?: (
    annotation: Annotation,
    event?: React.MouseEvent
  ) => void;
  activeDrawingPoints?: Point[];
  isDrawing?: boolean;
  drawingColor?: string;
  drawingThickness?: number;
  selectedAnnotation?: Annotation | null;
  currentMode?: AnnotationMode;
  startPoint?: Point | null;
  originalWidth?: number;
  originalHeight?: number;
  activeDrawingStrokes?: Point[][];
  annotationSession?: AnnotationSession;
  sessionControls?: SessionControls;
  showSessionControls?: boolean;
}

export const AnnotationLayer: React.FC<AnnotationLayerProps> = ({
  annotations,
  pageIndex,
  scale,
  onAnnotationClick,
  activeDrawingPoints = [],
  isDrawing = false,
  drawingColor = "rgba(255, 0, 0, 0.7)", // Default red color
  drawingThickness,
  selectedAnnotation = null,
  currentMode = AnnotationMode.DRAWING,
  startPoint = null,
  originalWidth = 0,
  originalHeight = 0,
  activeDrawingStrokes = [],
  annotationSession,
  sessionControls,
  showSessionControls = true,
}) => {
  const pageAnnotations = useMemo(
    () =>
      annotations.filter((annotation) => annotation.pageIndex === pageIndex),
    [annotations, pageIndex]
  );

  // Function to transform normalized coordinates (0-1) to viewport coordinates
  const normalizedToViewport = (point: Point): Point => {
    if (originalWidth === 0 || originalHeight === 0) {
      return point;
    }

    // Convert from normalized (0-1) to absolute PDF coordinates
    const pdfX = point.x * originalWidth;
    const pdfY = point.y * originalHeight;

    // Keep the coordinates in PDF space (don't multiply by scale)
    // The SVG container will handle the scaling
    return { x: pdfX, y: pdfY };
  };

  // Function to transform rect with normalized coordinates to viewport coordinates
  const transformRect = (rect: {
    x: number;
    y: number;
    width: number;
    height: number;
  }) => {
    if (originalWidth === 0 || originalHeight === 0) {
      return rect;
    }

    // Convert from normalized coordinates to absolute PDF coordinates
    const pdfX = rect.x * originalWidth;
    const pdfY = rect.y * originalHeight;
    const pdfWidth = rect.width * originalWidth;
    const pdfHeight = rect.height * originalHeight;

    return {
      x: pdfX,
      y: pdfY,
      width: pdfWidth,
      height: pdfHeight,
    };
  };

  // Transform array of points from normalized to viewport coordinates
  const transformPoints = (points: Point[]): Point[] => {
    return points.map((point) => normalizedToViewport(point));
  };

  // Function to get a representative color for tags
  const getTagColor = (annotation: Annotation): string => {
    if (annotation.color) return annotation.color;
    return "#f97316"; // Orange default for pins
  };

  // Function to check if an annotation is selected
  const isSelected = (annotation: Annotation): boolean => {
    return selectedAnnotation?.id === annotation.id;
  };

  // Get additional styling for selected annotations
  const getSelectedStyle = (annotation: Annotation) => {
    if (isSelected(annotation)) {
      // Return appropriate styling based on annotation type
      switch (annotation.type) {
        case AnnotationType.HIGHLIGHTING:
          return {
            strokeWidth: 8,
            opacity: 0.9,
            filter: "drop-shadow(0 3px 6px rgba(2, 51, 129, 0.7))",
          }; // Blue glow effect
        case AnnotationType.RECTANGLE:
        case AnnotationType.UNDERLINE:
        case AnnotationType.STRIKEOUT:
        case AnnotationType.DRAWING:
        case AnnotationType.TEXT:
        case AnnotationType.COMMENT:
        case AnnotationType.PIN:
          return {
            strokeWidth: 8,
            filter: "drop-shadow(0 3px 6px rgba(2, 51, 129, 0.7))",
          }; // Blue glow effect
        default:
          return {};
      }
    }
    return {};
  };

  // Helper function to get the appropriate stroke width for the current mode
  const getStrokeWidth = () => {
    if (drawingThickness !== undefined) {
      return drawingThickness;
    }

    // Fall back to default values if no thickness is provided
    switch (currentMode) {
      case AnnotationMode.DRAWING:
        return 2;
      case AnnotationMode.HIGHLIGHTING:
        return 10;
      case AnnotationMode.STRIKEOUT:
        return 2;
      case AnnotationMode.RECTANGLE:
        return 2;
      default:
        return 2;
    }
  };

  // Create a dynamic viewBox to ensure annotations render at the correct scale
  // Use original PDF dimensions for the viewBox to ensure correct scaling
  const viewBox = `0 0 ${originalWidth} ${originalHeight}`;

  return (
    <div
      className="absolute top-0 left-0 w-full h-full pointer-events-none"
      style={{ transformOrigin: "top left" }}
    >
      <svg
        className="annotation-layer"
        width="100%"
        height="100%"
        viewBox={viewBox}
        preserveAspectRatio="none"
        style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
      >
        {pageAnnotations.map((annotation) => {
          const { id, type, rect, color, points, thickness } = annotation;

          // Transform normalized coordinates to viewport coordinates
          const transformedRect = transformRect(rect);

          // Get selected styling if applicable
          const selectedStyle = getSelectedStyle(annotation);

          switch (type) {
            case AnnotationType.HIGHLIGHT:
              return (
                <rect
                  key={id}
                  x={transformedRect.x}
                  y={transformedRect.y}
                  width={transformedRect.width}
                  height={transformedRect.height}
                  fill={color}
                  onClick={(e) => onAnnotationClick?.(annotation, e)}
                  className="cursor-pointer pointer-events-auto annotation"
                  data-annotation-id={id}
                  data-annotation-type={type}
                  {...selectedStyle}
                />
              );
            case AnnotationType.UNDERLINE:
              return (
                <line
                  key={id}
                  x1={transformedRect.x}
                  y1={transformedRect.y + transformedRect.height}
                  x2={transformedRect.x + transformedRect.width}
                  y2={transformedRect.y + transformedRect.height}
                  stroke={color}
                  strokeWidth={thickness || 2}
                  onClick={(e) => onAnnotationClick?.(annotation, e)}
                  className="cursor-pointer pointer-events-auto annotation"
                  data-annotation-id={id}
                  data-annotation-type={type}
                  {...selectedStyle}
                />
              );
            case AnnotationType.STRIKEOUT:
              return (
                <line
                  key={id}
                  x1={transformedRect.x}
                  y1={transformedRect.y + transformedRect.height / 2}
                  x2={transformedRect.x + transformedRect.width}
                  y2={transformedRect.y + transformedRect.height / 2}
                  stroke={color}
                  strokeWidth={thickness || 2}
                  onClick={(e) => onAnnotationClick?.(annotation, e)}
                  className="cursor-pointer pointer-events-auto annotation"
                  data-annotation-id={id}
                  data-annotation-type={type}
                  {...selectedStyle}
                />
              );
            case AnnotationType.RECTANGLE:
              return (
                <rect
                  key={id}
                  x={transformedRect.x}
                  y={transformedRect.y}
                  width={transformedRect.width}
                  height={transformedRect.height}
                  stroke={color}
                  strokeWidth={thickness || 2}
                  fill="none"
                  onClick={(e) => onAnnotationClick?.(annotation, e)}
                  className="cursor-pointer pointer-events-auto annotation"
                  data-annotation-id={id}
                  data-annotation-type={type}
                  {...selectedStyle}
                />
              );
            case AnnotationType.DRAWING:
              if (!points || points.length === 0) return null;
              // Render each stroke in points (array of arrays)
              return points.map((stroke, idx) => {
                if (!stroke || stroke.length < 2) return null;
                const transformedPoints = transformPoints(stroke);
                const pathData = pointsToSvgPath(transformedPoints);
                return (
                  <path
                    key={id + "-" + idx}
                    d={pathData}
                    stroke={color}
                    strokeWidth={thickness || 4}
                    fill="none"
                    onClick={(e) => onAnnotationClick?.(annotation, e)}
                    className="cursor-pointer pointer-events-auto annotation"
                    data-annotation-id={id}
                    data-annotation-type={type}
                    {...selectedStyle}
                  />
                );
              });
            case AnnotationType.HIGHLIGHTING:
              if (!points || points.length === 0) return null;
              // Render each stroke in points (array of arrays)
              return points.map((stroke, idx) => {
                if (!stroke || stroke.length < 2) return null;
                const transformedHighlightPoints = transformPoints(stroke);
                const highlightingPathData = pointsToSvgPath(
                  transformedHighlightPoints
                );
                return (
                  <path
                    key={id + "-" + idx}
                    d={highlightingPathData}
                    stroke={color}
                    strokeWidth={thickness || 20}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    opacity={0.6}
                    onClick={(e) => onAnnotationClick?.(annotation, e)}
                    className="cursor-pointer pointer-events-auto annotation"
                    data-annotation-id={id}
                    data-annotation-type={type}
                    {...selectedStyle}
                  />
                );
              });
            case AnnotationType.TEXT:
              return (
                <foreignObject
                  key={id}
                  x={transformedRect.x}
                  y={transformedRect.y}
                  width={transformedRect.width || 150}
                  height={transformedRect.height || 50}
                  onClick={(e) => onAnnotationClick?.(annotation, e)}
                  className="cursor-pointer pointer-events-auto annotation"
                  data-annotation-id={id}
                  data-annotation-type={type}
                  style={selectedStyle}
                >
                  <div
                    className="p-1.5 font-sans text-xs"
                    style={{
                      color: color || "#000",
                      ...(isSelected(annotation)
                        ? { backgroundColor: "rgba(59, 130, 246, 0.1)" }
                        : {}),
                    }}
                  >
                    {annotation.content || ""}
                  </div>
                </foreignObject>
              );
            case AnnotationType.COMMENT:
              return (
                <g
                  key={id}
                  onClick={(e) => onAnnotationClick?.(annotation, e)}
                  className="cursor-pointer pointer-events-auto annotation"
                  data-annotation-id={id}
                  data-annotation-type={type}
                  style={selectedStyle}
                >
                  <circle
                    cx={transformedRect.x}
                    cy={transformedRect.y}
                    r={10}
                    fill={color || "#FFC107"}
                  />
                  <foreignObject
                    x={transformedRect.x - 7}
                    y={transformedRect.y - 7}
                    width={14}
                    height={14}
                    style={{ overflow: "visible" }}
                  >
                    <div className="flex items-center justify-center w-full h-full text-white">
                      <FaExclamationCircle size={10} />
                    </div>
                  </foreignObject>
                </g>
              );
            case AnnotationType.PIN:
              // For PIN type annotations, we need special handling to ensure they appear at a consistent size
              const transformedPoint = normalizedToViewport({
                x: rect.x,
                y: rect.y,
              });
              return (
                <g
                  key={id}
                  transform={`translate(${transformedPoint.x}, ${transformedPoint.y})`}
                  onClick={(e) => onAnnotationClick?.(annotation, e)}
                  className="cursor-pointer pointer-events-auto annotation"
                  data-annotation-id={id}
                  data-annotation-type={type}
                  style={selectedStyle}
                >
                  <circle
                    cx={0}
                    cy={0}
                    r={12} // Fixed size (the viewBox handles the scaling)
                    fill={getTagColor(annotation)}
                    opacity={0.7}
                  />
                  <foreignObject
                    x={-10}
                    y={-10}
                    width={20}
                    height={20}
                    className="flex items-center justify-center"
                  >
                    <div className="flex items-center justify-center w-full h-full">
                      {annotation.tags &&
                      annotation.tags.length > 0 &&
                      annotation.tags[0].tipo === "alert" ? (
                        <FaExclamationCircle className="text-white" />
                      ) : (
                        <IoInformationCircle className="text-white" />
                      )}
                    </div>
                  </foreignObject>
                </g>
              );
            default:
              return null;
          }
        })}

        {/* Draw active drawing points if in drawing mode */}
        {isDrawing && activeDrawingPoints.length > 1 && (
          <path
            d={pointsToSvgPath(transformPoints(activeDrawingPoints))}
            stroke={drawingColor}
            strokeWidth={getStrokeWidth()}
            fill="none"
            pointerEvents="none"
          />
        )}

        {/* Show rectangle preview when in Rectangle mode */}
        {currentMode === AnnotationMode.RECTANGLE && startPoint && (
          <rect
            x={normalizedToViewport(startPoint).x}
            y={normalizedToViewport(startPoint).y}
            width={0}
            height={0}
            stroke={drawingColor}
            strokeWidth={getStrokeWidth()}
            fill="none"
            pointerEvents="none"
          />
        )}

        {/* SESSION RENDERING */}
        {annotationSession &&
          annotationSession.isActive &&
          annotationSession.pageIndex === pageIndex && (
            <>
              {/* Render completed strokes */}
              {annotationSession.strokes.map((stroke, strokeIndex) => (
                <path
                  key={`session-stroke-${strokeIndex}`}
                  d={pointsToSvgPath(transformPoints(stroke))}
                  stroke={drawingColor}
                  strokeWidth={drawingThickness || 3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  opacity={0.7}
                  pointerEvents="none"
                  className="session-completed-stroke"
                  style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.1))" }}
                />
              ))}
              {/* Render current stroke */}
              {isDrawing && annotationSession.currentStroke.length > 1 && (
                <path
                  d={pointsToSvgPath(
                    transformPoints(annotationSession.currentStroke)
                  )}
                  stroke={drawingColor}
                  strokeWidth={drawingThickness || 3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  opacity={1}
                  pointerEvents="none"
                  className="session-current-stroke"
                  style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))" }}
                />
              )}
              {/* Render bounding box */}
              {annotationSession.boundingBox && (
                <rect
                  x={
                    normalizedToViewport({
                      x: annotationSession.boundingBox.x,
                      y: annotationSession.boundingBox.y,
                    }).x
                  }
                  y={
                    normalizedToViewport({
                      x: annotationSession.boundingBox.x,
                      y: annotationSession.boundingBox.y,
                    }).y
                  }
                  width={annotationSession.boundingBox.width * originalWidth}
                  height={annotationSession.boundingBox.height * originalHeight}
                  stroke="rgba(0, 123, 255, 0.3)"
                  strokeWidth={1}
                  strokeDasharray="5,5"
                  fill="none"
                  pointerEvents="none"
                  className="session-bounding-box"
                />
              )}
            </>
          )}
      </svg>
      {/* Render in-progress drawing strokes as overlay */}
      {activeDrawingStrokes && activeDrawingStrokes.length > 0 && (
        <svg
          width="100%"
          height="100%"
          viewBox={viewBox}
          preserveAspectRatio="xMinYMin meet"
          className="absolute top-0 left-0 pointer-events-none"
          style={{ zIndex: 10 }}
        >
          {activeDrawingStrokes.map((stroke, idx) =>
            stroke.length > 1 ? (
              <polyline
                key={"active-stroke-" + idx}
                points={stroke
                  .map(
                    (p) =>
                      `${normalizedToViewport(p).x},${
                        normalizedToViewport(p).y
                      }`
                  )
                  .join(" ")}
                fill="none"
                stroke={drawingColor || "#888"}
                strokeWidth={drawingThickness || 3}
                opacity={0.5}
                strokeDasharray="6,4"
              />
            ) : null
          )}
        </svg>
      )}
      {/* SESSION CONTROLS OVERLAY */}
      {showSessionControls &&
        annotationSession &&
        annotationSession.isActive &&
        annotationSession.pageIndex === pageIndex &&
        sessionControls && (
          <AnnotationSessionControls
            isActive={annotationSession.isActive}
            strokeCount={annotationSession.strokes.length}
            onFinalize={sessionControls.finalize}
            onCancel={sessionControls.cancel}
            onUndoLastStroke={sessionControls.undoLastStroke}
          />
        )}
    </div>
  );
};
