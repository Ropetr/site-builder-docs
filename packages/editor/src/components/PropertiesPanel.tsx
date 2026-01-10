/**
 * Right panel for editing block properties
 */

import { useEditorStore } from '../lib/store';
import './PropertiesPanel.css';

export function PropertiesPanel() {
  const selectedBlockId = useEditorStore((state) => state.selectedBlockId);
  const blocks = useEditorStore((state) => state.blocks);
  const updateBlockProps = useEditorStore((state) => state.updateBlockProps);

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId);

  if (!selectedBlock) {
    return (
      <div className="properties-panel">
        <div className="panel-header">
          <h3>Properties</h3>
        </div>
        <div className="panel-empty">
          <p>Select a block to edit its properties</p>
        </div>
      </div>
    );
  }

  const handleChange = (key: string, value: unknown) => {
    updateBlockProps(selectedBlock.id, { [key]: value });
  };

  const renderInput = (key: string, value: unknown) => {
    if (typeof value === 'string') {
      if (key.includes('description') || key.includes('message')) {
        return (
          <textarea
            value={value}
            onChange={(e) => handleChange(key, e.target.value)}
            rows={3}
          />
        );
      }
      return (
        <input
          type="text"
          value={value}
          onChange={(e) => handleChange(key, e.target.value)}
        />
      );
    }

    if (typeof value === 'number') {
      return (
        <input
          type="number"
          value={value}
          onChange={(e) => handleChange(key, parseInt(e.target.value))}
        />
      );
    }

    if (typeof value === 'boolean') {
      return (
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => handleChange(key, e.target.checked)}
        />
      );
    }

    if (Array.isArray(value)) {
      return (
        <div className="array-value">
          <div className="array-info">Array with {value.length} items</div>
          <button className="btn-small" onClick={() => {
            // TODO: Open array editor modal
            alert('Array editing - coming soon!');
          }}>
            Edit Items
          </button>
        </div>
      );
    }

    return <span className="readonly-value">{JSON.stringify(value)}</span>;
  };

  return (
    <div className="properties-panel">
      <div className="panel-header">
        <h3>Properties</h3>
        <span className="block-id">{selectedBlock.block_id}</span>
      </div>
      <div className="properties-list">
        {Object.entries(selectedBlock.props).map(([key, value]) => (
          <div key={key} className="property-item">
            <label className="property-label">
              {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
            </label>
            {renderInput(key, value)}
          </div>
        ))}
      </div>
    </div>
  );
}
