
import { useState, useEffect } from "react";

// Define data types
export interface DensityPoint {
  x: number;
  y: number;
  density: number;
  id: string;
}

export interface PredictionResult {
  area: string;
  risk: number;
  timeframe: string;
  suggestedAction?: string;
}

// Mock data generator for demo purposes
const generateMockDensityData = (pointCount: number, dimensions: { width: number, height: number }): DensityPoint[] => {
  const newPoints: DensityPoint[] = [];
  
  // Main stage area (high density)
  for (let i = 0; i < pointCount * 0.4; i++) {
    newPoints.push({
      x: Math.random() * (dimensions.width * 0.3) + dimensions.width * 0.1,
      y: Math.random() * (dimensions.height * 0.3) + dimensions.height * 0.1,
      density: Math.random() * 5 + 7, // 7-12 people/m²
      id: `point-stage-${i}`,
    });
  }
  
  // Food court area (medium density)
  for (let i = 0; i < pointCount * 0.3; i++) {
    newPoints.push({
      x: Math.random() * (dimensions.width * 0.3) + dimensions.width * 0.6,
      y: Math.random() * (dimensions.height * 0.3) + dimensions.height * 0.6,
      density: Math.random() * 3 + 4, // 4-7 people/m²
      id: `point-food-${i}`,
    });
  }
  
  // Rest randomly distributed (low density)
  for (let i = 0; i < pointCount * 0.3; i++) {
    newPoints.push({
      x: Math.random() * dimensions.width,
      y: Math.random() * dimensions.height,
      density: Math.random() * 3 + 1, // 1-4 people/m²
      id: `point-other-${i}`,
    });
  }
  
  return newPoints;
};

// Mock predictions
const mockPredictions: PredictionResult[] = [
  { 
    area: "Main Stage", 
    risk: 0.85, 
    timeframe: "10 minutes",
    suggestedAction: "Deploy additional staff to eastern edge of stage area"
  },
  { 
    area: "Exit B", 
    risk: 0.72, 
    timeframe: "15 minutes",
    suggestedAction: "Open auxiliary exit routes"
  },
  { 
    area: "Food Court", 
    risk: 0.45, 
    timeframe: "30 minutes"
  }
];

// Hook for real-time density data
export function useDensityData(pointCount: number, dimensions: { width: number, height: number }, interval = 5000) {
  const [points, setPoints] = useState<DensityPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initial data load
    setPoints(generateMockDensityData(pointCount, dimensions));
    setIsLoading(false);

    // Set up polling interval
    const intervalId = setInterval(() => {
      setPoints(generateMockDensityData(pointCount, dimensions));
    }, interval);

    // Clean up on unmount
    return () => clearInterval(intervalId);
  }, [pointCount, dimensions, interval]);

  return { points, isLoading };
}

// Hook for AI predictions
export function usePredictions() {
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setPredictions(mockPredictions);
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return { predictions, isLoading };
}
