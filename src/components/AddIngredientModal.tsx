"use client";

import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/I18nContext';
import { CHEMICAL_CLASSES } from '../lib/chemicalRules';
import { Ingredient, IngredientRole } from '../types/pharm';
import { useRouter } from 'next/navigation';

interface AddIngredientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddIngredientModal: React.FC<AddIngredientModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { user } = useAuth();
  const { t, locale } = useTranslation();
  const router = useRouter();

  const [addForm, setAddForm] = useState({
    name: '',
    role: 'active' as IngredientRole,
    casNumber: '',
    looseBulkDensity: 0.4,
    tappedBulkDensity: 0.6,
    trueDensity: 1.2,
    costPerKgUsd: 10,
    maxSafePercentage: 100,
    isAllergen: false,
    chemicalClassId: 0,
    source: '',
    dilutionScale: '',
    dosageForm: '',
    applicationArea: '',
    processingTech: '',
    effects: '',
    contraindications: '',
    sideEffects: [] as { name: string; frequency: string; severity: 'low' | 'medium' | 'high' }[],
    moistureContent: 3.0,
    solubility: 'none',
    bitterness: 0,
    overagePercent: 0
  });

  const [addError, setAddError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmitIngredient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.name.trim()) {
      setAddError(t('add_error_empty_name'));
      return;
    }
    if (addForm.looseBulkDensity <= 0 || addForm.tappedBulkDensity <= 0) {
      setAddError(t('add_error_density_positive'));
      return;
    }
    if (addForm.looseBulkDensity > addForm.tappedBulkDensity) {
      setAddError(t('add_error_density_order'));
      return;
    }
    setAddError(null);

    const chemClassId = Number(addForm.chemicalClassId);

    const parsedEffects = addForm.effects
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    const parsedContraindications = addForm.contraindications
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const newIngredient: Omit<Ingredient, 'id'> = {
      name: addForm.name.trim(),
      role: addForm.role,
      casNumber: addForm.casNumber.trim() || undefined,
      looseBulkDensity: Number(addForm.looseBulkDensity),
      tappedBulkDensity: Number(addForm.tappedBulkDensity),
      trueDensity: Number(addForm.trueDensity || addForm.tappedBulkDensity),
      costPerKgUsd: Number(addForm.costPerKgUsd),
      maxSafePercentage: Number(addForm.maxSafePercentage),
      isAllergen: addForm.isAllergen,
      chemicalClassId: chemClassId,
      source: addForm.source.trim() || undefined,
      dilutionScale: addForm.dilutionScale.trim() || undefined,
      dosageForm: addForm.dosageForm.trim() || undefined,
      applicationArea: addForm.applicationArea.trim() || undefined,
      processingTech: addForm.processingTech.trim() || undefined,
      effects: parsedEffects,
      contraindications: parsedContraindications,
      sideEffects: addForm.sideEffects,
      moistureContent: Number(addForm.moistureContent),
      solubility: addForm.solubility === 'none' ? undefined : addForm.solubility,
      bitterness: addForm.role === 'active' ? Number(addForm.bitterness) : undefined,
      overagePercent: Number(addForm.overagePercent)
    };

    try {
      const response = await fetch('/api/ingredients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newIngredient,
          userId: user?.id
        })
      });
      const data = await response.json();
      if (data.success) {
        // For mock users: persist to localStorage so useIngredients hook can read it
        if (user?.id.startsWith('mock-') || data.mock) {
          const finalIng: Ingredient = { ...newIngredient, id: data.ingredient.id };
          const stored = localStorage.getItem(`pharmnode_custom_ingredients_${user?.id}`) ?? '[]';
          const existing: Ingredient[] = JSON.parse(stored);
          localStorage.setItem(
            `pharmnode_custom_ingredients_${user?.id}`,
            JSON.stringify([...existing, finalIng])
          );
        }
        
        onSuccess();
        onClose();
        // Reset form
        setAddForm({
          name: '',
          role: 'active',
          casNumber: '',
          looseBulkDensity: 0.4,
          tappedBulkDensity: 0.6,
          trueDensity: 1.2,
          costPerKgUsd: 10,
          maxSafePercentage: 100,
          isAllergen: false,
          chemicalClassId: 0,
          source: '',
          dilutionScale: '',
          dosageForm: '',
          applicationArea: '',
          processingTech: '',
          effects: '',
          contraindications: '',
          sideEffects: [],
          moistureContent: 3.0,
          solubility: 'none',
          bitterness: 0,
          overagePercent: 0
        });
      } else {
        // Redirect to premium paywall on tariff limit exceeded
        if (data.code === 'TARIFF_LIMIT_REACHED') {
          onClose();
          router.push('/premium-required');
          return;
        }
        setAddError(data.error || t('canvas_save_error'));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('canvas_network_error');
      setAddError(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-zinc-950/90 border border-zinc-900 rounded-2xl shadow-2xl p-6 relative theme-element my-8">
        <button
          onClick={() => {
            onClose();
            setAddError(null);
          }}
          className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-305 transition-colors z-45"
        >
          ✕
        </button>

        <h2 className="text-lg font-bold text-zinc-100 mb-2 uppercase tracking-wide flex items-center gap-2">
          🧪 {t('canvas_new_component')}
        </h2>
        <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
          {t('canvas_new_component_desc')}
        </p>

        {addError && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-xs text-rose-400 flex items-start gap-2">
            <AlertTriangle size={14} className="shrink-0 mt-0.5" />
            <span>{addError}</span>
          </div>
        )}

        <form onSubmit={handleSubmitIngredient} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-1 md:col-span-2">
              <label className="block text-[10px] text-zinc-400 font-semibold mb-1 uppercase tracking-wider">
                {t('add_name_label')} *
              </label>
              <input
                type="text"
                required
                placeholder={locale === 'ru-RU' ? 'Например, Paracetamol Generic' : 'e.g., Paracetamol Generic'}
                value={addForm.name}
                onChange={(e) => setAddForm(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-850 text-zinc-200 placeholder-zinc-650 rounded-lg text-xs focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] text-zinc-400 font-semibold mb-1 uppercase tracking-wider">
                {t('add_role_label')} *
              </label>
              <select
                value={addForm.role}
                onChange={(e) => setAddForm(prev => ({ ...prev, role: e.target.value as IngredientRole }))}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-850 text-zinc-200 rounded-lg text-xs focus:outline-none focus:border-indigo-500 transition-colors bg-zinc-900"
              >
                <option value="active">{t('add_role_active')}</option>
                <option value="filler">{t('add_role_filler')}</option>
                <option value="dry-binder">{t('add_role_dry_binder')}</option>
                <option value="lubricant">{t('add_role_lubricant')}</option>
                <option value="glidant">{t('add_role_glidant')}</option>
                <option value="sweetener">{t('add_role_sweetener')}</option>
                <option value="flavoring">{t('add_role_flavoring')}</option>
                <option value="colorant">{t('add_role_colorant')}</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-zinc-400 font-semibold mb-1 uppercase tracking-wider">
                {t('add_cas_label')}
              </label>
              <input
                type="text"
                placeholder="103-90-2"
                value={addForm.casNumber}
                onChange={(e) => setAddForm(prev => ({ ...prev, casNumber: e.target.value }))}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-850 text-zinc-200 placeholder-zinc-655 rounded-lg text-xs focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] text-zinc-400 font-semibold mb-1 uppercase tracking-wider">
                {t('add_loose_density')} *
              </label>
              <input
                type="number"
                required
                step="0.01"
                min="0.01"
                max="5.0"
                placeholder="0.45"
                value={addForm.looseBulkDensity}
                onChange={(e) => setAddForm(prev => ({ ...prev, looseBulkDensity: parseFloat(e.target.value) || 0.45 }))}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-850 text-zinc-200 font-mono rounded-lg text-xs focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] text-zinc-400 font-semibold mb-1 uppercase tracking-wider">
                {t('add_tapped_density')} *
              </label>
              <input
                type="number"
                required
                step="0.01"
                min="0.01"
                max="5.0"
                placeholder="0.65"
                value={addForm.tappedBulkDensity}
                onChange={(e) => setAddForm(prev => ({ ...prev, tappedBulkDensity: parseFloat(e.target.value) || 0.65 }))}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-850 text-zinc-200 font-mono rounded-lg text-xs focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] text-zinc-400 font-semibold mb-1 uppercase tracking-wider">
                {t('add_true_density')}
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max="5.0"
                placeholder="1.25"
                value={addForm.trueDensity}
                onChange={(e) => setAddForm(prev => ({ ...prev, trueDensity: parseFloat(e.target.value) || 1.25 }))}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-850 text-zinc-200 font-mono rounded-lg text-xs focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] text-zinc-400 font-semibold mb-1 uppercase tracking-wider">
                {t('add_max_safe')} *
              </label>
              <input
                type="number"
                required
                step="0.5"
                min="0.1"
                max="100.0"
                placeholder="100"
                value={addForm.maxSafePercentage}
                onChange={(e) => setAddForm(prev => ({ ...prev, maxSafePercentage: parseFloat(e.target.value) || 100 }))}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-850 text-zinc-200 font-mono rounded-lg text-xs focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] text-zinc-400 font-semibold mb-1 uppercase tracking-wider">
                {t('add_cost_per_kg')} *
              </label>
              <input
                type="number"
                required
                step="0.1"
                min="0.0"
                placeholder="15.0"
                value={addForm.costPerKgUsd}
                onChange={(e) => setAddForm(prev => ({ ...prev, costPerKgUsd: parseFloat(e.target.value) || 15.0 }))}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-850 text-zinc-200 font-mono rounded-lg text-xs focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] text-zinc-400 font-semibold mb-1 uppercase tracking-wider">
                {t('add_compat_group')} *
              </label>
              <select
                value={addForm.chemicalClassId}
                onChange={(e) => setAddForm(prev => ({ ...prev, chemicalClassId: parseInt(e.target.value, 10) || 0 }))}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-850 text-zinc-200 rounded-lg text-xs focus:outline-none focus:border-indigo-500 transition-colors bg-zinc-900"
              >
                {CHEMICAL_CLASSES.map(cls => (
                  <option key={cls.id} value={cls.id}>
                    {t(`chem_class_${cls.id}_cat`)}: {t(`chem_class_${cls.id}_name`)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-zinc-400 font-semibold mb-1 uppercase tracking-wider">
                {t('add_moisture_content')}
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                placeholder="3.0"
                value={addForm.moistureContent}
                onChange={(e) => setAddForm(prev => ({ ...prev, moistureContent: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-850 text-zinc-200 font-mono rounded-lg text-xs focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] text-zinc-400 font-semibold mb-1 uppercase tracking-wider">
                {t('add_overage')}
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="50"
                placeholder="0.0"
                value={addForm.overagePercent}
                onChange={(e) => setAddForm(prev => ({ ...prev, overagePercent: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-850 text-zinc-200 font-mono rounded-lg text-xs focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] text-zinc-400 font-semibold mb-1 uppercase tracking-wider">
                {t('add_solubility')}
              </label>
              <select
                value={addForm.solubility}
                onChange={(e) => setAddForm(prev => ({ ...prev, solubility: e.target.value }))}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-850 text-zinc-200 rounded-lg text-xs focus:outline-none focus:border-indigo-500 transition-colors bg-zinc-900"
              >
                <option value="none">{t('add_solubility_none')}</option>
                <option value="water">{t('add_solubility_water')}</option>
                <option value="lipid">{t('add_solubility_lipid')}</option>
              </select>
            </div>

            {addForm.role === 'active' && (
              <div>
                <label className="block text-[10px] text-zinc-400 font-semibold mb-1 uppercase tracking-wider">
                  {t('add_bitterness')}
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  placeholder="0.0"
                  value={addForm.bitterness}
                  onChange={(e) => setAddForm(prev => ({ ...prev, bitterness: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-850 text-zinc-200 font-mono rounded-lg text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            )}

            <div className="col-span-1 md:col-span-2 flex items-center gap-2 bg-zinc-900/40 border border-zinc-900 p-3 rounded-lg mt-1">
              <input
                type="checkbox"
                id="isAllergen"
                checked={addForm.isAllergen}
                onChange={(e) => setAddForm(prev => ({ ...prev, isAllergen: e.target.checked }))}
                className="accent-indigo-500 cursor-pointer"
              />
              <label htmlFor="isAllergen" className="text-xs text-zinc-300 font-medium cursor-pointer select-none">
                {t('canvas_allergen_label')}
              </label>
            </div>

            <div className="col-span-1 md:col-span-2 border-t border-zinc-900 pt-3 mt-1">
              <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">
                {t('add_homeopathy_section')}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-zinc-400 font-semibold mb-1 uppercase tracking-wider">
                    {t('add_dilution_scale')}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. C30, D10, LM1"
                    value={addForm.dilutionScale}
                    onChange={(e) => setAddForm(prev => ({ ...prev, dilutionScale: e.target.value }))}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-850 text-zinc-200 rounded-lg text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-zinc-400 font-semibold mb-1 uppercase tracking-wider">
                    {t('add_source')}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Apis Mellifica, Arnica"
                    value={addForm.source}
                    onChange={(e) => setAddForm(prev => ({ ...prev, source: e.target.value }))}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-850 text-zinc-200 rounded-lg text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-zinc-400 font-semibold mb-1 uppercase tracking-wider">
                    {t('add_dosage_form')}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Granules, Drops, Trituration"
                    value={addForm.dosageForm}
                    onChange={(e) => setAddForm(prev => ({ ...prev, dosageForm: e.target.value }))}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-850 text-zinc-200 rounded-lg text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-zinc-400 font-semibold mb-1 uppercase tracking-wider">
                    {t('add_application_area')}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Allergy, Cold, Pain"
                    value={addForm.applicationArea}
                    onChange={(e) => setAddForm(prev => ({ ...prev, applicationArea: e.target.value }))}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-850 text-zinc-200 rounded-lg text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-[10px] text-zinc-400 font-semibold mb-1 uppercase tracking-wider">
                    {t('add_processing_tech')}
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Succussion 10 times, Trituration in Lactose"
                    value={addForm.processingTech}
                    onChange={(e) => setAddForm(prev => ({ ...prev, processingTech: e.target.value }))}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-850 text-zinc-200 rounded-lg text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div className="col-span-1 md:col-span-2 border-t border-zinc-900 pt-3 mt-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] text-zinc-400 font-semibold mb-1 uppercase tracking-wider">
                        {t('add_effects_label')}
                      </label>
                      <input
                        type="text"
                        placeholder={t('add_effects_placeholder')}
                        value={addForm.effects}
                        onChange={(e) => setAddForm(prev => ({ ...prev, effects: e.target.value }))}
                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-850 text-zinc-200 rounded-lg text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-400 font-semibold mb-1 uppercase tracking-wider">
                        {t('add_contraindications_label')}
                      </label>
                      <input
                        type="text"
                        placeholder={t('add_contraindications_placeholder')}
                        value={addForm.contraindications}
                        onChange={(e) => setAddForm(prev => ({ ...prev, contraindications: e.target.value }))}
                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-850 text-zinc-200 rounded-lg text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div className="col-span-1 md:col-span-2 border-t border-zinc-900 pt-3 mt-1">
                  <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">
                    {t('add_side_effects_title')}
                  </h4>
                  <div className="flex flex-col gap-2.5">
                    {addForm.sideEffects.map((se, idx) => (
                      <div key={idx} className="flex gap-2 items-center bg-zinc-900/40 p-2 rounded-lg border border-zinc-900">
                        <input
                          type="text"
                          placeholder={t('add_side_effect_name')}
                          value={se.name}
                          onChange={(e) => {
                            const newSE = [...addForm.sideEffects];
                            newSE[idx].name = e.target.value;
                            setAddForm(prev => ({ ...prev, sideEffects: newSE }));
                          }}
                          className="flex-1 px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-200 rounded text-xs focus:outline-none focus:border-indigo-500"
                        />
                        <input
                          type="text"
                          placeholder={t('add_side_effect_freq')}
                          value={se.frequency}
                          onChange={(e) => {
                            const newSE = [...addForm.sideEffects];
                            newSE[idx].frequency = e.target.value;
                            setAddForm(prev => ({ ...prev, sideEffects: newSE }));
                          }}
                          className="w-24 px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-200 rounded text-xs focus:outline-none focus:border-indigo-500"
                        />
                        <select
                          value={se.severity}
                          onChange={(e) => {
                            const newSE = [...addForm.sideEffects];
                            newSE[idx].severity = e.target.value as 'low' | 'medium' | 'high';
                            setAddForm(prev => ({ ...prev, sideEffects: newSE }));
                          }}
                          className="bg-zinc-900 border border-zinc-800 text-zinc-200 rounded text-xs px-2 py-1.5 focus:outline-none"
                        >
                          <option value="low">{t('card_severity_low')}</option>
                          <option value="medium">{t('card_severity_medium')}</option>
                          <option value="high">{t('card_severity_high')}</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => {
                            const newSE = addForm.sideEffects.filter((_, sIdx) => sIdx !== idx);
                            setAddForm(prev => ({ ...prev, sideEffects: newSE }));
                          }}
                          className="px-2 py-1 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 rounded text-[10px] font-bold cursor-pointer"
                        >
                          {t('add_btn_remove_side_effect')}
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setAddForm(prev => ({
                          ...prev,
                          sideEffects: [...prev.sideEffects, { name: '', frequency: '', severity: 'low' }]
                        }));
                      }}
                      className="self-start px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 hover:bg-indigo-500/20 rounded text-xs font-bold cursor-pointer"
                    >
                      {t('add_btn_add_side_effect')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-zinc-200 font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              {t('canvas_cancel')}
            </button>
            <button
              type="submit"
              className="flex-1 py-2 bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              {t('canvas_submit_ingredient')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
