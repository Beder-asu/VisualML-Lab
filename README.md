# VisualML Lab

Interactive Machine Learning Visualization Platform

## Overview

VisualML Lab is an educational platform for learning machine learning algorithms through interactive visualizations. Each algorithm has a dedicated lesson page with parameter controls, real-time visualizations, and implementation code examples.

## Architecture

### Component Hierarchy

The application uses a composable layout architecture that separates algorithm-specific visualizations from shared page infrastructure:

```
App
└── Router
    ├── HomePage
    └── LessonPage (Layout Dispatcher)
        ├── GradientDescentLayout (linearRegression, logisticRegression, svm)
        │   └── BaseLayout
        │       ├── ConceptPanel (shared)
        │       ├── ParameterControls (slot)
        │       ├── Canvas2D + LossCurve (slot)
        │       ├── CodePanel (shared)
        │       ├── HelpModal (shared)
        │       └── Toast (shared)
        │
        └── [Future Layouts: DecisionTreeLayout, RandomForestLayout, XGBoostLayout]
```

### Layout System

**BaseLayout** provides the shared shell for all algorithm lessons:
- Concept panel with algorithm explanation
- Code panel with Python/JavaScript examples
- Keyboard shortcuts (Space, R, C, ?)
- Error handling with toast notifications
- Help modal with shortcut reference
- Responsive grid layouts

**Algorithm-Specific Layouts** plug into BaseLayout:
- Define custom parameter controls (controls slot)
- Define custom visualizations (visualization slot)
- Handle algorithm-specific state and interactions

**Layout Dispatcher** routes algorithms to layouts:
- Reads algorithm from URL parameter (`/lesson/:algorithm`)
- Looks up layout component from layout map
- Lazy loads layout for code splitting
- Redirects to home for invalid algorithms

### Adding New Algorithms

To add a new algorithm lesson:

1. **Create a layout component** in `src/pages/layouts/`
2. **Register in layout map** in `src/pages/LessonPage.tsx`
3. **Add concept content** in `src/data/concepts.ts`
4. **Add code examples** in `src/utils/codeContent.ts`
5. **Update utilities** in `src/utils/layoutUtils.ts`

See [Developer Guide: Adding New Layouts](./docs/ADDING_NEW_LAYOUTS.md) for detailed instructions.

## Project Structure

```
├── src/
│   ├── components/     # Shared React components
│   │   ├── BaseLayout.tsx          # Base layout shell
│   │   ├── ConceptPanel.tsx        # Algorithm explanation
│   │   ├── CodePanel.tsx           # Code examples
│   │   ├── Canvas2D.tsx            # 2D visualization canvas
│   │   ├── LossCurve.tsx           # Loss curve chart
│   │   ├── ParameterControls.tsx   # Parameter sliders
│   │   └── ...
│   ├── pages/          # Page components
│   │   ├── HomePage.tsx            # Landing page
│   │   ├── LessonPage.tsx          # Layout dispatcher
│   │   └── layouts/                # Algorithm-specific layouts
│   │       └── GradientDescentLayout.tsx
│   ├── hooks/          # Custom React hooks
│   │   ├── useLayoutHooks.ts       # Layout-specific hooks
│   │   ├── useTrainingController.ts # Training state management
│   │   └── ...
│   ├── utils/          # Utility functions
│   │   ├── layoutUtils.ts          # Layout utilities
│   │   ├── codeContent.ts          # Code examples
│   │   └── ...
│   ├── types/          # TypeScript type definitions
│   ├── data/           # Static data (concepts, datasets)
│   ├── test/           # Test setup and utilities
│   ├── App.tsx         # Main App component with routing
│   ├── main.tsx        # Application entry point
│   └── index.css       # Global styles with Tailwind
├── engine/             # ML Engine (JavaScript implementations)
│   ├── algorithms/     # Algorithm implementations
│   │   ├── linearRegression.js
│   │   ├── logisticRegression.js
│   │   └── svm.js
│   ├── datasets.js     # Dataset generation
│   ├── state.js        # Training state management
│   └── worker.js       # Web Worker for background training
├── docs/               # Documentation
│   ├── ADDING_NEW_LAYOUTS.md  # Developer guide
│   └── BASELAYOUT_API.md      # BaseLayout API reference
└── dist/               # Build output
```

## Tech Stack

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4
- **Routing**: React Router v7
- **Visualization**: D3.js v7
- **Icons**: Lucide React
- **Code Highlighting**: React Syntax Highlighter
- **Testing**: Vitest + React Testing Library + fast-check
- **Type Checking**: TypeScript 5

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run engine tests
- `npm run test:ui` - Run UI tests
- `npm run test:watch` - Run engine tests in watch mode
- `npm run test:ui:watch` - Run UI tests in watch mode

## Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open http://localhost:5173 in your browser

### Development Workflow

- **Adding a new algorithm**: See [docs/ADDING_NEW_LAYOUTS.md](./docs/ADDING_NEW_LAYOUTS.md)
- **BaseLayout API**: See [docs/BASELAYOUT_API.md](./docs/BASELAYOUT_API.md)
- **Shared hooks**: See [src/hooks/useLayoutHooks.ts](./src/hooks/useLayoutHooks.ts)
- **Layout utilities**: See [src/utils/layoutUtils.ts](./src/utils/layoutUtils.ts)

## Testing

The project uses two separate test configurations:

- **Engine tests**: `vitest.config.js` - Node environment for ML Engine tests
- **UI tests**: `vitest.config.ui.ts` - jsdom environment for React component tests

Run all tests:
```bash
npm test          # Engine tests
npm run test:ui   # UI tests
```

## Design System

The application uses a custom Tailwind theme with the following colors:

- **Primary**: #4F46E5 (Indigo)
- **Secondary**: #14B8A6 (Teal)
- **Background**: #F9FAFB (Light gray)
- **Error**: #F97316 (Orange)
- **Success**: #22C55E (Green)

Fonts:
- **Sans**: Inter
- **Mono**: JetBrains Mono
