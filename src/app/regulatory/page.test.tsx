// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import RegulatoryPage from './page';

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

describe('RegulatoryPage Component', () => {
  beforeEach(() => {
    currentLocale = 'en-US';
    vi.clearAllMocks();
  });

  it('renders regulatory page content correctly in English', () => {
    render(<RegulatoryPage />);
    
    // Check main title
    expect(screen.getByText('Regulatory Compliance')).toBeDefined();
    
    // Check Canva analogy title
    expect(screen.getByText('Canva for Compliance: Simplifying GxP audits and validation')).toBeDefined();
    
    // Check section content
    expect(screen.getByText('1. FDA 21 CFR Part 11 & EU GMP Annex 11')).toBeDefined();
    expect(screen.getByText('2. FALCPA & EU FIC 1169/2011 Compliance')).toBeDefined();
    expect(screen.getByText('3. ICH Q8 (R2) Quality by Design (QbD)')).toBeDefined();

    // Check CTA button
    const ctaButton = screen.getByRole('link', { name: /Launch Configurator/i });
    expect(ctaButton).toBeDefined();
    expect(ctaButton.getAttribute('href')).toBe('/configurator');
  });

  it('renders regulatory page in Russian when locale is set to ru-RU', () => {
    currentLocale = 'ru-RU';
    render(<RegulatoryPage />);
    
    // Check main title in Russian
    expect(screen.getByText('Регуляторное соответствие')).toBeDefined();
    
    // Check Canva analogy title in Russian
    expect(screen.getByText('Canva для комплаенса: простое прохождение аудитов GxP')).toBeDefined();
    
    // Check sections in Russian
    expect(screen.getByText('1. Стандарты электронных записей FDA 21 CFR Part 11 и EU GMP Annex 11')).toBeDefined();
    expect(screen.getByText('2. Стандарты FALCPA и EFSA Регламент 1169/2011')).toBeDefined();
    expect(screen.getByText('3. Стандарт ICH Q8 (R2) Quality by Design (QbD)')).toBeDefined();

    // Check CTA button in Russian
    const ctaButton = screen.getByRole('link', { name: /Запустить конфигуратор/i });
    expect(ctaButton).toBeDefined();
    expect(ctaButton.getAttribute('href')).toBe('/configurator');
  });
});
