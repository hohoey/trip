// src/components/AddEventModal.tsx
import { useState } from "react";
import type { TripEvent } from "../types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (event: TripEvent) => void;
  activeDay: number;
}

export const AddEventModal = ({ isOpen, onClose, onAdd, activeDay }: Props) => {
  const [formData, setFormData] = useState({
    time: "12:00",
    location: "",
    category: "景點",
    address: "",
    phone: "",
    note: "",
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({ ...formData, day: activeDay });
    // 重置表單
    setFormData({
      time: "12:00",
      location: "",
      category: "景點",
      address: "",
      phone: "",
      note: "",
    });
    onClose();
  };

  return (
    // 點擊背景遮罩關閉視窗
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md bg-white rounded-t-[3rem] p-8 shadow-2xl animate-slideUp max-h-[90vh] overflow-y-auto no-scrollbar">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-black italic text-gray-900">
            新增行程{" "}
            <span className="text-blue-600 text-xs ml-2">Day {activeDay}</span>
          </h2>
          {/* 右上角叉叉按鈕 */}
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-gray-500 transition-colors"
          >
            <i className="fas fa-times-circle text-2xl"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2">
                Time *
              </label>
              <input
                type="time"
                required
                value={formData.time}
                onChange={(e) =>
                  setFormData({ ...formData, time: e.target.value })
                }
                className="w-full bg-gray-50 border-none rounded-2xl p-4 mt-1 font-bold focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full bg-gray-50 border-none rounded-2xl p-4 mt-1 font-bold focus:ring-2 focus:ring-blue-500 appearance-none"
              >
                <option>景點</option>
                <option>美食</option>
                <option>交通</option>
                <option>購物</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase ml-2">
              Location *
            </label>
            <input
              type="text"
              placeholder="名稱"
              required
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              className="w-full bg-gray-50 border-none rounded-2xl p-4 mt-1 font-bold focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase ml-2">
              Address
            </label>
            <input
              type="text"
              placeholder="地址 (選填)"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              className="w-full bg-gray-50 border-none rounded-2xl p-4 mt-1 font-bold focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase ml-2">
              Phone
            </label>
            <input
              type="tel"
              placeholder="電話 (選填)"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="w-full bg-gray-50 border-none rounded-2xl p-4 mt-1 font-bold focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase ml-2">
              Note
            </label>
            <textarea
              placeholder="備註 (選填)"
              value={formData.note}
              onChange={(e) =>
                setFormData({ ...formData, note: e.target.value })
              }
              className="w-full bg-gray-50 border-none rounded-2xl p-4 mt-1 font-bold h-20 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="pt-2 space-y-3">
            <button
              type="submit"
              className="w-full bg-gray-900 text-white py-5 rounded-3xl font-black text-sm shadow-xl active:scale-95 transition-transform"
            >
              加入行程
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
