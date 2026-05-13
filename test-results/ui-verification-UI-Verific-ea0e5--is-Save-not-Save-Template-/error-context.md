# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ui-verification.spec.js >> UI Verification Tests >> 2. Save button text is "Save" not "Save Template"
- Location: tests\ui-verification.spec.js:25:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('text=Add template')

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]:
    - generic [ref=e6]:
      - generic [ref=e7]: X
      - generic [ref=e8]: XCORP
    - generic [ref=e9]:
      - generic [ref=e10] [cursor=pointer]:
        - img [ref=e12]
        - generic [ref=e13]: Workflow
      - generic [ref=e14] [cursor=pointer]:
        - img [ref=e16]
        - generic [ref=e19]: Approval
      - generic [ref=e20] [cursor=pointer]:
        - img [ref=e22]
        - generic [ref=e23]: Eisenhower
      - generic [ref=e24] [cursor=pointer]:
        - img [ref=e26]
        - generic [ref=e31]: Dashboard
      - generic [ref=e32] [cursor=pointer]:
        - img [ref=e34]
        - generic [ref=e36]: Leave
      - generic [ref=e37] [cursor=pointer]:
        - img [ref=e39]
        - generic [ref=e42]: Work Tracking
      - generic [ref=e43] [cursor=pointer]:
        - img [ref=e45]
        - generic [ref=e46]: Timesheet
      - generic [ref=e47] [cursor=pointer]:
        - img [ref=e49]
        - generic [ref=e52]: Task Management
        - img [ref=e53]
      - generic [ref=e55]:
        - generic [ref=e56] [cursor=pointer]:
          - img [ref=e57]
          - generic [ref=e62]: OKR Board
          - img [ref=e63]
        - generic [ref=e65]:
          - generic [ref=e66] [cursor=pointer]:
            - img [ref=e68]
            - generic [ref=e73]: OKR Dashboard
          - generic [ref=e74] [cursor=pointer]:
            - img [ref=e76]
            - generic [ref=e79]: My OKR
          - generic [ref=e80] [cursor=pointer]:
            - img [ref=e82]
            - generic [ref=e83]: OKR
          - generic [ref=e84] [cursor=pointer]:
            - img [ref=e86]
            - generic [ref=e89]: OKR Template
            - generic [ref=e90]: New
          - generic [ref=e91] [cursor=pointer]:
            - img [ref=e93]
            - generic [ref=e96]: OKR Settings
      - generic [ref=e97] [cursor=pointer]:
        - img [ref=e99]
        - generic [ref=e102]: Document
        - img [ref=e103]
      - generic [ref=e105] [cursor=pointer]:
        - img [ref=e107]
        - generic [ref=e112]: Organization
        - img [ref=e113]
      - generic [ref=e115] [cursor=pointer]:
        - img [ref=e117]
        - generic [ref=e120]: Settings
        - img [ref=e121]
  - generic [ref=e123]:
    - banner [ref=e124]:
      - generic [ref=e125]:
        - generic [ref=e126]:
          - generic [ref=e127]: XCORP
          - img [ref=e128]
          - generic [ref=e130]: XPERC
          - img [ref=e131]
          - generic [ref=e133]: OKR BOARD
          - img [ref=e134]
          - generic [ref=e136]: OKR
        - button "CREATE" [ref=e137] [cursor=pointer]
        - button "AI OBJECTIVE" [ref=e138] [cursor=pointer]:
          - img [ref=e139]
          - text: AI OBJECTIVE
      - generic [ref=e142]:
        - button "START TIMER" [ref=e143] [cursor=pointer]:
          - img [ref=e144]
          - text: START TIMER
        - img [ref=e148] [cursor=pointer]
        - generic [ref=e151] [cursor=pointer]:
          - img [ref=e152]
          - text: EN
        - img [ref=e155] [cursor=pointer]
        - img "User" [ref=e159] [cursor=pointer]
    - generic [ref=e160]:
      - generic [ref=e161]:
        - generic [ref=e163]: All Metrics
        - generic [ref=e164]:
          - generic [ref=e165]:
            - generic [ref=e166]: Attendance Days (day)
            - generic [ref=e167]: AVG
          - generic [ref=e168]:
            - generic [ref=e169]:
              - generic [ref=e170]: "7.8"
              - generic [ref=e171]:
                - text: 42.7%
                - img [ref=e172]
            - generic [ref=e174]:
              - generic [ref=e175]: "Start: 0"
              - generic [ref=e176]: "Expected: 18.3"
        - generic [ref=e178]:
          - generic [ref=e179]:
            - generic [ref=e180]: Attendance Days (day)
            - generic [ref=e181]: SUM
          - generic [ref=e182]:
            - generic [ref=e183]:
              - generic [ref=e184]: 1.04K
              - generic [ref=e185]:
                - text: 47.3%
                - img [ref=e186]
            - generic [ref=e188]:
              - generic [ref=e189]: "Start: 0"
              - generic [ref=e190]: "Expected: 2.19K"
        - generic [ref=e192]:
          - generic [ref=e193]:
            - generic [ref=e194]: Check-in Non-Complia... (%)
            - generic [ref=e195]: AVG
          - generic [ref=e196]:
            - generic [ref=e197]:
              - generic [ref=e198]: "31.1"
              - generic [ref=e199]:
                - text: "-55.5%"
                - img [ref=e200]
            - generic [ref=e202]:
              - generic [ref=e203]: "Start: 20"
              - generic [ref=e204]: "Expected: 0"
        - generic [ref=e206]:
          - generic [ref=e207]:
            - generic [ref=e208]: Check-in Non-Complia... (%)
            - generic [ref=e209]: SUM
          - generic [ref=e210]:
            - generic [ref=e211]:
              - generic [ref=e212]: 4.4K
              - generic [ref=e213]:
                - text: "-66.8%"
                - img [ref=e214]
            - generic [ref=e216]:
              - generic [ref=e217]: "Start: 2.64K"
              - generic [ref=e218]: "Expected: 0"
      - generic [ref=e220]:
        - generic [ref=e221]:
          - generic [ref=e222]:
            - generic [ref=e223]: Filter
            - button "Filter" [ref=e224] [cursor=pointer]:
              - img [ref=e225]
              - text: Filter
          - generic [ref=e227]:
            - generic [ref=e228]: Timeline
            - combobox [ref=e229] [cursor=pointer]:
              - option "2025" [selected]
              - option "2024"
          - generic [ref=e230]:
            - generic [ref=e231]: Timeline Tree
            - generic [ref=e234] [cursor=pointer]:
              - generic [ref=e235]: Quarter 4, 2025
              - img [ref=e236]
        - generic [ref=e238]:
          - generic [ref=e239]:
            - generic [ref=e240]: OKR Template
            - button "OKR Template" [active] [ref=e241] [cursor=pointer]:
              - img [ref=e242]
              - text: OKR Template
              - img [ref=e245]
            - generic [ref=e247]:
              - button "Override Template" [ref=e248] [cursor=pointer]:
                - img [ref=e249]
                - text: Override Template
              - button "Save as template" [ref=e250] [cursor=pointer]:
                - img [ref=e251]
                - text: Save as template
          - generic [ref=e254]:
            - generic [ref=e255]: Mode View
            - generic [ref=e256]:
              - button [ref=e257] [cursor=pointer]:
                - img [ref=e258]
              - button [ref=e260] [cursor=pointer]:
                - img [ref=e261]
          - generic [ref=e262]:
            - generic [ref=e263]: Space
            - combobox [ref=e264] [cursor=pointer]:
              - option "Engineering" [selected]
              - option "Sales"
              - option "HR"
              - option "Product"
              - option "Marketing"
              - option "Finance"
              - option "Operations"
          - generic [ref=e266]:
            - textbox "Search" [ref=e267]
            - img [ref=e268]
          - button [ref=e272] [cursor=pointer]:
            - img [ref=e273]
      - generic [ref=e276]:
        - generic [ref=e277]:
          - generic [ref=e278]:
            - generic [ref=e279]: OKR
            - img [ref=e280]
            - img [ref=e282]
            - img [ref=e284]
          - generic [ref=e285]: User
          - generic [ref=e286]: Group
          - generic [ref=e287]: Team
          - generic [ref=e288]: Assign To
          - generic [ref=e289]: Metric
          - generic [ref=e290]: M.Name
          - generic [ref=e291]: M.Key
          - generic [ref=e292]: M.Unit
          - generic [ref=e293]: Agg.Type
          - generic [ref=e294]: Result
          - generic [ref=e295]: Progress
          - generic [ref=e296]: Risk
          - generic [ref=e297]: TL
          - generic [ref=e298]: IC+
        - generic [ref=e299]:
          - generic [ref=e300]:
            - generic [ref=e302]:
              - img [ref=e303]
              - img [ref=e305]
              - generic [ref=e308]:
                - generic [ref=e309] [cursor=pointer]: WD-V2-1 Work Discipline
                - generic [ref=e310]: Work Discipline
            - generic [ref=e312]: "-"
            - generic [ref=e313]: No Group
            - generic [ref=e314]: No Team
            - generic [ref=e315]: No Group
            - generic [ref=e316]: Score AVG(Score)
            - generic [ref=e317]: Score
            - generic [ref=e318]: SCORE
            - generic [ref=e319]: Score
            - generic [ref=e320]: AVG
            - generic [ref=e321]:
              - generic [ref=e322]:
                - generic [ref=e323]: S
                - generic [ref=e324]: "0"
              - generic [ref=e325]: /
              - generic [ref=e326]:
                - generic [ref=e327]: C
                - generic [ref=e328]: "5.75"
            - generic [ref=e330]:
              - generic [ref=e331]: 57.5%
              - generic [ref=e332]: Default
            - generic [ref=e335]:
              - img [ref=e336]
              - generic [ref=e338]: high
            - generic [ref=e340]:
              - img [ref=e341]
              - text: "4"
            - generic [ref=e343]: "-"
          - generic [ref=e344]:
            - generic [ref=e346]:
              - img [ref=e347]
              - generic [ref=e349]: ↳
              - generic [ref=e350]:
                - generic [ref=e351] [cursor=pointer]: WD-V2-2 Attendance Days
                - generic [ref=e352]: Total attendance days
            - generic [ref=e354]: "-"
            - generic [ref=e355]: No Group
            - generic [ref=e356]: No Team
            - generic [ref=e357]: No Group
            - generic [ref=e358]: Attendance Days AVG(day)
            - generic [ref=e359]: Attendance Days
            - generic [ref=e360]: ATTENDANCE-D...
            - generic [ref=e361]: day
            - generic [ref=e362]: AVG
            - generic [ref=e363]:
              - generic [ref=e364]:
                - generic [ref=e365]: S
                - generic [ref=e366]: "0"
              - generic [ref=e367]: /
              - generic [ref=e368]:
                - generic [ref=e369]: C
                - generic [ref=e370]: "7.8"
            - generic [ref=e372]:
              - generic [ref=e373]: 42.7%
              - generic [ref=e374]: Default
            - generic [ref=e377]:
              - img [ref=e378]
              - generic [ref=e380]: high
            - generic [ref=e382]:
              - img [ref=e383]
              - text: "2"
            - generic [ref=e385]: "-"
          - generic [ref=e386]:
            - generic [ref=e388]:
              - img [ref=e389]
              - generic [ref=e393] [cursor=pointer]: WD V2 3 Attendance Days - Project...
            - generic [ref=e394]:
              - img "u" [ref=e396]
              - text: CP
            - generic [ref=e397]: CP
            - generic [ref=e398]: No Team
            - generic [ref=e399]: No Group
            - generic [ref=e400]: Attendance Days AVG(day)
            - generic [ref=e401]: Attendance Days
            - generic [ref=e402]: ATTENDANCE-D...
            - generic [ref=e403]: day
            - generic [ref=e404]: AVG
            - generic [ref=e405]:
              - generic [ref=e406]:
                - generic [ref=e407]: S
                - generic [ref=e408]: "0"
              - generic [ref=e409]: /
              - generic [ref=e410]:
                - generic [ref=e411]: C
                - generic [ref=e412]: "8.25"
            - generic [ref=e414]:
              - generic [ref=e415]: 40.8%
              - generic [ref=e416]: Default
            - generic [ref=e419]:
              - img [ref=e420]
              - generic [ref=e422]: high
            - generic [ref=e424]:
              - img [ref=e425]
              - text: "2"
            - generic [ref=e427]: "-"
          - generic [ref=e428]:
            - generic [ref=e430]:
              - img [ref=e431]
              - generic [ref=e435] [cursor=pointer]: WD-V2-4 Attendance Days - Team...
            - generic [ref=e437]: "-"
            - generic [ref=e438]: No Group
            - generic [ref=e439]: "[OKR-CP]"
            - generic [ref=e440]: "[OKR-CP]"
            - generic [ref=e441]: Attendance Days AVG(day)
            - generic [ref=e442]: Attendance Days
            - generic [ref=e443]: ATTENDANCE-D...
            - generic [ref=e444]: day
            - generic [ref=e445]: AVG
            - generic [ref=e446]:
              - generic [ref=e447]:
                - generic [ref=e448]: S
                - generic [ref=e449]: "0"
              - generic [ref=e450]: /
              - generic [ref=e451]:
                - generic [ref=e452]: C
                - generic [ref=e453]: "7.65"
            - generic [ref=e455]:
              - generic [ref=e456]: 37.7%
              - generic [ref=e457]: Default
            - generic [ref=e460]:
              - img [ref=e461]
              - generic [ref=e463]: high
            - generic [ref=e465]:
              - img [ref=e466]
              - text: "1"
            - generic [ref=e468]: "-"
          - generic [ref=e469]:
            - generic [ref=e471]:
              - img [ref=e472]
              - generic [ref=e476] [cursor=pointer]: WD-V2-5 Attendance Days - ...
            - generic [ref=e477]:
              - img "u" [ref=e479]
              - text: Duc Le
            - generic [ref=e480]: No Group
            - generic [ref=e481]: No Team
            - generic [ref=e482]: Duc Le
            - generic [ref=e483]: Attendance Days SUM(day)
            - generic [ref=e484]: Attendance Days
            - generic [ref=e485]: ATTENDANCE-D...
            - generic [ref=e486]: day
            - generic [ref=e487]: SUM
            - generic [ref=e488]:
              - generic [ref=e489]:
                - generic [ref=e490]: S
                - generic [ref=e491]: "0"
              - generic [ref=e492]: /
              - generic [ref=e493]:
                - generic [ref=e494]: C
                - generic [ref=e495]: "2.01"
            - generic [ref=e497]:
              - generic [ref=e498]: 4.79%
              - generic [ref=e499]: Default
            - generic [ref=e502]:
              - img [ref=e503]
              - generic [ref=e505]: high
            - generic [ref=e507]:
              - img [ref=e508]
              - text: "1"
            - generic [ref=e510]: "-"
          - generic [ref=e511]:
            - generic [ref=e513]:
              - img [ref=e514]
              - generic [ref=e518] [cursor=pointer]: WD-V2-6 Attendance Days - ...
            - generic [ref=e519]:
              - img "u" [ref=e521]
              - text: Ngan Vu
            - generic [ref=e522]: No Group
            - generic [ref=e523]: No Team
            - generic [ref=e524]: Ngan Vu
            - generic [ref=e525]: Attendance Days SUM(day)
            - generic [ref=e526]: Attendance Days
            - generic [ref=e527]: ATTENDANCE-D...
            - generic [ref=e528]: day
            - generic [ref=e529]: SUM
            - generic [ref=e530]:
              - generic [ref=e531]:
                - generic [ref=e532]: S
                - generic [ref=e533]: "0"
              - generic [ref=e534]: /
              - generic [ref=e535]:
                - generic [ref=e536]: C
                - generic [ref=e537]: "17.5"
            - generic [ref=e539]:
              - generic [ref=e540]: 41.7%
              - generic [ref=e541]: Default
            - generic [ref=e544]:
              - img [ref=e545]
              - generic [ref=e547]: high
            - generic [ref=e549]:
              - img [ref=e550]
              - text: "1"
            - generic [ref=e552]: "-"
          - generic [ref=e553]:
            - generic [ref=e555]:
              - img [ref=e556]
              - generic [ref=e560] [cursor=pointer]: WD-V2-7 Attendance Days - ...
            - generic [ref=e561]:
              - img "u" [ref=e563]
              - text: Duy Nguyen
            - generic [ref=e564]: No Group
            - generic [ref=e565]: No Team
            - generic [ref=e566]: Duy Nguyen
            - generic [ref=e567]: Attendance Days SUM(day)
            - generic [ref=e568]: Attendance Days
            - generic [ref=e569]: ATTENDANCE-D...
            - generic [ref=e570]: day
            - generic [ref=e571]: SUM
            - generic [ref=e572]:
              - generic [ref=e573]:
                - generic [ref=e574]: S
                - generic [ref=e575]: "0"
              - generic [ref=e576]: /
              - generic [ref=e577]:
                - generic [ref=e578]: C
                - generic [ref=e579]: "21.3"
            - generic [ref=e581]:
              - generic [ref=e582]: 51.2%
              - generic [ref=e583]: Default
            - generic [ref=e586]:
              - img [ref=e587]
              - generic [ref=e589]: high
            - generic [ref=e591]:
              - img [ref=e592]
              - text: "1"
            - generic [ref=e594]: "-"
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
> 32  |     await page.click('text=Add template');
      |                ^ Error: page.click: Test timeout of 30000ms exceeded.
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