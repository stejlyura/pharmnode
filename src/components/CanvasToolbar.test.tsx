// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CanvasToolbar } from './CanvasToolbar';

// Mock context hook
vi.mock('../context/I18nContext', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const keys: Record<string, string> = {
        canvas_zoom_in: 'Zoom In',
        canvas_zoom_out: 'Zoom Out',
        canvas_zoom_reset: 'Reset Zoom'
      };
      return keys[key] || key;
    }
  }),
}));

describe('CanvasToolbar Component', () => {
  const defaultProps = {
    scale: 1.0,
    onZoomIn: vi.fn(),
    onZoomOut: vi.fn(),
    onZoomReset: vi.fn(),
  };

  it('should render correct zoom percentage text', () => {
    const { rerender } = render(<CanvasToolbar {...defaultProps} />);
    expect(screen.getByText('100%')).toBeDefined();

    rerender(<CanvasToolbar {...defaultProps} scale={0.75} />);
    expect(screen.getByText('75%')).toBeDefined();

    rerender(<CanvasToolbar {...defaultProps} scale={1.5} />);
    expect(screen.getByText('150%')).toBeDefined();
  });

  it('should trigger zoom callbacks when buttons are clicked', () => {
    render(<CanvasToolbar {...defaultProps} />);

    const zoomOutBtn = screen.getByTitle('Zoom Out');
    const zoomInBtn = screen.getByTitle('Zoom In');
    const zoomResetBtn = screen.getByTitle('Reset Zoom');

    fireEvent.click(zoomOutBtn);
    expect(defaultProps.onZoomOut).toHaveBeenCalledTimes(1);

    fireEvent.click(zoomInBtn);
    expect(defaultProps.onZoomIn).toHaveBeenCalledTimes(1);

    fireEvent.click(zoomResetBtn);
    expect(defaultProps.onZoomReset).toHaveBeenCalledTimes(1);
  });
});
