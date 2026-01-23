
import { useState } from 'react';
import { useBuilder } from '../context';

const DropZone = ({ onDrop, isActive, element = null, children }) => {
  const { addons } = useBuilder();
  const [isDragOver, setIsDragOver] = useState(false);

  const drop_functional = () => element && addons.find(a => a.get_id() == element.type)?.has_children;

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    onDrop(e);
  };

  return (
    <div
      className={`relative min-h-[60px] transition-all duration-200 ${isDragOver ? 'bg-blue-50 border-2 border-dashed border-blue-300' : ''}`}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {children}
      {isDragOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-blue-50 bg-opacity-90 rounded hidden">
          <div className="text-blue-600 font-medium">Drop element here</div>
        </div>
      )}
    </div>
  );
};

export default DropZone;
