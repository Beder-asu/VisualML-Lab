# BaseLayout API Documentation

The `BaseLayout` component is the foundation of the VisualML Lab layout system. It provides a consistent shell for all algorithm lessons, handling shared functionality while accepting pluggable content through a slot-based architecture.

## Table of Contents

1. [Overview](#overview)
2. [Props Reference](#props-reference)
3. [Slot System](#slot-system)
4. [Grid Layout Options](#grid-layout-options)
5. [Usage Examples](#usage-examples)
6. [Best Practices](#best-practices)

---

## Overview

BaseLayout handles:
- **Concept Panel**: Algorithm explanation and theory
- **Code Panel**: Implementation code in Python and JavaScript
- **Keyboard Shortcuts**: Consistent shortcuts across all layouts
- **Error Handling**: Toast notifications for errors
- **Help Modal**: Keyboard shortcut reference
- **Responsive Layout**: Mobile and desktop grid layouts
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support

You provide:
- **Controls Slot**: Algorithm-specific parameter controls
- **Visualization Slot**: Algorithm-specific visualizations

---

## Props Reference

### Required Props

#### `algorithm`
- **Type**: `string`
- **Required**: Yes
- **Description**: The algorithm identifier (e.g., 'linearRegression', 'svm')
- **Used For**: Loading concept content, code examples, and identifying the lesson

```typescript
<BaseLayout algorithm="linearRegression" />
```

#### `controlsSlot`
- **Type**: `React.ReactNode`
- **Required**: Yes
- **Description**: React element(s) to render in the controls area
- **Typical Content**: Parameter sliders, dataset selectors, configuration options

```typescript
<BaseLayout 
  controlsSlot={
    <ParameterControls 
      params={params} 
      onParamsChange={handleChange} 
    />
  }
/>
```

#### `visualizationSlot`
- **Type**: `React.ReactNode`
- **Required**: Yes
- **Description**: React element(s) to render in the visualization area
- **Typical Content**: Canvas, charts, diagrams, playback controls

```typescript
<BaseLayout 
  visualizationSlot={
    <div className="space-y-6">
      <Canvas2D data={data} />
      <LossCurve history={history} />
    </div>
  }
/>
```

---

### Optional Props

#### Panel Visibility

##### `showConceptPanel`
- **Type**: `boolean`
- **Default**: `true`
- **Description**: Whether to show the concept panel with algorithm explanation

```typescript
<BaseLayout showConceptPanel={false} /> // Hide concept panel
```

##### `showCodePanel`
- **Type**: `boolean`
- **Default**: `true`
- **Description**: Whether to show the code panel with implementation examples

```typescript
<BaseLayout showCodePanel={false} /> // Hide code panel
```

##### `customFooter`
- **Type**: `React.ReactNode`
- **Default**: `undefined`
- **Description**: Custom footer content to replace the code panel
- **Note**: When provided, `showCodePanel` is ignored

```typescript
<BaseLayout 
  customFooter={
    <div className="bg-white p-6">
      Custom footer content
    </div>
  }
/>
```

---

#### Layout Configuration

##### `gridLayout`
- **Type**: `'default' | 'full-width' | 'side-by-side' | 'custom'`
- **Default**: `'default'`
- **Description**: Predefined grid layout option

**Options:**
- `'default'`: 1/3 concept panel + 2/3 main content (standard layout)
- `'full-width'`: Single column, full width (no concept panel split)
- `'side-by-side'`: 1/2 + 1/2 split (equal columns)
- `'custom'`: Use `customGridClasses` for complete control

```typescript
<BaseLayout gridLayout="full-width" />
```

##### `customGridClasses`
- **Type**: `string`
- **Default**: `undefined`
- **Description**: Custom Tailwind grid classes (only used when `gridLayout="custom"`)

```typescript
<BaseLayout 
  gridLayout="custom"
  customGridClasses="grid grid-cols-4 gap-8"
/>
```

---

#### Error Handling

##### `error`
- **Type**: `string | null`
- **Default**: `undefined`
- **Description**: Error message to display in a toast notification

```typescript
<BaseLayout error="Training failed: invalid parameters" />
```

##### `onClearError`
- **Type**: `() => void`
- **Default**: `undefined`
- **Description**: Callback when user dismisses the error toast
- **Note**: Required when `error` is provided

```typescript
<BaseLayout 
  error={error}
  onClearError={() => setError(null)}
/>
```

---

#### Code Panel State

##### `codePanelExpanded`
- **Type**: `boolean`
- **Default**: `false`
- **Description**: Whether the code panel is expanded or collapsed

```typescript
<BaseLayout codePanelExpanded={isExpanded} />
```

##### `onToggleCodePanel`
- **Type**: `() => void`
- **Default**: `undefined`
- **Description**: Callback when user toggles the code panel

```typescript
<BaseLayout 
  codePanelExpanded={isExpanded}
  onToggleCodePanel={() => setIsExpanded(!isExpanded)}
/>
```

---

#### Help Modal State

##### `helpModalOpen`
- **Type**: `boolean`
- **Default**: `false`
- **Description**: Whether the help modal is open

```typescript
<BaseLayout helpModalOpen={isHelpOpen} />
```

##### `onToggleHelp`
- **Type**: `() => void`
- **Default**: `undefined`
- **Description**: Callback when user toggles the help modal

```typescript
<BaseLayout 
  helpModalOpen={isHelpOpen}
  onToggleHelp={() => setIsHelpOpen(!isHelpOpen)}
/>
```

---

#### Keyboard Shortcuts

##### `keyboardHandlers`
- **Type**: `KeyboardHandlers`
- **Default**: `{}`
- **Description**: Object containing keyboard shortcut handler functions

**KeyboardHandlers Interface:**
```typescript
interface KeyboardHandlers {
  onPlayPause?: () => void;    // Space bar
  onStep?: () => void;          // Right arrow
  onReset?: () => void;         // R key
  onToggleCodePanel?: () => void; // C key
  onToggleHelp?: () => void;    // ? key
}
```

**Example:**
```typescript
<BaseLayout 
  keyboardHandlers={{
    onPlayPause: handlePlayPause,
    onStep: handleStep,
    onReset: handleReset,
    onToggleCodePanel: toggleCodePanel,
    onToggleHelp: toggleHelp,
  }}
/>
```

---

## Slot System

The slot system allows you to inject custom content into predefined areas of the layout without worrying about the surrounding structure.

### How Slots Work

1. **You create** React elements for your algorithm-specific UI
2. **You pass** those elements as props (`controlsSlot`, `visualizationSlot`)
3. **BaseLayout renders** them in the correct locations with proper spacing and styling

### Slot Locations

```
┌─────────────────────────────────────────────────────┐
│                      Header                         │
├──────────────────┬──────────────────────────────────┤
│                  │                                  │
│  Concept Panel   │    Controls Slot                │
│  (shared)        │    (your content)               │
│                  │                                  │
│                  ├──────────────────────────────────┤
│                  │                                  │
│                  │    Visualization Slot           │
│                  │    (your content)               │
│                  │                                  │
├──────────────────┴──────────────────────────────────┤
│                  Code Panel (shared)                │
├─────────────────────────────────────────────────────┤
│                      Footer                         │
└─────────────────────────────────────────────────────┘
```

### Slot Best Practices

#### Controls Slot

**Purpose**: Parameter controls, dataset selectors, configuration options

**Recommended Structure:**
```typescript
const controlsSlot = (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <h3 className="text-lg font-semibold mb-4">Parameters</h3>
    <div className="space-y-4">
      {/* Your controls here */}
    </div>
  </div>
);
```

**Tips:**
- Use consistent spacing (`space-y-4`)
- Provide clear labels for all controls
- Show current values next to sliders
- Disable controls during active training
- Use tooltips for complex parameters

#### Visualization Slot

**Purpose**: Algorithm visualizations, charts, canvases, playback controls

**Recommended Structure:**
```typescript
const visualizationSlot = (
  <div className="space-y-6">
    <StatusIndicator status={status} />
    <PlaybackControls onPlay={play} onPause={pause} />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Canvas2D data={data} />
      <Chart data={chartData} />
    </div>
  </div>
);
```

**Tips:**
- Use responsive grids (`grid-cols-1 md:grid-cols-2`)
- Provide loading states for async operations
- Handle empty states gracefully
- Use consistent spacing (`space-y-6`, `gap-6`)
- Add ARIA labels for accessibility

---

## Grid Layout Options

### Default Layout

**Use Case**: Standard algorithm lessons with concept explanation

```typescript
<BaseLayout gridLayout="default" />
```

**Structure**: 1/3 concept panel + 2/3 main content

**Responsive Behavior**:
- Mobile (< 768px): Stacked vertically
- Desktop (≥ 768px): Side-by-side with 1:2 ratio

---

### Full-Width Layout

**Use Case**: Algorithms that need maximum visualization space

```typescript
<BaseLayout gridLayout="full-width" />
```

**Structure**: Single column, full width

**When to Use**:
- Complex visualizations that need space
- Multiple side-by-side comparisons
- Algorithms where concept panel is less critical

---

### Side-by-Side Layout

**Use Case**: Equal emphasis on concept and visualization

```typescript
<BaseLayout gridLayout="side-by-side" />
```

**Structure**: 1/2 + 1/2 split

**When to Use**:
- Comparing two visualizations
- Concept and visualization are equally important

---

### Custom Layout

**Use Case**: Unique layout requirements

```typescript
<BaseLayout 
  gridLayout="custom"
  customGridClasses="grid grid-cols-4 gap-4"
/>
```

**When to Use**:
- Non-standard column ratios
- More than 2 columns
- Special spacing requirements

---

## Usage Examples

### Example 1: Basic Gradient Descent Layout

```typescript
import { BaseLayout } from '../../components/BaseLayout';
import { useLayoutError, useCodePanelState } from '../../hooks/useLayoutHooks';

export const MyLayout: React.FC<{ algorithm: string }> = ({ algorithm }) => {
  const [params, setParams] = useState({ lr: 0.01, nIter: 100 });
  const { error, clearError } = useLayoutError();
  const { isExpanded, toggle } = useCodePanelState();
  const [helpOpen, setHelpOpen] = useState(false);

  const controlsSlot = (
    <ParameterControls 
      params={params} 
      onChange={setParams} 
    />
  );

  const visualizationSlot = (
    <div className="space-y-6">
      <Canvas2D data={data} />
      <LossCurve history={history} />
    </div>
  );

  return (
    <BaseLayout
      algorithm={algorithm}
      controlsSlot={controlsSlot}
      visualizationSlot={visualizationSlot}
      error={error}
      onClearError={clearError}
      codePanelExpanded={isExpanded}
      onToggleCodePanel={toggle}
      helpModalOpen={helpOpen}
      onToggleHelp={() => setHelpOpen(!helpOpen)}
      keyboardHandlers={{
        onToggleCodePanel: toggle,
        onToggleHelp: () => setHelpOpen(!helpOpen),
      }}
    />
  );
};
```

---

### Example 2: Full-Width Layout with Custom Footer

```typescript
export const TreeLayout: React.FC<{ algorithm: string }> = ({ algorithm }) => {
  const controlsSlot = <TreeControls />;
  
  const visualizationSlot = (
    <div className="grid grid-cols-2 gap-6">
      <TreeDiagram tree={tree} />
      <DecisionRegions tree={tree} />
    </div>
  );

  const customFooter = (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold mb-4">Tree Statistics</h3>
      <TreeStats tree={tree} />
    </div>
  );

  return (
    <BaseLayout
      algorithm={algorithm}
      controlsSlot={controlsSlot}
      visualizationSlot={visualizationSlot}
      gridLayout="full-width"
      customFooter={customFooter}
    />
  );
};
```

---

### Example 3: Minimal Layout (No Panels)

```typescript
export const SimpleLayout: React.FC<{ algorithm: string }> = ({ algorithm }) => {
  const controlsSlot = <SimpleControls />;
  const visualizationSlot = <SimpleVisualization />;

  return (
    <BaseLayout
      algorithm={algorithm}
      controlsSlot={controlsSlot}
      visualizationSlot={visualizationSlot}
      showConceptPanel={false}
      showCodePanel={false}
    />
  );
};
```

---

### Example 4: Custom Grid Layout

```typescript
export const MultiPanelLayout: React.FC<{ algorithm: string }> = ({ algorithm }) => {
  const controlsSlot = <Controls />;
  
  const visualizationSlot = (
    <div className="grid grid-cols-3 gap-4">
      <Panel1 />
      <Panel2 />
      <Panel3 />
    </div>
  );

  return (
    <BaseLayout
      algorithm={algorithm}
      controlsSlot={controlsSlot}
      visualizationSlot={visualizationSlot}
      gridLayout="custom"
      customGridClasses="grid grid-cols-1 lg:grid-cols-4 gap-6"
    />
  );
};
```

---

## Best Practices

### 1. Always Provide Both Slots

Even if one slot is minimal, always provide both `controlsSlot` and `visualizationSlot`:

```typescript
// ✅ Good
<BaseLayout 
  controlsSlot={<div>No controls needed</div>}
  visualizationSlot={<MyVisualization />}
/>

// ❌ Bad
<BaseLayout 
  visualizationSlot={<MyVisualization />}
/>
```

### 2. Use Shared Hooks

Leverage the provided hooks for common functionality:

```typescript
// ✅ Good
const { error, clearError } = useLayoutError();
const { isExpanded, toggle } = useCodePanelState();

// ❌ Bad - reimplementing the same logic
const [error, setError] = useState(null);
const [isExpanded, setIsExpanded] = useState(false);
```

### 3. Consistent Spacing

Use Tailwind's spacing utilities consistently:

```typescript
// ✅ Good - consistent spacing
<div className="space-y-6">
  <Component1 />
  <Component2 />
</div>

// ❌ Bad - inconsistent spacing
<div>
  <Component1 style={{ marginBottom: '20px' }} />
  <Component2 style={{ marginBottom: '15px' }} />
</div>
```

### 4. Responsive Design

Always consider mobile viewports:

```typescript
// ✅ Good - responsive
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">

// ❌ Bad - desktop only
<div className="grid grid-cols-2 gap-6">
```

### 5. Accessibility

Add ARIA labels and semantic HTML:

```typescript
// ✅ Good
<div role="region" aria-label="Algorithm controls">
  <Controls />
</div>

// ❌ Bad
<div>
  <Controls />
</div>
```

### 6. Error Handling

Always handle errors gracefully:

```typescript
// ✅ Good
<BaseLayout 
  error={error || trainingError}
  onClearError={() => {
    clearError();
    clearTrainingError();
  }}
/>

// ❌ Bad - ignoring errors
<BaseLayout />
```

### 7. Keyboard Shortcuts

Provide keyboard handlers for better UX:

```typescript
// ✅ Good
<BaseLayout 
  keyboardHandlers={{
    onPlayPause: handlePlayPause,
    onStep: handleStep,
    onReset: handleReset,
  }}
/>

// ❌ Bad - no keyboard support
<BaseLayout />
```

---

## TypeScript Types

### BaseLayoutProps

```typescript
interface BaseLayoutProps {
  // Required
  algorithm: string;
  controlsSlot: React.ReactNode;
  visualizationSlot: React.ReactNode;

  // Optional - Panel Visibility
  showConceptPanel?: boolean;
  showCodePanel?: boolean;
  customFooter?: React.ReactNode;

  // Optional - Layout
  gridLayout?: 'default' | 'full-width' | 'side-by-side' | 'custom';
  customGridClasses?: string;

  // Optional - Error Handling
  error?: string | null;
  onClearError?: () => void;

  // Optional - Code Panel
  codePanelExpanded?: boolean;
  onToggleCodePanel?: () => void;

  // Optional - Help Modal
  helpModalOpen?: boolean;
  onToggleHelp?: () => void;

  // Optional - Keyboard
  keyboardHandlers?: KeyboardHandlers;
}
```

### KeyboardHandlers

```typescript
interface KeyboardHandlers {
  onPlayPause?: () => void;
  onStep?: () => void;
  onReset?: () => void;
  onToggleCodePanel?: () => void;
  onToggleHelp?: () => void;
}
```

---

## Related Documentation

- [Developer Guide: Adding New Layouts](./ADDING_NEW_LAYOUTS.md)
- [Shared Hooks Documentation](../src/hooks/useLayoutHooks.ts)
- [Layout Utilities Documentation](../src/utils/layoutUtils.ts)
- [Design Document](./.kiro/specs/layout-refactor/design.md)

---

## Summary

BaseLayout provides:
- ✅ Consistent structure across all algorithm lessons
- ✅ Shared functionality (keyboard shortcuts, errors, modals)
- ✅ Flexible slot system for custom content
- ✅ Multiple grid layout options
- ✅ Full accessibility support
- ✅ Responsive design out of the box

You provide:
- 📝 Algorithm-specific controls
- 📊 Algorithm-specific visualizations
- 🎮 Event handlers for interactions
