# ITGlobal - Cham Cong & Quan Tri Nhan Su (Frontend)

Frontend cho he thong cham cong nhan su, toi uu cho trai nghiem quan ly va van hanh thuc te.

## 1) Tong quan san pham
- Muc tieu: Tao giao dien ro rang, de dung cho nhan vien va nha quan ly.
- Dinh huong UX: Nhanh, truc quan, responsive tren desktop va mobile.
- Gia tri cho doanh nghiep:
  - Theo doi du lieu cham cong theo thoi gian thuc.
  - Don gian hoa quy trinh nghi phep, tang ca, xem luong.
  - Giam sai sot nhap lieu va thao tac thu cong.

## 2) Diem noi bat giao dien
- Tach vai tro ro rang: `Admin` va `Employee`.
- Dashboard thong ke truc quan voi bieu do va KPI.
- Tich hop cham cong/nhan dien khuon mat va dang nhap token.
- He thong bang du lieu co bo loc, tim kiem, cap nhat nhanh.
- Form nghiep vu dung `react-hook-form` + validation.

## 3) Cong nghe su dung
- Framework: Next.js 14 (App Router)
- Ngon ngu: TypeScript / JavaScript
- UI: Ant Design + Tailwind CSS
- Data & API: Axios
- Chart: Recharts
- Tien ich: Dayjs, Framer Motion, React Webcam

## 4) Cac man hinh chinh
### Khu vuc Admin
- Dashboard, Nhan vien, Phong ban, Ca lam viec
- Cham cong, Nghi phep, Lam them, Luong
- Bao cao va Profile quan tri

### Khu vuc Employee
- Home, Tai khoan
- Dang ky khuon mat
- Lich su cham cong
- Tao va theo doi don Nghi phep / Lam them

## 5) Cai dat va chay local
### Yeu cau
- Node.js 18+
- npm 9+

### Cai dependencies
```bash
npm install
```

### Bien moi truong de xuat (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_ENV=development
NEXT_PUBLIC_USE_LAN=false
```

### Chay du an
```bash
npm run dev
```
Frontend mac dinh chay tai `http://localhost:3001` (theo script hien tai).

## 6) Build production
```bash
npm run build
npm run start
```

## 7) Luu y ket noi backend
- Backend can bat CORS cho domain frontend.
- Dong bo `NEXT_PUBLIC_API_URL` voi URL backend dang chay.
- Nen khoi dong backend truoc de demo day du luong nghiep vu.

## 8) Checklist demo cho recruiter
- Dang nhap voi 2 vai tro (`Admin` / `Employee`).
- Cham cong va cap nhat lich su theo user.
- Tao don nghi phep va quy trinh duyet.
- Xem dashboard KPI, bang luong, va bao cao.
- Trinh bay responsive tren man hinh desktop + mobile.

## 9) Thong tin du an
- Team: Nhom_05
- Chu de: He thong cham cong va quan tri nhan su
- Backend: `../backend` (chay cung de demo fullstack)
