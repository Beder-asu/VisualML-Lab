// UI State Types

export interface TrainingState {
    engineState: any | null;  // Will be typed from ML Engine
    lossHistory: number[];
    isPlaying: boolean;
    isPaused: boolean;
    isConverged: boolean;
    error: string | null;
}

export interface TrainingControls {
    play: () => void;
    pause: () => void;
    step: () => void;
    reset: () => void;
    updateParams: (newParams: any) => void;
    changeDataset: (datasetName: string) => void;
    clearError: () => void;
}

export interface UIState {
    // Training state
    engineState: any | null;
    lossHistory: number[];

    // Playback state
    isPlaying: boolean;
    isPaused: boolean;
    isConverged: boolean;

    // Configuration
    algorithm: string;
    dataset: string;
    params: any;

    // UI state
    codePanelExpanded: boolean;
    error: string | null;

    // Animation
    animationSpeed: number; // ms per step
}

export interface VisualizationConfig {
    canvasWidth: number;
    canvasHeight: number;
    margin: { top: number; right: number; bottom: number; left: number };
    pointRadius: number;
    lineWidth: number;
    gridColor: string;
    dataColors: {
        class0: string;
        class1: string;
        regression: string;
    };
}
