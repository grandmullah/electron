import React from "react";

interface LoadingStateProps {
  message?: string;
  size?: "small" | "medium" | "large";
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = "Loading...",
  size = "medium",
}) => {
  return (
    <div className="loading-state-modern">
      <div
        className={`loading-spinner-modern ${size === "small" ? "small" : ""}`}
      ></div>
      <p>{message}</p>
    </div>
  );
};
