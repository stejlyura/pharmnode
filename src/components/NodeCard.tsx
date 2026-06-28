"use client";

import React from 'react';
import { EditorNode, CalculatedResults } from '../hooks/useNodeEditor';
import { Ingredient } from '../types/pharm';
import { Cpu, DollarSign, FileText, Layers, Minimize2, Settings, Sparkles } from 'lucide-react';
import { useTranslation } from '../context/I18nContext';

import { IngredientNode } from './IngredientNode';
import { BlendingNode } from './BlendingNode';
import { PressNode } from './PressNode';
import { CostOptimizerNode } from './CostOptimizerNode';
import { OutputNode } from './OutputNode';

interface NodeCardProps {
  node: EditorNode;
  nodes?: EditorNode[];
  calculatedResults: CalculatedResults;
  tariff: 'hobby' | 'professional';
  onUpdateData: (nodeId: string, data: Partial<EditorNode['data']>) => void;
  onRemove: (nodeId: string) => void;
  onReplaceIngredient?: (oldId: number | string, newId: number | string) => void;
  onUpgradeClick?: () => void;
  isExpanded?: boolean;
  onToggleExpand?: (expanded: boolean) => void;
  /** All available ingredients (standard + custom), already merged by parent */
  allIngredients: Ingredient[];
  isMobile?: boolean;
}

export const NodeCard = React.memo<NodeCardProps>(({
  node,
  nodes,
  calculatedResults,
  tariff,
  onUpdateData,
  onRemove,
  onReplaceIngredient,
  onUpgradeClick,
  isExpanded = true,
  onToggleExpand,
  allIngredients,
  isMobile = false,
}) => {
  const { id, type, position, data } = node;
  const { t } = useTranslation();
  const [isHovered, setIsHovered] = React.useState(false);

  const renderCompactIcon = () => {
    switch (type) {
      case 'ingredient': {
        const ingredient = allIngredients.find(ing => String(ing.id) === String(data.ingredientId));
        if (ingredient?.role === 'active') {
          return <Sparkles className="w-7 h-7 text-rose-400 group-hover:scale-110 transition-transform duration-200" />;
        }
        return <Layers className="w-7 h-7 text-blue-400 group-hover:scale-110 transition-transform duration-200" />;
      }
      case 'blending':
        return <Cpu className="w-7 h-7 text-indigo-400 animate-pulse" />;
      case 'press':
        return <Settings className="w-7 h-7 text-amber-400 group-hover:rotate-45 transition-transform duration-500" />;
      case 'cost-optimizer':
        return <DollarSign className="w-7 h-7 text-emerald-400" />;
      case 'output':
        return <FileText className="w-7 h-7 text-violet-400" />;
      default:
        return <Settings className="w-7 h-7 text-zinc-400" />;
    }
  };

  const renderCompactLabel = () => {
    switch (type) {
      case 'ingredient': {
        const ingredient = allIngredients.find(ing => String(ing.id) === String(data.ingredientId));
        return ingredient ? ingredient.name : t('node_ingredient');
      }
      case 'blending':
        return t('node_blender');
      case 'press':
        return t('node_tablet_press');
      case 'cost-optimizer':
        return t('node_cost');
      case 'output':
        return t('node_output');
      default:
        return t('node_generic');
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'active': return t('role_active_singular');
      case 'filler': return t('role_filler_singular');
      case 'dry-binder': return t('role_dry_binder_singular');
      case 'lubricant': return t('role_lubricant_singular');
      case 'glidant': return t('role_glidant_singular');
      default: return role;
    }
  };

  const renderHoverTooltipContent = () => {
    switch (type) {
      case 'ingredient': {
        const ingredient = allIngredients.find(ing => String(ing.id) === String(data.ingredientId));
        if (!ingredient) return null;
        const percentage = data.percentage ?? 0;
        return (
          <>
            <div className="text-zinc-200 font-bold text-[11px] truncate">{ingredient.name}</div>
            <div className="text-[9px] text-zinc-500 uppercase tracking-wide">{getRoleLabel(ingredient.role)}</div>
            <div className="mt-1.5 border-t border-zinc-800/60 pt-1.5 flex justify-between text-[10px] font-mono">
              <span className="text-zinc-500 font-sans">{t('tooltip_share')}</span>
              <span className="text-zinc-300 font-semibold">{percentage}%</span>
            </div>
            <div className="flex justify-between text-[10px] font-mono">
              <span className="text-zinc-500 font-sans">{t('tooltip_price_kg')}</span>
              <span className="text-emerald-400 font-semibold">${ingredient.costPerKgUsd.toFixed(1)}</span>
            </div>
          </>
        );
      }
      case 'blending': {
        const { looseDensity, tappedDensity, flowability } = calculatedResults.blend;
        const totalPct = calculatedResults.totalPercentage;
        
        let ratingColor = 'text-zinc-400';
        if (flowability.rating === 'Excellent' || flowability.rating === 'Good') ratingColor = 'text-emerald-400';
        else if (flowability.rating === 'Fair' || flowability.rating === 'Passable') ratingColor = 'text-amber-400';
        else if (flowability.rating === 'Poor' || flowability.rating === 'Very Poor') ratingColor = 'text-rose-400';

        return (
          <>
            <div className="text-zinc-200 font-bold text-[11px]">{t('tooltip_blending')}</div>
            <div className="mt-1.5 flex flex-col gap-1 text-[10px]">
              <div className="flex justify-between">
                <span className="text-zinc-500">{t('tooltip_total')}</span>
                <span className={`font-mono font-semibold ${Math.abs(totalPct - 100) < 0.01 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {totalPct.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">{t('tooltip_flowability')}</span>
                <span className={`font-mono font-bold uppercase ${ratingColor}`}>{flowability.rating}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">{t('tooltip_bulk_density')}</span>
                <span className="font-mono text-zinc-300">{looseDensity.toFixed(2)} g/mL</span>
              </div>
            </div>
          </>
        );
      }
      case 'press': {
        const diameter = data.diameterCm ?? 0.3;
        const depth = data.depthCm ?? 0.5;
        const { recommendedWeightMg, porosity } = calculatedResults.tableting;
        return (
          <>
            <div className="text-zinc-200 font-bold text-[11px]">{t('tooltip_press_params')}</div>
            <div className="mt-1.5 flex flex-col gap-1 text-[10px]">
              <div className="flex justify-between">
                <span className="text-zinc-500">{t('tooltip_diameter')}</span>
                <span className="font-mono text-zinc-300">{(diameter * 10).toFixed(0)} {t('unit_mm')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-550">{t('tooltip_tab_weight_rec')}</span>
                <span className="font-mono text-indigo-400 font-semibold">{recommendedWeightMg.toFixed(1)} {t('unit_mg')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">{t('tooltip_porosity')}</span>
                <span className="font-mono text-zinc-300">{(porosity * 100).toFixed(1)}%</span>
              </div>
            </div>
          </>
        );
      }
      case 'cost-optimizer': {
        const { costPerKg } = calculatedResults.blend;
        const { costPerTabletUsd, totalBatchCostUsd } = calculatedResults.batch;
        return (
          <>
            <div className="text-zinc-200 font-bold text-[11px]">{t('node_cost')}</div>
            <div className="mt-1.5 flex flex-col gap-1 text-[10px]">
              <div className="flex justify-between">
                <span className="text-zinc-550">{t('tooltip_blend_cost_kg')}</span>
                <span className="font-mono text-emerald-400 font-semibold">${costPerKg.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-550">{t('tooltip_cost_per_tab')}</span>
                <span className="font-mono text-emerald-400 font-semibold">${costPerTabletUsd.toFixed(4)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-550">{t('tooltip_batch')}</span>
                <span className="font-mono text-emerald-400 font-semibold">${totalBatchCostUsd.toFixed(1)}</span>
              </div>
            </div>
          </>
        );
      }
      case 'output': {
        const { totalTablets, totalBatchWeightKg } = calculatedResults.batch;
        const region = String(data.region ?? 'US');
        return (
          <>
            <div className="text-zinc-200 font-bold text-[11px]">{t('tooltip_specification')}</div>
            <div className="mt-1.5 flex flex-col gap-1 text-[10px]">
              <div className="flex justify-between">
                <span className="text-zinc-550">{t('tooltip_standard')}</span>
                <span className="font-bold text-zinc-300 font-mono">{region}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-550">{t('tooltip_tablets')}</span>
                <span className="font-mono text-indigo-400 font-bold">{totalTablets.toLocaleString()} {t('unit_pcs')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-550">{t('tooltip_batch_weight')}</span>
                <span className="font-mono text-zinc-300">{totalBatchWeightKg.toFixed(2)} {t('unit_kg')}</span>
              </div>
            </div>
          </>
        );
      }
      default:
        return null;
    }
  };

  const nodeWarnings = React.useMemo(() => {
    if (type === 'ingredient') {
      return calculatedResults.warnings.filter(w => String(w.ingredientId) === String(data.ingredientId));
    }
    if (type === 'blending') {
      return calculatedResults.warnings;
    }
    if (type === 'press') {
      return calculatedResults.warnings.filter(w => w.ingredientId === 4);
    }
    return [];
  }, [type, data.ingredientId, calculatedResults.warnings]);

  const hasError = nodeWarnings.some(w => w.severity === 'error');
  const hasWarning = nodeWarnings.some(w => w.severity === 'warning');

  let borderClass = isMobile 
    ? 'border-zinc-800 bg-zinc-900/90' 
    : 'border-zinc-800/80 hover:border-zinc-700/80';
    
  if (hasError) {
    borderClass = isMobile
      ? 'border-red-500/60 bg-red-950/5 shadow-[0_0_15px_rgba(239,68,68,0.1)]'
      : 'border-red-500/60 shadow-[0_0_15px_rgba(239,68,68,0.15)]';
  } else if (hasWarning) {
    borderClass = isMobile
      ? 'border-amber-500/60 bg-amber-955/5 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
      : 'border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.15)]';
  }

  const renderCardContent = () => {
    switch (type) {
      case 'ingredient':
        return (
          <IngredientNode
            id={id}
            data={data}
            allIngredients={allIngredients}
            onUpdateData={onUpdateData}
            onRemove={onRemove}
            nodeWarnings={nodeWarnings}
            isMobile={isMobile}
          />
        );
      case 'blending':
        return (
          <BlendingNode
            calculatedResults={calculatedResults}
            onReplaceIngredient={onReplaceIngredient}
            isMobile={isMobile}
          />
        );
      case 'press':
        return (
          <PressNode
            id={id}
            data={data}
            calculatedResults={calculatedResults}
            onUpdateData={onUpdateData}
            isMobile={isMobile}
          />
        );
      case 'cost-optimizer':
        return (
          <CostOptimizerNode
            calculatedResults={calculatedResults}
            tariff={tariff}
            onUpgradeClick={onUpgradeClick}
            isMobile={isMobile}
          />
        );
      case 'output':
        return (
          <OutputNode
            node={node}
            nodes={nodes}
            calculatedResults={calculatedResults}
            tariff={tariff}
            onUpdateData={onUpdateData}
            onUpgradeClick={onUpgradeClick}
            allIngredients={allIngredients}
            isMobile={isMobile}
          />
        );
      default:
        return <div className="p-4 text-zinc-400">{t('card_unknown_node')}</div>;
    }
  };

  const getHeaderIconAndColor = () => {
    switch (type) {
      case 'ingredient': {
        const ingredient = allIngredients.find(ing => String(ing.id) === String(data.ingredientId));
        if (ingredient?.role === 'active') return { accent: 'bg-rose-500', label: t('card_active_substance') };
        return { accent: 'bg-zinc-600', label: t('card_excipient') };
      }
      case 'blending':
        return { accent: 'bg-indigo-500', label: t('card_blender_label') };
      case 'press':
        return { accent: 'bg-amber-500', label: t('card_press_label') };
      case 'cost-optimizer':
        return { accent: 'bg-emerald-500', label: t('card_cost_label') };
      case 'output':
        return { accent: 'bg-violet-500', label: t('card_output_label') };
      default:
        return { accent: 'bg-zinc-700', label: t('node_generic') };
    }
  };

  const { accent, label } = getHeaderIconAndColor();

  if (isMobile) {
    return (
      <div className={`w-full rounded-2xl border p-4 flex flex-col gap-3 shadow-xl transition-all theme-element ${borderClass}`}>
        {renderCardContent()}
      </div>
    );
  }

  if (!isExpanded) {
    return (
      <div
        id={`node-card-${id}`}
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          position: 'absolute',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => onToggleExpand && onToggleExpand(true)}
        data-drag-handle="true"
        data-node-id={id}
        className={`w-[72px] h-[72px] rounded-2xl bg-zinc-900/90 backdrop-blur-md border theme-element shadow-lg hover:shadow-xl transition-all duration-150 flex items-center justify-center cursor-pointer select-none group hover:scale-105 active:scale-95 z-10 hover:z-40 focus-within:z-40 ${borderClass}`}
      >
        {renderCompactIcon()}

        <div className="absolute top-[78px] left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-bold text-zinc-400 uppercase tracking-wider bg-zinc-950/90 border border-zinc-900 px-2 py-0.5 rounded-md text-center max-w-[120px] truncate shadow-sm pointer-events-none group-hover:text-zinc-200 transition-colors duration-150">
          {renderCompactLabel()}
        </div>

        {isHovered && (
          <div className="absolute bottom-[84px] left-1/2 -translate-x-1/2 w-48 bg-zinc-950/95 backdrop-blur-md border border-zinc-850 p-2.5 rounded-xl shadow-2xl z-50 pointer-events-none flex flex-col gap-1.5 animate-in fade-in slide-in-from-bottom-2 duration-150">
            {renderHoverTooltipContent()}
          </div>
        )}

        {type !== 'ingredient' && (
          <div
            className="absolute left-[-6px] top-[50%] w-3 h-3 rounded-full bg-zinc-950 border-2 border-zinc-700 shadow-inner flex items-center justify-center"
            title={t('port_input') || 'Input Port'}
            style={{ transform: 'translateY(-50%)' }}
          >
            <div className="w-1 h-1 rounded-full bg-zinc-400" />
          </div>
        )}

        {type !== 'output' && (
          <div
            className="absolute right-[-6px] top-[50%] w-3 h-3 rounded-full bg-zinc-950 border-2 border-zinc-700 shadow-inner flex items-center justify-center"
            title={t('port_output') || 'Output Port'}
            style={{ transform: 'translateY(-50%)' }}
          >
            <div className="w-1 h-1 rounded-full bg-zinc-400 hover:bg-indigo-400 transition-colors" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      id={`node-card-${id}`}
      data-node-type={type}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        position: 'absolute',
      }}
      className={`w-[290px] md:w-[320px] rounded-xl bg-zinc-900/90 backdrop-blur-md border theme-element shadow-2xl transition-shadow select-none duration-150 z-20 hover:z-40 focus-within:z-40 ${borderClass}`}
    >
      <div
        className="h-3 flex items-center justify-center cursor-grab active:cursor-grabbing hover:bg-white/5 rounded-t-xl transition-colors duration-150"
        title={t('card_drag_node')}
        data-drag-handle="true"
        data-node-id={id}
      >
        <div className="w-10 h-1 bg-zinc-700/60 rounded-full" />
      </div>

      <div className="px-4 pt-1 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${accent}`} />
          <span className="text-[10px] text-zinc-550 font-semibold uppercase tracking-wider">
            {label}
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onToggleExpand) {
              onToggleExpand(false);
            }
          }}
          className="text-zinc-550 hover:text-zinc-300 transition-colors p-1 rounded hover:bg-zinc-800/50 cursor-pointer"
          title={t('card_collapse_node')}
        >
          <Minimize2 size={12} />
        </button>
      </div>

      {renderCardContent()}

      {type !== 'ingredient' && (
        <div
          className="absolute left-[-6px] top-[50%] w-3 h-3 rounded-full bg-zinc-950 border-2 border-zinc-700 shadow-inner flex items-center justify-center"
          title={t('port_input') || 'Input Port'}
          style={{ transform: 'translateY(-50%)' }}
        >
          <div className="w-1 h-1 rounded-full bg-zinc-400" />
        </div>
      )}

      {type !== 'output' && (
        <div
          className="absolute right-[-6px] top-[50%] w-3 h-3 rounded-full bg-zinc-950 border-2 border-zinc-700 shadow-inner flex items-center justify-center"
          title={t('port_output') || 'Output Port'}
          style={{ transform: 'translateY(-50%)' }}
        >
          <div className="w-1 h-1 rounded-full bg-zinc-400 hover:bg-indigo-400 transition-colors" />
        </div>
      )}
    </div>
  );
});

NodeCard.displayName = 'NodeCard';
