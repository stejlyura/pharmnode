"use client";

import React, { useState } from "react";
import { useTranslation } from "../context/I18nContext";
import { 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  AlertTriangle, 
  X, 
  Activity, 
  ShieldAlert, 
  Settings2,
  CheckCircle2
} from "lucide-react";

interface WizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (ingredients: Array<{ id: number | string; name: string; role: string; percentage: number }>, dosageForm: string) => void;
}

export const WizardModal: React.FC<WizardModalProps> = ({
  isOpen,
  onClose,
  onGenerate
}) => {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Form State
  const [goals, setGoals] = useState<string[]>([]);
  const [limitations, setLimitations] = useState<string[]>([]);
  const [dosageForm, setDosageForm] = useState("tablets");

  if (!isOpen) return null;

  // Indications / Goals List
  const GOALS = [
    { key: "pain", label: t("wizard_goal_pain"), icon: "🩹" },
    { key: "fever", label: t("wizard_goal_fever"), icon: "🤒" },
    { key: "inflam", label: t("wizard_goal_inflam"), icon: "🔥" },
    { key: "imm", label: t("wizard_goal_imm"), icon: "🛡️" },
    { key: "energy", label: t("wizard_goal_energy"), icon: "⚡" },
    { key: "antiox", label: t("wizard_goal_antiox"), icon: "🍇" },
    { key: "stim", label: t("wizard_goal_stim"), icon: "☕" },
    { key: "focus", label: t("wizard_goal_focus"), icon: "🎯" },
    { key: "bone", label: t("wizard_goal_bone"), icon: "🦴" }
  ];

  // Dietary Preferences & Warnings
  const DIETARY = [
    { key: "sugar-free", label: t("wizard_diet_sugar_free"), desc: "Exclude lactose/sucrose bases" },
    { key: "lactose-free", label: t("wizard_diet_lactose_free"), desc: "Exclude standard lactose fillers" },
    { key: "allergen-free", label: t("wizard_diet_allergen_free"), desc: "Exclude components marked as allergens" },
    { key: "pregnancy-safe", label: t("wizard_diet_pregnancy_safe"), desc: "Exclude pregnancy-contraindicated APIs" }
  ];

  // Medical Conditions
  const CONDITIONS = [
    { key: "гипертония", label: t("wizard_cond_hypertension") },
    { key: "язва желудка", label: t("wizard_cond_ulcer") },
    { key: "почечная недостаточность", label: t("wizard_cond_kidney") },
    { key: "печеночная недостаточность", label: t("wizard_cond_liver") },
    { key: "бессонница", label: t("wizard_cond_insomnia") },
    { key: "аритмия", label: t("wizard_cond_arrhythmia") },
    { key: "гипероксалурия", label: t("wizard_cond_hyperoxaluria") },
    { key: "тромбофлебит", label: t("wizard_cond_thrombophlebitis") },
    { key: "гиперкальциемия", label: t("wizard_cond_hypercalcemia") },
    { key: "аспириновая астма", label: t("wizard_cond_asthma") }
  ];

  const toggleGoal = (key: string) => {
    setGoals(prev => 
      prev.includes(key) ? prev.filter(g => g !== key) : [...prev, key]
    );
  };

  const toggleLimitation = (key: string) => {
    setLimitations(prev =>
      prev.includes(key) ? prev.filter(l => l !== key) : [...prev, key]
    );
  };

  const handleNext = () => {
    if (step === 1 && goals.length === 0) {
      setError(t("wizard_no_actives_found"));
      return;
    }
    setError(null);
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setError(null);
    setStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goals, limitations, dosageForm })
      });
      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }
      if (!data.ingredients || data.ingredients.length === 0) {
        throw new Error(t("wizard_no_actives_found"));
      }

      onGenerate(data.ingredients, data.dosageForm);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to generate formulation";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-zinc-950/90 border border-zinc-900 rounded-3xl shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden theme-element">
        {/* Glow Effects */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="p-6 border-b border-zinc-900 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="text-white animate-pulse" size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-100 uppercase tracking-wider">
                {t("wizard_title")}
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5 leading-normal">
                {t("wizard_desc")}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-500 hover:text-zinc-350 bg-zinc-900/40 hover:bg-zinc-900 border border-zinc-900 rounded-xl transition-all cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-6 py-4 bg-zinc-900/20 border-b border-zinc-900 flex items-center justify-between text-xs font-semibold text-zinc-400 select-none">
          <div className="flex items-center gap-6">
            <span className={`pb-1 border-b-2 transition-all ${step === 1 ? "border-indigo-500 text-zinc-200" : "border-transparent"}`}>
              1. {t("wizard_step_1")}
            </span>
            <span className={`pb-1 border-b-2 transition-all ${step === 2 ? "border-indigo-500 text-zinc-200" : "border-transparent"}`}>
              2. {t("wizard_step_2")}
            </span>
            <span className={`pb-1 border-b-2 transition-all ${step === 3 ? "border-indigo-500 text-zinc-200" : "border-transparent"}`}>
              3. {t("wizard_step_3")}
            </span>
          </div>
          <span className="text-[10px] text-zinc-500 tracking-widest font-mono">
            {step} / 3
          </span>
        </div>

        {/* Step Content Container */}
        <div className="flex-1 overflow-y-auto p-6 min-h-[300px]">
          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-xs text-rose-400 flex items-start gap-3 animate-fade-in">
              <AlertTriangle className="shrink-0 mt-0.5" size={16} />
              <div>
                <span className="font-bold block mb-1">Configuration Error</span>
                <p className="leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          {/* STEP 1: GOALS */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-zinc-300 mb-1">
                  {t("wizard_step_1")}
                </h3>
                <p className="text-xs text-zinc-500 leading-normal">
                  {t("wizard_step_1_desc")}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {GOALS.map(item => {
                  const isSelected = goals.includes(item.key);
                  return (
                    <button
                      key={item.key}
                      onClick={() => toggleGoal(item.key)}
                      className={`p-4 rounded-2xl text-left border transition-all flex flex-col gap-3 group cursor-pointer relative overflow-hidden ${
                        isSelected 
                          ? "bg-indigo-500/5 border-indigo-500/50 shadow-lg shadow-indigo-500/5" 
                          : "bg-zinc-900/30 border-zinc-900 hover:border-zinc-800 hover:bg-zinc-900/50"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-2xl">{item.icon}</span>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                          isSelected ? "bg-indigo-500 border-indigo-500 text-white" : "border-zinc-800 text-transparent"
                        }`}>
                          <Check size={12} strokeWidth={3} />
                        </div>
                      </div>
                      <span className={`text-xs font-bold transition-colors ${
                        isSelected ? "text-zinc-200" : "text-zinc-400 group-hover:text-zinc-300"
                      }`}>
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: RESTRICTIONS */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-zinc-300 mb-1">
                  {t("wizard_step_2")}
                </h3>
                <p className="text-xs text-zinc-500 leading-normal">
                  {t("wizard_step_2_desc")}
                </p>
              </div>

              {/* Dietary switches */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {DIETARY.map(item => {
                  const isSelected = limitations.includes(item.key);
                  return (
                    <div
                      key={item.key}
                      onClick={() => toggleLimitation(item.key)}
                      className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all select-none ${
                        isSelected 
                          ? "bg-purple-500/5 border-purple-500/50" 
                          : "bg-zinc-900/30 border-zinc-900 hover:border-zinc-850"
                      }`}
                    >
                      <div>
                        <span className="text-xs font-bold text-zinc-300 block">
                          {item.label}
                        </span>
                        <span className="text-[10px] text-zinc-500 block mt-0.5">
                          {item.desc}
                        </span>
                      </div>
                      <div className={`w-8 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out ${
                        isSelected ? "bg-purple-500" : "bg-zinc-800"
                      }`}>
                        <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${
                          isSelected ? "translate-x-3" : "translate-x-0"
                        }`} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Medical conditions list */}
              <div className="border-t border-zinc-900 pt-6">
                <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <ShieldAlert size={14} className="text-zinc-500" />
                  {t("card_contraindications_label")}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {CONDITIONS.map(item => {
                    const isSelected = limitations.includes(item.key);
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => toggleLimitation(item.key)}
                        className={`px-4 py-3 rounded-xl border text-left flex items-center gap-3 transition-colors duration-200 cursor-pointer ${
                          isSelected 
                            ? "bg-zinc-900 border-zinc-800 text-zinc-200 shadow-inner" 
                            : "bg-zinc-950 border-zinc-900/60 text-zinc-450 hover:text-zinc-300 hover:border-zinc-800"
                        }`}
                      >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                          isSelected ? "bg-indigo-500 border-indigo-500 text-white" : "border-zinc-850 text-transparent"
                        }`}>
                          <Check size={10} strokeWidth={3} />
                        </div>
                        <span className="text-xs font-medium">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: DOSAGE FORM */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-zinc-300 mb-1">
                  {t("wizard_step_3")}
                </h3>
                <p className="text-xs text-zinc-500 leading-normal">
                  {t("wizard_step_3_desc")}
                </p>
              </div>

              <div className="flex flex-col gap-4">
                {[
                  { key: "tablets", label: t("wizard_form_tablets"), desc: t("wizard_form_tablets_desc"), icon: "⚪" },
                  { key: "capsules", label: t("wizard_form_capsules"), desc: t("wizard_form_capsules_desc"), icon: "💊" },
                  { key: "syrup", label: t("wizard_form_syrup"), desc: t("wizard_form_syrup_desc"), icon: "🧪" }
                ].map(item => {
                  const isSelected = dosageForm === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => setDosageForm(item.key)}
                      className={`p-5 rounded-2xl border text-left transition-all flex gap-4 items-center cursor-pointer group ${
                        isSelected 
                          ? "bg-indigo-500/5 border-indigo-500/50 shadow-md" 
                          : "bg-zinc-900/30 border-zinc-900 hover:border-zinc-850 hover:bg-zinc-900/50"
                      }`}
                    >
                      <span className="text-3xl filter saturate-75 group-hover:scale-105 transition-transform">
                        {item.icon}
                      </span>
                      <div className="flex-1">
                        <span className={`text-sm font-bold block transition-colors ${
                          isSelected ? "text-zinc-200" : "text-zinc-400 group-hover:text-zinc-300"
                        }`}>
                          {item.label}
                        </span>
                        <span className="text-xs text-zinc-500 block mt-1 leading-normal">
                          {item.desc}
                        </span>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? "border-indigo-500 text-indigo-500" : "border-zinc-800 text-transparent"
                      }`}>
                        {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Warn user about canvas replacement */}
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-xs text-amber-400 flex gap-3 mt-8">
                <AlertTriangle className="shrink-0 mt-0.5" size={16} />
                <p className="leading-relaxed">
                  {t("wizard_overwrite_warning")}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-6 border-t border-zinc-900 bg-zinc-950 flex gap-4 items-center z-10">
          {step > 1 ? (
            <button
              onClick={handleBack}
              disabled={loading}
              className="px-5 py-3 border border-zinc-850 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 font-bold rounded-2xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={14} />
              {t("wizard_btn_back")}
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-5 py-3 border border-zinc-900 hover:bg-zinc-900 text-zinc-500 hover:text-zinc-350 font-bold rounded-2xl text-xs transition-colors cursor-pointer"
            >
              {t("wizard_btn_cancel")}
            </button>
          )}

          <div className="flex-1" />

          {step < 3 ? (
            <button
              onClick={handleNext}
              className="px-5 py-3 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 hover:text-zinc-100 border border-zinc-850 font-bold rounded-2xl text-xs flex items-center gap-1.5 transition-all cursor-pointer hover:shadow-lg"
            >
              {t("wizard_btn_next")}
              <ChevronRight size={14} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-tr from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold rounded-2xl text-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed shadow-xl shadow-indigo-500/10 hover:shadow-indigo-500/20"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={15} />
                  <span>{t("wizard_btn_generate")}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
