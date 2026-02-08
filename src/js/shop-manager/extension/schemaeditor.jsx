import { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { Edit3, X, Save, Eye, EyeOff, Settings } from 'lucide-react';
import { JsonEditor } from 'json-edit-react';
import StoreScraper from './StoreScraper';
import { io } from 'socket.io-client';
import { __ } from '@js/utils';


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
  const [linkImport, setLinkImport] = useState(null);

  const socketRef = useRef(null);
  const dragRef = useRef(null);

  const getTopLevelLinks = () => {
    if (siteSchema?.extract?.links?.length) {
      // console.log('SiteSchema: ', siteSchema)
      const [link, attr = '#', regix = null] = siteSchema.extract.links;
      const allLinks = document.querySelectorAll(link || 'a[href]:not([href=""]):not([href="#"])');
      return Array.from(allLinks).filter(link => !link.parentElement.closest('a'));
    }
    return [];
  }

  // Initialize socket connection
  useEffect(() => {
    // return;
    socketRef.current = io('https://localhost:3000/bot');

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
      data?.extract && setLinkImport(true);
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

  const allLinksRef = useRef([]);
  useEffect(() => {
    if (!linkImport) {
      allLinksRef.current.forEach(i => i.exim && i.exim.remove());
      allLinksRef.current = [];
      return;
    }
    allLinksRef.current.forEach(i => i.exim && i.exim.remove());

    const newLinks = [document.body, ...getTopLevelLinks()].map(i => {
      const isBody = i.nodeName.toLowerCase() === 'body';
      const exim = document.createElement('button');
      exim.type = "button";
      i.appendChild(exim);

      exim.title = __('Send this link to crawler', 'site-core');
      exim.className = `items-center justify-center flex absolute top-2 right-2 bg-white hover:bg-gray-200 border border-gray-300 shadow-sm h-8 ${isBody ? 'w-auto rounded-2 z-[999]' : 'w-8 rounded-full z-10'}`;
      exim.innerHTML = `<svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path opacity="0.5" d="M4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12" stroke="#1C274C" strokeWidth="1.5" strokeLinecap="round"/><path d="M12 4L12 14M12 14L15 11M12 14L9 11" stroke="#1C274C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>${isBody ? 'Import all Links' : ''}`;

      const clickHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const links = isBody ? getTopLevelLinks().map(l => l.href).filter(l => l).join(',') : i.href;
        socketRef.current && socketRef.current.emit('update-links', { links });
        if (!isBody) {
          exim.innerHTML = `<svg width="20px" height="20px" viewBox="0 -0.5 25 25" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.5 12.5L10.167 17L19.5 8" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>`;
          exim.disabled = true;
        }
      };

      exim.addEventListener('click', clickHandler);

      return { element: i, exim, clickHandler };
    });
    allLinksRef.current = newLinks;

    const popstate = (e) => {
      setLinkImport(true);
    };

    window.addEventListener('popstate', popstate);

    return () => {
      allLinksRef.current.forEach(i => {
        i.exim && i.exim.remove();
        if (i.clickHandler) {
          i.exim && i.exim.removeEventListener('click', i.clickHandler);
        }
      });
      window.removeEventListener('popstate', popstate);
    };
  }, [linkImport]);


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
      <div onClick={() => setIsVisible(true)} className="fixed top-4 left-4 z-[10000] bg-blue-600 text-white p-2 rounded-full cursor-pointer shadow-lg hover:bg-blue-700 transition-colors">
        <Settings className="w-4 h-4" />
      </div>
    );
  }

  return (
    <>
      {/* Draggable Main Button */}
      <div
        ref={dragRef}
        className={`fixed z-[10000] bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-lg cursor-move shadow-2xl border border-white/20 backdrop-blur-sm ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        style={{ left: `${position.x}px`, top: `${position.y}px` }}
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
          <button
            className="flex items-center space-x-2 hover:scale-105 transition-transform"
            onClick={(e) => {
              e.stopPropagation();
              setIsPopupOpen(true);
            }}
          >
            <Edit3 className="w-5 h-5" />
            <span className="text-sm font-medium">Schema Editor</span>
          </button>
          <button
            className="ml-2 p-1 hover:bg-white/20 rounded"
            onClick={(e) => {
              e.stopPropagation();
              setIsVisible(false);
            }}
          >
            <EyeOff className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Highlight Mode Indicator */}
      {isHighlightMode && (
        <div className="fixed top-4 right-4 z-[10001] bg-yellow-500 text-black px-4 py-2 rounded-lg shadow-lg font-medium">
          <div className="flex items-center space-x-2">
            <Eye className="w-4 h-4" />
            <span>Click on element to select</span>
            <button
              onClick={() => setIsHighlightMode(false)}
              className="ml-2 p-1 hover:bg-black/20 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Schema Editor Popup */}
      {isPopupOpen && (
        <div className="fixed inset-0 z-[10002] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Schema Editor</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Domain: <span className="font-medium">{location.host}</span>
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleHighlightMode}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${isHighlightMode
                    ? 'bg-yellow-500 text-black hover:bg-yellow-600'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                >
                  <Eye className="w-4 h-4 mr-2 inline" />
                  {isHighlightMode ? 'Exit Select Mode' : 'Select Element'}
                </button>
                <button
                  onClick={() => setIsPopupOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Current Path Display */}
            {currentPath && (
              <div className="px-6 py-3 bg-blue-50 border-b border-blue-200">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-blue-800">Selected:</span>
                  <code className="text-sm bg-blue-100 px-2 py-1 rounded text-blue-900 font-mono">
                    {currentPath}
                  </code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(currentPath);
                    }}
                    className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors"
                  >
                    Copy
                  </button>
                </div>
              </div>
            )}

            {/* Schema Editor Content */}
            <div className="flex-1 overflow-auto p-6">
              {siteSchema ? (
                <div className="h-full border border-gray-200 rounded-lg">
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
                <div className="flex items-center justify-center h-64 text-gray-500">
                  <div className="text-center">
                    <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No schema loaded for this domain</p>
                    <p className="text-sm mt-2">The server will provide the schema when available</p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm text-gray-600">
                  {isConnected ? 'Connected to server' : 'Disconnected from server'}
                </span>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setIsPopupOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSchemaUpdate}
                  disabled={!editedSchema || !isConnected}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors font-medium flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  <span>Update Schema</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <StoreScraper schema={siteSchema?.extensionscraper ?? {}} />
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
    [class*=""] {
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
