<div align="center">
  <a href="https://nextjs.org/" target="_blank">
    <img src="https://cdn.worldvectorlogo.com/logos/next-js.svg" alt="Next.js Logo" width="150" />
  </a>
  
  <h1>💻 ITGlobal - Chấm Công & Quản Trị Nhân Sự (Frontend)</h1>
  
  <p><i>Giao diện người dùng tối ưu, trực quan và phản hồi nhanh cho hệ thống quản lý nhân sự và chấm công.</i></p>

  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Ant_Design-0170FE?style=for-the-badge&logo=antdesign&logoColor=white" alt="Ant Design" />
</div>

<hr />

## 🎯 1. Tổng quan sản phẩm
- **Mục tiêu:** Tạo giao diện rõ ràng, dễ sử dụng cho cả nhân viên và nhà quản lý.
- **Định hướng UX/UI:** Tốc độ phản hồi nhanh, trực quan, hỗ trợ hiển thị tốt (responsive) trên cả desktop và mobile.
- **Giá trị cho doanh nghiệp:**
  - Theo dõi dữ liệu chấm công theo thời gian thực.
  - Đơn giản hóa quy trình xin nghỉ phép, đăng ký tăng ca và xem bảng lương.
  - Giảm thiểu sai sót do nhập liệu và thao tác thủ công.

## ✨ 2. Điểm nổi bật giao diện
- **Phân quyền rõ ràng:** Tách biệt không gian làm việc giữa `Admin` (Quản trị viên) và `Employee` (Nhân viên).
- **Dashboard trực quan:** Thống kê dữ liệu, KPI bằng biểu đồ sinh động.
- **Tích hợp Camera:** Hỗ trợ tính năng chấm công và đăng ký nhận diện khuôn mặt trực tiếp trên trình duyệt.
- **Quản lý dữ liệu mạnh mẽ:** Hệ thống bảng (Data Table) tích hợp bộ lọc, tìm kiếm và cập nhật nhanh.
- **Form chuyên nghiệp:** Quản lý state và validate form hiệu quả với `react-hook-form`.

## 🚀 3. Công nghệ sử dụng
- **Framework:** Next.js 14 (App Router)
- **Ngôn ngữ:** TypeScript / JavaScript
- **UI Components:** Ant Design + Tailwind CSS
- **Data Fetching:** Axios
- **Biểu đồ:** Recharts
- **Tiện ích đi kèm:** Dayjs (xử lý thời gian), Framer Motion (hiệu ứng mượt mà), React Webcam (chụp ảnh khuôn mặt)

## 📂 4. Cấu trúc màn hình chính

### 🛡️ Khu vực Admin (Quản trị viên)
| Chức năng | Mô tả |
| :--- | :--- |
| 📊 **Dashboard** | Tổng quan thống kê và biểu đồ KPI. |
| 👥 **Nhân sự** | Quản lý nhân viên, phòng ban và ca làm việc. |
| ⏰ **Nghiệp vụ** | Quản lý chấm công, duyệt đơn nghỉ phép, duyệt làm thêm. |
| 💰 **Tài chính & Báo cáo**| Quản lý bảng lương và xuất báo cáo. |
| ⚙️ **Hệ thống** | Cài đặt và quản lý Profile quản trị. |

### 🧑‍💻 Khu vực Employee (Nhân viên)
| Chức năng | Mô tả |
| :--- | :--- |
| 🏠 **Trang chủ** | Xem thông tin cá nhân và tổng quan tài khoản. |
| 📸 **Face ID** | Đăng ký khuôn mặt để hệ thống AI nhận diện. |
| 🗓️ **Chấm công** | Xem lịch sử chấm công cá nhân. |
| 📝 **Đăng ký** | Tạo và theo dõi tiến độ đơn xin Nghỉ phép / Làm thêm. |

## ⚙️ 5. Hướng dẫn cài đặt

### Yêu cầu hệ thống
- Node.js 18+
- npm 9+

### Cài đặt dependencies
Mở Terminal tại thư mục `frontend` và chạy lệnh:
```bash
npm install
```

## Biến môi trường (.env.local)
Tạo file `.env.local` ở thư mục gốc của frontend và cấu hình các biến sau:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_ENV=development
NEXT_PUBLIC_USE_LAN=false
```

## 🏃‍♂️ 6. Chạy dự án
```bash
# Chế độ Development (Dùng khi đang code)
npm run dev

# Đóng gói dự án (Build để chuẩn bị deploy)
npm run build

# Chế độ Production (Chạy bản đã build ở local)
npm run start
```

Lưu ý: Mặc định Frontend sẽ khởi chạy tại `http://localhost:3001`.

## 🔗 7. Lưu ý kết nối Backend
- Đảm bảo Backend đã bật CORS để cho phép tên miền của Frontend gọi API.
- Biến `NEXT_PUBLIC_API_URL` phải trỏ đúng vào địa chỉ URL mà Backend đang chạy (VD: `http://localhost:3000`).
- Khuyến nghị: Nên khởi động Backend trước khi chạy Frontend để có thể demo đầy đủ luồng nghiệp vụ không bị gián đoạn.

## 💼 8. Định hướng demo (Cho Recruiter)
Để buổi phỏng vấn diễn ra trơn tru và ghi điểm cao, bạn nên chuẩn bị kịch bản demo theo checklist sau:

- [ ] Đăng nhập đa luồng: Mở 2 trình duyệt (hoặc 1 tab ẩn danh) để demo song song vai trò Admin và Employee.
- [ ] Chấm công Face ID: Demo tính năng webcam nhận diện khuôn mặt và xem lịch sử cập nhật ngay lập tức.
- [ ] Quy trình tương tác: Dùng tài khoản Employee tạo đơn nghỉ phép -> Chuyển sang Admin duyệt đơn -> Quay lại xem trạng thái cập nhật.
- [ ] Dashboard & Báo cáo: Show biểu đồ thống kê đẹp mắt và tính năng xem bảng lương.
- [ ] Responsive: Thu nhỏ cửa sổ trình duyệt hoặc bật chế độ Device Mode (F12) để khoe giao diện hiển thị tốt trên Mobile.

![Màn hình Dashboard](https://github.com/user-attachments/assets/6fe7c11c-8b1d-4060-8174-cdebb245ade8)
*Hình 1: Giao diện Dashboard thống kê KPI và quản trị nhân sự.*

![Màn hình Trang Chấm Công](https://github.com/user-attachments/assets/45d363fe-e127-428f-8e05-abe3148502e5)
*Hình 2: Giao diện trang chấm công tích hợp nhận diện khuôn mặt (Face ID).*

## 👥 9. Tác giả & Thông tin dự án
- Team thực hiện: Nhóm_05
- Môn học / Chủ đề: Hệ thống chấm công và quản trị nhân sự
- Backend API: Thư mục `../backend` (Cần chạy song song để hệ thống hoạt động đầy đủ)

