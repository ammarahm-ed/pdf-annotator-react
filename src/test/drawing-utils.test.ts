import { describe, it, expect } from 'vitest'
import { Point, AnnotationRect } from '../types'

// Test utilities for drawing calculations
describe('Drawing Utilities', () => {
  describe('Bounding Box Calculation', () => {
    it('should calculate correct bounding box from single stroke', () => {
      const points: Point[] = [
        { x: 100, y: 100 },
        { x: 150, y: 120 },
        { x: 200, y: 80 },
        { x: 180, y: 200 }
      ]

      const calculateBoundingBox = (points: Point[], pageIndex: number): AnnotationRect => {
        if (points.length === 0) {
          return { x: 0, y: 0, width: 0, height: 0, pageIndex }
        }

        let minX = Number.MAX_VALUE
        let minY = Number.MAX_VALUE
        let maxX = Number.MIN_VALUE
        let maxY = Number.MIN_VALUE

        for (const point of points) {
          minX = Math.min(minX, point.x)
          minY = Math.min(minY, point.y)
          maxX = Math.max(maxX, point.x)
          maxY = Math.max(maxY, point.y)
        }

        return {
          x: minX,
          y: minY,
          width: maxX - minX,
          height: maxY - minY,
          pageIndex
        }
      }

      const boundingBox = calculateBoundingBox(points, 0)

      expect(boundingBox.x).toBe(100)
      expect(boundingBox.y).toBe(80)
      expect(boundingBox.width).toBe(100) // 200 - 100
      expect(boundingBox.height).toBe(120) // 200 - 80
      expect(boundingBox.pageIndex).toBe(0)
    })

    it('should calculate correct bounding box from multiple strokes', () => {
      const strokes: Point[][] = [
        [
          { x: 100, y: 100 },
          { x: 200, y: 150 }
        ],
        [
          { x: 50, y: 80 },
          { x: 180, y: 220 }
        ],
        [
          { x: 300, y: 90 },
          { x: 250, y: 180 }
        ]
      ]

      const calculateMultiStrokeBoundingBox = (strokes: Point[][], pageIndex: number): AnnotationRect => {
        const allPoints = strokes.flat()
        return calculateBoundingBox(allPoints, pageIndex)
      }

      const calculateBoundingBox = (points: Point[], pageIndex: number): AnnotationRect => {
        if (points.length === 0) {
          return { x: 0, y: 0, width: 0, height: 0, pageIndex }
        }

        let minX = Number.MAX_VALUE
        let minY = Number.MAX_VALUE
        let maxX = Number.MIN_VALUE
        let maxY = Number.MIN_VALUE

        for (const point of points) {
          minX = Math.min(minX, point.x)
          minY = Math.min(minY, point.y)
          maxX = Math.max(maxX, point.x)
          maxY = Math.max(maxY, point.y)
        }

        return {
          x: minX,
          y: minY,
          width: maxX - minX,
          height: maxY - minY,
          pageIndex
        }
      }

      const boundingBox = calculateMultiStrokeBoundingBox(strokes, 0)

      expect(boundingBox.x).toBe(50) // Minimum x
      expect(boundingBox.y).toBe(80) // Minimum y
      expect(boundingBox.width).toBe(250) // 300 - 50
      expect(boundingBox.height).toBe(140) // 220 - 80
    })

    it('should handle empty point arrays', () => {
      const calculateBoundingBox = (points: Point[], pageIndex: number): AnnotationRect => {
        if (points.length === 0) {
          return { x: 0, y: 0, width: 0, height: 0, pageIndex }
        }

        let minX = Number.MAX_VALUE
        let minY = Number.MAX_VALUE
        let maxX = Number.MIN_VALUE
        let maxY = Number.MIN_VALUE

        for (const point of points) {
          minX = Math.min(minX, point.x)
          minY = Math.min(minY, point.y)
          maxX = Math.max(maxX, point.x)
          maxY = Math.max(maxY, point.y)
        }

        return {
          x: minX,
          y: minY,
          width: maxX - minX,
          height: maxY - minY,
          pageIndex
        }
      }

      const boundingBox = calculateBoundingBox([], 0)

      expect(boundingBox.x).toBe(0)
      expect(boundingBox.y).toBe(0)
      expect(boundingBox.width).toBe(0)
      expect(boundingBox.height).toBe(0)
      expect(boundingBox.pageIndex).toBe(0)
    })

    it('should handle single point', () => {
      const points: Point[] = [{ x: 150, y: 200 }]

      const calculateBoundingBox = (points: Point[], pageIndex: number): AnnotationRect => {
        if (points.length === 0) {
          return { x: 0, y: 0, width: 0, height: 0, pageIndex }
        }

        let minX = Number.MAX_VALUE
        let minY = Number.MAX_VALUE
        let maxX = Number.MIN_VALUE
        let maxY = Number.MIN_VALUE

        for (const point of points) {
          minX = Math.min(minX, point.x)
          minY = Math.min(minY, point.y)
          maxX = Math.max(maxX, point.x)
          maxY = Math.max(maxY, point.y)
        }

        return {
          x: minX,
          y: minY,
          width: maxX - minX,
          height: maxY - minY,
          pageIndex
        }
      }

      const boundingBox = calculateBoundingBox(points, 0)

      expect(boundingBox.x).toBe(150)
      expect(boundingBox.y).toBe(200)
      expect(boundingBox.width).toBe(0)
      expect(boundingBox.height).toBe(0)
    })
  })

  describe('Point Distance Calculations', () => {
    it('should calculate distance between two points', () => {
      const calculateDistance = (p1: Point, p2: Point): number => {
        const dx = p2.x - p1.x
        const dy = p2.y - p1.y
        return Math.sqrt(dx * dx + dy * dy)
      }

      const p1: Point = { x: 0, y: 0 }
      const p2: Point = { x: 3, y: 4 }

      const distance = calculateDistance(p1, p2)
      expect(distance).toBe(5) // 3-4-5 triangle
    })

    it('should calculate stroke length', () => {
      const calculateStrokeLength = (points: Point[]): number => {
        if (points.length < 2) return 0

        let totalLength = 0
        for (let i = 1; i < points.length; i++) {
          const dx = points[i].x - points[i - 1].x
          const dy = points[i].y - points[i - 1].y
          totalLength += Math.sqrt(dx * dx + dy * dy)
        }
        return totalLength
      }

      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
        { x: 0, y: 10 }
      ]

      const length = calculateStrokeLength(points)
      expect(length).toBe(30) // 10 + 10 + 10
    })
  })

  describe('Stroke Simplification', () => {
    it('should simplify stroke by removing redundant points', () => {
      const simplifyStroke = (points: Point[], tolerance: number = 2): Point[] => {
        if (points.length <= 2) return points

        const simplified: Point[] = [points[0]]

        for (let i = 1; i < points.length - 1; i++) {
          const prev = simplified[simplified.length - 1]
          const current = points[i]
          const next = points[i + 1]

          // Calculate distance from current point to line between prev and next
          const distance = calculatePointToLineDistance(current, prev, next)

          if (distance > tolerance) {
            simplified.push(current)
          }
        }

        simplified.push(points[points.length - 1])
        return simplified
      }

      const calculatePointToLineDistance = (point: Point, lineStart: Point, lineEnd: Point): number => {
        const A = lineEnd.y - lineStart.y
        const B = lineStart.x - lineEnd.x
        const C = lineEnd.x * lineStart.y - lineStart.x * lineEnd.y

        return Math.abs(A * point.x + B * point.y + C) / Math.sqrt(A * A + B * B)
      }

      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0.1 }, // Should be removed (close to line)
        { x: 2, y: 0.2 }, // Should be removed (close to line)
        { x: 10, y: 0 },
        { x: 10, y: 10 }
      ]

      const simplified = simplifyStroke(points, 1)
      expect(simplified.length).toBe(3) // Start, corner, end
      expect(simplified[0]).toEqual({ x: 0, y: 0 })
      expect(simplified[1]).toEqual({ x: 10, y: 0 })
      expect(simplified[2]).toEqual({ x: 10, y: 10 })
    })
  })

  describe('Coordinate Transformations', () => {
    it('should convert screen coordinates to PDF coordinates', () => {
      const screenToPdf = (
        screenPoint: Point, 
        containerRect: DOMRect, 
        scale: number
      ): Point => {
        return {
          x: (screenPoint.x - containerRect.left) / scale,
          y: (screenPoint.y - containerRect.top) / scale
        }
      }

      const screenPoint: Point = { x: 200, y: 150 }
      const containerRect = new DOMRect(50, 30, 400, 600)
      const scale = 1.5

      const pdfPoint = screenToPdf(screenPoint, containerRect, scale)

      expect(pdfPoint.x).toBe(100) // (200 - 50) / 1.5
      expect(pdfPoint.y).toBe(80) // (150 - 30) / 1.5
    })

    it('should convert PDF coordinates to screen coordinates', () => {
      const pdfToScreen = (
        pdfPoint: Point, 
        containerRect: DOMRect, 
        scale: number
      ): Point => {
        return {
          x: pdfPoint.x * scale + containerRect.left,
          y: pdfPoint.y * scale + containerRect.top
        }
      }

      const pdfPoint: Point = { x: 100, y: 80 }
      const containerRect = new DOMRect(50, 30, 400, 600)
      const scale = 1.5

      const screenPoint = pdfToScreen(pdfPoint, containerRect, scale)

      expect(screenPoint.x).toBe(200) // 100 * 1.5 + 50
      expect(screenPoint.y).toBe(150) // 80 * 1.5 + 30
    })
  })

  describe('Stroke Validation', () => {
    it('should validate stroke has minimum points', () => {
      const isValidStroke = (points: Point[], minPoints: number = 2): boolean => {
        return points.length >= minPoints
      }

      expect(isValidStroke([])).toBe(false)
      expect(isValidStroke([{ x: 0, y: 0 }])).toBe(false)
      expect(isValidStroke([{ x: 0, y: 0 }, { x: 10, y: 10 }])).toBe(true)
    })

    it('should validate stroke has minimum length', () => {
      const hasMinimumLength = (points: Point[], minLength: number): boolean => {
        if (points.length < 2) return false

        let totalLength = 0
        for (let i = 1; i < points.length; i++) {
          const dx = points[i].x - points[i - 1].x
          const dy = points[i].y - points[i - 1].y
          totalLength += Math.sqrt(dx * dx + dy * dy)
        }
        return totalLength >= minLength
      }

      const shortStroke: Point[] = [{ x: 0, y: 0 }, { x: 1, y: 1 }]
      const longStroke: Point[] = [{ x: 0, y: 0 }, { x: 100, y: 100 }]

      expect(hasMinimumLength(shortStroke, 10)).toBe(false)
      expect(hasMinimumLength(longStroke, 10)).toBe(true)
    })
  })
})