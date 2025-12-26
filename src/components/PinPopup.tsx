import React, { useState, useEffect, useRef } from 'react';
import { Point } from '../types';
import { TagInterface } from 'lingapp-revisao-redacao';

interface PinPopupProps {
  position: Point;
  onSubmit: (selectedTags: TagInterface[], content?: string) => void;
  onCancel: () => void;
  availableTags: TagInterface[];
  initialTags?: TagInterface[];
  initialContent?: string;
}

export const PinPopup: React.FC<PinPopupProps> = ({
  position,
  onSubmit,
  onCancel,
  availableTags,
  initialTags = [],
  initialContent = '',
}) => {
  const [content, setContent] = useState(initialContent);
  const [selectedTags, setSelectedTags] = useState<TagInterface[]>(initialTags);
  const [selectedTagType, setSelectedTagType] = useState<string>('');
  const popupRef = useRef<HTMLDivElement>(null);

  // Group tags by tipo
  const groupedTags = availableTags.reduce<Record<string, TagInterface[]>>((acc, tag) => {
    if (!acc[tag.tipo]) {
      acc[tag.tipo] = [];
    }
    acc[tag.tipo].push(tag);
    return acc;
  }, {});

  // Get unique tag types
  const tagTypes = Object.keys(groupedTags);

  useEffect(() => {
    // Focus the popup when it opens
    if (popupRef.current) {
      popupRef.current.focus();
    }
    
    // Set the first tag type as selected if available
    if (tagTypes.length > 0 && !selectedTagType) {
      setSelectedTagType(tagTypes[0]);
    }
  }, [tagTypes, selectedTagType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(selectedTags, content);
  };

  const handleTagSelection = (tag: TagInterface) => {
    const tagIndex = selectedTags.findIndex(t => t._id === tag._id || (t.tag === tag.tag && t.tipo === tag.tipo));
    
    if (tagIndex >= 0) {
      // If tag already selected, remove it
      setSelectedTags(selectedTags.filter((_, i) => i !== tagIndex));
    } else {
      // Add tag
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const isTagSelected = (tag: TagInterface): boolean => {
    return selectedTags.some(t => t._id === tag._id || (t.tag === tag.tag && t.tipo === tag.tipo));
  };

  return (
    <div
      ref={popupRef}
      className="absolute z-50 bg-white rounded-md shadow-lg p-3 min-w-[300px] max-w-md"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
      tabIndex={0}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-base font-semibold">Adicionar Marcador</h3>
        <button 
          onClick={onCancel}
          className="p-1 text-gray-500 rounded-full hover:bg-gray-200"
        >
          &times;
        </button>
      </div>
      
      <form onSubmit={handleSubmit}>
        {/* Tag type selector */}
        {tagTypes.length > 0 && (
          <div className="mb-3">
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Tipo de Problema:
            </label>
            <select
              value={selectedTagType}
              onChange={(e) => setSelectedTagType(e.target.value)}
              className="w-full p-2 text-sm border border-gray-300 rounded-md"
            >
              {tagTypes.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
          </div>
        )}
        
        {/* Tag selection */}
        {selectedTagType && groupedTags[selectedTagType]?.length > 0 && (
          <div className="mb-3">
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Selecionar Problemas:
            </label>
            <div className="flex flex-wrap gap-2 p-2 overflow-y-auto border border-gray-200 rounded-md max-h-40">
              {groupedTags[selectedTagType].map((tag) => (
                <button
                  type="button"
                  key={tag._id || `${tag.tipo}-${tag.tag}`}
                  onClick={() => handleTagSelection(tag)}
                  className={`px-2 py-1 text-xs rounded-md ${
                    isTagSelected(tag)
                      ? 'bg-blue-100 border-blue-400 text-blue-700'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                  } border`}
                >
                  {tag.tag}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Selected tags */}
        {selectedTags.length > 0 && (
          <div className="mb-3">
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Problemas Selecionados:
            </label>
            <div className="flex flex-wrap gap-1 p-2 border border-gray-200 rounded-md bg-gray-50">
              {selectedTags.map((tag) => (
                <div 
                  key={tag._id || `${tag.tipo}-${tag.tag}`}
                  className="flex items-center px-2 py-1 text-xs text-blue-800 bg-blue-100 rounded-md"
                >
                  <span className="mr-1">{tag.tag}</span>
                  <button
                    type="button"
                    onClick={() => handleTagSelection(tag)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Additional comments textarea */}
        <div className="mb-3">
          <label htmlFor="content" className="block mb-1 text-sm font-medium text-gray-700">
            Comentários Adicionais (Opcional):
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md min-h-[80px] text-sm resize-y"
            placeholder="Adicione notas sobre este problema..."
          />
        </div>
        
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors text-sm"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={selectedTags.length === 0}
            className={`px-3 py-1.5 rounded-md text-white text-sm ${
              selectedTags.length === 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 transition-colors'
            }`}
          >
            Adicionar Marcador
          </button>
        </div>
      </form>
    </div>
  );
}; 