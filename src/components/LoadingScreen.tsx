import React from "react";

const LoadingScreen = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-theme text-theme">
      <div className="text-xl font-semibold animate-pulse px-6 py-3 text-accent">
        Loading...
      </div>
    </div>
  );
};

export default LoadingScreen;