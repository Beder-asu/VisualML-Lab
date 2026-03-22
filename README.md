# VisualML Lab

Interactive Machine Learning Visualization Platform

## Project Structure

```
├── src/
│   ├── components/     # React components
│   ├── hooks/          # Custom React hooks
│   ├── pages/          # Page components (HomePage, LessonPage)
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions
│   ├── test/           # Test setup and utilities
│   ├── App.tsx         # Main App component with routing
│   ├── main.tsx        # Application entry point
│   └── index.css       # Global styles with Tailwind
├── engine/             # ML Engine (existing)
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
