import React, { useEffect, useRef, useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import DensityIndicator, { DensityLevel } from "@/components/data-visualization/DensityIndicator";
import { useDensityData, DensityPoint } from "@/utils/realtimeData";
import ExportButton from "@/components/ui/export-button";

interface QuadTreeNode {
  x: number;
  y: number;
  width: number;
  height: number;
  points: DensityPoint[];
  children: QuadTreeNode[];
  level: number;
}

interface EnhancedVenueMapProps {
  className?: string;
  dimensions?: { width: number; height: number };
  pointCount?: number;
  threshold?: number;
  refreshInterval?: number;
  onSelectRegion?: (region: QuadTreeNode) => void;
}

// Simplified Quadtree implementation optimized with useMemo
const EnhancedVenueMap: React.FC<EnhancedVenueMapProps> = ({
  className = "",
  dimensions = { width: 600, height: 400 },
  pointCount = 200,
  threshold = 8,
  refreshInterval = 5000,
  onSelectRegion,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { points, isLoading } = useDensityData(pointCount, dimensions, refreshInterval);
  const [selectedRegion, setSelectedRegion] = useState<QuadTreeNode | null>(null);
  const [highlightedRegions, setHighlightedRegions] = useState<QuadTreeNode[]>([]);

  // Memoized quadtree creation to prevent unnecessary recalculations
  const quadTree = useMemo(() => {
    if (!points.length) return null;
    
    const createQuadTree = (
      points: DensityPoint[],
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
        (p) => p.x >= x && p.x < x + width && p.y >= y && p.y < y + height
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
    
    return createQuadTree(
      points,
      0,
      0,
      dimensions.width,
      dimensions.height,
      0,
      threshold
    );
  }, [points, dimensions, threshold]);

  // Find high density regions when quadtree changes
  useEffect(() => {
    if (!quadTree) return;
    
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
    findHighDensityRegions(quadTree, threshold, highDensityRegions);
    
    setHighlightedRegions(
      highDensityRegions.sort(
        (a, b) => 
          (b.points.length / (b.width * b.height)) - 
          (a.points.length / (a.width * a.height))
      ).slice(0, 3)
    );
  }, [quadTree, threshold]);

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
        // Calculate average density for the node
        const avgDensity = node.points.reduce((sum, p) => sum + (p.density || 0), 0) / node.points.length;
        
        // Determine color based on density
        let fillColor = "rgba(76, 195, 138, 0.2)"; // Low density
        
        if (avgDensity > 4) {
          fillColor = "rgba(255, 179, 71, 0.3)"; // Medium density
        }
        
        if (avgDensity > 7) {
          fillColor = "rgba(255, 107, 107, 0.4)"; // High density
        }
        
        if (avgDensity > 10) {
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
    points.forEach((point) => {
      // Determine color based on density
      let pointColor = "#4CC38A"; // Low density
      
      if (point.density > 4) {
        pointColor = "#FFB347"; // Medium density
      }
      
      if (point.density > 7) {
        pointColor = "#FF6B6B"; // High density
      }
      
      if (point.density > 10) {
        pointColor = "#E03131"; // Critical density
      }
      
      ctx.fillStyle = pointColor;
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

  // Handle canvas click to select regions - with ARIA support for accessibility
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
    
    const avgDensity = points.reduce((sum, p) => sum + (p.density || 0), 0) / points.length;
    const area = dimensions.width * dimensions.height / 10000; // Convert to 100 sq meters
    const value = points.length / area;
    
    let level: DensityLevel = "low";
    if (avgDensity > 2) level = "medium";
    if (avgDensity > 4) level = "high";
    if (avgDensity > 7) level = "critical";
    
    return { level, value: avgDensity };
  };

  const densityMetric = getAverageDensity();

  // For screen readers - create an accessible description of the map
  const getAccessibleDescription = () => {
    let description = `Venue map with ${points.length} people tracked. `;
    description += `Overall density is ${densityMetric.level} at ${densityMetric.value.toFixed(1)} people per square meter. `;
    
    if (highlightedRegions.length > 0) {
      description += "Hotspots detected at: ";
      highlightedRegions.forEach((region, index) => {
        const regionDensity = region.points.reduce((sum, p) => sum + (p.density || 0), 0) / region.points.length;
        description += `${index + 1}. ${regionDensity.toFixed(1)} people per square meter. `;
      });
    }
    
    return description;
  };

  return (
    <div className={cn("flex flex-col space-y-4", className)}>
      <div className="relative border rounded-lg overflow-hidden bg-white">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : null}
        
        <canvas
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
          onClick={handleCanvasClick}
          className="cursor-pointer"
          aria-label="Interactive venue map showing crowd density"
          role="img"
          aria-description={getAccessibleDescription()}
          tabIndex={0}
        />
        
        <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm p-2 rounded-md shadow-sm">
          <h3 className="text-sm font-medium">Venue Overview</h3>
          <p className="text-xs text-muted-foreground">{points.length} attendees tracked</p>
        </div>
        
        <div className="absolute bottom-2 right-2">
          <ExportButton
            data={points}
            label="Export Map Data"
            className="text-xs bg-white"
          />
        </div>
      </div>
      
      <div className="bg-white rounded-lg p-4 border">
        <h3 className="font-medium mb-2">Overall Venue Density</h3>
        <DensityIndicator 
          level={densityMetric.level} 
          value={densityMetric.value} 
          size="lg"
        />
        
        <AnimatePresence>
          {highlightedRegions.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-4 space-y-2"
            >
              <h4 className="font-medium text-sm">Density Hotspots</h4>
              {highlightedRegions.map((region, index) => {
                const area = region.width * region.height / 10000; // Convert to 100 sq meters
                const regionDensity = region.points.reduce((sum, p) => sum + (p.density || 0), 0) / region.points.length;
                
                let level: DensityLevel = "low";
                if (regionDensity > 2) level = "medium";
                if (regionDensity > 4) level = "high";
                if (regionDensity > 7) level = "critical";
                
                return (
                  <motion.div 
                    key={`hotspot-${index}`} 
                    className="border-b pb-2 last:border-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <p className="text-sm font-medium">Hotspot {index + 1}</p>
                    <DensityIndicator 
                      level={level} 
                      value={regionDensity} 
                      size="md"
                    />
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
        
        <AnimatePresence>
          {selectedRegion && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-4 p-3 bg-muted rounded-md"
            >
              <h4 className="font-medium">Selected Region</h4>
              <p className="text-sm">People count: {selectedRegion.points.length}</p>
              <p className="text-sm">
                Density: {
                  (selectedRegion.points.reduce((sum, p) => sum + (p.density || 0), 0) / 
                  selectedRegion.points.length).toFixed(1)
                } people/m²
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default EnhancedVenueMap;
