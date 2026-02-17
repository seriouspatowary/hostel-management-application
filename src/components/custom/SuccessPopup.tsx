// components/SuccessPopup.tsx

import { Check } from "lucide-react"; // Use Check icon for match
import React, { useEffect } from "react";

interface SuccessPopupProps {
  message?: string;
  isOpen: boolean;
  onClose?: () => void;
  duration?: number; // in milliseconds
}

export const SuccessPopup: React.FC<SuccessPopupProps> = ({
  message = "Thank You For Feedback",
  isOpen,
  onClose,
  duration = 1500,
}) => {
  useEffect(() => {
    if (isOpen && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose, duration]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10">
      <div className="bg-white rounded-xl shadow-2xl px-6 py-5 text-center w-[300px]">
        <div className="flex justify-center mb-2">
          <div className="bg-green-500 rounded-full p-2">
            <Check className="text-white w-6 h-6" />
          </div>
        </div>
        <p className="text-green-700 font-semibold text-base">
          {message}
        </p>
      </div>
    </div>
  );
};
