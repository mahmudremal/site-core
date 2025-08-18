
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
      className={`xpo_relative xpo_min-h-[60px] xpo_transition-all xpo_duration-200 ${isDragOver ? 'xpo_bg-blue-50 xpo_border-2 xpo_border-dashed xpo_border-blue-300' : ''}`}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {children}
      {isDragOver && (
        <div className="xpo_absolute xpo_inset-0 xpo_flex xpo_items-center xpo_justify-center xpo_bg-blue-50 xpo_bg-opacity-90 xpo_rounded xpo_hidden">
          <div className="xpo_text-blue-600 xpo_font-medium">Drop element here</div>
        </div>
      )}
    </div>
  );
};

export default DropZone;
