import { expect, test } from '@playwright/test';

test('a learner can configure and step through a decision tree', async ({ page }) => {
    await page.goto('/lesson/decisionTree');

    const maxDepth = page.getByLabel('Max Depth: 3');
    // The first lesson request compiles a lazy-loaded route in local Vite dev mode.
    await expect(maxDepth).toBeVisible({ timeout: 30_000 });
    await maxDepth.fill('4');
    await expect(page.getByLabel('Max Depth: 4')).toHaveAttribute('aria-valuenow', '4');
    await expect(page.getByText('0 / 4', { exact: true })).toBeVisible();

    await expect(page.getByLabel('Decision tree diagram with 1 nodes at depth 0')).toBeVisible();
    await page.getByLabel('Step once (Right Arrow)').click();

    await expect(page.getByLabel('Decision tree diagram with 3 nodes at depth 1')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByLabel(/Decision regions showing .* 2 regions at depth 1/)).toBeVisible();
});
