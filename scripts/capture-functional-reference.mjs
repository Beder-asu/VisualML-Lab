import { chromium, expect as baseExpect } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
const expect = baseExpect.configure({ timeout: 30_000 });
const baseURL = 'http://127.0.0.1:4173';

const label = process.argv[2] || 'after';
if (!['before', 'after'].includes(label)) throw new Error('Use before or after');
const directory = `output/playwright/functional-review/${label}`;
await mkdir(directory, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const summary = {};
try {
    await page.goto(`${baseURL}/lesson/decisionTree`);
    await expect(page.getByLabel('Max Depth: 3')).toBeVisible();
    await page.getByLabel('Max Depth: 3').fill('1');
    await expect(page.getByText('0 / 1', { exact: true })).toBeVisible();
    await page.getByLabel('Step once (Right Arrow)').click();
    await expect(page.getByText('1 / 1', { exact: true })).toBeVisible();
    summary.treeAccuracyVisible = await page.getByText('Training Accuracy:', { exact: true }).isVisible();
    await page.screenshot({ path: `${directory}/tree-complete-desktop.png`, fullPage: true, animations: 'disabled' });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: `${directory}/tree-resized-mobile.png`, fullPage: true, animations: 'disabled' });
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.getByLabel('Max Depth: 1').fill('3');
    await expect(page.getByText('0 / 3', { exact: true })).toBeVisible();
    const diagram = page.getByRole('tree');
    await diagram.focus();
    await page.keyboard.press('ArrowRight');
    summary.treeAfterNavigation = await diagram.getAttribute('aria-label');

    await page.goto(`${baseURL}/lesson/linearRegression`);
    await expect(page.getByLabel('Max Iterations:', { exact: false })).toBeVisible();
    await page.getByLabel('Max Iterations:', { exact: false }).fill('250');
    // Wait through the documented 100 ms parameter debounce before playback.
    await page.waitForTimeout(200);
    await page.getByLabel('Training speed', { exact: true }).fill('100');
    await page.getByLabel('Play training (Spacebar)').click();
    await expect(page.getByRole('status')).toHaveAttribute('aria-label', 'Training complete at iteration 250 of 250', { timeout: 30_000 });
    summary.historyTicks = await page.locator('.x-axis-labels text').allTextContents();
    summary.historyDescription = await page.locator('.loss-curve-container').getAttribute('aria-label');
    if (label === 'after') {
        expect(summary.treeAccuracyVisible).toBe(true);
        expect(summary.treeAfterNavigation).toBe('Decision tree diagram with 1 nodes at depth 0');
        expect(summary.historyTicks[0]).toBe('51');
        expect(summary.historyTicks[summary.historyTicks.length - 1]).toBe('250');
    }
    await page.screenshot({ path: `${directory}/linear-250-desktop.png`, fullPage: true, animations: 'disabled' });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: `${directory}/linear-250-mobile.png`, fullPage: true, animations: 'disabled' });
    await writeFile(`${directory}/observations.json`, JSON.stringify(summary, null, 2));
    console.log(JSON.stringify(summary, null, 2));
} finally {
    await browser.close();
}
