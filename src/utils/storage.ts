export const STORAGE_VERSION = 1;

interface StorageEnvelope<T> {
    version: number;
    data: T;
}

export function write<T>(key: string, data: T): void {
    const envelope: StorageEnvelope<T> = { version: STORAGE_VERSION, data };
    try {
        localStorage.setItem(key, JSON.stringify(envelope));
    } catch (err) {
        if (err instanceof DOMException && err.name === 'QuotaExceededError') {
            console.warn(`[storage] QuotaExceededError: could not persist key "${key}". Storage may be full.`);
        } else {
            throw err;
        }
    }
}

export function read<T>(key: string): T | null {
    const raw = localStorage.getItem(key);
    if (raw === null) return null;
    try {
        const parsed = JSON.parse(raw) as StorageEnvelope<T>;
        if (parsed.version !== STORAGE_VERSION) return null;
        return parsed.data;
    } catch {
        return null;
    }
}

export function clear(key: string): void {
    localStorage.removeItem(key);
}
