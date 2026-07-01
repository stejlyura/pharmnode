# PharmNode — База знаний и матрицы совместимости

## Концепция: Экспертная система без ИИ

PharmNode построен как **экспертная система (Expert System)** / система поддержки принятия решений (DSS) — без нейронных сетей.

```text
Входные данные → База знаний → Правила → Скоринг → Результат
```

**Почему без ИИ:**
- 100% объяснимость каждого решения
- Аудит и валидация каждого шага
- Нет галлюцинаций
- Нет GPU, нет обучения моделей
- Упрощённое прохождение регуляторных проверок (FDA, GMP)

---

## Структура базы знаний

### 1. Таблица ингредиентов

Каждый ингредиент хранится один раз.

| Поле | Описание |
| --- | --- |
| `id` | Уникальный идентификатор |
| `name` | Название |
| `casNumber` | CAS-номер для интеграции с химическими БД |
| `role` | Роль: `active`, `filler`, `lubricant`, `glidant`, `dry-binder` |
| `chemicalClassId` | ID химического класса (для матрицы) |
| `looseBulkDensity` | Насыпная плотность без уплотнения (g/mL) |
| `tappedBulkDensity` | Насыпная плотность после уплотнения (g/mL) |
| `benefit` | Польза (0–100) |
| `risk` | Риск (0–100) |
| `cost` | Стоимость за кг (USD) |
| `stability` | Стабильность (0–100) |
| `manufacturability` | Простота производства (0–100) |
| `maxSafePercentage` | Максимальный % ввода в смесь |

**Пример:**

| ID | Name | Benefit | Risk |
| -- | ---- | ------- | ---- |
| 1 | Vitamin C | 85 | 10 |
| 2 | Zinc | 80 | 15 |

---

### 2. 35 химических классов (`chemicalClassId`)

Определены в `src/lib/chemicalRules.ts`:

| Класс | Описание |
| --- | --- |
| 1 | Первичные и вторичные амины (напр. Амлодипин) |
| 6 | Органические кислоты (напр. Витамин C) |
| 9 | Стеараты (напр. Стеарат магния) |
| 13 | Фосфаты кальция |
| 14 | Восстанавливающие сахара (напр. Лактоза) |
| 23 | Жирорастворимые витамины |
| … | (всего 35 классов) |

---

### 3. Матрица совместимости (`COMPATIBILITY_RULES`)

Определяет **возможность** совместного применения.

**Шкала:**

| Значение | Интерпретация |
| --- | --- |
| 100 | Полностью совместимы |
| 75 | Хорошо совместимы |
| 50 | Нейтрально |
| 25 | Нежелательно |
| 0 | Запрещено |

**Структура правила (`CompatibilityRule`):**
```typescript
{
  classA: number,      // ID химического класса A
  classB: number,      // ID химического класса B
  type: 'incompatible' | 'synergy',
  severity: 'error' | 'warning',
  title: string,       // Название конфликта
  message: string,     // Описание реакции
  suggestion: string   // Рекомендация технологу
}
```

**Ключевые конфликты:**
- **Реакция Майяра**: Класс 1 (амины) + Класс 14 (лактоза) → `error`
- **Щелочная деградация**: Класс 1 + Класс 9 (стеарат) → `error`
- **Окисление кислот**: Класс 6 (Витамин C) + Класс 13 (фосфат Ca) → `error`

---

### 4. Матрица синергии

Показывает **усиление эффектов** — отвечает на вопрос: *«Есть ли смысл смешивать?»*

| Ingredient A | Ingredient B | Synergy |
| --- | --- | --- |
| Vitamin C | Zinc | +30 |
| Zinc | Magnesium | +10 |

**Технологические синергии:**
- Лубрикант + Скользящее вещество (Стеарат Mg + Aerosil 200)
- Сухое связующее + Наполнитель (МКЦ + Лактоза)

---

### 5. Матрица эффектов

| Ingredient | Immunity | Energy | Sleep | Stress |
| --- | --- | --- | --- | --- |
| Vitamin C | 90 | 20 | 0 | 0 |
| Magnesium | 20 | 30 | 80 | 70 |

---

### 6. Матрица противопоказаний

| Ingredient | Pregnancy | Hypertension | Diabetes |
| --- | --- | --- | --- |
| A | Forbidden | Allowed | Warning |
| B | Allowed | Forbidden | Allowed |

---

## Скоринговая формула

```text
score =
  benefit * 0.4 +
  stability * 0.2 +
  manufacturability * 0.2 -
  risk * 0.2
```

---

## Граф знаний

```text
Ingredient
    ↓
Properties (плотности, размер частиц)
    ↓
Effects (иммунитет, энергия, сон)
    ↓
Risks (побочные эффекты, противопоказания)
    ↓
Compatibility (химические конфликты)
    ↓
Synergy (усиление эффектов)
```

---

## Масштаб системы

| Этап | Ингредиенты | Свойства | Связи |
| --- | --- | --- | --- |
| MVP | 100–300 | 20–50 | 1000–5000 |
| Коммерческая версия | 5000–10000 | 100–300 | 100 000+ |

---

## 7. Stability Profile (`IngredientStability`)

Связь **1:1** с `Ingredient`. Хранит физико-химические свойства, определяющие условия хранения и выбор технологического процесса.

| Поле | Тип | Описание |
| --- | --- | --- |
| `ph` | `Float?` | pH в 10% растворе (напр. 3.0 для Витамина C) |
| `hygroscopicity` | `Int` (0–100) | Степень гигроскопичности; 100 = максимальная |
| `lightSensitive` | `Boolean` | Разрушается под воздействием света |
| `heatDegradation` | `Float?` | Температура начала деградации (°C) |

**Примеры значений:**

| Ингредиент | pH | Hygro | Light | Heat °C |
| --- | --- | --- | --- | --- |
| Ascorbic Acid (Vitamin C) | 3.0 | 15 | ✅ | 190 |
| Lactose Monohydrate | 5.0 | 10 | ❌ | — |
| Magnesium Stearate | 8.5 | 5 | ❌ | — |
| Povidone K30 (PVP) | 4.0 | 75 | ❌ | — |
| Vitamin D3 | — | 10 | ✅ | 84 |

**Бизнес-правила (используются в `validateProcessCompatibility`):**
- `hygroscopicity > 70` + `wet_granulation` → предупреждение о возможной деградации
- `heatDegradation < 60°C` + `wet_granulation` → предупреждение о термодеградации при сушке
- `hygroscopicity > 80` + `dry_granulation`/`roller_compaction` → рекомендация работы при RH < 40%

---

## 8. Regulatory Info (`IngredientRegulatory`)

Связь **1:1** с `Ingredient`. Хранит нормативно-правовые данные о качестве ингредиентов.

| Поле | Тип | Описание |
| --- | --- | --- |
| `pharmacopoeiaGrade` | `String?` | Стандарт качества: `"USP-NF"`, `"EP"`, `"BP"`, `"JP"` |
| `allergenStatus` | `String?` | Аллерген: `"Lactose"`, `"Gluten"`, `"Soy"` или `null` |

> Поле `isAllergen: Boolean` в модели `Ingredient` сохранено для обратной совместимости.
> `allergenStatus` содержит конкретный аллерген вместо простого `true/false`.

**Значения `pharmacopoeiaGrade` в базе:**
- `"USP-NF"` — большинство ингредиентов (Paracetamol, Lactose, MCC, Mg Stearate и др.)
- `"EP"` — Aerosil 200, Talc, Vitamin D3

**Аллергены в базе:**
- `id=2` Lactose Monohydrate → `allergenStatus: "Lactose"`
- `id=23` Pregelatinized Starch → `allergenStatus: "Gluten"`

---

## 9. Packaging Recommendations — бизнес-правила

Реализованы в `getPackagingRecommendations()` в `src/lib/calculator.ts`.

| Условие | Тип упаковки | Сообщение |
| --- | --- | --- |
| `hygroscopicity > 70` | `moisture_protection` | ALU/ALU блистер |
| `lightSensitive === true` | `light_protection` | Светонепроницаемая упаковка |
| `heatDegradation < 40°C` | `heat_protection` | Хранение при 2–8°C |
| Нет специальных требований | `standard` | PVC/PVDC блистер |

**Принцип:** функция чисто детерминированная — без побочных эффектов. Если `stabilityProfile` отсутствует — ингредиент пропускается (graceful fallback). Может вернуть несколько рекомендаций одновременно (например, влага + свет).
