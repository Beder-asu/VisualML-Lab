import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import DatasetExplorerPage from '../DatasetExplorerPage';
import type { DatasetWorkerResponse } from '../../utils/datasetCsv';

afterEach(() => vi.unstubAllGlobals());

it('ignores superseded results on replacement and clear', () => {
    const workers: FakeWorker[] = [];
    class FakeWorker {
        onmessage: ((event: { data: DatasetWorkerResponse }) => void) | null = null;
        constructor() { workers.push(this); }
        postMessage() {}
        terminate = vi.fn();
        resolve(name: string) {
            this.onmessage?.({ data: {
                dataset: { name, rows: [['3']], columns: [{ name: 'x', missing: 0, numbers: [3] }] },
            } });
        }
    }
    vi.stubGlobal('Worker', FakeWorker);
    render(<DatasetExplorerPage />);
    const chooser = screen.getByLabelText('Choose CSV', { exact: true });
    for (const name of ['old.csv', 'new.csv']) {
        fireEvent.change(chooser, { target: { files: [new File(['x\n3'], name)] } });
    }
    expect(workers[0].terminate).toHaveBeenCalledOnce();
    act(() => workers[0].resolve('old.csv'));
    expect(screen.getByRole('status')).toHaveTextContent('Reading CSV');
    act(() => workers[1].resolve('new.csv'));
    expect(screen.getByRole('status')).toHaveTextContent('new.csv');
    fireEvent.click(screen.getByRole('button', { name: 'Try sample data' }));
    fireEvent.click(screen.getByRole('button', { name: 'Clear dataset' }));
    expect(workers[2].terminate).toHaveBeenCalledOnce();
    act(() => workers[2].resolve('late.csv'));
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
});
