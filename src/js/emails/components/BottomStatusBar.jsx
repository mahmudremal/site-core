
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
        <div className="xpo_bg-white xpo_border-t xpo_border-gray-200 xpo_px-6 xpo_py-3">
            <div className="xpo_flex xpo_items-center xpo_justify-between xpo_text-sm xpo_text-gray-600">
                <div className="xpo_flex xpo_items-center xpo_gap-4">
                    <span>Elements: {Object.keys(template.elements).length}</span>
                    {sidebar?.element && (
                        <span className="xpo_text-blue-600">
                            Selected: {sidebar.element.type?.replace('-', ' ')??''}
                        </span>
                    )}
                </div>
                <div className="xpo_flex xpo_items-center xpo_gap-2">
                    <span>Preview:</span>
                    <span className="xpo_capitalize xpo_font-medium">{previewMode}</span>
                    <span>({getCanvasMaxWidth()})</span>
                </div>
            </div>
        </div>
    );
};

export default BottomStatusBar;
