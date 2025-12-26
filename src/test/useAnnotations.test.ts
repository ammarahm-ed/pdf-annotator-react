import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAnnotations } from '../hooks/useAnnotations'
import { AnnotationMode, AnnotationType, Point } from '../types'

describe('useAnnotations - Handwritten Annotation Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Drawing Session Management', () => {
    it('should start an annotation session when drawing mode is activated', () => {
      const { result } = renderHook(() => useAnnotations({}))

      expect(result.current.annotationSession.isActive).toBe(false)

      act(() => {
        result.current.setMode(AnnotationMode.DRAWING)
      })

      // Start drawing on page 0
      const point: Point = { x: 100, y: 100 }
      act(() => {
        result.current.handlePointerDown(point, 0)
      })

      expect(result.current.annotationSession.isActive).toBe(true)
      expect(result.current.annotationSession.pageIndex).toBe(0)
      expect(result.current.isDrawing).toBe(true)
    })

    it('should add points to current stroke during pointer move', () => {
      const { result } = renderHook(() => useAnnotations({}))

      act(() => {
        result.current.setMode(AnnotationMode.DRAWING)
      })

      // Start drawing
      const startPoint: Point = { x: 100, y: 100 }
      act(() => {
        result.current.handlePointerDown(startPoint, 0)
      })

      // Add more points during move
      const point1: Point = { x: 105, y: 105 }
      const point2: Point = { x: 110, y: 110 }

      act(() => {
        result.current.handlePointerMove(point1, 0)
      })

      act(() => {
        result.current.handlePointerMove(point2, 0)
      })

      expect(result.current.annotationSession.currentStroke).toHaveLength(3)
      expect(result.current.annotationSession.currentStroke).toEqual([
        startPoint,
        point1,
        point2
      ])
    })

    it('should finish stroke on pointer up and add it to session strokes', async () => {
      const { result } = renderHook(() => useAnnotations({}))

      act(() => {
        result.current.setMode(AnnotationMode.DRAWING)
      })

      // Start and complete a stroke
      const startPoint: Point = { x: 100, y: 100 }
      const endPoint: Point = { x: 200, y: 200 }

      act(() => {
        result.current.handlePointerDown(startPoint, 0)
      })

      act(() => {
        result.current.handlePointerMove({ x: 150, y: 150 }, 0)
      })

      act(() => {
        result.current.handlePointerUp(endPoint, 0)
      })

      // Wait for stroke to be finished
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 50))
      })

      expect(result.current.annotationSession.strokes).toHaveLength(1)
      expect(result.current.annotationSession.strokes[0]).toHaveLength(3)
      expect(result.current.annotationSession.currentStroke).toHaveLength(0)
      expect(result.current.isDrawing).toBe(false)
    })

    it('should calculate correct bounding box from multiple strokes', async () => {
      const { result } = renderHook(() => useAnnotations({}))

      act(() => {
        result.current.setMode(AnnotationMode.DRAWING)
      })

      // First stroke
      act(() => {
        result.current.handlePointerDown({ x: 100, y: 100 }, 0)
      })
      act(() => {
        result.current.handlePointerUp({ x: 200, y: 150 }, 0)
      })

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 50))
      })

      // Second stroke extending the bounding box
      act(() => {
        result.current.handlePointerDown({ x: 50, y: 80 }, 0)
      })
      act(() => {
        result.current.handlePointerUp({ x: 250, y: 200 }, 0)
      })

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 50))
      })

      const boundingBox = result.current.annotationSession.boundingBox
      expect(boundingBox).toBeDefined()
      expect(boundingBox?.x).toBe(50) // Min x
      expect(boundingBox?.y).toBe(80) // Min y  
      expect(boundingBox?.width).toBe(200) // 250 - 50
      expect(boundingBox?.height).toBe(120) // 200 - 80
    })
  })

  describe('Session Controls', () => {
    it('should finalize session and create annotation', async () => {
      const onAnnotationCreate = vi.fn()
      const { result } = renderHook(() => useAnnotations({ onAnnotationCreate }))

      act(() => {
        result.current.setMode(AnnotationMode.DRAWING)
      })

      // Create a stroke
      act(() => {
        result.current.handlePointerDown({ x: 100, y: 100 }, 0)
      })
      act(() => {
        result.current.handlePointerUp({ x: 200, y: 200 }, 0)
      })

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 50))
      })

      // Finalize session
      act(() => {
        result.current.sessionControls.finalize()
      })

      expect(result.current.annotationSession.isActive).toBe(false)
      expect(onAnnotationCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          type: AnnotationType.DRAWING,
          points: expect.any(Array)
        })
      )
    })

    it('should cancel session without creating annotation', async () => {
      const onAnnotationCreate = vi.fn()
      const { result } = renderHook(() => useAnnotations({ onAnnotationCreate }))

      act(() => {
        result.current.setMode(AnnotationMode.DRAWING)
      })

      // Create a stroke
      act(() => {
        result.current.handlePointerDown({ x: 100, y: 100 }, 0)
      })
      act(() => {
        result.current.handlePointerUp({ x: 200, y: 200 }, 0)
      })

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 50))
      })

      // Cancel session
      act(() => {
        result.current.sessionControls.cancel()
      })

      expect(result.current.annotationSession.isActive).toBe(false)
      expect(result.current.annotationSession.strokes).toHaveLength(0)
      expect(onAnnotationCreate).not.toHaveBeenCalled()
    })

    it('should undo last stroke', async () => {
      const { result } = renderHook(() => useAnnotations({}))

      act(() => {
        result.current.setMode(AnnotationMode.DRAWING)
      })

      // Create two strokes
      act(() => {
        result.current.handlePointerDown({ x: 100, y: 100 }, 0)
      })
      act(() => {
        result.current.handlePointerUp({ x: 200, y: 200 }, 0)
      })

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 50))
      })

      act(() => {
        result.current.handlePointerDown({ x: 300, y: 300 }, 0)
      })
      act(() => {
        result.current.handlePointerUp({ x: 400, y: 400 }, 0)
      })

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 50))
      })

      expect(result.current.annotationSession.strokes).toHaveLength(2)

      // Undo last stroke
      act(() => {
        result.current.sessionControls.undoLastStroke()
      })

      expect(result.current.annotationSession.strokes).toHaveLength(1)
    })

    it('should add stroke programmatically', () => {
      const { result } = renderHook(() => useAnnotations({}))

      act(() => {
        result.current.setMode(AnnotationMode.DRAWING)
        result.current.startAnnotationSession(0)
      })

      const stroke: Point[] = [
        { x: 100, y: 100 },
        { x: 150, y: 150 },
        { x: 200, y: 200 }
      ]

      act(() => {
        result.current.sessionControls.addStroke(stroke)
      })

      expect(result.current.annotationSession.strokes).toHaveLength(1)
      expect(result.current.annotationSession.strokes[0]).toEqual(stroke)
      expect(result.current.annotationSession.boundingBox).toBeDefined()
    })
  })

  describe('Auto-finalization', () => {
    it('should auto-finalize session after timeout', async () => {
      vi.useFakeTimers()
      const onAnnotationCreate = vi.fn()
      const { result } = renderHook(() => useAnnotations({ onAnnotationCreate }))

      act(() => {
        result.current.setMode(AnnotationMode.DRAWING)
      })

      // Create a stroke
      act(() => {
        result.current.handlePointerDown({ x: 100, y: 100 }, 0)
      })
      act(() => {
        result.current.handlePointerUp({ x: 200, y: 200 }, 0)
      })

      // Let the stroke finish
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 50))
      })

      expect(result.current.annotationSession.isActive).toBe(true)

      // Fast forward 3 seconds to trigger auto-finalization
      act(() => {
        vi.advanceTimersByTime(3000)
      })

      expect(result.current.annotationSession.isActive).toBe(false)
      expect(onAnnotationCreate).toHaveBeenCalled()

      vi.useRealTimers()
    })
  })

  describe('Multi-stroke Drawings', () => {
    it('should handle multiple strokes in single session', async () => {
      const { result } = renderHook(() => useAnnotations({}))

      act(() => {
        result.current.setMode(AnnotationMode.DRAWING)
      })

      // First stroke
      act(() => {
        result.current.handlePointerDown({ x: 100, y: 100 }, 0)
      })
      act(() => {
        result.current.handlePointerMove({ x: 150, y: 150 }, 0)
      })
      act(() => {
        result.current.handlePointerUp({ x: 200, y: 200 }, 0)
      })

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 50))
      })

      expect(result.current.annotationSession.strokes).toHaveLength(1)

      // Second stroke
      act(() => {
        result.current.handlePointerDown({ x: 220, y: 220 }, 0)
      })
      act(() => {
        result.current.handlePointerMove({ x: 270, y: 270 }, 0)
      })
      act(() => {
        result.current.handlePointerUp({ x: 320, y: 320 }, 0)
      })

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 50))
      })

      expect(result.current.annotationSession.strokes).toHaveLength(2)
      expect(result.current.annotationSession.isActive).toBe(true)

      // Bounding box should encompass both strokes
      const boundingBox = result.current.annotationSession.boundingBox
      expect(boundingBox?.x).toBe(100)
      expect(boundingBox?.y).toBe(100)
      expect(boundingBox?.width).toBe(220) // 320 - 100
      expect(boundingBox?.height).toBe(220) // 320 - 100
    })

    it('should preserve stroke order', async () => {
      const { result } = renderHook(() => useAnnotations({}))

      act(() => {
        result.current.setMode(AnnotationMode.DRAWING)
      })

      const strokes = [
        [{ x: 100, y: 100 }, { x: 150, y: 150 }],
        [{ x: 200, y: 200 }, { x: 250, y: 250 }],
        [{ x: 300, y: 300 }, { x: 350, y: 350 }]
      ]

      for (let i = 0; i < strokes.length; i++) {
        const stroke = strokes[i]
        act(() => {
          result.current.handlePointerDown(stroke[0], 0)
        })
        act(() => {
          result.current.handlePointerUp(stroke[1], 0)
        })

        await act(async () => {
          await new Promise(resolve => setTimeout(resolve, 50))
        })
      }

      expect(result.current.annotationSession.strokes).toHaveLength(3)
      
      // Verify stroke order is preserved
      for (let i = 0; i < strokes.length; i++) {
        expect(result.current.annotationSession.strokes[i]).toEqual(strokes[i])
      }
    })
  })

  describe('Integration with Categories', () => {
    it('should apply category color to handwritten annotations', async () => {
      const mockCategory = {
        competencia: 1,
        displayName: 'Test Category',
        color: '#ff0000'
      }

      const onAnnotationCreate = vi.fn()
      const { result } = renderHook(() => useAnnotations({ 
        onAnnotationCreate,
        currentCategory: mockCategory 
      }))

      act(() => {
        result.current.setMode(AnnotationMode.DRAWING)
      })

      // Create a drawing
      act(() => {
        result.current.handlePointerDown({ x: 100, y: 100 }, 0)
      })
      act(() => {
        result.current.handlePointerUp({ x: 200, y: 200 }, 0)
      })

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 50))
      })

      act(() => {
        result.current.sessionControls.finalize()
      })

      expect(onAnnotationCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          type: AnnotationType.DRAWING,
          color: '#ff0000',
          category: mockCategory
        })
      )
    })
  })

  describe('Error Handling', () => {
    it('should handle empty strokes gracefully', () => {
      const { result } = renderHook(() => useAnnotations({}))

      act(() => {
        result.current.setMode(AnnotationMode.DRAWING)
        result.current.startAnnotationSession(0)
      })

      // Try to finalize without any strokes
      act(() => {
        result.current.sessionControls.finalize()
      })

      expect(result.current.annotationSession.isActive).toBe(false)
      expect(result.current.annotations).toHaveLength(0)
    })

    it('should handle single point strokes', async () => {
      const { result } = renderHook(() => useAnnotations({}))

      act(() => {
        result.current.setMode(AnnotationMode.DRAWING)
      })

      // Create a single point "stroke"
      act(() => {
        result.current.handlePointerDown({ x: 100, y: 100 }, 0)
      })
      act(() => {
        result.current.handlePointerUp({ x: 100, y: 100 }, 0)
      })

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 50))
      })

      // Should still create a stroke with single point
      expect(result.current.annotationSession.strokes).toHaveLength(1)
      expect(result.current.annotationSession.strokes[0]).toHaveLength(2) // start and end point
    })
  })
})