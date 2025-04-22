
import React from "react";
import { cn } from "@/lib/utils";

export type DensityLevel = "low" | "medium" | "high" | "critical";

interface DensityIndicatorProps {
  level: DensityLevel;
  value: number;
  showValue?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const DensityIndicator: React.FC<DensityIndicatorProps> = ({
  level,
  value,
  showValue = true,
  className = "",
  size = "md",
}) => {
  const getColor = (level: DensityLevel) => {
    switch (level) {
      case "low":
        return "bg-density-low";
      case "medium":
        return "bg-density-medium";
      case "high":
        return "bg-density-high";
      case "critical":
        return "bg-density-critical";
      default:
        return "bg-density-low";
    }
  };

  const getTooltip = (level: DensityLevel) => {
    switch (level) {
      case "low":
        return "Low Density";
      case "medium":
        return "Medium Density";
      case "high":
        return "High Density - Caution Advised";
      case "critical":
        return "Critical Density - Immediate Action Required";
      default:
        return "Unknown Density";
    }
  };

  const getSizeClasses = (size: "sm" | "md" | "lg") => {
    switch (size) {
      case "sm":
        return "h-1.5 text-xs";
      case "md":
        return "h-2 text-sm";
      case "lg":
        return "h-3 text-base";
      default:
        return "h-2 text-sm";
    }
  };

  return (
    <div className={cn("flex flex-col w-full gap-1", className)}>
      {showValue && (
        <div className="flex justify-between items-center text-sm">
          <span className="font-medium">
            {getTooltip(level)}
          </span>
          <span className="font-mono">
            {value.toFixed(1)} people/m²
          </span>
        </div>
      )}
      <div className={cn("w-full bg-muted rounded-full overflow-hidden", getSizeClasses(size))}>
        <div
          className={cn("h-full rounded-full transition-all ease-in-out duration-500", getColor(level))}
          style={{ width: `${Math.min(100, (value / 15) * 100)}%` }}
          title={getTooltip(level)}
        ></div>
      </div>
    </div>
  );
};

export default DensityIndicator;
