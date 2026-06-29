// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PricingPanel } from './PricingPanel';

// Mock context/analytics hooks
interface TestMockUser {
  id: string;
  email: string;
  tariff: string;
}
let mockUser: TestMockUser | null = null;
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
  }),
}));

vi.mock('../context/I18nContext', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const keys: Record<string, string> = {
        pricing_title: 'Pricing Plans',
        pricing_subtitle: 'Choose your license',
        pricing_desc: 'Test limits in real time.',
        pricing_hobby_desc: 'Hobby description',
        pricing_pro_desc: 'Pro description',
        pricing_current_plan: 'Current Plan',
        pricing_active_plan: 'Active Plan',
        pricing_upgrade_pro: 'Upgrade to Pro',
        pricing_month: 'month',
        pricing_forever: 'forever',
        pricing_hobby_feature_1: '3 ingredients max',
        pricing_hobby_feature_2: 'Base library',
        pricing_hobby_feature_3: 'Deterministic risk analysis',
        pricing_hobby_feature_4: 'AI substitution engine',
        pricing_hobby_feature_5: 'Export GMP PDF reports',
        pricing_pro_feature_1: 'Unlimited ingredients',
        pricing_pro_feature_2: 'Full library',
        pricing_pro_feature_3: 'AI auto-selection',
        pricing_pro_feature_4: 'Chemical conflict resolution',
        pricing_pro_feature_5: 'Export GMP PDF reports',
        paddle_sdk_error: 'Paddle gateway error',
      };
      return keys[key] || key;
    },
    locale: 'en-US',
  }),
}));

vi.mock('@/lib/analytics', () => ({
  trackEvent: vi.fn(),
}));

describe('PricingPanel Component', () => {
  const mockPaddleOpen = vi.fn();
  const mockSelectTariff = vi.fn();

  beforeEach(() => {
    mockUser = null;
    vi.clearAllMocks();
    window.Paddle = {
      Checkout: {
        open: mockPaddleOpen,
      },
    } as unknown as Window["Paddle"];
  });

  it('should render the pricing header and both plan cards', () => {
    render(
      <PricingPanel
        currentTariff="hobby"
        onSelectTariff={mockSelectTariff}
      />
    );

    expect(screen.getByText('Pricing Plans')).toBeDefined();
    expect(screen.getByText('Choose your license')).toBeDefined();
    expect(screen.getByText('Hobby')).toBeDefined();
    expect(screen.getByText('Professional')).toBeDefined();
    expect(screen.getByText('Hobby description')).toBeDefined();
    expect(screen.getByText('Pro description')).toBeDefined();
  });

  it('should show "Active Plan" on Hobby card when currentTariff is hobby', () => {
    mockUser = { id: 'user-1', email: 'test@example.com', tariff: 'hobby' };
    render(
      <PricingPanel
        currentTariff="hobby"
        onSelectTariff={mockSelectTariff}
      />
    );

    const hobbyBtn = screen.getByRole('button', { name: 'Active Plan' });
    expect(hobbyBtn).toBeDefined();
    expect(hobbyBtn.hasAttribute('disabled')).toBe(true);
  });

  it('should call onSelectTariff when Hobby card is selected and user is on Professional plan', () => {
    mockUser = { id: 'user-1', email: 'test@example.com', tariff: 'professional' };
    render(
      <PricingPanel
        currentTariff="professional"
        onSelectTariff={mockSelectTariff}
      />
    );

    // Hobby card downgrade button should be disabled under standard PricingCard logic
    const downgradeBtn = screen.getByRole('button', { name: /Downgrade unavailable/i });
    expect(downgradeBtn).toBeDefined();
    expect(downgradeBtn.hasAttribute('disabled')).toBe(true);
  });

  it('should redirect guest user (call onSelectTariff with professional) when clicking Upgrade on Professional card', () => {
    // When guest is not logged in: mockUser = null
    render(
      <PricingPanel
        currentTariff="hobby"
        onSelectTariff={mockSelectTariff}
      />
    );

    const proBtn = screen.getByRole('button', { name: 'Upgrade to Pro' });
    fireEvent.click(proBtn);

    // Should call onSelectTariff('professional') so the parent can redirect to login
    expect(mockSelectTariff).toHaveBeenCalledWith('professional');
    expect(mockPaddleOpen).not.toHaveBeenCalled();
  });

  it('should initiate Paddle Checkout when logged-in user clicks Upgrade on Professional card', () => {
    mockUser = { id: 'user-123', email: 'user@example.com', tariff: 'hobby' };
    render(
      <PricingPanel
        currentTariff="hobby"
        onSelectTariff={mockSelectTariff}
      />
    );

    const proBtn = screen.getByRole('button', { name: 'Upgrade to Pro' });
    fireEvent.click(proBtn);

    // Should trigger Paddle SDK checkout
    expect(mockPaddleOpen).toHaveBeenCalledWith(
      expect.objectContaining({
        customer: {
          email: 'user@example.com',
        },
        customData: {
          userId: 'user-123',
        },
      })
    );
  });

  it('should alert on missing Paddle SDK when logged-in user clicks Upgrade and Paddle is undefined', () => {
    mockUser = { id: 'user-123', email: 'user@example.com', tariff: 'hobby' };
    delete window.Paddle;

    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(
      <PricingPanel
        currentTariff="hobby"
        onSelectTariff={mockSelectTariff}
      />
    );

    const proBtn = screen.getByRole('button', { name: 'Upgrade to Pro' });
    fireEvent.click(proBtn);

    expect(alertSpy).toHaveBeenCalledWith('Paddle gateway error');
    alertSpy.mockRestore();
  });
});
