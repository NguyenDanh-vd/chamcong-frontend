"use client";
import React, { useEffect, useState, useRef } from "react";
import { Form, message } from "antd";
import Webcam from "react-webcam";
import dayjs from "dayjs";
import AdminPage from "@/components/AdminPage";
import api from "@/utils/api";
import { API_URL } from "@/utils/config";

// Import Components đã tách
import EmployeeToolbar from "@/components/admin/nhan-vien/EmployeeToolbar";
import EmployeeTable from "@/components/admin/nhan-vien/EmployeeTable";
import EmployeeModal from "@/components/admin/nhan-vien/EmployeeModal";
import WebcamModal from "@/components/admin/nhan-vien/WebcamModal";

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
  const [fileList, setFileList] = useState<any[]>([]);
  const [cameraVisible, setCameraVisible] = useState(false);
  const webcamRef = useRef<Webcam>(null);

  // --- LOGIC API ---
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
        departmentId: nv.phongBan ? nv.phongBan.maPB : null,
        role: nv.vaiTro,
        soDienThoai: nv.soDienThoai,
        diaChi: nv.diaChi,
        cccd: nv.cccd,
        gioiTinh: nv.gioiTinh || "Không rõ",
        tuoi: nv.tuoi || null,
        ngayBatDauLam: nv.ngayBatDau ? dayjs(nv.ngayBatDau).format("DD/MM/YYYY") : "",
        ngayBatDau: nv.ngayBatDau,
        avatar: nv.avatar
          ? nv.avatar.startsWith("http")
            ? nv.avatar
            : nv.avatar.startsWith("/uploads")
            ? `${API_URL}${nv.avatar}`
            : `${API_URL}/uploads/avatars/${nv.avatar}`
          : null,
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

  // --- HANDLERS ---
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
      setFileList(
        employee.avatar
          ? [{ uid: "-1", name: "avatar.png", status: "done", url: employee.avatar }]
          : []
      );
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

  const handleSearch = (value: string) => {
    setSearchText(value);
    if (!value) {
      setFilteredEmployees(employees);
    } else {
      const lowerValue = value.toLowerCase();
      const filtered = employees.filter(
        (emp) =>
          emp.name.toLowerCase().includes(lowerValue) ||
          (emp.email && emp.email.toLowerCase().includes(lowerValue)) ||
          emp.department.toLowerCase().includes(lowerValue)
      );
      setFilteredEmployees(filtered);
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

  return (
    <AdminPage title="Quản lý nhân viên">
      {/* 1. Toolbar */}
      <EmployeeToolbar 
        searchText={searchText}
        onSearch={handleSearch}
        onAdd={() => openModal()}
        onBulkDelete={handleBulkDelete}
        selectedCount={selectedRowKeys.length}
      />

      {/* 2. Table */}
      <EmployeeTable 
        loading={loading}
        dataSource={filteredEmployees}
        selectedRowKeys={selectedRowKeys}
        onSelectChange={setSelectedRowKeys}
        onEdit={openModal}
        onDelete={handleDelete}
      />

      {/* 3. Employee Modal */}
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

      {/* 4. Webcam Modal */}
      <WebcamModal 
        open={cameraVisible}
        onCancel={() => setCameraVisible(false)}
        onCapture={capturePhoto}
        webcamRef={webcamRef}
      />
    </AdminPage>
  );
}