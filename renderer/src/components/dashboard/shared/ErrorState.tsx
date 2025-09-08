import React from "react";

interface ErrorStateProps {
  title: string;
  message: string;
  onRetry?: () => void;
  retryText?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  message,
  onRetry,
  retryText = "Try Again",
}) => {
  return (
    <div className="error-state-modern">
      <div className="error-icon-modern">⚠️</div>
      <h3>{title}</h3>
      <p>{message}</p>
      {onRetry && (
        <button className="btn btn-primary" onClick={onRetry}>
          {retryText}
        </button>
      )}
    </div>
  );
};
