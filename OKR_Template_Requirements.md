# OKR Template - Tài liệu Yêu cầu & Hướng dẫn Xây dựng Prototype

## 1. Tổng quan (Overview)

### 1.1 Mục đích
Tính năng OKR Template cho phép người dùng tái sử dụng cấu trúc OKR đã có, giúp tiết kiệm thời gian thiết lập chu kỳ mới, onboard team, hoặc nhân rộng mô hình OKR hiệu quả ra nhiều nhóm.

**Hiện trạng (AS-IS):**
- Người dùng phải tạo từng Objective và Key Result một cách thủ công trên OKR Board
- Không có cơ chế lưu lại cấu trúc OKR để tái sử dụng
- Mỗi chu kỳ mới hoặc team mới phải bắt đầu lại từ đầu

**Kỳ vọng (TO-BE):**
- Người dùng có thể lưu OKR hiện có thành template (Save as Template)
- Người dùng có thể áp dụng template vào Timeline & Space đang xem (Add Template)
- Quản lý danh sách template: xem, chỉnh sửa, xoá, import/export

### 1.2 Phạm vi Release 1.0

**Trong phạm vi:**
- Save as Template: lưu OKR hiện có thành template với các trường tuỳ chọn (flow 3 bước)
- Add Template: tìm kiếm, chọn template, cấu hình trường dữ liệu, apply vào Timeline/Space
- Danh sách template: Title, Description, Domain/Tags, Creator, Updated Date, Actions (View / Edit / Delete)
- View: preview cây OKR của template. Click vào title của node → hiển thị Node Details đầy đủ
- Edit: chỉnh sửa general info và data chi tiết bên trong template (thêm/sửa/xoá Objective và KR)
- Delete: xoá template (có xác nhận)
- Import JSON / Export JSON cho template

**Ngoài phạm vi:**
- Import lịch sử check-in hoặc tiến độ OKR vào template
- Apply template vào nhiều Space cùng lúc
- Undo/Rollback sau khi apply template
- Import/Export định dạng khác ngoài JSON

### 1.3 Vị trí tính năng trên UI

**Điểm truy cập chính:**
1. OKR Board → Button "OKR Template" (kế nút "AI Objective")
   - Save as Template
   - Add Template (Apply template vào Timeline/Space hiện tại)
2. Sidebar → Menu item "OKR Templates"
   - Xem danh sách tất cả template
   - Import JSON / Export JSON
   - Các action: View, Edit, Delete trên từng template

---

## 2. Node Details - Shared Component

Node Details là shared component — dùng chung cho MỌI context có cây OKR.

### 2.1 Cách mở Node Details
Click vào title của bất kỳ node nào (Objective hoặc KR) → Node Details panel mở ra (slide-in bên phải).

### 2.2 Cấu trúc Node Details

**BASIC INFORMATION:**
| Field | Key | Ghi chú |
|-------|-----|---------|
| Title | title | Bắt buộc. Editable. |
| Description | description | Tuỳ chọn. Editable. |
| Code | code | Auto-generated. Read-only. |
| Level | level | PERSONAL / TEAM / COMPANY. Dropdown. |
| Category | category | Objective / Key Result. Dropdown. |
| Timeline | timeline | Năm / Quý. Required (*). |
| Space | space | Current Space hoặc chọn Space khác. |

**ASSIGNMENT & TRACKING:**
| Field | Key | Ghi chú |
|-------|-----|---------|
| Assignee | assigned_to | User picker, có avatar. |
| Team | team | Tên team. |
| Groups | group | Group ID/tên. |
| Stakeholders | stakeholders | Danh sách người liên quan. |

**ADDITIONAL ATTRIBUTES:**
| Field | Key | Ghi chú |
|-------|-----|---------|
| Indicator | indicator | Dropdown hoặc None. |
| Policies | policies | Dropdown hoặc None. |
| Labels | labels | Tags, None nếu chưa đặt. |
| Due Date | due_date | Date picker (dd/mm/yyyy). |

**METRICS & RESULTS:**
| Field | Key | Ghi chú |
|-------|-----|---------|
| Metric | metric | Dropdown. |
| Metric Name | metric_name | Tên hiển thị. |
| Unit | unit | Đơn vị đo. |
| Aggregation Type | aggregation | SUM / AVG / MAX / MIN. |
| Start | start | Giá trị bắt đầu. |
| Current | current | Giá trị hiện tại. |
| Expected | expected | Giá trị kỳ vọng. |
| Progress Formula | progress_formula | Default / Custom. |
| Risk Formula | risk_formula | Default / Custom. |

---

## 3. Draft Flow

### Flow A — Save as Template

**Mục tiêu:** Lưu OKR đang có thành template để tái sử dụng.
**Thiết kế:** Giao diện 3 bước (tương tự flow Import).

**Điều kiện tiên quyết:**
- Đã đăng nhập, có quyền truy cập OKR Board
- Đang ở OKR Board, đã trỏ tới Timeline và Space cụ thể
- Timeline/Space hiện tại có ít nhất 1 OKR (Objective)

**Bước 1 — Thông tin Template & Review cây OKR:**
- User nhập Title (bắt buộc), Description, Domain, Tags
- Review cây OKR hiển thị
- Click title node → Node Details (read-only)

**Bước 2 — Chọn Field đưa vào Template:**
- Danh sách field (checkbox). Mặc định: TẤT CẢ đã tích sẵn
- Field Preview cập nhật real-time theo lựa chọn

**Bước 3 — Xem trước & Xác nhận Lưu:**
- Review Summary: tên template, mô tả, tags, tổng node, field map
- OKR Preview với trạng thái từng node
- Nút "Save Template"

### Flow B — Add Template (Apply vào Timeline/Space)

**Mục tiêu:** Chọn template có sẵn và apply vào Timeline & Space đang trỏ tới.
**Thiết kế:** 3 bước, tương tự Export.

**Bước 1 — Tìm kiếm & Chọn Template:**
- Hiển thị context: "Đang apply vào: 2025 / Q2 - Space: Engineering"
- Search + danh sách template
- OKR Tree Preview của template được chọn

**Bước 2 — Chọn Field Import:**
- Mặc định: TẤT CẢ bỏ tích (unchecked)
- Field Preview real-time

**Bước 3 — Xem trước & Xác nhận Apply:**
- Review Summary, OKR Preview
- Warning: "Apply Template không thể hoàn tác"
- Nút "Apply to Timeline"

### Flow C — Trang OKR Templates (Danh sách)

**Layout:**
- Header: "OKR Templates" + mô tả ngắn
- Actions bar: Import Template + Export Template
- Table: Title, Description, Domain/Tags, Creator, Updated Date, Actions

**C1 — View Template (Preview):**
- Click icon View → modal preview cây OKR
- Click title node → Node Details (read-only)

**C2 — Edit Template:**
- General Info + Template Builder (inline-edit)
- Hover node → action buttons (+, Edit, Delete)

**C3 — Delete Template:**
- Dialog xác nhận → Xoá template

### Flow D — Import JSON

**3 bước:**
1. Upload & Review: kéo thả file .json, validation results
2. Chọn Field: select fields to import
3. Xem trước & Xác nhận

### Flow E — Export JSON

**3 bước:**
1. Chọn Template
2. Chọn Field Export
3. Xem trước & Xác nhận

---

## 4. Cấu trúc dữ liệu Template

### 4.1 General Template Info
| Field | Kiểu | Ghi chú |
|-------|------|---------|
| title | string (required) | Tối đa 120 ký tự. Unique. |
| description | string (optional) | Mô tả ngắn. |
| domain | string (optional) | Domain phân loại. |
| domain_tags | string[] (optional) | Mảng tag. |
| creator | string (auto) | User ID/tên người tạo. |
| created_at | datetime (auto) | Thời điểm tạo. |
| updated_at | datetime (auto) | Thời điểm cập nhật. |

### 4.2 Node Data (Objective / Key Result)
Cấu trúc tương ứng với Node Details sections.

---

## 5. Error Cases & Checklist

**Important checklist:**
- [x] Apply Template không có undo → Warning nổi bật trước khi confirm
- [x] Context (Timeline + Space) phải hiển thị rõ tại bước Apply
- [x] Save as Template: default tất cả field checked; Add Template: default unchecked
- [x] Node Details là shared component
- [x] Node Details có 2 mode: read-only và editable
- [x] Import template trùng Title → auto suffix _(n)
- [x] Export: field không chọn sẽ không có trong JSON
- [x] Template Builder: Hover node → action buttons

---

## 6. Hướng dẫn Build Prototype (Step by Step)

### Giai đoạn 1: Setup & Base Structure
1. Tạo Vite + React project
2. Cài đặt dependencies: lucide-react, Tailwind CSS
3. Xây dựng layout chính: Sidebar + Header + Content area

### Giai đoạn 2: OKR Dashboard
4. Mock data cho OKR Board (metrics + table)
5. Controls: Filter, Timeline, Spaces, Search
6. OKR Template dropdown (Add/Save as)
7. Bảng OKR data (tree view)

### Giai đoạn 3: Flow A - Save as Template
8. Modal 3 bước với Stepper
9. Step 1: Template Info form + OKR Tree Preview
10. Step 2: Field Selection + Field Preview
11. Step 3: Review Summary + Save button

### Giai đoạn 4: Flow B - Add Template
12. Modal 3 bước
13. Step 1: Search + select template + preview
14. Step 2: Field selection (default unchecked)
15. Step 3: Review + Apply warning

### Giai đoạn 5: Flow C - OKR Templates Page
16. Template list table
17. C1: View Template modal + Node Details
18. C2: Edit Template (General Info + Tree Builder)
19. C3: Delete Template confirmation

### Giai đoạn 6: Flow D - Import JSON
20. Step 1: Upload file + validation
21. Step 2: Field selection
22. Step 3: Preview + confirm import

### Giai đoạn 7: Flow E - Export JSON
23. Step 1: Select templates
24. Step 2: Select export fields
25. Step 3: Preview JSON + download

### Giai đoạn 8: Node Details - Shared Component
26. Slide-in panel với 4 sections
27. Read-only mode cho View
28. Edit mode cho Edit Template
29. Click title node → open panel

### Giai đoạn 9: Fixes & Polish
30. Xử lý các error cases
31. Toast notifications
32. Confirm close dialogs
33. Responsive design
