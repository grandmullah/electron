import React from "react";

interface EmptyStateProps {
  icon: string;
  title: string;
  message: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  message,
}) => {
  return (
    <div className="empty-state-modern">
      <div className="empty-icon-modern">{icon}</div>
      <h3>{title}</h3>
      <p>{message}</p>
    </div>
  );
};
