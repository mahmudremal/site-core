
import { useBuilder } from "../context";

const BottomStatusBar = () => {
    const { template, sidebar, previewMode } = useBuilder();

    const getCanvasMaxWidth = () => {
        switch (previewMode) {
            case 'mobile': return '375px';
            case 'tablet': return '768px';
            case 'desktop': return '1200px';
            default: return '1200px';
        }
    };

    return (
        <div className="bg-white border-t border-gray-200 px-6 py-3">
            <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center gap-4">
                    <span>Elements: {Object.keys(template.elements).length}</span>
                    {sidebar?.element && (
                        <span className="text-blue-600">
                            Selected: {sidebar.element.type?.replace('-', ' ') ?? ''}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <span>Preview:</span>
                    <span className="capitalize font-medium">{previewMode}</span>
                    <span>({getCanvasMaxWidth()})</span>
                </div>
            </div>
        </div>
    );
};

export default BottomStatusBar;
