// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import PricingPage from './page';

// Mock Auth Context
let mockUser = { id: 'mock-user-id', name: 'Test User', email: 'test@example.com', tariff: 'hobby' };
let mockStatus = 'authenticated';
const mockChangeTariff = vi.fn();

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    status: mockStatus,
    login: vi.fn(),
    logout: vi.fn(),
    changeTariff: mockChangeTariff
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

// Mock useRouter
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn()
  })
}));

describe('PricingPage Component', () => {
  beforeEach(() => {
    currentLocale = 'en-US';
    vi.clearAllMocks();
  });

  it('renders pricing page content correctly in English', () => {
    render(<PricingPage />);
    
    // Check main title
    expect(screen.getByText('Pricing & License Plans')).toBeDefined();
    
    // Check comparison tables title
    expect(screen.getByText('Detailed Tier Comparison')).toBeDefined();
    expect(screen.getByText('Traditional Software vs PharmNode')).toBeDefined();
    
    // Check traditional software classes
    expect(screen.getByText('Heavy Molecular Software (CADD)')).toBeDefined();
    expect(screen.getByText('Digital CMC / PLM Databases')).toBeDefined();
    expect(screen.getByText('Statistical DoE Software')).toBeDefined();
  });

  it('renders pricing page in Russian when locale is set to ru-RU', () => {
    currentLocale = 'ru-RU';
    render(<PricingPage />);
    
    // Check main title in Russian
    expect(screen.getByText('Цены и Тарифные Планы')).toBeDefined();
    
    // Check competitor table in Russian
    expect(screen.getByText('Традиционные решения против PharmNode')).toBeDefined();
    expect(screen.getByText('Тяжелый молекулярный софт (CADD)')).toBeDefined();
    expect(screen.getByText('Системы ведения комплаенса (Digital CMC)')).toBeDefined();
    expect(screen.getByText('Статистический софт DoE (Планирование)')).toBeDefined();
  });
});
