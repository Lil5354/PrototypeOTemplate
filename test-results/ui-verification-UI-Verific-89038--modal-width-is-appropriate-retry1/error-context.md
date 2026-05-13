# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ui-verification.spec.js >> UI Verification Tests >> 5. Import modal width is appropriate
- Location: tests\ui-verification.spec.js:75:3

# Error details

```
Error: locator.boundingBox: Error: strict mode violation: locator('.fixed.inset-0.z-50 .rounded-xl') resolved to 2 elements:
    1) <div class="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden">…</div> aka getByText('Import Template1Upload2Selection3ReviewUpload FileSupported format: .json only')
    2) <div class="border-2 border-dashed border-gray-300 rounded-xl bg-gray-50/50 py-8 px-6 flex flex-col items-center justify-center hover:bg-gray-50 transition cursor-pointer">…</div> aka getByText('Drag & drop your file hereorBrowse Files.json only')

Call log:
  - waiting for locator('.fixed.inset-0.z-50 .rounded-xl')

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e5]:
    - generic [ref=e6]:
      - heading "Import Template" [level=2] [ref=e7]:
        - img [ref=e8]
        - text: Import Template
      - button [ref=e11] [cursor=pointer]:
        - img [ref=e12]
    - generic [ref=e16]:
      - generic [ref=e18]:
        - generic [ref=e19]: "1"
        - generic [ref=e20]: Upload
      - generic [ref=e21]:
        - generic [ref=e22]: "2"
        - generic [ref=e23]: Selection
      - generic [ref=e24]:
        - generic [ref=e25]: "3"
        - generic [ref=e26]: Review
    - generic [ref=e29]:
      - generic [ref=e30]:
        - heading "Upload File" [level=3] [ref=e31]
        - paragraph [ref=e32]:
          - text: "Supported format:"
          - strong [ref=e33]: .json only
          - text: "- UTF-8 encoding"
      - generic [ref=e34] [cursor=pointer]:
        - img [ref=e35]
        - paragraph [ref=e38]: Drag & drop your file here
        - paragraph [ref=e39]: or
        - button "Browse Files"
        - paragraph [ref=e40]: .json only
      - button "Download Sample Template" [ref=e42] [cursor=pointer]:
        - img [ref=e43]
        - text: Download Sample Template
    - generic [ref=e47]:
      - button "Cancel" [ref=e48] [cursor=pointer]
      - button "Continue" [disabled] [ref=e49]
  - generic [ref=e50]:
    - generic [ref=e52]:
      - generic [ref=e53]: X
      - generic [ref=e54]: XCORP
    - generic [ref=e55]:
      - generic [ref=e56] [cursor=pointer]:
        - img [ref=e58]
        - generic [ref=e59]: Workflow
      - generic [ref=e60] [cursor=pointer]:
        - img [ref=e62]
        - generic [ref=e65]: Approval
      - generic [ref=e66] [cursor=pointer]:
        - img [ref=e68]
        - generic [ref=e69]: Eisenhower
      - generic [ref=e70] [cursor=pointer]:
        - img [ref=e72]
        - generic [ref=e77]: Dashboard
      - generic [ref=e78] [cursor=pointer]:
        - img [ref=e80]
        - generic [ref=e82]: Leave
      - generic [ref=e83] [cursor=pointer]:
        - img [ref=e85]
        - generic [ref=e88]: Work Tracking
      - generic [ref=e89] [cursor=pointer]:
        - img [ref=e91]
        - generic [ref=e92]: Timesheet
      - generic [ref=e93] [cursor=pointer]:
        - img [ref=e95]
        - generic [ref=e98]: Task Management
        - img [ref=e99]
      - generic [ref=e101]:
        - generic [ref=e102] [cursor=pointer]:
          - img [ref=e103]
          - generic [ref=e108]: OKR Board
          - img [ref=e109]
        - generic [ref=e111]:
          - generic [ref=e112] [cursor=pointer]:
            - img [ref=e114]
            - generic [ref=e119]: OKR Dashboard
          - generic [ref=e120] [cursor=pointer]:
            - img [ref=e122]
            - generic [ref=e125]: My OKR
          - generic [ref=e126] [cursor=pointer]:
            - img [ref=e128]
            - generic [ref=e129]: OKR
          - generic [ref=e130] [cursor=pointer]:
            - img [ref=e132]
            - generic [ref=e135]: OKR Template
            - generic [ref=e136]: New
          - generic [ref=e137] [cursor=pointer]:
            - img [ref=e139]
            - generic [ref=e142]: OKR Settings
      - generic [ref=e143] [cursor=pointer]:
        - img [ref=e145]
        - generic [ref=e148]: Document
        - img [ref=e149]
      - generic [ref=e151] [cursor=pointer]:
        - img [ref=e153]
        - generic [ref=e158]: Organization
        - img [ref=e159]
      - generic [ref=e161] [cursor=pointer]:
        - img [ref=e163]
        - generic [ref=e166]: Settings
        - img [ref=e167]
  - generic [ref=e169]:
    - banner [ref=e170]:
      - generic [ref=e172]:
        - generic [ref=e173]: XCORP
        - img [ref=e174]
        - generic [ref=e176]: XPERC
        - img [ref=e177]
        - generic [ref=e179]: OKR BOARD
        - img [ref=e180]
        - generic [ref=e182]: OKR TEMPLATES
      - generic [ref=e183]:
        - button "START TIMER" [ref=e184] [cursor=pointer]:
          - img [ref=e185]
          - text: START TIMER
        - img [ref=e189] [cursor=pointer]
        - generic [ref=e192] [cursor=pointer]:
          - img [ref=e193]
          - text: EN
        - img [ref=e196] [cursor=pointer]
        - img "User" [ref=e200] [cursor=pointer]
    - generic [ref=e202]:
      - generic [ref=e203]:
        - generic [ref=e204]:
          - heading "OKR Templates" [level=2] [ref=e205]
          - paragraph [ref=e206]: Manage and use available OKR templates
        - generic [ref=e207]:
          - button "Import Template" [active] [ref=e208] [cursor=pointer]:
            - img [ref=e209]
            - text: Import Template
          - button "Export Template" [ref=e212] [cursor=pointer]:
            - img [ref=e213]
            - text: Export Template
      - generic [ref=e217]:
        - generic [ref=e218]:
          - generic [ref=e219]: TITLE
          - generic [ref=e220]: DESCRIPTION
          - generic [ref=e221]: DOMAIN/TAGS
          - generic [ref=e222]: CREATOR
          - generic [ref=e223]: UPDATED DATE
          - generic [ref=e224]: ACTIONS
        - generic [ref=e225]:
          - generic [ref=e226] [cursor=pointer]:
            - generic [ref=e227]: HR Performance Template
            - generic [ref=e228]: Standard template for HR team performance tracking
            - generic [ref=e229]:
              - generic [ref=e230]: HR
              - generic [ref=e231]: Performance
            - generic [ref=e232]: Duc Le
            - generic [ref=e233]: 2025-05-08
            - generic [ref=e234]:
              - button "Edit" [ref=e235]:
                - img [ref=e236]
              - button "Delete" [ref=e239]:
                - img [ref=e240]
          - generic [ref=e243] [cursor=pointer]:
            - generic [ref=e244]: Engineering Sprint Template
            - generic [ref=e245]: Default description
            - generic [ref=e247]: Default Tag
            - generic [ref=e248]: Minh Nguyen
            - generic [ref=e249]: 2025-05-07
            - generic [ref=e250]:
              - button "Edit" [ref=e251]:
                - img [ref=e252]
              - button "Delete" [ref=e255]:
                - img [ref=e256]
          - generic [ref=e259] [cursor=pointer]:
            - generic [ref=e260]: Product Quality Template
            - generic [ref=e261]: Template for product quality and user satisfaction
            - generic [ref=e262]:
              - generic [ref=e263]: Product
              - generic [ref=e264]: Quality
              - generic [ref=e265]: UX
            - generic [ref=e266]: Hoa Pham
            - generic [ref=e267]: 2025-05-06
            - generic [ref=e268]:
              - button "Edit" [ref=e269]:
                - img [ref=e270]
              - button "Delete" [ref=e273]:
                - img [ref=e274]
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
  20  |     await expect(page.locator('text=Add template').first()).toBeVisible();
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
> 83  |     const box = await modal.boundingBox();
      |                             ^ Error: locator.boundingBox: Error: strict mode violation: locator('.fixed.inset-0.z-50 .rounded-xl') resolved to 2 elements:
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