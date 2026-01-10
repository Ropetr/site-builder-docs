/**
 * Individual block on the canvas (sortable)
 */

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useEditorStore, type EditorBlock } from '../lib/store';
import './CanvasBlock.css';

interface CanvasBlockProps {
  block: EditorBlock;
  index: number;
}

export function CanvasBlock({ block }: CanvasBlockProps) {
  const selectedBlockId = useEditorStore((state) => state.selectedBlockId);
  const selectBlock = useEditorStore((state) => state.selectBlock);
  const removeBlock = useEditorStore((state) => state.removeBlock);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isSelected = selectedBlockId === block.id;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectBlock(block.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeBlock(block.id);
  };

  // Render block preview based on type
  const renderPreview = () => {
    const { props } = block;

    switch (block.block_id) {
      case 'block-hero-01':
        return (
          <div className="block-preview hero-preview">
            <h1>{props.headline as string}</h1>
            <p>{props.subheadline as string}</p>
            <button>{props.ctaText as string}</button>
          </div>
        );

      case 'block-features-01':
        return (
          <div className="block-preview features-preview">
            <h2>{props.title as string}</h2>
            <p>{props.subtitle as string}</p>
            <div className="features-grid">
              {(props.items as any[])?.map((item, i) => (
                <div key={i} className="feature-item">
                  <span>{item.icon}</span>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'block-pricing-01':
        return (
          <div className="block-preview pricing-preview">
            <h2>{props.title as string}</h2>
            <p>{props.subtitle as string}</p>
            <div className="pricing-grid">
              {(props.plans as any[])?.map((plan, i) => (
                <div key={i} className="pricing-card">
                  <h3>{plan.name}</h3>
                  <div className="price">{plan.price}</div>
                  <button>{plan.ctaText}</button>
                </div>
              ))}
            </div>
          </div>
        );

      case 'block-form-01':
        return (
          <div className="block-preview form-preview">
            <h2>{props.title as string}</h2>
            <form onClick={(e) => e.preventDefault()}>
              {(props.fields as any[])?.map((field, i) => (
                <div key={i} className="form-field">
                  <label>{field.label}</label>
                  <input type={field.type} placeholder={field.label} />
                </div>
              ))}
              <button>{props.submitText as string}</button>
            </form>
          </div>
        );

      default:
        return (
          <div className="block-preview">
            <p>Block: {block.block_id}</p>
          </div>
        );
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`canvas-block ${isSelected ? 'selected' : ''}`}
      onClick={handleClick}
    >
      <div className="block-toolbar">
        <span className="drag-handle" {...attributes} {...listeners}>
          ⋮⋮
        </span>
        <span className="block-type">{block.block_id}</span>
        <button className="delete-btn" onClick={handleDelete}>
          ×
        </button>
      </div>
      {renderPreview()}
    </div>
  );
}
