/**
 * Top toolbar with page actions
 */

import { useEditorStore } from '../lib/store';
import './Toolbar.css';

export function Toolbar() {
  const pageTitle = useEditorStore((state) => state.pageTitle);
  const setPageTitle = useEditorStore((state) => state.setPageTitle);

  const handleSave = async () => {
    // TODO: Implement save to API
    alert('Save functionality - coming soon!');
  };

  const handlePreview = () => {
    // TODO: Open preview in new window
    alert('Preview functionality - coming soon!');
  };

  return (
    <div className="toolbar">
      <div className="toolbar-left">
        <input
          type="text"
          className="page-title-input"
          value={pageTitle}
          onChange={(e) => setPageTitle(e.target.value)}
          placeholder="Page Title"
        />
      </div>
      <div className="toolbar-right">
        <button className="btn btn-secondary" onClick={handlePreview}>
          Preview
        </button>
        <button className="btn btn-primary" onClick={handleSave}>
          Save
        </button>
      </div>
    </div>
  );
}
