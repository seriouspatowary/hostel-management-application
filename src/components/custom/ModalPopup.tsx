import { RiCheckLine, RiCloseLine } from "@remixicon/react";
import { useEffect } from "react";
import { Button } from "../ui/button";

// Success Modal Component
const SuccessModal = ({ isVisible, onClose, message }: { 
    isVisible: boolean; 
    onClose: () => void; 
    message: string; 
  }) => {
    useEffect(() => {
      if (isVisible) {
        const timer = setTimeout(() => {
          onClose();
        }, 3000); // Auto close after 3 seconds
  
        return () => clearTimeout(timer);
      }
    }, [isVisible, onClose]);
  
    if (!isVisible) return null;
  
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-opacity-100 transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl p-6 mx-4 max-w-md w-full animate-in zoom-in-95 duration-300">
          {/* Success Icon */}
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full">
            <RiCheckLine className="w-8 h-8 text-green-600" />
          </div>
          
          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
            Success!
          </h3>
          
          {/* Message */}
          <p className="text-gray-600 text-center mb-6">
            {message}
          </p>
          
          {/* Close Button */}
          <div className="flex justify-center">
            <Button
              onClick={onClose}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
            >
              OK
            </Button>
          </div>
          
          {/* Close X button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <RiCloseLine className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  };

  export default SuccessModal;