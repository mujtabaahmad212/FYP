import React from 'react';
import { Camera } from 'lucide-react';

const FloatingCameraButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-full shadow-2xl hover:shadow-red-500/50 hover:scale-110 transition-all duration-300 flex items-center justify-center group animate-pulse"
      title="Quick Report with Camera"
    >
      <Camera className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
      <span className="absolute -top-12 right-0 bg-black/80 text-white text-xs px-3 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
        Quick Report
      </span>
    </button>
  );
};

export default FloatingCameraButton;