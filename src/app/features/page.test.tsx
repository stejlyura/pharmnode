// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import FeaturesPage from './page';

// Mock Auth Context
let mockUser = { id: 'mock-user-id', name: 'Test User', email: 'test@example.com', tariff: 'hobby' };
let mockStatus = 'authenticated';
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    status: mockStatus,
    login: vi.fn(),
    logout: vi.fn(),
    changeTariff: vi.fn()
  }),
}));

// Mock Translation Context
let currentLocale = 'en-US';
const mockSetLocale = vi.fn((newLocale: string) => {
  currentLocale = newLocale;
});

vi.mock('../../context/I18nContext', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const keys: Record<string, string> = {
        header_switch_lang: 'Switch Language',
        header_sign_in: 'Sign In',
        header_logout: 'Log Out',
        cookie_consent_title: 'Cookie Consent',
        footer_privacy: 'Privacy Policy',
        footer_terms: 'Terms of Service',
        footer_cookie: 'Cookie Policy',
        footer_about: 'About Us',
        footer_contact: 'Contact',
        footer_features: 'Features',
        footer_pricing: 'Pricing',
        footer_refund: 'Refund Policy',
        footer_accessibility: 'Accessibility'
      };
      return keys[key] || key;
    },
    locale: currentLocale,
    setLocale: mockSetLocale,
  }),
}));

describe('FeaturesPage Component', () => {
  beforeEach(() => {
    currentLocale = 'en-US';
    vi.clearAllMocks();
  });

  it('renders features page content correctly in English', () => {
    render(<FeaturesPage />);
    
    // Check main title
    expect(screen.getByText('Platform Features')).toBeDefined();
    
    // Check Canva analogy
    expect(screen.getByText('The Canva of Formulation Design')).toBeDefined();
    
    // Check one of the mathematical formulas
    expect(screen.getByText('C = 100 * (\\rho_t - \\rho_b) / \\rho_t')).toBeDefined();
    
    // Check one of the chemical reactions
    expect(screen.getByText('Maillard Browning Reaction')).toBeDefined();

    // Check pricing table title
    expect(screen.getByText('Feature Matrix & Subscription Tiers')).toBeDefined();

    // Check CTA button
    const ctaButton = screen.getByRole('link', { name: /Launch Configurator/i });
    expect(ctaButton).toBeDefined();
    expect(ctaButton.getAttribute('href')).toBe('/configurator');
  });

  it('renders features page content in Russian when locale is set to ru-RU', () => {
    currentLocale = 'ru-RU';
    render(<FeaturesPage />);
    
    // Check main title in Russian
    expect(screen.getByText('Функции платформы')).toBeDefined();
    
    // Check Canva analogy in Russian
    expect(screen.getByText('Canva для разработки формуляций')).toBeDefined();
    
    // Check mathematical formulas
    expect(screen.getByText('C = 100 * (\\rho_t - \\rho_b) / \\rho_t')).toBeDefined();
    
    // Check chemical reactions in Russian
    expect(screen.getByText('Реакция Майяра (потемнение)')).toBeDefined();

    // Check CTA button in Russian
    const ctaButton = screen.getByRole('link', { name: /Запустить конфигуратор/i });
    expect(ctaButton).toBeDefined();
    expect(ctaButton.getAttribute('href')).toBe('/configurator');
  });
});
