---
name: pharmnode-canvas-ui
description: |
  Guides implementation of the Node-Based canvas UI in PharmNode.
  Use when writing or modifying: Canvas.tsx, NodeCard.tsx, Sidebar.tsx, useNodeEditor.ts,
  SVG connections, drag-and-drop, node state management, or theme variables.
  Also triggers when user mentions: "нода", "холст", "canvas", "drag", "sidebar", "связи", "SVG линии".
---

# PharmNode Canvas UI Skill

## Архитектура холста

```text
Canvas.tsx          ← SVG-холст, рендер нод, drop-zone
  ├── NodeCard.tsx  ← Карточки каждого типа ноды
  ├── Sidebar.tsx   ← Библиотека ингредиентов (drag source)
  └── useNodeEditor ← Весь стейт нод и пересчёт результатов
```

## Обязательные директивы

```typescript
// Все компоненты холста — клиентские!
"use client"; // ← ПЕРВАЯ строка в Canvas.tsx, NodeCard.tsx, Sidebar.tsx, useNodeEditor.ts
```

## Стейт холста (`useNodeEditor.ts`)

```typescript
// src/hooks/useNodeEditor.ts
interface NodeEditorState {
  nodes: CanvasNode[];           // список нод с координатами
  connections: Connection[];      // связи между портами нод
  calculatedResults: Results;     // реактивный пересчёт из calculator.ts
}

// Методы
addIngredientNode(ingredientId: number): void
removeNode(nodeId: string): void
updateNodeData(nodeId: string, data: Partial<NodeData>): void
```

## Типы нод

| Тип | Компонент | Назначение |
| --- | --- | --- |
| `ingredient` | `IngredientNode` | Ввод % ингредиента, отображение плотностей |
| `blending` | `BlendingNode` | Хауснер, Карр, предупреждения совместимости |
| `press` | `PressNode` | Диаметр пуансона, глубина, пористость |
| `cost-optimizer` | `CostOptimizerNode` | Себестоимость, рекомендации замены |
| `output` | `OutputNode` | Паспорт рецептуры, аллергены, PDF-экспорт |

## SVG-связи между нодами

```tsx
// Bezier curve между двумя портами
<path
  d={`M ${x1} ${y1} C ${x1 + 80} ${y1}, ${x2 - 80} ${y2}, ${x2} ${y2}`}
  stroke="var(--primary)"
  strokeWidth="2"
  fill="none"
  className="connection-line"
/>
```

## Drag-and-Drop (Блок 12, в работе)

```tsx
// Sidebar — источник перетаскивания
<div
  draggable="true"
  onDragStart={(e) => {
    e.dataTransfer.setData('ingredientId', ingredient.id.toString());
  }}
/>

// Canvas — зона сброса
<div
  onDragOver={(e) => e.preventDefault()}
  onDrop={(e) => {
    const id = parseInt(e.dataTransfer.getData('ingredientId'));
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    addIngredientNode(id, { x, y });
  }}
/>
```

## Дизайн-система (CSS переменные — ТОЛЬКО они!)

```css
/* src/app/globals.css */
:root {
  --bg: #f8fafc;
  --surface: #ffffff;
  --primary: #005eb8;
  --text: #0f172a;
  --border: #cbd5e1;
  --success: #16a34a;
  --warning: #d97706;
  --radius: 0.125rem;
}

[data-theme="dark"] {
  --bg: #000000;
  --surface: #0c0c0e;
  --primary: #05e69f;
  --text: #ededed;
  --border: #222226;
}
```

**Никогда не хардкодить цвета в компонентах!**

```tsx
// ❌ НЕЛЬЗЯ
<div style={{ backgroundColor: '#05e69f' }} />
<div className="bg-emerald-400" />

// ✅ НАДО
<div style={{ backgroundColor: 'var(--primary)' }} />
```

## Отображение предупреждений совместимости

```tsx
// В BlendingNode
{warnings.map(w => (
  <div key={w.id} className={`alert alert-${w.severity}`}>
    ⚠️ {w.title}
    <p>{w.message}</p>
    <button onClick={() => applySuggestion(w)}>
      💡 {w.suggestion}
    </button>
  </div>
))}
```

## Undo/Redo паттерн

```typescript
// В useNodeEditor.ts
interface HistoryState {
  past: NodeEditorState[];
  present: NodeEditorState;
  future: NodeEditorState[];
}

// Cmd+Z / Ctrl+Z
useEffect(() => {
  const handler = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'z') undo();
  };
  window.addEventListener('keydown', handler);
  return () => window.removeEventListener('keydown', handler);
}, []);
```

## Ссылки на документацию

- Обзор проекта: [`docs/project-overview.md`](../../project-overview.md)
- Дизайн-система: [`src/app/globals.css`](../../../src/app/globals.css)
- Стейт хук: [`src/hooks/useNodeEditor.ts`](../../../src/hooks/useNodeEditor.ts)

---
⬅️ [Вернуться к индексу документации](../../index.md)
