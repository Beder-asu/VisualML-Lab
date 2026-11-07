import { useEffect, useRef, useState } from 'react';
import { DatasetPlot } from '../components/DatasetPlot';
import type { DatasetWorkerResponse, ImportedDataset } from '../utils/datasetCsv';

const sample = 'study_hours,quiz_score\n1,54\n2,62\n2.5,66\n3,64\n3.5,74\n4,76\n4.5,83\n5,85\n6,91\n7,94';
const pageSize = 25;
const previewValue = (value: string) => value.length > 160 ? value.slice(0, 160) + '…' : value;
const countLabel = (count: number, label: string) => `${count} ${label}${count === 1 ? '' : 's'}`;
type ChartKind = 'scatter' | 'histogram';

export default function DatasetExplorerPage() {
    const [dataset, setDataset] = useState<ImportedDataset | null>(null);
    const [reading, setReading] = useState(false);
    const [error, setError] = useState('');
    const [chart, setChart] = useState<ChartKind>('scatter');
    const [x, setX] = useState(0);
    const [y, setY] = useState(0);
    const [page, setPage] = useState(0);
    const activeWorker = useRef<Worker | null>(null);
    const chooser = useRef<HTMLInputElement>(null);

    useEffect(() => () => {
        activeWorker.current?.terminate();
        activeWorker.current = null;
    }, []);

    const importFile = (file: File) => {
        activeWorker.current?.terminate();
        activeWorker.current = null;
        setError('');
        setReading(true);

        try {
            const worker = new Worker(new URL('../workers/datasetCsv.worker.ts', import.meta.url), { type: 'module' });
            activeWorker.current = worker;
            const finish = (result: DatasetWorkerResponse) => {
                if (worker !== activeWorker.current) return;
                worker.terminate();
                activeWorker.current = null;
                setReading(false);
                if ('error' in result) {
                    setError(result.error);
                    return;
                }
                const numeric = result.dataset.columns.flatMap((column, index) => column.numbers ? [index] : []);
                setDataset(result.dataset);
                setPage(0);
                setChart(numeric.length >= 2 ? 'scatter' : 'histogram');
                setX(numeric[0] ?? 0);
                setY(numeric[1] ?? 0);
            };
            worker.onmessage = ({ data }: MessageEvent<DatasetWorkerResponse>) => finish(data);
            worker.onerror = worker.onmessageerror = () => finish({ error: 'Could not read this CSV. Choose the file again.' });
            worker.postMessage(file);
        } catch {
            activeWorker.current?.terminate();
            activeWorker.current = null;
            setReading(false);
            setError('Could not start the CSV reader. Reload the page and try again.');
        }
    };

    const clear = () => {
        activeWorker.current?.terminate();
        activeWorker.current = null;
        setDataset(null);
        setReading(false);
        setError('');
        chooser.current?.focus();
    };

    const numeric = dataset?.columns.flatMap((column, index) => column.numbers ? [{ column, index }] : []) ?? [];
    const pageCount = dataset ? Math.ceil(dataset.rows.length / pageSize) : 0;
    const fieldClass = 'min-h-11 w-full min-w-0 rounded-md border border-gray-300 bg-white px-2 text-sm';

    return (
        <div className="mx-auto max-w-6xl space-y-6 px-4 py-7 text-gray-900 sm:px-8">
            <header>
                <h1 className="text-3xl font-bold tracking-tight">Dataset Explorer</h1>
                <p className="mt-2 max-w-2xl text-gray-700">Inspect a CSV and plot relationships or distributions in your own data.</p>
            </header>
            <section aria-labelledby="import-heading" className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
                <h2 id="import-heading" className="text-lg font-semibold">Import a dataset</h2>
                <p id="import-limits" className="mt-1 text-sm text-gray-700">UTF-8 CSV with column headers. Up to 2 MB, 10,000 data rows, and 50 columns.</p>
                <p className="mt-1 text-sm text-gray-700">Your file stays in this browser tab. Reimport it after leaving or reloading this page.</p>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                    <input ref={chooser} type="file" accept=".csv,text/csv" aria-label="Choose CSV" aria-describedby="import-limits"
                        className="max-w-full text-sm file:mr-2 file:min-h-11 file:rounded-md file:border-0 file:bg-indigo-700 file:px-3 file:font-medium file:text-white"
                        onChange={event => {
                            const file = event.currentTarget.files?.[0];
                            event.currentTarget.value = '';
                            if (file) importFile(file);
                        }} />
                    <button type="button" className="min-h-11 rounded-md px-2 font-medium text-indigo-800 hover:bg-indigo-50"
                        onClick={() => importFile(new File([sample], 'Study time sample.csv', { type: 'text/csv' }))}>
                        Try sample data
                    </button>
                    {(dataset || reading || error) && <button type="button" onClick={clear} className="min-h-11 rounded-md px-2 text-sm font-medium text-gray-700 underline">Clear dataset</button>}
                </div>
                <div role="status" className="mt-2 break-words text-sm text-gray-700">
                    {reading ? 'Reading CSV…' : dataset
                        ? `${dataset.name} · ${countLabel(dataset.rows.length, 'row')} · ${countLabel(dataset.columns.length, 'column')}`
                        : 'Choose a file or try the sample to begin.'}
                </div>
                {error && <p role="alert" className="mt-2 rounded-md bg-red-50 p-3 text-sm text-red-900">{error}</p>}
            </section>
            {dataset && (
                <>
                    <section aria-labelledby="preview-heading" className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
                        <h2 id="preview-heading" className="text-lg font-semibold">Data preview</h2>
                        <p className="mb-3 mt-1 text-xs text-gray-700">Long cells are shortened to 160 characters in the preview.</p>
                        <div tabIndex={0} role="region" aria-label="Scrollable CSV preview" className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <caption className="sr-only">CSV rows. A dash indicates a blank cell.</caption>
                                <thead className="bg-gray-50">
                                    <tr><th scope="col" className="p-2">Row</th>
                                        {dataset.columns.map(column => (
                                            <th scope="col" key={column.name} className="max-w-48 min-w-24 break-words p-2">
                                                {column.name}
                                                <span className="block text-xs font-normal text-gray-700">{column.numbers ? 'Numeric' : 'Text'} · {column.missing} blank</span>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {dataset.rows.slice(page * pageSize, (page + 1) * pageSize).map((row, i) => (
                                        <tr key={page * pageSize + i} className="border-b border-gray-100">
                                            <th scope="row" className="p-2 font-normal text-gray-600">{page * pageSize + i + 1}</th>
                                            {row.map((value, j) => <td key={j} className="max-w-48 min-w-24 break-words p-2">{value.trim() ? previewValue(value) : '—'}</td>)}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {pageCount > 1 && <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                            <button type="button" onClick={() => setPage(page - 1)} disabled={page === 0} className="min-h-11 rounded-md border border-gray-300 px-3 disabled:opacity-50">Previous</button>
                            <span aria-live="polite">Page {page + 1} of {pageCount}</span>
                            <button type="button" onClick={() => setPage(page + 1)} disabled={page === pageCount - 1} className="min-h-11 rounded-md border border-gray-300 px-3 disabled:opacity-50">Next</button>
                        </div>}
                    </section>
                    <section aria-labelledby="plot-heading" className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
                        <h2 id="plot-heading" className="mb-3 text-lg font-semibold">Plot columns</h2>
                        {numeric.length === 0 ? (
                            <p className="text-sm text-gray-700">This file has no numeric columns. A histogram needs one numeric column and a scatter plot needs two.</p>
                        ) : (
                            <>
                                <div className="mb-5 grid gap-3 sm:grid-cols-3">
                                    <label className="min-w-0 text-sm font-medium">Chart type
                                        <select className={fieldClass} value={chart} onChange={event => setChart(event.target.value as ChartKind)}>
                                            <option value="scatter" disabled={numeric.length < 2}>Scatter plot</option>
                                            <option value="histogram">Histogram</option>
                                        </select>
                                    </label>
                                    <label className="min-w-0 text-sm font-medium">{chart === 'scatter' ? 'X column' : 'Numeric column'}
                                        <select className={fieldClass} value={x} onChange={event => {
                                            const next = Number(event.target.value);
                                            if (next === y) setY(x);
                                            setX(next);
                                        }}>
                                            {numeric.map(({ column, index }) => <option value={index} key={index}>{column.name}</option>)}
                                        </select>
                                    </label>
                                    {chart === 'scatter' && <label className="min-w-0 text-sm font-medium">Y column
                                        <select className={fieldClass} value={y} onChange={event => setY(Number(event.target.value))}>
                                            {numeric.filter(entry => entry.index !== x).map(({ column, index }) => <option value={index} key={index}>{column.name}</option>)}
                                        </select>
                                    </label>}
                                </div>
                                <DatasetPlot x={dataset.columns[x]} y={chart === 'scatter' ? dataset.columns[y] : undefined} rowCount={dataset.rows.length} />
                            </>
                        )}
                    </section>
                </>
            )}
        </div>
    );
}
