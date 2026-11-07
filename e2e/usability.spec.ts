import { expect, test, type Page } from '@playwright/test';
import { loadDataset } from '../engine/datasets.js';

const sizes = [320, 390, 768, 1024, 1440];
const scatter = (page: Page) => page.getByRole('img', { name: /^2D visualization/ }).locator('canvas').last();

for (const algorithm of ['linearRegression', 'logisticRegression', 'svm']) {
    test(`${algorithm} plots fit the lesson at each viewport`, async ({ page }) => {
        await page.goto(`/lesson/${algorithm}`);
        await page.getByLabel('Step once (Right Arrow)').click();
        await expect(page.getByRole('status')).toHaveAttribute('aria-label', 'Paused at iteration 1 of 100');
        for (const width of sizes) {
            await page.setViewportSize({ width, height: 900 });
            await expect.poll(() => page.evaluate(() => {
                const model = document.querySelector<HTMLCanvasElement>('#visualization-area canvas:last-of-type');
                const loss = document.querySelector<SVGSVGElement>('.loss-curve-container svg');
                const modelFrame = model?.parentElement?.parentElement;
                const lossFrame = loss?.parentElement?.parentElement;
                return {
                    overflow: Math.max(0, document.documentElement.scrollWidth - innerWidth),
                    modelWidth: model?.width,
                    modelFrameWidth: modelFrame?.clientWidth,
                    lossWidth: loss ? Number(loss.getAttribute('width')) : undefined,
                    lossFrameWidth: lossFrame?.clientWidth,
                };
            }).then(({ overflow, modelWidth, modelFrameWidth, lossWidth, lossFrameWidth }) => ({
                overflow,
                modelFits: !!modelWidth && modelWidth === modelFrameWidth && modelWidth <= 400,
                lossFits: !!lossWidth && lossWidth === lossFrameWidth && lossWidth <= 400,
            })), { message: `charts fit at ${width}px` }).toEqual({ overflow: 0, modelFits: true, lossFits: true });
            await expect(page.locator('.loss-points circle')).toHaveCount(1);
        }
    });
}

test('tablet navigation fits with wider text and can change lessons', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 900 });
    await page.goto('/lesson/linearRegression');
    await page.evaluate(() => { document.documentElement.style.fontSize = '18px'; });
    const menu = page.getByRole('button', { name: 'Toggle mobile menu' });
    await expect(menu).toBeVisible();
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await menu.click();
    await expect(menu).toHaveAttribute('aria-expanded', 'true');
    await page.locator('header').getByRole('link', { name: 'SVM' }).click();
    await expect(page).toHaveURL(/\/lesson\/svm$/);
    await expect(menu).toHaveAttribute('aria-expanded', 'false');
});

test('logistic visualization modes fit and render at 320px', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 900 });
    await page.goto('/lesson/logisticRegression');
    const selector = page.getByRole('combobox', { name: 'Visualization view' });
    await expect(selector).toHaveValue('scatter');
    await expect(scatter(page)).toBeVisible();
    await selector.selectOption('heatmap');
    await expect.poll(() => scatter(page).evaluate(element => {
        const canvas = element as HTMLCanvasElement;
        return canvas.getContext('2d')!.getImageData(0, 0, 1, 1).data[3];
    })).toBeGreaterThan(0);
    await selector.selectOption('sigmoid');
    await expect(page.getByRole('heading', { name: 'Sigmoid Concept Curve' })).toBeVisible();
    await expect(page.locator('.sigmoid-curve-container svg path')).toBeVisible();
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('resized scatter hit testing tracks the same point', async ({ page }) => {
    await page.goto('/lesson/linearRegression');
    await page.getByLabel('Step once (Right Arrow)').click();
    const canvas = scatter(page);
    const data = loadDataset('linear');
    const index = data.X.findIndex(([x]) => x === 0);
    for (const viewport of [1440, 390]) {
        await page.setViewportSize({ width: viewport, height: 900 });
        await expect.poll(() => canvas.evaluate(element => {
            const c = element as HTMLCanvasElement;
            return c.width === c.parentElement?.parentElement?.clientWidth && c.width > 0;
        })).toBe(true);
        await canvas.scrollIntoViewIfNeeded();
        const box = (await canvas.boundingBox())!;
        await page.mouse.move(box.x + 60, box.y + box.height - 60 - data.y[index] * (box.height - 80));
        const tooltip = page.locator('[role="tooltip"]');
        await expect(tooltip).toContainText(data.y[index].toFixed(3));
        const tip = (await tooltip.boundingBox())!;
        expect(tip.x).toBeGreaterThanOrEqual(box.x - 1);
        expect(tip.x + tip.width).toBeLessThanOrEqual(box.x + box.width + 1);
        await expect(page.getByRole('status')).toHaveAttribute('aria-label', 'Paused at iteration 1 of 100');
    }
});

test('Help restores the opener and tree navigation exposes an active node', async ({ page }) => {
    await page.goto('/lesson/decisionTree');
    const step = page.getByLabel('Step once (Right Arrow)');
    await step.focus();
    await page.keyboard.press('?');
    await expect(page.getByRole('button', { name: 'Close help modal' })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(step).toBeFocused();
    await step.click();

    const tree = page.getByRole('tree');
    await expect(tree).toHaveAttribute('aria-label', /3 nodes at depth 1/);
    await tree.focus();
    const root = await tree.getAttribute('aria-activedescendant');
    await page.keyboard.press('ArrowDown');
    const leaf = tree.getByRole('treeitem', { selected: true });
    await expect(leaf).toHaveAccessibleName(/Leaf node/);
    await expect(tree).toHaveAttribute('aria-activedescendant', (await leaf.getAttribute('id'))!);
    await expect(tree).toBeFocused();
    await expect(tree).toHaveAttribute('aria-label', /3 nodes at depth 1/);
    await page.keyboard.press('r');
    await expect(tree).toHaveAttribute('aria-activedescendant', root!);
    await expect(tree.getByRole('treeitem')).toHaveCount(1);
});

test('reduced motion keeps the network still and the tree visible', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const background = page.locator('canvas').first();
    await expect(background).toBeVisible();
    expect(await background.evaluate(async element => {
        const canvas = element as HTMLCanvasElement;
        const frame = canvas.toDataURL();
        for (let i = 0; i < 5; i++) await new Promise(resolve => requestAnimationFrame(resolve));
        return frame === canvas.toDataURL();
    })).toBe(true);
    await page.goto('/lesson/decisionTree');
    await page.getByLabel('Step once (Right Arrow)').click();
    const tree = page.getByRole('tree');
    await expect(tree.getByRole('treeitem')).toHaveCount(3);
    await expect(tree.locator('.tree-node').first()).toHaveCSS('animation-name', 'none');
    await expect(tree.locator('.tree-edge path').first()).toHaveCSS('stroke-dashoffset', '0px');
});
