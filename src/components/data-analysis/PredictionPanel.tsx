
import React from "react";
import { usePredictions, PredictionResult } from "@/utils/realtimeData";
import { cn } from "@/lib/utils";

interface PredictionPanelProps {
  className?: string;
}

const PredictionPanel: React.FC<PredictionPanelProps> = ({ className = "" }) => {
  const { predictions, isLoading } = usePredictions();

  // Risk level indicator
  const getRiskLevel = (risk: number): { label: string; color: string } => {
    if (risk < 0.3) return { label: "Low", color: "bg-density-low text-white" };
    if (risk < 0.6) return { label: "Medium", color: "bg-density-medium text-white" };
    if (risk < 0.8) return { label: "High", color: "bg-density-high text-white" };
    return { label: "Critical", color: "bg-density-critical text-white" };
  };

  // Format percentage
  const formatRiskPercentage = (risk: number): string => {
    return `${Math.round(risk * 100)}%`;
  };

  return (
    <div className={cn("bg-white rounded-lg border p-4", className)}>
      <h3 className="text-lg font-bold mb-4">AI Crowd Risk Predictions</h3>
      
      {isLoading ? (
        <div className="animate-pulse space-y-3">
          <div className="h-10 bg-muted rounded"></div>
          <div className="h-10 bg-muted rounded"></div>
          <div className="h-10 bg-muted rounded"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {predictions.map((prediction, index) => {
            const risk = getRiskLevel(prediction.risk);
            
            return (
              <div 
                key={`prediction-${index}`}
                className="border rounded-md p-3 hover:shadow-md transition-shadow"
                aria-label={`Prediction for ${prediction.area} with ${risk.label} risk`}
              >
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">{prediction.area}</h4>
                  <span 
                    className={cn("px-2 py-1 rounded text-xs font-bold", risk.color)}
                    aria-label={`Risk level: ${risk.label}`}
                  >
                    {risk.label}
                  </span>
                </div>
                
                <div className="mt-2 flex justify-between text-sm">
                  <span>Predicted in: {prediction.timeframe}</span>
                  <span className="font-bold">{formatRiskPercentage(prediction.risk)}</span>
                </div>
                
                <div className="mt-2 relative pt-1">
                  <div className="overflow-hidden h-2 text-xs flex rounded bg-muted">
                    <div 
                      style={{ width: `${prediction.risk * 100}%` }}
                      className={cn("shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center", risk.color)}
                      aria-hidden="true"
                    ></div>
                  </div>
                </div>
                
                {prediction.suggestedAction && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    <span className="font-medium">Suggested Action: </span> 
                    {prediction.suggestedAction}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      
      <div className="mt-4 text-xs text-muted-foreground">
        <p>Predictions are based on historical data patterns and current density readings.</p>
        <p className="mt-1">Updated every 5 minutes. Last update: {new Date().toLocaleTimeString()}</p>
      </div>
    </div>
  );
};

export default PredictionPanel;
