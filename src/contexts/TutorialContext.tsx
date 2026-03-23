// @ts-nocheck
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Joyride, Step, STATUS, EVENTS, ACTIONS } from 'react-joyride';
import { useNavigate, useLocation } from 'react-router-dom';

interface TutorialContextType {
    startTutorial: () => void;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

export const useTutorial = () => {
    const context = useContext(TutorialContext);
    if (!context) throw new Error('useTutorial must be used within TutorialProvider');
    return context;
};

export const TutorialProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [run, setRun] = useState(false);
    const [stepIndex, setStepIndex] = useState(0);
    const navigate = useNavigate();
    const location = useLocation();

    // @ts-ignore - Bypass strict type-checking for Joyride v2 options missing from local types
    const steps: Step[] = [
        {
            target: 'h1', // Center the first step on the screen
            content: 'Welcome to VisualML Lab! Start by choosing a model to explore. We will use Linear Regression as an example to begin learning.',
            placement: 'bottom',
            skipBeacon: true, // Important: immediately show the tooltip overlay, don't wait for click
            overlayClickAction: false,
        },
        {
            target: '#concept-panel',
            content: 'Read the underlying mathematical theory and equations powering the algorithm here.',
            placement: 'right',
        },
        {
            target: '#concept-panel', // Target the same visual panel, but we will shift it to the Code View programmatically
            content: 'Learn about the actual code structure here! You can seamlessly switch between mathematical theory and the raw Python or JavaScript implementations behind it.',
            placement: 'right',
        },
        {
            target: '#parameter-controls',
            content: 'Tune hyperparameters like the Learning Rate on the fly! Watch what happens to the feedback warning when we intentionally set the learning rate dangerously high...',
            placement: 'left',
        },
        {
            target: '#playback-controls',
            content: 'Control the flow of time! Play, pause, or step through the training manually. (Pro tip: hold Spacebar to fast forward!)',
            placement: 'top',
        },
        {
            target: '#visualization-panel',
            content: 'Watch the decision boundaries adapt and the loss curve drop in real-time. Try hovering over the data points to view their exact coordinates.',
            placement: 'left',
        },
        {
            target: '#main-navbar',
            content: 'Ready to explore other models? You can easily pivot to Logistic Regression or SVM at any time from the navigation bar.',
            placement: 'bottom',
        },
        {
            target: '#main-footer',
            content: 'That completes the tour! Follow the repository and keep updated on new algorithms and features. Happy learning!',
            placement: 'top',
        }
    ];

    const handleJoyrideCallback = (data: any) => {
        const { action, index, status, lifecycle } = data;

        // V3 provides State objects with { from, to } instead of strings
        const actionTo = action?.to || action;
        const statusTo = status?.to || status;
        const lifecycleTo = lifecycle?.to || lifecycle;

        // Ensure tutorial ends gracefully
        if (['finished', 'skipped'].includes(statusTo) || actionTo === 'close') {
            setRun(false);
            setStepIndex(0);
            return;
        }

        // V3 uses lifecycle 'complete' to signify a step completion
        if (lifecycleTo === 'complete') {
            let nextStepIndex = index + (actionTo === 'prev' ? -1 : 1);

            // Forward Navigation Automations
            if (actionTo === 'next') {
                if (index === 0) {
                    // Navigate to the lesson page
                    navigate('/lesson/linearRegression');

                    // Delay setting the next step to give LessonPage time to mount its targets
                    setTimeout(() => {
                        setStepIndex(1);
                    }, 600);

                    return; // Return early so we don't setStepIndex synchronously
                } else if (index === 1) {
                    // Transitioning to Step 2 (Code Structure): Programmatically click the Python Tab
                    const pythonBtn = document.querySelector('button[title="Python Implementation"]') as HTMLButtonElement | null;
                    if (pythonBtn) pythonBtn.click();
                } else if (index === 2) {
                    // Transitioning to Step 3 (Parameter Controls): Cleanup Concept tab
                    const conceptBtn = document.querySelector('button[title="Concept Explanation"]') as HTMLButtonElement | null;
                    if (conceptBtn) conceptBtn.click();
                } else if (index === 3) {
                    // Transitioning from Controls to Step 4 (Playback): Auto-shift the slider
                    const lrInput = document.querySelector('input[type="range"]') as HTMLInputElement | null;
                    if (lrInput) {
                        try {
                            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
                            if (nativeInputValueSetter) {
                                nativeInputValueSetter.call(lrInput, "2.00"); // Set to dangerous value
                                const ev1 = new Event('input', { bubbles: true });
                                const ev2 = new Event('change', { bubbles: true });
                                lrInput.dispatchEvent(ev1);
                                lrInput.dispatchEvent(ev2);
                            }
                        } catch (e) {
                            console.error("Joyride slider hijack failed:", e);
                        }
                    }
                }
            }

            // Backward Navigation Reversal
            if (actionTo === 'prev') {
                if (index === 1) {
                    navigate('/'); // Go back to home
                    nextStepIndex = 0;
                }
            }

            setStepIndex(nextStepIndex);
        }
    };

    // Passive Listener: if user clicks the targeted algorithm card organically, route changes -> advance step automatically
    useEffect(() => {
        if (run && location.pathname.includes('/lesson/') && stepIndex === 0) {
            // Wait slightly for DOM to mount targets on the new LessonPage
            setTimeout(() => {
                setStepIndex(1);
            }, 600);
        }
    }, [location.pathname]);

    return (
        <TutorialContext.Provider value={{
            startTutorial: () => {
                setRun(true);
                setStepIndex(0);
                if (location.pathname !== '/') {
                    navigate('/');
                }
            }
        }}>
            <Joyride
                steps={steps}
                run={run}
                debug={true}
                stepIndex={stepIndex}
                onEvent={handleJoyrideCallback}
                continuous={true}
                showProgress={true}
                locale={{ last: 'Finish Tour' }}
                styles={{
                    options: {
                        primaryColor: '#4f46e5', // Theme indigo
                        textColor: '#1f2937',
                        zIndex: 10000,
                    },
                    tooltipContainer: {
                        textAlign: 'left'
                    }
                }}
            />
            {children}
        </TutorialContext.Provider>
    );
};
