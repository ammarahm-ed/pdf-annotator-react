import { useState } from "react";
import { TagInterface } from "lingapp-revisao-redacao";
export const Badge = ({tag,idx}:{ tag:TagInterface, idx:number }) => {
  // Track which tag is being hovered
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="flex flex-wrap max-w-md gap-2"
    key={idx}
    >
        <div
          className="relative inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-200 rounded-md shadow-sm"
          style={{ 
            maxWidth: '260px',
            overflow: 'hidden'
          }}
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <span 
            className="block overflow-hidden whitespace-nowrap text-ellipsis" 
            style={{ maxWidth: '100%' }}
          >
            {tag.tag}
          </span>
          
          {/* Custom tooltip that appears on hover */}
          {hoveredIndex === idx && tag.tag.length > 15 && (
            <div 
              className="absolute z-10 px-3 py-2 text-sm font-medium text-white transform -translate-x-1/2 bg-gray-900 rounded-lg shadow-sm -top-10 left-1/2"
              style={{ 
                minWidth: 'max-content',
                maxWidth: '200px'
              }}
            >
              {tag.tag}
              {/* Tooltip arrow */}
              <div className="absolute w-2 h-2 transform rotate-45 -translate-x-1/2 bg-gray-900 -bottom-1 left-1/2"></div>
            </div>
          )}
        </div>
    </div>
  );
};