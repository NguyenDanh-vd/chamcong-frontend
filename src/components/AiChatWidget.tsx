"use client";

import { useState, useEffect, KeyboardEvent } from "react";
import axios from "axios";
import { MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { API_URL } from "@/utils/config";
import { motion, AnimatePresence } from "framer-motion";

type Message = {
  role: "user" | "ai";
  text: string;
};

interface AiChatWidgetProps {
  employeeId: number; 
  role: string;       
}

export default function AiChatWidget({ employeeId, role }: AiChatWidgetProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // id đang chọn trong dropdown (admin chọn người khác; nhân viên = chính mình)
  const [selectedId, setSelectedId] = useState<number>(employeeId);

  const [employees, setEmployees] = useState<{ maNV: number; hoTen: string }[]>(
    []
  );

  // Chuẩn hóa role theo BE
  const apiRole = role === "Admin" ? "quantrivien" : "nhanvien";

  // 🔹 Lấy danh sách nhân viên nếu là admin
  useEffect(() => {
    if (apiRole === "quantrivien") {
      axios
        .get(`${API_URL}/nhanvien`, {
          // withCredentials: true, // bật nếu BE dùng cookie
        })
        .then((res) => {
          const list = Array.isArray(res.data) ? res.data : [];
          setEmployees(list);
          // nếu chưa có selectedId, đặt mặc định theo phần tử đầu
          if (!selectedId && list.length) setSelectedId(list[0].maNV);
        })
        .catch(() => setEmployees([]));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiRole]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Tạo payload khớp BE:
      // - Admin hỏi 1 người => targetId
      // - Admin hỏi tổng quan => không gửi id
      // - Nhân viên => employeeId
      const payload: any = { question: userMessage.text, role: apiRole };

      if (apiRole === "quantrivien") {
        if (selectedId) payload.targetId = selectedId; // admin hỏi người cụ thể
        // nếu muốn hỏi tổng quan, có thể xoá selectedId trước khi bấm Gửi
      } else {
        payload.employeeId = selectedId || employeeId; // nhân viên tự hỏi mình
      }

      const { data } = await axios.post(`${API_URL}/ai/chat`, payload, {
        // withCredentials: true,
      });

      setMessages((prev) => [
        ...prev,
        { role: "ai", text: data?.reply ?? "Không có phản hồi từ AI." },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "⚠️ Lỗi khi gửi tin nhắn đến AI." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") sendMessage();
  };

  // mode = "one" (tóm tắt 1 người) | "all" (tóm tắt toàn bộ – chỉ cho admin)
  const summarize = async (mode: "one" | "all" = "one") => {
    setLoading(true);
    try {
      const payload: any = { role: apiRole };

      if (apiRole === "quantrivien") {
        if (mode === "one") {
          payload.targetId = selectedId; // admin tóm tắt 1 người
        }
        // mode === "all" => không gửi id -> BE hiểu là tổng quan
      } else {
        payload.employeeId = selectedId || employeeId; // nhân viên tóm tắt bản thân
      }

      const { data } = await axios.post(`${API_URL}/ai/summarize`, payload, {
        // withCredentials: true,
      });

      setMessages((prev) => [
        ...prev,
        { role: "ai", text: `📊 ${data?.summary ?? "Không có dữ liệu."}` },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "⚠️ Không thể lấy dữ liệu tóm tắt." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* 🔹 Nút mở widget */}
      {!open && (
        <Button
          onClick={() => setOpen(true)}
          className="fixed bottom-24 right-6 rounded-full w-14 h-14 shadow-lg z-50 bg-blue-600 hover:bg-blue-700 transition-all"
        >
          <MessageCircle size={24} />
        </Button>
      )}

      {/* 🔹 Widget Chat */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="fixed bottom-24 right-6 w-96 shadow-2xl border border-gray-300 z-50 bg-white">
              <CardHeader className="flex justify-between items-center border-b pb-2">
                <CardTitle>🤖 Trợ lý AI – ITGlobal+</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                  <X />
                </Button>
              </CardHeader>

              <CardContent>
                {/* 🔸 Dropdown chọn nhân viên (chỉ cho admin) */}
                {apiRole === "quantrivien" && (
                  <div className="mb-3">
                    <label className="text-sm font-semibold text-gray-700">
                      Chọn nhân viên:
                    </label>
                    <select
                      className="w-full mt-1 border rounded-md px-2 py-1"
                      value={selectedId}
                      onChange={(e) => setSelectedId(Number(e.target.value))}
                    >
                      {employees.map((nv) => (
                        <option key={nv.maNV} value={nv.maNV}>
                          {nv.hoTen}
                        </option>
                      ))}
                    </select>

                    {/* Gợi ý nhỏ: nếu muốn hỏi tổng quan, xoá chọn để không gửi targetId */}
                    <div className="text-xs text-gray-500 mt-1">
                      Mẹo: đặt “Tóm tắt toàn bộ” để xem tổng quan không theo nhân viên.
                    </div>
                  </div>
                )}

                <div className="h-64 overflow-y-auto mb-3 space-y-2 p-2 border rounded-md bg-gray-50">
                  {messages.length === 0 && (
                    <p className="text-gray-400 text-sm text-center">
                      💬 Hỏi AI về chấm công, nghỉ phép, giờ làm...
                    </p>
                  )}

                  {messages.map((m, i) => (
                    <div
                      key={i}
                      className={`p-2 rounded-lg text-sm max-w-[80%] ${
                        m.role === "user"
                          ? "bg-blue-500 text-white ml-auto"
                          : "bg-gray-200 text-gray-800 mr-auto"
                      }`}
                    >
                      {m.text}
                    </div>
                  ))}
                </div>

                <div className="flex space-x-2">
                  <input
                    className="flex-1 border rounded-md px-2 py-1"
                    placeholder="Nhập câu hỏi..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={loading}
                  />
                  <Button onClick={sendMessage} disabled={loading}>
                    Gửi
                  </Button>
                </div>

                {/* Nút tóm tắt */}
                {apiRole === "quantrivien" && (
                  <Button
                    variant="outline"
                    className="w-full mt-2"
                    onClick={() => summarize("all")}
                    disabled={loading}
                  >
                    🧾 Tóm tắt toàn bộ nhân viên
                  </Button>
                )}

                <Button
                  variant="outline"
                  className="w-full mt-2"
                  onClick={() => summarize("one")}
                  disabled={loading}
                >
                  📊 Tóm tắt chấm công{" "}
                  {apiRole === "quantrivien" ? "nhân viên đã chọn" : ""}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
