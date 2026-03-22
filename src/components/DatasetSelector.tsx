/**
 * DatasetSelector.tsx — Dataset selection dropdown
 * 
 * Allows users to select different datasets for experimentation.
 * Requirements: 7.1, 7.2, 7.4, 7.5
 */

interface DatasetSelectorProps {
    currentDataset: string;
    availableDatasets: string[];
    isPlaying: boolean;
    onDatasetChange: (dataset: string) => void;
    onPause?: () => void;
}

interface DatasetInfo {
    name: string;
    displayName: string;
    description: string;
}

/**
 * Get display information for datasets
 */
function getDatasetInfo(name: string): DatasetInfo {
    const datasetMap: Record<string, DatasetInfo> = {
        'iris-2d': {
            name: 'iris-2d',
            displayName: 'Iris 2D',
            description: 'Binary classification: Setosa vs. Non-Setosa',
        },
        'blobs': {
            name: 'blobs',
            displayName: 'Blobs',
            description: 'Two-cluster synthetic data',
        },
        'linear': {
            name: 'linear',
            displayName: 'Linear',
            description: 'Linear regression with noise',
        },
    };

    return datasetMap[name] || {
        name,
        displayName: name,
        description: 'Unknown dataset',
    };
}

export function DatasetSelector({
    currentDataset,
    availableDatasets,
    isPlaying,
    onDatasetChange,
    onPause,
}: DatasetSelectorProps) {
    /**
     * Handle dataset change with pause-before-change logic
     * Requirements: 7.2, 7.4
     */
    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newDataset = event.target.value;

        if (newDataset === currentDataset) {
            return;
        }

        // Pause if playing (Requirements 7.4)
        if (isPlaying && onPause) {
            onPause();
        }

        // Trigger dataset change
        onDatasetChange(newDataset);
    };

    return (
        <div
            className="space-y-2 p-4 bg-white rounded-lg shadow-sm border border-gray-200"
            role="group"
            aria-labelledby="dataset-selector-label"
        >
            <label
                id="dataset-selector-label"
                htmlFor="dataset-selector"
                className="block text-sm font-semibold text-gray-700 uppercase tracking-wide"
            >
                Dataset
            </label>
            <select
                id="dataset-selector"
                value={currentDataset}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                aria-describedby="dataset-current-info"
            >
                {availableDatasets.map((datasetName) => {
                    const info = getDatasetInfo(datasetName);
                    return (
                        <option key={datasetName} value={datasetName}>
                            {info.displayName} — {info.description}
                        </option>
                    );
                })}
            </select>
            {/* Display current dataset info */}
            <div
                id="dataset-current-info"
                className="text-xs text-gray-500 mt-1"
                aria-live="polite"
            >
                Currently selected: <span className="font-medium text-gray-700">{getDatasetInfo(currentDataset).displayName}</span>
            </div>
        </div>
    );
}
