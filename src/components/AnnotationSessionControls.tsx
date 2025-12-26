import React from 'react';
import { FaCheck, FaTimes, FaUndo, FaClock } from 'react-icons/fa';

interface AnnotationSessionControlsProps {
  isActive: boolean;
  strokeCount: number;
  onFinalize: () => void;
  onCancel: () => void;
  onUndoLastStroke: () => void;
  autoSaveCountdown?: number;
}

export const AnnotationSessionControls: React.FC<AnnotationSessionControlsProps> = ({
  isActive,
  strokeCount,
  onFinalize,
  onCancel,
  onUndoLastStroke,
  autoSaveCountdown
}) => {
  if (!isActive) return null;

  return (
    <div className="annotation-session-controls absolute top-4 right-4 bg-white bg-opacity-95 rounded-lg shadow-lg border border-gray-200 p-3 min-w-[280px]">
      {/* Header da sessão */}
      <div className="flex items-center gap-2 mb-3 text-sm text-gray-700">
        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
        <span className="font-medium">Anotação em progresso</span>
        <span className="text-gray-500">({strokeCount} traços)</span>
      </div>

      {/* Contador de auto-save (se habilitado) */}
      {autoSaveCountdown && autoSaveCountdown > 0 && (
        <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
          <FaClock size={10} />
          <span>Auto-save em {autoSaveCountdown}s</span>
        </div>
      )}

      {/* Botões de controle */}
      <div className="flex gap-2">
        <button 
          className="flex-1 px-3 py-2 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
          onClick={onFinalize}
          title="Finalizar anotação (Enter)"
        >
          <FaCheck size={12} />
          Concluir
        </button>
        
        <button 
          className="px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors flex items-center justify-center"
          onClick={onUndoLastStroke}
          title="Desfazer último traço (Ctrl+Z)"
          disabled={strokeCount === 0}
        >
          <FaUndo size={12} />
        </button>
        
        <button 
          className="px-3 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors flex items-center justify-center"
          onClick={onCancel}
          title="Cancelar anotação (Esc)"
        >
          <FaTimes size={12} />
        </button>
      </div>

      {/* Dicas de atalhos */}
      <div className="mt-2 text-xs text-gray-500 space-y-1">
        <div><kbd className="bg-gray-100 px-1 rounded">Enter</kbd> Finalizar</div>
        <div><kbd className="bg-gray-100 px-1 rounded">Esc</kbd> Cancelar</div>
        <div><kbd className="bg-gray-100 px-1 rounded">Ctrl+Z</kbd> Desfazer</div>
      </div>
    </div>
  );
}; 