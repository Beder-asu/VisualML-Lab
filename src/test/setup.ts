import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'

// Cleanup after each test
afterEach(() => {
    cleanup()
})

// Mock Worker for jsdom environment
class MockWorker {
    onmessage: ((event: MessageEvent) => void) | null = null;
    onerror: ((event: ErrorEvent) => void) | null = null;

    constructor(public url: string | URL) { }

    postMessage(_message: any) {
        // Mock implementation - does nothing
    }

    terminate() {
        // Mock implementation - does nothing
    }
}

// @ts-ignore
global.Worker = MockWorker;

// Mock react-syntax-highlighter to prevent it from hanging jsdom tests
vi.mock('react-syntax-highlighter', () => ({
    Light: ({ children }: any) => children,
    Prism: ({ children }: any) => children,
    default: ({ children }: any) => children,
}))
