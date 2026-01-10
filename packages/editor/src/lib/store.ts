/**
 * Zustand store for editor state
 */

import { create } from 'zustand';
import type { PageBlock, Block, Theme } from '@site-builder/shared';

export interface EditorBlock extends PageBlock {
  id: string; // Unique instance ID (different from block_id which is the template)
}

interface EditorState {
  // Current page being edited
  pageId: string | null;
  pageTitle: string;
  pageMetaDescription: string;

  // Blocks on the canvas
  blocks: EditorBlock[];

  // Selected block
  selectedBlockId: string | null;

  // Available block templates
  availableBlocks: Block[];

  // Theme
  theme: Theme | null;

  // Actions
  setPageId: (id: string) => void;
  setPageTitle: (title: string) => void;
  setPageMetaDescription: (description: string) => void;
  addBlock: (blockTemplate: Block, index?: number) => void;
  removeBlock: (id: string) => void;
  updateBlockProps: (id: string, props: Record<string, unknown>) => void;
  moveBlock: (fromIndex: number, toIndex: number) => void;
  selectBlock: (id: string | null) => void;
  setAvailableBlocks: (blocks: Block[]) => void;
  setTheme: (theme: Theme) => void;
  clearCanvas: () => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  pageId: null,
  pageTitle: 'Untitled Page',
  pageMetaDescription: '',
  blocks: [],
  selectedBlockId: null,
  availableBlocks: [],
  theme: null,

  setPageId: (id) => set({ pageId: id }),

  setPageTitle: (title) => set({ pageTitle: title }),

  setPageMetaDescription: (description) => set({ pageMetaDescription: description }),

  addBlock: (blockTemplate, index) => set((state) => {
    const newBlock: EditorBlock = {
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      block_id: blockTemplate.id,
      props: { ...blockTemplate.default_props },
    };

    const newBlocks = [...state.blocks];
    if (index !== undefined) {
      newBlocks.splice(index, 0, newBlock);
    } else {
      newBlocks.push(newBlock);
    }

    return { blocks: newBlocks, selectedBlockId: newBlock.id };
  }),

  removeBlock: (id) => set((state) => ({
    blocks: state.blocks.filter((b) => b.id !== id),
    selectedBlockId: state.selectedBlockId === id ? null : state.selectedBlockId,
  })),

  updateBlockProps: (id, props) => set((state) => ({
    blocks: state.blocks.map((b) =>
      b.id === id ? { ...b, props: { ...b.props, ...props } } : b
    ),
  })),

  moveBlock: (fromIndex, toIndex) => set((state) => {
    const newBlocks = [...state.blocks];
    const [movedBlock] = newBlocks.splice(fromIndex, 1);
    newBlocks.splice(toIndex, 0, movedBlock);
    return { blocks: newBlocks };
  }),

  selectBlock: (id) => set({ selectedBlockId: id }),

  setAvailableBlocks: (blocks) => set({ availableBlocks: blocks }),

  setTheme: (theme) => set({ theme }),

  clearCanvas: () => set({ blocks: [], selectedBlockId: null }),
}));
