//Chứa các hàm phụ trợ như mapping vai trò.

export const roleMap: Record<string, { label: string; color: string }> = {
  quantrivien: { label: "Quản trị viên", color: "red" },
  nhansu: { label: "Nhân sự", color: "gold" },
  nhanvien: { label: "Nhân viên", color: "blue" },
};

export const getRole = (role: string | undefined) => {
  if (!role) return { label: "Chưa có vai trò", color: "default" };
  return roleMap[role.toLowerCase()] || { label: role, color: "default" };
};