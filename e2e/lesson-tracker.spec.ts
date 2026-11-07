import { expect, test } from '@playwright/test';

test('starts a lesson, tracks progress across reload, and clears it on confirmation', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Start first lesson' }).click();
    await expect(page.getByRole('heading', { name: 'Linear Regression', level: 1 })).toBeVisible();
    await page.getByRole('button', { name: 'Mark lesson complete' }).click();
    await page.goto('/');
    await expect(page.getByText('1 of 4 lessons complete')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Start next lesson' })).toHaveAttribute('href', '/lesson/logisticRegression');
    await page.reload();
    await expect(page.getByText('1 of 4 lessons complete')).toBeVisible();
    await page.getByRole('link', { name: /^Linear Regression Learn/ }).click();
    await page.getByRole('button', { name: 'Undo completion' }).click();
    await page.goto('/');
    await expect(page.getByRole('link', { name: 'Continue Linear Regression' })).toBeVisible();
    await page.getByRole('button', { name: 'Clear lesson progress' }).click();
    await page.getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect(page.getByRole('link', { name: 'Continue Linear Regression' })).toBeVisible();
    await page.getByRole('button', { name: 'Clear lesson progress' }).click();
    await page.getByRole('button', { name: 'Clear progress', exact: true }).click();
    await page.reload();
    await expect(page.getByRole('link', { name: 'Start first lesson' })).toBeVisible();
});

test('guide waits for training and compares two first-step losses', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Start guided lesson' }).click();
    const guide = page.getByRole('region', { name: 'Your first experiment' });
    const compare = guide.getByRole('button', { name: 'Compare another run' });
    const step = page.getByRole('button', { name: 'Step once (Right Arrow)' });
    const status = page.locator('#visualization-area').getByRole('status');
    await expect(compare).toBeDisabled();
    await step.click();
    await expect(compare).toBeEnabled();
    await compare.click();
    await page.getByRole('slider', { name: /Learning Rate:/ }).fill('0.1');
    await expect(status).toHaveAccessibleName('Ready to train');
    await step.click();
    await expect(guide.getByRole('status')).toContainText(/at rate 0\.01 and .* at rate 0\.1/);
    await page.getByRole('button', { name: 'Dismiss guide' }).click();
    await expect(guide).toBeHidden();
    await page.getByRole('button', { name: 'Show guide' }).click();
    await expect(status).toHaveAccessibleName('Paused at iteration 1 of 100');
});

test('invalid storage recovers and blocked writes keep progress for the current session', async ({ page }) => {
    await page.addInitScript(() => {
        const write = Storage.prototype.setItem;
        write.call(localStorage, 'visualml:lesson-progress', '{invalid');
        Storage.prototype.setItem = function (key, value) {
            if (key === 'visualml:lesson-progress') throw new DOMException('Blocked', 'QuotaExceededError');
            write.call(this, key, value);
        };
    });
    await page.goto('/lesson/svm');
    await expect(page.getByText(/available for this session/)).toBeVisible();
    await page.getByRole('button', { name: 'Mark lesson complete' }).click();
    await page.getByRole('link', { name: 'VisualML Lab', exact: true }).click();
    await expect(page.getByText('1 of 4 lessons complete')).toBeVisible();
    await page.reload();
    await expect(page.getByText('0 of 4 lessons complete')).toBeVisible();
});

test('lesson playback and skip link are reachable on a narrow first screen', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await expect(page.getByRole('link', { name: 'Start first lesson' })).toBeInViewport();
    for (const lesson of ['linearRegression', 'logisticRegression', 'svm', 'decisionTree']) {
        await page.goto('/lesson/' + lesson);
        await expect(page.getByRole('button', { name: 'Step once (Right Arrow)' })).toBeInViewport();
        await expect(page.getByRole('main')).toHaveCount(1);
        await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
        await page.keyboard.press('Tab');
        await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused();
        await page.keyboard.press('Enter');
        await expect(page.getByRole('main')).toBeFocused();
        await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
});
