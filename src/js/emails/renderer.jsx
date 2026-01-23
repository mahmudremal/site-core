import { useBuilder } from './context';
import { Canvas, BottomStatusBar } from './components';

export const ElementPreview = () => {
  return (
    <div className="flex-1 flex flex-col bg-gray-100 overflow-auto">
      <Canvas />
      <BottomStatusBar />
    </div>
  );
};