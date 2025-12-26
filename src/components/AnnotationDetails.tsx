import React, { useState, useEffect, useMemo } from 'react';
import { Annotation } from '../types';
import { IoClose, IoSave, IoTrash, IoPencil, IoArrowBack, IoAdd, IoRemove, IoCheckmark } from 'react-icons/io5';
import { Badge } from './Badge';
import { CompetenciaInterface, CompetenciaWithTags, TagInterface } from 'lingapp-revisao-redacao';
interface AnnotationDetailsProps {
  annotation: Annotation;
  onUpdate: (id: string, updates: Partial<Annotation>) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
  position?: { x: number, y: number }; // Optional position for the dialog
  isNew?: boolean; // Flag to indicate if this is a newly created annotation
  customCategories?: CompetenciaWithTags[]; // Use CompetenciaInterface for categories with tags
  viewOnly?: boolean; // New prop to indicate view-only mode
  onAnnotationsChange?: (annotations: Annotation[]) => void; // Optional callback when annotations change
}

export const AnnotationDetails: React.FC<AnnotationDetailsProps> = ({
  annotation,
  onUpdate,
  onDelete,
  onClose,
  position,
  isNew = false,
  customCategories = [],
  viewOnly = false, // Default to false for backward compatibility
  onAnnotationsChange,
}) => {
  // Only allow editing mode if not in viewOnly mode
  const [isEditing, setIsEditing] = useState(isNew && !viewOnly);
  const [content, setContent] = useState(annotation.content || '');
  const [selectedCategory, setSelectedCategory] = useState<CompetenciaInterface | undefined>(annotation.category);
  const [tags, setTags] = useState<TagInterface[]>(annotation.tags || []);
  const [showTagSelector, setShowTagSelector] = useState(false);

  // Function to handle setting editing state that respects viewOnly mode
  const handleSetEditing = (editing: boolean) => {
    // Only allow switching to edit mode if not in viewOnly mode
    if (editing && viewOnly) {
      return; // Prevent editing in viewOnly mode
    }
    setIsEditing(editing);
  };

  // Category color comes directly from the selected category
  const categoryColor = useMemo(() => {
    // Use the selected category in edit mode, otherwise use the annotation's category
    const categoryToUse = isEditing ? annotation.category: selectedCategory;
    return categoryToUse?.color || '';
  }, [annotation.category, selectedCategory, isEditing]);

  // Update local state when annotation prop changes
  useEffect(() => {
    // console.log('Annotation updated in details component:', annotation);
    setContent(annotation.content || '');
    setSelectedCategory(annotation.category);
    setTags(annotation.tags || []);
  }, [annotation, annotation.content, annotation.category, annotation.tags]);

  // Get all available categories from customCategories
  const allCategories = useMemo(() => {
    return customCategories.map(cat => cat.competencia);
  }, [customCategories]);

  // Get available tags for the selected category
  const availableTagsForCategory = useMemo(() => {
    if (!selectedCategory) return [];
    
    const selectedCustomCategory = customCategories.find(
      cc => cc.competencia.competencia === selectedCategory.competencia
    );
    
    if (selectedCustomCategory) {
      return selectedCustomCategory.tagsCompetencia;
    }
    
    return [];
  }, [selectedCategory, customCategories]);

  // Function to check if a tag is already selected
  const isTagSelected = (tag: TagInterface) => {
    return tags.some(t => 
      (t._id && tag._id && t._id === tag._id) || 
      (t.tag === tag.tag && t.tipo === tag.tipo)
    );
  };

  // Function to toggle a tag in the selection
  const toggleTag = (tag: TagInterface, event?: React.MouseEvent) => {
    // Stop event propagation to prevent dialog from closing
    if (event) {
      event.stopPropagation();
    }
    
    if (isTagSelected(tag)) {
      // Remove tag
      setTags(tags.filter(t => 
        !((t._id && tag._id && t._id === tag._id) || 
        (t.tag === tag.tag && t.tipo === tag.tipo))
      ));
    } else {
      // Add tag
      setTags([...tags, tag]);
    }
  };

  const handleSave = () => {
    const updatedAnnotation = { 
      ...annotation,
      content,
      category: selectedCategory,
      color: selectedCategory?.color || annotation.color,
      tags
    };
    
    onUpdate(annotation.id, { 
      content,
      category: selectedCategory,
      color: selectedCategory?.color || annotation.color,
      tags
    });
    
    // If parent component is handling the annotations array
    if (onAnnotationsChange) {
      onAnnotationsChange([updatedAnnotation]);
    }
    
    handleSetEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm('Tem certeza que deseja excluir esta anotação?')) {
      onDelete(annotation.id);
      
      // If parent component is handling the annotations array
      if (onAnnotationsChange) {
        onAnnotationsChange([]);
      }
      
      // Close the dialog after confirming deletion
      onClose();
    }
  };

  // Group tags by type for display
  const groupedTags = tags.reduce<Record<string, TagInterface[]>>((acc, tag) => {
    if (!acc[tag.tipo]) {
      acc[tag.tipo] = [];
    }
    acc[tag.tipo].push(tag);
    return acc;
  }, {});

  // Handle category change
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const categoryId = parseInt(e.target.value, 10);
    const category = allCategories.find(c => c.competencia === categoryId);
    setSelectedCategory(category);
    
    // If we have a new category, reset the selected tags
    if (category && (!selectedCategory || category.competencia !== selectedCategory.competencia)) {
      setTags([]);
    }
  };

  return (
    <div
      className={`fixed bg-white shadow-lg rounded-md p-4 z-50 max-h-[90vh] overflow-auto annotation-details ${showTagSelector && isEditing ? 'w-auto' : 'w-[360px]'}`}
      data-testid="annotation-details-dialog"
      style={{
        top: position ? `${position.y}px` : '70px',
        right: position ? 'auto' : '20px',
        left: position ? `${position.x}px` : 'auto',
        transform: position ? 'translate(-50%, 0)' : 'none',
        borderLeft: `4px solid ${categoryColor ? categoryColor : '#bbbbbb'}`,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header with close button in top-right */}
      <div className="flex justify-between items-center mb-2.5 sticky top-0 bg-white z-10">
        {/* Category label - show when selected category exists in either edit or view mode */}
        {((isEditing && selectedCategory) || (!isEditing && annotation.category)) ? (
          <span 
            className="px-2 py-0.5 rounded inline-block"
            style={{ 
              backgroundColor: isEditing ? selectedCategory?.color : annotation.category?.color,
              color: 'white',
              fontSize: '0.9em'
            }}
          >
            {isEditing ? selectedCategory?.displayName : annotation.category?.displayName}
          </span>
        ) : (
          <span 
            className="px-2 py-0.5 rounded inline-block"
            style={{ 
              backgroundColor: '#bbbbbb',
              color: 'white',
              fontSize: '0.9em'
            }}
          >
            Sem Categoria
          </span>
        )}
        <button
          onClick={onClose}
          className="flex items-center justify-center p-0 ml-auto text-xl bg-transparent border-0 cursor-pointer"
          aria-label="Fechar"
        >
          <IoClose size={22} />
        </button>
      </div>

      
      {isEditing ? (
        <div>
          {availableTagsForCategory.length > 0 && selectedCategory && showTagSelector ? (
            // Two-column layout when tag selector is visible
            <div className="flex flex-row space-x-4 w-[600px]">
              {/* Left column: Competência and Anotações */}
              <div className="w-1/2">
                <div className="mb-2.5">
                  <select
                    id="category-select"
                    value={selectedCategory?.competencia.toString() || ''}
                    onChange={handleCategoryChange}
                    className="w-full p-2 border border-gray-300 rounded-md mb-2.5"
                    style={{ 
                      borderLeftWidth: '4px',
                      borderLeftColor: categoryColor || 'transparent'
                    }}
                  >
                    <option value="">Sem Categoria</option>
                    {allCategories.map((category) => (
                      <option 
                        key={category.competencia} 
                        value={category.competencia}
                      >
                        {category.displayName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label htmlFor="annotation-content" className="block mb-1.5">
                    <strong>Anotações:</strong>
                  </label>
                  <textarea
                    id="annotation-content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md min-h-[150px]"
                    placeholder="Adicione um comentário..."
                  />
                </div>

                {/* Display selected tags */}
                  {tags.length > 0 && (
                    <div className="mt-3">
                      <p className="mb-2 text-xs text-gray-500">Tags Selecionadas:</p>
                      <div className="flex flex-wrap flex-col gap-1 overflow-y-auto max-h-[100px]">
                        {tags.map((tag, index) => (
                          <div
                            key={index}
                            className="bg-gray-100 px-2 py-1 rounded-md text-xs flex items-center mb-1 mr-1 max-w-[120px]"
                            title={tag.tag}
                          >
                            <span className="truncate">{tag.tag}</span>
                            <button
                              type="button"
                              onClick={(e) => toggleTag(tag, e)}
                              className="flex-shrink-0 ml-1 text-gray-600 hover:text-red-500"
                            >
                              <IoClose size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
              
              {/* Right column: Tag selector */}
              <div className="w-1/2">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="font-medium text-gray-700">
                      <strong>Tags:</strong>
                    </label>
                    <button 
                      type="button"
                      onClick={() => setShowTagSelector(false)}
                      className="flex items-center px-2 py-1 text-xs bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                      <IoRemove size={14} className="mr-1" />
                      Ocultar Tags
                    </button>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-md border border-gray-200 max-h-[180px] overflow-y-auto">
                    {availableTagsForCategory.map(tag => (
                      <div key={tag._id || tag.tag} className="mb-1 last:mb-0">
                        <button
                          type="button"
                          onClick={(e) => toggleTag(tag as TagInterface, e)}
                          className={`w-full text-left px-2 py-1 rounded-md text-sm ${
                            isTagSelected(tag as TagInterface) 
                              ? 'bg-blue-100 border border-blue-300' 
                              : 'hover:bg-gray-100 border border-transparent'
                          }`}
                          title={tag.tag}
                        >
                          <div className="flex items-center">
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center mr-2 flex-shrink-0 ${
                              isTagSelected(tag as TagInterface) ? 'border border-blue-500 bg-blue-500 text-white' : 'border border-gray-400'
                            }`}>
                              {isTagSelected(tag as TagInterface) && <IoCheckmark size={12} />}
                            </div>
                            <span className="truncate">{tag.tag}</span>
                          </div>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="category-select" className="block">
                    <strong>Competência:</strong>
                  </label>
                  <select
                  id="category-select"
                  value={selectedCategory?.competencia.toString() || ''}
                  onChange={handleCategoryChange}
                  className="max-w-[200px] p-2 border border-gray-300 rounded-md"
                  style={{ 
                    borderLeftWidth: '4px',
                    borderLeftColor: categoryColor || '#bbbbbb'
                  }}
                >
                  <option value="">Sem Categoria</option>
                  {allCategories.map((category) => (
                    <option 
                      key={category.competencia} 
                      value={category.competencia}
                    >
                      {category.displayName}
                    </option>
                  ))}
                </select>
                  
                </div>
                {availableTagsForCategory.length > 0 && selectedCategory && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block">
                      <strong>Tags</strong>
                    </label>
                    <button 
                      type="button"
                      onClick={() => setShowTagSelector(true)}
                      className="flex items-center px-2 py-1 text-xs bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                      <IoAdd size={14} className="mr-1" />
                      Tags
                    </button>
                  </div>
                    <div className="flex flex-wrap">
                    {tags.length > 0 && tags.map((tag, index) => (
                      <div
                        key={index}
                        className="bg-gray-100 px-2 py-1 rounded-md text-xs flex items-center mb-1 mr-1 max-w-[120px]"
                        title={tag.tag}
                      >
                        <span className="truncate">{tag.tag}</span>
                        <button
                          type="button"
                          onClick={(e) => toggleTag(tag as TagInterface, e)}
                          className="flex-shrink-0 ml-1 text-gray-600 hover:text-red-500"
                        >
                          <IoClose size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                  </div>
                )}
                
              </div>

              <div className="mb-4">
                <label htmlFor="annotation-content" className="block mb-1.5">
                  <strong>Anotações:</strong>
                </label>
                <textarea
                  id="annotation-content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md min-h-[100px]"
                  placeholder="Adicione um comentário..."
                />
              </div>
            </>
          )}

          <div className="flex justify-end space-x-2">
            <button
              onClick={() => handleSetEditing(false)}
              className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 rounded-md flex items-center"
            >
              <IoArrowBack size={16} className="mr-1" />
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-md flex items-center"
            >
              <IoSave size={16} className="mr-1" />
              Salvar
            </button>
          </div>
        </div>
      ) : (
        <div>
          {/* Display mode */}
          <div className="mb-3">
            {/* Display tags by type */}
            {Object.entries(groupedTags).length > 0 && (
              <div className="mb-2">
                <strong>Tags:</strong>
                <div className="max-h-[150px] overflow-y-auto mt-1">
                  {Object.entries(groupedTags).map(([tipo, tagsOfType]) => (
                    <div key={tipo} className="mt-1">
                      <div className="flex flex-wrap gap-1">
                        {tagsOfType.map((tag, index) => (
                          <Badge
                            tag={tag}
                            idx={index}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Display content */}
           {content && <div className="mt-3">
              <strong>Anotações:</strong>
              <div className="mt-1 p-2 bg-gray-50 rounded-md min-h-[40px] max-h-[160px] overflow-y-auto whitespace-pre-wrap">
                {content || <em className="text-gray-400">Sem conteúdo</em>}
              </div>
            </div>}
          </div>

          {/* Only show action buttons if not in view-only mode */}
          {!viewOnly && (
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleDelete}
                className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-md flex items-center"
              >
                <IoTrash size={16} className="mr-1" />
                Excluir
              </button>
              <button
                onClick={() => handleSetEditing(true)}
                className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md flex items-center"
              >
                <IoPencil size={16} className="mr-1" />
                Editar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 