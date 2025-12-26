import React, { useState, useEffect, useRef } from 'react';
import { Point } from '../types';

interface TextInputPopupProps {
  position: Point;
  onSubmit: (text: string) => void;
  onCancel: () => void;
  initialText?: string;
}

export const TextInputPopup: React.FC<TextInputPopupProps> = ({
  position,
  onSubmit,
  onCancel,
  initialText = '',
}) => {
  const [text, setText] = useState(initialText);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Focus the textarea when the component mounts
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = () => {
    if (text.trim()) {
      onSubmit(text);
    } else {
      onCancel();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      // Ctrl+Enter to submit
      handleSubmit();
    } else if (e.key === 'Escape') {
      // Escape to cancel
      onCancel();
    }
  };

  return (
    <div
      className="absolute z-50 bg-white rounded-md shadow-lg p-3 w-64"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <textarea
        ref={inputRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-full p-2 border border-gray-300 rounded-md min-h-[5rem] resize-y mb-3"
        placeholder="Digite seu texto aqui..."
      />
      <div className="flex justify-end space-x-2">
        <button
          onClick={onCancel}
          className="px-3 py-1.5 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={handleSubmit}
          className="px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Adicionar Texto
        </button>
      </div>
    </div>
  );
}; 