import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import DensityIndicator, { DensityLevel } from "./DensityIndicator";

interface Point {
  x: number;
  y: number;
  id: string;
}

interface QuadTreeNode {
  x: number;
  y: number;
  width: number;
  height: number;
  points: Point[];
  children: QuadTreeNode[];
  level: number;
}

interface VenueMapProps {
  className?: string;
  dimensions?: { width: number; height: number };
  pointCount?: number;
  threshold?: number;
  onSelectRegion?: (region: QuadTreeNode) => void;
}

// Simplified Quadtree implementation for visualization purposes
// In a real application, this would be a more sophisticated implementation
const createQuadTree = (
  points: Point[],
  x: number,
  y: number,
  width: number,
  height: number,
  level: number = 0,
  threshold: number = 10
): QuadTreeNode => {
  const node: QuadTreeNode = {
    x,
    y,
    width,
    height,
    points: [],
    children: [],
    level,
  };

  // Filter points that belong to this node
  node.points = points.filter(
    (p) =>
      p.x >= x && p.x < x + width && p.y >= y && p.y < y + height
  );

  // If we have fewer points than the threshold or we've reached a max depth, stop subdividing
  if (node.points.length <= threshold || level >= 5) {
    return node;
  }

  // Otherwise, subdivide
  const halfWidth = width / 2;
  const halfHeight = height / 2;

  // Top left
  node.children.push(
    createQuadTree(
      node.points,
      x,
      y,
      halfWidth,
      halfHeight,
      level + 1,
      threshold
    )
  );

  // Top right
  node.children.push(
    createQuadTree(
      node.points,
      x + halfWidth,
      y,
      halfWidth,
      halfHeight,
      level + 1,
      threshold
    )
  );

  // Bottom left
  node.children.push(
    createQuadTree(
      node.points,
      x,
      y + halfHeight,
      halfWidth,
      halfHeight,
      level + 1,
      threshold
    )
  );

  // Bottom right
  node.children.push(
    createQuadTree(
      node.points,
      x + halfWidth,
      y + halfHeight,
      halfWidth,
      halfHeight,
      level + 1,
      threshold
    )
  );

  return node;
};

const VenueMap: React.FC<VenueMapProps> = ({
  className = "",
  dimensions = { width: 600, height: 400 },
  pointCount = 200,
  threshold = 8,
  onSelectRegion,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [points, setPoints] = useState<Point[]>([]);
  const [quadTree, setQuadTree] = useState<QuadTreeNode | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<QuadTreeNode | null>(null);
  const [highlightedRegions, setHighlightedRegions] = useState<QuadTreeNode[]>([]);

  // Generate random points for simulation
  useEffect(() => {
    const newPoints: Point[] = [];
    // Add some clustered points to simulate crowd hotspots
    // Main stage area
    for (let i = 0; i < pointCount * 0.4; i++) {
      newPoints.push({
        x: Math.random() * (dimensions.width * 0.3) + dimensions.width * 0.1,
        y: Math.random() * (dimensions.height * 0.3) + dimensions.height * 0.1,
        id: `point-${i}`,
      });
    }
    
    // Food court area
    for (let i = 0; i < pointCount * 0.3; i++) {
      newPoints.push({
        x: Math.random() * (dimensions.width * 0.3) + dimensions.width * 0.6,
        y: Math.random() * (dimensions.height * 0.3) + dimensions.height * 0.6,
        id: `point-${i + pointCount * 0.4}`,
      });
    }
    
    // Rest randomly distributed
    for (let i = 0; i < pointCount * 0.3; i++) {
      newPoints.push({
        x: Math.random() * dimensions.width,
        y: Math.random() * dimensions.height,
        id: `point-${i + pointCount * 0.7}`,
      });
    }
    
    setPoints(newPoints);
    
    // Create quadtree
    const tree = createQuadTree(
      newPoints,
      0,
      0,
      dimensions.width,
      dimensions.height,
      0,
      threshold
    );
    setQuadTree(tree);
    
    // Find high density regions
    const findHighDensityRegions = (node: QuadTreeNode, threshold: number, regions: QuadTreeNode[]) => {
      const density = node.points.length / (node.width * node.height);
      if (density > threshold / 400) {
        regions.push(node);
      }
      
      node.children.forEach((child) => {
        findHighDensityRegions(child, threshold, regions);
      });
    };
    
    const highDensityRegions: QuadTreeNode[] = [];
    findHighDensityRegions(tree, threshold, highDensityRegions);
    setHighlightedRegions(
      highDensityRegions.sort(
        (a, b) => 
          (b.points.length / (b.width * b.height)) - 
          (a.points.length / (a.width * a.height))
      ).slice(0, 3)
    );
  }, [dimensions, pointCount, threshold]);

  // Draw the map and quadtree
  useEffect(() => {
    if (!canvasRef.current || !quadTree) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background grid for venue
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;
    const gridSize = 20;
    
    for (let x = 0; x <= canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    
    for (let y = 0; y <= canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Helper to draw a node recursively
    const drawNode = (node: QuadTreeNode) => {
      // Draw node borders
      if (node.children.length > 0) {
        ctx.strokeStyle = "#94a3b8";
        ctx.lineWidth = 1;
        ctx.strokeRect(node.x, node.y, node.width, node.height);
        
        // Draw children
        node.children.forEach(drawNode);
      } else if (node.points.length > 0) {
        // Color-code leaf nodes based on density
        const density = node.points.length / (node.width * node.height) * 100;
        
        // Calculate opacity based on point density
        let fillColor = "rgba(76, 195, 138, 0.2)"; // Low density
        
        if (density > threshold / 100) {
          fillColor = "rgba(255, 179, 71, 0.3)"; // Medium density
        }
        
        if (density > threshold / 50) {
          fillColor = "rgba(255, 107, 107, 0.4)"; // High density
        }
        
        if (density > threshold / 25) {
          fillColor = "rgba(224, 49, 49, 0.5)"; // Critical density
        }
        
        ctx.fillStyle = fillColor;
        ctx.fillRect(node.x, node.y, node.width, node.height);
        
        // Draw border
        ctx.strokeStyle = "#94a3b8";
        ctx.lineWidth = 1;
        ctx.strokeRect(node.x, node.y, node.width, node.height);
      }
    };

    // Draw the quadtree nodes
    drawNode(quadTree);

    // Draw all points
    ctx.fillStyle = "#7755F8";
    points.forEach((point) => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
      ctx.fill();
    });

    // Highlight selected region if any
    if (selectedRegion) {
      ctx.strokeStyle = "#FF6B6B";
      ctx.lineWidth = 3;
      ctx.strokeRect(
        selectedRegion.x,
        selectedRegion.y,
        selectedRegion.width,
        selectedRegion.height
      );
    }

    // Draw highlighted regions
    highlightedRegions.forEach((region, index) => {
      ctx.strokeStyle = "#FF6B6B";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 3]);
      ctx.strokeRect(
        region.x,
        region.y,
        region.width,
        region.height
      );
      ctx.setLineDash([]);
      
      // Draw a label
      ctx.fillStyle = "#FF6B6B";
      ctx.font = "bold 12px sans-serif";
      ctx.fillText(
        `Hotspot ${index + 1}`,
        region.x + 5,
        region.y + 15
      );
    });

    // Add venue landmarks
    ctx.fillStyle = "#7755F8";
    ctx.font = "bold 14px sans-serif";
    ctx.fillText("Main Stage", dimensions.width * 0.15, dimensions.height * 0.05);
    ctx.fillText("Food Court", dimensions.width * 0.7, dimensions.height * 0.7);
    ctx.fillText("Entrance", dimensions.width * 0.5, dimensions.height * 0.95);
    ctx.fillText("Restrooms", dimensions.width * 0.85, dimensions.height * 0.2);

  }, [quadTree, points, selectedRegion, highlightedRegions, dimensions, threshold]);

  // Handle canvas click to select regions
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !quadTree) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Find the node that contains the clicked point
    const findNode = (node: QuadTreeNode): QuadTreeNode | null => {
      if (
        x >= node.x &&
        x < node.x + node.width &&
        y >= node.y &&
        y < node.y + node.height
      ) {
        for (const child of node.children) {
          const foundNode = findNode(child);
          if (foundNode) return foundNode;
        }
        return node;
      }
      return null;
    };

    const clickedNode = findNode(quadTree);
    if (clickedNode && clickedNode.points.length > 0) {
      setSelectedRegion(clickedNode);
      if (onSelectRegion) {
        onSelectRegion(clickedNode);
      }
    }
  };

  // Calculate average density metrics for display
  const getAverageDensity = (): { level: DensityLevel; value: number } => {
    if (!points.length || !dimensions) {
      return { level: "low", value: 0 };
    }
    
    const area = dimensions.width * dimensions.height / 10000; // Convert to 100 sq meters
    const value = points.length / area;
    
    let level: DensityLevel = "low";
    if (value > 2) level = "medium";
    if (value > 4) level = "high";
    if (value > 7) level = "critical";
    
    return { level, value };
  };

  const densityMetric = getAverageDensity();

  return (
    <div className={cn("flex flex-col space-y-4", className)}>
      <div className="relative border rounded-lg overflow-hidden bg-white">
        <canvas
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
          onClick={handleCanvasClick}
          className="cursor-pointer"
        />
        <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm p-2 rounded-md shadow-sm">
          <h3 className="text-sm font-medium">Venue Overview</h3>
          <p className="text-xs text-muted-foreground">{points.length} attendees tracked</p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg p-4 border">
        <h3 className="font-medium mb-2">Overall Venue Density</h3>
        <DensityIndicator 
          level={densityMetric.level} 
          value={densityMetric.value} 
          size="lg"
        />
        
        {highlightedRegions.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="font-medium text-sm">Density Hotspots</h4>
            {highlightedRegions.map((region, index) => {
              const area = region.width * region.height / 10000; // Convert to 100 sq meters
              const density = region.points.length / area;
              let level: DensityLevel = "low";
              if (density > 2) level = "medium";
              if (density > 4) level = "high";
              if (density > 7) level = "critical";
              
              return (
                <div key={`hotspot-${index}`} className="border-b pb-2 last:border-0">
                  <p className="text-sm font-medium">Hotspot {index + 1}</p>
                  <DensityIndicator 
                    level={level} 
                    value={density} 
                    size="md"
                  />
                </div>
              );
            })}
          </div>
        )}
        
        {selectedRegion && (
          <div className="mt-4 p-3 bg-muted rounded-md animate-fade-in">
            <h4 className="font-medium">Selected Region</h4>
            <p className="text-sm">People count: {selectedRegion.points.length}</p>
            <p className="text-sm">
              Density: {(selectedRegion.points.length / (selectedRegion.width * selectedRegion.height / 10000)).toFixed(2)} people/100m²
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VenueMap;
