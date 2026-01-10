/**
 * Left panel with available blocks
 */

import { useEffect } from 'react';
import { useEditorStore } from '../lib/store';
import type { Block } from '@site-builder/shared';
import './BlocksPanel.css';

export function BlocksPanel() {
  const availableBlocks = useEditorStore((state) => state.availableBlocks);
  const setAvailableBlocks = useEditorStore((state) => state.setAvailableBlocks);
  const addBlock = useEditorStore((state) => state.addBlock);

  useEffect(() => {
    // Fetch available blocks from API
    fetchBlocks();
  }, []);

  const fetchBlocks = async () => {
    try {
      // TODO: Replace with real API call
      // const response = await fetch('/api/blocks');
      // const data = await response.json();
      // setAvailableBlocks(data.blocks);

      // Mock data for now
      const mockBlocks: Block[] = [
        {
          id: 'block-hero-01',
          type: 'hero',
          category: 'hero',
          name: 'Hero Section',
          description: 'Hero with headline and CTA',
          schema: { props: {} },
          default_props: {
            headline: 'Your Headline Here',
            subheadline: 'Subheadline text',
            ctaText: 'Get Started',
            ctaUrl: '#',
            alignment: 'center',
          },
          created_at: Date.now(),
          updated_at: Date.now(),
        },
        {
          id: 'block-features-01',
          type: 'features',
          category: 'features',
          name: 'Features Grid',
          description: 'Grid of features with icons',
          schema: { props: {} },
          default_props: {
            title: 'Features',
            subtitle: 'What we offer',
            columns: 3,
            items: [
              { icon: '⚡', title: 'Fast', description: 'Lightning fast performance' },
              { icon: '🔒', title: 'Secure', description: 'Bank-level security' },
              { icon: '📊', title: 'Analytics', description: 'Powerful insights' },
            ],
          },
          created_at: Date.now(),
          updated_at: Date.now(),
        },
        {
          id: 'block-pricing-01',
          type: 'pricing',
          category: 'pricing',
          name: 'Pricing Table',
          description: 'Pricing cards with plans',
          schema: { props: {} },
          default_props: {
            title: 'Pricing',
            subtitle: 'Choose your plan',
            plans: [
              {
                name: 'Basic',
                price: '$9',
                period: '/mo',
                features: ['Feature 1', 'Feature 2'],
                ctaText: 'Get Started',
                ctaUrl: '#',
              },
            ],
          },
          created_at: Date.now(),
          updated_at: Date.now(),
        },
        {
          id: 'block-form-01',
          type: 'contact-form',
          category: 'form',
          name: 'Contact Form',
          description: 'Contact form with fields',
          schema: { props: {} },
          default_props: {
            title: 'Contact Us',
            submitText: 'Send',
            fields: [
              { name: 'name', type: 'text', label: 'Name', required: true },
              { name: 'email', type: 'email', label: 'Email', required: true },
            ],
          },
          created_at: Date.now(),
          updated_at: Date.now(),
        },
      ];

      setAvailableBlocks(mockBlocks);
    } catch (error) {
      console.error('Failed to fetch blocks:', error);
    }
  };

  const handleAddBlock = (block: Block) => {
    addBlock(block);
  };

  return (
    <div className="blocks-panel">
      <div className="panel-header">
        <h3>Blocks</h3>
      </div>
      <div className="blocks-list">
        {availableBlocks.map((block) => (
          <div
            key={block.id}
            className="block-item"
            onClick={() => handleAddBlock(block)}
          >
            <div className="block-icon">+</div>
            <div className="block-info">
              <div className="block-name">{block.name}</div>
              <div className="block-description">{block.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
