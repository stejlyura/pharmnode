// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import UseCasesPage from './page';

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

describe('UseCasesPage Component', () => {
  beforeEach(() => {
    currentLocale = 'en-US';
    vi.clearAllMocks();
  });

  it('renders use cases page content correctly in English and allows interaction', () => {
    render(<UseCasesPage />);
    
    // Check main title
    expect(screen.getByText('Practical Use Cases')).toBeDefined();
    
    // Check Canva analogy title
    expect(screen.getByText('Canva for Chemists: Solving complex B2B scenarios in a single click')).toBeDefined();
    
    // Check scenario title
    expect(screen.getByText('R&D Laboratories')).toBeDefined();
    expect(screen.getByText('Contract Manufacturing (CDMO)')).toBeDefined();

    // Check Case Studies
    expect(screen.getByText('Case Study 1: Excipient Flowability Tuning')).toBeDefined();

    // Check before/after toggle buttons
    const tabBefore = screen.getByText('Initial Formula (2 Conflicts)');
    const tabAfter = screen.getByText('Optimized Formula (100% Stable)');
    expect(tabBefore).toBeDefined();
    expect(tabAfter).toBeDefined();

    // In 'before' tab, check lactose is visible and mannitol is not
    expect(screen.getByText('Filler: Lactose Monohydrate')).toBeDefined();
    expect(screen.queryByText('Filler: Mannitol (Allergen Free)')).toBeNull();

    // Click 'after' tab
    fireEvent.click(tabAfter);

    // Now lactose should be gone, mannitol should be visible
    expect(screen.queryByText('Filler: Lactose Monohydrate')).toBeNull();
    expect(screen.getByText('Filler: Mannitol (Allergen Free)')).toBeDefined();

    // Check CTA button
    const ctaButton = screen.getByRole('link', { name: /Launch Configurator/i });
    expect(ctaButton).toBeDefined();
    expect(ctaButton.getAttribute('href')).toBe('/configurator');
  });

  it('renders use cases page content in Russian when locale is set to ru-RU', () => {
    currentLocale = 'ru-RU';
    render(<UseCasesPage />);
    
    // Check main title in Russian
    expect(screen.getByText('Практические кейсы')).toBeDefined();
    
    // Check Canva analogy title in Russian
    expect(screen.getByText('Canva для химиков: решение сложных B2B кейсов в один клик')).toBeDefined();
    
    // Check scenarios in Russian
    expect(screen.getByText('Лаборатории R&D')).toBeDefined();
    expect(screen.getByText('Контрактные производства (CDMO)')).toBeDefined();

    // Check Before/After toggle in Russian
    expect(screen.getByText('Исходный рецепт (2 Конфликта)')).toBeDefined();
    expect(screen.getByText('Оптимизированный рецепт (100% Стабилен)')).toBeDefined();

    // Check CTA button in Russian
    const ctaButton = screen.getByRole('link', { name: /Запустить конфигуратор/i });
    expect(ctaButton).toBeDefined();
    expect(ctaButton.getAttribute('href')).toBe('/configurator');
  });
});
