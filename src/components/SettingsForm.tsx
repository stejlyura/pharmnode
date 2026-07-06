"use client";

import React, { useState, useEffect } from 'react';
import { useTranslation } from '../context/I18nContext';
import { signOut } from "next-auth/react";
import { 
  User, 
  Mail, 
  CreditCard, 
  ExternalLink, 
  Loader2, 
  Monitor, 
  Globe, 
  Download, 
  Trash2,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';

interface SettingsFormProps {
  initialUser: {
    name: string;
    email: string;
    tariff: string;
    isSubscribed: boolean;
    billingPortalUrl: string | null;
    renewsAt?: string | null;
  };
}

interface ActiveSession {
  id: string;
  userAgent: string | null;
  ipAddress: string | null;
  lastUsed: string;
  createdAt: string;
}

export const SettingsForm: React.FC<SettingsFormProps> = ({ initialUser }) => {
  const { t, locale } = useTranslation();
  const isRu = locale === "ru-RU";

  // Active Sessions state
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);

  // GDPR state
  const [gdprLoading, setGdprLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  // Fetch active sessions
  const fetchSessions = async () => {
    try {
      const res = await fetch("/api/auth/sessions");
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions || []);
      }
    } catch (err) {
      console.error("Failed to fetch sessions:", err);
    } finally {
      setSessionsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSessions();
  }, []);

  // Revoke session
  const handleRevokeSession = async (id: string) => {
    try {
      const res = await fetch("/api/auth/sessions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: id }),
      });
      if (res.ok) {
        fetchSessions();
      }
    } catch (err) {
      console.error("Failed to revoke session:", err);
    }
  };

  // Revoke all sessions (forces sign out)
  const handleRevokeAllSessions = async () => {
    if (!confirm(isRu ? "Вы действительно хотите выйти со всех других устройств?" : "Are you sure you want to log out from all other devices?")) {
      return;
    }
    try {
      const res = await fetch("/api/auth/sessions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      if (res.ok) {
        signOut();
      }
    } catch (err) {
      console.error("Failed to revoke all sessions:", err);
    }
  };

  // GDPR: Export Data
  const handleExportData = async () => {
    setGdprLoading(true);
    try {
      const res = await fetch("/api/user/export");
      if (res.ok) {
        const data = await res.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `pharmnode-user-data-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("Failed to export GDPR data:", err);
    } finally {
      setGdprLoading(false);
    }
  };

  // GDPR: Delete Account
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== initialUser.email) {
      alert(isRu ? "Введенный email не совпадает" : "Entered email does not match");
      return;
    }

    setGdprLoading(true);
    try {
      const res = await fetch("/api/user/delete", { method: "DELETE" });
      if (res.ok) {
        signOut();
      } else {
        alert("Failed to delete account. Contact support.");
      }
    } catch (err) {
      console.error("Failed to delete account:", err);
    } finally {
      setGdprLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl bg-zinc-900/60 border border-zinc-850 backdrop-blur-md rounded-2xl p-6 md:p-8 flex flex-col gap-8 shadow-xl text-zinc-100 relative overflow-hidden">
      
      {/* Profile Info Section */}
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-bold text-zinc-50 border-b border-zinc-850 pb-3 flex items-center gap-2">
          <User size={18} className="text-indigo-400" />
          {isRu ? 'Настройки профиля' : 'Profile Settings'}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col bg-zinc-950/40 p-4 rounded-xl border border-zinc-900">
            <span className="text-[10px] text-zinc-500 uppercase font-semibold tracking-wider">{isRu ? 'Имя' : 'Name'}</span>
            <span className="text-sm font-semibold text-zinc-200 mt-1">{initialUser.name}</span>
          </div>

          <div className="flex flex-col bg-zinc-950/40 p-4 rounded-xl border border-zinc-900">
            <span className="text-[10px] text-zinc-500 uppercase font-semibold tracking-wider">Email</span>
            <span className="text-sm font-semibold text-zinc-200 mt-1 flex items-center gap-1.5">
              <Mail size={14} className="text-zinc-500" />
              {initialUser.email}
            </span>
          </div>

          <div className="flex flex-col bg-zinc-950/40 p-4 rounded-xl border border-zinc-900 col-span-1 md:col-span-2">
            <span className="text-[10px] text-zinc-500 uppercase font-semibold tracking-wider mb-2">{isRu ? 'Тарифный план' : 'License Plan'}</span>
            <div className="flex justify-between items-center bg-zinc-900/50 p-3 rounded-lg border border-zinc-850">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  initialUser.tariff === 'professional' 
                    ? 'bg-indigo-500/15 border border-indigo-500/30 text-indigo-300' 
                    : 'bg-zinc-800 border border-zinc-700 text-zinc-400'
                }`}>
                  {initialUser.tariff}
                </span>
                {initialUser.isSubscribed && (
                  <span className="flex items-center gap-1 text-xs text-emerald-400 font-semibold">
                    <ShieldCheck size={14} />
                    {isRu ? 'Активен' : 'Active'}
                  </span>
                )}
              </div>
              
              {initialUser.isSubscribed && initialUser.billingPortalUrl && (
                <a
                  href={initialUser.billingPortalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
                >
                  <CreditCard size={13} />
                  {isRu ? 'Управлять подпиской' : 'Manage Billing'}
                  <ExternalLink size={11} />
                </a>
              )}
            </div>

            {/* Display subscription renewal and next payment date */}
            {initialUser.tariff === 'professional' && initialUser.renewsAt && (
              <div className="mt-3 pt-3 border-t border-zinc-850/60 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-zinc-400">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">
                    {isRu ? 'Подписка активна до' : 'Subscription active until'}
                  </span>
                  <span className="text-zinc-200 font-mono">
                    {new Date(initialUser.renewsAt).toLocaleDateString(locale === 'ru-RU' ? 'ru-RU' : 'en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">
                    {isRu ? 'Следующий платёж' : 'Next payment date'}
                  </span>
                  <span className="text-zinc-200 font-mono">
                    {new Date(initialUser.renewsAt).toLocaleDateString(locale === 'ru-RU' ? 'ru-RU' : 'en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>



      {/* Active Sessions */}
      <div className="flex flex-col gap-4 border-t border-zinc-850 pt-6">
        <div className="flex justify-between items-center border-b border-zinc-850/40 pb-2">
          <h2 className="text-lg font-bold text-zinc-50 flex items-center gap-2">
            <Monitor size={18} className="text-indigo-400" />
            {isRu ? 'Активные сессии' : 'Active Sessions'}
          </h2>
          {sessions.length > 1 && (
            <button
              onClick={handleRevokeAllSessions}
              className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/20 text-[10px] text-rose-400 font-bold rounded cursor-pointer transition-colors"
            >
              {isRu ? 'Выйти со всех других устройств' : 'Log out from all other devices'}
            </button>
          )}
        </div>
        <p className="text-xs text-zinc-400 leading-relaxed max-w-xl">
          {isRu 
            ? 'Проверяйте и аннулируйте активные устройства, имеющие доступ к вашему личному кабинету PharmNode.' 
            : 'Review and manage active browser sessions currently signed in to your account.'}
        </p>

        {sessionsLoading ? (
          <div className="flex items-center gap-2 text-xs text-zinc-500 italic py-4">
            <Loader2 className="animate-spin" size={13} />
            <span>{isRu ? 'Загрузка сессий...' : 'Fetching active sessions...'}</span>
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-xs text-zinc-500 italic py-4">{isRu ? 'Нет активных сессий.' : 'No active sessions detected.'}</div>
        ) : (
          <div className="bg-zinc-950/30 border border-zinc-900 rounded-xl overflow-hidden text-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-950 border-b border-zinc-900 text-[9px] text-zinc-550 uppercase font-bold tracking-wider">
                    <th className="p-3">Device / Browser</th>
                    <th className="p-3">IP Address</th>
                    <th className="p-3">Last Active</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {sessions.map((s) => (
                    <tr key={s.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-3 flex items-center gap-2 max-w-[200px] truncate text-zinc-300">
                        <Globe size={13} className="text-zinc-650 shrink-0" />
                        <span title={s.userAgent || "Unknown"}>
                          {s.userAgent 
                            ? (s.userAgent.includes("Chrome") ? "Google Chrome" : s.userAgent.includes("Safari") ? "Safari" : s.userAgent.includes("Firefox") ? "Firefox" : "Web Browser")
                            : "Unknown Client"}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-zinc-400 text-[10.5px]">{s.ipAddress || "N/A"}</td>
                      <td className="p-3 text-zinc-500 font-mono text-[10.5px]">
                        {new Date(s.lastUsed).toLocaleTimeString()} ({new Date(s.lastUsed).toLocaleDateString()})
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleRevokeSession(s.id)}
                          className="px-2 py-0.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-850 hover:border-zinc-800 text-[9px] text-zinc-450 hover:text-rose-400 rounded transition-all cursor-pointer font-semibold"
                        >
                          {isRu ? 'Отозвать' : 'Revoke'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* GDPR Data Portability & Acc Deletion */}
      <div className="flex flex-col gap-4 border-t border-zinc-850 pt-6">
        <h2 className="text-lg font-bold text-zinc-50 flex items-center gap-2">
          <ShieldAlert size={18} className="text-indigo-400" />
          {isRu ? 'Конфиденциальность и GDPR/CCPA' : 'Privacy & Data Protection (GDPR / CCPA)'}
        </h2>
        <p className="text-xs text-zinc-400 leading-relaxed max-w-xl">
          {isRu 
            ? 'Скачайте все сохраненные вами ингредиенты и рецептуры или безвозвратно удалите вашу учетную запись в соответствии с Законом о защите персональных данных.' 
            : 'Download a complete record of your formulations and custom ingredients, or permanently delete your account according to privacy guidelines.'}
        </p>

        <div className="flex flex-wrap gap-4 mt-2">
          <button
            onClick={handleExportData}
            disabled={gdprLoading}
            className="px-4.5 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-200 hover:text-zinc-100 text-xs font-bold rounded-lg cursor-pointer transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            {gdprLoading ? <Loader2 className="animate-spin" size={13} /> : <Download size={13} />}
            {isRu ? 'Экспортировать мои данные' : 'Export My Data'}
          </button>
          
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4.5 py-2.5 bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/20 hover:border-rose-500/30 text-rose-400 hover:text-rose-300 text-xs font-bold rounded-lg cursor-pointer transition-all flex items-center gap-1.5"
          >
            <Trash2 size={13} />
            {isRu ? 'Удалить аккаунт' : 'Permanently Delete Account'}
          </button>
        </div>

        {showDeleteConfirm && (
          <div className="mt-4 p-4 bg-rose-500/5 border border-rose-500/15 rounded-xl flex flex-col gap-3 max-w-md animate-fade-in">
            <span className="text-xs font-bold text-rose-450 uppercase flex items-center gap-1">
              <ShieldAlert size={14} />
              {isRu ? 'Внимание: Безвозвратное действие!' : 'Warning: Irreversible action!'}
            </span>
            <p className="text-[11px] text-zinc-450 leading-relaxed">
              {isRu 
                ? 'Все ваши рецепты, формулы, ингредиенты и подписки будут стерты навсегда. Для подтверждения введите ваш Email ниже:'
                : 'All saved formulation recipe graphs and custom ingredients will be permanently erased. To confirm, enter your registered email address:'}
            </p>
            <input
              type="text"
              placeholder={initialUser.email}
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-950 border border-rose-500/20 focus:border-rose-500 rounded-lg text-xs font-mono focus:outline-none"
            />
            <div className="flex gap-2.5 mt-1.5">
              <button
                onClick={handleDeleteAccount}
                disabled={gdprLoading || deleteConfirmText !== initialUser.email}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-550 text-white font-bold text-[11px] rounded transition-colors disabled:opacity-50 cursor-pointer"
              >
                {gdprLoading ? <Loader2 className="animate-spin" size={12} /> : (isRu ? 'Удалить навсегда' : 'Confirm Delete')}
              </button>
              <button
                onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(""); }}
                className="px-3 py-1.5 bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 text-zinc-450 text-[11px] rounded transition-all cursor-pointer"
              >
                {isRu ? 'Отмена' : 'Cancel'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
