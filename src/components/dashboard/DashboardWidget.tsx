
import React from "react";
import { cn } from "@/lib/utils";
import DensityIndicator from "@/components/data-visualization/DensityIndicator";

interface StatisticProps {
  label: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  isNegative?: boolean;
}

interface DashboardWidgetProps {
  className?: string;
  title: string;
  statistics: StatisticProps[];
  densityLevel?: "low" | "medium" | "high" | "critical";
  densityValue?: number;
}

const Statistic: React.FC<StatisticProps> = ({ 
  label, 
  value, 
  change, 
  isPositive = false, 
  isNegative = false 
}) => {
  return (
    <div className="bg-white shadow-sm border rounded-md p-3">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
      {change && (
        <p className={cn(
          "text-xs mt-1",
          isPositive && "text-green-600",
          isNegative && "text-red-600"
        )}>
          {isPositive && "↑"}
          {isNegative && "↓"}
          {change}
        </p>
      )}
    </div>
  );
};

const DashboardWidget: React.FC<DashboardWidgetProps> = ({
  className = "",
  title,
  statistics,
  densityLevel,
  densityValue,
}) => {
  return (
    <div className={cn("rounded-lg border bg-card p-4", className)}>
      <h3 className="text-lg font-bold mb-4">{title}</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {statistics.map((stat, idx) => (
          <Statistic key={idx} {...stat} />
        ))}
      </div>
      
      {densityLevel && densityValue !== undefined && (
        <div className="mt-4">
          <DensityIndicator
            level={densityLevel}
            value={densityValue}
            showValue={true}
            size="lg"
          />
        </div>
      )}
      
      <div className="mt-4 text-xs text-muted-foreground">
        <p>Real-time data, updated every 5 seconds</p>
        <p>Last update: {new Date().toLocaleTimeString()}</p>
      </div>
    </div>
  );
};

export default DashboardWidget;
