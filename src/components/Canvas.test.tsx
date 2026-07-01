// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Canvas } from './Canvas';

// Mock auth hook
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'mock-user-id', name: 'Test User', email: 'test@example.com', tariff: 'hobby' },
    status: 'authenticated',
    login: vi.fn(),
    logout: vi.fn(),
    changeTariff: vi.fn(),
    startSubscriptionPolling: vi.fn()
  })
}));

// Mock translation hook
vi.mock('../context/I18nContext', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const keys: Record<string, string> = {
        card_blend_mixing: 'Blending & Mixing',
        card_press_equipment: 'Pressing Equipment',
        card_cost_optimizer: 'Cost Optimizer',
        card_final_product: 'Final Product Label',
        node_ingredient: 'Ingredient',
        node_blender: 'Blending',
        node_tablet_press: 'Press Equipment',
        node_cost: 'Cost Optimizer',
        node_output: 'Output Label',
        sidebar_title: 'Components',
        sidebar_search_placeholder: 'Search ingredients...',
        role_active_singular: 'Active',
        role_filler_singular: 'Filler'
      };
      return keys[key] || key;
    },
    locale: 'en-US',
    setLocale: vi.fn()
  })
}));

// Mock routing hooks
vi.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: (key: string) => {
      if (key === 'recipeId') return 'mock-recipe-id';
      return null;
    },
  }),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

// Mock ingredients hook
vi.mock('../hooks/useIngredients', () => ({
  useIngredients: () => ({
    ingredients: [
      { id: 1, name: 'Active Substance', role: 'active', chemicalClassId: 1, looseBulkDensity: 0.5, tappedBulkDensity: 0.6, costPerKgUsd: 100 },
      { id: 2, name: 'Filler Excipient', role: 'filler', chemicalClassId: 2, looseBulkDensity: 0.4, tappedBulkDensity: 0.5, costPerKgUsd: 5 },
      { id: 3, name: 'Excipient 3', role: 'filler', chemicalClassId: 3, looseBulkDensity: 0.45, tappedBulkDensity: 0.55, costPerKgUsd: 8 }
    ],
    standardIngredients: [
      { id: 1, name: 'Active Substance', role: 'active', chemicalClassId: 1, looseBulkDensity: 0.5, tappedBulkDensity: 0.6, costPerKgUsd: 100 },
      { id: 2, name: 'Filler Excipient', role: 'filler', chemicalClassId: 2, looseBulkDensity: 0.4, tappedBulkDensity: 0.5, costPerKgUsd: 5 },
      { id: 3, name: 'Excipient 3', role: 'filler', chemicalClassId: 3, looseBulkDensity: 0.45, tappedBulkDensity: 0.55, costPerKgUsd: 8 }
    ],
    customIngredients: [],
    isLoading: false,
    error: null,
    refetch: vi.fn()
  })
}));

// Mock isMobile hook
vi.mock('../hooks/useIsMobile', () => ({
  useIsMobile: () => false
}));

// Mock analytics
vi.mock('@/lib/analytics', () => ({
  trackEvent: vi.fn()
}));

// Mock CompatibilityMatrix to prevent next/dynamic imports crashing vitest
vi.mock('./CompatibilityMatrix', () => ({
  CompatibilityMatrix: () => <div data-testid="compatibility-matrix">Compatibility Matrix</div>
}));

describe('Canvas Component', () => {
  beforeEach(() => {
    // Stub global fetch for DB autosaves
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true })
    }));
  });

  it('renders canvas with initial nodes and sidebar', () => {
    render(<Canvas />);

    // Check that core nodes are present (they are initially collapsed)
    expect(screen.getByText('Blending')).toBeDefined();
    expect(screen.getByText('Press Equipment')).toBeDefined();
    expect(screen.getByText('Output Label')).toBeDefined();

    // Check that sidebar is rendered with ingredients list
    expect(screen.getByPlaceholderText('Search ingredients...')).toBeDefined();
    expect(screen.getByText('Excipient 3')).toBeDefined();
  });

  it('adds an ingredient node when clicked in the sidebar', async () => {
    render(<Canvas />);

    // 'Active Substance' and 'Filler Excipient' are already on the canvas initially.
    // 'Excipient 3' is in the sidebar but not on the canvas, so it should be clickable.
    const excipientItem = screen.getByText('Excipient 3');
    const cardElement = excipientItem.closest('.sidebar-ingredient-card');
    expect(cardElement).not.toBeNull();

    // Click the ingredient card to add it to the canvas
    fireEvent.click(cardElement!);

    // Now, a new ingredient node with 'Excipient 3' name should be rendered on the canvas
    // (wait, by default nodes are collapsed, so it will show 'Excipient 3' as its label)
    const canvasNode = screen.getAllByText('Excipient 3');
    // There will be two elements now: one in the sidebar, one on the canvas
    expect(canvasNode.length).toBe(2);
  });

  it('expands a node card on click and allows removing it', async () => {
    const { container } = render(<Canvas />);

    // Initially, Active Substance node-1 is collapsed.
    // Let's expand the first ingredient node by clicking it.
    const cardContainer = container.querySelector('#node-card-node-1');
    expect(cardContainer).not.toBeNull();

    // Click to expand the node card
    fireEvent.click(cardContainer!);

    // Once expanded, the card renders the IngredientNode which includes the Trash button
    // Let's find the trash button by its title (or locator)
    const removeButton = screen.getByTitle('card_remove_ingredient');
    expect(removeButton).toBeDefined();

    // Click to remove the node
    fireEvent.click(removeButton);

    // The 'Active Substance' node should be removed from the canvas
    // There will only be 1 element left (the one in the sidebar list)
    const remainingSubstance = screen.getAllByText('Active Substance');
    expect(remainingSubstance.length).toBe(1);
  });

  it('simulates drag and drop of an ingredient node onto the canvas', () => {
    render(<Canvas />);

    const workspace = screen.getByRole('main'); // '#canvas-workspace' is a <main> tag
    
    // Simulate drop event
    const dropEvent = {
      preventDefault: vi.fn(),
      clientX: 500,
      clientY: 300,
      dataTransfer: {
        getData: (type: string) => {
          if (type === 'application/pharmnode-node') return 'ingredient';
          if (type === 'text/plain') return '3'; // Excipient 3 id
          return '';
        }
      }
    };

    fireEvent.drop(workspace, dropEvent);

    // The node should be added
    const excipientNodes = screen.getAllByText('Excipient 3');
    expect(excipientNodes.length).toBe(2);
  });

  it('supports canvas zooming using toolbar controls', () => {
    render(<Canvas />);

    // Locate the zoom buttons in CanvasToolbar using their translated keys
    const zoomInButton = screen.getByTitle('canvas_zoom_in');
    const zoomOutButton = screen.getByTitle('canvas_zoom_out');
    const resetZoomButton = screen.getByTitle('canvas_zoom_reset');

    expect(zoomInButton).toBeDefined();
    expect(zoomOutButton).toBeDefined();
    expect(resetZoomButton).toBeDefined();

    // Click zoom controls
    fireEvent.click(zoomInButton);
    fireEvent.click(zoomOutButton);
    fireEvent.click(resetZoomButton);
  });
});
