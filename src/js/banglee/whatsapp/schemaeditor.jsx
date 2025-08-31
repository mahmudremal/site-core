import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { Edit3, X, Save, Eye, EyeOff, Settings } from 'lucide-react';
import { JsonEditor } from 'json-edit-react';
import { io } from 'socket.io-client';

// Extension React Component
const SchemaEditorExtension = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [siteSchema, setSiteSchema] = useState(null);
  const [editedSchema, setEditedSchema] = useState({});
  const [isConnected, setIsConnected] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 100 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isHighlightMode, setIsHighlightMode] = useState(false);
  const [currentPath, setCurrentPath] = useState('');
  
  const socketRef = useRef(null);
  const dragRef = useRef(null);

  // Initialize socket connection
  useEffect(() => {
    // return;
    socketRef.current = io('http://localhost:3000/bot');
    
    socketRef.current.on('connect', () => {
      // console.log('Successfully connected to the socket.io server!');
      setIsConnected(true);
      socketRef.current.emit('extension_site_opened', { 
        title: document.title, 
        host: location.host, 
        href: location.href 
      });
    });

    socketRef.current.on('extension_site_schema', (data) => {
      // console.log('Received schema from server:', data);
      setSiteSchema(data);
      setEditedSchema(data);
      setIsVisible(true);
    });

    socketRef.current.on('disconnect', () => {
      setIsConnected(false);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Handle mouse events for dragging
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart]);

  // Element highlighting functionality
  useEffect(() => {
    if (!isHighlightMode) return;

    let highlightedElement = null;
    
    const handleMouseOver = (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Remove previous highlight
      if (highlightedElement) {
        highlightedElement.style.outline = '';
        highlightedElement.style.backgroundColor = '';
      }
      
      // Add highlight to current element
      highlightedElement = e.target;
      highlightedElement.style.outline = '2px solid #3b82f6';
      highlightedElement.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
    };

    const handleClick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const selector = generateSelector(e.target);
      setCurrentPath(selector);
      setIsHighlightMode(false);
      
      // Remove highlight
      if (highlightedElement) {
        highlightedElement.style.outline = '';
        highlightedElement.style.backgroundColor = '';
      }
    };

    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('click', handleClick);
      if (highlightedElement) {
        highlightedElement.style.outline = '';
        highlightedElement.style.backgroundColor = '';
      }
    };
  }, [isHighlightMode]);

  // Generate CSS selector for element
  const generateSelector = (element) => {
    if (element.id) {
      return `#${element.id}`;
    }
    
    const path = [];
    let current = element;
    
    while (current && current !== document.body) {
      let selector = current.tagName.toLowerCase();
      
      if (current.className) {
        const classes = current.className.split(' ').filter(c => c.trim());
        if (classes.length > 0) {
          selector += '.' + classes.join('.');
        }
      }
      
      // Add nth-child if there are siblings
      const siblings = Array.from(current.parentElement?.children || []);
      const sameTagSiblings = siblings.filter(s => s.tagName === current.tagName);
      if (sameTagSiblings.length > 1) {
        const index = sameTagSiblings.indexOf(current) + 1;
        selector += `:nth-child(${index})`;
      }
      
      path.unshift(selector);
      current = current.parentElement;
    }
    
    return path.join(' > ');
  };

  const handleMouseDown = (e) => {
    const rect = dragRef.current.getBoundingClientRect();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleSchemaUpdate = () => {
    if (editedSchema && socketRef.current) {
      socketRef.current.emit('extension_site_schema_update', {
        host: location.host,
        schema: editedSchema
      });
      setSiteSchema(editedSchema);
      setIsPopupOpen(false);
      console.log('Schema updated and sent to server');
    }
  };

  const toggleHighlightMode = () => {
    setIsHighlightMode(!isHighlightMode);
  };

  if (!isVisible) {
    return (
      <div className="xpo_fixed xpo_top-4 xpo_left-4 xpo_z-[10000] xpo_bg-blue-600 xpo_text-white xpo_p-2 xpo_rounded-full xpo_cursor-pointer xpo_shadow-lg hover:xpo_bg-blue-700 xpo_transition-colors"
           onClick={() => setIsVisible(true)}>
        <Settings className="xpo_w-4 xpo_h-4" />
      </div>
    );
  }

  return (
    <>
      {/* Draggable Main Button */}
      <div
        ref={dragRef}
        className={`xpo_fixed xpo_z-[10000] xpo_bg-gradient-to-r xpo_from-blue-600 xpo_to-purple-600 xpo_text-white xpo_p-3 xpo_rounded-lg xpo_cursor-move xpo_shadow-2xl xpo_border xpo_border-white/20 xpo_backdrop-blur-sm ${isDragging ? 'xpo_cursor-grabbing' : 'xpo_cursor-grab'}`}
        style={{ left: `${position.x}px`, top: `${position.y}px` }}
        onMouseDown={handleMouseDown}
      >
        <div className="xpo_flex xpo_items-center xpo_space-x-2">
          <div className={`xpo_w-2 xpo_h-2 xpo_rounded-full ${isConnected ? 'xpo_bg-green-400' : 'xpo_bg-red-400'}`} />
          <button
            className="xpo_flex xpo_items-center xpo_space-x-2 hover:xpo_scale-105 xpo_transition-transform"
            onClick={(e) => {
              e.stopPropagation();
              setIsPopupOpen(true);
            }}
          >
            <Edit3 className="xpo_w-5 xpo_h-5" />
            <span className="xpo_text-sm xpo_font-medium">Schema Editor</span>
          </button>
          <button
            className="xpo_ml-2 xpo_p-1 hover:xpo_bg-white/20 xpo_rounded"
            onClick={(e) => {
              e.stopPropagation();
              setIsVisible(false);
            }}
          >
            <EyeOff className="xpo_w-4 xpo_h-4" />
          </button>
        </div>
      </div>

      {/* Highlight Mode Indicator */}
      {isHighlightMode && (
        <div className="xpo_fixed xpo_top-4 xpo_right-4 xpo_z-[10001] xpo_bg-yellow-500 xpo_text-black xpo_px-4 xpo_py-2 xpo_rounded-lg xpo_shadow-lg xpo_font-medium">
          <div className="xpo_flex xpo_items-center xpo_space-x-2">
            <Eye className="xpo_w-4 xpo_h-4" />
            <span>Click on element to select</span>
            <button
              onClick={() => setIsHighlightMode(false)}
              className="xpo_ml-2 xpo_p-1 hover:xpo_bg-black/20 xpo_rounded"
            >
              <X className="xpo_w-4 xpo_h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Schema Editor Popup */}
      {isPopupOpen && (
        <div className="xpo_fixed xpo_inset-0 xpo_z-[10002] xpo_bg-black/50 xpo_backdrop-blur-sm xpo_flex xpo_items-center xpo_justify-center xpo_p-4">
          <div className="xpo_bg-white xpo_rounded-xl xpo_shadow-2xl xpo_w-full xpo_max-w-4xl xpo_max-h-[90vh] xpo_flex xpo_flex-col">
            {/* Header */}
            <div className="xpo_flex xpo_items-center xpo_justify-between xpo_p-6 xpo_border-b xpo_border-gray-200">
              <div>
                <h2 className="xpo_text-2xl xpo_font-bold xpo_text-gray-800">Schema Editor</h2>
                <p className="xpo_text-sm xpo_text-gray-600 xpo_mt-1">
                  Domain: <span className="xpo_font-medium">{location.host}</span>
                </p>
              </div>
              <div className="xpo_flex xpo_items-center xpo_space-x-2">
                <button
                  onClick={toggleHighlightMode}
                  className={`xpo_px-4 xpo_py-2 xpo_rounded-lg xpo_font-medium xpo_transition-colors ${
                    isHighlightMode 
                      ? 'xpo_bg-yellow-500 xpo_text-black hover:xpo_bg-yellow-600'
                      : 'xpo_bg-blue-500 xpo_text-white hover:xpo_bg-blue-600'
                  }`}
                >
                  <Eye className="xpo_w-4 xpo_h-4 xpo_mr-2 xpo_inline" />
                  {isHighlightMode ? 'Exit Select Mode' : 'Select Element'}
                </button>
                <button
                  onClick={() => setIsPopupOpen(false)}
                  className="xpo_p-2 hover:xpo_bg-gray-100 xpo_rounded-lg xpo_transition-colors"
                >
                  <X className="xpo_w-5 xpo_h-5 xpo_text-gray-500" />
                </button>
              </div>
            </div>

            {/* Current Path Display */}
            {currentPath && (
              <div className="xpo_px-6 xpo_py-3 xpo_bg-blue-50 xpo_border-b xpo_border-blue-200">
                <div className="xpo_flex xpo_items-center xpo_space-x-2">
                  <span className="xpo_text-sm xpo_font-medium xpo_text-blue-800">Selected:</span>
                  <code className="xpo_text-sm xpo_bg-blue-100 xpo_px-2 xpo_py-1 xpo_rounded xpo_text-blue-900 xpo_font-mono">
                    {currentPath}
                  </code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(currentPath);
                    }}
                    className="xpo_text-xs xpo_bg-blue-500 xpo_text-white xpo_px-2 xpo_py-1 xpo_rounded hover:xpo_bg-blue-600 xpo_transition-colors"
                  >
                    Copy
                  </button>
                </div>
              </div>
            )}

            {/* Schema Editor Content */}
            <div className="xpo_flex-1 xpo_overflow-auto xpo_p-6">
              {siteSchema ? (
                <div className="xpo_h-full xpo_border xpo_border-gray-200 xpo_rounded-lg">
                  <JsonEditor
                    data={editedSchema}
                    rootName={'Schema'}
                    onUpdate={({ currentData, newData }) => setEditedSchema(newData)}
                    styles={{
                        container: {
                            backgroundColor: '#f6f6f6',
                            fontFamily: 'monospace',
                            maxWidth: 'min(100%, 90vw)'
                        },
                    }}
                  />
                </div>
              ) : (
                <div className="xpo_flex xpo_items-center xpo_justify-center xpo_h-64 xpo_text-gray-500">
                  <div className="xpo_text-center">
                    <Settings className="xpo_w-12 xpo_h-12 xpo_mx-auto xpo_mb-4 xpo_opacity-50" />
                    <p>No schema loaded for this domain</p>
                    <p className="xpo_text-sm xpo_mt-2">The server will provide the schema when available</p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="xpo_flex xpo_items-center xpo_justify-between xpo_p-6 xpo_border-t xpo_border-gray-200 xpo_bg-gray-50">
              <div className="xpo_flex xpo_items-center xpo_space-x-2">
                <div className={`xpo_w-2 xpo_h-2 xpo_rounded-full ${isConnected ? 'xpo_bg-green-500' : 'xpo_bg-red-500'}`} />
                <span className="xpo_text-sm xpo_text-gray-600">
                  {isConnected ? 'Connected to server' : 'Disconnected from server'}
                </span>
              </div>
              <div className="xpo_flex xpo_space-x-3">
                <button
                  onClick={() => setIsPopupOpen(false)}
                  className="xpo_px-4 xpo_py-2 xpo_text-gray-600 hover:xpo_bg-gray-200 xpo_rounded-lg xpo_transition-colors xpo_font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSchemaUpdate}
                  disabled={!editedSchema || !isConnected}
                  className="xpo_px-6 xpo_py-2 xpo_bg-gradient-to-r xpo_from-blue-600 xpo_to-purple-600 xpo_text-white xpo_rounded-lg hover:xpo_from-blue-700 hover:xpo_to-purple-700 xpo_transition-colors xpo_font-medium xpo_flex xpo_items-center xpo_space-x-2 disabled:xpo_opacity-50 disabled:xpo_cursor-not-allowed"
                >
                  <Save className="xpo_w-4 xpo_h-4" />
                  <span>Update Schema</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// export default SchemaEditorExtension;

// Initialize and render the extension
const initializeExtension = () => {
  // Create container for the extension
  const extensionContainer = document.createElement('div');
  extensionContainer.id = 'schema-editor-extension-root';
  extensionContainer.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 9999;
  `;
  
  // Make sure clicks can pass through except for our components
  extensionContainer.addEventListener('click', (e) => {
    if (e.target === extensionContainer) {
      e.stopPropagation();
    }
  });

  // Add pointer events back for our components
  const style = document.createElement('style');
  style.textContent = `
    [class*="xpo_"] {
      pointer-events: auto !important;
    }
    
    /* Custom scrollbar for JSON editor */
    .json-editor-container ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    
    .json-editor-container ::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 4px;
    }
    
    .json-editor-container ::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 4px;
    }
    
    .json-editor-container ::-webkit-scrollbar-thumb:hover {
      background: #a1a1a1;
    }
  `;
  
  document.head.appendChild(style);
  document.body.appendChild(extensionContainer);
  
  // Render React component
  const root = createRoot(extensionContainer);
  root.render(<SchemaEditorExtension />);
};

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeExtension);
} else {
  initializeExtension();
}
