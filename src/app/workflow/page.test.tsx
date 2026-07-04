// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import WorkflowPage from './page';

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

describe('WorkflowPage Component', () => {
  beforeEach(() => {
    currentLocale = 'en-US';
    vi.clearAllMocks();
  });

  it('renders workflow page content correctly in English', () => {
    render(<WorkflowPage />);
    
    // Check main title
    expect(screen.getByText('Technological Workflow')).toBeDefined();
    
    // Check Canva analogy title
    expect(screen.getByText('How It Works: Visual drag-and-drop compounding')).toBeDefined();
    
    // Check step 1 title
    expect(screen.getByText('Step 1: Ingredients & Target Baseline')).toBeDefined();
    
    // Check mock canvas elements
    expect(screen.getByText('Interactive Canvas Simulation')).toBeDefined();
    expect(screen.getByText('API: Vitamin C')).toBeDefined();

    // Check CTA button
    const ctaButton = screen.getByRole('link', { name: /Launch Configurator/i });
    expect(ctaButton).toBeDefined();
    expect(ctaButton.getAttribute('href')).toBe('/configurator');
  });

  it('renders workflow page content in Russian when locale is set to ru-RU', () => {
    currentLocale = 'ru-RU';
    render(<WorkflowPage />);
    
    // Check main title in Russian
    expect(screen.getByText('Технологический процесс')).toBeDefined();
    
    // Check Canva analogy title in Russian
    expect(screen.getByText('Как это работает: визуальное проектирование рецептур')).toBeDefined();
    
    // Check step 1 title in Russian
    expect(screen.getByText('Шаг 1: Добавление ингредиентов')).toBeDefined();

    // Check mock canvas elements in Russian
    expect(screen.getByText('Интерактивная симуляция холста')).toBeDefined();
    expect(screen.getByText('АФС: Витамин C')).toBeDefined();

    // Check CTA button in Russian
    const ctaButton = screen.getByRole('link', { name: /Запустить конфигуратор/i });
    expect(ctaButton).toBeDefined();
    expect(ctaButton.getAttribute('href')).toBe('/configurator');
  });
});
