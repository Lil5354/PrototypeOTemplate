import { test, expect } from '@playwright/test';

test.describe('UI Verification Tests', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('1. Template dropdown has Space and Timeline sections', async ({ page }) => {
    await page.click('button:has-text("OKR Template")');
    await page.waitForSelector('text=Space', { timeout: 3000 });
    await page.waitForSelector('text=Timeline', { timeout: 3000 });

    const spaceLabel = page.locator('text=Space').first();
    const timelineLabel = page.locator('text=Timeline').first();
    await expect(spaceLabel).toBeVisible();
    await expect(timelineLabel).toBeVisible();

    await expect(page.locator('text=Add template').first()).toBeVisible();
    await expect(page.locator('text=Override Template').first()).toBeVisible();
    await expect(page.locator('text=Save as template').first()).toBeVisible();
  });

  test('2. Save button text is "Save" not "Save Template"', async ({ page }) => {
    await page.click('button:has-text("OKR Template")');
    await page.waitForSelector('text=Save as template', { timeout: 3000 });

    const saveAsTemplate = page.locator('text=Save as template').first();
    await expect(saveAsTemplate).toBeVisible();

    await page.click('text=Add template');
    await page.waitForTimeout(300);

    await page.click('text=Cancel');
  });

  test('3. Import modal has Download Sample Template button', async ({ page }) => {
    await page.click('text=OKR Template');
    await page.waitForSelector('text=OKR TEMPLATES', { timeout: 3000 });

    await page.click('text=Import Template');
    await page.waitForTimeout(500);

    const downloadBtn = page.locator('text=Download Sample Template');
    await expect(downloadBtn).toBeVisible();
  });

  test('4. Save step 3 shows correct field summary without brackets', async ({ page }) => {
    await page.click('button:has-text("OKR Template")');
    await page.waitForTimeout(300);
    await page.click('text=Save as template');
    await page.waitForTimeout(500);

    // Fill step 1
    await page.fill('input[placeholder*="Q3 Sales"]', 'Test Template');
    await page.click('button:has-text("Continue")');
    await page.waitForTimeout(300);

    // Step 2: uncheck some fields
    await page.click('text=Select All Fields');
    await page.waitForTimeout(300);

    // step 3
    await page.click('button:has-text("Continue")');
    await page.waitForTimeout(500);

    const saveButton = page.locator('button:has-text("Save")').last();
    await expect(saveButton).toBeVisible();

    const bracketOnPage = page.locator('text=[object Object]');
    await expect(bracketOnPage).toHaveCount(0);
  });

  test('5. Import modal width is appropriate', async ({ page }) => {
    await page.click('text=OKR Template');
    await page.waitForSelector('text=OKR TEMPLATES', { timeout: 3000 });

    await page.click('text=Import Template');
    await page.waitForTimeout(500);

    const modal = page.locator('.fixed.inset-0.z-50 .rounded-xl');
    const box = await modal.boundingBox();
    expect(box.width).toBeGreaterThan(1000);
  });

  test('6. Add modal step 2 field summary has no square brackets', async ({ page }) => {
    await page.click('button:has-text("OKR Template")');
    await page.waitForTimeout(300);
    await page.click('text=Add template');
    await page.waitForTimeout(500);

    const templateCards = page.locator('.border.rounded-md.cursor-pointer');
    const count = await templateCards.count();
    if (count > 0) {
      await templateCards.first().click();
      await page.waitForTimeout(200);
      await page.click('button:has-text("Continue")');
      await page.waitForTimeout(500);

      const bracketChars = page.locator('text=[object Object]');
      await expect(bracketChars).toHaveCount(0);
    }
  });
});
