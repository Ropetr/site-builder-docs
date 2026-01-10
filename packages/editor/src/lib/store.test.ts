import { describe, it, expect, beforeEach } from 'vitest';
import { useEditorStore } from './store';
import type { Block } from '@site-builder/shared';

describe('Editor Store', () => {
  beforeEach(() => {
    // Reset store before each test
    useEditorStore.setState({
      blocks: [],
      selectedBlockId: null,
      availableBlocks: [],
    });
  });

  it('should add a block to canvas', () => {
    const mockBlock: Block = {
      id: 'block-hero-01',
      type: 'hero',
      category: 'hero',
      name: 'Hero Section',
      schema: { props: {} },
      default_props: { headline: 'Test' },
      created_at: Date.now(),
      updated_at: Date.now(),
    };

    const { addBlock, blocks } = useEditorStore.getState();
    addBlock(mockBlock);

    const state = useEditorStore.getState();
    expect(state.blocks.length).toBe(1);
    expect(state.blocks[0].block_id).toBe('block-hero-01');
    expect(state.blocks[0].props.headline).toBe('Test');
  });

  it('should remove a block from canvas', () => {
    const mockBlock: Block = {
      id: 'block-hero-01',
      type: 'hero',
      category: 'hero',
      name: 'Hero Section',
      schema: { props: {} },
      default_props: { headline: 'Test' },
      created_at: Date.now(),
      updated_at: Date.now(),
    };

    const { addBlock, removeBlock } = useEditorStore.getState();
    addBlock(mockBlock);

    const state1 = useEditorStore.getState();
    const blockId = state1.blocks[0].id;

    removeBlock(blockId);

    const state2 = useEditorStore.getState();
    expect(state2.blocks.length).toBe(0);
  });

  it('should update block props', () => {
    const mockBlock: Block = {
      id: 'block-hero-01',
      type: 'hero',
      category: 'hero',
      name: 'Hero Section',
      schema: { props: {} },
      default_props: { headline: 'Original' },
      created_at: Date.now(),
      updated_at: Date.now(),
    };

    const { addBlock, updateBlockProps } = useEditorStore.getState();
    addBlock(mockBlock);

    const state1 = useEditorStore.getState();
    const blockId = state1.blocks[0].id;

    updateBlockProps(blockId, { headline: 'Updated' });

    const state2 = useEditorStore.getState();
    expect(state2.blocks[0].props.headline).toBe('Updated');
  });

  it('should select and deselect blocks', () => {
    const { selectBlock } = useEditorStore.getState();

    selectBlock('block-123');
    expect(useEditorStore.getState().selectedBlockId).toBe('block-123');

    selectBlock(null);
    expect(useEditorStore.getState().selectedBlockId).toBeNull();
  });
});
