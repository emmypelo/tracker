/* eslint-disable react/prop-types */
import  { useState, useEffect } from "react";
import { CheckCircle, XCircle, X } from "lucide-react";

const AlertComponent = ({ message, type, duration = 5000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  const alertClasses = {
    success: "bg-green-100 border-green-500 text-green-700",
    error: "bg-red-100 border-red-500 text-red-700",
  };

  const iconClasses = {
    success: "text-green-500",
    error: "text-red-500",
  };

  return (
    <div className={`fixed top-[4.5rem] right-4 z-50 max-w-md w-full`}>
      <div
        className={`${alertClasses[type]} border-l-4 p-2 rounded shadow-md flex items-center `}
        role="alert"
      >
        <div className="flex-shrink-0">
          {type === "success" ? (
            <CheckCircle className={`w-3 h-3 ${iconClasses[type]}`} />
          ) : (
            <XCircle className={`w-3 h-3 ${iconClasses[type]}`} />
          )}
        </div>
        <div className="ml-3 flex-grow">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            onClose();
          }}
          className="ml-auto flex-shrink-0 -mx-1.5 -my-1.5 bg-transparent text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 inline-flex h-8 w-8"
        >
          <span className="sr-only">Close</span>
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default AlertComponent;
