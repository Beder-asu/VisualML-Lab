import { describe, it, expect, beforeEach, vi } from 'vitest';
import { write, read, clear, STORAGE_VERSION } from '../storage';

beforeEach(() => {
    localStorage.clear();
});

describe('storage utility', () => {
    it('write then read round-trip returns the original value', () => {
        write('test-key', { name: 'hello', count: 42 });
        const result = read<{ name: string; count: number }>('test-key');
        expect(result).toEqual({ name: 'hello', count: 42 });
    });

    it('stale version returns null', () => {
        const stale = { version: STORAGE_VERSION - 1, data: { foo: 'bar' } };
        localStorage.setItem('stale-key', JSON.stringify(stale));
        expect(read('stale-key')).toBeNull();
    });

    it('corrupt JSON returns null', () => {
        localStorage.setItem('corrupt-key', 'not valid json {{{');
        expect(read('corrupt-key')).toBeNull();
    });

    it('missing key returns null', () => {
        expect(read('nonexistent-key')).toBeNull();
    });

    it('clear removes the key', () => {
        write('to-clear', 123);
        clear('to-clear');
        expect(read('to-clear')).toBeNull();
    });

    it('write() does not throw when localStorage is full (QuotaExceededError)', () => {
        const quota = new DOMException('QuotaExceededError', 'QuotaExceededError');
        const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw quota; });
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

        expect(() => write('overflow-key', { big: 'data' })).not.toThrow();
        expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('QuotaExceededError'));

        spy.mockRestore();
        warnSpy.mockRestore();
    });
});
