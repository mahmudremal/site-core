
import { Move } from 'lucide-react';
import DropZone from './DropZone';
import { useBuilder } from '../context';

const EmptyCanvas = ({ onDrop }) => {
    return (
        <DropZone onDrop={onDrop}>
            <div className="flex items-center justify-center h-96 border-2 border-dashed border-gray-300 rounded-lg">
                <div className="text-center">
                    <div className="w-16 min-h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Move size={24} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Start Building Your Email
                    </h3>
                    <p className="text-gray-500 text-sm">
                        Drag elements from the sidebar to start creating your email template
                    </p>
                </div>
            </div>
        </DropZone>
    );
};

export default EmptyCanvas;
