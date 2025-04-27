import React from "react";

const Loading = ({ text = "Loading..." }: { text?: string }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px]">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-[var(--accent)] border-t-transparent mb-4"></div>
      <p className="text-[var(--accent)] font-semibold text-lg">{text}</p>
    </div>
  );
};

export default Loading;
