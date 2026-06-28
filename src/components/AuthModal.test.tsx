// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AuthModal } from './AuthModal';

// Mock context hooks
const mockLogin = vi.fn();
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
  }),
}));

vi.mock('../context/I18nContext', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const keys: Record<string, string> = {
        canvas_auth_required: 'Authorization Required',
        canvas_auth_desc: 'Sign in to save recipes',
        canvas_quick_login: 'Quick Login',
        canvas_login_hobby: 'Mock Hobby User',
        canvas_login_pro: 'Mock Professional User',
        canvas_or_register: 'Or Register',
        canvas_your_name: 'Name',
        canvas_plan_label: 'Plan',
        canvas_hobby_option: 'Hobby',
        canvas_pro_option: 'Professional',
        canvas_create_account: 'Create Account'
      };
      return keys[key] || key;
    },
    locale: 'en-US',
  }),
}));

describe('AuthModal Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render anything when isOpen is false', () => {
    const { container } = render(<AuthModal isOpen={false} onClose={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render header and mock login options in development environment', () => {
    render(<AuthModal isOpen={true} onClose={() => {}} />);

    expect(screen.getByText(/Authorization Required/)).toBeDefined();
    expect(screen.getByText('Sign in to save recipes')).toBeDefined();
    expect(screen.getByText('Quick Login')).toBeDefined();
    expect(screen.getByText('Mock Hobby User')).toBeDefined();
    expect(screen.getByText('Mock Professional User')).toBeDefined();
  });

  it('should trigger onClose when close button is clicked', () => {
    const mockClose = vi.fn();
    render(<AuthModal isOpen={true} onClose={mockClose} />);

    const closeBtn = screen.getByText('✕');
    fireEvent.click(closeBtn);
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  it('should call auth login on quick login profile click', () => {
    render(<AuthModal isOpen={true} onClose={() => {}} />);

    const hobbyLoginBtn = screen.getByText('Mock Hobby User');
    fireEvent.click(hobbyLoginBtn);
    expect(mockLogin).toHaveBeenCalledWith('mock-google');
  });

  it('should trigger login with credentials when registration form is submitted', () => {
    render(<AuthModal isOpen={true} onClose={() => {}} />);

    // Fill in details
    const nameInput = screen.getByLabelText('Name');
    const emailInput = screen.getByPlaceholderText('ivan@pharma.com');
    const submitBtn = screen.getByText('Create Account');

    fireEvent.change(nameInput, { target: { value: 'Alex Mercer' } });
    fireEvent.change(emailInput, { target: { value: 'alex@pharmnode.com' } });
    fireEvent.click(submitBtn);

    expect(mockLogin).toHaveBeenCalledWith('mock-google', {
      name: 'Alex Mercer',
      email: 'alex@pharmnode.com',
      tariff: 'hobby'
    });
  });
});
