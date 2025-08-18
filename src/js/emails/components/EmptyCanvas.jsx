
import { Move } from 'lucide-react';
import DropZone from './DropZone';
import { useBuilder } from '../context';

const EmptyCanvas = ({ onDrop }) => {
    return (
        <DropZone onDrop={onDrop}>
            <div className="xpo_flex xpo_items-center xpo_justify-center xpo_h-96 xpo_border-2 xpo_border-dashed xpo_border-gray-300 xpo_rounded-lg">
                <div className="xpo_text-center">
                    <div className="xpo_w-16 xpo_min-h-16 xpo_bg-gray-200 xpo_rounded-full xpo_flex xpo_items-center xpo_justify-center xpo_mx-auto xpo_mb-4">
                        <Move size={24} className="xpo_text-gray-400" />
                    </div>
                    <h3 className="xpo_text-lg xpo_font-medium xpo_text-gray-900 xpo_mb-2">
                        Start Building Your Email
                    </h3>
                    <p className="xpo_text-gray-500 xpo_text-sm">
                        Drag elements from the sidebar to start creating your email template
                    </p>
                </div>
            </div>
        </DropZone>
    );
};

export default EmptyCanvas;
