//Modal chứa các nút chức năng (Theme, Face ID, Mật khẩu...).

import {
  Settings, X, Moon, Sun, Image as ImageIcon,
  Camera, UserCog, ChevronRight, ScanFace, Lock,
  ChevronDown, Eye, EyeOff, Loader2, Check
} from "lucide-react";
import { useRouter } from "next/navigation";

interface SettingsModalProps {
  onClose: () => void;
  theme: string;
  toggleTheme: () => void;
  onTriggerFile: () => void;
  onOpenCamera: () => void;
  onStartEditing: () => void;
  
  // Password Logic props
  expandPassword: boolean;
  setExpandPassword: (val: boolean) => void;
  passwordData: { old: string; new: string };
  setPasswordData: (key: string, val: string) => void;
  onChangePassword: () => void;
  loadingPassword: boolean;
  message: { type: 'success' | 'error'; text: string } | null;
  passwordVisibility: { old: boolean; new: boolean };
  togglePasswordVisibility: (key: 'old' | 'new') => void;
}

export default function SettingsModal(props: SettingsModalProps) {
  const router = useRouter();

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={props.onClose}></div>
      <div className="relative bg-white dark:bg-gray-800 w-full sm:max-w-md sm:mx-auto rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
        
        {/* Header Modal */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-700/50">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Settings className="text-purple-500" /> Cài đặt & Bảo mật
          </h2>
          <button onClick={props.onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition">
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* Giao diện */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${props.theme === 'dark' ? 'bg-purple-100 text-purple-600' : 'bg-orange-100 text-orange-500'}`}>
                {props.theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
              </div>
              <div>
                <p className="font-semibold text-gray-800 dark:text-gray-200">Giao diện</p>
                <p className="text-xs text-gray-500">{props.theme === 'dark' ? 'Chế độ Tối' : 'Chế độ Sáng'}</p>
              </div>
            </div>
            <button onClick={props.toggleTheme} className={`w-12 h-6 rounded-full p-1 flex items-center transition-colors ${props.theme === 'dark' ? 'bg-blue-600 justify-end' : 'bg-gray-300 justify-start'}`}>
              <div className="w-4 h-4 bg-white rounded-full shadow-md"></div>
            </button>
          </div>

          <div className="h-px bg-gray-100 dark:bg-gray-700"></div>

          {/* Ảnh đại diện */}
          <div className="space-y-3">
            <p className="text-sm font-bold text-gray-400 uppercase">Ảnh đại diện</p>
            <div className="flex gap-3">
              <button onClick={props.onTriggerFile} className="flex-1 flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition">
                <ImageIcon size={24} />
                <span className="text-xs font-semibold">Thư viện ảnh</span>
              </button>
              <button onClick={() => { props.onClose(); props.onOpenCamera(); }} className="flex-1 flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/40 transition">
                <Camera size={24} />
                <span className="text-xs font-semibold">Chụp ảnh</span>
              </button>
            </div>
          </div>

          <div className="h-px bg-gray-100 dark:bg-gray-700"></div>

          {/* Nút Sửa thông tin */}
          <button onClick={props.onStartEditing} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition group">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300">
                <UserCog size={20} />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-800 dark:text-gray-200">Sửa thông tin cá nhân</p>
                <p className="text-xs text-gray-500">SĐT, Email, CCCD, Địa chỉ</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-gray-400 group-hover:text-blue-500 transition" />
          </button>

          {/* Nút Face ID */}
          <button onClick={() => router.push("/employee/register-face")} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition group">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-300">
                <ScanFace size={20} />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-800 dark:text-gray-200">Cài đặt Face ID</p>
                <p className="text-xs text-gray-500">Đăng ký hoặc cập nhật khuôn mặt</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-gray-400 group-hover:text-blue-500 transition" />
          </button>

          <div className="h-px bg-gray-100 dark:bg-gray-700"></div>

          {/* Đổi mật khẩu */}
          <div className="space-y-3">
            <button
              onClick={() => props.setExpandPassword(!props.expandPassword)}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300">
                  <Lock size={20} />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-800 dark:text-gray-200">Đổi mật khẩu</p>
                  <p className="text-xs text-gray-500">Bảo mật tài khoản</p>
                </div>
              </div>
              <ChevronDown size={18} className={`text-gray-400 transition-transform ${props.expandPassword ? "rotate-180" : ""}`} />
            </button>

            {props.expandPassword && (
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl space-y-3 animate-in slide-in-from-top duration-200">
                {props.message && (
                  <div className={`text-xs p-2 rounded flex items-center gap-2 ${props.message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {props.message.type === 'success' ? <Check size={14} /> : <X size={14} />} {props.message.text}
                  </div>
                )}
                
                <div className="relative">
                  <input 
                    type={props.passwordVisibility.old ? "text" : "password"} 
                    placeholder="Mật khẩu hiện tại" 
                    value={props.passwordData.old} 
                    onChange={e => props.setPasswordData('old', e.target.value)} 
                    className="input-field pr-10" 
                  />
                  <button type="button" onClick={() => props.togglePasswordVisibility('old')} className="absolute right-3 top-3 text-gray-400">
                    {props.passwordVisibility.old ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                <div className="relative">
                  <input 
                    type={props.passwordVisibility.new ? "text" : "password"} 
                    placeholder="Mật khẩu mới" 
                    value={props.passwordData.new} 
                    onChange={e => props.setPasswordData('new', e.target.value)} 
                    className="input-field pr-10" 
                  />
                  <button type="button" onClick={() => props.togglePasswordVisibility('new')} className="absolute right-3 top-3 text-gray-400">
                    {props.passwordVisibility.new ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                <button onClick={props.onChangePassword} disabled={props.loadingPassword} className="w-full py-2 bg-gray-800 dark:bg-gray-600 text-white rounded-lg font-bold text-sm hover:bg-gray-900 transition flex justify-center">
                  {props.loadingPassword ? <Loader2 className="animate-spin" size={18} /> : "Cập nhật ngay"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <style jsx>{`
        .input-field { width: 100%; padding: 10px 12px; border-radius: 8px; border: 1px solid #e5e7eb; background-color: #ffffff; color: #1f2937; outline: none; font-size: 0.95rem; }
        :global(.dark) .input-field { background-color: #374151; border-color: #4b5563; color: white; }
        .input-field:focus { border-color: #3b82f6; }
      `}</style>
    </div>
  );
}