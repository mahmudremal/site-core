import { useBuilder } from './context';
import { Canvas, BottomStatusBar } from './components';

export const ElementPreview = () => {
  return (
    <div className="xpo_flex-1 xpo_flex xpo_flex-col xpo_bg-gray-100 xpo_overflow-auto">
      <Canvas />
      <BottomStatusBar />
    </div>
  );
};