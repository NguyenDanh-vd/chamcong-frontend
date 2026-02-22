import {
  Settings,
  X,
  Moon,
  Sun,
  Image as ImageIcon,
  Camera,
  UserCog,
  ChevronRight,
  ScanFace,
  Lock,
  ChevronDown,
  Eye,
  EyeOff,
  Loader2,
  Check,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface SettingsModalProps {
  onClose: () => void;
  theme: string;
  toggleTheme: () => void;
  onTriggerFile: () => void;
  onOpenCamera: () => void;
  onStartEditing: () => void;
  expandPassword: boolean;
  setExpandPassword: (val: boolean) => void;
  passwordData: { old: string; new: string };
  setPasswordData: (key: string, val: string) => void;
  onChangePassword: () => void;
  loadingPassword: boolean;
  message: { type: "success" | "error"; text: string } | null;
  passwordVisibility: { old: boolean; new: boolean };
  togglePasswordVisibility: (key: "old" | "new") => void;
}

export default function SettingsModal(props: SettingsModalProps) {
  const router = useRouter();

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/55 backdrop-blur-sm sm:justify-center">
      <div className="absolute inset-0" onClick={props.onClose}></div>
      <div className="relative max-h-[86vh] w-full overflow-y-auto rounded-t-3xl border border-slate-200 bg-white shadow-2xl sm:mx-auto sm:max-w-md sm:rounded-2xl dark:border-slate-700 dark:bg-slate-900">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-slate-50/95 p-4 backdrop-blur dark:border-slate-700 dark:bg-slate-800/95">
          <h2 className="flex items-center gap-2 text-base font-bold text-slate-800 dark:text-slate-100">
            <Settings className="text-sky-600" /> Cài đặt và bảo mật
          </h2>
          <button onClick={props.onClose} className="rounded-full p-1.5 transition hover:bg-slate-200 dark:hover:bg-slate-700">
            <X size={20} className="text-slate-600 dark:text-slate-300" />
          </button>
        </div>

        <div className="space-y-5 p-5">
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
            <div className="flex items-center gap-3">
              <div className={`rounded-full p-2 ${props.theme === "dark" ? "bg-violet-100 text-violet-600" : "bg-amber-100 text-amber-600"}`}>
                {props.theme === "dark" ? <Moon size={18} /> : <Sun size={18} />}
              </div>
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-100">Giao diện</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{props.theme === "dark" ? "Chế độ tối" : "Chế độ sáng"}</p>
              </div>
            </div>
            <button
              onClick={props.toggleTheme}
              className={`flex h-6 w-12 items-center rounded-full p-1 transition ${
                props.theme === "dark" ? "justify-end bg-sky-600" : "justify-start bg-slate-300"
              }`}
            >
              <span className="h-4 w-4 rounded-full bg-white shadow" />
            </button>
          </div>

          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Ảnh đại diện</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={props.onTriggerFile}
                className="flex flex-col items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 p-3 text-sky-700"
              >
                <ImageIcon size={22} />
                <span className="text-xs font-semibold">Thư viện ảnh</span>
              </button>
              <button
                onClick={() => {
                  props.onClose();
                  props.onOpenCamera();
                }}
                className="flex flex-col items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-emerald-700"
              >
                <Camera size={22} />
                <span className="text-xs font-semibold">Chụp ảnh</span>
              </button>
            </div>
          </div>

          <button
            onClick={props.onStartEditing}
            className="group flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white p-3 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
          >
            <div className="flex items-center gap-3 text-left">
              <div className="rounded-full bg-indigo-100 p-2 text-indigo-600">
                <UserCog size={18} />
              </div>
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-100">Sửa thông tin cá nhân</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Số điện thoại, email, CCCD, địa chỉ</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-slate-400 group-hover:text-sky-600" />
          </button>

          <button
            onClick={() => router.push("/employee/register-face")}
            className="group flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white p-3 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
          >
            <div className="flex items-center gap-3 text-left">
              <div className="rounded-full bg-cyan-100 p-2 text-cyan-700">
                <ScanFace size={18} />
              </div>
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-100">Cài đặt Face ID</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Đăng ký hoặc cập nhật khuôn mặt</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-slate-400 group-hover:text-sky-600" />
          </button>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
            <button
              onClick={() => props.setExpandPassword(!props.expandPassword)}
              className="flex w-full items-center justify-between"
            >
              <div className="flex items-center gap-3 text-left">
                <div className="rounded-full bg-rose-100 p-2 text-rose-700">
                  <Lock size={18} />
                </div>
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-100">Đổi mật khẩu</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Bảo mật tài khoản</p>
                </div>
              </div>
              <ChevronDown size={18} className={`text-slate-500 transition ${props.expandPassword ? "rotate-180" : ""}`} />
            </button>

            {props.expandPassword ? (
              <div className="mt-3 space-y-3 border-t border-slate-200 pt-3 dark:border-slate-700">
                {props.message ? (
                  <div
                    className={`flex items-center gap-2 rounded-lg p-2 text-xs ${
                      props.message.type === "success"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    {props.message.type === "success" ? <Check size={14} /> : <X size={14} />} {props.message.text}
                  </div>
                ) : null}

                <div className="relative">
                  <input
                    type={props.passwordVisibility.old ? "text" : "password"}
                    placeholder="Mật khẩu hiện tại"
                    value={props.passwordData.old}
                    onChange={(e) => props.setPasswordData("old", e.target.value)}
                    className="input-field pr-10"
                  />
                  <button type="button" onClick={() => props.togglePasswordVisibility("old")} className="eye-btn">
                    {props.passwordVisibility.old ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={props.passwordVisibility.new ? "text" : "password"}
                    placeholder="Mật khẩu mới"
                    value={props.passwordData.new}
                    onChange={(e) => props.setPasswordData("new", e.target.value)}
                    className="input-field pr-10"
                  />
                  <button type="button" onClick={() => props.togglePasswordVisibility("new")} className="eye-btn">
                    {props.passwordVisibility.new ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                <button
                  onClick={props.onChangePassword}
                  disabled={props.loadingPassword}
                  className="flex w-full justify-center rounded-lg bg-slate-800 py-2 text-sm font-bold text-white transition hover:bg-slate-900"
                >
                  {props.loadingPassword ? <Loader2 className="animate-spin" size={18} /> : "Cập nhật ngay"}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <style jsx>{`
        .input-field {
          width: 100%;
          border: 1px solid #cbd5e1;
          border-radius: 10px;
          padding: 10px 12px;
          font-size: 0.95rem;
          color: #0f172a;
          background: #fff;
          outline: none;
        }
        .input-field:focus {
          border-color: #38bdf8;
          box-shadow: 0 0 0 3px rgba(125, 211, 252, 0.25);
        }
        .eye-btn {
          position: absolute;
          right: 10px;
          top: 10px;
          color: #64748b;
        }
      `}</style>
    </div>
  );
}
