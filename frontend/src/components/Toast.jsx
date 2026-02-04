import React, { useEffect } from 'react';
import { FiCheckCircle, FiXCircle, FiInfo, FiAlertTriangle, FiX } from 'react-icons/fi';

const Toast = ({ message, type = 'info', onClose, duration = 4000 }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const icons = {
    success: <FiCheckCircle className="w-6 h-6" />,
    error: <FiXCircle className="w-6 h-6" />,
    warning: <FiAlertTriangle className="w-6 h-6" />,
    info: <FiInfo className="w-6 h-6" />
  };

  const colors = {
    success: 'from-green-600 to-green-700 border-green-500',
    error: 'from-red-600 to-red-700 border-red-500',
    warning: 'from-yellow-600 to-yellow-700 border-yellow-500',
    info: 'from-blue-600 to-blue-700 border-blue-500'
  };

  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-6 py-4 rounded-lg shadow-2xl border-l-4 bg-gradient-to-r ${colors[type]} text-white animate-slide-in`}>
      <div className="flex-shrink-0">{icons[type]}</div>
      <p className="flex-1 font-medium">{message}</p>
      <button
        onClick={onClose}
        className="flex-shrink-0 hover:bg-white/20 rounded-full p-1 transition-colors"
      >
        <FiX className="w-5 h-5" />
      </button>
    </div>
  );
};

export default Toast;
