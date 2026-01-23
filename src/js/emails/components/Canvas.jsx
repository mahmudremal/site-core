
import { useRef } from 'react';
import { useBuilder } from '../context';
import EmptyCanvas from './EmptyCanvas';
import SingleElement from './SingleElement';
import DropZone from './DropZone';

const Canvas = () => {
    const { template, setSidebar, previewMode, drop_element } = useBuilder();
    const canvasRef = useRef(null);

    const handleCanvasClick = (e) => {
        if (e.target === canvasRef.current) {
            setSidebar(prev => ({ ...prev, selectedTab: 'content', visible: null, element: null }));
        }
    };

    const getCanvasMaxWidth = () => {
        switch (previewMode) {
            case 'mobile': return '375px';
            case 'tablet': return '768px';
            case 'desktop': return '1200px';
            default: return '1200px';
        }
    };

    return (
        <div className="flex-1 flex items-start justify-center p-8">
            <div
                className="transition-all duration-300 bg-white shadow-lg rounded-lg"
                style={{
                    width: '100%',
                    minHeight: '800px',
                    maxWidth: getCanvasMaxWidth()
                }}
            >
                <div ref={canvasRef} onClick={e => handleCanvasClick(e)} className="relative min-h-full p-6">
                    {Object.keys(template.elements).length === 0 ? (
                        <EmptyCanvas onDrop={drop_element} />
                    ) : (
                        Object.entries(template.elements).map(([elementKey, element], index) => <SingleElement key={index} element={element} index={index} />)
                    )}
                    {Object.keys(template.elements).length > 0 && (
                        <DropZone onDrop={drop_element}>
                            <div className="min-h-16 flex items-center justify-center text-gray-400 text-sm">
                                Drop elements here
                            </div>
                        </DropZone>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Canvas;
