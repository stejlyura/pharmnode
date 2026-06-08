"use client";

import React, { useState, useEffect } from 'react';
import { ShieldAlert, Check } from 'lucide-react';

export const Disclaimer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    // Read local storage to see if disclaimer was already accepted
    const accepted = localStorage.getItem('pharmnode_dss_accepted');
    if (accepted !== 'true') {
      requestAnimationFrame(() => {
        setIsOpen(true);
      });
    }
  }, []);

  const handleAccept = () => {
    if (isChecked) {
      localStorage.setItem('pharmnode_dss_accepted', 'true');
      setIsOpen(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 relative flex flex-col gap-4 overflow-hidden">
        
        {/* Top gradient border */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-500 via-amber-500 to-indigo-600" />
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-400 shrink-0">
            <ShieldAlert size={20} />
          </div>
          <div>
            <h2 className="font-bold text-zinc-100 text-base">
              Decision Support System (DSS) Agreement
            </h2>
            <span className="text-[10px] text-red-400 font-semibold uppercase tracking-wider">
              Mandatory Regulatory Notice
            </span>
          </div>
        </div>

        <div className="text-xs text-zinc-300 flex flex-col gap-3 leading-relaxed max-h-72 overflow-y-auto pr-1 mt-1 border-t border-b border-zinc-800/80 py-3">
          <p className="font-bold text-zinc-100 text-xs">
            Attention: PharmNode is a Decision Support System (DSS) only.
          </p>
          <p>
            All mathematical calculations, physical predictions (Hausner ratio, Carr compressibility index, powder flowability classifications), and chemical compatibility reports generated on this canvas are predictive and for informational/research purposes.
          </p>
          <p className="bg-red-500/5 p-2 rounded border border-red-500/10 text-[11px] text-zinc-300 font-medium">
            <strong>Required Laboratory Validation:</strong> All formulations require mandatory lab-scale experimental validation (using FTIR, DSC, HPLC, and USP/EP dissolution testing) prior to industrial scale-up, commercial compounding, or clinical use.
          </p>
          <p>
            By using this software, you confirm that you assume all risks associated with manufacturing, product stability, active substance degradation, and regulatory compliance under your local jurisdiction (e.g., US Title 21 CFR or EU Food Supplements Directive).
          </p>
          <p className="text-zinc-400 text-[11px]">
            PharmNode developers and partners accept no liability for damages, spoiled raw batches, machine downtime, or adverse healthcare incidents resulting from computational formulations.
          </p>
        </div>

        <div className="flex flex-col gap-3 mt-1">
          {/* Checkbox agreement */}
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-indigo-500 accent-indigo-500 bg-zinc-800 border-zinc-700 rounded focus:ring-indigo-500"
            />
            <span className="text-[11px] text-zinc-400 select-none leading-normal">
              I accept the Terms of Use and acknowledge that PharmNode calculations require mandatory laboratory validation prior to any scale-up or production.
            </span>
          </label>

          {/* Confirm Button */}
          <button
            onClick={handleAccept}
            disabled={!isChecked}
            className={`w-full py-2.5 px-4 text-xs font-bold rounded-lg shadow-lg flex items-center justify-center gap-1.5 transition-all ${
              isChecked
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-indigo-500/10 cursor-pointer'
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-800'
            }`}
          >
            <Check size={14} />
            Acknowledge & Confirm
          </button>
        </div>
      </div>
    </div>
  );
};
