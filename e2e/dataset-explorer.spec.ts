import { expect, test, type Page } from '@playwright/test';

const upload = (page: Page, name: string, text: string | Buffer) =>
    page.getByLabel('Choose CSV', { exact: true }).setInputFiles({
        name, mimeType: 'text/csv', buffer: Buffer.from(text),
    });

test('imports local CSV through the worker, plots original columns, and keeps a valid dataset on error', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const uploadRequests: string[] = [];
    page.on('request', request => {
        if (request.method() !== 'GET' || request.url().includes('private.csv')) uploadRequests.push(request.url());
    });
    await page.goto('/dataset-explorer');
    await upload(page, 'private.csv', 'distance,time,label\n1000,4,"A,B"\n2000,,C\n3000,7,D');
    await expect(page.getByRole('status')).toContainText('private.csv · 3 rows · 3 columns');
    await expect(page.getByRole('cell', { name: 'A,B', exact: true })).toBeVisible();
    await page.getByRole('link', { name: 'Jump to plot' }).click();
    await expect(page.getByRole('region', { name: 'Plot columns' })).toBeFocused();
    await expect(page.getByText('2 of 3 rows plotted. 1 excluded for missing values.')).toBeVisible();
    await expect(page.getByText('X axis: distance. Y axis: time.')).toBeVisible();
    await expect(page.getByText('3,000', { exact: true })).toBeVisible();
    await page.getByLabel('Chart type').selectOption('histogram');
    await expect(page.getByText('3 of 3 rows plotted. 0 excluded for missing values.')).toBeVisible();
    await upload(page, 'broken.csv', 'x,y\n1');
    await expect(page.getByRole('alert')).toContainText('CSV record 2');
    await expect(page.getByRole('status')).toContainText('private.csv');
    await upload(page, 'large.csv', Buffer.alloc(2 * 1024 * 1024 + 1, 'x'));
    await expect(page.getByRole('alert')).toContainText('2 MB');
    await expect(page.getByRole('status')).toContainText('private.csv');
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(uploadRequests).toEqual([]);
    expect(await page.evaluate(() => JSON.stringify({ ...localStorage, ...sessionStorage }))).not.toContain('private.csv');
    const largest = Buffer.alloc(2 * 1024 * 1024, 'x');
    largest.write('label\n');
    await upload(page, 'limit.csv', largest);
    await expect(page.getByRole('status')).toContainText('limit.csv · 1 row · 1 column');
    await expect(page.getByRole('cell', { name: 'x'.repeat(160) + '…', exact: true })).toBeVisible();
    await page.reload();
    await expect(page.getByRole('status')).toContainText('Choose a file or try the sample');
});

test('paginates text-only data and clears the workspace', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 844 });
    await page.goto('/dataset-explorer');
    await page.getByRole('button', { name: 'Try sample data' }).click();
    await expect(page.getByRole('status')).toContainText('Study time sample.csv');
    await upload(page, 'labels.csv', 'label\n' + Array.from({ length: 26 }, (_, i) => 'label-' + (i + 1)).join('\n'));
    await expect(page.getByText(/no numeric columns/)).toBeVisible();
    await expect(page.getByRole('row')).toHaveCount(26);
    await page.getByRole('button', { name: 'Next' }).click();
    await expect(page.getByRole('cell', { name: 'label-26' })).toBeVisible();
    await expect(page.getByRole('row')).toHaveCount(2);
    await page.getByRole('button', { name: 'Clear dataset' }).click();
    await expect(page.getByRole('table')).toHaveCount(0);
    await expect(page.getByLabel('Choose CSV', { exact: true })).toBeFocused();
});
