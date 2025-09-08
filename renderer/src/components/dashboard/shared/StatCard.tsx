import React from "react";

interface StatCardProps {
  icon: string;
  title: string;
  value: string | number;
  className?: string;
  valueClassName?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  icon,
  title,
  value,
  className = "",
  valueClassName = "",
}) => {
  return (
    <div className={`stat-card ${className}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <h3>{title}</h3>
        <p className={`stat-value ${valueClassName}`}>{value}</p>
      </div>
    </div>
  );
};
