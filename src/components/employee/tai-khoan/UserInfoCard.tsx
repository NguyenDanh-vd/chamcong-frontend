import { User, Mail, Phone, Shield, MapPin, Loader2, Edit3 } from "lucide-react";
import CustomButton from "@/components/CustomButton";

interface UserInfoCardProps {
  userInfo: any;
  editing: boolean;
  setEditing: (val: boolean) => void;
  tempData: {
    email: string;
    phone: string;
    cccd: string;
    diaChi: string;
  };
  setTempData: (key: string, val: string) => void;
  onSave: () => void;
  onCancel: () => void;
  loading: boolean;
  infoCardRef: any;
}

export default function UserInfoCard({
  userInfo,
  editing,
  setEditing,
  tempData,
  setTempData,
  onSave,
  onCancel,
  loading,
  infoCardRef,
}: UserInfoCardProps) {
  return (
    <div
      ref={infoCardRef}
      className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_16px_42px_-30px_rgba(2,132,199,0.55)] dark:border-slate-700 dark:bg-slate-900"
    >
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-800/80">
        <h2 className="flex items-center gap-2 text-base font-bold text-slate-800 dark:text-slate-100">
          <User size={18} className="text-sky-600" /> Thông tin cá nhân
        </h2>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1 rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700 dark:border-sky-500/40 dark:bg-sky-900/30 dark:text-sky-300"
          >
            <Edit3 size={13} /> Chỉnh sửa
          </button>
        ) : null}
      </div>

      <div className="space-y-4 p-4">
        <div className="field-row">
          <Mail size={17} className="icon text-sky-600" />
          {editing ? (
            <input
              value={tempData.email}
              onChange={(e) => setTempData("email", e.target.value)}
              className="input-field"
              placeholder="Email"
            />
          ) : (
            <span className="value">{userInfo.email}</span>
          )}
        </div>

        <div className="field-row">
          <Phone size={17} className="icon text-emerald-600" />
          {editing ? (
            <input
              value={tempData.phone}
              onChange={(e) => setTempData("phone", e.target.value)}
              className="input-field"
              placeholder="Số điện thoại"
            />
          ) : (
            <span className="value">{userInfo.soDienThoai || "Chưa có số điện thoại"}</span>
          )}
        </div>

        <div className="field-row">
          <Shield size={17} className="icon text-orange-500" />
          {editing ? (
            <input
              value={tempData.cccd}
              onChange={(e) => setTempData("cccd", e.target.value)}
              className="input-field"
              placeholder="CCCD"
            />
          ) : (
            <span className="value">{userInfo.cccd || "Chưa có CCCD"}</span>
          )}
        </div>

        <div className="field-row items-start">
          <MapPin size={17} className="icon mt-2 text-rose-500" />
          {editing ? (
            <textarea
              rows={2}
              value={tempData.diaChi}
              onChange={(e) => setTempData("diaChi", e.target.value)}
              className="input-field resize-none"
              placeholder="Địa chỉ"
            />
          ) : (
            <span className="value">{userInfo.diaChi || "Chưa có địa chỉ"}</span>
          )}
        </div>

        {editing ? (
          <div className="mt-2 space-y-2 border-t border-slate-100 pt-3">
            <CustomButton onClick={onSave} disabled={loading} style={{ width: "100%" }}>
              {loading ? <Loader2 className="animate-spin" /> : "Lưu thay đổi"}
            </CustomButton>
            <CustomButton
              onClick={onCancel}
              style={{ width: "100%", background: "linear-gradient(135deg,#ef4444,#dc2626)" }}
            >
              Hủy bỏ
            </CustomButton>
          </div>
        ) : null}
      </div>

      <style jsx>{`
        .field-row {
          display: flex;
          align-items: center;
          gap: 12px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 10px 12px;
        }
        .icon {
          flex-shrink: 0;
        }
        .value {
          color: #334155;
          font-size: 0.95rem;
          line-height: 1.45;
        }
        :global(.dark) .value {
          color: #cbd5e1;
        }
        .input-field {
          width: 100%;
          padding: 9px 10px;
          border-radius: 9px;
          border: 1px solid #cbd5e1;
          background: #ffffff;
          color: #0f172a;
          outline: none;
          font-size: 0.95rem;
        }
        .input-field:focus {
          border-color: #38bdf8;
          box-shadow: 0 0 0 3px rgba(125, 211, 252, 0.25);
        }
        :global(.dark) .field-row {
          background: #0f172a;
          border-color: #334155;
        }
        :global(.dark) .input-field {
          background: #020617;
          color: #e2e8f0;
          border-color: #334155;
        }
      `}</style>
    </div>
  );
}
