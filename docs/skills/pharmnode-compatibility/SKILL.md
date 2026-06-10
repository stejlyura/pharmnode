---
name: pharmnode-compatibility
description: |
  Guides work with the chemical compatibility matrix and expert rule system in PharmNode.
  Use when writing or modifying: chemicalRules.ts, COMPATIBILITY_RULES, CHEMICAL_CLASSES,
  checkCompatibilityAndLimits, CompatibilityMatrix component, or adding new chemical rules.
  Also triggers when user mentions: "совместимость", "химический класс", "конфликт", "матрица", "несовместимость", "reaction Maillard".
---

# PharmNode Compatibility Matrix Skill

## Архитектура экспертной системы

PharmNode — **детерминированная** экспертная система. Никакого ИИ, никаких нейросетей.
Вся логика совместимости — в [`src/lib/chemicalRules.ts`](../../../src/lib/chemicalRules.ts).

```text
Ингредиент A + Ингредиент B
          ↓
  chemicalClassId A + chemicalClassId B
          ↓
  Поиск в COMPATIBILITY_RULES
          ↓
  CompatibilityRule: { type, severity, title, message, suggestion }
```

## 35 химических классов (`CHEMICAL_CLASSES`)

Каждый ингредиент принадлежит одному химическому классу.

| ID | Класс | Пример |
| -- | ----- | ------ |
| 1 | Первичные/вторичные амины | Амлодипин |
| 6 | Органические кислоты | Витамин C |
| 9 | Стеараты | Стеарат магния |
| 13 | Фосфаты кальция | Дикальция фосфат |
| 14 | Восстанавливающие сахара | Лактоза |
| 23 | Жирорастворимые витамины | Витамин E |

## Структура правила совместимости

```typescript
interface CompatibilityRule {
  classA: number;                          // ID химического класса A
  classB: number;                          // ID химического класса B
  type: 'incompatible' | 'synergy';       // тип взаимодействия
  severity: 'error' | 'warning';          // критичность
  title: string;                           // название конфликта (кратко)
  message: string;                         // описание химической реакции
  suggestion: string;                      // рекомендация по замене
}
```

## Ключевые конфликты (уже реализованы)

```typescript
// Реакция Майяра: Амин + Восстанавливающий сахар
{ classA: 1, classB: 14, type: 'incompatible', severity: 'error',
  title: 'Maillard Reaction Risk',
  message: 'Primary amine group reacts with reducing sugar under moisture, causing browning and API degradation.',
  suggestion: 'Replace lactose with MCC PH-102 or mannitol (non-reducing excipients).' }

// Щелочная деградация: Амин + Стеарат
{ classA: 1, classB: 9, type: 'incompatible', severity: 'error',
  title: 'Alkaline Hydrolysis Risk',
  message: 'Magnesium stearate creates alkaline microenvironment, accelerating amine hydrolysis.',
  suggestion: 'Reduce stearate concentration or use sodium stearyl fumarate instead.' }

// Окисление: Органическая кислота + Фосфат кальция
{ classA: 6, classB: 13, type: 'incompatible', severity: 'error',
  title: 'Oxidative Degradation',
  message: 'Calcium ions catalyze oxidation of ascorbic acid.',
  suggestion: 'Separate API and calcium phosphate or use DCPA-free formulation.' }
```

## Правила добавления новых правил

1. **Только через `chemicalRules.ts`** — никогда в компонентах или API
2. Проверь что класс уже существует в `CHEMICAL_CLASSES` — если нет, добавь его
3. Правило двустороннее: `classA ↔ classB` — порядок не важен, движок проверяет оба
4. `severity: 'error'` — критично, блокирует; `'warning'` — предупреждение, допускается
5. Всегда добавляй конкретный `suggestion` с альтернативой

## Как работает `checkCompatibilityAndLimits`

```typescript
// В calculator.ts
function checkCompatibilityAndLimits(
  ingredients: { ingredient: Ingredient, percentage: number }[]
): CompatibilityWarning[] {
  const warnings: CompatibilityWarning[] = [];

  // 1. Проверка химических несовместимостей (попарно по chemicalClassId)
  for (let i = 0; i < ingredients.length; i++) {
    for (let j = i + 1; j < ingredients.length; j++) {
      const rule = findRule(ingredients[i].ingredient.chemicalClassId,
                             ingredients[j].ingredient.chemicalClassId);
      if (rule?.type === 'incompatible') {
        warnings.push({ type: 'chemical', severity: rule.severity, ... });
      }
    }
  }

  // 2. Проверка технологических лимитов (maxSafePercentage)
  for (const { ingredient, percentage } of ingredients) {
    if (percentage > ingredient.maxSafePercentage) {
      warnings.push({ type: 'limit', severity: 'warning', ... });
    }
  }

  return warnings;
}
```

## Тарифные ограничения (проверять в Route Handlers!)

```typescript
// ❌ НЕЛЬЗЯ проверять тариф в UI
if (user.tariff === 'hobby' && ingredients.length > 3) { /* ... */ }

// ✅ НАДО: в /api/ingredients/route.ts или /api/recipes/route.ts
const TARIFF_LIMITS = { hobby: 3, professional: 15, enterprise: Infinity };
```

## Ссылки на документацию

- База знаний: [`docs/architecture/knowledge-base.md`](../../knowledge-base.md)
- Типы: [`src/types/pharm.ts`](../../../src/types/pharm.ts)
- Калькулятор: [`src/lib/calculator.ts`](../../../src/lib/calculator.ts)
