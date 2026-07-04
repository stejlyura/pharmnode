// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import LandingPage from './page';

// Mock Auth Context
let mockUser = { id: 'mock-user-id', name: 'Test User', email: 'test@example.com', tariff: 'hobby' };
let mockStatus = 'authenticated';
vi.mock('../context/AuthContext', () => ({
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

vi.mock('../context/I18nContext', () => ({
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

// Mock useRouter
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn()
  })
}));

describe('LandingPage Component', () => {
  beforeEach(() => {
    currentLocale = 'en-US';
    vi.clearAllMocks();
  });

  it('renders landing page content correctly in English', () => {
    render(<LandingPage />);
    
    // Check main title
    expect(screen.getByText('Virtual Formulation Studio for B2B Pharma & Supplements')).toBeDefined();
    
    // Check CTA button link is configurator
    const heroCtaButton = screen.getByRole('link', { name: /Launch Configurator/i });
    expect(heroCtaButton).toBeDefined();
    expect(heroCtaButton.getAttribute('href')).toBe('/configurator');

    // Check Benefits section title
    expect(screen.getByText('Why B2B Labs Choose PharmNode')).toBeDefined();
    
    // Check Canva analogy
    expect(screen.getByText('Canva for Chemists: Visual prototyping')).toBeDefined();
    
    // Check competitor matrix headers
    expect(screen.getByText('Traditional Solutions vs PharmNode')).toBeDefined();
    expect(screen.getByText('Heavy Molecular Software (CADD)')).toBeDefined();
    expect(screen.getByText('Digital CMC / PLM Databases')).toBeDefined();
    expect(screen.getByText('Design of Experiments (DoE) Software')).toBeDefined();
  });

  it('renders landing page in Russian when locale is set to ru-RU', () => {
    currentLocale = 'ru-RU';
    render(<LandingPage />);
    
    // Check Russian main title
    expect(screen.getByText('Виртуальная студия разработки лекарств и БАДов')).toBeDefined();
    
    // Check Russian CTA button link is configurator
    const heroCtaButton = screen.getByRole('link', { name: /Запустить конфигуратор/i });
    expect(heroCtaButton).toBeDefined();
    expect(heroCtaButton.getAttribute('href')).toBe('/configurator');

    // Check Benefits in Russian
    expect(screen.getByText('Почему B2B лаборатории выбирают PharmNode')).toBeDefined();
    expect(screen.getByText('Canva для химиков: виртуальное прототипирование')).toBeDefined();
    expect(screen.getByText('Традиционные решения против PharmNode')).toBeDefined();
    expect(screen.getByText('Тяжелый молекулярный софт (CADD)')).toBeDefined();
  });
});
