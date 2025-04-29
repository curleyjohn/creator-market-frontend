import React from "react";

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center min-h-screen bg-background/80 backdrop-blur-sm">
      {/* Spinner */}
      <div className="relative w-16 h-16 mb-6">
        <div className="absolute w-16 h-16 border-4 border-primary/20 rounded-full"></div>
        <div className="absolute w-16 h-16 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
      </div>

      {/* Loading text with gradient and pulse */}
      <div className="relative">
        <div className="text-2xl font-medium text-primary/80">
          <span className="animate-pulse">Loading</span>
          <span className="animate-pulse delay-100">.</span>
          <span className="animate-pulse delay-200">.</span>
          <span className="animate-pulse delay-300">.</span>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;