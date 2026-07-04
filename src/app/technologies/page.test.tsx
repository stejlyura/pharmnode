// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import TechnologiesPage from './page';

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

describe('TechnologiesPage Component', () => {
  beforeEach(() => {
    currentLocale = 'en-US';
    vi.clearAllMocks();
  });

  it('renders technologies page content correctly in English', () => {
    render(<TechnologiesPage />);
    
    // Check main title
    expect(screen.getByText('Computational Technology')).toBeDefined();
    
    // Check Canva analogy title
    expect(screen.getByText('Canva for Formulation: Heavy physics in a lightweight browser app')).toBeDefined();
    
    // Check equations section
    expect(screen.getByText('Core Mathematical Framework')).toBeDefined();

    // Check skeletal density formula
    expect(screen.getByText('\\rho_true = 100 / \\sum_{i=1}^{n} (w_i / \\rho_{true, i})')).toBeDefined();
    
    // Check scoring matrix
    expect(screen.getByText('Score Deduction Matrix:')).toBeDefined();
    expect(screen.getByText('Critical Chemical Conflict (e.g. Maillard Reaction): -50 points')).toBeDefined();

    // Check table mapping
    expect(screen.getByText('Powder Flowability Classification Scale')).toBeDefined();

    // Check CTA button
    const ctaButton = screen.getByRole('link', { name: /Launch Configurator/i });
    expect(ctaButton).toBeDefined();
    expect(ctaButton.getAttribute('href')).toBe('/configurator');
  });

  it('renders technologies page in Russian when locale is set to ru-RU', () => {
    currentLocale = 'ru-RU';
    render(<TechnologiesPage />);
    
    // Check main title in Russian
    expect(screen.getByText('Технологии расчетов')).toBeDefined();
    
    // Check Canva analogy title in Russian
    expect(screen.getByText('Canva для формулирования: сложная физика в легком браузере')).toBeDefined();
    
    // Check equations section in Russian
    expect(screen.getByText('Основной математический аппарат')).toBeDefined();

    // Check skeletal density formula in Russian
    expect(screen.getByText('\\rho_true = 100 / \\sum_{i=1}^{n} (w_i / \\rho_{true, i})')).toBeDefined();

    // Check scoring matrix in Russian
    expect(screen.getByText('Матрица вычета штрафных баллов:')).toBeDefined();
    expect(screen.getByText('Критический химический конфликт (например, реакция Майяра): -50 баллов')).toBeDefined();

    // Check CTA button in Russian
    const ctaButton = screen.getByRole('link', { name: /Запустить конфигуратор/i });
    expect(ctaButton).toBeDefined();
    expect(ctaButton.getAttribute('href')).toBe('/configurator');
  });
});
