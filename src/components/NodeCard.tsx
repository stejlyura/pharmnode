import React from 'react';
import { EditorNode, CalculatedResults } from '../hooks/useNodeEditor';
import { baseIngredientsMatrix, Ingredient } from '../types/pharm';
import { Trash2, AlertTriangle, DollarSign, Cpu, FileText, Settings, Sparkles, Layers, Minimize2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/I18nContext';
import { generateGMPReport } from '../lib/pdfGenerator';

interface NodeCardProps {
  node: EditorNode;
  nodes?: EditorNode[];
  calculatedResults: CalculatedResults;
  tariff: 'hobby' | 'professional' | 'enterprise';
  onUpdateData: (nodeId: string, data: Partial<EditorNode['data']>) => void;
  onRemove: (nodeId: string) => void;
  onReplaceIngredient?: (oldId: number | string, newId: number | string) => void;
  onUpgradeClick?: () => void;
  isExpanded: boolean;
  onToggleExpand: (expanded: boolean) => void;
  customIngredients?: Ingredient[];
}

export const NodeCard: React.FC<NodeCardProps> = ({
  node,
  nodes,
  calculatedResults,
  tariff,
  onUpdateData,
  onRemove,
  onReplaceIngredient,
  onUpgradeClick,
  isExpanded,
  onToggleExpand,
  customIngredients = []
}) => {
  const { id, type, position, data } = node;
  const { user } = useAuth();
  const { t, setLocale } = useTranslation();
  const [isHovered, setIsHovered] = React.useState(false);

  const allIngredients = React.useMemo(() => {
    return [...baseIngredientsMatrix, ...customIngredients];
  }, [customIngredients]);

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'active': return 'Активное вещество';
      case 'filler': return 'Наполнитель';
      case 'dry-binder': return 'Сухое связующее';
      case 'lubricant': return 'Лубрикант';
      case 'glidant': return 'Скользящее вещ-во';
      default: return role;
    }
  };

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
        return ingredient ? ingredient.name : 'Ингредиент';
      }
      case 'blending':
        return 'Смеситель';
      case 'press':
        return 'Таблетпресс';
      case 'cost-optimizer':
        return 'Экономика';
      case 'output':
        return 'Выход';
      default:
        return 'Нода';
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
              <span className="text-zinc-500 font-sans">Доля:</span>
              <span className="text-zinc-300 font-semibold">{percentage}%</span>
            </div>
            <div className="flex justify-between text-[10px] font-mono">
              <span className="text-zinc-500 font-sans">Цена/кг:</span>
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
            <div className="text-zinc-200 font-bold text-[11px]">Смешивание</div>
            <div className="mt-1.5 flex flex-col gap-1 text-[10px]">
              <div className="flex justify-between">
                <span className="text-zinc-500">Сумма:</span>
                <span className={`font-mono font-semibold ${Math.abs(totalPct - 100) < 0.01 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {totalPct.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Сыпучесть:</span>
                <span className={`font-mono font-bold uppercase ${ratingColor}`}>{flowability.rating}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Насыпная ρ:</span>
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
            <div className="text-zinc-200 font-bold text-[11px]">Параметры пресса</div>
            <div className="mt-1.5 flex flex-col gap-1 text-[10px]">
              <div className="flex justify-between">
                <span className="text-zinc-500">Диаметр:</span>
                <span className="font-mono text-zinc-300">{(diameter * 10).toFixed(0)} мм</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Вес таб. (реком):</span>
                <span className="font-mono text-indigo-400 font-semibold">{recommendedWeightMg.toFixed(1)} мг</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Пористость:</span>
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
            <div className="text-zinc-200 font-bold text-[11px]">Экономика</div>
            <div className="mt-1.5 flex flex-col gap-1 text-[10px]">
              <div className="flex justify-between">
                <span className="text-zinc-500">Цена смеси/кг:</span>
                <span className="font-mono text-emerald-400 font-semibold">${costPerKg.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Себестоимость:</span>
                <span className="font-mono text-emerald-400 font-semibold">${costPerTabletUsd.toFixed(4)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Партия:</span>
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
            <div className="text-zinc-200 font-bold text-[11px]">Спецификация</div>
            <div className="mt-1.5 flex flex-col gap-1 text-[10px]">
              <div className="flex justify-between">
                <span className="text-zinc-500">Стандарт:</span>
                <span className="font-bold text-zinc-300 font-mono">{region}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Кол-во таб.:</span>
                <span className="font-mono text-indigo-400 font-bold">{totalTablets.toLocaleString()} шт.</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Масса партии:</span>
                <span className="font-mono text-zinc-300">{totalBatchWeightKg.toFixed(2)} кг</span>
              </div>
            </div>
          </>
        );
      }
      default:
        return null;
    }
  };

  // Determine if this node has warnings
  const nodeWarnings = React.useMemo(() => {
    if (type === 'ingredient') {
      return calculatedResults.warnings.filter(w => String(w.ingredientId) === String(data.ingredientId));
    }
    if (type === 'blending') {
      return calculatedResults.warnings;
    }
    if (type === 'press') {
      return calculatedResults.warnings.filter(w => w.ingredientId === 4); // Magnesium Stearate limit warnings affect press dissolution
    }
    return [];
  }, [type, data.ingredientId, calculatedResults.warnings]);

  const hasError = nodeWarnings.some(w => w.severity === 'error');
  const hasWarning = nodeWarnings.some(w => w.severity === 'warning');

  // Base styling for node borders based on warnings
  let borderClass = 'border-zinc-800/80 hover:border-zinc-700/80';
  if (hasError) {
    borderClass = 'border-red-500/60 shadow-[0_0_15px_rgba(239,68,68,0.15)]';
  } else if (hasWarning) {
    borderClass = 'border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.15)]';
  }

  // Render node specific contents
  const renderCardContent = () => {
    switch (type) {
      case 'ingredient': {
        const ingredient = allIngredients.find(ing => String(ing.id) === String(data.ingredientId));
        if (!ingredient) return <div className="p-4 text-rose-400">Ингредиент не найден</div>;

        const percentage = data.percentage ?? 0;
        
        // Dynamic styling for role badge
        let roleBadgeColor = 'bg-zinc-800/50 text-zinc-400 border-zinc-700/50';
        if (ingredient.role === 'active') roleBadgeColor = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
        else if (ingredient.role === 'dry-binder') roleBadgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
        else if (ingredient.role === 'lubricant') roleBadgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
        else if (ingredient.role === 'glidant') roleBadgeColor = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';

        return (
          <div className="flex flex-col gap-3 p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-zinc-100 pr-6 text-sm md:text-base leading-tight">
                  {ingredient.name}
                </h3>
                <div className="flex gap-2 items-center mt-1">
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${roleBadgeColor}`}>
                    {ingredient.role}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    CAS: {ingredient.casNumber}
                  </span>
                </div>
              </div>
              <button
                onClick={() => onRemove(id)}
                className="text-zinc-500 hover:text-rose-400 transition-colors p-1 rounded hover:bg-zinc-800/50"
                title="Удалить ингредиент"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="mt-2">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-zinc-400">Процент ввода</span>
                <span className="text-sm font-semibold text-zinc-100 font-mono">
                  {percentage}%
                </span>
              </div>
              <div className="flex gap-2 items-center">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="0.5"
                  value={percentage}
                  onChange={(e) => onUpdateData(id, { percentage: parseFloat(e.target.value) || 0 })}
                  className="flex-1 accent-indigo-500 bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={percentage}
                  onChange={(e) => {
                    let val = parseFloat(e.target.value);
                    if (isNaN(val)) val = 0;
                    if (val < 0) val = 0;
                    if (val > 100) val = 100;
                    onUpdateData(id, { percentage: val });
                  }}
                  className="w-14 bg-zinc-800 border border-zinc-700 text-zinc-100 rounded text-center text-xs font-mono py-1 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-zinc-800/60 text-[11px] text-zinc-500">
              <div>
                <span>Плотность:</span>
                <span className="block font-mono text-zinc-300">
                  {ingredient.looseBulkDensity.toFixed(2)} → {ingredient.tappedBulkDensity.toFixed(2)} g/mL
                </span>
              </div>
              <div>
                <span>Цена / кг:</span>
                <span className="block font-mono text-zinc-300 text-emerald-400">
                  ${ingredient.costPerKgUsd.toFixed(2)}
                </span>
              </div>
            </div>

            {nodeWarnings.map((w, idx) => (
              <div key={idx} className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded text-[11px] text-red-400 flex items-start gap-1.5">
                <AlertTriangle size={12} className="shrink-0 mt-0.5" />
                <span>{w.message}</span>
              </div>
            ))}
          </div>
        );
      }

      case 'blending': {
        const { looseDensity, tappedDensity, flowability } = calculatedResults.blend;
        const totalPct = calculatedResults.totalPercentage;
        
        let ratingColor = 'text-zinc-400';
        let ratingBg = 'bg-zinc-800/50';
        if (flowability.rating === 'Excellent' || flowability.rating === 'Good') {
          ratingColor = 'text-emerald-400 border-emerald-500/20';
          ratingBg = 'bg-emerald-500/5';
        } else if (flowability.rating === 'Fair' || flowability.rating === 'Passable') {
          ratingColor = 'text-amber-400 border-amber-500/20';
          ratingBg = 'bg-amber-500/5';
        } else if (flowability.rating === 'Poor' || flowability.rating === 'Very Poor') {
          ratingColor = 'text-rose-400 border-rose-500/20';
          ratingBg = 'bg-rose-500/5';
        }

        return (
          <div className="flex flex-col gap-3 p-4">
            <h3 className="font-semibold text-zinc-100 text-sm md:text-base flex items-center gap-2 border-b border-zinc-800 pb-2">
              <Cpu size={16} className="text-indigo-400" />
              Смешивание смеси
            </h3>

            {/* Total Percentage Indicator */}
            <div className={`p-2 rounded text-xs border ${
              Math.abs(totalPct - 100) < 0.01 
                ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/10' 
                : 'bg-amber-500/5 text-amber-400 border-amber-500/10'
            }`}>
              <div className="flex justify-between items-center font-semibold">
                <span>Сумма рецептуры:</span>
                <span className="font-mono">{totalPct.toFixed(1)}% / 100%</span>
              </div>
              {Math.abs(totalPct - 100) > 0.01 && (
                <p className="text-[10px] text-amber-500/80 mt-0.5">
                  Суммарная доля ингредиентов должна быть ровно 100%
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 mt-1">
              <div className="bg-zinc-800/30 p-2 rounded border border-zinc-800/40">
                <span className="text-[10px] text-zinc-500 block">Насыпная плотность</span>
                <span className="text-xs font-semibold text-zinc-200 font-mono block mt-0.5">
                  {looseDensity.toFixed(3)} g/mL
                </span>
              </div>
              <div className="bg-zinc-800/30 p-2 rounded border border-zinc-800/40">
                <span className="text-[10px] text-zinc-500 block">Плотность с уплотн.</span>
                <span className="text-xs font-semibold text-zinc-200 font-mono block mt-0.5">
                  {tappedDensity.toFixed(3)} g/mL
                </span>
              </div>
            </div>

            {/* Flowability evaluation */}
            <div className={`p-2.5 rounded border ${ratingBg} ${ratingColor} flex flex-col gap-1`}>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-zinc-400">Сыпучесть смеси:</span>
                <span className="text-xs font-bold uppercase tracking-wider font-mono">
                  {flowability.rating}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px] text-zinc-500 mt-1 border-t border-zinc-800/50 pt-1">
                <span>Хауснер: <span className="font-mono text-zinc-300">{flowability.hausner.toFixed(2)}</span></span>
                <span>Индекс Карра: <span className="font-mono text-zinc-300">{flowability.carr.toFixed(1)}%</span></span>
              </div>
            </div>

            {/* Warnings list with action button */}
            {calculatedResults.warnings.length > 0 && (
              <div className="flex flex-col gap-2 border-t border-zinc-800/50 pt-2">
                <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                  Предупреждения и конфликты ({calculatedResults.warnings.length}):
                </span>
                <div className="max-h-36 overflow-y-auto flex flex-col gap-1.5 pr-1">
                  {calculatedResults.warnings.map((w, idx) => (
                    <div key={idx} className={`p-2 rounded text-[10px] border flex flex-col gap-1.5 ${
                      w.severity === 'error' 
                        ? 'bg-red-500/5 text-red-400 border-red-500/10' 
                        : 'bg-amber-500/5 text-amber-400 border-amber-500/10'
                    }`}>
                      <div className="flex items-start gap-1">
                        <AlertTriangle size={12} className="shrink-0 mt-0.5" />
                        <span>{w.message}</span>
                      </div>
                      {w.suggestion && (
                        <div className="flex flex-col gap-1 bg-black/20 p-1.5 rounded border border-white/5">
                          <span className="text-[9px] text-zinc-400 font-medium">Рекомендация:</span>
                          <span className="text-zinc-300 leading-normal">{w.suggestion}</span>
                          {w.relatedIngredientId && onReplaceIngredient && (
                            <button
                              onClick={() => {
                                // Specific swap logic
                                if (w.message.includes('Майяра')) {
                                  onReplaceIngredient(w.relatedIngredientId!, 3); // Replace Lactose (2) with MCC (3)
                                }
                              }}
                              className="mt-1 self-start px-2 py-0.5 bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 text-[9px] font-semibold rounded border border-indigo-500/30 transition-colors cursor-pointer"
                            >
                              Выполнить замену на MCC PH-102
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      }

      case 'press': {
        const diameter = data.diameterCm ?? 0.3;
        const depth = data.depthCm ?? 0.5;
        const { volume, maxWeightMg, recommendedWeightMg, porosity } = calculatedResults.tableting;

        return (
          <div className="flex flex-col gap-3 p-4">
            <h3 className="font-semibold text-zinc-100 text-sm md:text-base flex items-center gap-2 border-b border-zinc-800 pb-2">
              <Settings size={16} className="text-indigo-400" />
              Пресс-оборудование
            </h3>

            {/* Punch Diameter Slider */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-zinc-400">Диаметр пуансона</span>
                <span className="text-xs font-semibold text-zinc-200 font-mono">
                  {diameter} см ({(diameter * 10).toFixed(0)} мм)
                </span>
              </div>
              <div className="flex gap-2 items-center">
                <input
                  type="range"
                  min="0.1"
                  max="1.5"
                  step="0.05"
                  value={diameter}
                  onChange={(e) => onUpdateData(id, { diameterCm: parseFloat(e.target.value) || 0.3 })}
                  className="flex-1 accent-indigo-500 bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            {/* Fill Depth Slider */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-zinc-400">Глубина матрицы</span>
                <span className="text-xs font-semibold text-zinc-200 font-mono">
                  {depth} см
                </span>
              </div>
              <div className="flex gap-2 items-center">
                <input
                  type="range"
                  min="0.1"
                  max="2.0"
                  step="0.05"
                  value={depth}
                  onChange={(e) => onUpdateData(id, { depthCm: parseFloat(e.target.value) || 0.5 })}
                  className="flex-1 accent-indigo-500 bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-zinc-800/60 text-xs">
              <div className="bg-zinc-800/20 p-2 rounded border border-zinc-800/40">
                <span className="text-[10px] text-zinc-500 block">Объем матрицы</span>
                <span className="font-mono text-zinc-300 font-bold block mt-0.5">
                  {(volume * 1000).toFixed(1)} мм³
                </span>
              </div>
              <div className="bg-zinc-800/20 p-2 rounded border border-zinc-800/40">
                <span className="text-[10px] text-zinc-500 block">Пористость таблетки</span>
                <span className={`font-mono font-bold block mt-0.5 ${
                  porosity > 0.4 ? 'text-amber-400' : 'text-zinc-300'
                }`}>
                  {(porosity * 100).toFixed(2)}%
                </span>
              </div>
              <div className="bg-zinc-800/20 p-2 rounded border border-zinc-800/40">
                <span className="text-[10px] text-zinc-500 block">Масса засыпки (Max)</span>
                <span className="font-mono text-zinc-300 font-bold block mt-0.5">
                  {maxWeightMg.toFixed(2)} мг
                </span>
              </div>
              <div className="bg-zinc-800/20 p-2 rounded border border-zinc-800/40">
                <span className="text-[10px] text-zinc-500 block">Вес таблетки (Реком.)</span>
                <span className="font-mono text-indigo-400 font-bold block mt-0.5">
                  {recommendedWeightMg.toFixed(2)} мг
                </span>
              </div>
            </div>
          </div>
        );
      }

      case 'cost-optimizer': {
        const { costPerKg } = calculatedResults.blend;
        const { costPerTabletUsd, totalBatchCostUsd } = calculatedResults.batch;

        return (
          <div className="flex flex-col gap-3 p-4">
            <h3 className="font-semibold text-zinc-100 text-sm md:text-base flex items-center gap-2 border-b border-zinc-800 pb-2">
              <DollarSign size={16} className="text-emerald-400" />
              Оптимизатор затрат
            </h3>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400">Себестоимость смеси:</span>
                <span className="font-mono text-emerald-400 font-semibold">
                  ${costPerKg.toFixed(2)} / кг
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400">Затраты на таблетку:</span>
                <span className="font-mono text-emerald-400 font-semibold">
                  ${costPerTabletUsd.toFixed(5)}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400">Стоимость партии:</span>
                <span className="font-mono text-emerald-400 font-semibold">
                  ${totalBatchCostUsd.toFixed(2)}
                </span>
              </div>
            </div>

            {/* AI suggestions container */}
            <div className="mt-2 border-t border-zinc-800/50 pt-2 flex flex-col gap-2">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
                ИИ-рекомендации по замене
              </span>

              {tariff === 'hobby' ? (
                <div className="p-3 bg-indigo-500/5 rounded border border-indigo-500/10 flex flex-col gap-2 items-center text-center">
                  <p className="text-[10px] text-zinc-400 leading-normal">
                    ИИ-движок оптимизации себестоимости и рекомендации по замене заблокированы в бесплатном тарифе
                  </p>
                  <button
                    onClick={onUpgradeClick}
                    className="w-full py-1.5 px-3 bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white text-[10px] font-bold rounded shadow transition-all cursor-pointer"
                  >
                    Upgrade to Pro
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  <div className="p-2 bg-emerald-500/5 rounded border border-emerald-500/10 text-[10px] text-zinc-300">
                    <span className="font-bold text-emerald-400 block mb-0.5">Экономия на связующих:</span>
                    Замените Microcrystalline Cellulose PH-102 на дженерик MCC или разбавитель с сохранением насыпной плотности.
                  </div>
                  <div className="p-2 bg-zinc-800/40 rounded border border-zinc-800/50 text-[10px] text-zinc-400">
                    Рекомендаций больше нет. Рецептура экономически оптимальна.
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      }

      case 'output': {
        const activeRawWeightG = data.activeRawWeightG ?? 10;
        const region = String(data.region ?? 'US');
        const { recommendedWeightMg } = calculatedResults.tableting;
        const { totalTablets, totalBatchWeightKg } = calculatedResults.batch;
        
        // Format allergens to match FALCPA Milk (Lactose) labeling
        const formattedAllergens = calculatedResults.allergens.map(name => {
          if (name.includes('Lactose')) return 'Milk (Lactose)';
          return name;
        });

        return (
          <div className="flex flex-col gap-3 p-4">
            <h3 className="font-semibold text-zinc-100 text-sm md:text-base flex items-center gap-2 border-b border-zinc-800 pb-2">
              <FileText size={16} className="text-indigo-400" />
              Готовый продукт / Маркировка
            </h3>

            {/* Region Toggle Standard */}
            <div className="flex items-center justify-between text-[11px] bg-zinc-800/30 p-2 rounded border border-zinc-800/50 text-zinc-100">
              <span className="text-zinc-400 font-medium">Стандарт региона:</span>
              <div className="flex bg-zinc-900 rounded p-0.5 border border-zinc-800">
                <button
                  onClick={() => {
                    onUpdateData(id, { region: 'US' });
                    setLocale('en-US');
                  }}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                    region === 'US' ? 'bg-zinc-800 text-indigo-400 font-semibold' : 'text-zinc-500 hover:text-zinc-400'
                  }`}
                >
                  US (FDA)
                </button>
                <button
                  onClick={() => {
                    onUpdateData(id, { region: 'EU' });
                    setLocale('en-EU');
                  }}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                    region === 'EU' ? 'bg-zinc-800 text-indigo-400 font-semibold' : 'text-zinc-500 hover:text-zinc-400'
                  }`}
                >
                  EU (EFSA)
                </button>
              </div>
            </div>

            {/* Active Raw Material Input */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-zinc-400">Масса активного сырья</span>
                <span className="text-xs font-semibold text-zinc-200 font-mono">
                  {activeRawWeightG} г
                </span>
              </div>
              <div className="flex gap-2">
                <input
                  type="range"
                  min="1"
                  max="100"
                  step="1"
                  value={activeRawWeightG}
                  onChange={(e) => onUpdateData(id, { activeRawWeightG: parseFloat(e.target.value) || 10 })}
                  className="flex-1 accent-indigo-500 bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer self-center"
                />
                <input
                  type="number"
                  min="1"
                  max="5000"
                  value={activeRawWeightG}
                  onChange={(e) => {
                    let val = parseFloat(e.target.value);
                    if (isNaN(val)) val = 1;
                    if (val < 1) val = 1;
                    onUpdateData(id, { activeRawWeightG: val });
                  }}
                  className="w-16 bg-zinc-800 border border-zinc-700 text-zinc-100 rounded text-center text-xs font-mono py-1 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Batch stats details */}
            <div className="flex flex-col gap-1.5 bg-zinc-900/40 p-2.5 rounded border border-zinc-800/50 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-500">Доля активного:</span>
                <span className="font-mono text-zinc-300 font-semibold">
                  {calculatedResults.activePercentage.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Реком. вес таблетки:</span>
                <span className="font-mono text-zinc-300 font-semibold">
                  {recommendedWeightMg.toFixed(2)} мг
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Кол-во таблеток:</span>
                <span className="font-mono text-indigo-400 font-bold">
                  {totalTablets.toLocaleString()} шт.
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Масса всей партии:</span>
                <span className="font-mono text-zinc-300 font-semibold">
                  {totalBatchWeightKg.toFixed(4)} кг
                </span>
              </div>
            </div>

            {/* Regulatory and Safety Warnings related to final product */}
            {calculatedResults.warnings.length > 0 && (
              <div className="flex flex-col gap-1">
                {calculatedResults.warnings.map((w, idx) => (
                  <div key={idx} className="p-2 bg-red-500/5 border border-red-500/10 rounded text-[10px] text-red-400 flex items-start gap-1">
                    <AlertTriangle size={12} className="shrink-0 mt-0.5" />
                    <span>{w.message}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Allergens warning in FALCPA format */}
            {formattedAllergens.length > 0 && (
              <div className="p-2 bg-amber-500/5 border border-amber-500/10 rounded text-[10px] text-amber-400 flex items-start gap-1">
                <AlertTriangle size={12} className="shrink-0 mt-0.5" />
                <span>
                  <strong>Contains:</strong> {formattedAllergens.join(', ')} ({t('allergen_compliance')}).
                </span>
              </div>
            )}

            {/* Dynamic FDA/EFSA Label Design Box */}
            <div className="bg-zinc-900 p-2.5 rounded border border-zinc-800 text-[9px] font-sans flex flex-col gap-1.5">
              <div className="border-b border-zinc-800 pb-1 text-center font-bold text-zinc-300 uppercase tracking-wider text-[10px]">
                {t('supplement_type')}
              </div>
              <div className="flex justify-between font-mono text-zinc-400">
                <span>Serving Size:</span>
                <span>1 Tablet</span>
              </div>
              <div className="border-t border-b border-zinc-800 py-1 flex justify-between font-bold text-zinc-300">
                <span>Active ingredients:</span>
                <span>
                  {recommendedWeightMg > 0 
                    ? (recommendedWeightMg * (calculatedResults.activePercentage / 100)).toFixed(2) 
                    : 0} mg
                </span>
              </div>
              <div className="text-[8px] text-zinc-500 leading-normal italic text-center border-t border-zinc-800/50 pt-1">
                {region === 'US' ? (
                  '* These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease.'
                ) : (
                  '* This food supplement is not a substitute for a varied and balanced diet and a healthy lifestyle.'
                )}
              </div>
            </div>

            {/* Export GMP Report Button */}
            <button
              onClick={() => {
                const hasAccessToPdf = tariff === 'professional' || tariff === 'enterprise';
                if (!hasAccessToPdf) {
                  if (onUpgradeClick) onUpgradeClick();
                } else {
                  generateGMPReport(nodes || [node], calculatedResults, user, region, customIngredients);
                }
              }}
              className={`w-full py-2 px-3 text-xs font-bold rounded shadow transition-all cursor-pointer flex justify-center items-center gap-1.5 ${
                !(tariff === 'professional' || tariff === 'enterprise')
                  ? 'bg-zinc-800 text-zinc-400 hover:text-zinc-300 border border-zinc-700/50'
                  : 'bg-indigo-500 hover:bg-indigo-600 text-white'
              }`}
            >
              Экспорт GMP отчета (PDF)
              {!(tariff === 'professional' || tariff === 'enterprise') && (
                <span className="text-[9px] bg-zinc-700 px-1.5 py-0.5 rounded text-zinc-400 font-semibold uppercase tracking-wider scale-90">
                  Pro
                </span>
              )}
            </button>
          </div>
        );
      }

      default:
        return <div className="p-4 text-zinc-400">Неизвестный тип ноды</div>;
    }
  };

  // Render header border color accent and icons
  const getHeaderIconAndColor = () => {
    switch (type) {
      case 'ingredient': {
        const ingredient = allIngredients.find(ing => String(ing.id) === String(data.ingredientId));
        if (ingredient?.role === 'active') return { accent: 'bg-rose-500', label: 'Активное вещество' };
        return { accent: 'bg-zinc-600', label: 'Вспомогательное вещество' };
      }
      case 'blending':
        return { accent: 'bg-indigo-500', label: 'Смеситель' };
      case 'press':
        return { accent: 'bg-amber-500', label: 'Таблетпресс' };
      case 'cost-optimizer':
        return { accent: 'bg-emerald-500', label: 'Калькулятор экономики' };
      case 'output':
        return { accent: 'bg-violet-500', label: 'Выход / Спецификация' };
      default:
        return { accent: 'bg-zinc-700', label: 'Нода' };
    }
  };

  const { accent, label } = getHeaderIconAndColor();

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
        onClick={() => onToggleExpand(true)}
        data-drag-handle="true"
        data-node-id={id}
        className={`w-[72px] h-[72px] rounded-2xl bg-zinc-900/90 backdrop-blur-md border theme-element shadow-lg hover:shadow-xl transition-all duration-150 flex items-center justify-center cursor-pointer select-none group hover:scale-105 active:scale-95 z-10 hover:z-40 focus-within:z-40 ${borderClass}`}
      >
        {/* Compact Icon */}
        {renderCompactIcon()}

        {/* Floating Text Label Underneath */}
        <div className="absolute top-[78px] left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-bold text-zinc-400 uppercase tracking-wider bg-zinc-950/90 border border-zinc-900 px-2 py-0.5 rounded-md text-center max-w-[120px] truncate shadow-sm pointer-events-none group-hover:text-zinc-200 transition-colors duration-150">
          {renderCompactLabel()}
        </div>

        {/* Hover Tooltip Preview Panel */}
        {isHovered && (
          <div className="absolute bottom-[84px] left-1/2 -translate-x-1/2 w-48 bg-zinc-950/95 backdrop-blur-md border border-zinc-850 p-2.5 rounded-xl shadow-2xl z-50 pointer-events-none flex flex-col gap-1.5 animate-in fade-in slide-in-from-bottom-2 duration-150">
            {renderHoverTooltipContent()}
          </div>
        )}

        {/* Render Node Ports visually */}
        {/* Entry Port (Left) - for non-ingredient nodes */}
        {type !== 'ingredient' && (
          <div
            className="absolute left-[-6px] top-[50%] w-3 h-3 rounded-full bg-zinc-950 border-2 border-zinc-700 shadow-inner flex items-center justify-center"
            title="Входной порт"
            style={{ transform: 'translateY(-50%)' }}
          >
            <div className="w-1 h-1 rounded-full bg-zinc-400" />
          </div>
        )}

        {/* Exit Port (Right) - for non-output nodes */}
        {type !== 'output' && (
          <div
            className="absolute right-[-6px] top-[50%] w-3 h-3 rounded-full bg-zinc-950 border-2 border-zinc-700 shadow-inner flex items-center justify-center"
            title="Выходной порт"
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
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        position: 'absolute',
      }}
      className={`w-[290px] md:w-[320px] rounded-xl bg-zinc-900/90 backdrop-blur-md border theme-element shadow-2xl transition-shadow select-none duration-150 z-20 hover:z-40 focus-within:z-40 ${borderClass}`}
    >
      {/* Top Drag Handle Bar */}
      <div
        className="h-3 flex items-center justify-center cursor-grab active:cursor-grabbing hover:bg-white/5 rounded-t-xl transition-colors duration-150"
        title="Перетащить ноду"
        data-drag-handle="true"
        data-node-id={id}
      >
        <div className="w-10 h-1 bg-zinc-700/60 rounded-full" />
      </div>

      {/* Node label pill indicator with collapse action */}
      <div className="px-4 pt-1 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${accent}`} />
          <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">
            {label}
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand(false);
          }}
          className="text-zinc-500 hover:text-zinc-300 transition-colors p-1 rounded hover:bg-zinc-800/50 cursor-pointer"
          title="Свернуть ноду"
        >
          <Minimize2 size={12} />
        </button>
      </div>

      {/* Node Card Core Content */}
      {renderCardContent()}

      {/* Render Node Ports visually */}
      {/* Entry Port (Left) - for non-ingredient nodes */}
      {type !== 'ingredient' && (
        <div
          className="absolute left-[-6px] top-[50%] w-3 h-3 rounded-full bg-zinc-950 border-2 border-zinc-700 shadow-inner flex items-center justify-center"
          title="Входной порт"
          style={{ transform: 'translateY(-50%)' }}
        >
          <div className="w-1 h-1 rounded-full bg-zinc-400" />
        </div>
      )}

      {/* Exit Port (Right) - for non-output nodes */}
      {type !== 'output' && (
        <div
          className="absolute right-[-6px] top-[50%] w-3 h-3 rounded-full bg-zinc-950 border-2 border-zinc-700 shadow-inner flex items-center justify-center"
          title="Выходной порт"
          style={{ transform: 'translateY(-50%)' }}
        >
          <div className="w-1 h-1 rounded-full bg-zinc-400 hover:bg-indigo-400 transition-colors" />
        </div>
      )}
    </div>
  );
};
