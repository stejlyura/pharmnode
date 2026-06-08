"use client";

import React, { useState } from "react";
import { baseIngredientsMatrix, Ingredient } from "../types/pharm";
import { CHEMICAL_CLASSES, getCompatibilityRule } from "../lib/chemicalRules";
import { X, Check, AlertTriangle, Info, HelpCircle } from "lucide-react";

interface CompatibilityMatrixProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CompatibilityMatrix: React.FC<CompatibilityMatrixProps> = ({ isOpen, onClose }) => {
  const [selectedCell, setSelectedCell] = useState<{
    ing1: Ingredient;
    ing2: Ingredient;
  } | null>(null);

  if (!isOpen) return null;

  // Shorten names for table headers to keep it readable
  const getShortName = (name: string) => {
    if (name.includes("Amlodipine")) return "Amlodipine";
    if (name.includes("Lactose")) return "Lactose";
    if (name.includes("Microcrystalline")) return "MCC PH-102";
    if (name.includes("Magnesium")) return "Mg Stearate";
    if (name.includes("Aerosil")) return "Aerosil 200";
    if (name.includes("Paracetamol")) return "Paracetamol";
    if (name.includes("Ibuprofen")) return "Ibuprofen";
    if (name.includes("Ascorbic")) return "Vitamin C";
    if (name.includes("Mannitol")) return "Mannitol";
    if (name.includes("Dicalcium")) return "Ca Phosphate";
    if (name.includes("Croscarmellose")) return "Croscarmellose";
    if (name.includes("Stearic")) return "Stearic Acid";
    if (name.includes("Talc")) return "Talc";
    if (name.includes("Aspirin")) return "Aspirin";
    if (name.includes("Caffeine")) return "Caffeine";
    if (name.includes("Metformin")) return "Metformin";
    if (name.includes("Vitamin D3")) return "Vitamin D3";
    if (name.includes("Calcium Carbonate")) return "Ca Carbonate";
    if (name.includes("Sorbitol")) return "Sorbitol";
    if (name.includes("Sucrose")) return "Sucrose";
    if (name.includes("Povidone")) return "PVP K30";
    if (name.includes("Hydroxypropyl")) return "HPMC";
    if (name.includes("Pregelatinized")) return "Pregel. Starch";
    if (name.includes("Sodium Starch")) return "SSG";
    if (name.includes("Sodium Stearyl")) return "Pruv (SSF)";
    if (name.includes("Macrogol")) return "PEG 6000";
    return name;
  };

  const getChemicalClassName = (classId: number) => {
    const cls = CHEMICAL_CLASSES.find(c => c.id === classId);
    return cls ? cls.name : `Класс ${classId}`;
  };

  const getCompatibilityDetails = (ing1: Ingredient, ing2: Ingredient) => {
    if (ing1.id === ing2.id) {
      return {
        status: "same",
        title: "Тот же ингредиент",
        desc: "Компонент полностью совместим сам с собой.",
        colorClass: "bg-zinc-800 text-zinc-400"
      };
    }

    const rule = getCompatibilityRule(ing1.chemicalClassId, ing2.chemicalClassId);

    if (rule && rule.type === 'incompatible') {
      let desc = rule.message.replace(/{nameA}/g, ing1.name).replace(/{nameB}/g, ing2.name);
      return {
        status: "incompatible",
        title: rule.title,
        desc: desc,
        colorClass: "bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30 cursor-pointer"
      };
    }

    // Synergy Check based on roles
    if ((ing1.role === "glidant" && ing2.role === "lubricant") || (ing1.role === "lubricant" && ing2.role === "glidant")) {
      return {
        status: "synergy",
        title: "Высокая совместимость (Синергия)",
        desc: "Технологический синергизм: совместное использование скользящего вещества и лубриканта снижает межчастичное трение смеси и адгезию к пуансонам пресса.",
        colorClass: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 cursor-pointer"
      };
    } else if ((ing1.role === "dry-binder" && ing2.role === "filler") || (ing1.role === "filler" && ing2.role === "dry-binder")) {
      return {
        status: "synergy",
        title: "Высокая совместимость (Синергия)",
        desc: "Структурный синергизм: комбинация пластически деформируемого сухого связующего с хрупко разрушаемым наполнителем создает прочный каркас таблетки.",
        colorClass: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 cursor-pointer"
      };
    }

    return {
      status: "compatible",
      title: "Совместимы",
      desc: "Химические конфликты не обнаружены. Вещества стабильны при совместном хранении в сухом виде при комнатной температуре.",
      colorClass: "bg-zinc-900/60 text-zinc-300 border border-zinc-800/80 hover:bg-zinc-800 hover:border-zinc-700 cursor-pointer"
    };
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all duration-300">
      <div className="bg-zinc-950 border border-zinc-850 rounded-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl theme-element animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-900 bg-zinc-900/30">
          <div>
            <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
              Матрица химической совместимости веществ
            </h2>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Справочная сетка перекрестных взаимодействий фармацевтических ингредиентов
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
          
          {/* Left Panel: The Interactive Grid Table */}
          <div className="flex-1 overflow-auto p-6 border-b lg:border-b-0 lg:border-r border-zinc-900 max-h-[50vh] lg:max-h-none">
            <div className="min-w-[760px]">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    {/* Corner Header cell */}
                    <th className="p-2 text-[10px] font-bold text-zinc-600 text-left border border-zinc-900 w-32 sticky left-0 bg-zinc-950 z-10">
                      Ингредиент
                    </th>
                    {baseIngredientsMatrix.map((ing) => (
                      <th
                        key={ing.id}
                        className="p-2 text-[9px] font-bold text-zinc-400 text-center border border-zinc-900 w-16 select-none"
                        title={ing.name}
                      >
                        <div className="writing-mode-vertical rotate-180 inline-block h-20 leading-none py-1 truncate text-ellipsis max-w-[80px]" style={{ writingMode: 'vertical-lr' }}>
                          {getShortName(ing.name)}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {baseIngredientsMatrix.map((ingRow) => (
                    <tr key={ingRow.id} className="hover:bg-zinc-900/10">
                      {/* Row Header */}
                      <td className="p-2 text-[10px] font-bold text-zinc-300 border border-zinc-900 sticky left-0 bg-zinc-950 z-10 truncate max-w-[130px]" title={ingRow.name}>
                        {getShortName(ingRow.name)}
                      </td>
                      
                      {/* Cells */}
                      {baseIngredientsMatrix.map((ingCol) => {
                        const cellInfo = getCompatibilityDetails(ingRow, ingCol);
                        const isSelected = selectedCell && 
                                           ((selectedCell.ing1.id === ingRow.id && selectedCell.ing2.id === ingCol.id) ||
                                            (selectedCell.ing1.id === ingCol.id && selectedCell.ing2.id === ingRow.id));

                        return (
                          <td
                            key={ingCol.id}
                            onClick={() => setSelectedCell({ ing1: ingRow, ing2: ingCol })}
                            className={`p-0 border border-zinc-900 aspect-square text-center select-none theme-element ${cellInfo.colorClass} ${
                              isSelected ? "ring-2 ring-indigo-500 ring-inset" : ""
                            }`}
                          >
                            <div className="h-10 w-10 flex items-center justify-center mx-auto text-xs font-bold font-mono">
                              {cellInfo.status === "incompatible" && <X size={14} className="text-rose-500 shrink-0" />}
                              {cellInfo.status === "synergy" && <Check size={14} className="text-emerald-400 shrink-0" />}
                              {cellInfo.status === "compatible" && <span className="text-[10px] text-zinc-600 font-normal">•</span>}
                              {cellInfo.status === "same" && <span className="text-[9px] text-zinc-700 font-bold">\</span>}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Panel: Explanations & Properties details */}
          <div className="w-full lg:w-80 bg-zinc-900/10 p-6 flex flex-col gap-4 overflow-y-auto shrink-0 select-none">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
              <Info size={14} className="text-indigo-400" />
              Детали взаимодействия
            </h3>

            {selectedCell ? (
              <div className="flex flex-col gap-4">
                {/* Selected components info */}
                <div className="flex flex-col gap-2 p-3 bg-zinc-900/40 border border-zinc-850 rounded-xl">
                  <div>
                    <span className="text-[9px] text-zinc-500 block uppercase font-mono font-bold leading-none mb-1">Компонент A</span>
                    <span className="text-xs font-semibold text-zinc-200 block truncate">{selectedCell.ing1.name}</span>
                    <span className="text-[9px] text-zinc-400 font-mono block">Класс: {getChemicalClassName(selectedCell.ing1.chemicalClassId)}</span>
                  </div>
                  <div className="h-px bg-zinc-850/60 my-1" />
                  <div>
                    <span className="text-[9px] text-zinc-500 block uppercase font-mono font-bold leading-none mb-1">Компонент B</span>
                    <span className="text-xs font-semibold text-zinc-200 block truncate">{selectedCell.ing2.name}</span>
                    <span className="text-[9px] text-zinc-400 font-mono block">Класс: {getChemicalClassName(selectedCell.ing2.chemicalClassId)}</span>
                  </div>
                </div>

                {/* Status Box */}
                {(() => {
                  const details = getCompatibilityDetails(selectedCell.ing1, selectedCell.ing2);
                  return (
                    <div className="flex flex-col gap-2">
                      <div className={`p-3 rounded-xl flex items-center gap-2 font-bold text-xs ${
                        details.status === "incompatible" 
                          ? "bg-rose-500/10 border border-rose-500/20 text-rose-400" 
                          : details.status === "synergy"
                          ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                          : details.status === "same"
                          ? "bg-zinc-800 text-zinc-400 border border-zinc-700/50"
                          : "bg-zinc-900 border border-zinc-800 text-zinc-300"
                      }`}>
                        {details.status === "incompatible" && <AlertTriangle size={15} />}
                        {details.status === "synergy" && <Check size={15} />}
                        <span>{details.title}</span>
                      </div>

                      <div className="text-xs text-zinc-400 leading-relaxed bg-zinc-900/20 border border-zinc-900/60 p-3 rounded-xl font-sans font-light">
                        {details.desc}
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-12 text-center border border-dashed border-zinc-850 rounded-xl bg-zinc-900/10">
                <HelpCircle size={32} className="text-zinc-650 mb-3 animate-pulse" />
                <span className="text-xs text-zinc-500 font-semibold px-4">
                  Нажмите на любую ячейку в матрице для вывода подробного химического описания.
                </span>
              </div>
            )}

            {/* Legend guide */}
            <div className="mt-auto pt-4 border-t border-zinc-900 flex flex-col gap-2.5 text-[10px]">
              <span className="text-zinc-500 uppercase tracking-wider font-bold text-[9px]">Легенда обозначений:</span>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-emerald-500/20 border border-emerald-500/30 rounded flex items-center justify-center"><Check size={11} className="text-emerald-400" /></div>
                <span className="text-zinc-400">Синергизм (улучшение свойств)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-rose-500/20 border border-rose-500/30 rounded flex items-center justify-center"><X size={11} className="text-rose-400" /></div>
                <span className="text-zinc-400">Химический конфликт (несовместимо)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-zinc-900/60 border border-zinc-800/80 rounded flex items-center justify-center"><span className="text-[10px] text-zinc-600">•</span></div>
                <span className="text-zinc-400">Нейтральная совместимость</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
