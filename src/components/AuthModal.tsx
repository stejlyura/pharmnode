"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/I18nContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login } = useAuth();
  const { t, locale } = useTranslation();

  const [regForm, setRegForm] = useState({
    name: '',
    email: '',
    tariff: 'hobby' as 'hobby' | 'professional'
  });

  const [authError, setAuthError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleQuickLogin = async (provider: 'mock-google' | 'mock-github' | 'mock-microsoft') => {
    try {
      await login(provider);
      onClose();
      setAuthError(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('canvas_login_error');
      setAuthError(msg);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regForm.name.trim() || !regForm.email.trim()) {
      setAuthError(t('canvas_fill_name_email'));
      return;
    }
    setAuthError(null);
    try {
      await login('mock-google', {
        name: regForm.name.trim(),
        email: regForm.email.trim(),
        tariff: regForm.tariff
      });
      onClose();
      setRegForm({ name: '', email: '', tariff: 'hobby' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('canvas_reg_error');
      setAuthError(msg);
    }
  };

  const isProduction =
    process.env.NODE_ENV === 'production' ||
    process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === 'production';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-950/90 border border-zinc-900 rounded-2xl shadow-2xl p-6 relative theme-element">
        <button
          onClick={() => {
            onClose();
            setAuthError(null);
          }}
          className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 transition-colors z-45"
        >
          ✕
        </button>

        <h2 className="text-lg font-bold text-zinc-100 mb-2 uppercase tracking-wide flex items-center gap-2">
          🔐 {t('canvas_auth_required')}
        </h2>
        <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
          {t('canvas_auth_desc')}
        </p>

        {authError && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-xs text-rose-400 flex items-start gap-2">
            <AlertTriangle size={14} className="shrink-0 mt-0.5" />
            <span>{authError}</span>
          </div>
        )}

        {isProduction ? (
          <div className="flex flex-col gap-4 mt-4">
            <p className="text-xs text-zinc-300 leading-relaxed">
              {locale === 'ru-RU'
                ? 'Для создания собственных компонентов и сохранения рецептур необходимо войти в систему.'
                : 'Please sign in or register to create custom components and save formulations.'}
            </p>
            <Link
              href="/login?callbackUrl=/configurator"
              className="w-full py-2.5 bg-indigo-500 hover:bg-indigo-650 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center cursor-pointer text-center"
            >
              {locale === 'ru-RU' ? 'Войти в систему' : 'Sign In / Register'}
            </Link>
          </div>
        ) : (
          <>
            {/* Quick Mock Login Profiles */}
            <div className="flex flex-col gap-2 mb-6">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-1">
                {t('canvas_quick_login')}
              </span>
              <button
                onClick={() => handleQuickLogin('mock-google')}
                className="w-full py-2 px-3 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-200 text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer border border-zinc-800/50 bg-zinc-900/40"
              >
                <div className="w-4 h-4 rounded bg-red-500/10 flex items-center justify-center text-red-400 text-[9px] font-bold">G</div>
                <span>{t('canvas_login_hobby')}</span>
              </button>
              <button
                onClick={() => handleQuickLogin('mock-github')}
                className="w-full py-2 px-3 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-200 text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer border border-zinc-800/50 bg-zinc-900/40"
              >
                <div className="w-4 h-4 rounded bg-indigo-500/10 flex items-center justify-center text-indigo-400 text-[9px] font-bold">Git</div>
                <span>{t('canvas_login_pro')}</span>
              </button>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleRegister} className="border-t border-zinc-900 pt-4 flex flex-col gap-3">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">
                {t('canvas_or_register')}
              </span>
              <div>
                <label htmlFor="auth-name" className="block text-[10px] text-zinc-400 font-semibold mb-1 uppercase tracking-wider">
                  {t('canvas_your_name')}
                </label>
                <input
                  id="auth-name"
                  type="text"
                  placeholder={locale === 'ru-RU' ? 'Иван Иванов' : 'John Doe'}
                  value={regForm.name}
                  onChange={(e) => setRegForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-850 text-zinc-200 placeholder-zinc-650 rounded-lg text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <div>
                <label htmlFor="auth-email" className="block text-[10px] text-zinc-400 font-semibold mb-1 uppercase tracking-wider">Email</label>
                <input
                  id="auth-email"
                  type="email"
                  placeholder="ivan@pharma.com"
                  value={regForm.email}
                  onChange={(e) => setRegForm((prev) => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-850 text-zinc-200 placeholder-zinc-650 rounded-lg text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <div>
                <label htmlFor="auth-tariff" className="block text-[10px] text-zinc-400 font-semibold mb-1 uppercase tracking-wider">
                  {t('canvas_plan_label')}
                </label>
                <select
                  id="auth-tariff"
                  value={regForm.tariff}
                  onChange={(e) => setRegForm((prev) => ({ ...prev, tariff: e.target.value as 'hobby' | 'professional' }))}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-850 text-zinc-200 rounded-lg text-xs focus:outline-none focus:border-indigo-500 transition-colors bg-zinc-900"
                >
                  <option value="hobby">{t('canvas_hobby_option')}</option>
                  <option value="professional">{t('canvas_pro_option')}</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer mt-2"
              >
                {t('canvas_create_account')}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
