import { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { HelpModal } from '../HelpModal';

function LessonHelp() {
    const [open, setOpen] = useState(false);
    return <>
        <button onClick={() => setOpen(true)}>Open Help</button>
        <HelpModal isOpen={open} onClose={() => setOpen(false)} />
    </>;
}

describe('Help focus restoration', () => {
    it.each(['Escape', 'Close help modal', 'Got it'])('restores focus after %s', close => {
        render(<LessonHelp />);
        const opener = screen.getByRole('button', { name: 'Open Help' });
        opener.focus();
        fireEvent.click(opener);
        expect(screen.getByRole('button', { name: 'Close help modal' })).toHaveFocus();

        if (close === 'Escape') fireEvent.keyDown(window, { key: 'Escape' });
        else fireEvent.click(screen.getByRole('button', { name: close }));

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(opener).toHaveFocus();
    });
});
