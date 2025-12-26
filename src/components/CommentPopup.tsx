import React, { useState, useRef, useEffect } from 'react';

interface CommentPopupProps {
  position: { x: number; y: number };
  onSubmit: (content: string) => void;
  onCancel: () => void;
  initialContent?: string;
}

export const CommentPopup: React.FC<CommentPopupProps> = ({
  position,
  onSubmit,
  onCancel,
  initialContent = '',
}) => {
  const [content, setContent] = useState(initialContent);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onSubmit(content);
    } else {
      onCancel();
    }
  };

  return (
    <div
      className="absolute z-50 bg-white shadow-lg rounded-md p-3 min-w-[250px]"
      style={{
        top: position.y,
        left: position.x,
      }}
    >
      <form onSubmit={handleSubmit}>
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Adicionar um comentário..."
          className="w-full min-h-[80px] p-2 rounded-md border border-gray-300 resize-y font-inherit text-sm mb-3"
        />
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Salvar
          </button>
        </div>
      </form>
    </div>
  );
}; 