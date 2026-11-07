import { useState } from 'react';
import { useInRouterContext, useSearchParams } from 'react-router-dom';

type Props = { iteration: number; loss: number | null; learningRate: number };

export function LessonGuide(props: Props) {
    return useInRouterContext() ? <Guide {...props} /> : null;
}

function Guide({ iteration, loss, learningRate }: Props) {
    const [search, setSearch] = useSearchParams();
    const [baseline, setBaseline] = useState<{ loss: number; rate: number } | null>(null);
    const open = search.get('guide') === '1';
    const firstStepReady = iteration === 1 && loss !== null && Number.isFinite(loss);
    const canCompare = baseline && firstStepReady && learningRate !== baseline.rate;

    const toggle = () => {
        const next = new URLSearchParams(search);
        if (open) next.delete('guide');
        else next.set('guide', '1');
        setBaseline(null);
        setSearch(next, { replace: true });
    };

    return (
        <div className="mb-4">
            <button type="button" onClick={toggle} aria-expanded={open} aria-controls="linear-guide"
                className="min-h-11 rounded-md px-3 font-medium text-indigo-700 hover:bg-indigo-50">
                {open ? 'Dismiss guide' : 'Show guide'}
            </button>
            <section id="linear-guide" hidden={!open} aria-labelledby="linear-guide-title"
                className="mt-2 rounded-xl border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-950">
                <h2 id="linear-guide-title" className="mb-2 text-base font-semibold">Your first experiment</h2>
                {!baseline ? (
                    <>
                        <p>Use <strong>Step</strong> once. Compare the fitted line with the data points. The loss measures how far the predictions are from the targets.</p>
                        {iteration > 1 && <p className="mt-2">Reset training, then take one step to compare the first update.</p>}
                        {firstStepReady && (
                            <p className="mt-2" role="status">First-step loss: {loss.toPrecision(4)}</p>
                        )}
                        <button type="button" disabled={!firstStepReady}
                            onClick={() => { if (loss !== null) setBaseline({ loss, rate: learningRate }); }}
                            className="mt-2 min-h-11 rounded-md bg-indigo-700 px-3 font-medium text-white disabled:bg-gray-200 disabled:text-gray-600">
                            Compare another run
                        </button>
                    </>
                ) : (
                    <div className="space-y-2">
                        <p>In Parameters, change the learning rate from {baseline.rate}. Changing it resets training. Then use <strong>Step</strong> once again.</p>
                        {iteration > 1 && <p>Reset training and take one step to compare the same iteration.</p>}
                        {canCompare && (
                            <p role="status">
                                First-step loss: {baseline.loss.toPrecision(4)} at rate {baseline.rate} and {loss?.toPrecision(4)} at rate {learningRate}.
                            </p>
                        )}
                    </div>
                )}
            </section>
        </div>
    );
}
