"use client";

import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { useTranslation } from "../context/I18nContext";
import { useAuth } from "../context/AuthContext";
import { sendFeedback } from "../actions/feedback";

export const FeedbackWidget: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  const [isOpen, setIsOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState("general");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const cardRef = useRef<HTMLDivElement>(null);

  // Pre-populate user email when authenticated user is available
  useEffect(() => {
    if (user?.email) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEmail(user.email);
    }
  }, [user]);

  // Close form on clicking outside the card wrapper
  useEffect(() => {
    if (!isOpen) return;
    
    const handleClickOutside = (e: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setStatus("submitting");
    setErrorMessage(null);

    try {
      const result = await sendFeedback({
        type: feedbackType,
        message: message.trim(),
        email: email.trim() || undefined,
        path: typeof window !== "undefined" ? window.location.pathname : undefined,
        userAgent: typeof window !== "undefined" ? window.navigator.userAgent : undefined,
      });

      if (result.success) {
        setStatus("success");
        setMessage("");
        // Reset success state and close modal after 3 seconds
        setTimeout(() => {
          setStatus("idle");
          setIsOpen(false);
        }, 3000);
      } else {
        setStatus("error");
        setErrorMessage(result.error || t("feedback_error"));
      }
    } catch (err) {
      console.error("Failed to submit feedback:", err);
      setStatus("error");
      setErrorMessage(t("feedback_error"));
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Floating Action Button (FAB) */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (status === "success") setStatus("idle");
        }}
        className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-indigo-500 hover:bg-indigo-600 text-white flex items-center justify-center shadow-lg transition-all hover:scale-105 active:scale-95 duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-black"
        title={t("feedback_button")}
        aria-label={t("feedback_button")}
      >
        {isOpen ? <X className="w-5 h-5 md:w-6 md:h-6" /> : <MessageSquare className="w-5 h-5 md:w-6 md:h-6" />}
      </button>

      {/* Feedback Card Popup */}
      {isOpen && (
        <div
          ref={cardRef}
          className="absolute bottom-16 right-0 w-80 md:w-96 max-w-[calc(100vw-2rem)] bg-zinc-900/95 backdrop-blur-md border border-zinc-800 rounded-xl shadow-2xl p-5 flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-5 duration-200"
        >
          {/* Header */}
          <div className="flex justify-between items-center border-b border-zinc-850 pb-2.5">
            <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-400" />
              {t("feedback_title")}
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {status === "success" ? (
            /* Success State */
            <div className="flex flex-col items-center justify-center py-6 text-center gap-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 animate-bounce" />
              <p className="text-sm text-zinc-200 font-medium">
                {t("feedback_success")}
              </p>
            </div>
          ) : (
            /* Form Fields */
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              {status === "error" && errorMessage && (
                <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 text-red-400 p-2.5 rounded-lg text-xs">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Feedback Type Selector */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                  {t("feedback_type_label")}
                </label>
                <select
                  value={feedbackType}
                  onChange={(e) => setFeedbackType(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-lg text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  <option value="bug">{t("feedback_type_bug")}</option>
                  <option value="feature">{t("feedback_type_feature")}</option>
                  <option value="general">{t("feedback_type_general")}</option>
                </select>
              </div>

              {/* Email Address Input */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                  {t("feedback_email_label")}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("feedback_email_placeholder")}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-lg text-xs placeholder-zinc-650 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Message Details Input */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                  {t("feedback_message_label")} *
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t("feedback_message_placeholder")}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-lg text-xs placeholder-zinc-650 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                />
              </div>

              {/* Submit Action */}
              <button
                type="submit"
                disabled={status === "submitting" || !message.trim()}
                className="w-full flex items-center justify-center gap-2 mt-2 py-2 px-4 bg-indigo-500 hover:bg-indigo-600 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg transition-all duration-150 cursor-pointer"
              >
                {status === "submitting" ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{t("feedback_submit")}...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>{t("feedback_submit")}</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
