"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card, Col, Form, Progress, Row, Space, Tag, Typography, message } from "antd";
import {
  TeamOutlined,
  ApartmentOutlined,
  UserSwitchOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import Webcam from "react-webcam";
import dayjs from "dayjs";
import AdminPage from "@/components/AdminPage";
import api from "@/utils/api";
import { API_URL } from "@/utils/config";

import EmployeeToolbar from "@/components/admin/nhan-vien/EmployeeToolbar";
import EmployeeTable from "@/components/admin/nhan-vien/EmployeeTable";
import EmployeeModal from "@/components/admin/nhan-vien/EmployeeModal";
import WebcamModal from "@/components/admin/nhan-vien/WebcamModal";

const { Text } = Typography;

const normalizeAvatarUrl = (avatar?: string | null) => {
  if (!avatar) return null;
  const raw = String(avatar).trim();
  if (!raw) return null;
  if (raw.startsWith("http://") || raw.startsWith("https://")) return encodeURI(raw);
  if (raw.startsWith("/uploads")) return encodeURI(`${API_URL}${raw}`);
  if (raw.startsWith("uploads/")) return encodeURI(`${API_URL}/${raw}`);
  if (raw.startsWith("/")) return encodeURI(`${API_URL}${raw}`);
  return encodeURI(`${API_URL}/uploads/avatars/${raw}`);
};

export default function AdminNhanVien() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [fileList, setFileList] = useState<any[]>([]);
  const [cameraVisible, setCameraVisible] = useState(false);
  const webcamRef = useRef<Webcam>(null);

  const fetchDepartments = async () => {
    try {
      const res = await api.get("/phongban");
      setDepartments(res.data);
    } catch {
      message.error("Không thể tải danh sách phòng ban");
    }
  };

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/nhanvien", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const mapped = res.data.map((nv: any) => ({
        key: nv.maNV,
        code: nv.maNV,
        name: nv.hoTen,
        email: nv.email,
        department: nv.phongBan ? nv.phongBan.tenPhong : "Chưa phân phòng",
        departmentId: nv.phongBan ? String(nv.phongBan.maPB) : null,
        role: nv.vaiTro,
        soDienThoai: nv.soDienThoai,
        diaChi: nv.diaChi,
        cccd: nv.cccd,
        gioiTinh: nv.gioiTinh || "Không rõ",
        tuoi: nv.tuoi || null,
        ngayBatDauLam: nv.ngayBatDau ? dayjs(nv.ngayBatDau).format("DD/MM/YYYY") : "",
        ngayBatDau: nv.ngayBatDau,
        avatar: normalizeAvatarUrl(nv.avatarUrl || nv.avatar),
      }));

      setEmployees(mapped);
      setFilteredEmployees(mapped);
    } catch {
      message.error("Không thể tải danh sách nhân viên");
    }
    setLoading(false);
  };

  useEffect(() => {
    const fetchAll = async () => {
      await fetchDepartments();
      await fetchEmployees();
    };
    fetchAll();
  }, []);

  useEffect(() => {
    const lowerValue = searchText.trim().toLowerCase();

    const filtered = employees.filter((emp) => {
      const matchSearch =
        !lowerValue ||
        emp.name?.toLowerCase().includes(lowerValue) ||
        emp.email?.toLowerCase().includes(lowerValue) ||
        emp.department?.toLowerCase().includes(lowerValue) ||
        String(emp.code).toLowerCase().includes(lowerValue);

      const matchDepartment = selectedDepartment === "all" || emp.departmentId === selectedDepartment;
      const matchRole = selectedRole === "all" || emp.role === selectedRole;

      return matchSearch && matchDepartment && matchRole;
    });

    setFilteredEmployees(filtered);
  }, [employees, searchText, selectedDepartment, selectedRole]);

  const roleOptions = useMemo(() => {
    const roleSet = new Set<string>();
    employees.forEach((emp) => {
      if (emp.role) roleSet.add(emp.role);
    });
    return Array.from(roleSet);
  }, [employees]);

  const dashboardStats = useMemo(() => {
    const total = employees.length;
    const totalDepartments = new Set(employees.map((emp) => emp.departmentId).filter(Boolean)).size;
    const adminAndHr = employees.filter((emp) => ["quantrivien", "nhansu"].includes(emp.role)).length;
    const visible = filteredEmployees.length;
    const adminHrRate = total > 0 ? (adminAndHr / total) * 100 : 0;
    const visibleRate = total > 0 ? (visible / total) * 100 : 0;

    return [
      {
        title: "Tổng nhân viên",
        value: total,
        suffix: "người",
        description: "Tổng dữ liệu nhân sự",
        icon: <TeamOutlined />,
        color: "#0b5ed7",
        bg: "linear-gradient(150deg, #eef6ff 0%, #dbeeff 55%, #cfe7ff 100%)",
        progress: 100,
      },
      {
        title: "Phòng ban",
        value: totalDepartments,
        suffix: "đơn vị",
        description: "Đang quản lý",
        icon: <ApartmentOutlined />,
        color: "#0284c7",
        bg: "linear-gradient(150deg, #effcff 0%, #d9f3ff 55%, #c8ecff 100%)",
        progress: 100,
      },
      {
        title: "Quản lý + HR",
        value: adminAndHr,
        suffix: "tài khoản",
        description: `Tỷ lệ: ${adminHrRate.toFixed(1)}%`,
        icon: <UserSwitchOutlined />,
        color: "#0369a1",
        bg: "linear-gradient(150deg, #ebfbff 0%, #d6f3ff 55%, #c4ebff 100%)",
        progress: adminHrRate,
      },
      {
        title: "Kết quả lọc",
        value: visible,
        suffix: "hiển thị",
        description: `Tỷ lệ hiển thị: ${visibleRate.toFixed(1)}%`,
        icon: <CheckCircleOutlined />,
        color: "#2563eb",
        bg: "linear-gradient(150deg, #f2f7ff 0%, #e2edff 55%, #d4e5ff 100%)",
        progress: visibleRate,
      },
    ];
  }, [employees, filteredEmployees]);

  const openModal = (employee?: any) => {
    form.setFieldsValue({ newPassword: "", confirm: "" });
    if (employee) {
      setEditingEmployee(employee);
      form.setFieldsValue({
        hoTen: employee.name,
        email: employee.email,
        vaiTro: employee.role,
        maPB: employee.departmentId,
        soDienThoai: employee.soDienThoai,
        gioiTinh: employee.gioiTinh || null,
        tuoi: employee.tuoi ? Number(employee.tuoi) : null,
        diaChi: employee.diaChi,
        cccd: employee.cccd,
        ngayBatDau: employee.ngayBatDau ? dayjs(employee.ngayBatDau) : null,
      });
      setFileList(employee.avatar ? [{ uid: "-1", name: "avatar.png", status: "done", url: employee.avatar }] : []);
    } else {
      setEditingEmployee(null);
      form.resetFields();
      setFileList([]);
    }
    setModalVisible(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const token = localStorage.getItem("token");

      if (editingEmployee) {
        const textDataPayload = {
          hoTen: values.hoTen,
          email: values.email,
          vaiTro: values.vaiTro,
          maPB: values.maPB,
          soDienThoai: values.soDienThoai,
          gioiTinh: values.gioiTinh || null,
          tuoi: values.tuoi ? Number(values.tuoi) : null,
          diaChi: values.diaChi,
          cccd: values.cccd,
          ngayBatDau: values.ngayBatDau ? values.ngayBatDau.format("YYYY-MM-DD") : null,
        };

        await api.put(`/nhanvien/${editingEmployee.code}`, textDataPayload);

        const hasNewFile = fileList.length > 0 && fileList[0].originFileObj;
        if (hasNewFile) {
          const avatarFormData = new FormData();
          avatarFormData.append("avatar", fileList[0].originFileObj);
          await api.post(`/nhanvien/${editingEmployee.code}/avatar`, avatarFormData, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          });
        }

        if (values.newPassword) {
          await api.patch(
            `/nhanvien/${editingEmployee.code}/reset-password-admin`,
            { newPassword: values.newPassword },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
        }
        message.success("Cập nhật nhân viên thành công");
      } else {
        const createPayload = {
          ...values,
          ngayBatDau: values.ngayBatDau ? values.ngayBatDau.format("YYYY-MM-DD") : null,
        };
        const response = await api.post("/nhanvien", createPayload);
        const newEmployee = response.data;
        const hasNewFile = fileList.length > 0 && fileList[0].originFileObj;
        if (hasNewFile && newEmployee && newEmployee.maNV) {
          const avatarFormData = new FormData();
          avatarFormData.append("avatar", fileList[0].originFileObj);
          await api.post(`/nhanvien/${newEmployee.maNV}/avatar`, avatarFormData);
        }
        message.success("Thêm nhân viên thành công");
      }

      setModalVisible(false);
      fetchEmployees();
    } catch (err: any) {
      console.error("Lỗi khi lưu nhân viên:", err);
      const errorMessage = err.response?.data?.message || "Lưu nhân viên thất bại";
      message.error(Array.isArray(errorMessage) ? errorMessage.join(", ") : errorMessage);
    }
  };

  const handleDelete = async (code: string) => {
    try {
      await api.delete(`/nhanvien/${code}`);
      message.success("Xóa nhân viên thành công");
      fetchEmployees();
    } catch {
      message.error("Xóa nhân viên thất bại");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning("Vui lòng chọn ít nhất một nhân viên để xóa");
      return;
    }
    try {
      await Promise.all(selectedRowKeys.map((id) => api.delete(`/nhanvien/${id}`)));
      message.success("Đã xóa nhân viên đã chọn");
      setSelectedRowKeys([]);
      fetchEmployees();
    } catch {
      message.error("Xóa nhân viên thất bại");
    }
  };

  const capturePhoto = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      const byteString = atob(imageSrc.split(",")[1]);
      const mimeString = imageSrc.split(",")[0].split(":")[1].split(";")[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
      const blob = new Blob([ab], { type: mimeString });
      const file = new File([blob], "avatar.jpg", { type: mimeString });
      setFileList([{ uid: "-2", name: "avatar.jpg", status: "done", originFileObj: file, url: imageSrc }]);
      setCameraVisible(false);
    }
  };

  const resetFilters = () => {
    setSearchText("");
    setSelectedDepartment("all");
    setSelectedRole("all");
  };

  return (
    <AdminPage title="Quản lý nhân viên">
      <Space direction="vertical" size={18} style={{ width: "100%" }}>
        <Card
          className="employee-overview-card"
          bordered={false}
          style={{
            borderRadius: 20,
            background: "linear-gradient(135deg, #0f2a60 0%, #134e8f 42%, #0f8ac9 100%)",
            boxShadow: "0 18px 38px rgba(15, 42, 96, 0.28)",
          }}
          bodyStyle={{ padding: 24 }}
        >
          <div
            style={{
              marginBottom: 14,
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              alignItems: "flex-start",
              flexWrap: "wrap",
            }}
          >
            <div>
              <Text style={{ color: "#f8fbff", fontWeight: 800, fontSize: 24 }}>
                Trung tâm điều phối nhân sự
              </Text>
              <div style={{ marginTop: 8 }}>
                <Text style={{ color: "rgba(241,245,249,0.9)" }}>
                  Quản lý nhân sự, lọc nhanh dữ liệu và xử lý cập nhật thông tin trên một màn hình.
                </Text>
              </div>
            </div>
            <Space size={8} wrap>
              <Tag color="cyan">Hiển thị: {filteredEmployees.length}</Tag>
              <Tag color="blue">Tổng: {employees.length}</Tag>
            </Space>
          </div>

          <Row gutter={[16, 16]}>
            {dashboardStats.map((stat) => (
              <Col xs={24} sm={12} lg={6} key={stat.title}>
                <Card
                  className="employee-stat-card"
                  bordered={false}
                  style={{
                    borderRadius: 18,
                    background: stat.bg,
                    minHeight: 168,
                    boxShadow: "inset 0 0 0 1px rgba(12, 74, 110, 0.14), 0 14px 24px rgba(12, 74, 110, 0.16)",
                  }}
                  bodyStyle={{ padding: "16px 16px 14px" }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ color: "#0f172a", fontSize: 13, fontWeight: 700 }}>{stat.title}</span>
                    <span
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 12,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: stat.color,
                        background: "rgba(255,255,255,0.72)",
                        boxShadow: "0 6px 14px rgba(12, 74, 110, 0.18)",
                        fontSize: 16,
                      }}
                    >
                      {stat.icon}
                    </span>
                  </div>

                  <div style={{ marginTop: 12, display: "flex", alignItems: "baseline", gap: 6 }}>
                    <span style={{ color: stat.color, fontWeight: 900, fontSize: 30, lineHeight: 1 }}>
                      {Number(stat.value || 0).toLocaleString("vi-VN")}
                    </span>
                    <span style={{ fontSize: 11, color: "#0f172a", fontWeight: 700 }}>{stat.suffix}</span>
                  </div>
                  <Text style={{ color: "#334155", fontSize: 12, fontWeight: 500 }}>{stat.description}</Text>
                  <Progress
                    percent={Number(stat.progress.toFixed(1))}
                    size="small"
                    strokeColor={stat.color}
                    trailColor="rgba(148, 163, 184, 0.26)"
                    showInfo={false}
                    style={{ marginTop: 10, marginBottom: 0 }}
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </Card>

        <EmployeeToolbar
          searchText={searchText}
          onSearch={setSearchText}
          onAdd={() => openModal()}
          onBulkDelete={handleBulkDelete}
          selectedCount={selectedRowKeys.length}
          totalCount={employees.length}
          selectedDepartment={selectedDepartment}
          onDepartmentChange={setSelectedDepartment}
          departmentOptions={departments.map((pb: any) => ({ value: String(pb.maPB), label: pb.tenPhong }))}
          selectedRole={selectedRole}
          onRoleChange={setSelectedRole}
          roleOptions={roleOptions}
          onResetFilters={resetFilters}
        />

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Tag color="processing">Hiển thị: {filteredEmployees.length}</Tag>
          <Tag color="default">Tổng: {employees.length}</Tag>
          {selectedRowKeys.length > 0 ? <Tag color="error">Đã chọn: {selectedRowKeys.length}</Tag> : null}
        </div>

        <EmployeeTable
          loading={loading}
          dataSource={filteredEmployees}
          selectedRowKeys={selectedRowKeys}
          onSelectChange={setSelectedRowKeys}
          onEdit={openModal}
          onDelete={handleDelete}
        />
      </Space>

      <EmployeeModal
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSave}
        form={form}
        editingEmployee={editingEmployee}
        departments={departments}
        fileList={fileList}
        setFileList={setFileList}
        onOpenCamera={() => setCameraVisible(true)}
      />

      <WebcamModal
        open={cameraVisible}
        onCancel={() => setCameraVisible(false)}
        onCapture={capturePhoto}
        webcamRef={webcamRef}
      />

      <style jsx global>{`
        .employee-stat-card {
          transition:
            transform 220ms ease,
            box-shadow 220ms ease,
            filter 220ms ease;
          will-change: transform;
        }
        .employee-stat-card:hover {
          transform: translateY(-5px);
          box-shadow:
            inset 0 0 0 1px rgba(12, 74, 110, 0.2),
            0 18px 30px rgba(12, 74, 110, 0.24) !important;
          filter: saturate(1.04);
        }
        .employee-overview-card {
          overflow: hidden;
          position: relative;
        }
        .employee-overview-card::after {
          content: "";
          position: absolute;
          inset: auto -80px -100px auto;
          width: 280px;
          height: 280px;
          background: radial-gradient(circle, rgba(125, 211, 252, 0.34) 0%, rgba(125, 211, 252, 0) 70%);
          pointer-events: none;
        }
      `}</style>
    </AdminPage>
  );
}
