# Developer Guide: Adding New Algorithm Layouts

This guide walks you through the process of adding a new algorithm layout to VisualML Lab. The layout system uses a composable architecture where algorithm-specific visualizations plug into a shared base layout that handles common functionality.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Step-by-Step Guide](#step-by-step-guide)
4. [BaseLayout Slot System](#baselayout-slot-system)
5. [Complete Implementation Checklist](#complete-implementation-checklist)
6. [Examples](#examples)
7. [Testing Your Layout](#testing-your-layout)

---

## Overview

The layout architecture separates concerns:

- **BaseLayout**: Handles shared functionality (concept panel, code panel, keyboard shortcuts, error handling, help modal)
- **Algorithm-Specific Layouts**: Define custom controls and visualizations for each algorithm family
- **Layout Dispatcher**: Routes algorithms to their appropriate layout components

When you add a new algorithm, you'll create a layout component that plugs into this system.

---

## Prerequisites

Before adding a new layout, ensure you have:

1. **Algorithm implementation** in the ML Engine (`engine/algorithms/`)
2. **Concept content** explaining the algorithm
3. **Code examples** in Python and JavaScript
4. **Understanding of the visualization needs** for your algorithm

---

## Step-by-Step Guide

### Step 1: Create the Layout Component

Create a new file in `src/pages/layouts/` for your layout component.

**File**: `src/pages/layouts/MyNewLayout.tsx`

```typescript
/**
 * MyNewLayout.tsx — Layout for [algorithm family] algorithms
 * 
 * Implements the lesson page layout for [list algorithms].
 * Uses BaseLayout with algorithm-specific controls and visualization slots.
 */

import React, { useState, useCallback } from 'react';
import { BaseLayout } from '../../components/BaseLayout';
import { useLayoutError, useCodePanelState } from '../../hooks/useLayoutHooks';
import { getDefaultDataset } from '../../utils/layoutUtils';

interface MyNewLayoutProps {
    algorithm: string; // e.g., 'decisionTree' | 'randomForest'
}

export const MyNewLayout: React.FC<MyNewLayoutProps> = ({ algorithm }) => {
    // 1. State management
    const [params, setParams] = useState({
        // Your algorithm-specific parameters
        maxDepth: 3,
        minSamples: 2,
    });

    const [dataset, setDataset] = useState(getDefaultDataset(algorithm));
    const [helpModalOpen, setHelpModalOpen] = useState(false);

    // 2. Shared hooks
    const { error, clearError } = useLayoutError();
    const { isExpanded: codePanelExpanded, toggle: toggleCodePanel } = useCodePanelState(false);

    // 3. Your training/visualization logic here
    // This could be a custom hook like useTreeController or direct state management

    // 4. Event handlers
    const handleParamsChange = (newParams: Partial<typeof params>) => {
        setParams({ ...params, ...newParams });
        // Update your visualization
    };

    const handleToggleHelp = () => {
        setHelpModalOpen(!helpModalOpen);
    };

    // 5. Create controls slot
    const controlsSlot = (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Parameters</h3>
            {/* Your parameter controls here */}
            <div className="space-y-4">
                <label className="block">
                    <span className="text-sm font-medium text-gray-700">Max Depth</span>
                    <input
                        type="range"
                        min="1"
                        max="10"
                        value={params.maxDepth}
                        onChange={(e) => handleParamsChange({ maxDepth: parseInt(e.target.value) })}
                        className="w-full"
                    />
                    <span className="text-sm text-gray-600">{params.maxDepth}</span>
                </label>
            </div>
        </div>
    );

    // 6. Create visualization slot
    const visualizationSlot = (
        <div className="space-y-6">
            {/* Your visualization components here */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4">Visualization</h3>
                {/* Canvas, SVG, or other visualization elements */}
            </div>
        </div>
    );

    // 7. Return BaseLayout with your slots
    return (
        <BaseLayout
            algorithm={algorithm}
            controlsSlot={controlsSlot}
            visualizationSlot={visualizationSlot}
            error={error}
            onClearError={clearError}
            codePanelExpanded={codePanelExpanded}
            onToggleCodePanel={toggleCodePanel}
            helpModalOpen={helpModalOpen}
            onToggleHelp={handleToggleHelp}
            keyboardHandlers={{
                onToggleCodePanel: toggleCodePanel,
                onToggleHelp: handleToggleHelp,
                // Add other keyboard handlers as needed
            }}
        />
    );
};
```

### Step 2: Register in Layout Map

Add your layout to the dispatcher in `src/pages/LessonPage.tsx`.

```typescript
// 1. Import your layout (lazy loaded)
const MyNewLayout = lazy(() => 
    import('./layouts/MyNewLayout').then(module => ({ 
        default: module.MyNewLayout 
    }))
);

// 2. Add to VALID_ALGORITHMS
const VALID_ALGORITHMS = [
    'linearRegression', 
    'logisticRegression', 
    'svm',
    'myNewAlgorithm', // Add your algorithm
] as const;

// 3. Add to layoutMap
const layoutMap: Record<string, React.ComponentType<{ algorithm: string }>> = {
    linearRegression: GradientDescentLayout,
    logisticRegression: GradientDescentLayout,
    svm: GradientDescentLayout,
    myNewAlgorithm: MyNewLayout, // Map your algorithm to your layout
};
```

### Step 3: Add Default Dataset Mapping

Update `src/utils/layoutUtils.ts` to include your algorithm's default dataset.

```typescript
export function getDefaultDataset(algorithm: string): string {
    const datasetMap: Record<string, string> = {
        linearRegression: 'linear',
        logisticRegression: 'iris-2d',
        svm: 'blobs',
        myNewAlgorithm: 'iris-2d', // Add your algorithm
    };
    return datasetMap[algorithm] || 'iris-2d';
}
```

### Step 4: Add Algorithm Family Classification

Update `src/utils/layoutUtils.ts` to classify your algorithm.

```typescript
export function getAlgorithmFamily(algorithm: string): AlgorithmFamily {
    const familyMap: Record<string, AlgorithmFamily> = {
        linearRegression: 'gradient-descent',
        logisticRegression: 'gradient-descent',
        svm: 'gradient-descent',
        myNewAlgorithm: 'tree-based', // Add your algorithm family
    };
    return familyMap[algorithm] || 'unknown';
}
```

### Step 5: Add Concept Content

Create concept content in `src/data/concepts.ts`.

```typescript
export const conceptData: Record<string, ConceptContent> = {
    // ... existing concepts
    myNewAlgorithm: {
        title: 'My New Algorithm',
        markdown: `
# My New Algorithm

## Overview
[Explain your algorithm here]

## How It Works
[Explain the mechanics]

## Key Parameters
- **Parameter 1**: Description
- **Parameter 2**: Description
        `,
    },
};
```

### Step 6: Add Code Examples

Update `src/utils/codeContent.ts` to include code examples.

```typescript
export function getAlgorithmCode(algorithm: string, language: string): string {
    // ... existing code

    if (algorithm === 'myNewAlgorithm') {
        if (language === 'python') {
            return `# Python implementation
from sklearn.tree import DecisionTreeClassifier

# Create and train model
model = DecisionTreeClassifier(max_depth=3)
model.fit(X_train, y_train)

# Make predictions
predictions = model.predict(X_test)`;
        } else {
            return `// JavaScript implementation
const model = new MyAlgorithm({
    maxDepth: 3
});

model.fit(X_train, y_train);
const predictions = model.predict(X_test);`;
        }
    }

    // ... rest of code
}
```

### Step 7: Create Tests

Create unit tests for your layout in `src/pages/layouts/__tests__/MyNewLayout.test.tsx`.

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MyNewLayout } from '../MyNewLayout';

describe('MyNewLayout', () => {
    it('renders controls slot', () => {
        render(<MyNewLayout algorithm="myNewAlgorithm" />);
        expect(screen.getByText('Parameters')).toBeInTheDocument();
    });

    it('renders visualization slot', () => {
        render(<MyNewLayout algorithm="myNewAlgorithm" />);
        expect(screen.getByText('Visualization')).toBeInTheDocument();
    });

    // Add more tests...
});
```

### Step 8: Update Routing (if needed)

If you need a custom route, update `src/App.tsx`:

```typescript
<Route path="/lesson/:algorithm" element={<LessonPage />} />
```

The existing route should work for most cases since it uses a parameter.

---

## BaseLayout Slot System

The BaseLayout component uses a **slot-based architecture** where you provide React nodes for specific areas of the page.

### Required Slots

#### 1. Controls Slot

The `controlsSlot` is where you render algorithm-specific parameter controls.

**Example:**
```typescript
const controlsSlot = (
    <ParameterControls
        algorithm={algorithm}
        params={params}
        onParamsChange={handleParamsChange}
    />
);
```

**Best Practices:**
- Keep controls focused and minimal
- Use clear labels and helpful tooltips
- Provide immediate visual feedback
- Disable controls during active training/animation

#### 2. Visualization Slot

The `visualizationSlot` is where you render your algorithm's visualization.

**Example:**
```typescript
const visualizationSlot = (
    <div className="space-y-6">
        <StatusIndicator status={status} />
        <PlaybackControls onPlay={play} onPause={pause} />
        <div className="grid grid-cols-2 gap-6">
            <Canvas2D data={data} />
            <LossCurve history={history} />
        </div>
    </div>
);
```

**Best Practices:**
- Use responsive grid layouts
- Provide loading states
- Handle empty/error states gracefully
- Use consistent spacing (space-y-6, gap-6)

### Optional Props

#### Grid Layout Options

Control the overall page layout:

```typescript
<BaseLayout
    gridLayout="default"  // 1/3 concept + 2/3 main (default)
    // OR
    gridLayout="full-width"  // Single column
    // OR
    gridLayout="side-by-side"  // 1/2 + 1/2 split
    // OR
    gridLayout="custom"
    customGridClasses="grid grid-cols-4 gap-4"
/>
```

#### Hiding Panels

```typescript
<BaseLayout
    showConceptPanel={false}  // Hide concept panel
    showCodePanel={false}     // Hide code panel
/>
```

#### Custom Footer

```typescript
<BaseLayout
    customFooter={<MyCustomFooter />}  // Replaces code panel
/>
```

### Keyboard Handlers

Provide handlers for keyboard shortcuts:

```typescript
<BaseLayout
    keyboardHandlers={{
        onPlayPause: handlePlayPause,    // Space bar
        onStep: handleStep,              // Right arrow
        onReset: handleReset,            // R key
        onToggleCodePanel: toggleCode,   // C key
        onToggleHelp: toggleHelp,        // ? key
    }}
/>
```

---

## Complete Implementation Checklist

Use this checklist to ensure you've completed all necessary steps:

### Core Implementation
- [ ] Created layout component file in `src/pages/layouts/`
- [ ] Defined props interface with algorithm type
- [ ] Implemented state management for parameters
- [ ] Created controls slot with parameter controls
- [ ] Created visualization slot with algorithm visualization
- [ ] Integrated BaseLayout with both slots
- [ ] Added error handling with useLayoutError hook
- [ ] Added code panel state with useCodePanelState hook
- [ ] Implemented keyboard shortcut handlers

### Registration
- [ ] Added lazy import in LessonPage.tsx
- [ ] Added algorithm to VALID_ALGORITHMS array
- [ ] Added algorithm to layoutMap object
- [ ] Updated getDefaultDataset in layoutUtils.ts
- [ ] Updated getAlgorithmFamily in layoutUtils.ts

### Content
- [ ] Added concept content in concepts.ts
- [ ] Added Python code example in codeContent.ts
- [ ] Added JavaScript code example in codeContent.ts

### Testing
- [ ] Created unit tests for layout component
- [ ] Created integration tests for full lesson flow
- [ ] Tested keyboard shortcuts work correctly
- [ ] Tested error handling displays correctly
- [ ] Tested responsive behavior on mobile and desktop
- [ ] Tested with screen reader for accessibility

### Documentation
- [ ] Added JSDoc comments to layout component
- [ ] Documented any custom hooks or utilities
- [ ] Updated this guide if you discovered new patterns

---

## Examples

### Example 1: Decision Tree Layout

A tree-based algorithm that shows a tree diagram and decision regions.

```typescript
export const DecisionTreeLayout: React.FC<DecisionTreeLayoutProps> = ({ algorithm }) => {
    const [maxDepth, setMaxDepth] = useState(3);
    const [treeData, setTreeData] = useState(null);

    const controlsSlot = (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Tree Parameters</h3>
            <label className="block">
                <span className="text-sm font-medium">Max Depth: {maxDepth}</span>
                <input
                    type="range"
                    min="1"
                    max="10"
                    value={maxDepth}
                    onChange={(e) => setMaxDepth(parseInt(e.target.value))}
                    className="w-full mt-2"
                />
            </label>
        </div>
    );

    const visualizationSlot = (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TreeDiagram data={treeData} />
            <DecisionRegions data={treeData} />
        </div>
    );

    return (
        <BaseLayout
            algorithm={algorithm}
            controlsSlot={controlsSlot}
            visualizationSlot={visualizationSlot}
            // ... other props
        />
    );
};
```

### Example 2: Random Forest Layout

An ensemble algorithm showing multiple trees and combined predictions.

```typescript
export const RandomForestLayout: React.FC<RandomForestLayoutProps> = ({ algorithm }) => {
    const [numTrees, setNumTrees] = useState(10);
    const [trees, setTrees] = useState([]);

    const controlsSlot = (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Forest Parameters</h3>
            <label className="block">
                <span className="text-sm font-medium">Number of Trees: {numTrees}</span>
                <input
                    type="range"
                    min="1"
                    max="50"
                    value={numTrees}
                    onChange={(e) => setNumTrees(parseInt(e.target.value))}
                    className="w-full mt-2"
                />
            </label>
        </div>
    );

    const visualizationSlot = (
        <div className="space-y-6">
            {/* Tree thumbnails */}
            <div className="grid grid-cols-5 gap-2">
                {trees.map((tree, i) => (
                    <TreeThumbnail key={i} tree={tree} />
                ))}
            </div>
            
            {/* Individual vs Ensemble comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h4 className="text-sm font-medium mb-2">Single Tree</h4>
                    <DecisionRegions data={trees[0]} />
                </div>
                <div>
                    <h4 className="text-sm font-medium mb-2">Ensemble</h4>
                    <DecisionRegions data={trees} ensemble />
                </div>
            </div>
        </div>
    );

    return (
        <BaseLayout
            algorithm={algorithm}
            controlsSlot={controlsSlot}
            visualizationSlot={visualizationSlot}
            gridLayout="full-width"  // Use full width for more space
            // ... other props
        />
    );
};
```

---

## Testing Your Layout

### Manual Testing Checklist

1. **Navigation**: Navigate to `/lesson/myNewAlgorithm` and verify the layout renders
2. **Controls**: Test all parameter controls update the visualization
3. **Keyboard Shortcuts**: Test all keyboard shortcuts work (Space, R, C, ?)
4. **Code Panel**: Test code panel toggles correctly
5. **Help Modal**: Test help modal opens and closes
6. **Error Handling**: Trigger an error and verify toast appears
7. **Responsive**: Test on mobile (< 768px) and desktop viewports
8. **Accessibility**: Test with keyboard navigation and screen reader

### Automated Testing

Run the test suite:

```bash
npm run test:ui -- MyNewLayout
```

Ensure all tests pass before submitting your changes.

---

## Common Patterns

### Pattern 1: Step-Based Training

For algorithms that train in discrete steps (like gradient descent):

```typescript
const [iteration, setIteration] = useState(0);
const [isPlaying, setIsPlaying] = useState(false);

const step = () => {
    // Perform one training step
    setIteration(i => i + 1);
};

const play = () => {
    setIsPlaying(true);
    // Start interval to call step()
};
```

### Pattern 2: Immediate Updates

For algorithms that don't have iterative training:

```typescript
const handleParamsChange = (newParams) => {
    setParams(newParams);
    // Immediately recompute and update visualization
    const result = computeAlgorithm(newParams);
    setVisualizationData(result);
};
```

### Pattern 3: Async Computation

For expensive computations:

```typescript
const [isComputing, setIsComputing] = useState(false);

const handleParamsChange = async (newParams) => {
    setIsComputing(true);
    try {
        const result = await computeAlgorithmAsync(newParams);
        setVisualizationData(result);
    } catch (error) {
        setError(error.message);
    } finally {
        setIsComputing(false);
    }
};
```

---

## Troubleshooting

### Issue: Layout doesn't render

**Check:**
- Algorithm is in VALID_ALGORITHMS array
- Algorithm is in layoutMap object
- Lazy import path is correct
- Component is exported correctly

### Issue: Slots don't appear

**Check:**
- controlsSlot and visualizationSlot are not null/undefined
- Slots contain valid React nodes
- No errors in browser console

### Issue: Keyboard shortcuts don't work

**Check:**
- keyboardHandlers prop is passed to BaseLayout
- Handler functions are defined
- No other elements are capturing keyboard events

### Issue: Error toast doesn't appear

**Check:**
- error prop is passed to BaseLayout
- onClearError handler is provided
- Error is a non-empty string

---

## Need Help?

If you encounter issues not covered in this guide:

1. Check the existing layouts (GradientDescentLayout) for reference
2. Review the BaseLayout component documentation
3. Check the design document at `.kiro/specs/layout-refactor/design.md`
4. Ask the team for guidance

---

## Summary

Adding a new algorithm layout involves:

1. **Create** a layout component with controls and visualization slots
2. **Register** the layout in the dispatcher
3. **Add** content (concepts, code examples)
4. **Test** thoroughly (unit, integration, manual)
5. **Document** any new patterns or utilities

The slot-based architecture makes it straightforward to add new visualizations while maintaining consistency across the application.
