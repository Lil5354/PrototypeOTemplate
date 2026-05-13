const fs = require('fs');
let content = fs.readFileSync('src/App.jsx', 'utf8');

const replacements = [
  ["'Vui lòng nhập tên template.'", "'Please enter template name.'"],
  ["'Tên template tối đa 120 ký tự.'", "'Template name max 120 characters.'"],
  ["'Template đã được lưu thành công.'", "'Template saved successfully.'"],
  ["'Template đã được xoá.'", "'Template deleted.'"],
  ["'Vui lòng chọn Space để tiếp tục.'", "'Please select Space to continue.'"],
  ["'Vui lòng chọn Timeline để tiếp tục.'", "'Please select Timeline to continue.'"],
  ["'Đã lưu thay đổi Node inline'", "'Node changes saved.'"],
  ["'Tên template không được để trống.'", "'Template name cannot be empty.'"],
  ["'Template phải có ít nhất 1 Objective.'", "'Template must have at least 1 Objective.'"],
  ["'Thay đổi đã được lưu thành công.'", "'Changes saved successfully.'"],
  ["'Vui lòng nhập tên template trước khi tiếp tục.'", "'Please enter template name before continuing.'"],
  ["'Template đã được nhập thành công từ JSON.'", "'Template imported successfully from JSON.'"],
  ['Xác nhận Xoá Template', 'Confirm Delete Template'],
  ['Bạn có chắc muốn xoá template', 'Are you sure you want to delete template'],
  ['Hành động này không thể hoàn tác.', 'This action cannot be undone.'],
  ['Huỷ bỏ', 'Cancel'],
  ['Xoá Template', 'Delete Template'],
  ['Thoát tiến trình?', 'Exit progress?'],
  ['Tiến trình sẽ bị mất. Bạn có chắc muốn thoát và hủy bỏ hành động hiện tại không?', 'Progress will be lost. Are you sure you want to exit and cancel current action?'],
  ['Tiếp tục', 'Continue'],
  ['Xác nhận thoát', 'Confirm exit'],
  ['Hover vào bất kỳ node nào để thấy action buttons (phải).', 'Hover any node to reveal action buttons (right).'],
  ['Chưa có Objective nào', 'No Objectives yet'],
  ['Bấm "+ New Objective" để bắt đầu xây dựng cây.', 'Click "+ New Objective" to start building the tree.'],
  ['Chưa có dữ liệu OKR trong Timeline này', 'No OKR data in this Timeline'],
  ['Sử dụng nút "Add template" để thêm dữ liệu mẫu vào đây.', 'Use "Add template" button to add sample data here.'],
  ['Quản lý và sử dụng các template OKR có sẵn', 'Manage and use available OKR templates'],
  ['Chưa có template nào.', 'No templates yet.'],
  ['Vui lòng chọn 1 template bên trái', 'Please select a template on the left'],
  ['Chọn Space và mốc thời gian để đưa template', 'Select Space and timeline to apply template'],
  ['vào hệ thống:', 'into the system:'],
  ['Chọn field muốn lấy từ template.', 'Select fields to take from template.'],
  ['Field không chọn sẽ dùng giá trị mặc định của hệ thống.', 'Unselected fields will use system default values.'],
  ['Cảnh báo quan trọng', 'Important Warning'],
  ['Target Context (Áp dụng vào)', 'Target Context (Apply to)'],
  ['Xem trước cách các node sẽ được tạo ra trên Timeline.', 'Preview how nodes will be created on Timeline.'],
  ['Cấu trúc OKR cuối cùng sẽ được áp dụng.', 'Final OKR structure to be applied.'],
  ['Đang apply vào:', 'Applying to:'],
  ['Fields được chọn', 'Fields selected'],
  ['Fields không được chọn (dùng giá trị mặc định)', 'Fields not selected (will use defaults)'],
  ['Fields dùng giá trị mặc định', 'Fields using default values'],
  ['Sẽ dùng giá trị mặc định của hệ thống.', 'Will use system default values.'],
  ['// Giả lập Validated Items Only', '// Simulate Validated Items Only'],
  ['SELECTABLE FIELDS - Bao gồm cả progress_percent', 'SELECTABLE FIELDS - Including progress_percent'],
  ['Left Column: Stats & Yêu cầu 1 Form', 'Left Column: Stats & Form'],
  ['Yêu cầu 1: Thêm khung nhập liệu', 'Form: Add input fields'],
  ['Thông tin Template nhập vào', 'Imported Template Information'],
  ["\"Kiểm tra\", \"Check\""],
];

for (const [from, to] of replacements) {
  let count = 0;
  while (content.includes(from)) {
    content = content.replace(from, to);
    count++;
  }
  if (count > 0) console.log(`Replaced "${from.substring(0, 40)}..." x${count}`);
}

fs.writeFileSync('src/App.jsx', content, 'utf8');
console.log('Done');
