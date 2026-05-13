# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ui-verification.spec.js >> UI Verification Tests >> 1. Template dropdown has Space and Timeline sections
- Location: tests\ui-verification.spec.js:10:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=Add template').first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('text=Add template').first()

```

```yaml
- text: X XCORP
- img
- text: Workflow
- img
- text: Approval
- img
- text: Eisenhower
- img
- text: Dashboard
- img
- text: Leave
- img
- text: Work Tracking
- img
- text: Timesheet
- img
- text: Task Management
- img
- img
- text: OKR Board
- img
- img
- text: OKR Dashboard
- img
- text: My OKR
- img
- text: OKR
- img
- text: OKR Template New
- img
- text: OKR Settings
- img
- text: Document
- img
- img
- text: Organization
- img
- img
- text: Settings
- img
- banner:
  - text: XCORP
  - img
  - text: XPERC
  - img
  - text: OKR BOARD
  - img
  - text: OKR
  - button "CREATE"
  - button "AI OBJECTIVE":
    - img
    - text: AI OBJECTIVE
  - button "START TIMER":
    - img
    - text: START TIMER
  - img
  - img
  - text: EN
  - img
  - img "User"
- text: All Metrics Attendance Days (day) AVG 7.8 42.7%
- img
- text: "Start: 0 Expected: 18.3 Attendance Days (day) SUM 1.04K 47.3%"
- img
- text: "Start: 0 Expected: 2.19K Check-in Non-Complia... (%) AVG 31.1 -55.5%"
- img
- text: "Start: 20 Expected: 0 Check-in Non-Complia... (%) SUM 4.4K -66.8%"
- img
- text: "Start: 2.64K Expected: 0 Filter"
- button "Filter":
  - img
  - text: Filter
- text: Timeline
- combobox:
  - option "2025" [selected]
  - option "2024"
- text: Timeline Tree Quarter 4, 2025
- img
- text: OKR Template
- button "OKR Template":
  - img
  - text: OKR Template
  - img
- button "Override Template":
  - img
  - text: Override Template
- button "Save as template":
  - img
  - text: Save as template
- text: Mode View
- button:
  - img
- button:
  - img
- text: Space
- combobox:
  - option "Engineering" [selected]
  - option "Sales"
  - option "HR"
  - option "Product"
  - option "Marketing"
  - option "Finance"
  - option "Operations"
- textbox "Search"
- img
- button:
  - img
- text: OKR
- img
- img
- img
- text: User Group Team Assign To Metric M.Name M.Key M.Unit Agg.Type Result Progress Risk TL IC+
- img
- img
- text: WD-V2-1 Work Discipline Work Discipline - No Group No Team No Group Score AVG(Score) Score SCORE Score AVG S 0 / C 5.75 57.5% Default
- img
- text: high
- img
- text: 4 -
- img
- text: ↳ WD-V2-2 Attendance Days Total attendance days - No Group No Team No Group Attendance Days AVG(day) Attendance Days ATTENDANCE-D... day AVG S 0 / C 7.8 42.7% Default
- img
- text: high
- img
- text: 2 -
- img
- text: WD V2 3 Attendance Days - Project...
- img "u"
- text: CP CP No Team No Group Attendance Days AVG(day) Attendance Days ATTENDANCE-D... day AVG S 0 / C 8.25 40.8% Default
- img
- text: high
- img
- text: 2 -
- img
- text: WD-V2-4 Attendance Days - Team... - No Group [OKR-CP] [OKR-CP] Attendance Days AVG(day) Attendance Days ATTENDANCE-D... day AVG S 0 / C 7.65 37.7% Default
- img
- text: high
- img
- text: 1 -
- img
- text: WD-V2-5 Attendance Days - ...
- img "u"
- text: Duc Le No Group No Team Duc Le Attendance Days SUM(day) Attendance Days ATTENDANCE-D... day SUM S 0 / C 2.01 4.79% Default
- img
- text: high
- img
- text: 1 -
- img
- text: WD-V2-6 Attendance Days - ...
- img "u"
- text: Ngan Vu No Group No Team Ngan Vu Attendance Days SUM(day) Attendance Days ATTENDANCE-D... day SUM S 0 / C 17.5 41.7% Default
- img
- text: high
- img
- text: 1 -
- img
- text: WD-V2-7 Attendance Days - ...
- img "u"
- text: Duy Nguyen No Group No Team Duy Nguyen Attendance Days SUM(day) Attendance Days ATTENDANCE-D... day SUM S 0 / C 21.3 51.2% Default
- img
- text: high
- img
- text: 1 -
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('UI Verification Tests', () => {
  4   | 
  5   |   test.beforeEach(async ({ page }) => {
  6   |     await page.goto('/');
  7   |     await page.waitForLoadState('networkidle');
  8   |   });
  9   | 
  10  |   test('1. Template dropdown has Space and Timeline sections', async ({ page }) => {
  11  |     await page.click('button:has-text("OKR Template")');
  12  |     await page.waitForSelector('text=Space', { timeout: 3000 });
  13  |     await page.waitForSelector('text=Timeline', { timeout: 3000 });
  14  | 
  15  |     const spaceLabel = page.locator('text=Space').first();
  16  |     const timelineLabel = page.locator('text=Timeline').first();
  17  |     await expect(spaceLabel).toBeVisible();
  18  |     await expect(timelineLabel).toBeVisible();
  19  | 
> 20  |     await expect(page.locator('text=Add template').first()).toBeVisible();
      |                                                             ^ Error: expect(locator).toBeVisible() failed
  21  |     await expect(page.locator('text=Override Template').first()).toBeVisible();
  22  |     await expect(page.locator('text=Save as template').first()).toBeVisible();
  23  |   });
  24  | 
  25  |   test('2. Save button text is "Save" not "Save Template"', async ({ page }) => {
  26  |     await page.click('button:has-text("OKR Template")');
  27  |     await page.waitForSelector('text=Save as template', { timeout: 3000 });
  28  | 
  29  |     const saveAsTemplate = page.locator('text=Save as template').first();
  30  |     await expect(saveAsTemplate).toBeVisible();
  31  | 
  32  |     await page.click('text=Add template');
  33  |     await page.waitForTimeout(300);
  34  | 
  35  |     await page.click('text=Cancel');
  36  |   });
  37  | 
  38  |   test('3. Import modal has Download Sample Template button', async ({ page }) => {
  39  |     await page.click('text=OKR Template');
  40  |     await page.waitForSelector('text=OKR TEMPLATES', { timeout: 3000 });
  41  | 
  42  |     await page.click('text=Import Template');
  43  |     await page.waitForTimeout(500);
  44  | 
  45  |     const downloadBtn = page.locator('text=Download Sample Template');
  46  |     await expect(downloadBtn).toBeVisible();
  47  |   });
  48  | 
  49  |   test('4. Save step 3 shows correct field summary without brackets', async ({ page }) => {
  50  |     await page.click('button:has-text("OKR Template")');
  51  |     await page.waitForTimeout(300);
  52  |     await page.click('text=Save as template');
  53  |     await page.waitForTimeout(500);
  54  | 
  55  |     // Fill step 1
  56  |     await page.fill('input[placeholder*="Q3 Sales"]', 'Test Template');
  57  |     await page.click('button:has-text("Continue")');
  58  |     await page.waitForTimeout(300);
  59  | 
  60  |     // Step 2: uncheck some fields
  61  |     await page.click('text=Select All Fields');
  62  |     await page.waitForTimeout(300);
  63  | 
  64  |     // step 3
  65  |     await page.click('button:has-text("Continue")');
  66  |     await page.waitForTimeout(500);
  67  | 
  68  |     const saveButton = page.locator('button:has-text("Save")').last();
  69  |     await expect(saveButton).toBeVisible();
  70  | 
  71  |     const bracketOnPage = page.locator('text=[object Object]');
  72  |     await expect(bracketOnPage).toHaveCount(0);
  73  |   });
  74  | 
  75  |   test('5. Import modal width is appropriate', async ({ page }) => {
  76  |     await page.click('text=OKR Template');
  77  |     await page.waitForSelector('text=OKR TEMPLATES', { timeout: 3000 });
  78  | 
  79  |     await page.click('text=Import Template');
  80  |     await page.waitForTimeout(500);
  81  | 
  82  |     const modal = page.locator('.fixed.inset-0.z-50 .rounded-xl');
  83  |     const box = await modal.boundingBox();
  84  |     expect(box.width).toBeGreaterThan(1000);
  85  |   });
  86  | 
  87  |   test('6. Add modal step 2 field summary has no square brackets', async ({ page }) => {
  88  |     await page.click('button:has-text("OKR Template")');
  89  |     await page.waitForTimeout(300);
  90  |     await page.click('text=Add template');
  91  |     await page.waitForTimeout(500);
  92  | 
  93  |     const templateCards = page.locator('.border.rounded-md.cursor-pointer');
  94  |     const count = await templateCards.count();
  95  |     if (count > 0) {
  96  |       await templateCards.first().click();
  97  |       await page.waitForTimeout(200);
  98  |       await page.click('button:has-text("Continue")');
  99  |       await page.waitForTimeout(500);
  100 | 
  101 |       const bracketChars = page.locator('text=[object Object]');
  102 |       await expect(bracketChars).toHaveCount(0);
  103 |     }
  104 |   });
  105 | });
  106 | 
```