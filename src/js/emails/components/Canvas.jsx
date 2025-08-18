
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
        <div className="xpo_flex-1 xpo_flex xpo_items-start xpo_justify-center xpo_p-8">
            <div
                className="xpo_transition-all xpo_duration-300 xpo_bg-white xpo_shadow-lg xpo_rounded-lg"
                style={{
                    width: '100%',
                    minHeight: '800px',
                    maxWidth: getCanvasMaxWidth()
                }}
            >
                <div ref={canvasRef} onClick={e => handleCanvasClick(e)} className="xpo_relative xpo_min-h-full xpo_p-6">
                    {Object.keys(template.elements).length === 0 ? (
                        <EmptyCanvas onDrop={drop_element} />
                    ) : (
                        Object.entries(template.elements).map(([elementKey, element], index) => <SingleElement key={index} element={element} index={index} />)
                    )}
                    {Object.keys(template.elements).length > 0 && (
                        <DropZone onDrop={drop_element}>
                            <div className="xpo_min-h-16 xpo_flex xpo_items-center xpo_justify-center xpo_text-gray-400 xpo_text-sm">
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
