import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PdfAnnotator } from '../components/PdfAnnotator'
import { AnnotationMode, AnnotationType } from '../types'

// Mock PDF.js more comprehensively
const mockPdfDocument = {
  numPages: 3,
  fingerprints: ['test-fingerprint'],
  isPureXfa: false,
  getPage: vi.fn().mockResolvedValue({
    getViewport: vi.fn().mockReturnValue({
      width: 612,
      height: 792
    }),
    render: vi.fn().mockReturnValue({
      promise: Promise.resolve()
    })
  }),
  destroy: vi.fn()
}

const mockLoadingTask = {
  promise: Promise.resolve(mockPdfDocument),
  destroy: vi.fn(),
  destroyed: false,
  onProgress: vi.fn()
}

vi.mock('pdfjs-dist', () => ({
  getDocument: vi.fn(() => mockLoadingTask),
  GlobalWorkerOptions: {
    workerSrc: '',
    workerPort: null,
  },
  version: '4.0.189'
}))

// Mock PdfPage component since we're testing annotation functionality
vi.mock('../components/PdfPage', () => ({
  PdfPage: vi.fn(({ onPointerDown, onPointerMove, onPointerUp, annotationSession, sessionControls }) => (
    <div 
      data-testid="pdf-page"
      onPointerDown={(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const point = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        }
        onPointerDown?.(point, 0)
      }}
      onPointerMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const point = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        }
        onPointerMove?.(point, 0)
      }}
      onPointerUp={(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const point = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        }
        onPointerUp?.(point, 0)
      }}
      style={{ width: 612, height: 792, border: '1px solid #ccc' }}
    >
      {/* Show session controls if active */}
      {annotationSession?.isActive && (
        <div data-testid="session-controls">
          <button onClick={sessionControls?.finalize}>Finalize</button>
          <button onClick={sessionControls?.cancel}>Cancel</button>
          <button onClick={sessionControls?.undoLastStroke}>Undo</button>
          <div data-testid="session-info">
            Active: {annotationSession.isActive ? 'true' : 'false'}
            Strokes: {annotationSession.strokes.length}
            Current Stroke Points: {annotationSession.currentStroke.length}
          </div>
        </div>
      )}
    </div>
  ))
}))

// Mock ToolBar component
vi.mock('../components/ToolBar', () => ({
  ToolBar: vi.fn(({ currentMode, onModeChange }) => (
    <div data-testid="toolbar">
      <button 
        data-testid="drawing-mode-btn"
        onClick={() => onModeChange(AnnotationMode.DRAWING)}
        data-active={currentMode === AnnotationMode.DRAWING}
      >
        Drawing Mode
      </button>
      <button 
        data-testid="selection-mode-btn"
        onClick={() => onModeChange(AnnotationMode.NONE)}
        data-active={currentMode === AnnotationMode.NONE}
      >
        Selection Mode
      </button>
    </div>
  ))
}))

describe('PdfAnnotator - Handwritten Annotation Integration', () => {
  const defaultProps = {
    url: 'test-pdf.pdf',
    annotations: [],
    onDocumentLoadSuccess: vi.fn(),
    onAnnotationCreate: vi.fn(),
    onAnnotationUpdate: vi.fn(),
    onAnnotationDelete: vi.fn(),
    onAnnotationSelect: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Drawing Mode Activation', () => {
    it('should switch to drawing mode when toolbar button is clicked', async () => {
      const user = userEvent.setup()
      
      render(<PdfAnnotator {...defaultProps} />)

      // Wait for PDF to load
      await screen.findByTestId('pdf-page')

      const drawingModeBtn = screen.getByTestId('drawing-mode-btn')
      await user.click(drawingModeBtn)

      expect(drawingModeBtn).toHaveAttribute('data-active', 'true')
    })

    it('should exit drawing mode when switching to selection mode', async () => {
      const user = userEvent.setup()
      
      render(<PdfAnnotator {...defaultProps} />)

      await screen.findByTestId('pdf-page')

      // First activate drawing mode
      const drawingModeBtn = screen.getByTestId('drawing-mode-btn')
      await user.click(drawingModeBtn)

      expect(drawingModeBtn).toHaveAttribute('data-active', 'true')

      // Then switch to selection mode
      const selectionModeBtn = screen.getByTestId('selection-mode-btn')
      await user.click(selectionModeBtn)

      expect(selectionModeBtn).toHaveAttribute('data-active', 'true')
      expect(drawingModeBtn).toHaveAttribute('data-active', 'false')
    })
  })

  describe('Handwritten Annotation Creation', () => {
    it('should start annotation session on pointer down in drawing mode', async () => {
      const user = userEvent.setup()
      
      render(<PdfAnnotator {...defaultProps} />)

      const pdfPage = await screen.findByTestId('pdf-page')

      // Switch to drawing mode
      const drawingModeBtn = screen.getByTestId('drawing-mode-btn')
      await user.click(drawingModeBtn)

      // Start drawing
      fireEvent.pointerDown(pdfPage, { clientX: 100, clientY: 100 })

      // Should show session controls
      const sessionControls = screen.getByTestId('session-controls')
      expect(sessionControls).toBeInTheDocument()

      const sessionInfo = screen.getByTestId('session-info')
      expect(sessionInfo).toHaveTextContent('Active: true')
    })

    it('should track points during drawing stroke', async () => {
      const user = userEvent.setup()
      
      render(<PdfAnnotator {...defaultProps} />)

      const pdfPage = await screen.findByTestId('pdf-page')

      // Switch to drawing mode
      const drawingModeBtn = screen.getByTestId('drawing-mode-btn')
      await user.click(drawingModeBtn)

      // Start drawing
      fireEvent.pointerDown(pdfPage, { clientX: 100, clientY: 100 })

      // Move pointer to create stroke
      fireEvent.pointerMove(pdfPage, { clientX: 150, clientY: 150 })
      fireEvent.pointerMove(pdfPage, { clientX: 200, clientY: 200 })

      const sessionInfo = screen.getByTestId('session-info')
      expect(sessionInfo).toHaveTextContent('Current Stroke Points: 3')
    })

    it('should complete stroke on pointer up', async () => {
      const user = userEvent.setup()
      
      render(<PdfAnnotator {...defaultProps} />)

      const pdfPage = await screen.findByTestId('pdf-page')

      // Switch to drawing mode
      const drawingModeBtn = screen.getByTestId('drawing-mode-btn')
      await user.click(drawingModeBtn)

      // Complete a drawing stroke
      fireEvent.pointerDown(pdfPage, { clientX: 100, clientY: 100 })
      fireEvent.pointerMove(pdfPage, { clientX: 150, clientY: 150 })
      fireEvent.pointerUp(pdfPage, { clientX: 200, clientY: 200 })

      // Wait for stroke to be processed
      await new Promise(resolve => setTimeout(resolve, 50))

      const sessionInfo = screen.getByTestId('session-info')
      expect(sessionInfo).toHaveTextContent('Strokes: 1')
      expect(sessionInfo).toHaveTextContent('Current Stroke Points: 0')
    })

    it('should create multiple strokes in one session', async () => {
      const user = userEvent.setup()
      
      render(<PdfAnnotator {...defaultProps} />)

      const pdfPage = await screen.findByTestId('pdf-page')

      // Switch to drawing mode
      const drawingModeBtn = screen.getByTestId('drawing-mode-btn')
      await user.click(drawingModeBtn)

      // First stroke
      fireEvent.pointerDown(pdfPage, { clientX: 100, clientY: 100 })
      fireEvent.pointerUp(pdfPage, { clientX: 200, clientY: 200 })

      await new Promise(resolve => setTimeout(resolve, 50))

      // Second stroke
      fireEvent.pointerDown(pdfPage, { clientX: 250, clientY: 100 })
      fireEvent.pointerUp(pdfPage, { clientX: 350, clientY: 200 })

      await new Promise(resolve => setTimeout(resolve, 50))

      const sessionInfo = screen.getByTestId('session-info')
      expect(sessionInfo).toHaveTextContent('Strokes: 2')
    })
  })

  describe('Session Controls', () => {
    it('should finalize session and create annotation', async () => {
      const user = userEvent.setup()
      const onAnnotationCreate = vi.fn()
      
      render(<PdfAnnotator {...defaultProps} onAnnotationCreate={onAnnotationCreate} />)

      const pdfPage = await screen.findByTestId('pdf-page')

      // Switch to drawing mode and create stroke
      const drawingModeBtn = screen.getByTestId('drawing-mode-btn')
      await user.click(drawingModeBtn)

      fireEvent.pointerDown(pdfPage, { clientX: 100, clientY: 100 })
      fireEvent.pointerUp(pdfPage, { clientX: 200, clientY: 200 })

      await new Promise(resolve => setTimeout(resolve, 50))

      // Finalize session
      const finalizeBtn = screen.getByText('Finalize')
      await user.click(finalizeBtn)

      expect(onAnnotationCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          type: AnnotationType.DRAWING,
          points: expect.any(Array)
        })
      )

      // Session should be inactive
      expect(screen.queryByTestId('session-controls')).not.toBeInTheDocument()
    })

    it('should cancel session without creating annotation', async () => {
      const user = userEvent.setup()
      const onAnnotationCreate = vi.fn()
      
      render(<PdfAnnotator {...defaultProps} onAnnotationCreate={onAnnotationCreate} />)

      const pdfPage = await screen.findByTestId('pdf-page')

      // Switch to drawing mode and create stroke
      const drawingModeBtn = screen.getByTestId('drawing-mode-btn')
      await user.click(drawingModeBtn)

      fireEvent.pointerDown(pdfPage, { clientX: 100, clientY: 100 })
      fireEvent.pointerUp(pdfPage, { clientX: 200, clientY: 200 })

      await new Promise(resolve => setTimeout(resolve, 50))

      // Cancel session
      const cancelBtn = screen.getByText('Cancel')
      await user.click(cancelBtn)

      expect(onAnnotationCreate).not.toHaveBeenCalled()

      // Session should be inactive
      expect(screen.queryByTestId('session-controls')).not.toBeInTheDocument()
    })

    it('should undo last stroke', async () => {
      const user = userEvent.setup()
      
      render(<PdfAnnotator {...defaultProps} />)

      const pdfPage = await screen.findByTestId('pdf-page')

      // Switch to drawing mode
      const drawingModeBtn = screen.getByTestId('drawing-mode-btn')
      await user.click(drawingModeBtn)

      // Create two strokes
      fireEvent.pointerDown(pdfPage, { clientX: 100, clientY: 100 })
      fireEvent.pointerUp(pdfPage, { clientX: 200, clientY: 200 })
      await new Promise(resolve => setTimeout(resolve, 50))

      fireEvent.pointerDown(pdfPage, { clientX: 250, clientY: 100 })
      fireEvent.pointerUp(pdfPage, { clientX: 350, clientY: 200 })
      await new Promise(resolve => setTimeout(resolve, 50))

      let sessionInfo = screen.getByTestId('session-info')
      expect(sessionInfo).toHaveTextContent('Strokes: 2')

      // Undo last stroke
      const undoBtn = screen.getByText('Undo')
      await user.click(undoBtn)

      sessionInfo = screen.getByTestId('session-info')
      expect(sessionInfo).toHaveTextContent('Strokes: 1')
    })
  })

  describe('External Session Control', () => {
    it('should use external annotation session when provided', async () => {
      const user = userEvent.setup()
      const mockSession = {
        isActive: true,
        strokes: [[{ x: 100, y: 100 }, { x: 200, y: 200 }]],
        currentStroke: [],
        boundingBox: { x: 100, y: 100, width: 100, height: 100, pageIndex: 0 },
        pageIndex: 0,
        startTime: new Date()
      }
      const mockControls = {
        finalize: vi.fn(),
        cancel: vi.fn(),
        undoLastStroke: vi.fn(),
        addStroke: vi.fn()
      }
      
      render(
        <PdfAnnotator 
          {...defaultProps} 
          annotationSession={mockSession}
          sessionControls={mockControls}
        />
      )

      await screen.findByTestId('pdf-page')

      // Should show session controls with external session data
      const sessionInfo = screen.getByTestId('session-info')
      expect(sessionInfo).toHaveTextContent('Active: true')
      expect(sessionInfo).toHaveTextContent('Strokes: 1')

      // External controls should be called
      const finalizeBtn = screen.getByText('Finalize')
      await user.click(finalizeBtn)

      expect(mockControls.finalize).toHaveBeenCalled()
    })
  })

  describe('Auto-finalization', () => {
    it('should auto-finalize session after timeout', async () => {
      vi.useFakeTimers()
      const onAnnotationCreate = vi.fn()
      
      render(<PdfAnnotator {...defaultProps} onAnnotationCreate={onAnnotationCreate} />)

      const pdfPage = await screen.findByTestId('pdf-page')

      // Switch to drawing mode and create stroke
      const drawingModeBtn = screen.getByTestId('drawing-mode-btn')
      await userEvent.setup().click(drawingModeBtn)

      fireEvent.pointerDown(pdfPage, { clientX: 100, clientY: 100 })
      fireEvent.pointerUp(pdfPage, { clientX: 200, clientY: 200 })

      await new Promise(resolve => setTimeout(resolve, 50))

      expect(screen.getByTestId('session-controls')).toBeInTheDocument()

      // Fast forward 3 seconds
      vi.advanceTimersByTime(3000)

      // Session should auto-finalize
      expect(onAnnotationCreate).toHaveBeenCalled()

      vi.useRealTimers()
    })
  })

  describe('View-only Mode', () => {
    it('should not show session controls in view-only mode', async () => {
      const user = userEvent.setup()
      
      render(<PdfAnnotator {...defaultProps} viewOnly={true} />)

      const pdfPage = await screen.findByTestId('pdf-page')

      // Try to switch to drawing mode (should not work)
      const drawingModeBtn = screen.getByTestId('drawing-mode-btn')
      await user.click(drawingModeBtn)

      // Start drawing (should not create session)
      fireEvent.pointerDown(pdfPage, { clientX: 100, clientY: 100 })

      // Should not show session controls
      expect(screen.queryByTestId('session-controls')).not.toBeInTheDocument()
    })
  })
})