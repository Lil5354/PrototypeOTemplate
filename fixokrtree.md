Đóng vai trò là một Frontend Developer / UI/UX Expert (đặc biệt quen thuộc với Angular Material do dự án đang sử dụng framework này). Nhiệm vụ của bạn là sửa lỗi giao diện (UI/CSS) và chuẩn hóa toàn bộ các trường dữ liệu (fields) cho 2 component: \*\*OKR Tree\*\* và \*\*Node Details\*\*.



\[YÊU CẦU TIÊN QUYẾT]

\- TUYỆT ĐỐI KHÔNG can thiệp, refactor hay làm thay đổi bất kỳ luồng nghiệp vụ xử lý phía sau nào (backend logic, API calls, state management, data payload format). Chỉ thực hiện thay đổi trên lớp giao diện Frontend (HTML/SCSS/UI Component).



\[YÊU CẦU VỀ GIAO DIỆN - OKR TREE \& NODE DETAILS]

\- Tái tạo lại cấu trúc HTML và CSS sao cho mức độ giống file mẫu `OKR Board.html` đạt ít nhất 90%.

\- Tận dụng các class CSS/Material Design hiện có (như `mat-icon`, `mat-mdc-row`, flexbox, màu sắc biến hệ thống `--x-primary`, `--x-text-color`) để đồng bộ với design system của Xcorp.

\- OKR Tree phải hiển thị rõ cấu trúc cha-con (Objective -> Key Result), có trạng thái (Valid/Warning/Risk), Progress (%), Avatar của Assignee và Title + Code.



\[YÊU CẦU VỀ FIELDS \& DỮ LIỆU (ĐÚNG 100% THEO TÀI LIỆU)]

Node Details phải có đúng 5 sections. Các trường select/dropdown phải đảm bảo cấu trúc sau:



1\. Section 1: Details

\- Level: Select field (PERSONAL / GROUP / TEAM / COMPANY).

\- Indicator: Select field hoặc None.

\- Policies: Select field hoặc None.

\- Labels: Tags, None nếu chưa đặt.

\- Category: Select field (Objective / KPI).

\- Due Date: Date picker (dd/mm/yyyy), None nếu chưa đặt.

\- Assignee: User picker có hiển thị Avatar (dùng class `app-avatar-wrapper`). Unassigned nếu chưa đặt.

\- Groups: Group ID / tên, None nếu chưa đặt.

\- Teams: Tên team, None nếu chưa đặt.

\- Stakeholders: Danh sách user, None nếu chưa đặt.

\- Timeline (TL): Mốc thời gian (Năm/Quý). Required.

\- Progress Formula: Select field (Default / Custom).

\- Risk Formula: Select field (Default / Custom).



2\. Section 2: Parent Objective (Chỉ hiện cho Key Result hoặc sub-Objective)

\- Objective: Tên và mã code của Objective cha.

\- Assignee: Avatar + tên assignee.

\- Percent: Tỉ lệ đóng góp (%).

\- Timeline (TL): Timeline của Objective cha.



3\. Section 3: Nested Items (Danh sách node con)

\- Results: Tên và mã code của node con.

\- Assignee: Avatar + tên assignee.

\- Percent: Tỉ lệ đóng góp (%).

\*\*(LƯU Ý ĐẶC BIỆT: KHÔNG thiết kế hoặc hiển thị trường "Weight" (Trọng số) ở section này cũng như trong các tùy chỉnh hệ thống. Bỏ qua hoàn toàn field này).\*\*



4\. Section 4: Timeline Detail

\- Có Toggle "Planning Timeline" để bật/tắt.

\- Timeline label: Nhóm theo năm/quý (Ví dụ: 2026 Quarter 3). Có thể expand/collapse.

\- Các cột: Start (Giá trị bắt đầu), Current (Giá trị hiện tại), Expected/Target (Giá trị kỳ vọng).



5\. Section 5: Metric \& Results

\- Metric: Ví dụ: AVERAGE-BUGS-PER-TASK.

\- Aggregation Type: Dropdown (SUM / AVG).

\- Start, Current, Expected.



\[DANH SÁCH 15 TRƯỜNG CHO CHỨC NĂNG SELECT FIELD]

Khi thiết kế dropdown/modal chọn field để hiển thị, chỉ bao gồm 15 tùy chọn sau (Không có "Actions"):

1\. Name (Title) - Bị khóa/Mặc định checked

2\. Description

3\. User

4\. Group

5\. Team

6\. Assign To

7\. Metric

8\. Metric Name

9\. Metric Key

10\. Metric Unit

11\. Aggregation Type

12\. Result

13\. Progress (Hệ thống tự tính, Read-only trong template)

14\. Risk Level (Hệ thống tự tính, Read-only)

15\. Timeline - View Metric (Mặc định unchecked)



\[HÀNH ĐỘNG CỦA BẠN]

Hãy cung cấp mã HTML và SCSS đã được sửa chữa cho OKR Tree và Node Details và select field đầy đủ như mô tả trên. Mọi input/output property bindings phải giữ nguyên tên biến gốc của dự án. 

