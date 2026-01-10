/**
 * Main Editor Component
 * Drag-and-drop page builder
 */

import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { useEditorStore } from '../lib/store';
import { BlocksPanel } from './BlocksPanel';
import { Canvas } from './Canvas';
import { PropertiesPanel } from './PropertiesPanel';
import { Toolbar } from './Toolbar';
import './Editor.css';

export function Editor() {
  const blocks = useEditorStore((state) => state.blocks);
  const moveBlock = useEditorStore((state) => state.moveBlock);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex((b) => b.id === active.id);
      const newIndex = blocks.findIndex((b) => b.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        moveBlock(oldIndex, newIndex);
      }
    }
  };

  return (
    <div className="editor">
      <Toolbar />
      <div className="editor-workspace">
        <BlocksPanel />
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
            <Canvas />
          </SortableContext>
        </DndContext>
        <PropertiesPanel />
      </div>
    </div>
  );
}
