import { expect, test } from '@playwright/test';

test('depth-limited tree completion exposes real training accuracy', async ({ page }) => {
    await page.goto('/lesson/decisionTree');
    await page.getByLabel('Max Depth: 3').fill('1');
    await expect(page.getByText('0 / 1', { exact: true })).toBeVisible();
    await page.getByLabel('Step once (Right Arrow)').click();
    await expect(page.getByRole('status')).toHaveAttribute('aria-label', 'Training complete at depth 1 of 1');
    await expect(page.getByText('Training Accuracy:', { exact: true })).toBeVisible();
    // The default root split classifies 138 of the 150 embedded samples correctly.
    await expect(page.getByText('92.0%', { exact: true })).toBeVisible();
});

test('tree navigation keys do not advance or start training', async ({ page }) => {
    await page.goto('/lesson/decisionTree');
    const tree = page.getByRole('tree');
    await tree.focus();
    await page.keyboard.press('ArrowRight');
    await expect(tree).toHaveAttribute('aria-label', 'Decision tree diagram with 1 nodes at depth 0');
    await expect(page.getByRole('treeitem')).toHaveCount(1);
    await page.keyboard.press('Space');
    await expect(page.getByLabel('Play training (Spacebar)')).toBeEnabled();
    await expect(page.getByRole('status')).toHaveAttribute('aria-label', 'Ready to build');
});

test('resizing a paused region canvas redraws the expanded plotting area', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/lesson/decisionTree');
    await page.getByLabel('Step once (Right Arrow)').click();
    const region = page.getByRole('img', { name: /Decision regions showing/ });
    await expect(region).toHaveAttribute('aria-label', /at depth 1$/);
    const canvas = region.locator('canvas');
    const initialWidth = await canvas.evaluate(element => element.width);
    await page.setViewportSize({ width: 1440, height: 1000 });
    await expect.poll(() => canvas.evaluate(element => element.width)).toBeGreaterThan(initialWidth);
    await expect.poll(() => canvas.evaluate(element =>
        element.getContext('2d')!.getImageData(element.width - 25, 25, 1, 1).data[3]
    )).toBeGreaterThan(0);
    await expect(region).toHaveAttribute('aria-label', /at depth 1$/);
});

for (const algorithm of ['linearRegression', 'logisticRegression', 'svm']) {
    test(`${algorithm} trains through the real bundled worker and resets`, async ({ page }) => {
        await page.goto(`/lesson/${algorithm}`);
        await page.getByLabel('Step once (Right Arrow)').click();
        await expect(page.getByRole('status')).toHaveAttribute('aria-label', 'Paused at iteration 1 of 100');
        await expect(page.locator('.loss-points circle')).toHaveCount(1);
        await page.getByLabel('Max Iterations:', { exact: false }).fill('10');
        await expect(page.getByRole('status')).toHaveAttribute('aria-label', 'Ready to train');
        await page.getByLabel('Training speed', { exact: true }).fill('100');
        await page.getByLabel('Play training (Spacebar)').click();
        await expect(page.getByRole('status')).toHaveAttribute('aria-label', 'Training complete at iteration 10 of 10');
        await expect(page.locator('.loss-points circle')).toHaveCount(10);
        await page.getByLabel('Reset training (R key)').click();
        await expect(page.getByRole('status')).toHaveAttribute('aria-label', 'Ready to train');
        await expect(page.locator('.loss-points circle')).toHaveCount(0);
    });
}

test('a 250-step real-worker run retains actual history iteration labels', async ({ page }) => {
    await page.goto('/lesson/linearRegression');
    await page.getByLabel('Step once (Right Arrow)').click();
    await expect(page.getByRole('status')).toHaveAttribute('aria-label', 'Paused at iteration 1 of 100');
    await page.getByLabel('Max Iterations:', { exact: false }).fill('250');
    await expect(page.getByRole('status')).toHaveAttribute('aria-label', 'Ready to train');
    await page.getByLabel('Training speed', { exact: true }).fill('100');
    await page.getByLabel('Play training (Spacebar)').click();
    await expect(page.getByRole('status')).toHaveAttribute('aria-label', 'Training complete at iteration 250 of 250', { timeout: 20_000 });
    const ticks = page.locator('.x-axis-labels text');
    await expect(ticks.first()).toHaveText('51');
    await expect(ticks.last()).toHaveText('250');
    await expect(page.locator('.loss-points circle')).toHaveCount(200);
    await expect(page.locator('.loss-curve-container')).toHaveAttribute('aria-label', /iterations 51–250/);
});
