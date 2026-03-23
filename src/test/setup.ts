import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'

// Cleanup after each test
afterEach(() => {
    cleanup()
})

// Mock react-syntax-highlighter to prevent it from hanging jsdom tests
vi.mock('react-syntax-highlighter', () => ({
    Light: ({ children }: any) => children,
    Prism: ({ children }: any) => children,
    default: ({ children }: any) => children,
}))
