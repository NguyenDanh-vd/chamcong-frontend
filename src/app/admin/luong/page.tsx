"use client";

import { useEffect, useState } from "react";
import {
  Table,
  DatePicker,
  message,
  Space,
  Tag,
  Popconfirm,
  Modal,
  Form,
  InputNumber,
  Select,
  ConfigProvider,
} from "antd";
import {
  FileExcelOutlined,
  CalculatorOutlined,
  ReloadOutlined,
  EditOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import * as XLSX from "xlsx-js-style";
import api from "@/utils/api";
import AdminPage from "@/components/AdminPage";
import CustomButton from "@/components/CustomButton";
import "dayjs/locale/vi";
import viVN from "antd/locale/vi_VN";

// 🕒 Định dạng tổng giờ làm
function formatHours(hours: number | null): string {
  if (!hours || hours <= 0.01) return "-";
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  const totalHours = h + Math.floor(m / 60);
  const remainingMinutes = m % 60;

  if (totalHours > 0 && remainingMinutes > 0)
    return `${totalHours} giờ ${remainingMinutes} phút`;
  if (totalHours > 0) return `${totalHours} giờ`;
  return `${remainingMinutes} phút`;
}

const LuongPage = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [thang, setThang] = useState(dayjs());
  const [tinhLuongLoading, setTinhLuongLoading] = useState(false);
  const [updating, setUpdating] = useState<number | null>(null);
  const [editing, setEditing] = useState<any>(null);
  const [form] = Form.useForm();

  // 🔹 Lấy danh sách lương
  const fetchLuong = async () => {
    try {
      setLoading(true);
      const res = await api.get("/luong");
      setData(res.data);
    } catch (err) {
      console.error(err);
      message.error("Không thể tải dữ liệu lương");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Gọi API tính lương tự động
  const tinhLuong = async () => {
    try {
      setTinhLuongLoading(true);
      const res = await api.post("/luong/tinh-luong", {
        thang: thang.format("YYYY-MM"),
      });
      message.success(res.data.message || "Đã tính lương tự động");
      fetchLuong();
    } catch (err) {
      console.error(err);
      message.error("Không thể tính lương");
    } finally {
      setTinhLuongLoading(false);
    }
  };

  // 🔹 Đánh dấu đã trả lương
  const danhDauDaTra = async (id: number) => {
    try {
      setUpdating(id);
      await api.patch(`/luong/${id}/da-tra`);
      message.success("Đã đánh dấu đã trả lương");
      fetchLuong();
    } catch (err) {
      console.error(err);
      message.error("Không thể cập nhật trạng thái");
    } finally {
      setUpdating(null);
    }
  };

  // 🔹 Mở modal chỉnh sửa
  const openEditModal = (record: any) => {
    setEditing(record);
    form.setFieldsValue(record);
  };

  const closeEditModal = () => {
    setEditing(null);
    form.resetFields();
  };

  // 🔹 Cập nhật lương
  const updateLuong = async () => {
    try {
      const values = await form.validateFields();
      await api.patch(`/luong/${editing.maLuong}/chinh-sua`, values);
      message.success("Cập nhật lương thành công");
      fetchLuong();
      closeEditModal();
    } catch (err) {
      console.error(err);
      message.error("Không thể cập nhật lương");
    }
  };

  // 🔹 Xuất Excel
  const exportExcel = () => {
    if (!data.length) {
      message.warning("Không có dữ liệu để xuất");
      return;
    }

    const sheetData = [
      [
        "Mã NV",
        "Họ tên",
        "Tháng",
        "Tổng giờ làm",
        "Lương cơ bản",
        "Thưởng",
        "Phạt",
        "Làm thêm",
        "Tổng lương",
        "Trạng thái",
      ],
      ...data.map((item: any) => [
        item.nhanVien?.maNV,
        item.nhanVien?.hoTen,
        item.thang,
        formatHours(item.tongGioLam),
        item.luongCoBan,
        item.thuong,
        item.phat,
        item.lamThem,
        item.tongLuong,
        item.trangThai === "da-tra" ? "Đã trả" : "Chưa trả",
      ]),
    ];

    const ws = XLSX.utils.aoa_to_sheet(sheetData);

  // 🔹 Thêm style cho tất cả ô
    const range = XLSX.utils.decode_range(ws["!ref"] || "A1");
      for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
           if (!ws[cellRef]) continue;

          // Header style
        if (R === 0) {
            ws[cellRef].s = {
              font: { bold: true, color: { rgb: "FFFFFF" } },
              fill: { fgColor: { rgb: "3b82f6" } }, // xanh lam gradient chính
              alignment: { horizontal: "center", vertical: "center" },
              border: {
                top: { style: "thin", color: { rgb: "AAAAAA" } },
                bottom: { style: "thin", color: { rgb: "AAAAAA" } },
                left: { style: "thin", color: { rgb: "AAAAAA" } },
                right: { style: "thin", color: { rgb: "AAAAAA" } },
              },
            };
          } else {
           // Body style
              ws[cellRef].s = {
                alignment: { horizontal: "center", vertical: "center" },
                  border: {
                    top: { style: "thin", color: { rgb: "DDDDDD" } },
                    bottom: { style: "thin", color: { rgb: "DDDDDD" } },
                    left: { style: "thin", color: { rgb: "DDDDDD" } },
                    right: { style: "thin", color: { rgb: "DDDDDD" } },
                  },
              };
          }
        }
      }

          // 🔹 Tự động co giãn độ rộng cột
    const colWidths = sheetData[0].map((_, i) => {
        const maxLength = Math.max(
         ...sheetData.map((row) => String(row[i] || "").length)
        );
          return { wch: Math.min(maxLength + 2, 30) }; // giới hạn tối đa 30 ký tự
      });
        ws["!cols"] = colWidths;

        // 🔹 Ghi workbook
    const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Luong");

      XLSX.writeFile(wb, `Luong_${thang.format("YYYY_MM")}.xlsx`);
      message.success("Đã xuất file Excel");
  };

  useEffect(() => {
    fetchLuong();
  }, []);

  // 🔹 Cột bảng
  const columns = [
    { title: "Mã NV", dataIndex: ["nhanVien", "maNV"], key: "maNV", width: 90 },
    { title: "Họ tên", dataIndex: ["nhanVien", "hoTen"], key: "hoTen", width: 200 },
    { title: "Tháng", dataIndex: "thang", key: "thang", width: 150 },
    {
      title: "Tổng giờ làm",
      dataIndex: "tongGioLam",
      key: "tongGioLam",
      render: (value: number) => formatHours(value),
      width: 130,
    },
    { title: "Lương cơ bản", dataIndex: "luongCoBan", key: "luongCoBan", width: 150 },
    { title: "Thưởng", dataIndex: "thuong", key: "thuong", width: 120 },
    { title: "Phạt", dataIndex: "phat", key: "phat", width: 120 },
    { title: "Làm thêm", dataIndex: "lamThem", key: "lamThem", width: 120 },
    { title: "Tổng lương", dataIndex: "tongLuong", key: "tongLuong", width: 160 },
    {
      title: "Trạng thái",
      dataIndex: "trangThai",
      width: 120,
      render: (value: string) =>
        value === "da-tra" ? (
          <Tag color="green">Đã trả</Tag>
        ) : (
          <Tag color="red">Chưa trả</Tag>
        ),
    },
    {
      title: "Hành động",
      key: "action",
      width: 130,
      render: (_: any, record: any) => (
        <Space>
          <CustomButton
            icon={<EditOutlined />}
            type="primary"
            onClick={() => openEditModal(record)}
            title="Chỉnh sửa"
            style={{
              background: "linear-gradient(135deg, #06b6d4, #3b82f6)",
              color: "#fff",
              border: "none",
              fontWeight: 600,
              borderRadius: "8px",
              padding: "8px 20px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              transition: "all 0.3s ease",
            }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.opacity = "0.9";
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.opacity = "1";
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
              }}
            />

            {record.trangThai !== "da-tra" && (
               <Popconfirm
                 title="Xác nhận trả lương?"
                 onConfirm={() => danhDauDaTra(record.maLuong)}
                >
               <CustomButton
                 icon={<CheckCircleOutlined />}
                 type="primary"
                 title="Đã trả"
                 onClick={() => danhDauDaTra(record.maLuong)}
                 style={{
                   background: "linear-gradient(135deg, #2ed71bff, #1cbc47ff)",
                   color: "#fff",
                   border: "none",
                   fontWeight: 600,
                   borderRadius: "8px",
                   padding: "8px 20px",
                   boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                   transition: "all 0.3s ease",
                  }}
                   onMouseEnter={(e) => {
                   (e.currentTarget as HTMLButtonElement).style.opacity = "0.9";
                   (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
                  }}
                   onMouseLeave={(e) => {
                   (e.currentTarget as HTMLButtonElement).style.opacity = "1";
                   (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                  }}
                   loading={updating === record.maLuong}
                  >
                  Đã trả
                </CustomButton>
              </Popconfirm>
            )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 20 }}>
        Quản lý lương nhân viên
      </h1>

      <Space style={{ marginBottom: 16, flexWrap: "wrap" }}>
        <DatePicker
          picker="month"
          value={thang}
          onChange={(val) => val && setThang(val)}
          format="YYYY-MM"
        />

        <CustomButton
          icon={<CalculatorOutlined />}
          onClick={tinhLuong}
          loading={tinhLuongLoading}
        >
          Tính lương tự động
        </CustomButton>

        <CustomButton icon={<ReloadOutlined />} onClick={fetchLuong}>
          Làm mới
        </CustomButton>

        <CustomButton
          icon={<FileExcelOutlined />}
          onClick={exportExcel}
          style={{
            background: "linear-gradient(90deg, #22c55e, #16a34a)",
          }}
        >
          Xuất Excel
        </CustomButton>
      </Space>

      <Table
        rowKey="maLuong"
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{ pageSize: 10 }}
        bordered
        scroll={{ x: "max-content" }}
      />

      {/* 🔹 Modal chỉnh sửa */}
      <Modal
        title="Chỉnh sửa lương"
        open={!!editing}
        onCancel={closeEditModal}
        onOk={updateLuong}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item label="Lương cơ bản" name="luongCoBan">
            <InputNumber style={{ width: "100%" }} min={0} />
          </Form.Item>
          <Form.Item label="Thưởng" name="thuong">
            <InputNumber style={{ width: "100%" }} min={0} />
          </Form.Item>
          <Form.Item label="Phạt" name="phat">
            <InputNumber style={{ width: "100%" }} min={0} />
          </Form.Item>
          <Form.Item label="Làm thêm" name="lamThem">
            <InputNumber style={{ width: "100%" }} min={0} />
          </Form.Item>
          <Form.Item label="Trạng thái" name="trangThai">
            <Select
              options={[
                { label: "Chưa trả", value: "chua-tra" },
                { label: "Đã trả", value: "da-tra" },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default function Page() {
  return (
    <ConfigProvider locale={viVN}>
      <AdminPage title="Quản lý lương nhân viên">
        <LuongPage />
      </AdminPage>
    </ConfigProvider>
  );
}
