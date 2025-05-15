import { useEffect, useState } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToasterProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

// Global state and functions
let toasts: Toast[] = [];
let listeners: (() => void)[] = [];

const addToast = (message: string, type: ToastType) => {
  const newToast: Toast = {
    id: `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    message,
    type,
  };
  
  toasts = [...toasts, newToast];
  listeners.forEach((listener) => listener());
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    removeToast(newToast.id);
  }, 5000);
};

const removeToast = (id: string) => {
  toasts = toasts.filter((toast) => toast.id !== id);
  listeners.forEach((listener) => listener());
};

// Export functions for use throughout the app
export const toast = {
  success: (message: string) => addToast(message, 'success'),
  error: (message: string) => addToast(message, 'error'),
  warning: (message: string) => addToast(message, 'warning'),
  info: (message: string) => addToast(message, 'info'),
};

export const Toaster: React.FC<ToasterProps> = ({ position = 'bottom-right' }) => {
  const [currentToasts, setCurrentToasts] = useState<Toast[]>([]);
  
  useEffect(() => {
    const handleToastsChange = () => {
      setCurrentToasts([...toasts]);
    };
    
    listeners.push(handleToastsChange);
    
    return () => {
      listeners = listeners.filter((listener) => listener !== handleToastsChange);
    };
  }, []);
  
  // Position classes
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
  };
  
  // Icon and color based on type
  const getToastStyles = (type: ToastType) => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle className="text-green-500" size={20} />,
          bgColor: 'bg-green-50',
          borderColor: 'border-green-500',
        };
      case 'error':
        return {
          icon: <XCircle className="text-red-500" size={20} />,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-500',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="text-amber-500" size={20} />,
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-500',
        };
      case 'info':
        return {
          icon: <Info className="text-blue-500" size={20} />,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-500',
        };
    }
  };
  
  return (
    <div className={`fixed z-50 flex flex-col space-y-2 ${positionClasses[position]}`}>
      {currentToasts.map((toast) => {
        const { icon, bgColor, borderColor } = getToastStyles(toast.type);
        
        return (
          <div
            key={toast.id}
            className={`${bgColor} border-l-4 ${borderColor} p-4 rounded-r shadow-md max-w-sm animate-slide-up flex items-start`}
          >
            <div className="mr-3 mt-0.5">
              {icon}
            </div>
            <div className="flex-1">
              <p className="text-gray-800">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-3 text-gray-500 hover:text-gray-800"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
};