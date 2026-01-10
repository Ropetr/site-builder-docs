/**
 * Center canvas area with blocks
 */

import { useEditorStore } from '../lib/store';
import { CanvasBlock } from './CanvasBlock';
import './Canvas.css';

export function Canvas() {
  const blocks = useEditorStore((state) => state.blocks);
  const selectBlock = useEditorStore((state) => state.selectBlock);

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      selectBlock(null);
    }
  };

  return (
    <div className="canvas" onClick={handleCanvasClick}>
      <div className="canvas-inner">
        {blocks.length === 0 ? (
          <div className="canvas-empty">
            <div className="empty-icon">📦</div>
            <h3>Start Building</h3>
            <p>Add blocks from the left panel to get started</p>
          </div>
        ) : (
          <div className="canvas-blocks">
            {blocks.map((block, index) => (
              <CanvasBlock key={block.id} block={block} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
